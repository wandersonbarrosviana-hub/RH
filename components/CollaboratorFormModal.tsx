import React, { useState, useEffect, useMemo } from 'react';
import type { Collaborator } from '../types';

interface CollaboratorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (collaborator: Collaborator) => void;
    collaborator: Collaborator | null;
    options: { cargos: string[] };
}

const initialFormState: Omit<Collaborator, 'id'> = {
    data: '', lotacao: '', nome: '', cargo: '', admissao: '', niver: '', cpf: '',
    empresa: '', cnpj: '', salarioBase: '', quebraDeCaixa: '', salarioBaseComQuebra: '',
    adiantamento: 0, salarioFamilia: '', difCaixa: '', planoSaude: '', odonto: '',
    inss: '', irrf: '', fgts: '', vale: '', pensao: '', consignado: '',
    primeiraParcela13: '', segundaParcela13: '', salarioLiquido: 0, falta: '', dsr: '',
    atestados: '', folgas: '', diasTrabalhadosBase: '30', diasTrabalhados: '', vt: '', va: '', beneficio: '',
    observacoes: '', seguroDeVida: '',
};

const parse = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string' || !value) return 0;
    let parsableString = String(value).replace(/[^\d.,-]+/g, '');
    const lastComma = parsableString.lastIndexOf(',');
    if (lastComma > -1) {
        parsableString = parsableString.replace(/\./g, '').replace(',', '.');
    }
    return parseFloat(parsableString) || 0;
};

const calculateInss = (baseSalary: number): number => {
    const ceiling = 8157.41;
    const salary = Math.min(baseSalary, ceiling);

    if (salary <= 1518.00) {
        return salary * 0.075;
    }
    if (salary <= 2793.88) {
        return (salary * 0.09) - 22.77;
    }
    if (salary <= 4190.83) {
        return (salary * 0.12) - 106.59;
    }
    return (salary * 0.14) - 190.40;
};

