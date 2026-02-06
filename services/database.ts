import { supabase } from './supabaseClient';
import { Collaborator } from '../types';

// Função para converter nomes de campos do formato camelCase para snake_case
const toSnakeCase = (str: string): string => {
    return str
        .replace(/([A-Z])/g, '_$1')  // Adiciona underscore antes de letras maiúsculas
        .replace(/([a-z])(\d)/g, '$1_$2')  // Adiciona underscore antes de números
        .toLowerCase()
        .replace(/^_/, '');  // Remove underscore do início se houver
};

// Função para sanitizar valores antes de enviar ao banco
const sanitizeValue = (value: any): any => {
    // Se for undefined ou null, retornar null
    if (value === undefined || value === null) {
        return null;
    }
    // Se for número, manter como número
    if (typeof value === 'number') {
        return value;
    }
    // Se for string vazia, retornar null
    if (value === '') {
        return null;
    }
    // Caso contrário, retornar o valor como está
    return value;
};

// Função para converter objeto Collaborator para formato do banco de dados
const collaboratorToDb = (collaborator: Collaborator): any => {
    const dbObject: any = {};
    Object.entries(collaborator).forEach(([key, value]) => {
        const snakeKey = toSnakeCase(key);
        dbObject[snakeKey] = sanitizeValue(value);
    });
    return dbObject;
};

// Função para converter objeto do banco de dados para Collaborator
const dbToCollaborator = (dbObject: any): Collaborator => {
    return {
        id: dbObject.id,
        data: dbObject.data || '',
        lotacao: dbObject.lotacao || '',
        nome: dbObject.nome || '',
        cargo: dbObject.cargo || '',
        admissao: dbObject.admissao || '',
        niver: dbObject.niver || '',
        cpf: dbObject.cpf || '',
        empresa: dbObject.empresa || '',
        cnpj: dbObject.cnpj || '',
        salarioBase: dbObject.salario_base || '',
        quebraDeCaixa: dbObject.quebra_de_caixa || '',
        salarioBaseComQuebra: dbObject.salario_base_com_quebra || '',
        adiantamento: dbObject.adiantamento || 0,
        salarioFamilia: dbObject.salario_familia || '',
        difCaixa: dbObject.dif_caixa || '',
        planoSaude: dbObject.plano_saude || '',
        odonto: dbObject.odonto || '',
        inss: dbObject.inss || '',
        irrf: dbObject.irrf || '',
        fgts: dbObject.fgts || '',
        vale: dbObject.vale || '',
        pensao: dbObject.pensao || '',
        consignado: dbObject.consignado || '',
        primeiraParcela13: dbObject.primeira_parcela_13 || '',
        segundaParcela13: dbObject.segunda_parcela_13 || '',
        salarioLiquido: dbObject.salario_liquido || 0,
        falta: dbObject.falta || '',
        dsr: dbObject.dsr || '',
        atestados: dbObject.atestados || '',
        folgas: dbObject.folgas || '',
        diasTrabalhadosBase: dbObject.dias_trabalhados_base || '',
        diasTrabalhados: dbObject.dias_trabalhados || '',
        vt: dbObject.vt || '',
        va: dbObject.va || '',
        beneficio: dbObject.beneficio || '',
        observacoes: dbObject.observacoes || '',
        seguroDeVida: dbObject.seguro_de_vida || '',
    };
};

export const database = {
    // Buscar todos os colaboradores
    async getCollaborators(): Promise<Collaborator[]> {
        const { data, error } = await supabase
            .from('collaborators')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Error fetching collaborators:', error);
            throw error;
        }

        return data ? data.map(dbToCollaborator) : [];
    },

    // Adicionar um colaborador
    async addCollaborator(collaborator: Omit<Collaborator, 'id'>): Promise<Collaborator> {
        console.log('🔧 addCollaborator: Recebido colaborador:', collaborator);

        const dbObject = collaboratorToDb(collaborator as Collaborator);
        delete dbObject.id; // Remove id para deixar o banco gerar

        console.log('🔧 Objeto convertido para DB:', dbObject);

        const { data, error } = await supabase
            .from('collaborators')
            .insert([dbObject])
            .select()
            .single();

        if (error) {
            console.error('❌ Error adding collaborator:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
            throw error;
        }

        console.log('✅ Colaborador adicionado com sucesso:', data);
        return dbToCollaborator(data);
    },

    // Adicionar múltiplos colaboradores (útil para importação de planilha)
    async addCollaborators(collaborators: Omit<Collaborator, 'id'>[]): Promise<Collaborator[]> {
        console.log('🔧 addCollaborators: Recebidos', collaborators.length, 'colaboradores');

        const dbObjects = collaborators.map((c, index) => {
            const obj = collaboratorToDb(c as Collaborator);
            delete obj.id;

            // Log do primeiro objeto para debug
            if (index === 0) {
                console.log('🔧 Primeiro objeto convertido:', obj);
            }

            return obj;
        });

        console.log('🔧 Inserindo', dbObjects.length, 'objetos no Supabase...');

        const { data, error } = await supabase
            .from('collaborators')
            .insert(dbObjects)
            .select();

        if (error) {
            console.error('❌ Error adding collaborators:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
            throw error;
        }

        console.log('✅ Dados inseridos com sucesso:', data?.length);
        return data ? data.map(dbToCollaborator) : [];
    },

    // Atualizar um colaborador
    async updateCollaborator(id: string, updates: Partial<Collaborator>): Promise<Collaborator> {
        const dbObject = collaboratorToDb(updates as Collaborator);
        delete dbObject.id; // Não atualizar o ID

        const { data, error } = await supabase
            .from('collaborators')
            .update(dbObject)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating collaborator:', error);
            throw error;
        }

        return dbToCollaborator(data);
    },

    // Deletar um colaborador
    async deleteCollaborator(id: string): Promise<void> {
        const { error } = await supabase
            .from('collaborators')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting collaborator:', error);
            throw error;
        }
    },

    // Deletar todos os colaboradores (útil para limpar antes de nova importação)
    async deleteAllCollaborators(): Promise<void> {
        const { error } = await supabase
            .from('collaborators')
            .delete()
            .gte('id', 0); // Delete all rows (id >= 0)

        if (error) {
            console.error('Error deleting all collaborators:', error);
            throw error;
        }
    },

    // Buscar colaborador por CPF
    async getCollaboratorByCpf(cpf: string): Promise<Collaborator | null> {
        const { data, error } = await supabase
            .from('collaborators')
            .select('*')
            .eq('cpf', cpf)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return null;
            }
            console.error('Error fetching collaborator by CPF:', error);
            throw error;
        }

        return data ? dbToCollaborator(data) : null;
    },
};
