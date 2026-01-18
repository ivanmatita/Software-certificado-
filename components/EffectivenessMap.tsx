
import React, { useMemo } from 'react';
import { Employee, AttendanceRecord, Company } from '../types';
import { formatDate } from '../utils';
import { Printer, Download, ArrowLeft, FileText, Landmark, Search } from 'lucide-react';

interface EffectivenessMapProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  company: Company;
  onBack: () => void;
  month: number;
  year: number;
}

const EffectivenessMap: React.FC<EffectivenessMapProps> = ({ employees, attendance, company, onBack, month, year }) => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const effectivenessData = useMemo(() => {
    return employees.map(emp => {
      const empAttendance = attendance.filter(a => {
        const d = new Date(a.date);
        return a.employeeId === emp.id && d.getMonth() + 1 === month && d.getFullYear() === year;
      });

      const servico = empAttendance.filter(a => a.status === 'Servico' || a.status === 'Present').length;
      const folga = empAttendance.filter(a => a.status === 'Folga').length;
      const justificadas = empAttendance.filter(a => a.status === 'FaltaJustificada').length;
      const injustificadas = empAttendance.filter(a => a.status === 'FaltaInjustificada').length;
      const ferias = empAttendance.filter(a => a.status === 'Ferias').length;
      const total = servico + folga + ferias;

      return {
        name: emp.name,
        profession: emp.role,
        nif: emp.nif,
        ssn: emp.ssn,
        servico,
        folga,
        justificadas,
        injustificadas,
        ferias,
        total
      };
    });
  }, [employees, attendance, month, year]);

  return (
    <div className="p-8 bg-white min-h-screen animate-in fade-in flex flex-col font-sans text-slate-900 border border-slate-300">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold px-4 py-2 border rounded-lg transition-all shadow-sm bg-white">
          <ArrowLeft size={18}/> Voltar
        </button>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-black transition flex items-center gap-2">
            <Printer size={16}/> Imprimir Mapa
          </button>
        </div>
      </div>

      <div id="print-area-effectiveness" className="space-y-10">
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-900 text-white rounded-xl shadow-lg"><Landmark size={24}/></div>
                <div>
                   <h1 className="text-xl font-black uppercase tracking-tighter">01 - IDENTIFICAÇÃO DO CONTRIBUINTE</h1>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Informação do Sujeito Passivo</p>
                </div>
             </div>
             <div className="space-y-1 pl-14">
                <p className="text-sm font-bold uppercase"><span className="text-slate-400">Empresa:</span> {company.name || 'IVAN JOSÉ LUCAS MATITA'}</p>
                <p className="text-sm font-mono font-bold"><span className="text-slate-400">NIF:</span> {company.nif || '004972225NE040'}</p>
             </div>
          </div>
          <div className="text-right">
             <h2 className="text-3xl font-black text-slate-300 uppercase tracking-tighter">EFETIVIDADE</h2>
             <p className="text-lg font-black text-blue-900 uppercase">{months[month - 1]} / {year}</p>
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg"><FileText size={24}/></div>
              <div>
                 <h1 className="text-xl font-black uppercase tracking-tighter">02 - LISTAGEM DE TRABALHADORES</h1>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Controlo de Assiduidade Mensal</p>
              </div>
           </div>

           <div className="border-2 border-slate-900 overflow-hidden shadow-xl">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead className="bg-slate-900 text-white font-black uppercase tracking-tighter text-center">
                  <tr>
                    <th className="p-3 border-r border-white/10" rowSpan={2}>Nome do Beneficiário</th>
                    <th className="p-3 border-r border-white/10" rowSpan={2}>Profissão</th>
                    <th className="p-3 border-r border-white/10" rowSpan={2}>NIF</th>
                    <th className="p-3 border-r border-white/10" rowSpan={2}>Nº da INSS</th>
                    <th className="p-3" colSpan={6}>Indicação dos dias</th>
                    <th className="p-3 bg-blue-700" rowSpan={2}>Total</th>
                  </tr>
                  <tr className="bg-slate-800 text-[8px] border-t border-white/10">
                    <th className="p-1 border-r border-white/10">Serviço</th>
                    <th className="p-1 border-r border-white/10">Folga</th>
                    <th className="p-1 border-r border-white/10">Justi.</th>
                    <th className="p-1 border-r border-white/10">Injust.</th>
                    <th className="p-1 border-r border-white/10">Férias</th>
                    <th className="p-1">Full</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-center font-bold">
                  {effectivenessData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors h-10">
                      <td className="p-2 border-r border-slate-300 text-left uppercase pl-4">{row.name}</td>
                      <td className="p-2 border-r border-slate-300 text-left uppercase pl-4">{row.profession}</td>
                      <td className="p-2 border-r border-slate-300 font-mono">{row.nif}</td>
                      <td className="p-2 border-r border-slate-300 font-mono">{row.ssn}</td>
                      <td className="p-2 border-r border-slate-300">{row.servico}</td>
                      <td className="p-2 border-r border-slate-300">{row.folga}</td>
                      <td className="p-2 border-r border-slate-300">{row.justificadas}</td>
                      <td className="p-2 border-r border-slate-300">{row.injustificadas}</td>
                      <td className="p-2 border-r border-slate-300">{row.ferias}</td>
                      <td className="p-2 border-r border-slate-300">0</td>
                      <td className="p-2 bg-blue-50 text-blue-900 font-black">{row.total}</td>
                    </tr>
                  ))}
                  {effectivenessData.length === 0 && (
                      <tr className="h-10">
                          <td className="p-2 border-r border-slate-300">.</td>
                          <td className="p-2 border-r border-slate-300">.</td>
                          <td className="p-2 border-r border-slate-300"></td>
                          <td className="p-2 border-r border-slate-300"></td>
                          <td className="p-2 border-r border-slate-300">0</td>
                          <td className="p-2 border-r border-slate-300">0</td>
                          <td className="p-2 border-r border-slate-300">0</td>
                          <td className="p-2 border-r border-slate-300">0</td>
                          <td className="p-2 border-r border-slate-300">0</td>
                          <td className="p-2 border-r border-slate-300">0</td>
                          <td className="p-2 bg-blue-50 text-blue-900 font-black">0</td>
                      </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>

        <div className="mt-20 pt-10 border-t-2 border-slate-200 flex justify-between items-end text-[8px] font-mono text-slate-400">
           <div>
              <p>Relatório processado por computador | Software IMATEC v2.0</p>
              <p>Data de emissão: {new Date().toLocaleString()}</p>
           </div>
           <div className="text-right uppercase font-bold text-[10px] text-slate-800 w-64 border-t-2 border-slate-900 pt-2 text-center">
              Assinatura do Responsável
           </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area-effectiveness, #print-area-effectiveness * { visibility: visible; }
          #print-area-effectiveness {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
          }
          @page { size: A4 landscape; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default EffectivenessMap;
