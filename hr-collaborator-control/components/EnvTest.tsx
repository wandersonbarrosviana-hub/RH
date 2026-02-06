import React from 'react';

export default function EnvTest() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>🔧 Teste de Variáveis de Ambiente</h1>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                <h3>VITE_SUPABASE_URL:</h3>
                <p style={{ color: supabaseUrl ? 'green' : 'red', fontWeight: 'bold' }}>
                    {supabaseUrl ? `✅ ${supabaseUrl}` : '❌ NÃO DEFINIDA'}
                </p>
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                <h3>VITE_SUPABASE_ANON_KEY:</h3>
                <p style={{ color: supabaseKey ? 'green' : 'red', fontWeight: 'bold' }}>
                    {supabaseKey ? `✅ ${supabaseKey.substring(0, 50)}...` : '❌ NÃO DEFINIDA'}
                </p>
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
                <h3>⚠️ Instruções:</h3>
                <ul>
                    <li>Se ambas estiverem ✅ VERDES: As variáveis estão carregadas</li>
                    <li>Se alguma estiver ❌ VERMELHA: Reinicie o servidor com Ctrl+C e depois <code>npm run dev</code></li>
                </ul>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Todas as variáveis de ambiente:</h3>
                <pre style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '5px', overflow: 'auto' }}>
                    {JSON.stringify(import.meta.env, null, 2)}
                </pre>
            </div>
        </div>
    );
}
