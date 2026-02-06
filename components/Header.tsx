
import React, { useRef } from 'react';
import { PlusIcon, UploadIcon, UserGroupIcon, DownloadIcon } from './Icons';

interface HeaderProps {
    onAddCollaborator: () => void;
    onImport: (file: File) => void;
    onExport: () => void;
    onDeleteAll: () => void;
    onSettings: () => void;
    collaboratorsCount: number;
}

const Header: React.FC<HeaderProps> = ({ onAddCollaborator, onImport, onExport, onDeleteAll, onSettings, collaboratorsCount }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
            event.target.value = '';
        }
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <UserGroupIcon className="h-8 w-8 text-pink-500" />
                        <h1 className="ml-3 text-2xl font-bold text-gray-800">Controle de Colaboradores</h1>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx, .xls"
                            className="hidden"
                        />
                        <button
                            onClick={handleImportClick}
                            className="hidden sm:flex items-center px-4 py-2 border border-pink-500 text-pink-500 rounded-full text-sm font-medium hover:bg-pink-50 transition"
                            title="Importar Planilha"
                        >
                            <UploadIcon className="h-5 w-5 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Importar</span>
                        </button>
                        <button
                            onClick={onExport}
                            disabled={collaboratorsCount === 0}
                            className="hidden sm:flex items-center px-4 py-2 border border-pink-500 text-pink-500 rounded-full text-sm font-medium hover:bg-pink-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Exportar Planilha"
                        >
                            <DownloadIcon className="h-5 w-5 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Exportar</span>
                        </button>
                        <button
                            onClick={onSettings}
                            className="hidden sm:flex items-center px-4 py-2 border border-gray-500 text-gray-500 rounded-full text-sm font-medium hover:bg-gray-50 transition"
                            title="Configurações (Cargos, Empresas, etc)"
                        >
                            <svg className="h-5 w-5 mr-0 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="hidden sm:inline">Configurações</span>
                        </button>
                        <button
                            onClick={onDeleteAll}
                            disabled={collaboratorsCount === 0}
                            className="hidden sm:flex items-center px-4 py-2 border border-red-500 text-red-500 rounded-full text-sm font-medium hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Limpar Todos os Dados"
                        >
                            <svg className="h-5 w-5 mr-0 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Limpar Tudo</span>
                        </button>
                        <button
                            onClick={onAddCollaborator}
                            className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition shadow"
                        >
                            <PlusIcon className="h-5 w-5 mr-1 sm:mr-2" />
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;