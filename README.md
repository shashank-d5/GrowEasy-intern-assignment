# GrowEasy CSV Importer

An AI-powered CSV import tool that extracts CRM lead information from any CSV format. Built for the GrowEasy intern assignment.

The system takes CSV files with any column structure, sends them through Google Gemini AI for intelligent field mapping, and returns structured records matching the GrowEasy CRM schema.

## Features

- Drag and drop or click to upload any CSV file
- Preview raw CSV data in a virtualized table (handles 10,000+ rows)
- AI-powered field mapping using Google Gemini (free tier)
- Batch processing with automatic retry on failure
- Dark mode support
- Responsive design

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, TanStack Table
- **Backend**: Express, TypeScript, Google Gemini API
- **Deployment**: Vercel (frontend), Render (backend)

## Setup

### Prerequisites

- Node.js 18+
- npm
- A Gemini API key (free, no credit card required)

### Getting a Gemini API Key

1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key" and copy the key
4. This is completely free and does not require a credit card

### Running Locally

1. Clone the repository:

```bash
git clone https://github.com/shashank-d5/GrowEasy-intern-assignment.git
cd GrowEasy-intern-assignment
```

2. Set up the backend:

```bash
cd backend
cp ../.env.example .env
# Edit .env and add your Gemini API key
npm install
npm run dev
```

The backend starts on http://localhost:3001.

3. Set up the frontend (in a new terminal):

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on http://localhost:3000.

### Running with Docker

```bash
# Set your API key
export GEMINI_API_KEY=your_key_here

# Start both services
docker compose up
```

## Usage

1. Open http://localhost:3000 in your browser
2. Drag a CSV file onto the upload area or click to browse
3. Review the parsed data in the preview table
4. Click "Confirm and Import" to send the data through AI processing
5. View the extracted CRM records in the results table

The system handles any CSV format. Column names are mapped intelligently by the AI, so headers like "Full Name", "Customer Name", and "Name" all correctly map to the name field.

## Architecture

```
frontend/        Next.js 14 app with 4-step upload wizard
  src/
    components/  UI components (UploadZone, CSVPreview, ParsedResult, etc.)
    hooks/       Custom React hooks for upload and import logic
    lib/         API client
    types/       TypeScript type definitions

backend/         Express API server
  src/
    routes/      API route definitions (upload, import)
    controllers/ Request handlers
    services/    Business logic (CSV parsing, AI integration, batch processing)
    prompts/     Gemini prompt templates
    middleware/   Error handling and rate limiting
    types/       TypeScript type definitions
```

### Data Flow

1. User uploads a CSV file
2. Backend parses the CSV and returns headers and rows
3. User reviews the data in the preview table
4. User confirms the import
5. Backend sends rows in batches to Gemini AI
6. AI maps the fields to the CRM schema
7. Backend validates and cleans the results
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
