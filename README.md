# GrowEasy CSV Importer

An AI-powered CSV import tool that extracts CRM lead information from any CSV format. Built for the GrowEasy intern assignment.

The system takes CSV files with any column structure, sends them through Google Gemini AI for intelligent field mapping, and returns structured records matching the GrowEasy CRM schema.

Live demo: https://frontend-three-chi-43.vercel.app

## Features

- Drag and drop or click to upload any CSV file
- Preview raw CSV data in a virtualized table (handles 10,000+ rows)
- AI-powered field mapping using Google Gemini 3.5 Flash (free tier)
- Falls back to Groq Llama 3.3 70B or built-in pattern matcher if Gemini is unavailable
- Batch processing with automatic retry on failure
- Dark mode support
- Responsive design

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, TanStack Table
- **API**: Next.js API routes (serverless)
- **AI**: Google Gemini 3.5 Flash (primary), Groq Llama 3.3 70B (fallback), custom pattern matcher (last resort)
- **Hosting**: Vercel (single deployment)

## Setup

### Prerequisites

- Node.js 18+
- npm

### Running Locally

1. Clone the repository:

```bash
git clone https://github.com/shashank-d5/GrowEasy-intern-assignment.git
cd GrowEasy-intern-assignment/frontend
```

2. Install dependencies and start:

```bash
npm install
npm run dev
```

3. Open http://localhost:3000 in your browser.

The app works without any API key using the built-in pattern matcher. For AI-powered field mapping, set the GEMINI_API_KEY environment variable (get a free key at https://aistudio.google.com/apikey).

## Usage

1. Open https://frontend-three-chi-43.vercel.app in your browser
2. Drag a CSV file onto the upload area or click to browse
3. Review the parsed data in the preview table
4. Click "Confirm and Import" to send the data through AI processing
5. View the extracted CRM records in the results table

The system handles any CSV format. Column names are mapped intelligently by the AI, so headers like "Full Name", "Customer Name", and "Name" all correctly map to the name field.

## Architecture

The entire application runs under a single URL as a Next.js project:

```
src/
  app/
    page.tsx            4-step upload wizard
    api/
      upload/           POST /api/upload - parse CSV files
      import/           POST /api/import - AI field extraction
      health/           GET /api/health - health check
  components/           UI components (UploadZone, CSVPreview, ParsedResult, etc.)
  hooks/                Custom React hooks for upload and import logic
  lib/                  API client
  services/             Business logic (CSV parser, AI integration, batch processing, field mapping)
  prompts/              AI prompt templates
  types/                TypeScript type definitions
```

### Data Flow

1. User uploads a CSV file to /api/upload
2. Server parses the CSV and returns headers and rows
3. User reviews the data in the preview table
4. User confirms the import
5. Server sends rows in batches to the AI service
6. AI maps the fields to the CRM schema (Gemini -> Groq -> pattern matcher fallback chain)
7. Server validates and cleans the results
8. Frontend displays the extracted records

## API Endpoints

### POST /api/upload

Upload a CSV file.

Input: multipart/form-data with a "file" field containing the CSV.

Response:
```json
{
  "headers": ["column1", "column2"],
  "rows": [{ "column1": "value1", "column2": "value2" }],
  "totalRows": 100
}
```

### POST /api/import

Process rows through AI extraction.

Input:
```json
{
  "headers": ["column1", "column2"],
  "rows": [{ "column1": "value1", "column2": "value2" }]
}
```

Response:
```json
{
  "records": [{ "name": "John Doe", "email": "john@example.com", ... }],
  "imported": 95,
  "skipped": 5,
  "errors": ["Row 3: skipped - no email or phone number found"]
}
```

## CRM Schema

The AI extracts these fields:

| Field | Description |
|-------|-------------|
| created_at | Lead creation date |
| name | Lead name |
| email | Primary email |
| country_code | Country code |
| mobile_without_country_code | Mobile number |
| company | Company name |
| city | City |
| state | State |
| country | Country |
| lead_owner | Lead owner |
| crm_status | Lead status (GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE) |
| crm_note | Notes and remarks |
| data_source | Source (leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots) |
| possession_time | Property possession time |
| description | Additional description |

## Position

Applied for: Intern

## Contact

Email: varun@groweasy.ai
