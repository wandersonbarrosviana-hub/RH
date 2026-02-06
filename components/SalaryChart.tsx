import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { Collaborator } from '../types';
import { MaximizeIcon } from './Icons';

interface SalaryChartProps {
    data: Collaborator[];
    onMaximize?: () => void;
    isMaximized?: boolean;
}

const ChartWrapper: React.FC<{ title: string; children: React.ReactNode; onMaximize?: () => void; isScrollable?: boolean }> = ({ title, children, onMaximize, isScrollable }) => (
    <div className="relative bg-white p-4 rounded-lg shadow-inner border border-gray-100 flex flex-col h-96">
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

const COLORS = ['#ec4899', '#ec4899', '#ec4899', '#ec4899']; // Unified color

const renderCustomizedLabel = (props: { x: number; y: number; width: number; value: number; }) => {
    const { x, y, width, value } = props;
    const formattedValue = `R$${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
    return (
        <text x={x + width + 5} y={y + 12} fill="#666" textAnchor="start" fontSize={12}>
            {formattedValue}
        </text>
    );
};

const parseCurrency = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string' || !value) return 0;

    let parsableString = String(value).replace(/[^\d.,-]+/g, '');

    const lastDot = parsableString.lastIndexOf('.');
    const lastComma = parsableString.lastIndexOf(',');

    if (lastDot > -1 && lastComma > -1) {
        if (lastComma > lastDot) {
            parsableString = parsableString.replace(/\./g, '').replace(',', '.');
        } else {
            parsableString = parsableString.replace(/,/g, '');
        }
    } else if (lastComma > -1) {
        parsableString = parsableString.replace(',', '.');
    }

    return parseFloat(parsableString) || 0;
};

const SalaryChart: React.FC<SalaryChartProps> = ({ data, onMaximize, isMaximized }) => {
    const chartData = useMemo(() => {
        const companyData = data.reduce((acc: Record<string, number>, c) => {
            const companyName = c.empresa || 'Não Especificada';
            const remuneration = parseCurrency(c.salarioLiquido) + parseCurrency(c.adiantamento);
            if (!acc[companyName]) {
                acc[companyName] = 0;
            }
            acc[companyName] += remuneration;
            return acc;
        }, {});

        // Remove slice to show all data
        return Object.entries(companyData)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => Number(b.total) - Number(a.total));
    }, [data]);

    const barHeight = 40;
    const minHeight = 300;
    const dynamicHeight = isMaximized ? '100%' : Math.max(minHeight, chartData.length * barHeight);

    return (
        <ChartWrapper title="Remuneração por Empresa" onMaximize={onMaximize} isScrollable={!isMaximized}>
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

export default SalaryChart;