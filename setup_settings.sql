-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('cargo', 'empresa', 'cnpj', 'lotacao')),
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (category, value)
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow read/write for all authenticated - adjust as needed for production)
CREATE POLICY "Enable read access for all users" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON public.settings FOR DELETE USING (true);

-- Seed Initial Data
INSERT INTO public.settings (category, value) VALUES
-- LOTAÇÃO
('lotacao', '88'), ('lotacao', '167'), ('lotacao', '302'), ('lotacao', '353'), ('lotacao', '380'), ('lotacao', '616'), 
('lotacao', '1105'), ('lotacao', 'CAUCAIA'), ('lotacao', 'COMERCIAL'), ('lotacao', 'COMPRAS'), ('lotacao', 'CONTROLE INTERNO'), 
('lotacao', 'DIRETORIA'), ('lotacao', 'E-COMMERCE'), ('lotacao', 'ESTOQUE'), ('lotacao', 'EUSÉBIO'), ('lotacao', 'FINANCEIRO'), 
('lotacao', 'GIA'), ('lotacao', 'INFRA AG_ESTRUTURA'), ('lotacao', 'MARACANAU'), ('lotacao', 'MKT'), ('lotacao', 'ONLINE'), 
('lotacao', 'PACAJUS'), ('lotacao', 'RH'), ('lotacao', 'SERVIÇOS GERAIS'), ('lotacao', 'SUPER. PREVENÇÃO'), ('lotacao', 'TI'),
('lotacao', 'KENEDDY'), ('lotacao', 'PARANGABA'),

-- CARGO
('cargo', 'ANALISTA ADMINISTRATIVO'), ('cargo', 'ANALISTA COMERCIAL'), ('cargo', 'ANALISTA DE COMPRAS'), ('cargo', 'ANALISTA DE ESTOQUE'), 
('cargo', 'ANALISTA DE MKT'), ('cargo', 'ANALISTA DE RH'), ('cargo', 'ANALISTA DE TI'), ('cargo', 'ASSISTENTE COMERCIAL'), 
('cargo', 'ASSISTENTE DE COMPRAS'), ('cargo', 'ASSISTENTE DE DP'), ('cargo', 'ASSISTENTE DE E-COMMERCE'), ('cargo', 'ASSISTENTE DE MARKETING'), 
('cargo', 'ASSISTENTE DE RH'), ('cargo', 'ASSISTENTE DE TI'), ('cargo', 'ASSISTENTE FINANCEIRO'), ('cargo', 'AUXILIAR DE MIDIAS SOCIAIS'), 
('cargo', 'COORD COMERCIAL'), ('cargo', 'COORD DE DHO'), ('cargo', 'COORD ESTOQUE'), ('cargo', 'COORD MKT'), 
('cargo', 'COORDENADOR DE COMPRAS'), ('cargo', 'COORDENADORA FINANCEIRA'), ('cargo', 'DIRETORA DE CRIACAO'), ('cargo', 'DIRETORIA'), 
('cargo', 'ELETRICISTA'), ('cargo', 'ESTAGIÁRIA DE MARKETING'), ('cargo', 'ESTOQUISTA'), ('cargo', 'FISCAL DE LOJA'), 
('cargo', 'GERENTE DE LOJA'), ('cargo', 'MOTORISTA'), ('cargo', 'OPERADOR DE LOJA'), ('cargo', 'OPERADOR(A) DE CAIXA'), 
('cargo', 'REPOSITOR (A)'), ('cargo', 'SERVICOS GERAIS'), ('cargo', 'SOCIAL MEDIA'), ('cargo', 'SUPERVISOR (A) DE PREVENÇÃO DE PERDAS'), 
('cargo', 'VENDEDOR (A)'), ('cargo', 'OPERADOR DE CFTV'), ('cargo', 'SUPERVISOR DE LOGISTICA'), ('cargo', 'ASSISTENTE DE VENDA'), 
('cargo', 'OPERADOR DE LOJA(FISCAL)'),

-- EMPRESA
('empresa', 'CAPRI COMERCIO DE COSMETICOS LTDA'), ('empresa', 'GIRASSOL COMERCIO DE COSMETICOS LTDA'), ('empresa', 'LELE COMERCIO DE COSMETICOS LTDA'), 
('empresa', 'LOTUS COMERCIO DE MAQUIAGENS LTDA'), ('empresa', 'MARBELA COMERCIO DE MAQUIAGENS LTDA'), ('empresa', 'MIL OPCOES COMERCIO DE BIJUTERIAS EIRELI'), 
('empresa', 'MINA COMERCIO DE MAQUIAGENS LTDA'), ('empresa', 'ORQUIDEA COMERCIO DE COSMETICOS LTDA'), ('empresa', 'PEROLA COMERCIO DE MAQUIAGENS LTDA'), 
('empresa', 'PETRA COMERCIO DE COSMETICOS LTDA'), ('empresa', 'TULIPA COMERCIO DE COSMETICOS LTDA'),

-- CNPJ
('cnpj', '01.488.884/0001-38'), ('cnpj', '01.488.884/0002-19'), ('cnpj', '02.913.639/0001-93'), ('cnpj', '07.426.677/0001-35'), 
('cnpj', '07.426.677/0002-16'), ('cnpj', '08.757.598/0001-70'), ('cnpj', '10.776.567/0001-08'), ('cnpj', '28.751.661/0001-78'), 
('cnpj', '28.751.661/0002-59'), ('cnpj', '35.066.638/0001-00'), ('cnpj', '35.066.638/0002-90'), ('cnpj', '35.066.638/0003-71'), 
('cnpj', '48.716.156/0001-08'), ('cnpj', '48.716.156/0002-80'), ('cnpj', '49.204.943/0001-25'), ('cnpj', '49.204.943/0002-26'), 
('cnpj', '50.992.758/0001-21'), ('cnpj', '58.000.500/0001-03'), ('cnpj', '48.716.156/0005-23')
ON CONFLICT (category, value) DO NOTHING;
