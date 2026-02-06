import React, { useState, useMemo } from 'react';
import type { Collaborator } from '../types';
import { EditIcon, TrashIcon } from './Icons';

interface CollaboratorTableProps {
    collaborators: Collaborator[];
    onEdit: (collaborator: Collaborator) => void;
    onDelete: (id: string) => void;
}

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{children}</th>
);

const TableCell: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${className}`}>{children}</td>
);

const CollaboratorTable: React.FC<CollaboratorTableProps> = ({ collaborators, onEdit, onDelete }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Calcular total de páginas
    const totalPages = Math.ceil(collaborators.length / itemsPerPage);

    // Obter colaboradores da página atual
    const paginatedCollaborators = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return collaborators.slice(startIndex, endIndex);
    }, [collaborators, currentPage, itemsPerPage]);

    // Resetar para página 1 quando mudar itens por página ou filtros
    React.useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage, collaborators.length]);

    // Funções de navegação
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
    };

    if (collaborators.length === 0) {
        return (
            <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700">Nenhum colaborador encontrado.</h3>
                <p className="mt-2 text-gray-500">Comece adicionando um novo colaborador ou importando uma planilha.</p>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="shadow-lg rounded-xl overflow-hidden bg-white">
            {/* Controle de itens por página - Topo */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700">
                        Mostrar:
                    </label>
                    <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-sm"
                    >
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={40}>40</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600">colaboradores por página</span>
                </div>
                <div className="text-sm text-gray-600">
                    Total: <span className="font-semibold text-pink-600">{collaborators.length}</span> colaboradores
                </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-pink-500">
                        <tr>
                            <TableHeader>Nome</TableHeader>
                            <TableHeader>Data</TableHeader>
                            <TableHeader>Cargo</TableHeader>
                            <TableHeader>CPF</TableHeader>
                            <TableHeader>Admissão</TableHeader>
                            <TableHeader>Salário Base</TableHeader>
                            <TableHeader>Ações</TableHeader>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedCollaborators.map((collaborator) => (
                            <tr key={collaborator.id} className="hover:bg-pink-50 transition">
                                <TableCell>
                                    <div className="font-medium text-gray-900">{collaborator.nome}</div>
                                </TableCell>
                                <TableCell>{formatDate(collaborator.data)}</TableCell>
                                <TableCell>{collaborator.cargo}</TableCell>
                                <TableCell>{collaborator.cpf}</TableCell>
                                <TableCell>{formatDate(collaborator.admissao)}</TableCell>
                                <TableCell>R$ {collaborator.salarioBase}</TableCell>
                                <TableCell className="flex items-center space-x-3">
                                    <button onClick={() => onEdit(collaborator)} className="text-pink-600 hover:text-pink-800 transition" title="Editar">
                                        <EditIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => {
                                        if (window.confirm(`Tem certeza que deseja excluir ${collaborator.nome}?`)) {
                                            onDelete(collaborator.id)
                                        }
                                    }} className="text-gray-400 hover:text-red-600 transition" title="Excluir">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </TableCell>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Controles de Paginação - Rodapé */}
            {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Mostrando <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> até{' '}
                        <span className="font-semibold">{Math.min(currentPage * itemsPerPage, collaborators.length)}</span> de{' '}
                        <span className="font-semibold">{collaborators.length}</span> colaboradores
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Botão Primeira Página */}
                        <button
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            title="Primeira página"
                        >
                            ««
                        </button>

                        {/* Botão Página Anterior */}
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            title="Página anterior"
                        >
                            «
                        </button>

                        {/* Números de Página */}
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNumber;
                                if (totalPages <= 5) {
                                    pageNumber = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNumber = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNumber = totalPages - 4 + i;
                                } else {
                                    pageNumber = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => goToPage(pageNumber)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition ${currentPage === pageNumber
                                                ? 'bg-pink-500 text-white'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Botão Próxima Página */}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            title="Próxima página"
                        >
                            »
                        </button>

                        {/* Botão Última Página */}
                        <button
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            title="Última página"
                        >
                            »»
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollaboratorTable;