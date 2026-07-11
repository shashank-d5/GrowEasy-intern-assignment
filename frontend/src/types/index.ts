export interface CSVRow {
  [key: string]: string;
}

export interface UploadResponse {
  headers: string[];
  rows: CSVRow[];
  totalRows: number;
}

export interface CRMRecord {
  created_at: string | null;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_country_code: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lead_owner: string | null;
  crm_status: string | null;
  crm_note: string | null;
  data_source: string | null;
  possession_time: string | null;
  description: string | null;
}

export interface ImportResponse {
  records: CRMRecord[];
  imported: number;
  skipped: number;
  errors: string[];
}

export type Step = 'upload' | 'preview' | 'processing' | 'result';
