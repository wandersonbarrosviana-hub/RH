import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import type { Collaborator } from '../types';
import { MaximizeIcon } from './Icons';

interface HeadcountByMonthChartProps {
    allData: Collaborator[];
    payrollDate: string;
    onMaximize?: () => void;
}

const ChartWrapper: React.FC<{ title: string; children: React.ReactNode; onMaximize?: () => void; }> = ({ title, children, onMaximize }) => (
    <div className="relative bg-white p-4 rounded-lg shadow-inner border border-gray-100 h-96">
        <h3 className="text-md font-semibold text-gray-700 mb-4 text-center">{title}</h3>
        {onMaximize && (
            <button
                onClick={onMaximize}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 transition"
                title="Maximizar Gráfico"
            >
                <MaximizeIcon className="h-5 w-5" />
            </button>
        )}
        {children}
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl text-sm">
                <p className="font-bold text-gray-800 mb-1">{`Mês: ${label}`}</p>
                <p className="text-pink-600">{`Total de Registros: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const HeadcountByMonthChart: React.FC<HeadcountByMonthChartProps> = ({ allData, payrollDate, onMaximize }) => {
    
    const { chartData, year } = useMemo(() => {
        // Use payrollDate to determine the year, fallback to current year
        const targetYear = payrollDate ? new Date(payrollDate + '-02T00:00:00Z').getFullYear() : new Date().getFullYear();
        
        const monthlyData = MONTHS.map((monthName, index) => {
            const monthString = `${targetYear}-${String(index + 1).padStart(2, '0')}`;
            
            // Filter collaborators whose 'data' field matches the current month and year
            const collaboratorsForMonth = allData.filter(c => c.data && c.data.startsWith(monthString));
            
            // Count the total number of records for the month, not unique CPFs.
            return { name: monthName, count: collaboratorsForMonth.length };
        });
        
        return { chartData: monthlyData, year: targetYear };
    }, [allData, payrollDate]);

    return (
        <ChartWrapper title={`Total de Registros por Mês em ${year}`} onMaximize={onMaximize}>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Headcount" barSize={30}>
                        <LabelList dataKey="count" position="top" />
                         {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={'#f9a8d4'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
};

export default HeadcountByMonthChart;