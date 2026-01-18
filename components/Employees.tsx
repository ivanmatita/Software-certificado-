import React, { useState, useMemo, useEffect } from 'react';
import { Employee, WorkLocation, Profession } from '../types';
import { generateId, formatCurrency, calculateINSS, calculateIRT, formatDate } from '../utils';
import { supabase } from '../services/supabaseClient';
import { 
  Users, UserPlus, Search, Filter, Printer, FileText, Trash2, Edit2, Eye, Ban, CheckCircle, 
  MapPin, Phone, Mail, Calendar, CreditCard, Building2, ChevronDown, ChevronUp, X, Save, Upload, User, 
  RefreshCw, Database, AlertCircle, Info, Settings, Ruler, Gavel, Wallet, Gift, FileSignature, 
  UserCheck, UserMinus, MoreVertical, Calculator, ChevronRight, List, Briefcase, Plus, PlusCircle,
  ArrowLeft, Loader2, Home, Hash, ClipboardList, Clock, Sparkles, Coffee, Download, ChevronLeft,
  ImageIcon
} from 'lucide-react';

interface EmployeesProps {
  employees: Employee[];
  onSaveEmployee: (emp: Employee) => void;
  workLocations: WorkLocation[];
  professions: Profession[];
  onIssueContract?: (emp: Employee) => void; 
}

const INSS_INDEXED_PROFESSIONS = [
    { code: '1', name: 'Químico' },
    { code: '2', name: 'Químico - Especialista em Química Orgânica' },
    { code: '3', name: 'Químico - Especialista em Química Inorgânica' },
    { code: '4', name: 'Químico - Especialista em Química-Física' },
    { code: '5', name: 'Químico - Especialista em Química Analítica' },
    { code: '6', name: 'Outros Químicos' },
    { code: '7', name: 'Físico' },
    { code: '8', name: 'Físico - Especialista em Mecânica' },
    { code: '9', name: 'Físico - Especialista em Termodinâmica' },
    { code: '10', name: 'Físico - Especialista em Óptica' },
    { code: '11', name: 'Físico - Especialista em Acústica' },
    { code: '12', name: 'Físico - Especialista em Electricidade e Magnetismo' },
    { code: '13', name: 'Físico - Especialista em Electrónica' },
    { code: '14', name: 'Físico - Especialista em Energia Nuclear' },
    { code: '15', name: 'Físico - Especialista do Estado Sólido' },
    { code: '16', name: 'Físico - Especialista em Física Atómica e Molecular' },
    { code: '17', name: 'Outros Físicos' },
    { code: '18', name: 'Geofísico' },
    { code: '19', name: 'Geólogo' },
    { code: '20', name: 'Hidro-Geólogo' },
    { code: '21', name: 'Oceanógrafo' },
    { code: '22', name: 'Meteorologista' },
    { code: '23', name: 'Astrónomo' },
    { code: '31', name: 'Arquitecto' },
    { code: '34', name: 'Engenheiro Civil' },
    { code: '45', name: 'Engenheiro Electrotécnico' },
    { code: '51', name: 'Engenheiro Mecânico' },
    { code: '74', name: 'Desenhador em Geral' },
    { code: '102', name: 'Piloto de Avião' },
    { code: '160', name: 'Médico - Clínica Geral' },
    { code: '176', name: 'Médico Legista' }
];

const LOCAL_STORAGE_PROFS_KEY = 'imatec_profissoes_locais';

