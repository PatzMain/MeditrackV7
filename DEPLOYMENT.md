# Meditrack Deployment Guide

## Vercel Deployment Instructions

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy the Application
```bash
vercel --prod
```

### 4. Set Environment Variables
After deployment, set these environment variables in your Vercel dashboard:

- `SUPABASE_URL`: https://uyxpdvulcttpppoeaelf.supabase.co
- `SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eHBkdnVsY3R0cHBwb2VhZWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDQ0MjUsImV4cCI6MjA3Mzk4MDQyNX0.33507pYC7JJy-Yc23Pv5NbhPZzJbq1Zi6xm1Ksl-2uU
- `SUPABASE_SERVICE_ROLE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eHBkdnVsY3R0cHBwb2VhZWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQwNDQyNSwiZXhwIjoyMDczOTgwNDI1fQ.6KBPrkdmU2igsdGcVuopNvQThHNnEkogqpzcv2EP6-Y
- `JWT_SECRET`: dvKK0KrEoJjrAqd2AOFu+kizZoYBs8NoCD3ng1dQFW3H9rtT6D8lsxV3auGvb4pxI+iKVttcIdjvfwaknYXKzQ==

### 5. Project Configuration
The project is configured to deploy to: **meditrack.vercel.app**

### 6. Architecture
- Frontend: React app served from `/client/build`
- Backend: Serverless API functions in `/api`
- Database: Supabase (already configured)

### 7. URLs after deployment:
- Main App: https://meditrack.vercel.app
- API Endpoint: https://meditrack.vercel.app/api

### 8. Default Login Credentials:
- Admin: `admin` / `admin123`
- Superadmin: `superadmin` / `superadmin123`

## Manual Deployment Steps

1. **Push to GitHub** (already done)
2. **Connect Vercel to GitHub repo**
3. **Set project name to "meditrack"**
4. **Configure environment variables**
5. **Deploy**

The application will be available at https://meditrack.vercel.app