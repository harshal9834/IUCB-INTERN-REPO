import * as xlsx from 'xlsx';

export interface ParsedExcelRow {
  candidateName: string;
  email: string;
  instituteName: string;
  [key: string]: any;
}

// ─── Debug helpers ──────────────────────────────────────────────────────────

function debugLog(label: string, value: unknown): void {
  console.log(`[ExcelParser] ${label}:`, JSON.stringify(value, null, 2));
}

// ─── Header normalisation ────────────────────────────────────────────────────
//
// Rules applied to each individual cell value:
//   1. Convert to string
//   2. Strip BOM (\uFEFF) and zero-width chars
//   3. Replace non-breaking space (\u00A0) with regular space
//   4. If the cell contains newlines (word-wrapped header), take only the first
//      non-empty line — prevents "Email\nInstitute Name" → "Email Institute Name"
//   5. Replace tabs with spaces
//   6. Collapse multiple consecutive spaces into one
//   7. Trim leading/trailing whitespace
//   8. Lower-case for comparison
//
function normaliseHeader(raw: any): string {
  const str = String(raw ?? '')
    .replace(/\uFEFF/g, '')               // BOM
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')  // zero-width chars
    .replace(/\u00A0/g, ' ');             // non-breaking space → regular space

  // If the value contains a newline, it means either:
  //   a) Two header names were accidentally typed into one cell with Alt+Enter
  //   b) The cell has a word-wrapped display name
  // In both cases we want ONLY the first non-empty line.
  const firstLine = str.split(/\r?\n/).map(s => s.trim()).find(s => s.length > 0) ?? str;

  return firstLine
    .replace(/\t/g, ' ')     // tabs → space
    .replace(/\s+/g, ' ')    // collapse runs of spaces
    .trim()
    .toLowerCase();
}

// Alias variants that should map to the canonical required column names.
// Keys are normalised (lower-case, trimmed). Values are the canonical display names.
const COLUMN_ALIASES: Record<string, string> = {
  'candidate name':   'Candidate Name',
  'candidatename':    'Candidate Name',
  'candidate_name':   'Candidate Name',
  'name':             'Candidate Name',
  'full name':        'Candidate Name',
  'fullname':         'Candidate Name',

  'email':            'Email',
  'email address':    'Email',
  'emailaddress':     'Email',
  'e-mail':           'Email',
  'mail':             'Email',

  'institute name':   'Institute Name',
  'institutename':    'Institute Name',
  'institute_name':   'Institute Name',
  'institute':        'Institute Name',
  'institution':      'Institute Name',
  'college':          'Institute Name',
  'college name':     'Institute Name',
  'organization':     'Institute Name',
  'organisation':     'Institute Name',

  'timestamp':        'Timestamp',
  'date':             'Timestamp',
  'date time':        'Timestamp',
  'datetime':         'Timestamp',
  'date/time':        'Timestamp',
  'submitted at':     'Timestamp',
  'submitted':        'Timestamp',
  'created at':       'Timestamp',
};

/** Return canonical name if an alias matches, otherwise return the original trimmed display name. */
function resolveColumnName(rawDisplay: string): string {
  const norm = normaliseHeader(rawDisplay);
  return COLUMN_ALIASES[norm] ?? rawDisplay.trim();
}

// ─── Parser ──────────────────────────────────────────────────────────────────

export class ExcelParserService {
  private requiredColumns = ['Candidate Name', 'Email', 'Institute Name'];

  public parseBuffer(buffer: Buffer): ParsedExcelRow[] {
    // ── Step 1: Load workbook ────────────────────────────────────────────────
    const workbook = xlsx.read(buffer, {
      type:      'buffer',
      cellText:  false,   // use raw typed values, not formatted strings
      cellDates: true,    // dates as JS Date objects
      dense:     false,   // sparse sheet object (default)
    });

    debugLog('Workbook sheet names', workbook.SheetNames);

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) throw new Error('Excel file has no sheets.');
    debugLog('Selected sheet', firstSheetName);

    const worksheet = workbook.Sheets[firstSheetName];
    debugLog('Worksheet range', worksheet['!ref'] ?? 'undefined');

    // ── Step 2: Convert to array-of-arrays ───────────────────────────────────
    // We use header:1 so every row comes back as a plain array.
    // defval:'' ensures missing/empty cells are '' instead of undefined.
    const rawData: any[][] = xlsx.utils.sheet_to_json(worksheet, {
      header:    1,
      defval:    '',
      blankrows: false,
      rawNumbers: false,   // keep numbers as numbers (not formatted strings)
    });

