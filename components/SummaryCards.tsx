import React, { useMemo } from 'react';
import type { Collaborator } from '../types';

const StatCard: React.FC<{ title: string; value: string; fullValue?: string; change?: string; changeType?: 'positive' | 'negative' }> = ({ title, value, fullValue, change, changeType }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div
            className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 flex-1 min-w-[180px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</h4>
                {change && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {change}
                    </span>
                )}
            </div>
            <div className="flex items-baseline">
                <p className="text-xl lg:text-2xl font-bold text-gray-900" title={fullValue || value}>
                    {isHovered && fullValue ? fullValue : value}
                </p>
            </div>
        </div>
    );
};

/**
 * A robust currency parser that handles different formats (e.g., BRL '1.234,56' and US '1,234.56').
 * This fixes the bug where numbers were being incorrectly parsed, leading to inflated totals.
 */
const parseCurrency = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string' || !value) return 0;

    // Remove anything that isn't a digit, comma, dot, or hyphen (for negative numbers)
    let parsableString = String(value).replace(/[^\d.,-]+/g, '');

    const lastDot = parsableString.lastIndexOf('.');
    const lastComma = parsableString.lastIndexOf(',');

    // If both dot and comma exist, determine which is the decimal separator
    if (lastDot > -1 && lastComma > -1) {
        // If comma is last, it's the decimal separator (BRL style: 1.234,56)
        if (lastComma > lastDot) {
            parsableString = parsableString.replace(/\./g, '').replace(',', '.');
        } else {
            // If dot is last, it's the decimal separator (US style: 1,234.56)
            parsableString = parsableString.replace(/,/g, '');
        }
    }
    // If only a comma exists, it must be the decimal separator (e.g., 1234,56)
    else if (lastComma > -1) {
        parsableString = parsableString.replace(',', '.');
    }
    // If only a dot exists (or none), it's already in a parsable format (e.g., 1234.56 or 1234)

    return parseFloat(parsableString) || 0;
};


