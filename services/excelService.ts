
import * as XLSX from 'xlsx';

export const ExcelService = {
  /**
   * Generates and downloads an Excel template file.
   * @param headers Array of string headers for the first row.
   * @param exampleRow Array of example data for the second row.
   * @param fileName Name of the file to download (e.g., 'template.xlsx').
   * @param sheetName Name of the worksheet.
   */
  downloadTemplate: (headers: string[], exampleRow: any[], fileName: string, sheetName: string = 'Template') => {
    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    
    // Auto-adjust column width based on header length + padding
    ws['!cols'] = headers.map(h => ({ wch: h.length + 5 }));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
  },

  /**
   * Reads an Excel file and returns the data as an array of JSON objects.
   * @param file The File object selected by the user.
   * @returns Promise resolving to an array of generic type T.
   */
  readExcel: async <T>(file: File): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
          
          // Assume data is in the first sheet
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json<T>(sheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      
      // Read as binary string for compatibility
      reader.readAsBinaryString(file);
    });
  }
};
