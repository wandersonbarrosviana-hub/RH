
declare var XLSX: any;

import type { Collaborator } from '../types';

export const HEADER_MAPPING: { [key: string]: keyof Omit<Collaborator, 'id'> } = {
    'DATA': 'data',
    'LOTAÇÃO': 'lotacao',
    'NOME': 'nome',
    'CARGO': 'cargo',
    'ADMISSÃO': 'admissao',
    'NIVER': 'niver',
    'CPF': 'cpf',
    'EMPRESA': 'empresa',
    'CNPJ': 'cnpj',
    'SAL. BASE': 'salarioBase',
    'QUEBRA DE CAIXA': 'quebraDeCaixa',
    'SALARIO BASE C/ QUEBRA': 'salarioBaseComQuebra',
    'ADIANT.': 'adiantamento',
    'SALARIO FAMÍLIA': 'salarioFamilia',
    'DIF CAIXA': 'difCaixa',
    'PLANO DE SAÚDE': 'planoSaude',
    'ODONTO': 'odonto',
    'INSS': 'inss',
    'IRRF': 'irrf',
    'FGTS': 'fgts',
    'VALE': 'vale',
    'PENSÃO': 'pensao',
    'CONSIGNADO': 'consignado',
    '1ª PARCELA 13º': 'primeiraParcela13',
    '2ª PARCELA 13º': 'segundaParcela13',
    'SALÁRIO LÍQUIDO': 'salarioLiquido',
    'FALTA': 'falta',
    'DSR': 'dsr',
    'ATESTADOS': 'atestados',
    'FOLGAS': 'folgas',
    'DIAS': 'diasTrabalhados',
    'VT': 'vt',
    'VA': 'va',
    'BENEFÍCIO': 'beneficio',
    'OBS.': 'observacoes',
    'SEGURO DE VIDA': 'seguroDeVida',
};

export interface ParseResult {
    collaborators: Omit<Collaborator, 'id'>[];
    totalRows: number;
    importedRows: number;
    skippedRows: number;
}

/**
 * Parses a value that can be a Date object, a DD/MM/YYYY string, or an Excel serial number
 * into a standardized 'YYYY-MM-DD' string format.
 * @param value The cell value to parse.
 * @returns A date string in 'YYYY-MM-DD' format or the original value as a string.
 */
function parseDateValue(value: any): string {
    // Case 1: Already a JavaScript Date object (avoids timezone issues).
    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Case 2: It's an Excel serial date number.
    if (typeof value === 'number' && value > 0) {
        const jsDate = XLSX.SSF.parse_date_code(value);
        if (jsDate) {
            const year = jsDate.y;
            const month = String(jsDate.m).padStart(2, '0');
            const day = String(jsDate.d).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }

    // Case 3: It's a string, potentially in DD/MM/YYYY format.
    if (typeof value === 'string') {
        const trimmedValue = value.trim();
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmedValue)) {
            const [day, month, year] = trimmedValue.split('/');
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        return trimmedValue; // Return as is if it's another string format.
    }

    // Fallback for any other type.
    return String(value ?? '').trim();
}


export function parseSpreadsheet(data: ArrayBuffer): ParseResult {
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    
    const targetSheetName = "CONTROLLER 2025";
    const sheetName = workbook.SheetNames.find(name => name.toUpperCase() === targetSheetName.toUpperCase());

    if (!sheetName) {
        throw new Error(`A aba "${targetSheetName}" não foi encontrada na planilha. Por favor, verifique o nome da aba.`);
    }

    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    if (jsonData.length < 2) {
        throw new Error("A planilha deve conter um cabeçalho e pelo menos uma linha de dados.");
    }

    const header = jsonData[0].map(h => String(h).trim().toUpperCase());
    const mappedKeys = header.map(h => HEADER_MAPPING[h]);

    if (mappedKeys.some(key => !key)) {
        const unknownHeaders = header.filter((h, i) => !mappedKeys[i]);
        console.warn("Alguns cabeçalhos da planilha não correspondem ao formato esperado e serão ignorados:", unknownHeaders);
    }
    
    const DATE_KEYS: (keyof Omit<Collaborator, 'id'>)[] = ['data', 'admissao', 'niver'];
    const collaborators: Omit<Collaborator, 'id'>[] = [];
    const dataRows = jsonData.slice(1);
    let skippedForMissingData = 0;

    for (const row of dataRows) {
        // Skip rows that are completely empty
        if (row.every(cell => cell === null || cell === undefined || cell === "")) {
            continue;
        }

        const collaborator: any = {};
        for (let j = 0; j < mappedKeys.length; j++) {
            const key = mappedKeys[j];
            if (key) {
                const cellValue = row[j];
                
                if (DATE_KEYS.includes(key)) {
                    collaborator[key] = parseDateValue(cellValue);
                } else if (key === 'adiantamento' || key === 'salarioLiquido') {
                     collaborator[key] = Number(cellValue) || 0;
                } else {
                    collaborator[key] = String(cellValue ?? '').trim();
                }
            }
        }
        
        // More precise validation: A row is valid if it contains a CPF.
        // The CPF is the critical unique identifier for a financial record.
        if (collaborator.cpf) {
             collaborators.push(collaborator);
        } else {
            skippedForMissingData++;
        }
    }

    const totalProcessedRows = dataRows.filter(row => !row.every(cell => cell === null || cell === undefined || cell === "")).length;

    return {
        collaborators,
        totalRows: totalProcessedRows,
        importedRows: collaborators.length,
        skippedRows: skippedForMissingData
    };
}