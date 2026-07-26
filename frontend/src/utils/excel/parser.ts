import * as XLSX from 'xlsx';

export function parseExcelFile(fileBuffer: ArrayBuffer): any[] {
  // Read the file as an array buffer
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  
  // Get the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert sheet to JSON
  // defval: '' ensures empty cells are included as empty strings instead of missing keys
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  return jsonData;
}
