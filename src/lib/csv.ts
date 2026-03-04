export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(value);
      value = '';
      continue;
    }

    if (char === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
      continue;
    }

    if (char === '\r') {
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

export function toCsv(rows: string[][]): string {
  return rows
    .map((row) => row.map(escapeCell).join(','))
    .join('\n');
}

export function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const [header, ...rest] = rows;

  return rest
    .filter((row) => row.some((cell) => cell.trim() !== ''))
    .map((row) => {
      const result: Record<string, string> = {};
      header.forEach((key, index) => {
        result[key] = row[index] ?? '';
      });
      return result;
    });
}

export function objectsToRows(
  header: string[],
  items: Record<string, string | number | undefined | null>[],
): string[][] {
  const rows: string[][] = [header];

  items.forEach((item) => {
    rows.push(header.map((key) => String(item[key] ?? '')));
  });

  return rows;
}

function escapeCell(value: string): string {
  const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r');
  if (!needsQuotes) return value;
  return `"${value.replace(/"/g, '""')}"`;
}
