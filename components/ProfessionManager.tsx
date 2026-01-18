
import React, { useState } from 'react';
import { Profession } from '../types';
import { Search, Plus, Trash2, Edit2, Briefcase, Save, X, BookOpen, Check } from 'lucide-react';
import { generateId } from '../utils';

interface ProfessionManagerProps {
  professions: Profession[];
  onSave: (p: Profession) => void;
  onDelete: (id: string) => void;
  onSelect?: (p: Profession) => void; // Optional selection mode
  onClose?: () => void;
}

const ProfessionManager: React.FC<ProfessionManagerProps> = ({ professions, onSave, onDelete, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [formData, setFormData] = useState<Partial<Profession>>({});

  const filtered = professions.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.includes(searchTerm)
  );

  const handleCreate = () => {
    setFormData({ code: '', name: '', category: 'Geral', baseSalary: 0, complement: 0 });
    setView('FORM');
  };

  const handleEdit = (p: Profession) => {
    setFormData(p);
    setView('FORM');
  };

  const handleSaveForm = () => {
    if(!formData.name || !formData.code) return alert("Código e Nome são obrigatórios");
    
    const newProf: Profession = {
        id: formData.id || generateId(),
        code: formData.code!,
        name: formData.name!,
        category: formData.category || 'Geral',
        description: formData.description,
        group: formData.group,
        baseSalary: formData.baseSalary,
        complement: formData.complement
    };
    onSave(newProf);
    setView('LIST');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md border-b-4 border-blue-600">
            <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tighter">
                <Briefcase className="text-blue-400"/> Gestão de Profissões / Categorias
            </h2>
            {onClose && (
                <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition">
                    <X size={20}/>
                </button>
            )}
        </div>

        {view === 'LIST' && (
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
                {/* Search & Actions */}
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                        <input 
                            className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Pesquisar por nome ou código..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleCreate}
                        className="bg-white border-b-4 border-blue-600 text-blue-800 px-8 py-2 font-black flex items-center gap-2 shadow-lg transition-all hover:bg-slate-50 uppercase text-[10px] tracking-widest active:scale-95"
                    >
                        <Plus size={18}/> CRIAR PROFISSÃO INTERNA
                    </button>
                </div>

                {/* List - Professional Style */}
                <div className="flex-1 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-sm">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 bg-slate-900 p-3 border-b border-slate-700 text-xs font-black text-white uppercase tracking-widest sticky top-0">
                        <div className="col-span-2">Código</div>
                        <div className="col-span-6">Descrição da Profissão</div>
                        <div className="col-span-3">Categoria</div>
                        <div className="col-span-1 text-center">Ações</div>
                    </div>
                    
                    {/* Rows */}
                    <div className="divide-y divide-slate-100 uppercase">
                        {filtered.map((p, idx) => (
                            <div 
                                key={p.id} 
                                className={`grid grid-cols-12 p-3 text-[11px] items-center hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                            >
                                <div className="col-span-2 font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded w-fit border border-blue-100">{p.code}</div>
                                <div className="col-span-6 font-black text-slate-800">{p.name}</div>
                                <div className="col-span-3 text-slate-500 font-bold">{p.category}</div>
                                <div className="col-span-1 flex justify-center gap-2">
                                    {onSelect ? (
                                        <button onClick={() => onSelect(p)} className="text-blue-600 hover:bg-blue-100 p-1.5 rounded" title="Selecionar">
                                            <Check size={16}/>
                                        </button>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEdit(p)} className="text-slate-400 hover:text-blue-600 p-1.5 rounded transition-all">
                                                <Edit2 size={16}/>
                                            </button>
                                            <button onClick={() => onDelete(p.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded transition-all">
                                                <Trash2 size={16}/>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {filtered.length === 0 && (
                        <div className="p-20 text-center text-slate-300 font-black uppercase tracking-[5px] italic">
                            Nenhuma profissão arquivada na cloud.
                        </div>
                    )}
                </div>
            </div>
        )}

        {view === 'FORM' && (
            <div className="p-8 max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-100 overflow-hidden animate-in zoom-in-95">
                    <div className="bg-slate-900 p-6 border-b-4 border-blue-600 flex items-center gap-4">
                        <div className="p-3 bg-blue-600 text-white rounded-2xl"><BookOpen size={24}/></div>
                        <h3 className="font-black text-white text-xl uppercase tracking-tighter">{formData.id ? 'Editar Profissão' : 'Cadastrar Profissão Interna'}</h3>
                    </div>
                    <div className="p-10 space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Código de Referência (INSS) *</label>
                            <input 
                                className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl font-mono font-bold text-blue-700 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                                placeholder="Ex: 010.5"
                                value={formData.code}
                                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Nome Oficial da Profissão *</label>
                            <input 
                                className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl font-black text-slate-800 uppercase outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                                placeholder="Ex: Analista de Sistemas Senior"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Categoria / Departamento</label>
                            <select 
                                className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="Geral">Geral</option>
                                <option value="Administrativo">Administrativo</option>
                                <option value="Técnico">Técnico</option>
                                <option value="Operacional">Operacional</option>
                                <option value="Gestão">Gestão</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Salário Base Ref.</label>
                                <input 
                                    type="number"
                                    className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl font-black text-blue-600 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                                    value={formData.baseSalary}
                                    onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Ajudas de Custo Ref.</label>
                                <input 
                                    type="number"
                                    className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl font-black text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                                    value={formData.complement}
                                    onChange={e => setFormData({...formData, complement: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-8 bg-slate-950 flex justify-end gap-4">
                        <button onClick={() => setView('LIST')} className="px-8 py-3 border-2 border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all">Cancelar</button>
                        <button onClick={handleSaveForm} className="bg-blue-600 text-white px-12 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-blue-500 transition-all transform active:scale-95 flex items-center gap-2">
                            <Save size={18}/> GRAVAR PROFISSÃO
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ProfessionManager;
