import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config Check:');
console.log('  URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
console.log('  Key:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida');

if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = 'Variáveis de ambiente do Supabase não encontradas. Certifique-se de que o arquivo .env.local existe e o servidor foi reiniciado.';
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
}

console.log('✅ Criando cliente Supabase...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
    global: {
        headers: {
            'Content-Type': 'application/json',
        },
    },
});

console.log('✅ Cliente Supabase criado com sucesso');
