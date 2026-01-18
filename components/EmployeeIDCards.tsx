
import React, { useState, useMemo } from 'react';
import { Employee } from '../types';
import { formatDate } from '../utils';
import { 
  ArrowLeft, Search, Printer, User, Filter, 
  CheckSquare, Square, Download, Contact2, ImageIcon
} from 'lucide-react';

interface EmployeeIDCardsProps {
  employees: Employee[];
  onBack: () => void;
}

const EmployeeIDCards: React.FC<EmployeeIDCardsProps> = ({ employees, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const s = searchTerm.toLowerCase();
      return (
        emp.name.toLowerCase().includes(s) ||
        (emp.employeeNumber && emp.employeeNumber.toLowerCase().includes(s)) ||
        (emp.role && emp.role.toLowerCase().includes(s))
      );
    });
  }, [employees, searchTerm]);

  const toggleSelectAll = () => {
    if (selectedEmpIds.size === filteredEmployees.length) {
      setSelectedEmpIds(new Set());
    } else {
      setSelectedEmpIds(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedEmpIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEmpIds(next);
  };

  const handlePrint = () => {
    if (selectedEmpIds.size === 0) return alert("Selecione pelo menos um funcionário.");
    window.print();
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <p className="text-[11px] font-medium text-slate-500 mb-1">Home / Área Reservada / Recursos Humanos / Cartões</p>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Contact2 className="text-blue-600"/> Impressão de Cartões de Funcionário
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="bg-white border-b-4 border-slate-400 text-slate-700 px-4 py-2 font-bold text-xs uppercase flex items-center gap-2 hover:bg-slate-50 transition shadow-sm">
            <ArrowLeft size={16}/> VOLTAR
          </button>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2.5 rounded font-black uppercase text-[11px] tracking-widest shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Printer size={18}/> IMPRIMIR SELECIONADOS ({selectedEmpIds.size})
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-slate-50/50">
            <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                <input 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                    placeholder="Pesquisar por nome, número de agente ou profissão..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 shrink-0">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-2 hover:bg-slate-50">
                    <Filter size={14}/> Filtrar Local
                </button>
                <button onClick={toggleSelectAll} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 flex items-center gap-2 hover:bg-slate-50">
                    {selectedEmpIds.size === filteredEmployees.length ? <CheckSquare size={14}/> : <Square size={14}/>} Selecionar Todos
                </button>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#003366] text-white font-bold uppercase text-[11px]">
              <tr>
                <th className="p-4 w-10 text-center border-r border-white/10"></th>
                <th className="p-4 w-24 border-r border-white/10">Agente Nº</th>
                <th className="p-4 w-16 text-center border-r border-white/10">Foto</th>
                <th className="p-4 border-r border-white/10">Nome do Funcionário</th>
                <th className="p-4 border-r border-white/10">Profissão</th>
                <th className="p-4 border-r border-white/10">Local de Trabalho</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmpIds.has(emp.id);
                return (
                  <tr 
                    key={emp.id} 
                    className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={() => toggleSelect(emp.id)}
                  >
                    <td className="p-4 text-center border-r border-slate-100">
                      <div className="flex justify-center">
                        {isSelected ? <CheckSquare size={18} className="text-blue-600"/> : <Square size={18} className="text-slate-300"/>}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-600 border-r border-slate-100">{emp.employeeNumber || '---'}</td>
                    <td className="p-2 border-r border-slate-100 text-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center overflow-hidden">
                            {emp.photoUrl ? (
                                <img src={emp.photoUrl} className="w-full h-full object-cover" alt="Foto"/>
                            ) : <ImageIcon size={18} className="text-slate-300"/>}
                        </div>
                    </td>
                    <td className="p-4 font-bold text-slate-800 border-r border-slate-100 uppercase">{emp.name}</td>
                    <td className="p-4 text-slate-600 border-r border-slate-100 uppercase font-medium">{emp.role}</td>
                    <td className="p-4 text-slate-500 border-r border-slate-100 text-xs font-bold uppercase italic">Obra Geral / Central</td>
                    <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${emp.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                            {emp.status === 'Active' ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-900 text-white p-6 rounded-none border-b-8 border-blue-600 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-6">
              <div className="p-4 bg-white/10 rounded-2xl">
                  <Contact2 size={40} className="text-blue-400"/>
              </div>
              <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Preparar Lote de Impressão</h3>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">
                      {selectedEmpIds.size} funcionários selecionados para emissão de cartões PVC/Papel
                  </p>
              </div>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-white text-blue-900 px-10 py-4 font-black uppercase text-xs tracking-[3px] shadow-xl hover:bg-blue-50 transition transform active:scale-95"
          >
              Gerar Ficheiro para Impressora
          </button>
      </div>

      <style>{`
        @media print {
            body * { visibility: hidden; }
            /* Aqui adicionaremos os estilos dos cartões reais no futuro */
            .print-area { visibility: visible; }
            @page { size: A4; margin: 10mm; }
        }
      `}</style>
    </div>
  );
};

export default EmployeeIDCards;
