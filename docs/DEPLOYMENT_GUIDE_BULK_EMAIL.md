# IUCB Bulk Email Campaign System - Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### ✅ System Requirements
- Node.js 18+ 
- PostgreSQL 14+
- SMTP Server Access (Gmail, SendGrid, etc.)
- 10GB+ disk space for file uploads
- 4GB+ RAM for large campaigns

### ✅ Environment Configuration

Create/Update your `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/iucb_db"

# JWT
JWT_SECRET="your_super_secret_jwt_key_change_in_production"
JWT_EXPIRE="7d"

# Email Configuration (Required for bulk campaigns)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com  
SMTP_PASS=your-app-password     # Use App Password for Gmail
MAIL_FROM="IUCB Platform <noreply@iucb.org>"

# Bulk Email Settings
BULK_EMAIL_BATCH_SIZE=10        # Emails per batch (1-100)
BULK_EMAIL_BATCH_DELAY=2000     # Delay between batches (ms)
BULK_EMAIL_MAX_RETRIES=3        # Retry attempts for failed emails

# File Upload Settings
MAX_FILE_SIZE=10485760          # 10MB in bytes
UPLOAD_DIR=./uploads/campaigns

# Application
PORT=3001
NODE_ENV=production
```

### ✅ Gmail SMTP Setup (Recommended)

1. **Enable 2-Factor Authentication** in your Google Account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

3. **Verify Configuration**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

---

## 🛠 Installation Steps

### 1. Database Setup

```bash
# Run migrations
cd backend
npm run prisma:migrate

# Verify database
npx prisma studio  # Optional: Check tables in browser
```

### 2. Dependencies Installation

```bash
# Backend dependencies (already installed)
cd backend
npm install

# Frontend dependencies  
cd ../frontend
npm install
```

### 3. Build Applications

```bash
# Build backend
cd backend
npm run build

# Build frontend (if deploying static)
cd ../frontend
npm run build
```

### 4. Directory Structure Setup

```bash
# Create required directories
mkdir -p backend/uploads/campaigns
mkdir -p backend/storage/reports
mkdir -p backend/logs

# Set permissions (Linux/Mac)
chmod 755 backend/uploads/campaigns
chmod 755 backend/storage/reports
chmod 755 backend/logs
```

---

## 🧪 Pre-Production Testing

### 1. System Validation

```bash
cd backend
node test-bulk-email.cjs
```

Expected output:
```
✅ IUCB Bulk Email Campaign System is READY FOR PRODUCTION!
```

### 2. Email Testing

Create a small test CSV file (`test-institutes.csv`):
```csv
Institute Name,Contact Person,Email,Phone,City,State,Country
Test Institute,John Doe,john@example.com,+1-555-0123,New York,NY,USA
Sample Training,Jane Smith,jane@example.com,+1-555-0456,Los Angeles,CA,USA
```

### 3. API Testing

Start the server and test endpoints:

```bash
# Start backend
npm run dev

# Test API (in another terminal)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/api/v1/training-institutes/bulk-mail/template/download
```

---

## 🚀 Production Deployment

### Option 1: PM2 Deployment (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start dist/server.js --name "iucb-backend"

# Start frontend (if serving with Node)
cd ../frontend  
pm2 start "npm run preview" --name "iucb-frontend"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 2: Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/storage:/app/storage
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: iucb_db
      POSTGRES_USER: iucb_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Deploy with:
```bash
docker-compose up -d
```

### Option 3: Manual Process Management

```bash
# Start backend
cd backend
nohup npm start > logs/backend.log 2>&1 &

# Start frontend (if needed)
cd ../frontend
nohup npm run preview > logs/frontend.log 2>&1 &
```

---

## 🔧 Configuration Management

### Email Rate Limiting

Adjust batch settings based on your SMTP provider:

**Gmail (Free Account)**:
```env
BULK_EMAIL_BATCH_SIZE=5
BULK_EMAIL_BATCH_DELAY=5000
```

**Gmail (Workspace)**:
```env
BULK_EMAIL_BATCH_SIZE=10
BULK_EMAIL_BATCH_DELAY=2000
```

**SendGrid/AWS SES**:
```env
BULK_EMAIL_BATCH_SIZE=50
BULK_EMAIL_BATCH_DELAY=1000
```

### Performance Tuning

For large campaigns (1000+ recipients):

```env
# Increase batch size
BULK_EMAIL_BATCH_SIZE=25
BULK_EMAIL_BATCH_DELAY=1500

# Database connection pool
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=30000
```

---

## 📊 Monitoring & Maintenance

### Log Monitoring

```bash
# Backend logs
tail -f backend/logs/app.log

# PM2 logs  
pm2 logs iucb-backend

# Campaign-specific logs
tail -f backend/logs/campaigns.log
```

### Database Maintenance

