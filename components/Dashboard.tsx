import React, { useState } from 'react';
import type { Collaborator } from '../types';
import SalaryChart from './SalaryChart';
import HeadcountChart from './HeadcountChart';
import CnpjChart from './CnpjChart';
import SummaryCards from './SummaryCards';
import HeadcountByMonthChart from './MonthlyHiresChart';
import { XIcon } from './Icons';

interface DashboardProps {
    filteredData: Collaborator[];
    allData: Collaborator[];
    onLotacaoSelect: (lotacao: string | null) => void;
    filters: { payrollDate: string; };
}

type ChartKey = 'salary' | 'cnpj' | 'headcount' | 'monthly';

const Dashboard: React.FC<DashboardProps> = ({ filteredData, allData, onLotacaoSelect, filters }) => {
    const [maximizedChart, setMaximizedChart] = useState<ChartKey | null>(null);

    const renderMaximizedChart = () => {
        if (!maximizedChart) return null;

        switch (maximizedChart) {
            case 'salary': return <SalaryChart data={filteredData} isMaximized={true} />;
            case 'cnpj': return <CnpjChart data={filteredData} isMaximized={true} />;
            case 'headcount': return <HeadcountChart data={filteredData} onLotacaoSelect={onLotacaoSelect} isMaximized={true} />;
            case 'monthly': return <HeadcountByMonthChart allData={allData} payrollDate={filters.payrollDate} isMaximized={true} />;
            default: return null;
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md border-t border-gray-200 space-y-8">
            <SummaryCards
                filteredData={filteredData}
                allData={allData}
                filters={filters}
            />
            {filteredData.length > 0 || allData.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                    <SalaryChart data={filteredData} onMaximize={() => setMaximizedChart('salary')} />
                    <CnpjChart data={filteredData} onMaximize={() => setMaximizedChart('cnpj')} />
                    <HeadcountChart data={filteredData} onLotacaoSelect={onLotacaoSelect} onMaximize={() => setMaximizedChart('headcount')} />
                    <HeadcountByMonthChart allData={allData} payrollDate={filters.payrollDate} onMaximize={() => setMaximizedChart('monthly')} />
                </div>
            ) : (
                <div className="text-center py-12 px-6">
                    <h3 className="text-xl font-semibold text-gray-700">Dados insuficientes para exibir os gráficos.</h3>
                    <p className="mt-2 text-gray-500">Adicione colaboradores ou ajuste seus filtros para visualizar as análises.</p>
                </div>
            )}

            {maximizedChart && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setMaximizedChart(null)}>
                    <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] bg-white rounded-lg shadow-xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setMaximizedChart(null)}
                            className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-gray-800 bg-white rounded-full shadow-lg transition-colors"
                            title="Fechar"
                        >
                            <XIcon className="h-6 w-6" />
                        </button>
                        <div className="flex-1 overflow-auto">
                            {renderMaximizedChart()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;