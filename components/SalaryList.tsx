import React, { useMemo } from 'react';
import { Employee, Company } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Printer, Download, ArrowLeft, TrendingUp, Users, Calendar, Table, ShieldCheck } from 'lucide-react';

interface SalaryListProps {
  employees: Employee[];
  onBack: () => void;
}

const SalaryList: React.FC<SalaryListProps> = ({ employees, onBack }) => {
  const activeEmployees = useMemo(() => employees.filter(e => e.status === 'Active'), [employees]);
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const formattedDate = today.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

  const salaryData = useMemo(() => {
    return activeEmployees.map(emp => {
      const admission = new Date(emp.admissionDate);
      const diffTime = Math.abs(today.getTime() - admission.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const helps = (emp.allowances || 0) + (emp.subsidyHousing || 0) + (emp.subsidyFamily || 0);
      const total = emp.baseSalary + helps;

      return {
        idnf: emp.idnf || emp.id.substring(0,4).toUpperCase(),
        admission: emp.admissionDate,
        tenure: diffDays,
        name: emp.name,
        role: emp.role,
        location: 'Obra Generica',
        base: emp.baseSalary,
        helps: helps,
        total: total
      };
    });
  }, [activeEmployees, today]);

  const totalVencimentos = salaryData.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="p-8 bg-[#f1f5f9] min-h-screen animate-in fade-in flex flex-col font-sans text-slate-900">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold px-4 py-2 border rounded-lg transition-all shadow-sm bg-white">
          <ArrowLeft size={18}/> Voltar
        </button>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-black transition flex items-center gap-2">
            <Printer size={16}/> Imprimir Listagem
          </button>
        </div>
      </div>

      <div id="print-area-salary-list" className="bg-white p-12 shadow-2xl rounded-sm border border-slate-200 min-h-[297mm]">
        <div className="text-center mb-10 pb-6 border-b-4 border-slate-900">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">LISTAGEM DE TRABALHADORES ACTIVOS POR VENCIMENTO</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">
                Listagem emitida em {formattedDate} | Exercício de {currentYear}
            </p>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-black uppercase tracking-tighter border-y-2 border-slate-900">
                    <tr>
                        <th className="p-3 border-r">IDNF</th>
                        <th className="p-3 border-r">Data Admissão</th>
                        <th className="p-3 border-r">Antiguidade Dias</th>
                        <th className="p-3 border-r">Nome Funcionário</th>
                        <th className="p-3 border-r">Profissão</th>
                        <th className="p-3 border-r">Posto</th>
                        <th className="p-3 text-right border-r">Salário Base</th>
                        <th className="p-3 text-right border-r">Ajudas Custo</th>
                        <th className="p-3 text-right bg-blue-50 text-blue-900 font-black">VCT TOTAL</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-bold">
                    {salaryData.length === 0 ? (
                        <tr className="h-10">
                            <td className="p-3 border-r">.</td>
                            <td className="p-3 border-r">.</td>
                            <td className="p-3 border-r">.</td>
                            <td className="p-3 border-r">.</td>
                            <td className="p-3 border-r">.</td>
                            <td className="p-3 border-r">Obra Generica</td>
                            <td className="p-3 text-right border-r">0,00</td>
                            <td className="p-3 text-right border-r">0,00</td>
                            <td className="p-3 text-right bg-blue-50/30">0,00</td>
                        </tr>
                    ) : (
                        salaryData.map((row, i) => (
                            <tr key={i} className="hover:bg-blue-50/30 transition-colors h-12">
                                <td className="p-3 border-r font-mono text-blue-800">{i + 1}</td>
                                <td className="p-3 border-r font-mono text-slate-500">{formatDate(row.admission)}</td>
                                <td className="p-3 border-r text-slate-400 italic">{row.tenure} dias</td>
                                <td className="p-3 border-r uppercase text-slate-800">{row.name}</td>
                                <td className="p-3 border-r uppercase text-slate-500">{row.role}</td>
                                <td className="p-3 border-r uppercase text-slate-400">{row.location}</td>
                                <td className="p-3 text-right border-r font-mono">{formatCurrency(row.base).replace('Kz','')}</td>
                                <td className="p-3 text-right border-r font-mono">{formatCurrency(row.helps).replace('Kz','')}</td>
                                <td className="p-3 text-right bg-blue-50/50 text-blue-900 font-black font-mono">{formatCurrency(row.total).replace('Kz','')}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        <div className="mt-12 flex justify-end">
            <div className="bg-slate-900 text-white p-8 rounded-none border-l-8 border-blue-600 shadow-xl min-w-[400px] space-y-4">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-blue-400" size={24}/>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total de Vencimentos</span>
                    </div>
                    <span className="text-2xl font-black font-mono">{formatCurrency(totalVencimentos)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Users className="text-emerald-400" size={24}/>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trabalhadores Activos</span>
                    </div>
                    <span className="text-2xl font-black font-mono">{activeEmployees.length}</span>
                </div>
            </div>
        </div>

        <div className="mt-20 pt-10 border-t-2 border-slate-100 flex justify-between items-center text-[9px] font-mono text-slate-400 italic">
            <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-900 opacity-20"/>
                <span>Processado por computador | Software Certificado nº 25/AGT/2019</span>
            </div>
            <span>Página 1 de 1</span>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          body * { visibility: hidden; }
          #print-area-salary-list, #print-area-salary-list * { visibility: visible; }
          #print-area-salary-list {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            padding: 10mm;
            border: none;
            box-shadow: none;
          }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default SalaryList;