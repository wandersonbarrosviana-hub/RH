import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { Collaborator } from '../types';
import { MaximizeIcon } from './Icons';

interface HeadcountChartProps {
    data: Collaborator[];
    onLotacaoSelect: (lotacao: string | null) => void;
    onMaximize?: () => void;
    isMaximized?: boolean;
}

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
        <div className={`flex-1 w-full ${isScrollable ? 'overflow-x-auto pb-2' : 'overflow-hidden'}`}>
            {children}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl text-sm">
                <p className="font-bold text-gray-800 mb-1">{`${label}`}</p>
                <p className="text-pink-600">{`Total de Registros: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const HeadcountChart: React.FC<HeadcountChartProps> = ({ data, onLotacaoSelect, onMaximize, isMaximized }) => {
    const chartData = useMemo(() => {
        const countsByLotacao = data.reduce((acc: Record<string, number>, c) => {
            const lotacao = c.lotacao || 'Não definido';
            if (!acc[lotacao]) {
                acc[lotacao] = 0;
            }
            acc[lotacao]++;
            return acc;
        }, {});

        return Object.entries(countsByLotacao)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => Number(b.count) - Number(a.count));
    }, [data]);

    const handleBarClick = (payload: any) => {
        if (payload) {
            const lotacaoName = payload.name;
            onLotacaoSelect(lotacaoName === 'Não definido' ? '' : lotacaoName);
        }
    };

    const barWidth = 60;
    const calculatedWidth = chartData.length * barWidth;
    const shouldUseDynamicWidth = !isMaximized && calculatedWidth > 600;

    return (
        <ChartWrapper title="Registros por Lotação" onMaximize={onMaximize} isScrollable={!isMaximized}>
            <div style={{ width: shouldUseDynamicWidth ? calculatedWidth : '100%', height: '100%', minWidth: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 70,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="name"
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            tick={{ fontSize: 10 }}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Total de Registros" barSize={30} onClick={handleBarClick}>
                            <LabelList dataKey="count" position="top" />
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} cursor="pointer" fill={'#ec4899'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </ChartWrapper>
    );
};

export default HeadcountChart;