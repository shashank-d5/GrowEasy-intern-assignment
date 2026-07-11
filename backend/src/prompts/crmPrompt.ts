import { CRMRecord } from '../types';

export function buildPrompt(headers: string[], records: Record<string, string>[]): string {
  return `You are a CRM data extraction system. Map CSV record fields to the GrowEasy CRM format.

TARGET FIELDS:
- created_at: date string parsable by JavaScript new Date()
- name: lead full name
- email: primary email address
- country_code: country code like +91
- mobile_without_country_code: phone number without country code
- company: company name
- city: city name
- state: state name
- country: country name
- lead_owner: lead owner email or name
- crm_status: one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE
- crm_note: notes, remarks, extra contact info
- data_source: one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots
- possession_time: property possession time
- description: additional description

RULES:
1. crm_status must be one of the allowed values. Leave blank if none match.
2. data_source must be one of the allowed values. Leave blank if unsure.
3. created_at must be a valid date string that JavaScript can parse.
4. If multiple emails exist, use the first as email and put the rest in crm_note.
5. If multiple phone numbers exist, use the first as mobile and put the rest in crm_note.
6. Extract country code from phone numbers when possible.
7. If a record has neither email nor phone, skip it entirely (return null for that record).
8. Map fields intelligently by column name meaning, not exact match. For example "Full Name", "Customer", "Contact Name" all map to "name".
9. Use crm_note for any extra information that does not fit other fields.
10. If the CSV seems to not be lead data, still try to extract whatever fields match.

CSV HEADERS: ${JSON.stringify(headers)}

RECORDS: ${JSON.stringify(records)}

Return a JSON array. Each element corresponds to a record in the same order. Use null for records that must be skipped (no email and no phone). For valid records, use null for fields you cannot determine. Return ONLY the JSON array, no other text.`;
}

export function buildCsvHeader(): string {
  return [
    'created_at',
    'name',
    'email',
    'country_code',
    'mobile_without_country_code',
    'company',
    'city',
    'state',
    'country',
    'lead_owner',
    'crm_status',
    'crm_note',
    'data_source',
    'possession_time',
    'description',
  ].join(',');
}

export function recordToCsvRow(record: CRMRecord): string {
  return [
    record.created_at || '',
    record.name || '',
    record.email || '',
    record.country_code || '',
    record.mobile_without_country_code || '',
    record.company || '',
    record.city || '',
    record.state || '',
    record.country || '',
    record.lead_owner || '',
    record.crm_status || '',
    (record.crm_note || '').replace(/"/g, '""'),
    record.data_source || '',
    record.possession_time || '',
    (record.description || '').replace(/"/g, '""'),
  ]
    .map((v) => (v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v}"` : v))
    .join(',');
}
