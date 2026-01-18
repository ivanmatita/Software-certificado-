
import React, { useState, useMemo, useRef } from 'react';
import { 
  Employee, HrTransaction, HrVacation, SalarySlip, Profession, 
  Contract, AttendanceRecord, Company, ViewState, CashRegister
} from '../types';
import { 
  generateId, formatCurrency, formatDate 
} from '../utils';
import { 
  Users, ClipboardList, Briefcase, Calculator, Calendar, 
  FileText, Printer, Search, Plus, Trash2, X, Table, User, 
  MoreVertical, RefreshCw, Loader2, CheckCircle, AlertTriangle, 
  Clock, Shield, LayoutDashboard, ChevronDown, ChevronUp, ListCheck, 
  Gavel, HeartHandshake, Eye, Ruler, Gift, Wallet, TrendingUp, CheckSquare, Square, Play, Trash, FileSpreadsheet, ChevronRight, FileCheck, Circle, Info,
  ArrowRight, Filter, Download, DollarSign, ArrowLeft, Contact2
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import SalaryMap from './SalaryMap';
import ProfessionManager from './ProfessionManager';
import Employees from './Employees';
import EffectivenessMap from './EffectivenessMap';
import SalaryList from './SalaryList';

// --- COMPONENTES AUXILIARES ---

interface AttendanceGridProps {
  emp: Employee;
  processingMonth: number;
  processingYear: number;
  months: string[];
  onCancel: () => void;
  onConfirm: (attData: Record<number, string>) => void;
}

const AttendanceGrid: React.FC<AttendanceGridProps> = ({ emp, processingMonth, processingYear, months, onCancel, onConfirm }) => {
    const [attData, setAttData] = useState<Record<number, string>>({});
    const daysInMonth = new Date(processingYear, processingMonth, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    const handleSelectDayType = (day: number, type: string) => {
        setAttData(prev => ({ ...prev, [day]: type }));
    };

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#f8f9fa] rounded-none shadow-2xl w-[98vw] max-h-[95vh] overflow-auto border-2 border-slate-400 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-12">
                        <div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase">IDNF</p>
                            <p className="text-2xl font-black text-slate-800">{emp.idnf || emp.id.substring(0,4).toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase">Nome</p>
                            <p className="text-2xl font-black text-slate-800 uppercase italic">{emp.name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-red-600 font-bold text-sm">[ Admitido em {formatDate(emp.admissionDate)} ]</p>
                        <p className="text-xl font-black text-slate-700 mt-2">{months[processingMonth - 1]} {processingYear}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[10px]">
                        <thead>
                            <tr className="bg-white">
                                <th className="border border-slate-300 w-48"></th>
                                {days.map(d => {
                                    const dateObj = new Date(processingYear, processingMonth - 1, d);
                                    return (
                                        <th key={d} className="border border-slate-300 p-1 text-center min-w-[30px]">
                                            <div className="font-bold text-slate-500">{dayNames[dateObj.getDay()]}</div>
                                            <div className="font-black text-blue-800 text-sm">{d}</div>
                                        </th>
                                    );
                                })}
                                <th className="border border-slate-300 p-1 text-center w-12 font-bold text-slate-500 bg-slate-100 uppercase tracking-tighter">Full</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Admissão/Demissão', key: 'adm', color: 'bg-white' },
                                { label: 'Folga', key: 'folga', color: 'bg-green-500', isRadio: true },
                                { label: 'Serviço', key: 'servico', color: 'bg-green-500', isRadio: true },
                                { label: 'Justificadas', key: 'just', color: 'bg-white', isRadio: true },
                                { label: 'Injustificadas', key: 'injust', color: 'bg-white', isRadio: true },
                                { label: 'Férias', key: 'ferias', color: 'bg-white', isRadio: true },
                                { label: 'Horas Extra', key: 'extra', color: 'bg-white', isManual: true },
                                { label: 'Horas Perdidas', key: 'perdidas', color: 'bg-white', isManual: true, textRed: true },
                                { label: 'Local de Serviço', key: 'local', color: 'bg-white', isManual: true },
                                { label: 'Alimentação', key: 'alim', color: 'bg-green-100', isManual: true, empty: true },
                                { label: 'Transporte', key: 'transp', color: 'bg-green-100', isManual: true, empty: true },
                            ].map((row, rIdx) => (
                                <tr key={rIdx} className={`${row.color} hover:opacity-90`}>
                                    <td className={`border border-slate-300 p-1 font-bold ${row.textRed ? 'text-red-600' : 'text-slate-700'} ${rIdx > 8 ? 'pl-4' : ''}`}>
                                        {rIdx === 9 ? <span className="text-[8px] font-bold block mb-[-4px]">Subsídios</span> : null}
                                        {rIdx === 3 ? <span className="text-[8px] font-bold block mb-[-4px]">Faltas</span> : null}
                                        {row.label}
                                    </td>
                                    {days.map(d => (
                                        <td key={d} className="border border-slate-300 p-0 text-center align-middle h-8">
                                            {row.isRadio ? (
                                                <div className="flex items-center justify-center">
                                                    <div 
                                                        className={`w-4 h-4 rounded-full border-2 border-slate-400 flex items-center justify-center cursor-pointer bg-white`}
                                                        onClick={() => handleSelectDayType(d, row.key)}
                                                    >
                                                        {attData[d] === row.key && (
                                                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : row.isManual ? (
                                                <input className="w-full h-full bg-transparent text-center border-none focus:ring-0 font-bold" defaultValue={row.empty ? '' : (row.key === 'local' ? '1' : '00')} placeholder={row.empty ? '...' : ''} />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border-2 border-slate-200 mx-auto bg-slate-50"></div>
                                            )}
                                        </td>
                                    ))}
                                    <td 
                                        className="border border-slate-300 p-0 text-center bg-slate-100 cursor-pointer hover:bg-slate-200" 
                                        onClick={() => {
                                            const newAtt = { ...attData };
                                            days.forEach(d => { newAtt[d] = row.key; });
                                            setAttData(newAtt);
                                        }}
                                    >
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-400 mx-auto bg-white flex items-center justify-center">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-auto pt-8 flex justify-end gap-2">
                    <button onClick={onCancel} className="px-6 py-2 bg-slate-50 border-b-4 border-slate-400 text-slate-700 font-bold uppercase hover:bg-slate-100 transition shadow-sm">Cancelar</button>
                    <button 
                        onClick={() => onConfirm(attData)} 
                        className="px-16 py-2 bg-white border-b-4 border-blue-600 text-slate-800 font-bold text-lg hover:shadow-lg transition"
                    >
                        Processar
                    </button>
                </div>
            </div>
        </div>
    );
};

interface SalaryReceiptProps {
    data: any;
    months: string[];
    onClose: () => void;
    onProcess: (processedData: any) => void;
    company: Company;
}

const SalaryReceipt: React.FC<SalaryReceiptProps> = ({ data, months, onClose, onProcess, company }) => {
    const [localData, setLocalData] = useState({
        baseSalary: data.baseSalary || 100000,
        complement: data.complement || 30000,
        abatimento: data.abatimento || -10489.51,
        hoursExtra: 0,
        hoursLost: 0,
        subFerias: 0,
        subNatal: 0,
        abonoFam: 1222,
        subTransp: 0,
        subAlim: 0,
        subAlojamento: 22333,
        arredondar: 143100
    });

    const [isFinalized, setIsFinalized] = useState(false);

    const vencIliquido = localData.baseSalary + localData.complement + localData.abatimento + localData.hoursExtra - localData.hoursLost;
    const totalSubsidios = localData.subFerias + localData.subNatal + localData.abonoFam + localData.subTransp + localData.subAlim + localData.subAlojamento;
    const totalAntesImpostos = vencIliquido + totalSubsidios;
    const valorPagar = totalAntesImpostos; 

    const { emp } = data;

    const ReceiptA4 = ({ label }: { label: string }) => (
        <div className="bg-white border-2 border-slate-800 p-8 w-[210mm] min-h-[148mm] relative flex flex-col font-serif text-[11px]">
            <div className="absolute top-4 right-4 bg-slate-900 text-white px-3 py-1 font-bold text-[10px] uppercase">{label}</div>
            <div className="flex justify-between mb-8 border-b-2 border-black pb-4">
                <div className="space-y-1">
                    <h1 className="text-lg font-black uppercase">{company.name}</h1>
                    <p className="text-[10px] text-slate-500">NIF: {company.nif} • {company.address}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-lg font-black uppercase">Recibo de Salário</h2>
                    <p className="font-bold text-slate-600 uppercase">{months[data.month - 1]} / {data.year}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-4 border border-slate-200">
                <div className="space-y-1">
                    <p><span className="font-black uppercase text-[9px] text-slate-400">Funcionário:</span> <span className="font-bold uppercase text-sm">{emp.name}</span></p>
                    <p><span className="font-black uppercase text-[9px] text-slate-400">Cargo:</span> <span className="font-medium">{emp.role}</span></p>
                    <p><span className="font-black uppercase text-[9px] text-slate-400">NIF:</span> <span className="font-mono">{emp.nif}</span></p>
                </div>
                <div className="text-right space-y-1">
                    <p><span className="font-black uppercase text-[9px] text-slate-400">Admissão:</span> <span className="font-medium">{formatDate(emp.admissionDate)}</span></p>
                    <p><span className="font-black uppercase text-[9px] text-slate-400">Processamento:</span> <span className="font-medium">Mensal</span></p>
                </div>
            </div>

            <div className="flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-900 font-black uppercase text-[9px]">
                            <th className="py-2">Cód</th>
                            <th className="py-2">Descrição da Verba</th>
                            <th className="py-2 text-right">Quantidade</th>
                            <th className="py-2 text-right">Vencimentos</th>
                            <th className="py-2 text-right">Descontos</th>
                        </tr>
                    </thead>
                    <tbody className="font-bold">
                        <tr className="border-b border-slate-100">
                            <td className="py-2">01</td>
                            <td className="py-2 uppercase">Vencimento Base</td>
                            <td className="py-2 text-right">30 Dias</td>
                            <td className="py-2 text-right">{formatCurrency(localData.baseSalary).replace('Kz','')}</td>
                            <td className="py-2 text-right"></td>
                        </tr>
                        {localData.complement > 0 && (
                            <tr className="border-b border-slate-100">
                                <td className="py-2">02</td>
                                <td className="py-2 uppercase">Complemento Salarial</td>
                                <td className="py-2 text-right"></td>
                                <td className="py-2 text-right">{formatCurrency(localData.complement).replace('Kz','')}</td>
                                <td className="py-2 text-right"></td>
                            </tr>
                        )}
                        {localData.abatimento !== 0 && (
                            <tr className="border-b border-slate-100">
                                <td className="py-2">03</td>
                                <td className="py-2 uppercase text-red-600">Abatimento de Faltas</td>
                                <td className="py-2 text-right text-red-600">{data.hoursAbsence || 4}d</td>
                                <td className="py-2 text-right"></td>
                                <td className="py-2 text-right text-red-600">{formatCurrency(Math.abs(localData.abatimento)).replace('Kz','')}</td>
                            </tr>
                        )}
                         {localData.abonoFam > 0 && (
                            <tr className="border-b border-slate-100">
                                <td className="py-2">06</td>
                                <td className="py-2 uppercase">Abono de Família</td>
                                <td className="py-2 text-right"></td>
                                <td className="py-2 text-right">{formatCurrency(localData.abonoFam).replace('Kz','')}</td>
                                <td className="py-2 text-right"></td>
                            </tr>
                        )}
                        {localData.subAlojamento > 0 && (
                            <tr className="border-b border-slate-100">
                                <td className="py-2">10</td>
                                <td className="py-2 uppercase">Subsídio Alojamento</td>
                                <td className="py-2 text-right"></td>
                                <td className="py-2 text-right">{formatCurrency(localData.subAlojamento).replace('Kz','')}</td>
                                <td className="py-2 text-right"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-t-4 border-slate-900 mt-6 pt-4 flex justify-between items-end">
                <div className="space-y-4">
                    <div className="border border-slate-300 p-2 w-48 text-center">
                        <p className="text-[8px] uppercase text-slate-400 mb-8">O Trabalhador</p>
                        <div className="border-t border-slate-400 pt-1">Assinatura</div>
                    </div>
                </div>
                <div className="text-right space-y-2">
                    <div className="flex justify-between w-64 border-b border-slate-200 py-1">
                        <span className="text-[10px] uppercase text-slate-400">Total Vencimentos</span>
                        <span className="font-bold">{formatCurrency(totalAntesImpostos)}</span>
                    </div>
                    <div className="flex justify-between w-64 border-b border-slate-200 py-1">
                        <span className="text-[10px] uppercase text-slate-400">Total Descontos</span>
                        <span className="font-bold text-red-600">-{formatCurrency(Math.abs(localData.abatimento))}</span>
                    </div>
                    <div className="flex justify-between w-64 pt-2 border-t-2 border-slate-900">
                        <span className="font-black uppercase text-sm">Total Líquido</span>
                        <span className="text-lg font-black">{formatCurrency(valorPagar)}</span>
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 text-[8px] text-slate-400 font-mono italic">
                Processado por computador | Software IMATEC v2.0 | Certificado nº 25/AGT/2019
            </div>
        </div>
    );

    if (isFinalized) {
        return (
            <div className="fixed inset-0 z-[200] bg-slate-100 overflow-auto animate-in fade-in flex flex-col items-center">
                <div className="w-full bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 print:hidden shadow-lg">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition border border-white/20"><ArrowLeft/></button>
                        <h2 className="font-black uppercase tracking-widest text-sm">Visualização de Recibo Duplicado (A4)</h2>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition">
                            <Printer size={18}/> Imprimir Agora
                        </button>
                        <button onClick={onClose} className="bg-slate-700 text-white px-6 py-2 rounded-lg font-bold">Voltar</button>
                    </div>
                </div>

                <div className="p-12 space-y-12 flex flex-col items-center">
                    <ReceiptA4 label="Original" />
                    <div className="w-[210mm] border-t-2 border-dashed border-slate-400 py-4 text-center text-slate-400 uppercase text-[10px] font-bold">Corte Aqui</div>
                    <ReceiptA4 label="Duplicado" />
                </div>
                <style>{`
                  @media print {
                    body { background: white !important; }
                    .print-hidden { display: none !important; }
                    @page { size: A4; margin: 0; }
                  }
                `}</style>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[130] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-none shadow-2xl w-full max-w-5xl p-8 font-sans text-slate-900 border-t-8 border-slate-400">
                <div className="flex justify-between items-center border-b pb-2 mb-6">
                    <h1 className="text-xl font-bold uppercase tracking-widest text-center flex-1">RECIBO SALARIO</h1>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X/></button>
                </div>

                <div className="flex justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold">2</span>
                        <span className="text-2xl font-black uppercase">{emp.name}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-bold text-slate-600 uppercase">{months[data.month - 1]} de {data.year}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="grid grid-cols-[50px_1fr_80px_200px] gap-4 border-b border-slate-300 pb-1 text-[10px] font-bold uppercase text-slate-500">
                        <span></span>
                        <span className="text-center">Secretaria</span>
                        <span className="text-center">QTD</span>
                        <span></span>
                    </div>

                    {[
                        { code: '01', label: 'Vencimento Base para a Categoria Profissional', qty: '31', val: localData.baseSalary, key: 'baseSalary' },
                        { code: '02', label: 'Complemento Salarial', qty: '27', val: localData.complement, key: 'complement' },
                        { code: '03', label: `Abatimento de Faltas Admissão(${data.hoursAbsence || 4}d) (Total Horas=20Hrs)`, qty: '4', val: localData.abatimento, key: 'abatimento' },
                        { code: '04', label: 'Horas Extra', qty: '', val: localData.hoursExtra, key: 'hoursExtra' },
                        { label: 'Horas Perdidas', qty: '', val: localData.hoursLost, key: 'hoursLost', isNegative: true },
                    ].map((row, idx) => (
                        <div key={idx} className="grid grid-cols-[50px_1fr_80px_200px] gap-4 items-center h-8">
                            <span className="font-bold text-slate-400">{row.code || ''}</span>
                            <span className="font-bold text-slate-800 text-xs truncate">{row.label}</span>
                            <span className="text-center font-bold text-slate-600">{row.qty}</span>
                            <div className="flex justify-end">
                                <input 
                                    type="number"
                                    className="bg-white border border-slate-300 rounded px-2 py-1 w-32 text-right font-bold text-xs"
                                    value={row.val}
                                    onChange={e => setLocalData({...localData, [row.key]: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="grid grid-cols-[1fr_200px] border-t border-slate-800 pt-2 mb-4">
                        <div className="flex items-center gap-2">
                             <span className="font-bold text-slate-400 text-xs">05</span>
                             <span className="font-bold text-slate-800 text-xs uppercase">Total de Vencimento Base lliquido (01+02-03+04)</span>
                        </div>
                        <div className="text-right pr-4 font-black text-sm text-slate-900 underline decoration-double">
                            {vencIliquido.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="font-bold text-slate-400 text-[10px] uppercase">Subsidios</p>
                        {[
                            { code: '06', label: 'Subsidio de Férias', qty: 'Vg', val: localData.subFerias, key: 'subFerias' },
                            { code: '07', label: 'Subsidio de Natal', qty: 'Vg', val: localData.subNatal, key: 'subNatal' },
                            { label: 'Abono de Familia (Isento até 5000 akz)', qty: 'Vg', val: localData.abonoFam, key: 'abonoFam' },
                            { code: '08', label: 'Subsidio Transporte', qty: '0', val: localData.subTransp, key: 'subTransp' },
                            { code: '09', label: 'Subsidio Alimentação', qty: '0', val: localData.subAlim, key: 'subAlim' },
                            { code: '10', label: 'Subsidio Alojamento', qty: 'Vg', val: localData.subAlojamento, key: 'subAlojamento' },
                        ].map((row, idx) => (
                            <div key={idx} className="grid grid-cols-[50px_1fr_80px_200px] gap-4 items-center h-7">
                                <span className="font-bold text-slate-400 text-[9px]">{row.code || ''}</span>
                                <span className="font-bold text-slate-800 text-[11px] truncate">{row.label}</span>
                                <span className="text-center font-bold text-slate-600">{row.qty}</span>
                                <div className="flex justify-end">
                                    <input 
                                        type="number"
                                        className="bg-white border border-slate-300 rounded px-2 py-0.5 w-32 text-right font-bold text-xs"
                                        value={row.val}
                                        onChange={e => setLocalData({...localData, [row.key]: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-[1fr_200px] border-t border-slate-300 pt-1">
                        <div className="flex items-center gap-2">
                             <span className="font-bold text-slate-400 text-xs">13</span>
                             <span className="font-bold text-slate-800 text-[10px] uppercase">Total de Vencimento antes de Impostos [05]+[06]+[07]+[08]+[09]+[10]+[11]-[12]</span>
                        </div>
                        <div className="text-right pr-4 font-black text-sm text-slate-900">
                            {totalAntesImpostos.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr_200px] pt-1">
                        <div className="flex items-center gap-2">
                             <span className="font-bold text-slate-400 text-xs">Impostos</span>
                        </div>
                        <div className="text-right pr-4 font-black text-sm text-red-600 uppercase">ISENTO</div>
                    </div>

                    <div className="grid grid-cols-[1fr_200px] pt-4">
                        <div className="text-right pr-8 font-bold text-[11px] text-slate-600">Vencimento Liquido depois de Impostos [ 13]-[14]-[15]</div>
                        <div className="text-right pr-4 font-bold text-sm text-slate-800">{valorPagar.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>

                    <div className="grid grid-cols-[1fr_200px] pt-1">
                        <div className="text-right pr-8"><button className="bg-emerald-100 text-emerald-800 px-2 rounded font-bold text-[9px] border border-emerald-300">Arredondar</button></div>
                        <div className="flex justify-end pr-4">
                            <input type="number" className="bg-white border border-slate-300 rounded px-2 py-0.5 w-32 text-right font-bold text-xs" value={localData.arredondar}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr_200px] pt-2">
                        <div className="text-right pr-8 font-black uppercase text-sm">TOTAL A RECEBER</div>
                        <div className="text-right pr-4 font-black text-sm border-t-2 border-slate-900">{valorPagar.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-12">
                    <div className="space-y-1">
                        <p className="text-red-600 font-bold text-xs uppercase">Total de Abonos e Adiantamentos 0,00</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <p className="text-red-600 font-black text-xl uppercase tracking-tighter">Valor a pagar ={valorPagar.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <button 
                            onClick={() => {
                                onProcess({ ...data, ...localData, netTotal: valorPagar });
                                setIsFinalized(true);
                            }} 
                            className="bg-emerald-300 hover:bg-emerald-400 text-emerald-900 font-bold px-16 py-3 rounded-xl shadow-lg transition transform active:scale-95 text-lg uppercase"
                        >
                            Processar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface HumanResourcesProps {
  employees: Employee[];
  onSaveEmployee: (emp: Employee) => void;
  transactions: HrTransaction[];
  onSaveTransaction: (t: HrTransaction) => void;
  vacations: HrVacation[];
  onSaveVacation: (v: HrVacation) => void;
  payroll: SalarySlip[]; 
  onProcessPayroll: (slips: SalarySlip[]) => void;
  professions: Profession[];
  onSaveProfession: (p: Profession) => void;
  onDeleteProfession: (id: string) => void;
  contracts: Contract[];
  onSaveContract: (c: Contract[]) => void;
  attendance: AttendanceRecord[];
  onSaveAttendance: (a: AttendanceRecord) => void;
  company: Company;
  currentView?: ViewState;
  cashRegisters?: CashRegister[]; // New Prop
  onUpdateCashRegister?: (cr: CashRegister) => void; // New Prop
  onChangeView?: (view: ViewState) => void;
}

const HumanResources: React.FC<HumanResourcesProps> = ({ 
    employees, onSaveEmployee, transactions, onSaveTransaction, 
    vacations, onSaveVacation, payroll, onProcessPayroll,
    professions, onSaveProfession, onDeleteProfession,
    contracts, onSaveContract, attendance, onSaveAttendance,
    company, currentView, cashRegisters = [], onUpdateCashRegister, onChangeView
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'GESTÃO' | 'ASSIDUIDADE' | 'PROFISSÕES' | 'MAPAS' | 'CONTRATOS' | 'PROCESSAMENTO' | 'ORDEM_TRANSFERENCIA' | 'MAPA_EFETIVIDADE' | 'LISTAGEM_VENCIMENTO'>(
    currentView === 'HR_TRANSFER_ORDER' ? 'ORDEM_TRANSFERENCIA' : 
    currentView === 'HR_EFFECTIVENESS' ? 'MAPA_EFETIVIDADE' :
    currentView === 'HR_SALARY_LIST' ? 'LISTAGEM_VENCIMENTO' : 'DASHBOARD'
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [processingMonth, setProcessingMonth] = useState(new Date().getMonth() + 1);
  const [processingYear, setProcessingYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [showBulkActionsMenu, setShowBulkActionsMenu] = useState(false);
  
  const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());
  const [isProcessingEffectiveness, setIsProcessingEffectiveness] = useState(false);
  const [activeProcessingEmp, setActiveProcessingEmp] = useState<Employee | null>(null);
  const [showSalaryReceipt, setShowSalaryReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const [selectedCashRegisterId, setSelectedCashRegisterId] = useState('');

  // Estados locais para controle de exclusão (visuais para auditoria da sessão)
  const [deletedEffectivenessIds, setDeletedEffectivenessIds] = useState<Set<string>>(new Set());
  const [deletedSalaryIds, setDeletedSalaryIds] = useState<Set<string>>(new Set());

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const isProcessComplete = (emp: Employee) => {
      if (deletedEffectivenessIds.has(emp.id)) return false;
      return attendance.some(a => a.employeeId === emp.id && new Date(a.date).getMonth() + 1 === processingMonth);
  };

  const isSalaryProcessed = (empId: string) => {
    if (deletedSalaryIds.has(empId)) return false;
    return payroll.some(p => p.employeeId === empId);
  };

  const isSalaryTransferred = (empId: string) => {
      return payroll.some(p => p.employeeId === empId && p.transferred === true);
  };

  const getProcessedNet = (empId: string) => {
    if (deletedSalaryIds.has(empId)) return "Apagado";
    const slip = payroll.find(p => p.employeeId === empId);
    return slip ? formatCurrency(slip.netTotal) : null;
  };

  const toggleSelectAll = () => {
    if (selectedEmpIds.size === employees.length) {
        setSelectedEmpIds(new Set());
    } else {
        setSelectedEmpIds(new Set(employees.map(e => e.id)));
    }
  };

  const toggleSelectEmp = (id: string) => {
    const newSet = new Set(selectedEmpIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedEmpIds(newSet);
  };

  const handleBulkTransfer = () => {
      if (!selectedCashRegisterId) return alert("Por favor, selecione o Caixa de Pagamento no topo da lista.");
      const selectedSlips = payroll.filter(p => selectedEmpIds.has(p.employeeId) && !p.transferred);
      
      if (selectedSlips.length === 0) return alert("Nenhum salário processado selecionado para transferência.");

      const totalToTransfer = selectedSlips.reduce((acc, s) => acc + s.netTotal, 0);
      const register = cashRegisters.find(c => c.id === selectedCashRegisterId);

      if (!register) return alert("Caixa não encontrado.");
      if (register.balance < totalToTransfer) return alert("Saldo insuficiente no caixa selecionado.");

      if (confirm(`Confirmar transferência de ${formatCurrency(totalToTransfer)} para ${selectedSlips.length} funcionários?`)) {
          // Deduct from register
          onUpdateCashRegister?.({
              ...register,
              balance: register.balance - totalToTransfer
          });

          // Mark slips as transferred
          const updatedSlips = payroll.map(p => {
              if (selectedEmpIds.has(p.employeeId)) return { ...p, transferred: true };
              return p;
          });
          onProcessPayroll(updatedSlips);

          alert("Transferência realizada com sucesso!");
          setSelectedEmpIds(new Set());
      }
  };

  const handleBulkAction = (action: string) => {
    if (selectedEmpIds.size === 0) return alert("Selecione pelo menos um funcionário.");
    
    if (action === 'PROCESS_EFECTIVIDADE') {
        const newRecords = Array.from(selectedEmpIds).map(id => ({
            id: generateId(),
            employeeId: id,
            date: new Date(processingYear, processingMonth - 1, 1).toISOString(),
            status: 'Present' as any
        }));
        newRecords.forEach(r => onSaveAttendance(r));
        // Remove do estado de deletados se for re-processado
        setDeletedEffectivenessIds(prev => {
            const next = new Set(prev);
            selectedEmpIds.forEach(id => next.delete(id));
            return next;
        });
        alert("Efetividade processada automaticamente para os funcionários selecionados.");
    } else if (action === 'DELETE_EFECTIVIDADE') {
        if(confirm("Deseja apagar a efetividade dos funcionários selecionados?")) {
            setDeletedEffectivenessIds(prev => {
                const next = new Set(prev);
                selectedEmpIds.forEach(id => next.add(id));
                return next;
            });
            alert("Efetividade apagada com sucesso.");
        }
    } else if (action === 'DELETE_SALARIO') {
        if(confirm("Deseja apagar o processamento salarial selecionado?")) {
            const canDelete = Array.from(selectedEmpIds).every(id => {
                const emp = employees.find(e => e.id === id);
                return emp && isProcessComplete(emp);
            });
            if (!canDelete) {
                alert("Erro: O salário só pode ser apagado se a efetividade estiver processada.");
                return;
            }
            setDeletedSalaryIds(prev => {
                const next = new Set(prev);
                selectedEmpIds.forEach(id => next.add(id));
                return next;
            });
            alert("Processamento de salários removido.");
        }
    } else if (action === 'TRANSFERIR') {
        handleBulkTransfer();
    }
    setShowBulkActionsMenu(false);
  };

  const handleAttendanceConfirm = (attData: Record<number, string>) => {
    setIsProcessingEffectiveness(false); 
    if (!activeProcessingEmp) return;

    onSaveAttendance({
        id: generateId(),
        employeeId: activeProcessingEmp.id,
        date: new Date(processingYear, processingMonth - 1, 1).toISOString(),
        status: 'Present'
    });
    
    // Reset status de apagado ao processar novamente
    setDeletedEffectivenessIds(prev => {
        const next = new Set(prev);
        next.delete(activeProcessingEmp.id);
        return next;
    });
    
    setReceiptData({
        emp: activeProcessingEmp,
        month: processingMonth,
        year: processingYear,
        baseSalary: activeProcessingEmp.baseSalary,
        abatimento: -10489.51,
        hoursAbsence: 4
    });
    setShowSalaryReceipt(true); 
  };

  const handleConfirmSalaryProcess = (processedData: any) => {
    const slip: SalarySlip = {
        employeeId: processedData.emp.id,
        employeeName: processedData.emp.name,
        employeeRole: processedData.emp.role,
        baseSalary: processedData.baseSalary,
        allowances: 0,
        bonuses: 0,
        subsidies: 0,
        subsidyTransport: 0,
        subsidyFood: 0,
        subsidyFamily: 1222,
        subsidyHousing: 22333,
        absences: Math.abs(processedData.abatimento),
        advances: 0,
        grossTotal: processedData.netTotal,
        inss: 0,
        irt: 0,
        netTotal: processedData.netTotal,
        transferred: false
    };

    onProcessPayroll([slip]);
    // Reset status de apagado ao processar novamente
    setDeletedSalaryIds(prev => {
        const next = new Set(prev);
        next.delete(processedData.emp.id);
        return next;
    });

    // We do not close the receipt immediately anymore; the modal handles showing the A4 duplicado.
  };

  const handleUpdateEmployeeField = (empId: string, field: keyof Employee, value: any) => {
      const emp = employees.find(e => e.id === empId);
      if (emp) {
          onSaveEmployee({ ...emp, [field]: value });
      }
  };

  const renderAssiduidade = () => (
    <div className="space-y-4 animate-in fade-in duration-500 overflow-x-auto pb-20">
        {isProcessingEffectiveness && activeProcessingEmp && (
            <AttendanceGrid 
                emp={activeProcessingEmp}
                processingMonth={processingMonth}
                processingYear={processingYear}
                months={months}
                onCancel={() => setIsProcessingEffectiveness(false)}
                onConfirm={handleAttendanceConfirm}
            />
        )}
        
        {showSalaryReceipt && receiptData && (
            <SalaryReceipt 
                data={receiptData}
                months={months}
                onClose={() => setShowSalaryReceipt(false)}
                onProcess={handleConfirmSalaryProcess}
                company={company}
            />
        )}

        <div className="mb-2">
            <p className="text-[11px] font-medium text-slate-500 mb-2">Home / Área Reservada / Recursos Humanos / Assiduidade Técnica</p>
            <h2 className="text-2xl font-bold text-slate-800">Assiduidade Técnica</h2>
        </div>

        <div className="flex justify-between items-center gap-4 mb-4">
            <div className="flex gap-4 items-center">
                <button className="bg-white border-b-4 border-blue-600 text-slate-700 px-4 py-2 font-bold text-xs uppercase flex items-center gap-2 hover:bg-slate-50 transition shadow-sm">
                    <Filter size={16}/> FILTRAR
                </button>
                <div className="flex items-center gap-3 bg-white p-2 rounded border border-slate-200 shadow-inner">
                    <Wallet size={16} className="text-blue-600"/>
                    <select 
                        className="bg-transparent text-[11px] font-black uppercase outline-none text-blue-900 min-w-[200px]"
                        value={selectedCashRegisterId}
                        onChange={e => setSelectedCashRegisterId(e.target.value)}
                    >
                        <option value="">Selecionar Caixa Pagamento...</option>
                        {cashRegisters.map(c => <option key={c.id} value={c.id}>{c.name} (Saldo: {formatCurrency(c.balance)})</option>)}
                    </select>
                </div>
                <button 
                  onClick={() => handleBulkAction('TRANSFERIR')}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded font-black uppercase text-[11px] tracking-widest shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                    <ArrowRight size={18}/> Transferir
                </button>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Mês:</span>
                <select className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold" value={processingMonth} onChange={e => setProcessingMonth(Number(e.target.value))}>
                    {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
                <select className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold" value={processingYear} onChange={e => setProcessingYear(Number(e.target.value))}>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                </select>
            </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden min-w-[1600px]">
            <table className="w-full text-left border-collapse">
                <thead className="bg-[#003366] text-white font-bold text-[9px] uppercase tracking-tighter text-center">
                    <tr className="border-b border-white/10">
                        <th className="p-2 border-r border-white/10 w-10 text-center relative group">
                            <div className="inline-block relative">
                                <div className="flex items-center gap-1">
                                    <button onClick={toggleSelectAll} className="p-1 hover:bg-blue-800 rounded">
                                        {selectedEmpIds.size === employees.length ? <CheckSquare size={16} className="text-white"/> : <Square size={16} className="text-white/50"/>}
                                    </button>
                                    <ChevronDown 
                                        size={14} 
                                        className="text-white/50 cursor-pointer hover:text-white transition-colors" 
                                        onClick={() => setShowBulkActionsMenu(!showBulkActionsMenu)}
                                    />
                                </div>
                                
                                {showBulkActionsMenu && (
                                    <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-top-2 z-[60]">
                                        <div className="p-2 space-y-1">
                                            <div className="p-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 mb-1 flex items-center justify-between">
                                                Selecionar Ação <span>({selectedEmpIds.size})</span>
                                            </div>
                                            <button onClick={() => handleBulkAction('PROCESS_EFECTIVIDADE')} className="w-full text-left p-3 hover:bg-blue-600 text-white rounded-md flex items-center gap-3 transition group">
                                                <Play size={18} className="text-blue-400 group-hover:text-white"/>
                                                <span className="font-bold text-xs uppercase tracking-tighter">Processar Efetividade</span>
                                            </button>
                                            <button onClick={() => handleBulkAction('DELETE_EFECTIVIDADE')} className="w-full text-left p-3 hover:bg-red-600 text-white rounded-md flex items-center gap-3 transition group">
                                                <Trash size={18} className="text-red-400 group-hover:text-white"/>
                                                <span className="font-bold text-xs uppercase tracking-tighter">Apagar Efetividade</span>
                                            </button>
                                            <button onClick={() => handleBulkAction('DELETE_SALARIO')} className="w-full text-left p-3 hover:bg-orange-600 text-white rounded-md flex items-center gap-3 transition group">
                                                <X size={18} className="text-orange-400 group-hover:text-white"/>
                                                <span className="font-bold text-xs uppercase tracking-tighter">Apagar Salário</span>
                                            </button>
                                            <button onClick={() => handleBulkAction('TRANSFERIR')} className="w-full text-left p-3 hover:bg-emerald-600 text-white rounded-md flex items-center gap-3 transition group">
                                                <ArrowRight size={18} className="text-emerald-400 group-hover:text-white"/>
                                                <span className="font-bold text-xs uppercase tracking-tighter">Transferir Salários</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </th>
                        <th className="p-2 border-r border-white/10 w-8" rowSpan={2}>Nº</th>
                        <th className="p-2 border-r border-white/10 w-40" rowSpan={2}>IDNF<br/>POSTO</th>
                        <th className="p-2 border-r border-white/10 w-64" rowSpan={2}>Nome<br/>Profissão</th>
                        <th className="p-2 border-r border-white/10 w-32">Datas</th>
                        <th className="p-2 border-r border-white/10 w-24">Pagamentos</th>
                        <th className="p-2 border-r border-white/10" colSpan={3}>Subsidios Pontuais Manuais</th>
                        <th className="p-2 border-r border-white/10 w-24" rowSpan={2}>Abono<br/>Familia</th>
                        <th className="p-2 border-r border-white/10" colSpan={2}>Sub Isentos</th>
                        <th className="p-2 border-r border-white/10" colSpan={4}>Outros Acertos Salariais</th>
                        <th className="p-2" colSpan={4}>Processamento</th>
                    </tr>
                    <tr className="bg-slate-800 text-white/80 border-b border-white/10">
                        <th className="p-1 border-r border-white/10 text-[8px]">Admissão<br/>Demissão</th>
                        <th className="p-1 border-r border-white/10 text-[8px]">Titular<br/>Caixa</th>
                        <th className="p-1 border-r border-white/10 text-[8px]">S. base<br/>Compl.Sal</th>
                        <th className="p-1 border-r border-white/10 text-[8px]">Natal</th>
                        <th className="p-1 border-r border-white/10 text-[8px]">Férias</th>
                        <th className="p-1 border-r border-white/10 text-[8px]">Alojamento</th>
                        <th className="p-1 border-r border-white/10 text-[8px]">SUB<br/>ALIM</th>
                        <th className="p-1 border-r border-white/10 text-[8px]">SUB<br/>TRANS</th>
                        <th className="p-1 border-r border-white/10 text-[8px]">Outros<br/>Subsidios</th>
                        <th className="p-1 border-r border-white/10 text-[8px]">Acertos<br/>Salariais</th>
                        <th className="p-1 border-r border-white/10 text-[8px]">Multas<br/>Penaliza</th>
                        <th className="p-1 border-r border-white/10 text-[8px] text-red-400">Magic</th>
                        <th className="p-1 border-r border-white/10 text-[8px]">Efetividade</th>
                        <th className="p-1 border-r border-white/10 text-[8px]">Horas<br/>Faltas</th>
                        <th className="p-1 border-r border-white/10 text-[8px] text-red-400 font-black">Item</th>
                        <th className="p-1 text-[8px] text-blue-400 font-black">Print</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-center uppercase">
                    {employees.map((emp, idx) => {
                        const isEffDeleted = deletedEffectivenessIds.has(emp.id);
                        const isSalDeleted = deletedSalaryIds.has(emp.id);
                        const effectivenessDone = isProcessComplete(emp);
                        const isSelected = selectedEmpIds.has(emp.id);
                        const salaryProcessedValue = getProcessedNet(emp.id);
                        const transferred = isSalaryTransferred(emp.id);
                        
                        return (
                            <tr key={emp.id} className={`${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'} transition-colors group`}>
                                <td className="p-2 border-r border-slate-100">
                                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelectEmp(emp.id)} className="rounded-sm"/>
                                </td>
                                <td className="p-2 border-r border-slate-100 font-bold text-slate-400">{idx + 1}</td>
                                <td className="p-2 border-r border-slate-100">
                                    <div className="font-bold text-slate-800">{emp.idnf || emp.id.substring(0,4).toUpperCase()}</div>
                                    <div className="text-[8px] text-slate-500 truncate">Obra Generica</div>
                                </td>
                                <td className="p-2 border-r border-slate-100 text-left">
                                    <div className="font-black text-slate-900 leading-none">{emp.name}</div>
                                    <div className="text-[8px] text-slate-400 mt-1 font-bold">{emp.role}</div>
                                </td>
                                <td className="p-2 border-r border-slate-100 font-mono font-bold text-slate-700">{formatDate(emp.admissionDate)}</td>
                                <td className="p-2 border-r border-slate-100">
                                    <input type="checkbox" checked={emp.isCashier} readOnly className="w-3 h-3 rounded"/>
                                </td>
                                <td className="p-2 border-r border-slate-100 text-right font-mono font-bold">
                                    <input 
                                        type="number"
                                        className="w-full text-right bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1"
                                        value={emp.baseSalary}
                                        onChange={e => handleUpdateEmployeeField(emp.id, 'baseSalary', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-1 border-r border-slate-100">
                                    <input 
                                        type="number"
                                        className="w-full text-center bg-transparent outline-none focus:bg-white rounded"
                                        value={emp.subsidyChristmas || 0}
                                        onChange={e => handleUpdateEmployeeField(emp.id, 'subsidyChristmas', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-1 border-r border-slate-100">
                                     <input 
                                        type="number"
                                        className="w-full text-center bg-transparent outline-none focus:bg-white rounded"
                                        value={emp.subsidyVacation || 0}
                                        onChange={e => handleUpdateEmployeeField(emp.id, 'subsidyVacation', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-1 border-r border-slate-100">
                                     <input 
                                        type="number"
                                        className="w-full text-center bg-transparent outline-none focus:bg-white rounded"
                                        value={emp.subsidyHousing || 0}
                                        onChange={e => handleUpdateEmployeeField(emp.id, 'subsidyHousing', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-2 border-r border-slate-100 text-right font-mono font-bold text-slate-700">
                                    <input 
                                        type="number"
                                        className="w-full text-right bg-transparent outline-none focus:bg-white rounded"
                                        value={emp.subsidyFamily || 0}
                                        onChange={e => handleUpdateEmployeeField(emp.id, 'subsidyFamily', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-2 border-r border-slate-100 text-[8px] text-slate-400 font-bold">
                                    <input 
                                        type="number"
                                        className="w-full text-center bg-transparent outline-none focus:bg-white rounded"
                                        value={emp.subsidyFood || 0}
                                        onChange={e => handleUpdateEmployeeField(emp.id, 'subsidyFood', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-2 border-r border-slate-100 text-[8px] text-slate-400 font-bold">
                                    <input 
                                        type="number"
                                        className="w-full text-center bg-transparent outline-none focus:bg-white rounded"
                                        value={emp.subsidyTransport || 0}
                                        onChange={e => handleUpdateEmployeeField(emp.id, 'subsidyTransport', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-2 border-r border-slate-100 text-right font-mono text-[9px] text-slate-400">
                                    <input 
                                        type="number"
                                        className="w-full text-right bg-transparent outline-none focus:bg-white rounded"
                                        value={emp.allowances || 0}
                                        onChange={e => handleUpdateEmployeeField(emp.id, 'allowances', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-2 border-r border-slate-100 text-right font-mono text-[9px] text-slate-400">
                                    <input 
                                        type="number"
                                        className="w-full text-right bg-transparent outline-none focus:bg-white rounded"
                                        value={emp.salaryAdjustments || 0}
                                        onChange={e => handleUpdateEmployeeField(emp.id, 'salaryAdjustments', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-2 border-r border-slate-100 text-right font-mono text-[9px] text-slate-400">
                                    <input 
                                        type="number"
                                        className="w-full text-right bg-transparent outline-none focus:bg-white rounded"
                                        value={emp.penalties || 0}
                                        onChange={e => handleUpdateEmployeeField(emp.id, 'penalties', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-2 border-r border-slate-100">
                                    <input type="checkbox" checked={emp.isMagic} readOnly className="w-3 h-3 rounded accent-blue-600"/>
                                </td>
                                <td className="p-2 border-r border-slate-100 font-black">
                                    {isSalDeleted ? (
                                        <div className="text-[9px] text-red-500 font-bold">Apagado</div>
                                    ) : salaryProcessedValue && !isSalDeleted ? (
                                        <div className="flex flex-col items-center">
                                            <div className="text-[9px] text-emerald-600 leading-tight">Processado ({salaryProcessedValue.replace('AOA', '')})</div>
                                            {transferred && <div className="text-[7px] text-blue-500 font-bold uppercase">Transferido</div>}
                                        </div>
                                    ) : isEffDeleted ? (
                                        <div className="text-[9px] text-red-500 font-bold">Apagado</div>
                                    ) : effectivenessDone ? (
                                        <div className="text-[9px] text-slate-600">Processado</div>
                                    ) : (
                                        <button 
                                            onClick={() => { setActiveProcessingEmp(emp); setIsProcessingEffectiveness(true); }}
                                            className="text-[9px] font-black uppercase text-red-600 underline hover:text-blue-600"
                                        >
                                            Efetuar Efetividade
                                        </button>
                                    )}
                                </td>
                                <td className="p-2 border-r border-slate-100 font-black text-slate-400">.</td>
                                <td className="p-2 border-r border-slate-100">
                                    <input type="checkbox" checked={emp.isItemChecked} readOnly className="w-4 h-4 rounded accent-red-600"/>
                                </td>
                                <td className="p-2">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => window.print()} className="text-slate-400 hover:text-slate-800 transition" title="Imprimir"><Printer size={14}/></button>
                                        <button className="text-slate-400 hover:text-slate-800 transition" title="Exportar"><Download size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        
        <div className="flex justify-between items-center text-slate-500 text-[11px] font-bold mt-4">
            <div className="flex items-center gap-2">
                <span>{employees.length} de {employees.length} registos por página</span>
                <div className="bg-[#003366] text-white px-2 py-1 rounded-sm flex items-center gap-1 cursor-pointer">
                    20 <ChevronDown size={12}/>
                </div>
                <span>registos por página</span>
            </div>
            <div className="flex items-center gap-1">
                <span className="cursor-pointer">&lt;&lt;&lt;</span>
                <span className="px-2 text-[#003366] border border-slate-200">1</span>
                <span className="cursor-pointer">&gt;&gt;&gt;</span>
            </div>
        </div>
    </div>
  );

  const renderOrdemTransferencia = () => {
    const processedSlips = payroll.filter(p => !deletedSalaryIds.has(p.employeeId));
    const totalAmount = processedSlips.reduce((acc, curr) => acc + curr.netTotal, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-none border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ArrowRight className="text-blue-600"/> Ordem de Transferência Bancária
                    </h2>
                    <p className="text-xs text-slate-500">Listagem consolidada para processamento via ficheiro bancário (PS2)</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total a Transferir</p>
                    <p className="text-2xl font-black text-blue-900">{formatCurrency(totalAmount)}</p>
                </div>
            </div>

            <div className="bg-white border-2 border-slate-900 rounded-none shadow-2xl overflow-hidden p-8" id="print-transfer-order">
                <div className="flex justify-between border-b-2 border-black pb-4 mb-8">
                    <div>
                        <h1 className="text-lg font-black uppercase">{company.name}</h1>
                        <p className="text-[10px]">NIF: {company.nif} • {company.address}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-black uppercase">Ordem de Pagamento</h2>
                        <p className="font-bold text-slate-500">Ref: OP/{new Date().getFullYear()}/{String(new Date().getMonth() + 1).padStart(2,'0')}</p>
                    </div>
                </div>

                <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-slate-100 font-bold uppercase border-y-2 border-black">
                        <tr>
                            <th className="p-2 border-r border-slate-300">No</th>
                            <th className="p-2 border-r border-slate-300">Beneficiário</th>
                            <th className="p-2 border-r border-slate-300">IBAN / Conta</th>
                            <th className="p-2 text-right">Valor Líquido</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {processedSlips.map((slip, i) => {
                            const emp = employees.find(e => e.id === slip.employeeId);
                            return (
                                <tr key={slip.employeeId} className="hover:bg-slate-50">
                                    <td className="p-2 border-r border-slate-200 font-mono text-slate-400">{i+1}</td>
                                    <td className="p-2 border-r border-slate-200 font-bold uppercase">{slip.employeeName}</td>
                                    <td className="p-2 border-r border-slate-200">
                                        <div className="font-bold text-slate-700">{emp?.bankName || 'BFA'}</div>
                                        <div className="font-mono text-slate-400">{emp?.iban || 'AO06...'}</div>
                                    </td>
                                    <td className="p-2 text-right font-black text-blue-800">
                                        {formatCurrency(slip.netTotal)}
                                    </td>
                                </tr>
                            );
                        })}
                        {processedSlips.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-slate-300 font-bold uppercase italic tracking-widest">
                                    Aguardando processamento salarial para gerar ordens.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="border-t-2 border-black font-black">
                        <tr className="bg-slate-50">
                            <td colSpan={3} className="p-2 text-right uppercase">Total da Ordem</td>
                            <td className="p-2 text-right text-lg">{formatCurrency(totalAmount)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="mt-12 grid grid-cols-2 gap-20 text-center uppercase text-[10px] font-bold">
                    <div>
                        <div className="border-t border-black pt-2">O Responsável Financeiro</div>
                    </div>
                    <div>
                        <div className="border-t border-black pt-2">A Gerência</div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 print:hidden">
                <button 
                  onClick={() => setActiveTab('ASSIDUIDADE')}
                  className="bg-white border-b-4 border-slate-400 text-slate-600 px-8 py-3 font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition"
                >
                    Voltar
                </button>
                <button 
                  onClick={() => {
                      const printArea = document.getElementById('print-transfer-order');
                      if (printArea) {
                          const win = window.open('', '_blank');
                          win?.document.write(`<html><head><title>Ordem de Transferência</title><script src="https://cdn.tailwindcss.com"></script></head><body>${printArea.outerHTML}</body></html>`);
                          setTimeout(() => {
                              win?.print();
                              win?.close();
                          }, 500);
                      }
                  }}
                  className="bg-white border-b-4 border-blue-600 text-blue-800 px-10 py-3 font-black uppercase text-xs tracking-widest hover:bg-slate-50 shadow-lg transition"
                >
                    Imprimir Ordem
                </button>
            </div>
        </div>
    );
  };

  const renderDashboard = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-5 border-b-4 border-blue-600 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-slate-500 text-xs font-bold uppercase">Total Colaboradores</p>
                      <h2 className="text-3xl font-black text-blue-900">{employees.filter(e => e.status === 'Active').length}</h2>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24}/></div>
              </div>
              <div className="bg-white p-5 border-b-4 border-emerald-600 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-slate-500 text-xs font-bold uppercase">Custo Mensal Estimado</p>
                      <h2 className="text-2xl font-bold text-slate-800">{formatCurrency(employees.reduce((acc, e) => acc + e.baseSalary, 0))}</h2>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Calculator size={24}/></div>
              </div>
              <div className="bg-white p-5 border-b-4 border-orange-500 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-slate-500 text-xs font-bold uppercase">Processamentos do Mês</p>
                      <h2 className="text-3xl font-black text-orange-500">{payroll.length}</h2>
                  </div>
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><RefreshCw size={24}/></div>
              </div>
              <div className="bg-white p-5 border-b-4 border-red-500 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-slate-500 text-xs font-bold uppercase">Turnover (Risco)</p>
                      <h2 className="text-3xl font-black text-red-500">{employees.filter(e => e.turnoverRisk === 'High').length}</h2>
                  </div>
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg"><TrendingUp size={24}/></div>
              </div>
          </div>
          
          <div className="bg-slate-900 rounded-none p-10 text-white relative overflow-hidden shadow-2xl border-b-8 border-blue-600">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Shield size={120}/></div>
              <div className="relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Gestão Estratégica de Capital Humano</h3>
                  <p className="text-slate-400 max-w-2xl leading-relaxed mb-8">
                      O ecossistema IMATEC automatiza o cálculo de IRT e INSS seguindo a legislação angolana atualizada de 2024. Gerencie assiduidade e remunerações com auditoria cloud completa.
                  </p>
                  <div className="flex flex-wrap gap-4">
                      <button onClick={() => setActiveTab('ASSIDUIDADE')} className="bg-white border-b-4 border-blue-600 hover:bg-slate-50 text-slate-900 px-8 py-3 font-black uppercase text-xs tracking-[3px] shadow-xl transition transform active:scale-95">Aceder Grelha de Assiduidade</button>
                      <button 
                        onClick={() => onChangeView?.('HR_ID_CARDS')} 
                        className="bg-white border-b-4 border-blue-600 hover:bg-slate-50 text-slate-900 px-8 py-3 font-black uppercase text-xs tracking-[3px] shadow-xl transition transform active:scale-95 flex items-center gap-2"
                      >
                          <Contact2 size={18} className="text-blue-600"/> Imprimir Cartões Funcionário
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderContent = () => {
    switch (activeTab) {
        case 'DASHBOARD': return renderDashboard();
        case 'ASSIDUIDADE': return renderAssiduidade();
        case 'ORDEM_TRANSFERENCIA': return renderOrdemTransferencia();
        case 'PROFISSÕES': return <div className="h-[calc(100vh-200px)]"><ProfessionManager professions={professions} onSave={onSaveProfession} onDelete={onDeleteProfession}/></div>;
        case 'MAPAS': return <SalaryMap payroll={payroll} employees={employees} />;
        case 'CONTRATOS': return (
             <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl gap-4">
                 <Shield className="text-blue-600" size={64}/>
                 <h2 className="text-xl font-bold">Gestão Geral de Contratos</h2>
                 <p className="text-slate-500 max-w-md text-center">Utilize o módulo de funcionários para emitir novos contratos individuais seguindo o padrão oficial da empresa.</p>
                 <button onClick={() => setActiveTab('GESTÃO')} className="bg-blue-600 text-white px-8 py-2 rounded font-bold uppercase text-xs">Ir para Funcionários</button>
             </div>
        );
        case 'GESTÃO': return <Employees employees={employees} onSaveEmployee={onSaveEmployee} workLocations={[]} professions={professions} />;
        case 'MAPA_EFETIVIDADE': return <EffectivenessMap employees={employees} attendance={attendance} company={company} month={processingMonth} year={processingYear} onBack={() => setActiveTab('DASHBOARD')} />;
        case 'LISTAGEM_VENCIMENTO': return <SalaryList employees={employees} onBack={() => setActiveTab('DASHBOARD')} />;
        default: return renderDashboard();
    }
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <p className="text-[11px] font-medium text-slate-500 mb-1">Home / Área Reservada / Recursos Humanos</p>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Users className="text-blue-600"/> Recursos Humanos</h1>
            </div>
            <div className="flex gap-2 bg-white p-1 rounded-none border border-slate-200 shadow-sm overflow-x-auto w-full md:w-auto custom-scrollbar">
                {[
                  {id:'DASHBOARD', label: 'Painel Geral'},
                  {id:'GESTÃO', label: 'Funcionários'},
                  {id:'ASSIDUIDADE', label: 'Assiduidade Técnica'},
                  {id:'PROFISSÕES', label: 'Profissões'},
                  {id:'MAPAS', label: 'Mapas de Salários'},
                  {id:'CONTRATOS', label: 'Contratos'},
                  {id:'PROCESSAMENTO', label: 'Processamento'},
                  {id:'MAPA_EFETIVIDADE', label: 'Mapa de Efetividade'},
                  {id:'LISTAGEM_VENCIMENTO', label: 'Listagem por Vencimento'},
                  {id:'ORDEM_TRANSFERENCIA', label: 'Ordem Transferência'}
                ].map(t => (
                    <button 
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`px-4 py-2 font-bold text-[10px] uppercase transition-all whitespace-nowrap border-b-4 ${activeTab === t.id ? 'bg-slate-50 border-blue-600 text-blue-800 shadow-sm' : 'border-transparent text-slate-600 hover:text-blue-600 hover:border-blue-300'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
        </div>

        {renderContent()}
    </div>
  );
};

export default HumanResources;
