type CsvValue = string | number | boolean | null | undefined;

export type CsvColumn<T> = {
  label: string;
  value: (row: T) => CsvValue;
};

const escapeCell = (value: CsvValue) => {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
};

export function downloadCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]) {
  const csv = [
    columns.map(column => escapeCell(column.label)).join(","),
    ...rows.map(row => columns.map(column => escapeCell(column.value(row))).join(",")),
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
