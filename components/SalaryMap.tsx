import React, { useState, useMemo } from 'react';
import { SalarySlip, Employee } from '../types';
import { formatCurrency, exportToExcel, formatDate } from '../utils';
import { Printer, Download, Search, Calendar, Filter, FileText, Building2, X, FileJson, FileSpreadsheet, ChevronRight, CheckSquare, Square } from 'lucide-react';

interface SalaryMapProps {
  payroll: SalarySlip[];
  employees: Employee[];
}

const SalaryMap: React.FC<SalaryMapProps> = ({ payroll, employees }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [isPrintMode, setIsPrintMode] = useState(false);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const mapData = useMemo(() => {
      const data: any[] = [];
      const filteredEmployees = selectedEmployeeId === 'ALL' ? employees : employees.filter(e => e.id === selectedEmployeeId);

      filteredEmployees.forEach((emp, idx) => {
          const slip = payroll.find(p => p.employeeId === emp.id) || {
              employeeId: emp.id,
              employeeName: emp.name,
              employeeRole: emp.role,
              baseSalary: emp.baseSalary,
              allowances: 0,
              bonuses: 0,
              absences: 0,
              advances: 0,
              subsidies: 0,
              subsidyTransport: emp.subsidyTransport || 0,
              subsidyFood: emp.subsidyFood || 0,
              subsidyFamily: emp.subsidyFamily || 0,
              subsidyHousing: emp.subsidyHousing || 0,
              grossTotal: emp.baseSalary,
              inss: emp.baseSalary * 0.03,
              irt: 0,
              netTotal: emp.baseSalary * 0.97
          } as SalarySlip;

          data.push({
              index: idx + 1,
              name: emp.name,
              idNumber: emp.biNumber || emp.nif,
              nif: emp.nif,
              inssNo: emp.ssn || '000000',
              province: emp.province || 'LUANDA',
              municipality: emp.municipality || 'BELAS',
              admission: emp.admissionDate,
              endDate: emp.terminationDate || '---',
              daysBase: 30,
              vctBase: emp.baseSalary,
              faltasDias: 0,
              faltasValor: 0,
              feriasDias: 0,
              feriasValor: 0,
              horasPerdidas: 0,
              horasPerdidasVal: 0,
              horasExtra: 0,
              horasExtraVal: 0,
              subTransport: slip.subsidyTransport || emp.subsidyTransport || 0,
              subFood: slip.subsidyFood || emp.subsidyFood || 0,
              subNatal: emp.subsidyChristmas || 0,
              subFeriasVal: emp.subsidyVacation || 0,
              subAlojamento: emp.subsidyHousing || 0,
              subFamilia: slip.subsidyFamily || emp.subsidyFamily || 0,
              subOutros: emp.otherSubsidies || 0,
              ajudasCusto: emp.allowances || 0,
              acertos: emp.salaryAdjustments || 0,
              penalizacoes: emp.penalties || 0,
              vencAntesImp: slip.grossTotal,
              tribInss: slip.grossTotal,
              tribIrt: slip.grossTotal - slip.inss,
              irtIsento: 0,
              irtNSujeito: 0,
              irtSujeito: slip.grossTotal - slip.inss,
              inss8: slip.grossTotal * 0.08,
              inss3: slip.inss,
              irt: slip.irt,
              net: slip.netTotal,
              profession: emp.professionName || emp.role
          });
      });
      return data;
  }, [employees, payroll, selectedEmployeeId]);

  const totals = mapData.reduce((acc, row) => ({
      baseSalary: acc.baseSalary + row.vctBase,
      gross: acc.gross + row.vencAntesImp,
      inss: acc.inss + row.inss3,
      irt: acc.irt + row.irt,
      net: acc.net + row.net,
      inss8: acc.inss8 + row.inss8
  }), { baseSalary: 0, gross: 0, inss: 0, irt: 0, net: 0, inss8: 0 });

  const f = (n: number) => formatCurrency(n).replace('Kz', '').trim();

  const handleDownloadXML = () => {
      alert("A gerar ficheiro Modelo 2 - IRT (AGT XML)...");
  };

  const handleDownloadINSS = () => {
      const exportData = mapData.map(r => ({
          'Nº': r.index,
          'Nome': r.name,
          'Contribuinte': r.idNumber,
          'Venc. Base': r.vctBase,
          'INSS (3%)': r.inss3,
          'Total Bruto': r.vencAntesImp
      }));
      exportToExcel(exportData, `Mapa_INSS_${months[selectedMonth-1]}_${selectedYear}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20 overflow-x-hidden">
        {isPrintMode && (
             <div className="fixed inset-0 bg-white z-[100] overflow-auto p-10 animate-in zoom-in-95">
                <div className="flex justify-between items-start mb-8 border-b-4 border-slate-900 pb-4">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Mapa Analítico de Salários</h1>
                    <div className="text-right">
                        <p className="font-bold text-slate-600 uppercase">{months[selectedMonth - 1]} de {selectedYear}</p>
                        <button onClick={() => setIsPrintMode(false)} className="mt-4 bg-white border-b-4 border-slate-400 text-slate-700 px-4 py-1 font-bold text-xs uppercase tracking-widest print:hidden">Fechar</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-[8px] border-collapse min-w-[2000px]">
                        <thead>
                            <tr className="bg-slate-100 font-bold border-y border-slate-400 text-center uppercase">
                                <th className="p-1 border-r" rowSpan={2}>No Identificação</th>
                                <th className="p-1 border-r" rowSpan={2}>Exercício</th>
                                <th className="p-1 border-r" rowSpan={2}>Data Vínculo</th>
                                <th className="p-1 border-r" colSpan={2}>Vencimento Base</th>
                                <th className="p-1 border-r" colSpan={2}>Faltas</th>
                                <th className="p-1 border-r" colSpan={2}>Férias</th>
                                <th className="p-1 border-r" colSpan={2}>Horas Perdidas</th>
                                <th className="p-1 border-r" colSpan={2}>Horas Extra</th>
                                <th className="p-1 border-r" colSpan={7}>Subsídios</th>
                                <th className="p-1 border-r" colSpan={3}>Outros</th>
                                <th className="p-1 border-r" colSpan={3}>Vencimentos</th>
                                <th className="p-1 border-r" colSpan={3}>Venc Tributável IRT</th>
                                <th className="p-1 border-r" colSpan={3}>Impostos</th>
                                <th className="p-1" rowSpan={2}>Vencimento Líquido</th>
                            </tr>
                            <tr className="bg-slate-50 border-b border-slate-400 text-[7px]">
                                {/* Venc Base */}
                                <th className="p-1 border-r">Dias</th><th className="p-1 border-r">Valor</th>
                                {/* Faltas */}
                                <th className="p-1 border-r">Dias</th><th className="p-1 border-r">Valor</th>
                                {/* Ferias */}
                                <th className="p-1 border-r">Dias</th><th className="p-1 border-r">Valor</th>
                                {/* Hrs Perd */}
                                <th className="p-1 border-r">Hrs</th><th className="p-1 border-r">Valor</th>
                                {/* Hrs Extra */}
                                <th className="p-1 border-r">Hrs</th><th className="p-1 border-r">Valor</th>
                                {/* Subsidios */}
                                <th className="p-1 border-r">Transp</th><th className="p-1 border-r">Alim</th><th className="p-1 border-r">Natal</th><th className="p-1 border-r">Val Férias</th><th className="p-1 border-r">Aloj</th><th className="p-1 border-r">Família</th><th className="p-1 border-r">Outros</th>
                                {/* Outros */}
                                <th className="p-1 border-r">Ajudas</th><th className="p-1 border-r">Acertos</th><th className="p-1 border-r">Penaliz</th>
                                {/* Vencimentos */}
                                <th className="p-1 border-r">Antes Imp</th><th className="p-1 border-r">Trib INSS</th><th className="p-1 border-r">Trib IRT</th>
                                {/* IRT */}
                                <th className="p-1 border-r">Isento</th><th className="p-1 border-r">N/Suj</th><th className="p-1 border-r">Suj</th>
                                {/* Impostos */}
                                <th className="p-1 border-r">INSS 8%</th><th className="p-1 border-r">INSS 3%</th><th className="p-1 border-r">IRT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mapData.map(r => (
                                <tr key={r.index} className="text-center border-b">
                                    <td className="p-1 border-r text-left font-bold">{r.name}<br/><span className="text-[6px] text-slate-400">{r.idNumber} | {r.inssNo}</span></td>
                                    <td className="p-1 border-r">{r.province}<br/>{r.municipality}</td>
                                    <td className="p-1 border-r">{r.admission}<br/>{r.endDate}</td>
                                    {/* Venc Base */}
                                    <td className="p-1 border-r">{r.daysBase}</td><td className="p-1 border-r">{f(r.vctBase)}</td>
                                    {/* Faltas */}
                                    <td className="p-1 border-r">{r.faltasDias}</td><td className="p-1 border-r">{f(r.faltasValor)}</td>
                                    {/* Ferias */}
                                    <td className="p-1 border-r">{r.feriasDias}</td><td className="p-1 border-r">{f(r.feriasValor)}</td>
                                    {/* Hrs Perd */}
                                    <td className="p-1 border-r">{r.horasPerdidas}</td><td className="p-1 border-r">{f(r.horasPerdidasVal)}</td>
                                    {/* Hrs Extra */}
                                    <td className="p-1 border-r">{r.horasExtra}</td><td className="p-1 border-r">{f(r.horasExtraVal)}</td>
                                    {/* Subsidios */}
                                    <td className="p-1 border-r">{f(r.subTransport)}</td><td className="p-1 border-r">{f(r.subFood)}</td><td className="p-1 border-r">{f(r.subNatal)}</td><td className="p-1 border-r">{f(r.subFeriasVal)}</td><td className="p-1 border-r">{f(r.subAlojamento)}</td><td className="p-1 border-r">{f(r.subFamilia)}</td><td className="p-1 border-r">{f(r.subOutros)}</td>
                                    {/* Outros */}
                                    <td className="p-1 border-r">{f(r.ajudasCusto)}</td><td className="p-1 border-r">{f(r.acertos)}</td><td className="p-1 border-r">{f(r.penalizacoes)}</td>
                                    {/* Vencimentos */}
                                    <td className="p-1 border-r">{f(r.vencAntesImp)}</td><td className="p-1 border-r">{f(r.tribInss)}</td><td className="p-1 border-r">{f(r.tribIrt)}</td>
                                    {/* IRT */}
                                    <td className="p-1 border-r">{f(r.irtIsento)}</td><td className="p-1 border-r">{f(r.irtNSujeito)}</td><td className="p-1 border-r">{f(r.irtSujeito)}</td>
                                    {/* Impostos */}
                                    <td className="p-1 border-r">{f(r.inss8)}</td><td className="p-1 border-r">{f(r.inss3)}</td><td className="p-1 border-r font-bold text-red-600">{f(r.irt)}</td>
                                    <td className="p-1 font-black">{f(r.net)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-8 pt-4 border-t-2 border-slate-800 grid grid-cols-2 text-xs font-bold">
                    <div>
                        <p className="text-slate-400 uppercase text-[10px] mb-4 font-black">Valores Totais mensais</p>
                        <div className="flex gap-4">
                             <div className="flex items-center gap-2"><Square size={12}/> Anexo Guias de Pagamento</div>
                             <div className="flex items-center gap-2"><Square size={12}/> Anexo Comprovativos Pagamento</div>
                        </div>
                        <div className="mt-8">
                             <p className="text-lg font-black uppercase text-slate-800">MAPA GERAL SALARIOS IRT/INSS</p>
                             <p className="text-sm font-bold text-slate-500 uppercase">{months[selectedMonth - 1]} de {selectedYear}</p>
                        </div>
                    </div>
                    <div className="space-y-1 text-right">
                        <div className="flex justify-end gap-12 border-b pb-1">
                            <span className="text-slate-500 uppercase">Total Salários a Liquidar</span>
                            <span className="font-black text-slate-900">{f(totals.net)} akz</span>
                        </div>
                        <div className="flex justify-end gap-12 border-b pb-1">
                            <span className="text-slate-500 uppercase">Total Imposto IRT a pagar</span>
                            <span className="font-black text-slate-900">{f(totals.irt)} akz</span>
                        </div>
                        <div className="flex justify-end gap-12">
                            <span className="text-slate-500 uppercase">Total Imposto INSS a pagar</span>
                            <span className="font-black text-slate-900">{f(totals.inss + totals.inss8)} akz</span>
                        </div>
                    </div>
                </div>
             </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Exercício Fiscal</label>
                    <select className="w-full border p-2 rounded-xl font-bold bg-slate-50" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mês de Processamento</label>
                    <select className="w-full border p-2 rounded-xl font-bold bg-slate-50" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                        {months.map((m, i) => <option key={i} value={i + 1}>{m.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <button onClick={handleDownloadINSS} className="bg-white border-b-4 border-blue-600 hover:bg-slate-50 text-slate-800 px-4 py-2.5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition transform active:scale-95">
                    <FileSpreadsheet size={16}/> Baixar INSS (XLS)
                </button>
                <button onClick={handleDownloadXML} className="bg-white border-b-4 border-blue-600 hover:bg-slate-50 text-slate-800 px-4 py-2.5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition transform active:scale-95">
                    <FileJson size={16}/> Baixar AGT (XML)
                </button>
                <button onClick={() => setIsPrintMode(true)} className="bg-white border-b-4 border-blue-600 hover:bg-slate-50 text-slate-900 px-4 py-2.5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition transform active:scale-95">
                    <Printer size={16}/> Imprimir
                </button>
            </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-black text-xs text-slate-600 uppercase tracking-[2px]">Mapa Geral Salários - Estrutura de Gestão</h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{mapData.length} Colaboradores</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-[9px] text-left border-collapse min-w-[1500px]">
                    <thead className="bg-slate-900 text-white font-black uppercase tracking-widest">
                        <tr>
                            <th className="p-3 border-r border-slate-800">No Identificação</th>
                            <th className="p-3 border-r border-slate-800">Vencimento Base</th>
                            <th className="p-3 border-r border-slate-800">Subsídios</th>
                            <th className="p-3 border-r border-slate-800">Vencimentos</th>
                            <th className="p-3 border-r border-slate-800">Venc Trib. IRT</th>
                            <th className="p-3 border-r border-slate-800">Impostos</th>
                            <th className="p-3 bg-blue-800 text-center">Vencimento Líquido</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {mapData.map((row, i) => (
                            <tr key={i} className="hover:bg-blue-50 transition-colors">
                                <td className="p-3 border-r font-bold">
                                    <div className="text-slate-800">{row.name}</div>
                                    <div className="text-[8px] text-slate-400">{row.idNumber}</div>
                                </td>
                                <td className="p-3 border-r">
                                    <div className="flex justify-between"><span>Base:</span> <span className="font-mono">{f(row.vctBase)}</span></div>
                                </td>
                                <td className="p-3 border-r">
                                    <div className="grid grid-cols-2 gap-x-4">
                                        <div className="flex justify-between text-[8px]"><span>Transp:</span> <span>{f(row.subTransport)}</span></div>
                                        <div className="flex justify-between text-[8px]"><span>Alim:</span> <span>{f(row.subFood)}</span></div>
                                        <div className="flex justify-between text-[8px]"><span>Natal:</span> <span>{f(row.subNatal)}</span></div>
                                        <div className="flex justify-between text-[8px]"><span>Férias:</span> <span>{f(row.subFeriasVal)}</span></div>
                                    </div>
                                </td>
                                <td className="p-3 border-r">
                                    <div className="flex justify-between"><span>Antes Imp:</span> <span className="font-mono">{f(row.vencAntesImp)}</span></div>
                                </td>
                                <td className="p-3 border-r font-bold text-slate-700">
                                    <div className="flex justify-between"><span>Suj:</span> <span>{f(row.irtSujeito)}</span></div>
                                </td>
                                <td className="p-3 border-r text-red-600">
                                    <div className="flex justify-between text-[8px]"><span>INSS 3%:</span> <span>{f(row.inss3)}</span></div>
                                    <div className="flex justify-between font-bold"><span>IRT:</span> <span>{f(row.irt)}</span></div>
                                </td>
                                <td className="p-3 text-center font-black text-blue-800 bg-blue-50/50 text-xs">{f(row.net)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-black border-t-2 border-slate-200">
                        <tr>
                            <td className="p-3 uppercase text-slate-400 border-r">TOTAIS</td>
                            <td className="p-3 border-r text-right">{f(totals.baseSalary)}</td>
                            <td className="p-3 border-r"></td>
                            <td className="p-3 border-r text-right">{f(totals.gross)}</td>
                            <td className="p-3 border-r"></td>
                            <td className="p-3 border-r text-right text-red-600">{f(totals.irt)}</td>
                            <td className="p-3 text-center text-blue-900 text-sm">{f(totals.net)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>
  );
};

export default SalaryMap;