import * as xlsx from 'xlsx';

export interface ParsedExcelRow {
  candidateName: string;
  email: string;
  instituteName: string;
  [key: string]: any;
}

export class ExcelParserService {
  private requiredColumns = ['Candidate Name', 'Email', 'Institute Name'];

  public parseBuffer(buffer: Buffer): ParsedExcelRow[] {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const rawData: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (rawData.length === 0) {
      throw new Error('Excel file is empty.');
    }

    const headers: string[] = rawData[0].map((h: any) => String(h).trim());
    
    // Validate required columns (case insensitive, exact words)
    const missingColumns = this.requiredColumns.filter(reqCol => 
      !headers.some(h => h.toLowerCase() === reqCol.toLowerCase())
    );

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Map headers to row indexes
    const headerMap = new Map<string, number>();
    headers.forEach((header, index) => {
      headerMap.set(header.toLowerCase(), index);
    });

    const rows: ParsedExcelRow[] = [];

    // Parse data rows
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      const getVal = (colName: string) => {
        const idx = headerMap.get(colName.toLowerCase());
        return idx !== undefined && row[idx] !== undefined ? String(row[idx]).trim() : '';
      };

      const candidateName = getVal('Candidate Name');
      const email = getVal('Email');
      const instituteName = getVal('Institute Name');

      if (!candidateName || !email || !instituteName) {
        // Skip completely empty or partially invalid rows
        continue;
      }

      const parsedRow: any = {
        candidateName,
        email,
        instituteName
      };

      // Add other columns dynamically
      headers.forEach(header => {
        const colVal = getVal(header);
        parsedRow[header] = colVal;
      });

      rows.push(parsedRow as ParsedExcelRow);
    }

    return rows;
  }
}

export const excelParserService = new ExcelParserService();