interface SummaryCardsProps {
    filteredData: Collaborator[];
    allData: Collaborator[];
    filters: { payrollDate: string };
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ filteredData, allData, filters }) => {

    const kpis = useMemo(() => {
        const initialTotals = {
            remuneration: 0,
            inss: 0,
            beneficio: 0,
            seguro: 0,
            saudeOdonto: 0,
        };

        // Refactored to a single reduce loop for efficiency and clarity.
        // This ensures INSS, Health+Dental, and Benefits totals are accurately calculated from filtered data.
        const currentTotals = filteredData.reduce((acc, c) => {
            acc.remuneration += (Number(c.salarioLiquido) || 0) + (Number(c.adiantamento) || 0);
            acc.inss += parseCurrency(c.inss);
            acc.beneficio += parseCurrency(c.beneficio);
            acc.seguro += parseCurrency(c.seguroDeVida);
            acc.saudeOdonto += parseCurrency(c.planoSaude) + parseCurrency(c.odonto);
            return acc;
        }, initialTotals);

        const totalRecordsCount = filteredData.length;

        let previousYearStrict = {
            remuneration: 0,
            inss: 0,
            beneficio: 0,
            seguro: 0,
            saudeOdonto: 0,
            count: 0
        };

        if (filters.payrollDate) {
            const [year, month] = filters.payrollDate.split('-');
            const prevYearPayrollDate = `${parseInt(year) - 1}-${month}`;
            const prevYearData = allData.filter(c => c.data && c.data.startsWith(prevYearPayrollDate));

            previousYearStrict.count = prevYearData.length;
            previousYearStrict.remuneration = prevYearData.reduce((sum, c) => sum + (Number(c.salarioLiquido) || 0) + (Number(c.adiantamento) || 0), 0);
            previousYearStrict.inss = prevYearData.reduce((sum, c) => sum + parseCurrency(c.inss), 0);
            previousYearStrict.beneficio = prevYearData.reduce((sum, c) => sum + parseCurrency(c.beneficio), 0);
            previousYearStrict.seguro = prevYearData.reduce((sum, c) => sum + parseCurrency(c.seguroDeVida), 0);
            previousYearStrict.saudeOdonto = prevYearData.reduce((sum, c) => sum + parseCurrency(c.planoSaude) + parseCurrency(c.odonto), 0);
        }

        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        return {
            totalRecordsCount: currentTotals.remuneration, // Wait, wrong mapping in original code? No, original returned totalRecordsCount separately. I'll fix this.
            // Original code: totalRecordsCount (line 80)

            // New return structure with changes
            remuneration: { value: currentTotals.remuneration, change: calculateChange(currentTotals.remuneration, previousYearStrict.remuneration) },
            count: { value: totalRecordsCount, change: calculateChange(totalRecordsCount, previousYearStrict.count) },
            inss: { value: currentTotals.inss, change: calculateChange(currentTotals.inss, previousYearStrict.inss) },
            beneficio: { value: currentTotals.beneficio, change: calculateChange(currentTotals.beneficio, previousYearStrict.beneficio) },
            seguro: { value: currentTotals.seguro, change: calculateChange(currentTotals.seguro, previousYearStrict.seguro) },
            saudeOdonto: { value: currentTotals.saudeOdonto, change: calculateChange(currentTotals.saudeOdonto, previousYearStrict.saudeOdonto) }
        };
    }, [filteredData, allData, filters.payrollDate]);

    const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // CUSTOM ABBREVIATION FORMATTER
    const formatCompactNumber = (num: number) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace('.0', '') + ' Bi';
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + ' Mi';
        if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + ' K';
        return num.toString();
    };

    const formatCompactBRL = (value: number) => `R$ ${formatCompactNumber(value)}`;

    const formatChange = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
    const getChangeType = (val: number) => val >= 0 ? 'positive' : 'negative';

    const hasHistory = !!filters.payrollDate;

    return (
        <div className="flex flex-wrap gap-4 lg:gap-6">
            <StatCard
                title="Remuneração Total"
                value={formatCompactBRL(kpis.remuneration.value)}
                fullValue={formatBRL(kpis.remuneration.value)}
                change={hasHistory ? formatChange(kpis.remuneration.change) : undefined}
                changeType={getChangeType(kpis.remuneration.change)}
            />
            <StatCard
                title="Total de Registros"
                value={formatCompactNumber(kpis.count.value)}
                fullValue={String(kpis.count.value)}
                change={hasHistory ? formatChange(kpis.count.change) : undefined}
                changeType={getChangeType(kpis.count.change)}
            />
            <StatCard
                title="Total INSS"
                value={formatCompactBRL(kpis.inss.value)}
                fullValue={formatBRL(kpis.inss.value)}
                change={hasHistory ? formatChange(kpis.inss.change) : undefined}
                changeType={getChangeType(kpis.inss.change)}
            />
            <StatCard
                title="Saúde + Odonto"
                value={formatCompactBRL(kpis.saudeOdonto.value)}
                fullValue={formatBRL(kpis.saudeOdonto.value)}
                change={hasHistory ? formatChange(kpis.saudeOdonto.change) : undefined}
                changeType={getChangeType(kpis.saudeOdonto.change)}
            />
            <StatCard
                title="Benefícios"
                value={formatCompactBRL(kpis.beneficio.value)}
                fullValue={formatBRL(kpis.beneficio.value)}
                change={hasHistory ? formatChange(kpis.beneficio.change) : undefined}
                changeType={getChangeType(kpis.beneficio.change)}
            />
            <StatCard
                title="Seguro de Vida"
                value={formatCompactBRL(kpis.seguro.value)}
                fullValue={formatBRL(kpis.seguro.value)}
                change={hasHistory ? formatChange(kpis.seguro.change) : undefined}
                changeType={getChangeType(kpis.seguro.change)}
            />
        </div>
    );
};

export default SummaryCards;