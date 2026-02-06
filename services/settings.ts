import { supabase } from './supabaseClient';

export interface Setting {
    id: string;
    category: 'cargo' | 'empresa' | 'cnpj' | 'lotacao';
    value: string;
}

export const settingsService = {
    async getSettings(category?: string) {
        let query = supabase.from('settings').select('*').order('value');
        if (category) {
            query = query.eq('category', category);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data as Setting[];
    },

    async addSetting(category: string, value: string) {
        const { data, error } = await supabase
            .from('settings')
            .insert([{ category, value }])
            .select()
            .single();
        if (error) throw error;
        return data as Setting;
    },

    async deleteSetting(id: string) {
        const { error } = await supabase.from('settings').delete().eq('id', id);
        if (error) throw error;
    }
};
