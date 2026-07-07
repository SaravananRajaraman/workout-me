const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const SHEETS_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

async function apiFetch<T>(url: string, accessToken: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Google API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function findSpreadsheet(accessToken: string, title: string): Promise<string | null> {
  const q = encodeURIComponent(
    `mimeType='application/vnd.google-apps.spreadsheet' and name='${title}' and trashed=false`,
  );
  const data = await apiFetch<{ files: { id: string }[] }>(
    `${DRIVE_FILES_URL}?q=${q}&spaces=drive&fields=files(id,name)`,
    accessToken,
  );
  return data.files?.[0]?.id ?? null;
}

export async function createSpreadsheet(
  accessToken: string,
  title: string,
  sheetTitles: string[],
): Promise<string> {
  const data = await apiFetch<{ spreadsheetId: string }>(SHEETS_URL, accessToken, {
    method: 'POST',
    body: JSON.stringify({
      properties: { title },
      sheets: sheetTitles.map((t) => ({ properties: { title: t } })),
    }),
  });
  return data.spreadsheetId;
}

export async function renameFile(accessToken: string, fileId: string, name: string): Promise<void> {
  await apiFetch(`${DRIVE_FILES_URL}/${fileId}`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function getValues(
  accessToken: string,
  spreadsheetId: string,
  range: string,
): Promise<string[][]> {
  const data = await apiFetch<{ values?: string[][] }>(
    `${SHEETS_URL}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    accessToken,
  );
  return data.values ?? [];
}

export async function updateValues(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: unknown[][],
): Promise<void> {
  await apiFetch(
    `${SHEETS_URL}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    accessToken,
    { method: 'PUT', body: JSON.stringify({ range, values }) },
  );
}

export async function appendValues(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: unknown[][],
): Promise<void> {
  await apiFetch(
    `${SHEETS_URL}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    accessToken,
    { method: 'POST', body: JSON.stringify({ range, values }) },
  );
}
