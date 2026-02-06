
declare var XLSX: any;

import type { Collaborator } from '../types';
import { HEADER_MAPPING } from './spreadsheetParser';

// Define the order of headers and corresponding keys for the export
const HEADERS_ORDER = Object.keys(HEADER_MAPPING);
const KEYS_ORDER = Object.values(HEADER_MAPPING);

export function exportToSpreadsheet(collaborators: Collaborator[], fileName: string = 'colaboradores.xlsx') {
    if (!collaborators || collaborators.length === 0) {
        alert("Não há dados para exportar.");
        return;
    }

    // 1. Create the header row
    const headerRow = HEADERS_ORDER;

    // 2. Create data rows by mapping collaborator data to the correct key order
    const dataRows = collaborators.map(collab => {
        return KEYS_ORDER.map(key => {
            // Ensure we handle potentially undefined values
            const value = collab[key as keyof Collaborator];
            return value !== null && value !== undefined ? value : '';
        });
    });

    // 3. Combine header and data into an array of arrays
    const sheetData = [headerRow, ...dataRows];

    // 4. Create a worksheet from the array of arrays
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // 5. Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Colaboradores');

    // 6. Trigger the file download
    XLSX.writeFile(workbook, fileName);
}