const Employees: React.FC<EmployeesProps> = ({ employees, onSaveEmployee, workLocations, professions, onIssueContract }) => {
  const [view, setView] = useState<'LIST' | 'FORM' | 'CLASSIFIER_LIST' | 'CLASSIFIER_FORM'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [internalProfessions, setInternalProfessions] = useState<Profession[]>([]);
  const [editingInternalProf, setEditingInternalProf] = useState<Profession | null>(null);
  const [profFormData, setProfFormData] = useState<Partial<Profession>>({
    baseSalary: 0,
    complement: 0,
    indexedProfessionName: 'NA - Aguarda Profissão'
  });

  const [formData, setFormData] = useState<Partial<Employee>>({
    status: 'Active',
    contractType: 'Determinado',
    gender: 'M',
    maritalStatus: 'Solteiro'
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    fiscal: false,
    professional: false,
    subsidies: false,
    others: false
  });

  const [showInssModal, setShowInssModal] = useState(false);
  const [inssSearch, setInssSearch] = useState('');

  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(depts);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const name = emp.name.toLowerCase();
      const sTerm = searchTerm.toLowerCase();
      const matchesSearch = name.includes(sTerm) || 
                           (emp.employeeNumber && emp.employeeNumber.toLowerCase().includes(sTerm)) ||
                           (emp.biNumber && emp.biNumber.toLowerCase().includes(sTerm));
      
      const matchesStatus = statusFilter === 'ALL' || 
                           (statusFilter === 'ACTIVE' && emp.status === 'Active') ||
                           (statusFilter === 'INACTIVE' && emp.status !== 'Active');
      
      const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
      
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [employees, searchTerm, statusFilter, deptFilter]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const ensureUUID = (id: string): string => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) return id;
    const hex = id.split('').map(c => c.charCodeAt(0).toString(16)).join('').padEnd(32, '0').substring(0, 32);
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(12, 15)}-a${hex.slice(15, 18)}-${hex.slice(18, 30)}`;
  };

  useEffect(() => {
    fetchEmployeesCloud();
    fetchInternalProfessions();
  }, []);

  async function fetchInternalProfessions() {
    setIsLoadingCloud(true);
    setSyncWarning(null);
    try {
      const { data, error } = await supabase.from('profissoes_internas').select('*').order('created_at', { ascending: false });
      
      if (error) throw error;

      if (data) {
        const mapped: Profession[] = data.map(p => ({
          id: p.id,
          code: p.codigo_inss || '',
          name: p.nome_profissao,
          indexedProfessionName: p.profissao_inss,
          indexedProfessionCode: p.codigo_inss,
          baseSalary: Number(p.salario_base || 0),
          complement: Number(p.ajudas_custo || 0),
          createdAt: p.created_at,
          userName: p.created_by || 'Admin',
          category: 'Interna'
        }));
        setInternalProfessions(mapped);
        localStorage.setItem(LOCAL_STORAGE_PROFS_KEY, JSON.stringify(mapped));
      }
    } catch (e: any) {
      console.warn("Cloud connection issue, using local cache:", e.message);
      setSyncWarning("Ligação Cloud instável. A utilizar cache local.");
      const local = localStorage.getItem(LOCAL_STORAGE_PROFS_KEY);
      if (local) setInternalProfessions(JSON.parse(local));
    } finally {
      setIsLoadingCloud(false);
    }
  }

  async function fetchEmployeesCloud() {
    setIsLoadingCloud(true);
    try {
      const { data, error } = await supabase.from('funcionarios').select('*').order('nome', { ascending: true });
      if (error) throw error;
      if (data) {
        data.forEach(f => {
          const mapped: Employee = {
            id: f.id,
            employeeNumber: f.employee_number,
            name: f.nome,
            nif: f.nif,
            biNumber: f.bi_number,
            ssn: f.ssn,
            role: f.cargo,
            category: f.categoria,
            department: f.departamento,
            baseSalary: Number(f.salario_base || 0),
            status: (f.status === 'Active' || f.status === 'Terminated' || f.status === 'OnLeave') ? f.status : 'Active',
            admissionDate: f.data_admissao,
            terminationDate: f.data_demissao,
            email: f.email,
            phone: f.telefone,
            bankAccount: f.conta_bancaria,
            bankName: f.nome_banco,
            iban: f.iban,
            photoUrl: f.foto_url,
            contractType: f.tipo_contrato as any,
            subsidyTransport: Number(f.subs_transporte || 0),
            subsidyTransportStart: f.subs_transporte_inicio,
            subsidyTransportEnd: f.subs_transporte_fim,
            subsidyFood: Number(f.subs_alimentacao || 0),
            subsidyFoodStart: f.subs_alimentacao_inicio,
            subsidyFoodEnd: f.subs_alimentacao_fim,
            subsidyFamily: Number(f.subs_familia || 0),
            subsidyFamilyStart: f.subs_familia_inicio,
            subsidyFamilyEnd: f.subs_familia_fim,
            subsidyHousing: Number(f.subs_habitacao || 0),
            subsidyHousingStart: f.subs_habitacao_inicio,
            subsidyHousingEnd: f.subs_habitacao_fim,
            subsidyChristmas: Number(f.subs_natal || 0),
            subsidyChristmasStart: f.subs_natal_inicio,
            subsidyChristmasEnd: f.subs_natal_fim,
            subsidyVacation: Number(f.subs_ferias || 0),
            subsidyVacationStart: f.subs_ferias_inicio,
            subsidyVacationEnd: f.subs_ferias_fim,
            subsidyExtra: 0,
            subsidyExtraStart: undefined,
            subsidyExtraEnd: undefined,
            allowances: Number(f.abonos || 0),
            allowancesStart: f.abonos_inicio,
            allowancesEnd: f.abonos_fim,
            advances: Number(f.adiantamentos || 0),
            advancesStart: f.adiantamentos_inicio,
            advancesEnd: f.adiantamentos_fim,
            gender: f.genero as any,
            birthDate: f.data_nascimento,
            maritalStatus: f.estado_civil as any,
            nationality: f.nacionalidade,
            address: f.endereco,
            municipio: f.municipio,
            bairro: f.bairro,
            workLocationId: f.work_location_id,
            companyId: f.empresa_id,
            performanceScore: f.performance_score,
            turnoverRisk: f.turnover_risk
          };
          onSaveEmployee(mapped);
        });
      }
    } catch (err) {
      console.error("Erro ao carregar Funcionários Cloud:", err);
    } finally {
      setIsLoadingCloud(false);
    }
  }

  const handleCreate = () => {
    setFormData({
      status: 'Active',
      contractType: 'Determinado',
      gender: 'M',
      maritalStatus: 'Solteiro',
      admissionDate: new Date().toISOString().split('T')[0],
      subsidyTransport: 0,
      subsidyFood: 0,
      subsidyFamily: 0,
      subsidyHousing: 0,
      subsidyChristmas: 0,
      subsidyVacation: 0,
      subsidyExtra: 0,
      allowances: 0,
      advances: 0
    });
    setView('FORM');
  };

  const handleEdit = (emp: Employee) => {
    setFormData(emp);
    setView('FORM');
    setIsActionModalOpen(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.nif || !formData.baseSalary) {
        alert("Preencha campos obrigatórios: Nome, NIF, Salário Base");
        return;
    }

    setIsLoadingCloud(true);
    try {
        const empId = formData.id || generateId();
        const empObj: Employee = {
            ...formData as Employee,
            id: empId,
            baseSalary: Number(formData.baseSalary),
            status: formData.status || 'Active',
            admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0],
        };

        const { error } = await supabase.from('funcionarios').upsert({
            id: ensureUUID(empId),
            nome: empObj.name,
            nif: empObj.nif,
            bi_number: empObj.biNumber,
            ssn: empObj.ssn,
            cargo: empObj.role,
            departamento: empObj.department,
            salario_base: empObj.baseSalary,
            status: empObj.status,
            data_admissao: empObj.admissionDate,
            email: empObj.email,
            telefone: empObj.phone,
            genero: empObj.gender,
            data_nascimento: empObj.birthDate,
            estado_civil: empObj.maritalStatus,
            nacionalidade: empObj.nationality,
            endereco: empObj.address,
            municipio: empObj.municipality,
            bairro: empObj.neighborhood,
            work_location_id: ensureUUID(empObj.workLocationId || ''), 
            empresa_id: '00000000-0000-0000-0000-000000000001',
            tipo_contrato: empObj.contractType,
            employee_number: empObj.employeeNumber,
            subs_transporte: Number(empObj.subsidyTransport || 0),
            subs_transporte_inicio: empObj.subsidyTransportStart,
            subs_transporte_fim: empObj.subsidyTransportEnd,
            subs_alimentacao: Number(empObj.subsidyFood || 0),
            subs_alimentacao_inicio: empObj.subsidyFoodStart,
            subs_alimentacao_fim: empObj.subsidyFoodEnd,
            subs_familia: Number(empObj.subsidyFamily || 0),
            subs_familia_inicio: empObj.subsidyFamilyStart,
            subs_familia_fim: empObj.subsidyFamilyEnd,
            subs_habitacao: Number(empObj.subsidyHousing || 0),
            subs_habitacao_inicio: empObj.subsidyHousingStart,
            subs_habitacao_fim: empObj.subsidyHousingEnd,
            subs_natal: Number(empObj.subsidyChristmas || 0),
            subs_natal_inicio: empObj.subsidyChristmasStart,
            subs_natal_fim: empObj.subsidyChristmasEnd,
            subs_ferias: Number(empObj.subsidyVacation || 0),
            subs_ferias_inicio: empObj.subsidyVacationStart,
            subs_ferias_fim: empObj.subsidyVacationEnd,
            abonos: Number(empObj.allowances || 0),
            abonos_inicio: empObj.allowancesStart,
            abonos_fim: empObj.allowancesEnd,
            adiantamentos: Number(empObj.advances || 0),
            adiantamentos_inicio: empObj.advancesStart,
            // Fix: Property 'adiantamentos_fim' does not exist on type 'Employee'. Use 'advancesEnd'.
            adiantamentos_fim: empObj.advancesEnd,
            foto_url: empObj.photoUrl,
            categoria: empObj.category
        });

        if (error) throw error;

        onSaveEmployee(empObj);
        setView('LIST');
        alert("Ficha de funcionário sincronizada com sucesso!");
    } catch (err: any) {
        onSaveEmployee(formData as Employee);
        setView('LIST');
        alert("Guardado localmente. Erro na sincronização: " + err.message);
    } finally {
        setIsLoadingCloud(false);
    }
  };

  const handleSaveInternalProfession = async () => {
    if (!profFormData.name || !profFormData.baseSalary || !profFormData.indexedProfessionCode) {
        return alert("Preencha os campos obrigatórios (Código INSS, Nome Interno e Salário Base).");
    }
    
    setIsLoadingCloud(true);
    setSyncWarning(null);
    const profId = editingInternalProf?.id || generateId();
    const indexedName = profFormData.indexedProfessionName || 'NA - Aguarda Profissão';
    const codeInss = profFormData.indexedProfessionCode;

    const profObj: Profession = {
        id: profId,
        code: codeInss,
        name: profFormData.name!,
        indexedProfessionName: indexedName,
        indexedProfessionCode: codeInss,
        baseSalary: Number(profFormData.baseSalary),
        complement: Number(profFormData.complement || 0),
        userName: 'Admin',
        createdAt: new Date().toISOString(),
        category: 'Interna'
    };

    try {
      const payload = {
        id: ensureUUID(profId),
        nome_profissao: profFormData.name, 
        profissao_inss: indexedName,       
        codigo_inss: codeInss,             
        salario_base: Number(profFormData.baseSalary),
        ajudas_custo: Number(profFormData.complement || 0), 
        created_by: 'Admin',
        empresa_id: '00000000-0000-0000-0000-000000000001'
      };

      const { error } = await supabase.from('profissoes_internas').upsert(payload);

      if (error) throw error;

      await fetchInternalProfessions();
      setView('CLASSIFIER_LIST');
      alert("Profissão sincronizada com sucesso!");
      
    } catch (err: any) {
      setSyncWarning("Módulo Cloud indisponível. Dados salvos localmente.");
      
      const local = localStorage.getItem(LOCAL_STORAGE_PROFS_KEY);
      let profs: Profession[] = local ? JSON.parse(local) : [];
      if (editingInternalProf) {
          profs = profs.map(p => p.id === profId ? profObj : p);
      } else {
          profs = [profObj, ...profs];
      }
      localStorage.setItem(LOCAL_STORAGE_PROFS_KEY, JSON.stringify(profs));
      setInternalProfessions(profs);
      setView('CLASSIFIER_LIST');
    } finally {
      setIsLoadingCloud(false);
      setEditingInternalProf(null);
    }
  };

  const handleOpenActions = (emp: Employee) => {
      setSelectedEmployee(emp);
      setIsActionModalOpen(true);
  };

  const renderActionModal = () => {
    if (!selectedEmployee) return null;
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold">Ações: {selectedEmployee.name}</h3>
            <button onClick={() => setIsActionModalOpen(false)}><X size={20}/></button>
          </div>
          <div className="p-4 space-y-2">
            <button onClick={() => handleEdit(selectedEmployee)} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl flex items-center gap-3 border transition-all">
                <Edit2 size={18} className="text-blue-600"/>
                <span className="font-bold text-sm">Editar Ficha</span>
            </button>
            <button className="w-full text-left p-3 hover:bg-slate-50 rounded-xl flex items-center gap-3 border transition-all">
                <Eye size={18} className="text-indigo-600"/>
                <span className="font-bold text-sm">Ver Detalhes</span>
            </button>
            <button className="w-full text-left p-3 hover:bg-red-50 rounded-xl flex items-center gap-3 border border-transparent hover:border-red-100 text-red-600 transition-all">
                <Trash2 size={18}/>
                <span className="font-bold text-sm">Eliminar Registo</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredInssProfessions = useMemo(() => {
    return INSS_INDEXED_PROFESSIONS.filter(p => 
        p.code.includes(inssSearch) || p.name.toLowerCase().includes(inssSearch.toLowerCase())
    );
  }, [inssSearch]);

  const selectInssProfession = (p: any) => {
      setProfFormData(prev => ({ 
          ...prev, 
          indexedProfessionCode: p.code, 
          indexedProfessionName: p.name 
      }));
      setShowInssModal(false);
  };

  const renderClassifierList = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="mb-2">
        <p className="text-[11px] font-medium text-slate-500 mb-2">Home / Recursos Humanos / Classificador Salarial</p>
        <h2 className="text-2xl font-bold text-slate-800">Classificador Salarial</h2>
      </div>

      <div className="flex justify-between items-center gap-4 mb-4">
        <div className="flex gap-2">
          <button onClick={() => setView('LIST')} className="bg-white border-b-4 border-blue-600 text-slate-700 px-4 py-2 font-bold text-xs uppercase flex items-center gap-2 hover:bg-slate-50 transition shadow-sm">
            <ChevronLeft size={16}/> VOLTAR
          </button>
          <button className="bg-white border-b-4 border-blue-600 text-slate-700 px-4 py-2 font-bold text-xs uppercase flex items-center gap-2 hover:bg-slate-50 transition shadow-sm">
            <Filter size={16}/> FILTRAR
          </button>
        </div>
        <button 
          onClick={() => {
            setEditingInternalProf(null);
            setProfFormData({ baseSalary: 0, complement: 0, indexedProfessionName: 'NA - Aguarda Profissão' });
            setView('CLASSIFIER_FORM');
          }}
          className="bg-white border-b-4 border-blue-600 text-slate-700 px-4 py-2 font-bold text-xs uppercase flex items-center gap-2 hover:bg-slate-50 transition shadow-sm"
        >
          <Plus size={16}/> NOVA PROFISSÃO
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#003366] text-white font-bold uppercase text-[11px]">
            <tr>
              <th className="p-4 border-r border-white/10" rowSpan={2}>Data</th>
              <th className="p-4 border-r border-white/10" rowSpan={2}>User</th>
              <th className="p-4 border-r border-white/10" rowSpan={2}>Profissão Interna</th>
              <th className="p-4 border-b border-white/10 text-center" colSpan={2}>Consultar INSS</th>
              <th className="p-4 border-r border-white/10 text-center" rowSpan={2}>Salario Base</th>
              <th className="p-4 border-r border-white/10 text-center" rowSpan={2}>Ajudas Custo Referencia</th>
              <th className="p-4 border-r border-white/10 text-center" rowSpan={2}>Vencimento lliquido</th>
              <th className="p-4 text-center w-24" rowSpan={2}>Opções</th>
            </tr>
            <tr className="bg-slate-800 text-white/80 border-b border-white/10">
                <th className="p-2 border-r border-white/10 text-center w-12">COD</th>
                <th className="p-2 border-r border-white/10 text-center">Profissão Indexada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {internalProfessions.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">{formatDate(p.createdAt || '').replace(/ /g, '-')}</td>
                <td className="p-4 font-bold text-slate-500 uppercase">{p.userName}</td>
                <td className="p-4 font-black text-slate-800 uppercase">{p.name || '.'}</td>
                <td className="p-4 text-center font-bold text-blue-800">{p.indexedProfessionCode}</td>
                <td className="p-4 font-medium text-slate-700">{p.indexedProfessionName}</td>
                <td className="p-4 text-right font-bold">{formatCurrency(p.baseSalary || 0).replace('Kz','')}</td>
                <td className="p-4 text-right font-bold">{formatCurrency(p.complement || 0).replace('Kz','')}</td>
                <td className="p-4 text-right font-black text-slate-900">
                  {formatCurrency((p.baseSalary || 0) + (p.complement || 0)).replace('Kz','')}
                </td>
                <td className="p-4 text-center">
                   <div className="flex justify-center gap-2">
                      <button onClick={() => { setEditingInternalProf(p); setProfFormData(p); setView('CLASSIFIER_FORM'); }} className="text-slate-400 hover:text-blue-600 transition"><Edit2 size={16}/></button>
                      <button onClick={() => window.print()} className="text-slate-400 hover:text-slate-800 transition"><Printer size={16}/></button>
                      <button className="text-slate-400 hover:text-blue-600 transition"><Download size={16}/></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderClassifierForm = () => (
    <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded shadow-2xl border border-slate-300 overflow-hidden">
            <div className="bg-white border-b p-3 flex justify-between items-center">
                <h2 className="w-full text-center text-xl font-medium text-slate-800">Definições da Profissão</h2>
            </div>
            <div className="bg-gradient-to-br from-green-300/40 via-white to-green-300/40 p-10 space-y-6">
                
                <div className="relative">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Profissão Indexada INSS (Obrigatório)</label>
                    <div className="relative flex items-center">
                        <div 
                          className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-green-500 font-medium text-slate-800 cursor-pointer flex justify-between items-center"
                          onClick={() => setShowInssModal(true)}
                        >
                            <span className="truncate">{profFormData.indexedProfessionCode ? `${profFormData.indexedProfessionCode} - ${profFormData.indexedProfessionName}` : 'Consultar Profissões da Segurança Social'}</span>
                            <ChevronRight size={16} className="text-slate-400 shrink-0"/>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nome da Profissão Interna *</label>
                    <input 
                        className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-green-500 font-bold text-slate-700 uppercase"
                        placeholder="Ex: Supervisor de Campo"
                        value={profFormData.name || ''}
                        onChange={e => setProfFormData({...profFormData, name: e.target.value})}
                    />
                </div>

                <div className="relative">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Salário Base *</label>
                    <div className="relative">
                        <input 
                            type="number"
                            className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-green-500 text-right font-black text-slate-700 pr-4"
                            placeholder="00000.00"
                            value={profFormData.baseSalary || ''}
                            onChange={e => setProfFormData({...profFormData, baseSalary: Number(e.target.value)})}
                        />
                    </div>
                </div>

                <div className="relative">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Ajudas de Custo Referência</label>
                    <div className="relative">
                        <input 
                            type="number"
                            className="w-full p-3 border border-slate-300 rounded-xl bg-white/80 shadow-inner outline-none focus:ring-1 focus:ring-green-500 text-right font-black text-slate-500 pr-4"
                            placeholder="00000.00"
                            value={profFormData.complement || ''}
                            onChange={e => setProfFormData({...profFormData, complement: Number(e.target.value)})}
                        />
                    </div>
                </div>

                <div className="pt-6">
                    <button 
                        onClick={handleSaveInternalProfession}
                        disabled={isLoadingCloud}
                        className="w-full bg-white border-b-4 border-blue-600 hover:bg-slate-50 text-blue-700 font-black italic text-xl py-3 rounded-none shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                        {isLoadingCloud ? <Loader2 size={24} className="animate-spin text-blue-600"/> : 'Registar / Guardar'}
                    </button>
                    <button 
                        onClick={() => setView('CLASSIFIER_LIST')}
                        className="w-full text-slate-400 font-bold text-[10px] uppercase mt-4 hover:text-slate-600 transition tracking-widest"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>

        {showInssModal && (
            <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95">
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                        <h3 className="font-bold text-lg uppercase tracking-tight">Profissões da Segurança Social (INSS)</h3>
                        <button onClick={() => setShowInssModal(false)}><X/></button>
                    </div>
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-slate-400" size={20}/>
                            <input 
                                className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="Pesquisar código ou descrição da profissão..."
                                value={inssSearch}
                                onChange={e => setInssSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 divide-y divide-slate-100">
                            {filteredInssProfessions.map(p => (
                                <button 
                                    key={p.code} 
                                    onClick={() => selectInssProfession(p)}
                                    className="p-4 hover:bg-blue-50 text-left flex justify-between items-center group transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">{p.code}</span>
                                        <span className="font-bold text-slate-700">{p.name}</span>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors"/>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in pb-20">
        {renderActionModal()}
        
        {view === 'LIST' ? (
            <>
                <div className="mb-2">
                    <p className="text-[11px] font-medium text-slate-500 mb-2">Home / Recursos Humanos / Funcionários</p>
                    <h2 className="text-2xl font-bold text-slate-800">Gestão de Funcionários</h2>
                </div>

                <div className="flex justify-between items-center gap-4 mb-4">
                    <div className="flex gap-2">
                        <button className="bg-white border-b-4 border-blue-600 text-slate-700 px-4 py-2 font-bold text-xs uppercase flex items-center gap-2 hover:bg-slate-50 transition shadow-sm">
                            <Filter size={16}/> FILTRAR
                        </button>
                        <button 
                          onClick={() => setView('CLASSIFIER_LIST')} 
                          className="bg-white border-b-4 border-blue-600 text-slate-700 px-4 py-2 font-bold text-xs uppercase flex items-center gap-2 hover:bg-slate-50 transition shadow-sm"
                        >
                            <List size={16}/> CLASSIFICADOR
                        </button>
                        <button onClick={fetchEmployeesCloud} className="bg-white border-b-4 border-blue-600 text-slate-700 px-4 py-2 font-bold text-xs uppercase flex items-center gap-2 hover:bg-slate-50 transition shadow-sm">
                            <RefreshCw size={16}/> SINCRONIZAR
                        </button>
                    </div>
                    <button onClick={handleCreate} className="bg-white border-b-4 border-blue-600 text-slate-700 px-4 py-2 font-bold text-xs uppercase flex items-center gap-2 hover:bg-slate-50 transition shadow-sm">
                        <Plus size={16}/> NOVO FUNCIONÁRIO
                    </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden mb-6">
                    <div className="p-3 border-b border-slate-100 flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2 text-slate-400" size={16}/>
                            <input 
                                className="w-full pl-10 p-1.5 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                placeholder="Pesquisar..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white font-bold" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                            <option value="ALL">Departamentos</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-[#003366] text-white font-bold uppercase text-[11px]">
                                <tr>
                                    <th className="p-4 w-10 text-center border-r border-white/10"><input type="checkbox" className="rounded-sm"/></th>
                                    <th className="p-4 w-24 border-r border-white/10">ID/Nº</th>
                                    <th className="p-4 min-w-[200px] border-r border-white/10">Nome do Funcionário</th>
                                    <th className="p-4 border-r border-white/10">Departamento</th>
                                    <th className="p-4 border-r border-white/10">Função</th>
                                    <th className="p-4 border-r border-white/10">Admissão</th>
                                    <th className="p-4 border-r border-white/10 text-right">Salário Base</th>
                                    <th className="p-4 border-r border-white/10 text-center">Estado</th>
                                    <th className="p-4 text-center w-24">Opções</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-center border-r border-slate-100"><input type="checkbox" className="rounded-sm"/></td>
                                        <td className="p-4 font-mono font-bold text-slate-600 border-r border-slate-100">{emp.employeeNumber || '---'}</td>
                                        <td className="p-4 font-bold text-slate-800 border-r border-slate-100">{emp.name}</td>
                                        <td className="p-4 border-r border-slate-100">{emp.department}</td>
                                        <td className="p-4 text-slate-600 border-r border-slate-100">{emp.role}</td>
                                        <td className="p-4 border-r border-slate-100">{emp.admissionDate}</td>
                                        <td className="p-4 text-right font-mono border-r border-slate-100">{formatCurrency(emp.baseSalary).replace('Kz','')}</td>
                                        <td className="p-4 text-center border-r border-slate-100">
                                            <span className="text-[11px] font-medium">{emp.status === 'Active' ? 'Ativo' : 'Inativo'}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleOpenActions(emp)} className="text-slate-400 hover:text-slate-800 transition" title="Visualizar"><Eye size={16}/></button>
                                                <button onClick={() => onIssueContract?.(emp)} className="text-slate-400 hover:text-slate-800 transition" title="Contrato"><FileText size={16}/></button>
                                                <button onClick={() => handleEdit(emp)} className="text-slate-400 hover:text-slate-800 transition" title="Editar"><Edit2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        ) : view === 'FORM' ? (
            <div className="bg-white rounded-none shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-right">
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('LIST')} className="p-2 hover:bg-slate-800 rounded-full transition border border-slate-700"><ArrowLeft/></button>
                        <h2 className="font-black uppercase tracking-widest text-sm">Ficha de Funcionário - Admissão Cloud</h2>
                    </div>
                    <div className="flex gap-3">
                         <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-lg">
                            <span className="text-[9px] font-black uppercase text-slate-400">Data de Admissão</span>
                            <input type="date" className="bg-transparent text-sm font-bold text-white outline-none" value={formData.admissionDate || ''} onChange={e => setFormData({...formData, admissionDate: e.target.value})}/>
                         </div>
                         <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-lg">
                            <span className="text-[9px] font-black uppercase text-slate-400">Agente Nº</span>
                            <input className="bg-transparent text-sm font-bold text-white outline-none w-20" value={formData.employeeNumber || ''} onChange={e => setFormData({...formData, employeeNumber: e.target.value})}/>
                         </div>
                    </div>
                </div>

                <div className="p-6 space-y-4 max-w-6xl mx-auto h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="border border-slate-200 rounded-none overflow-hidden">
                        <button 
                            onClick={() => toggleSection('personal')}
                            className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="font-black text-sm uppercase tracking-tighter">Dados Pessoais e Identificação</span>
                            </div>
                            {expandedSections.personal ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                        </button>
                        
                        {expandedSections.personal && (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo do Funcionário *</label>
                                    <input className="w-full border-2 border-slate-100 p-2.5 rounded-xl font-bold focus:border-blue-500 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Foto de Perfil (URL)</label>
                                    <div className="flex gap-2">
                                        <input className="w-full border-2 border-slate-100 p-2.5 rounded-xl font-medium focus:border-blue-500 outline-none" value={formData.photoUrl || ''} onChange={e => setFormData({...formData, photoUrl: e.target.value})} placeholder="https://..." />
                                        <button className="bg-slate-100 p-2.5 rounded-xl text-slate-500 hover:bg-slate-200"><ImageIcon size={20}/></button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">NIF do Funcionário *</label>
                                    <input className="w-full border-2 border-slate-100 p-2.5 rounded-xl font-mono focus:border-blue-500 outline-none" value={formData.nif || ''} onChange={e => setFormData({...formData, nif: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nº B.I. / Passaporte</label>
                                    <input className="w-full border-2 border-slate-100 p-2.5 rounded-xl font-mono focus:border-blue-500 outline-none" value={formData.biNumber || ''} onChange={e => setFormData({...formData, biNumber: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nº Segurança Social (SSN)</label>
                                    <input className="w-full border-2 border-slate-100 p-2.5 rounded-xl font-mono focus:border-blue-500 outline-none" value={formData.ssn || ''} onChange={e => setFormData({...formData, ssn: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Data de nascimento</label>
                                    <input type="date" className="w-full border-2 border-slate-100 p-2.5 rounded-xl focus:border-blue-500 outline-none" value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Estado Civil</label>
                                    <select className="w-full border-2 border-slate-100 p-2.5 rounded-xl font-bold bg-white" value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value as any})}>
                                        <option value="Solteiro">Solteiro</option>
                                        <option value="Casado">Casado</option>
                                        <option value="Divorciado">Divorciado</option>
                                        <option value="Viuvo">Viuvo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Sexo</label>
                                    <select className="w-full border-2 border-slate-100 p-2.5 rounded-xl font-bold bg-white" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                                        <option value="M">Masculino</option>
                                        <option value="F">Feminino</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border border-slate-200 rounded-none overflow-hidden">
                        <button 
                            onClick={() => toggleSection('professional')}
                            className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                <span className="font-black text-sm uppercase tracking-tighter">Dados Profissionais e Salário</span>
                            </div>
                            {expandedSections.professional ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                        </button>
                        
                        {expandedSections.professional && (
                            <div className="p-6 space-y-6 animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Profissão / Cargo *</label>
                                        <input className="w-full border-2 border-slate-100 p-2.5 rounded-xl font-bold focus:border-blue-500 outline-none" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Categoria Profissional</label>
                                        <input className="w-full border-2 border-slate-100 p-2.5 rounded-xl font-bold focus:border-blue-500 outline-none" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Departamento</label>
                                        <input className="w-full border-2 border-slate-100 p-2.5 rounded-xl font-bold focus:border-blue-500 outline-none" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Salário Base (Bruto) *</label>
                                        <input 
                                            type="number" 
                                            className="w-full border-2 border-slate-100 p-2.5 rounded-xl font-black text-blue-600 focus:border-blue-500 outline-none" 
                                            value={formData.baseSalary || ''} 
                                            onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})} 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setView('LIST')} className="px-8 py-3 border-2 border-slate-200 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition">Cancelar</button>
                        <button onClick={handleSave} disabled={isLoadingCloud} className="px-12 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-blue-500 transition transform active:scale-95 flex items-center gap-2">
                            {isLoadingCloud ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Guardar Funcionário
                        </button>
                    </div>
                </div>
            </div>
        ) : view === 'CLASSIFIER_LIST' ? (
            renderClassifierList()
        ) : renderClassifierForm()}
    </div>
  );
};

// Fix: Missing default export
export default Employees;