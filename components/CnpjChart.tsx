import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { Collaborator } from '../types';
import { MaximizeIcon } from './Icons';

interface CnpjChartProps {
    data: Collaborator[];
    onMaximize?: () => void;
    isMaximized?: boolean;
}



// ... (CustomTooltip, renderCustomizedLabel, parseCurrency remain same)
// I need to keep them. 
// Wait, I can't leave comments here if I replace the whole file or range.
// I will just replace the `interface`, `COLORS`, and `CnpjChart` separately using MULTI_REPLACE to avoid touching the helpers.


const ChartWrapper: React.FC<{ title: string; children: React.ReactNode; onMaximize?: () => void; isScrollable?: boolean }> = ({ title, children, onMaximize, isScrollable }) => (
    <div className={`relative bg-white p-4 rounded-lg shadow-inner border border-gray-100 flex flex-col ${isScrollable ? 'h-96' : 'h-full'}`}>
        <h3 className="text-md font-semibold text-gray-700 mb-2 text-center flex-shrink-0">{title}</h3>
        {onMaximize && (
            <button
                onClick={onMaximize}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 transition"
                title="Maximizar Gráfico"
            >
                <MaximizeIcon className="h-5 w-5" />
            </button>
        )}
        <div className={`flex-1 w-full ${isScrollable ? 'overflow-y-auto pr-2' : 'overflow-hidden'}`}>
            {children}
        </div>
    </div>
);

// ... (CustomTooltip, renderCustomizedLabel, parseCurrency remain same)

// Since we are NOT using the placeholder comment this time, we don't need to redeclare the helpers inside the replacement if we target carefully. 
// BUT, CnpjChart likely has these helpers defined.
// To avoid the error I made before, I will Target explicit blocks or be very careful.

// Actually, let's keep the helpers AS IS, and just replace ChartWrapper and CnpjChart component.
// The helpers are lines 27-80.
// I will invoke TWO replacements on CnpjChart.tsx via multi_replace to be safe, OR just target the specific chunks.

// Let's replace ONLY ChartWrapper.


const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl text-sm">
                <p className="font-bold text-gray-800 mb-1">{`${label}`}</p>
                <p className="text-pink-600">{`Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}`}</p>
            </div>
        );
    }
    return null;
};

const COLORS = ['#ec4899', '#ec4899', '#ec4899', '#ec4899'];

// Fix: Add type for recharts label renderer props to resolve arithmetic operation error.
const renderCustomizedLabel = (props: { x: number; y: number; width: number; value: number; }) => {
    const { x, y, width, value } = props;
    const formattedValue = `R$${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
    return (
        <text x={x + width + 5} y={y + 12} fill="#666" textAnchor="start" fontSize={12}>
            {formattedValue}
        </text>
    );
};

// FIX: Add robust currency parser to handle various number formats (e.g., "1.234,56").
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


const CnpjChart: React.FC<CnpjChartProps> = ({ data, onMaximize, isMaximized }) => {
    const chartData = useMemo(() => {
        const cnpjData = data.reduce((acc: Record<string, number>, c) => {
            const cnpj = c.cnpj || 'Não Especificado';
            const remuneration = parseCurrency(c.salarioLiquido) + parseCurrency(c.adiantamento);
            if (!acc[cnpj]) {
                acc[cnpj] = 0;
            }
            acc[cnpj] += remuneration;
            return acc;
        }, {});

        // Remove slice to show all data
        return Object.entries(cnpjData)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => Number(b.total) - Number(a.total));
    }, [data]);

    const barHeight = 40;
    const minHeight = 300;
    const dynamicHeight = isMaximized ? '100%' : Math.max(minHeight, chartData.length * barHeight);

    return (
        <ChartWrapper title="Remuneração por CNPJ" onMaximize={onMaximize} isScrollable={!isMaximized}>
            <div style={{ height: dynamicHeight, minHeight: isMaximized ? '100%' : '100%', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={230}
                            tick={{ fontSize: 11 }}
                            interval={0}
                            tickFormatter={(value) => {
                                const limit = isMaximized ? 50 : 35;
                                if (value.length > limit) {
                                    return value.substring(0, limit) + '...';
                                }
                                return value;
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(236, 72, 153, 0.1)' }} />
                        <Bar dataKey="total" name="Remuneração Total" barSize={12}>
                            <LabelList dataKey="total" position="right" content={renderCustomizedLabel} />
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </ChartWrapper>
    );
};
export default CnpjChart;