```bash
# Weekly database cleanup
psql iucb_db -c "DELETE FROM \"TrainingInstituteCampaignLogs\" WHERE \"createdAt\" < NOW() - INTERVAL '30 days';"

# Monitor database size
psql iucb_db -c "SELECT pg_size_pretty(pg_database_size('iucb_db'));"
```

### File System Cleanup

```bash
# Clean old uploaded files (monthly)
find backend/uploads/campaigns -type f -mtime +30 -delete

# Clean old reports
find backend/storage/reports -type f -mtime +7 -delete
```

---

## 🛡 Security Checklist

### ✅ Pre-Production Security

- [ ] JWT secret is strong and unique
- [ ] Database credentials are secure
- [ ] SMTP credentials use app passwords
- [ ] File upload directory permissions are restricted
- [ ] HTTPS is enabled in production
- [ ] Rate limiting is configured
- [ ] Input validation is enabled
- [ ] CORS is properly configured

### ✅ Ongoing Security

- [ ] Regular dependency updates
- [ ] Monitor failed login attempts
- [ ] Review email campaign logs
- [ ] Monitor file upload sizes
- [ ] Regular database backups
- [ ] SSL certificate renewal

---

## 🚨 Troubleshooting Guide

### Email Sending Issues

**Problem**: Emails not sending
```bash
# Check SMTP configuration
node -e "console.log(process.env.SMTP_HOST, process.env.SMTP_USER)"

# Test SMTP connection manually
npm install nodemailer-smtp-check
node -e "
const smtp = require('nodemailer-smtp-check');
smtp({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
}).then(console.log).catch(console.error);
"
```

**Solution**: Verify SMTP credentials and Gmail app password

### File Upload Issues

**Problem**: Large files failing to upload
```bash
# Check file size limits
grep -r "MAX_FILE_SIZE" backend/
```

**Solution**: Increase limits in environment variables and nginx (if used)

### Database Connection Issues

**Problem**: Database connection errors
```bash
# Test database connection
npx prisma db push --accept-data-loss
```

**Solution**: Verify DATABASE_URL and PostgreSQL service status

### Memory Issues

**Problem**: Server running out of memory during large campaigns
```bash
# Monitor memory usage
ps aux | grep node
free -h
```

**Solution**: 
- Reduce batch size
- Add swap memory
- Upgrade server RAM
- Implement campaign queuing

---

## 📈 Performance Optimization

### Database Optimization

```sql
-- Add indexes for better query performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_status_created 
ON "TrainingInstituteCampaigns" ("status", "createdAt");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipient_campaign_status 
ON "TrainingInstituteCampaignRecipients" ("campaignId", "status");

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM "TrainingInstituteCampaigns" 
WHERE "status" = 'PROCESSING';
```

### Application Optimization

```javascript
// Enable response compression (add to app.ts)
import compression from 'compression';
app.use(compression());

// Enable response caching for static content
app.use('/api/v1/training-institutes/bulk-mail/template', 
  express.static('templates', { maxAge: '1d' }));
```

---

## 🔄 Backup Strategy

### Database Backup

```bash
# Daily database backup
pg_dump iucb_db > backups/iucb_db_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/iucb"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump iucb_db | gzip > "$BACKUP_DIR/iucb_db_$DATE.sql.gz"
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
```

### File Backup

```bash
# Backup uploaded files and reports
tar -czf backups/files_$(date +%Y%m%d).tar.gz \
    backend/uploads/ \
    backend/storage/
```

---

## 📞 Support & Maintenance

### Health Check Endpoint

The system includes a health check endpoint:
```
GET /api/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "smtp": "configured",
    "storage": "available"
  }
}
```

### Maintenance Mode

To enable maintenance mode:
```javascript
// Add to app.ts
app.use('/api/v1/training-institutes/bulk-mail', (req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.status(503).json({
      success: false,
      message: 'System is under maintenance. Please try again later.'
    });
  }
  next();
});
```

---

## 🎯 Success Metrics

### Key Performance Indicators

Monitor these metrics in production:

- **Email Delivery Rate**: >95% success rate
- **Campaign Processing Time**: <2 minutes per 100 recipients  
- **System Uptime**: >99.5%
- **File Upload Success**: >98%
- **Database Query Performance**: <100ms average
- **Memory Usage**: <80% of available RAM
- **Disk Usage**: <70% of available storage

### Monitoring Dashboard

Consider implementing monitoring with:
- **Grafana**: For metrics visualization
- **Prometheus**: For metrics collection
- **AlertManager**: For automated alerts
- **New Relic/DataDog**: For APM monitoring

---

## 🏆 Conclusion

The IUCB Bulk Email Campaign System is now ready for production deployment. Follow this guide carefully to ensure a smooth deployment and optimal performance.

For technical support, refer to:
- **API Documentation**: `backend/API_DOCUMENTATION_BULK_EMAIL.md`
- **System Architecture**: `BULK_EMAIL_SYSTEM_COMPLETE.md`
- **Test Results**: Run `backend/test-bulk-email.cjs`

**🚀 The system is production-ready and fully operational!**