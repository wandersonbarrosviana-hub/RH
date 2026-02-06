import React, { useState, useEffect } from 'react';
import { settingsService, Setting } from '../services/settings';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSettingsChanged: () => void;
    onClearFilters: () => void;
}

const CATEGORIES = [
    { key: 'cargo', label: 'Cargos' },
    { key: 'empresa', label: 'Empresas' },
    { key: 'cnpj', label: 'CNPJs' },
    { key: 'lotacao', label: 'Lotações' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSettingsChanged, onClearFilters }) => {
    const [activeTab, setActiveTab] = useState('cargo');
    const [settings, setSettings] = useState<Setting[]>([]);
    const [newValue, setNewValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSettings();
        }
    }, [isOpen, activeTab]);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const data = await settingsService.getSettings(activeTab);
            setSettings(data || []);
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newValue.trim()) return;

        try {
            await settingsService.addSetting(activeTab, newValue.trim().toUpperCase());
            setNewValue('');
            loadSettings();
            onSettingsChanged();
        } catch (error) {
            console.error('Failed to add setting', error);
            alert('Erro ao adicionar item. Verifique se já existe.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;
        try {
            await settingsService.deleteSetting(id);
            loadSettings();
            onSettingsChanged();
        } catch (error) {
            console.error('Failed to delete setting', error);
            alert('Erro ao excluir item.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-semibold text-gray-900">Configurações</h3>
                        <button
                            onClick={() => { onClearFilters(); alert('Filtros limpos!'); }}
                            className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100 transition"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveTab(cat.key)}
                            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === cat.key
                                ? 'border-b-2 border-pink-500 text-pink-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            placeholder={`Adicionar novo ${CATEGORIES.find(c => c.key === activeTab)?.label.slice(0, -1).toLowerCase()}...`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        />
                        <button
                            type="submit"
                            disabled={!newValue.trim()}
                            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50"
                        >
                            Adicionar
                        </button>
                    </form>

                    {isLoading ? (
                        <div className="text-center py-4">Carregando...</div>
                    ) : (
                        <div className="space-y-2">
                            {settings.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md group">
                                    <span className="text-gray-700">{item.value}</span>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Excluir"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            ))}
                            {settings.length === 0 && (
                                <p className="text-center text-gray-500 py-4">Nenhum item cadastrado.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
