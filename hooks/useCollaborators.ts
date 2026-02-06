import { useState, useEffect, useCallback } from 'react';
import type { Collaborator } from '../types';
import { parseSpreadsheet } from '../services/spreadsheetParser';
import { database } from '../services/database';

export function useCollaborators() {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar colaboradores do Supabase ao iniciar
    useEffect(() => {
        loadCollaborators();
    }, []);

    const loadCollaborators = async () => {
        try {
            setIsLoading(true);
            const data = await database.getCollaborators();
            setCollaborators(data);
        } catch (error) {
            console.error("Error loading collaborators from database", error);
            alert("Erro ao carregar colaboradores do banco de dados.");
        } finally {
            setIsLoading(false);
        }
    };

    const addCollaborator = useCallback(async (newCollaborator: Omit<Collaborator, 'id'>) => {
        try {
            const added = await database.addCollaborator(newCollaborator);
            setCollaborators(prev => [...prev, added]);
        } catch (error) {
            console.error("Error adding collaborator", error);
            alert("Erro ao adicionar colaborador.");
        }
    }, []);

    const updateCollaborator = useCallback(async (updatedCollaborator: Collaborator) => {
        try {
            await database.updateCollaborator(updatedCollaborator.id, updatedCollaborator);
            setCollaborators(prev => prev.map(c => c.id === updatedCollaborator.id ? updatedCollaborator : c));
        } catch (error) {
            console.error("Error updating collaborator", error);
            alert("Erro ao atualizar colaborador.");
        }
    }, []);

    const deleteCollaborator = useCallback(async (id: string) => {
        try {
            await database.deleteCollaborator(id);
            setCollaborators(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting collaborator", error);
            alert("Erro ao deletar colaborador.");
        }
    }, []);

    const importCollaborators = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const fileData = event.target?.result as ArrayBuffer;
            if (fileData) {
                try {
                    const { collaborators: parsedData, totalRows, importedRows, skippedRows } = parseSpreadsheet(fileData);

                    if (importedRows === 0) {
                        alert("Nenhum dado válido foi encontrado na planilha para importar.");
                        return;
                    }

                    console.log('📊 Dados parseados da planilha:', parsedData.length, 'registros');

                    // Encontrar todos os meses únicos (YYYY-MM) presentes nos novos dados da planilha
                    const monthsInNewData = new Set(
                        parsedData.map(c => c.data ? c.data.substring(0, 7) : '')
                            .filter(Boolean)
                    );

                    console.log('📅 Meses na planilha:', Array.from(monthsInNewData));

                    // Buscar colaboradores existentes do banco de dados
                    console.log('🔍 Buscando colaboradores existentes...');
                    const existingCollaborators = await database.getCollaborators();
                    console.log('✅ Colaboradores existentes:', existingCollaborators.length);

                    // Filtrar dados existentes, mantendo apenas registros de meses NÃO presentes na nova importação
                    const preservedData = existingCollaborators.filter(c =>
                        !c.data || !monthsInNewData.has(c.data.substring(0, 7))
                    );

                    console.log('💾 Dados a preservar:', preservedData.length);

                    // Deletar todos os colaboradores do banco (vamos recriar)
                    console.log('🗑️ Limpando banco de dados...');
                    await database.deleteAllCollaborators();
                    console.log('✅ Banco limpo');

                    // Inserir dados preservados + novos dados
                    const allCollaborators = [...preservedData, ...parsedData];

                    console.log('💾 Total de registros a inserir:', allCollaborators.length);
                    console.log('📝 Exemplo de registro:', allCollaborators[0]);

                    if (allCollaborators.length > 0) {
                        console.log('⬆️ Inserindo no banco de dados...');
                        const addedCollaborators = await database.addCollaborators(allCollaborators);
                        console.log('✅ Inseridos com sucesso:', addedCollaborators.length);
                        setCollaborators(addedCollaborators);
                    } else {
                        setCollaborators([]);
                    }

                    let message = `${importedRows} de ${totalRows} linhas de dados foram importadas com sucesso no Supabase.`;
                    message += `\n\nOs dados para os meses contidos na planilha foram atualizados, preservando os demais.`;
                    if (skippedRows > 0) {
                        message += `\n\n${skippedRows} linha(s) foram ignoradas por não conterem um 'CPF'.`;
                    }
                    alert(message);

                } catch (error) {
                    console.error("Falha ao analisar a planilha", error);
                    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
                    const errorMessage = error instanceof Error ? error.message : "Por favor, verifique o formato e o conteúdo do arquivo.";
                    alert(`Falha ao importar a planilha.\n\nErro: ${errorMessage}\n\nVerifique o console do navegador (F12) para mais detalhes.`);
                }
            }
        };
        reader.onerror = () => {
            alert("Erro ao ler o arquivo.");
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const deleteAllCollaborators = useCallback(async () => {
        if (!window.confirm('⚠️ ATENÇÃO: Isso irá deletar TODOS os colaboradores do banco de dados!\n\nTem certeza que deseja continuar?')) {
            return;
        }

        try {
            console.log('🗑️ Deletando todos os colaboradores...');
            await database.deleteAllCollaborators();
            setCollaborators([]);
            console.log('✅ Todos os colaboradores foram deletados');
            alert('✅ Todos os colaboradores foram deletados com sucesso!');
        } catch (error) {
            console.error("Error deleting all collaborators", error);
            alert("Erro ao deletar colaboradores.");
        }
    }, []);

    return { collaborators, addCollaborator, importCollaborators, updateCollaborator, deleteCollaborator, deleteAllCollaborators, isLoading };
}