import React, { useMemo } from 'react';
import type { Collaborator } from '../types';

const StatCard: React.FC<{ title: string; value: string; change?: string; changeType?: 'positive' | 'negative' }> = ({ title, value, change, changeType }) => (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 flex-1 min-w-[180px]">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</h4>
        <div className="mt-1 flex items-baseline">
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{value}</p>
            {change && (
                <span className={`ml-2 text-xs font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {change}
                </span>
            )}
        </div>
    </div>
);

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

        let previousYearRemuneration = 0;
        if (filters.payrollDate) {
            const [year, month] = filters.payrollDate.split('-');
            const prevYearPayrollDate = `${parseInt(year) - 1}-${month}`;

            const prevYearData = allData.filter(c => c.data && c.data.startsWith(prevYearPayrollDate));
            previousYearRemuneration = prevYearData.reduce((sum, c) => sum + (Number(c.salarioLiquido) || 0) + (Number(c.adiantamento) || 0), 0);
        }

        const change = previousYearRemuneration > 0 ? ((currentTotals.remuneration - previousYearRemuneration) / previousYearRemuneration) * 100 : (currentTotals.remuneration > 0 ? 100 : 0);

        return {
            totalRecordsCount,
            totalRemuneration: currentTotals.remuneration,
            yoyChange: change,
            totalInss: currentTotals.inss,
            totalBeneficio: currentTotals.beneficio,
            totalSeguro: currentTotals.seguro,
            totalSaudeOdonto: currentTotals.saudeOdonto
        };
    }, [filteredData, allData, filters.payrollDate]);

    const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const formattedChange = `${kpis.yoyChange >= 0 ? '+' : ''}${kpis.yoyChange.toFixed(1)}%`;
    const changeType = kpis.yoyChange >= 0 ? 'positive' : 'negative';

    return (
        <div className="flex flex-wrap gap-4 lg:gap-6">
            <StatCard
                title="Remuneração Total"
                value={formatBRL(kpis.totalRemuneration)}
                change={filters.payrollDate ? formattedChange : undefined}
                changeType={changeType}
            />
            <StatCard
                title="Total de Registros"
                value={String(kpis.totalRecordsCount)}
            />
            <StatCard
                title="Total INSS"
                value={formatBRL(kpis.totalInss)}
            />
            <StatCard
                title="Saúde + Odonto"
                value={formatBRL(kpis.totalSaudeOdonto)}
            />
            <StatCard
                title="Benefícios"
                value={formatBRL(kpis.totalBeneficio)}
            />
            <StatCard
                title="Seguro de Vida"
                value={formatBRL(kpis.totalSeguro)}
            />
        </div>
    );
};

export default SummaryCards;