    debugLog('Total rows (including header)', rawData.length);

    if (rawData.length === 0) throw new Error('Excel file is empty.');

    // ── Step 3: Find the header row ──────────────────────────────────────────
    // The header row is the first row that has at least one non-empty cell.
    let headerRowIndex = -1;
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row && row.some((cell) => String(cell ?? '').trim() !== '')) {
        headerRowIndex = i;
        break;
      }
    }
    if (headerRowIndex === -1) throw new Error('Excel file contains no usable header row.');

    const rawHeaderCells: any[] = rawData[headerRowIndex];
    debugLog('Raw header row (before any processing)', rawHeaderCells);

    // ── Step 4: Process each header cell individually ─────────────────────────
    // CRITICAL: we process each cell independently — never join adjacent cells.
    // resolveColumnName handles aliases (e.g. "Institute" → "Institute Name").
    const headers: string[] = rawHeaderCells.map((cell) => {
      // Each cell is processed in isolation.
      const raw = String(cell ?? '');

      // Split on newline FIRST to handle Alt+Enter multi-line cells.
      // We take only the first non-empty line.
      const firstLine = raw
        .split(/\r?\n/)
        .map(s =>
          s
            .replace(/\uFEFF/g, '')
            .replace(/[\u200B-\u200D\u2060]/g, '')
            .replace(/\u00A0/g, ' ')
            .replace(/\t/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        )
        .find(s => s.length > 0) ?? '';

      return resolveColumnName(firstLine);
    });

    debugLog('Processed headers (after alias resolution)', headers);

    // Normalised versions for comparison
    const headersNorm: string[] = headers.map(normaliseHeader);
    debugLog('Normalised headers for matching', headersNorm);

    // ── Step 5: Validate required columns ────────────────────────────────────
    const missingColumns = this.requiredColumns.filter(
      (req) => !headersNorm.includes(normaliseHeader(req)),
    );

    if (missingColumns.length > 0) {
      throw new Error(
        `Missing required columns: ${missingColumns.join(', ')}. ` +
        `Found columns: ${headers.filter(Boolean).join(', ')}`,
      );
    }

    // ── Step 6: Build column-index map ───────────────────────────────────────
    // Map: normalised column name → zero-based column index
    const headerMap = new Map<string, number>();
    headersNorm.forEach((h, idx) => {
      if (h) headerMap.set(h, idx);
    });
    debugLog('Header index map', Object.fromEntries(headerMap));

    // ── Step 7: Parse data rows ───────────────────────────────────────────────
    const rows: ParsedExcelRow[] = [];
    const skipped: string[] = [];

    const getVal = (row: any[], colName: string): string => {
      const idx = headerMap.get(normaliseHeader(colName));
      if (idx === undefined || idx >= row.length) return '';
      const cell = row[idx];
      if (cell === null || cell === undefined || cell === '') return '';
      if (cell instanceof Date) {
        return cell.toLocaleDateString('en-IN', {
          day:   '2-digit',
          month: '2-digit',
          year:  'numeric',
        });
      }
      return String(cell).trim();
    };

    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      const allEmpty = row.every((cell) => String(cell ?? '').trim() === '');
      if (allEmpty) continue;

      const candidateName = getVal(row, 'Candidate Name');
      const email         = getVal(row, 'Email');
      const instituteName = getVal(row, 'Institute Name');

      // Skip rows where all three required fields are empty
      if (!candidateName && !email && !instituteName) continue;

      // Validate email
      if (!email || !email.includes('@')) {
        skipped.push(`Row ${i + 1}: invalid/missing email "${email}" (candidate: "${candidateName}")`);
        continue;
      }

      const parsedRow: ParsedExcelRow = { candidateName, email, instituteName };

      // Attach ALL columns as dynamic placeholders
      headers.forEach((header) => {
        if (!header) return;
        parsedRow[header] = getVal(row, header);
      });

      rows.push(parsedRow);
    }

    if (skipped.length > 0) {
      debugLog('Skipped rows (invalid/missing email)', skipped);
    }

    debugLog('Total valid rows parsed', rows.length);
    if (rows.length > 0) {
      debugLog('First parsed row', rows[0]);
    }

    if (rows.length === 0) {
      throw new Error(
        'No valid data rows found. ' +
        `Rows skipped: ${skipped.length}. ` +
        'Ensure rows have Candidate Name, Email, and Institute Name filled in.',
      );
    }

    return rows;
  }
}

export const excelParserService = new ExcelParserService();
