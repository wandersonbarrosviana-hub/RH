
import React from 'react';
import { SearchIcon, XCircleIcon } from './Icons';

interface Filters {
    searchTerm: string;
    empresa: string;
    cnpj: string;
    lotacao: string;
    payrollDate: string;
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
        setFilters(prev => ({...prev, [name]: value }));
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
                     <input type="month" name="payrollDate" value={filters.payrollDate} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-400" />
                </FilterInput>

                <button onClick={onClearFilters} className="flex items-center self-end mb-1 px-3 py-2 text-xs text-pink-600 hover:text-pink-800 transition" title="Limpar Filtros">
                    <XCircleIcon className="h-5 w-5 mr-1" />
                    Limpar
                </button>
            </div>
        </div>
    );
};

export default FilterBar;