const InputField: React.FC<{ label: string; name: keyof Collaborator; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; step?: string, readOnly?: boolean, disabled?: boolean, list?: string }> = ({ label, name, value, onChange, type = 'text', placeholder, step, readOnly = false, disabled = false, list }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            step={step}
            readOnly={readOnly}
            disabled={disabled}
            list={list}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm ${readOnly || disabled ? 'bg-gray-100' : ''}`}
        />
    </div>
);

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <fieldset className="border-t border-gray-200 pt-5 mt-5">
        <legend className="text-lg font-semibold text-pink-600 px-2">{title}</legend>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mt-4">
            {children}
        </div>
    </fieldset>
);

const CollaboratorFormModal: React.FC<CollaboratorFormModalProps> = ({ isOpen, onSave, onClose, collaborator, options }) => {
    const [formData, setFormData] = useState<Partial<Collaborator>>(initialFormState);

    useEffect(() => {
        if (collaborator) {
            setFormData(collaborator);
        } else {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const formattedToday = `${year}-${month}-${day}`;
            setFormData({ ...initialFormState, data: formattedToday });
        }
    }, [collaborator]);
    
    // Automatic calculations
    useEffect(() => {
        const isOperadorCaixa = formData.cargo?.trim().toLowerCase() === 'operador de caixa';
        
        const salarioBase = parse(formData.salarioBase);
        const quebraDeCaixa = isOperadorCaixa ? salarioBase * 0.10 : 0;
        const baseCalculo = salarioBase + quebraDeCaixa;

        const diasTrabalhadosBase = parse(formData.diasTrabalhadosBase) || 30;
        const faltas = parse(formData.falta);
        const dsr = parse(formData.dsr);
        const diasEfetivos = diasTrabalhadosBase - faltas - dsr;
        
        // Automatic Calculations
        const inss = calculateInss(baseCalculo);
        const fgts = baseCalculo * 0.08;
        const vt = 10.8 * (diasEfetivos > 0 ? diasEfetivos : 0);
        const va = 16.5 * (diasEfetivos > 0 ? diasEfetivos : 0);
        const beneficio = vt + va;
        const adiantamento = baseCalculo * 0.47;
        
        // Net Salary Calculation
        const remuneracaoProporcional = diasTrabalhadosBase > 0 ? (baseCalculo / diasTrabalhadosBase) * (diasEfetivos > 0 ? diasEfetivos : 0) : 0;

        const salarioFamilia = parse(formData.salarioFamilia);
        const difCaixa = parse(formData.difCaixa);
        const planoSaude = parse(formData.planoSaude);
        const odonto = parse(formData.odonto);
        const irrf = parse(formData.irrf);
        const vale = parse(formData.vale);
        const consignado = parse(formData.consignado);

        const totalProventos = remuneracaoProporcional + salarioFamilia;
        const totalDescontos = difCaixa + adiantamento + planoSaude + odonto + inss + irrf + vale + consignado;

        const salarioLiquido = totalProventos - totalDescontos;
        
        setFormData(prev => ({
            ...prev,
            quebraDeCaixa: isOperadorCaixa ? quebraDeCaixa.toFixed(2) : '',
            adiantamento,
            salarioLiquido,
            inss: inss.toFixed(2),
            fgts: fgts.toFixed(2),
            diasTrabalhados: String(diasEfetivos),
            vt: vt.toFixed(2),
            va: va.toFixed(2),
            beneficio: beneficio.toFixed(2)
        }));

    }, [
        formData.cargo, formData.salarioBase, formData.falta, formData.dsr, formData.diasTrabalhadosBase,
        formData.salarioFamilia, formData.difCaixa, formData.planoSaude, 
        formData.odonto, formData.irrf, formData.vale, formData.consignado
    ]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumberInput = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumberInput && value !== '' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Collaborator);
    };

    const formTitle = useMemo(() => collaborator ? 'Editar Colaborador' : 'Adicionar Novo Colaborador', [collaborator]);
    const isOperadorCaixa = formData.cargo?.trim().toLowerCase() === 'operador de caixa';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10 pb-10 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl transform transition-all">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold leading-6 text-gray-900">{formTitle}</h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <FormSection title="Informações Pessoais e Contrato">
                            <div className="sm:col-span-3"><InputField label="Data do Registro" name="data" value={formData.data || ''} onChange={handleChange} type="date" /></div>
                            <div className="sm:col-span-3"><InputField label="Nome Completo" name="nome" value={formData.nome || ''} onChange={handleChange} /></div>
                            <div className="sm:col-span-3">
                                <InputField label="Cargo" name="cargo" value={formData.cargo || ''} onChange={handleChange} list="cargos-list" />
                                <datalist id="cargos-list">
                                    {options.cargos.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                            <div className="sm:col-span-3"><InputField label="CPF" name="cpf" value={formData.cpf || ''} onChange={handleChange} placeholder="000.000.000-00" /></div>
                            <div className="sm:col-span-3"><InputField label="Data de Admissão" name="admissao" value={formData.admissao || ''} onChange={handleChange} type="date" /></div>
                            <div className="sm:col-span-3"><InputField label="Aniversário" name="niver" value={formData.niver || ''} onChange={handleChange} type="date" /></div>
                            <div className="sm:col-span-2"><InputField label="Empresa" name="empresa" value={formData.empresa || ''} onChange={handleChange} /></div>
                            <div className="sm:col-span-2"><InputField label="CNPJ" name="cnpj" value={formData.cnpj || ''} onChange={handleChange} placeholder="00.000.000/0001-00"/></div>
                            <div className="sm:col-span-2"><InputField label="Lotação" name="lotacao" value={formData.lotacao || ''} onChange={handleChange} /></div>
                        </FormSection>

                        <FormSection title="Detalhes Salariais">
                            <div className="sm:col-span-2"><InputField label="Salário Base" name="salarioBase" value={formData.salarioBase || ''} onChange={handleChange} /></div>
                            <div className="sm:col-span-2"><InputField label="Quebra de Caixa" name="quebraDeCaixa" value={formData.quebraDeCaixa || ''} onChange={handleChange} readOnly={isOperadorCaixa} disabled={!isOperadorCaixa} /></div>
                            <div className="sm:col-span-2"><InputField label="Salário Família" name="salarioFamilia" value={formData.salarioFamilia || ''} onChange={handleChange} /></div>
                            <div className="sm:col-span-2"><InputField label="Dias Trabalhados (Base)" name="diasTrabalhadosBase" value={formData.diasTrabalhadosBase || ''} onChange={handleChange} type="number" /></div>
                            <div className="sm:col-span-2"><InputField label="Faltas (dias)" name="falta" value={formData.falta || ''} onChange={handleChange} type="number" /></div>
                            <div className="sm:col-span-2"><InputField label="DSR (dias)" name="dsr" value={formData.dsr || ''} onChange={handleChange} type="number" /></div>
                            <div className="sm:col-span-2"><InputField label="Dias Efetivos" name="diasTrabalhados" value={formData.diasTrabalhados || ''} onChange={handleChange} type="number" readOnly /></div>
                            <div className="sm:col-span-2"><InputField label="Diferença Caixa" name="difCaixa" value={formData.difCaixa || ''} onChange={handleChange} /></div>
                            <div className="sm:col-span-2"><InputField label="Adiantamento (47%)" name="adiantamento" value={formData.adiantamento || 0} onChange={handleChange} type="number" step="0.01" readOnly /></div>
                            <div className="sm:col-span-3"><InputField label="Salário Líquido" name="salarioLiquido" value={formData.salarioLiquido || 0} onChange={handleChange} type="number" step="0.01" readOnly /></div>
                        </FormSection>

                        <FormSection title="Descontos e Benefícios">
                            <div className="sm:col-span-2"><InputField label="Plano de Saúde" name="planoSaude" value={formData.planoSaude || ''} onChange={handleChange} /></div>
                            <div className="sm:col-span-2"><InputField label="Odonto" name="odonto" value={formData.odonto || ''} onChange={handleChange} /></div>
                            <div className="sm:col-span-2"><InputField label="Seguro de Vida" name="seguroDeVida" value={formData.seguroDeVida || ''} onChange={handleChange} /></div>
                            <div className="sm:col-span-2"><InputField label="INSS" name="inss" value={formData.inss || ''} onChange={handleChange} readOnly /></div>
                            <div className="sm:col-span-2"><InputField label="IRRF" name="irrf" value={formData.irrf || ''} onChange={handleChange} /></div>
                            <div className="sm:col-span-2"><InputField label="FGTS" name="fgts" value={formData.fgts || ''} onChange={handleChange} readOnly /></div>
                            <div className="sm:col-span-2"><InputField label="Vale (Consignado)" name="vale" value={formData.vale || ''} onChange={handleChange} /></div>
                            <div className="sm:col-span-2"><InputField label="Pensão" name="pensao" value={formData.pensao || ''} onChange={handleChange} /></div>
                            <div className="sm:col-span-2"><InputField label="VT" name="vt" value={formData.vt || ''} onChange={handleChange} readOnly /></div>
                            <div className="sm:col-span-2"><InputField label="VA" name="va" value={formData.va || ''} onChange={handleChange} readOnly /></div>
                            <div className="sm:col-span-2"><InputField label="Benefício (VT+VA)" name="beneficio" value={formData.beneficio || ''} onChange={handleChange} readOnly /></div>
                        </FormSection>
                        
                        <FormSection title="Outras Informações">
                            <div className="sm:col-span-6">
                                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações</label>
                                <textarea name="observacoes" id="observacoes" rows={3} value={formData.observacoes || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"></textarea>
                            </div>
                        </FormSection>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 text-right space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CollaboratorFormModal;