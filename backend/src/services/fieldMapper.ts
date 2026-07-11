import { ALLOWED_CRM_STATUSES, ALLOWED_DATA_SOURCES } from '../types';

interface MappedField {
  field: string;
  value: string | null;
}

const FIELD_PATTERNS: Record<string, RegExp[]> = {
  name: [/full\s*name/i, /customer\s*name/i, /^name$/i, /contact\s*(name)?/i, /lead\s*name/i, /person\s*name/i, /client\s*name/i, /first\s*name/i, /last\s*name/i],
  email: [/\bemail\b/i, /\be?-?mail\b/i, /\bmail\b/i, /\bemail\s*address\b/i],
  mobile_without_country_code: [/mobile/i, /phone/i, /cell/i, /telephone/i, /contact\s*no/i, /phone\s*number/i, /mobile\s*number/i, /contact\s*number/i, /\bphone\b/i, /\btel\b/i],
  country_code: [/country\s*code/i, /code/i, /dial\s*code/i, /area\s*code/i],
  company: [/company/i, /organization/i, /business/i, /firm/i, /employer/i, /works\s*at/i],
  city: [/\bcity\b/i, /\btown\b/i, /location/i, /district/i],
  state: [/\bstate\b/i, /province/i, /region/i, /territory/i],
  country: [/\bcountry\b/i, /\bnation\b/i],
  lead_owner: [/lead\s*owner/i, /owner/i, /assignee/i, /assigned\s*to/i, /sales\s*rep/i, /account\s*manager/i],
  crm_status: [/status/i, /lead\s*status/i, /stage/i, /crm\s*status/i],
  crm_note: [/note/i, /remark/i, /comment/i, /description/i, /additional/i, /extra/i, /follow.?up/i],
  data_source: [/source/i, /campaign/i, /channel/i, /utm_source/i, /lead\s*source/i, /origin/i],
  created_at: [/created/i, /date/i, /timestamp/i, /time/i, /submitted/i, /entry\s*date/i, /lead\s*date/i],
  possession_time: [/possession/i, /possession\s*time/i, /property\s*time/i, /move.?in/i],
  description: [/description/i, /detail/i, /message/i, /inquiry/i, /requirement/i],
};

function findBestMatch(header: string, patterns: Record<string, RegExp[]>): string | null {
  const lower = header.toLowerCase().trim();
  for (const [field, regexps] of Object.entries(patterns)) {
    for (const regex of regexps) {
      if (regex.test(header) || regex.test(lower)) {
        return field;
      }
    }
  }
  return null;
}

function parsePhone(value: string): { code: string | null; number: string | null } {
  const cleaned = value.replace(/[\s\-\(\)\.]/g, '');
  const match = cleaned.match(/^(\+?\d{1,3})(\d{6,15})$/);
  if (match) {
    return { code: match[1], number: match[2] };
  }
  if (cleaned.startsWith('+')) {
    return { code: null, number: cleaned };
  }
  return { code: null, number: cleaned };
}

function extractEmail(value: string): string | null {
  const match = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

export function mapRecord(headers: string[], row: Record<string, string>): Record<string, string | null> {
  const result: Record<string, string | null> = {
    created_at: null,
    name: null,
    email: null,
    country_code: null,
    mobile_without_country_code: null,
    company: null,
    city: null,
    state: null,
    country: null,
    lead_owner: null,
    crm_status: null,
    crm_note: null,
    data_source: null,
    possession_time: null,
    description: null,
  };

  const fieldMap: Record<string, string> = {};
  const unmatchedHeaders: string[] = [];

  for (const header of headers) {
    const matched = findBestMatch(header, FIELD_PATTERNS);
    if (matched) {
      if (fieldMap[matched]) {
        fieldMap[matched] = fieldMap[matched];
        unmatchedHeaders.push(header);
      } else {
        fieldMap[matched] = header;
      }
    } else {
      unmatchedHeaders.push(header);
    }
  }

  for (const [field, header] of Object.entries(fieldMap)) {
    const value = (row[header] || '').trim();
    if (!value) continue;

    switch (field) {
      case 'email': {
        const emails = value.split(/[,;\n\r|]+/).map(e => e.trim()).filter(Boolean);
        if (emails.length > 0) {
          result.email = extractEmail(emails[0]) || emails[0];
          if (emails.length > 1) {
            const remaining = emails.slice(1).map(e => extractEmail(e) || e).filter(Boolean);
            if (remaining.length > 0) {
              result.crm_note = [result.crm_note, `Extra emails: ${remaining.join(', ')}`].filter(Boolean).join(' | ');
            }
          }
        }
        break;
      }
      case 'mobile_without_country_code': {
        const phones = value.split(/[,;\n\r|/]+/).map(p => p.trim()).filter(Boolean);
        if (phones.length > 0) {
          const { code, number } = parsePhone(phones[0]);
          if (code && !result.country_code) result.country_code = code;
          result.mobile_without_country_code = number || phones[0];
          if (phones.length > 1) {
            const remaining = phones.slice(1);
            result.crm_note = [result.crm_note, `Extra phones: ${remaining.join(', ')}`].filter(Boolean).join(' | ');
          }
        }
        break;
      }
      case 'crm_status': {
        const status = value.replace(/[_\s]/g, '_').toUpperCase();
        if (ALLOWED_CRM_STATUSES.includes(status as any)) {
          result.crm_status = status;
        } else {
          const partial = ALLOWED_CRM_STATUSES.find(s => s.includes(status) || status.includes(s));
          result.crm_status = partial || null;
        }
        break;
      }
      case 'data_source': {
        const src = value.toLowerCase().replace(/[\s-]/g, '_');
        if (ALLOWED_DATA_SOURCES.includes(src as any)) {
          result.data_source = src;
        } else {
          const partial = ALLOWED_DATA_SOURCES.find(s => src.includes(s) || s.includes(src));
          result.data_source = partial || null;
        }
        break;
      }
      case 'created_at': {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          result.created_at = value;
        }
        break;
      }
      case 'crm_note': {
        result.crm_note = [result.crm_note, value].filter(Boolean).join(' | ');
        break;
      }
      default: {
        result[field] = value;
      }
    }
  }

  if (unmatchedHeaders.length > 0) {
    const extra = unmatchedHeaders
      .map(h => `${h}: ${row[h] || ''}`)
      .filter((_, i) => row[unmatchedHeaders[i]]?.trim())
      .join(' | ');
    if (extra) {
      result.crm_note = [result.crm_note, extra].filter(Boolean).join(' | ');
    }
  }

  if (!result.email && !result.mobile_without_country_code) {
    for (const value of Object.values(row)) {
      if (!value) continue;
      const email = extractEmail(value);
      if (email) {
        result.email = email;
        break;
      }
    }
  }

  if (!result.name) {
    for (const header of ['name', 'Name', 'NAME', 'full_name', 'Full_Name', 'customer_name']) {
      if (row[header]?.trim()) {
        result.name = row[header].trim();
        break;
      }
    }
  }

  if (!result.name) {
    const first = row[headers[0]]?.trim();
    if (first && /^[A-Z][a-z]+\s[A-Z][a-z]+$/.test(first)) {
      result.name = first;
    }
  }

  return result;
}
