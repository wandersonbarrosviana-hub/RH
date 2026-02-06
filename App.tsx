import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import CollaboratorTable from './components/CollaboratorTable';
import CollaboratorFormModal from './components/CollaboratorFormModal';
import Dashboard from './components/Dashboard';
import Tabs from './components/Tabs';
import FilterBar from './components/FilterBar';
import { useCollaborators } from './hooks/useCollaborators';
import { exportToSpreadsheet } from './services/spreadsheetExporter';
import type { Collaborator } from './types';

const INITIAL_FILTERS = {
    searchTerm: '',
    empresa: 'all',
    cnpj: 'all',
    lotacao: 'all',
    payrollDate: '',
};

export default function App() {
    const { collaborators, addCollaborator, importCollaborators, updateCollaborator, deleteCollaborator, deleteAllCollaborators } = useCollaborators();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const filterOptions = useMemo(() => {
        const empresas = [...new Set(collaborators.map(c => c.empresa).filter(Boolean))];
        const cnpjs = [...new Set(collaborators.map(c => c.cnpj).filter(Boolean))];
        const lotacoes = [...new Set(collaborators.map(c => c.lotacao).filter(Boolean))];
        const cargos = [...new Set(collaborators.map(c => c.cargo).filter(Boolean))];
        return { empresas, cnpjs, lotacoes, cargos };
    }, [collaborators]);

    const filteredCollaborators = useMemo(() => {
        return collaborators.filter(c => {
            const { searchTerm, empresa, cnpj, lotacao, payrollDate } = filters;

            if (empresa !== 'all' && c.empresa !== empresa) return false;
            if (cnpj !== 'all' && c.cnpj !== cnpj) return false;
            if (lotacao !== 'all' && c.lotacao !== lotacao) return false;

            // BUG FIX: Corrected date filtering logic.
            // If payrollDate is set, a record MUST have a date and it MUST match the selected YYYY-MM.
            // Records without a date are now correctly filtered out when a date filter is active.
            if (payrollDate && (!c.data || !c.data.startsWith(payrollDate))) return false;

            if (searchTerm) {
                const lowercasedFilter = searchTerm.toLowerCase();
                const matchesSearch =
                    c.nome.toLowerCase().includes(lowercasedFilter) ||
                    c.cpf.toLowerCase().includes(lowercasedFilter) ||
                    c.cargo.toLowerCase().includes(lowercasedFilter);
                if (!matchesSearch) return false;
            }

            return true;
        });
    }, [collaborators, filters]);

    const openAddModal = () => {
        setEditingCollaborator(null);
        setIsModalOpen(true);
    };

    const openEditModal = (collaborator: Collaborator) => {
        setEditingCollaborator(collaborator);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCollaborator(null);
    };

    const handleSave = (collaborator: Collaborator) => {
        if (collaborator.id) {
            updateCollaborator(collaborator);
        } else {
            addCollaborator(collaborator);
        }
        closeModal();
    };

    const handleExport = () => {
        const fileName = `colaboradores_${new Date().toISOString().split('T')[0]}.xlsx`;
        exportToSpreadsheet(filteredCollaborators, fileName);
    };

    const handleLotacaoFilter = useCallback((lotacao: string | null) => {
        setFilters(prev => ({ ...prev, lotacao: lotacao || 'all' }));
    }, []);

    const clearFilters = () => {
        setFilters(INITIAL_FILTERS);
    };

    return (
        <div className="min-h-screen bg-pink-50 text-gray-800">
            <Header
                onAddCollaborator={openAddModal}
                onImport={importCollaborators}
                onExport={handleExport}
                onDeleteAll={deleteAllCollaborators}
                collaboratorsCount={filteredCollaborators.length}
            />
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <FilterBar
                        filters={filters}
                        setFilters={setFilters}
                        options={filterOptions}
                        onClearFilters={clearFilters}
                    />
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

                    {activeTab === 'Dashboard' && (
                        <Dashboard
                            filteredData={filteredCollaborators}
                            allData={collaborators}
                            onLotacaoSelect={handleLotacaoFilter}
                            filters={filters}
                        />
                    )}

                    {activeTab === 'Controller' && (
                        <CollaboratorTable
                            collaborators={filteredCollaborators}
                            onEdit={openEditModal}
                            onDelete={deleteCollaborator}
                        />
                    )}
                </div>
            </main>
            {isModalOpen && (
                <CollaboratorFormModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSave={handleSave}
                    collaborator={editingCollaborator}
                    options={filterOptions}
                />
            )}
        </div>
    );
}