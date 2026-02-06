
import React from 'react';
import { SearchIcon, XCircleIcon } from './Icons';

interface Filters {
    searchTerm: string;
    empresa: string;
    cnpj: string;
    lotacao: string;
    payrollDate: string[];
}

interface FilterOptions {
    empresas: string[];
    cnpjs: string[];
    lotacoes: string[];
}

interface FilterBarProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    options: FilterOptions;
    onClearFilters: () => void;
}

const FilterInput: React.FC<{ children: React.ReactNode, label: string }> = ({ children, label }) => (
    <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        {children}
    </div>
);

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, options, onClearFilters }) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md space-y-4">
            <div className="flex flex-wrap items-end gap-4">
                <FilterInput label="Buscar por Nome/CPF">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            name="searchTerm"
                            placeholder="Buscar..."
                            value={filters.searchTerm}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-transparent transition"
                        />
                    </div>
                </FilterInput>

                <FilterInput label="Empresa">
                    <select name="empresa" value={filters.empresa} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-400">
                        <option value="all">Todas</option>
                        {options.empresas.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </FilterInput>

                <FilterInput label="CNPJ">
                    <select name="cnpj" value={filters.cnpj} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-400">
                        <option value="all">Todos</option>
                        {options.cnpjs.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </FilterInput>

                <FilterInput label="Lotação">
                    <select name="lotacao" value={filters.lotacao} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-400">
                        <option value="all">Todas</option>
                        {options.lotacoes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </FilterInput>

                <FilterInput label="Mês de Referência">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                            <input
                                type="month"
                                id="date-adder"
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-400"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val && !filters.payrollDate.includes(val)) {
                                        setFilters(prev => ({ ...prev, payrollDate: [...prev.payrollDate, val].sort() }));
                                        e.target.value = ''; // Reset
                                    }
                                }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {filters.payrollDate.length > 0 ? filters.payrollDate.map(date => (
                                <span key={date} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
                                    {date}
                                    <button
                                        type="button"
                                        onClick={() => setFilters(prev => ({ ...prev, payrollDate: prev.payrollDate.filter(d => d !== date) }))}
                                        className="ml-1 text-pink-600 hover:text-pink-900 focus:outline-none"
                                    >
                                        &times;
                                    </button>
                                </span>
                            )) : <span className="text-xs text-gray-400">Nenhum mês selecionado</span>}
                        </div>
                    </div>
                </FilterInput>


            </div>
        </div>
    );
};

export default FilterBar;