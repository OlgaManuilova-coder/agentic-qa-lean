// © 2026 Olga Manuilova — Agentic QA Framework (lean edition). Apache License 2.0: keep this notice and the NOTICE file in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean
// Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, newlines inside quotes).
// Dependency-free on purpose: the suites are data, the linter must run anywhere Node runs.

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (inQuotes) throw new Error('Unterminated quoted field');
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

/** Parse CSV into { header, records } where each record maps header -> value. */
export function parseCsvRecords(text) {
  const [header, ...body] = parseCsv(text);
  if (!header) return { header: [], records: [] };
  const records = body.map((cells, idx) => {
    const rec = { __line: idx + 2, __width: cells.length };
    header.forEach((h, i) => (rec[h] = cells[i] ?? ''));
    return rec;
  });
  return { header, records };
}
