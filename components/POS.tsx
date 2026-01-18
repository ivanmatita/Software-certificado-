
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Product, Client, Invoice, InvoiceItem, InvoiceType, 
  InvoiceStatus, PaymentMethod, CashRegister, DocumentSeries, 
  POSConfig, Company, User, WorkLocation, Warehouse, RestaurantTable,
  POSArea
} from '../types';
import { formatCurrency, generateId, formatDate, generateQrCodeUrl } from '../utils';
import { 
  Search, ShoppingCart, Trash2, Plus, Minus, User as UserIcon, 
  X, CreditCard, Monitor, CornerUpLeft, Printer, Image as ImageIcon, 
  AlertTriangle, ArrowRightLeft, Tag, MessageSquare, Utensils, 
  BedDouble, ShoppingBag, LayoutGrid, CheckCircle2, History,
  Maximize2, Minimize2, Split, DollarSign, Calculator,
  BriefcaseBusiness, UserPlus, ChevronRight, ChevronLeft, UtensilsCrossed, ScrollText, Save
} from 'lucide-react';

// Define the interface for restaurant order items to ensure type safety within the component
interface RestaurantOrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  observations?: string;
  status: 'PENDING' | 'PREPARING' | 'READY';
}

// --- OrderForm Component for Restaurant Mode ---

interface OrderFormProps {
    table: RestaurantTable | null;
    menuItems: Partial<Product>[];
    onCancel: () => void;
    onSave: (cart: RestaurantOrderItem[], waiter: string, type: string) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ table, menuItems, onCancel, onSave }) => {
    const [waiter, setWaiter] = useState('Admin');
    const [orderType, setOrderType] = useState<'SALAO' | 'BALCAO' | 'DELIVERY'>('SALAO');
    const [cart, setCart] = useState<RestaurantOrderItem[]>([]);

    const addToCart = (product: any) => {
      const existing = cart.find(i => i.productId === product.id);
      if (existing) {
        setCart(cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        setCart([...cart, { id: generateId(), productId: product.id, name: product.name, quantity: 1, price: product.price, status: 'PENDING' }]);
      }
    };

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <button onClick={onCancel} className="flex items-center gap-2 hover:text-blue-400 transition">
            <ChevronLeft/> <span className="font-bold uppercase text-xs">Voltar às Mesas</span>
          </button>
          <h2 className="font-black uppercase tracking-tighter">Novo Pedido - Mesa {table?.number}</h2>
          <div className="w-20"></div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Garçom</label>
              <input className="w-full p-2 border rounded-lg" value={waiter} onChange={e => setWaiter(e.target.value)}/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tipo de Serviço</label>
              <select className="w-full p-2 border rounded-lg font-bold" value={orderType} onChange={e => setOrderType(e.target.value as any)}>
                <option value="SALAO">Salão</option>
                <option value="BALCAO">Balcão / Take-away</option>
                <option value="DELIVERY">Delivery</option>
              </select>
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cliente (Opcional)</label>
               <input className="w-full p-2 border rounded-lg" placeholder="Nome do cliente..."/>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><ScrollText size={18}/> Selecionar Itens</h3>
                <div className="relative w-64">
                   <Search className="absolute left-2 top-2 text-slate-400" size={16}/>
                   <input className="w-full pl-8 p-1.5 border rounded-lg text-sm" placeholder="Pesquisar prato..."/>
                </div>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {menuItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => addToCart(item)}
                    className="bg-slate-50 p-4 rounded-xl border-2 border-transparent hover:border-blue-500 hover:bg-white cursor-pointer transition-all flex flex-col justify-between h-32"
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span>
                    <span className="font-bold text-slate-800 text-sm leading-tight">{item.name}</span>
                    <span className="font-black text-blue-600 mt-2">{formatCurrency(item.price!)}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="lg:col-span-5 bg-slate-50 rounded-2xl border p-6 flex flex-col h-full min-h-[500px]">
             <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2"><ShoppingCart size={18}/> Resumo do Pedido</h3>
             <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.quantity} x {formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="font-black text-slate-700">{formatCurrency(item.price * item.quantity)}</span>
                       <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50">
                    <UtensilsCrossed size={48}/>
                    <p className="font-bold uppercase text-xs">Carrinho Vazio</p>
                  </div>
                )}
             </div>
             <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between font-bold text-slate-600"><span>Subtotal:</span><span>{formatCurrency(cart.reduce((a,b)=>a+(b.price*b.quantity), 0))}</span></div>
                <button 
                  onClick={() => onSave(cart, waiter, orderType)}
                  disabled={cart.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <Save size={20}/> ENVIAR PARA COZINHA
                </button>
             </div>
          </div>
        </div>
      </div>
    );
}

// --- POS Main Component ---

interface POSProps {
  products: Product[];
  clients: Client[];
  invoices: Invoice[];
  series: DocumentSeries[];
  cashRegisters: CashRegister[];
  config: POSConfig;
  onSaveInvoice: (invoice: Invoice, seriesId: string, action?: 'PRINT' | 'CERTIFY') => void;
  onGoBack: () => void;
  currentUser: User;
  company: Company;
  workLocations?: WorkLocation[];
  warehouses?: Warehouse[];
}

const POS: React.FC<POSProps> = ({ 
  products, clients, invoices, series, cashRegisters, config, 
  onSaveInvoice, onGoBack, currentUser, company, workLocations = [], warehouses = []
}) => {
  // --- STATE ---
  const [selectedArea, setSelectedArea] = useState<POSArea | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(config.defaultSeriesId || '');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(config.defaultPaymentMethod);
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedWorkLocationId, setSelectedWorkLocationId] = useState('');
  const [activeInternalView, setActiveInternalView] = useState<'GRID' | 'ORDER_FORM' | 'COMANDA' | 'PAYMENT'>('GRID');
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [tables, setTables] = useState<RestaurantTable[]>([
    { id: '1', number: 1, capacity: 4, status: 'OCCUPIED', currentOrderValue: 12500 },
    { id: '2', number: 2, capacity: 2, status: 'AVAILABLE' },
    { id: '3', number: 3, capacity: 6, status: 'AVAILABLE' },
    { id: '4', number: 4, capacity: 4, status: 'OCCUPIED', currentOrderValue: 5400 },
    { id: '5', number: 5, capacity: 4, status: 'AVAILABLE' },
    { id: '6', number: 6, capacity: 2, status: 'RESERVED' },
  ]);

  const [orders, setOrders] = useState<any[]>([]);

  // --- INITIALIZATION ---
  useEffect(() => {
      if (!selectedSeriesId && series.length > 0) {
          const posSeries = series.find(s => s.type === 'POS' || s.code.includes('POS')) || series[0];
          setSelectedSeriesId(posSeries.id);
      }
      if (!selectedClient && config.defaultClientId) {
          const defClient = clients.find(c => c.id === config.defaultClientId);
          if(defClient) setSelectedClient(defClient);
      }
      if (workLocations.length > 0 && !selectedWorkLocationId) {
          setSelectedWorkLocationId(workLocations[0].id);
      }
  }, [series, clients, config, workLocations]);

  // --- LOGIC ---
  const categories = useMemo(() => {
      const cats = new Set(products.map(p => p.category || 'Geral'));
      return ['ALL', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
      return products.filter(p => {
          const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (p.barcode && p.barcode.includes(searchTerm));
          const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
          return matchSearch && matchCat;
      });
  }, [products, searchTerm, selectedCategory]);

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const discountAmount = subtotal * (globalDiscount / 100);
  const cartTotal = subtotal - discountAmount;
  const changeAmount = Math.max(0, receivedAmount - cartTotal);

  const addToCart = (product: Product) => {
      const existing = cart.find(i => i.productId === product.id);
      if (existing) {
          updateQuantity(existing.id, existing.quantity + 1);
      } else {
          const newItem: InvoiceItem = {
              id: generateId(),
              productId: product.id,
              type: 'PRODUCT',
              description: product.name,
              quantity: 1,
              unitPrice: product.price,
              discount: 0,
              taxRate: 14,
              total: product.price,
              rubrica: '61.1'
          };
          setCart([...cart, newItem]);
      }
  };

  const updateQuantity = (itemId: string, newQty: number) => {
      if (newQty <= 0) {
          setCart(cart.filter(item => item.id !== itemId));
          return;
      }
      setCart(cart.map(item => {
          if (item.id === itemId) {
              const total = newQty * item.unitPrice * (1 - item.discount / 100);
              return { ...item, quantity: newQty, total };
          }
          return item;
      }));
  };

  const handleSaveOrder = (newItems: RestaurantOrderItem[], waiter: string, type: any) => {
    if (!selectedTable) return;
    const newOrder = {
      id: generateId(),
      tableId: selectedTable.id,
      tableNumber: selectedTable.number,
      waiterName: waiter,
      type: type,
      status: 'PREPARING',
      createdAt: new Date().toISOString(),
      items: newItems
    };
    setOrders([...orders, newOrder]);
    setTables(tables.map(t => t.id === selectedTable.id ? { ...t, status: 'OCCUPIED', currentOrderValue: newItems.reduce((acc, i) => acc + i.price * i.quantity, 0) } : t));
    setActiveInternalView('GRID');
    setSelectedTable(null);
    alert("Pedido enviado para a cozinha (KDS)!");
  };

  const handleFinalize = () => {
      if (cart.length === 0 || !selectedSeriesId) return;

      const totalItemsPrice = cart.reduce((acc, i) => acc + i.total, 0);
      const totalDisc = totalItemsPrice * (globalDiscount / 100);
      const finalTotal = totalItemsPrice - totalDisc;
      const finalTax = finalTotal - (finalTotal / 1.14);

      const newInvoice: Invoice = {
          id: generateId(),
          type: InvoiceType.FR,
          seriesId: selectedSeriesId,
          number: 'POS-Pending',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
          dueDate: new Date().toISOString().split('T')[0],
          accountingDate: new Date().toISOString().split('T')[0],
          clientId: selectedClient?.id || 'CONSUMIDOR_FINAL',
          clientName: selectedClient?.name || 'Consumidor Final',
          clientNif: selectedClient?.vatNumber || '999999999',
          items: cart,
          subtotal: finalTotal / 1.14,
          globalDiscount: globalDiscount,
          taxRate: 14,
          taxAmount: finalTax,
          total: finalTotal,
          paidAmount: finalTotal,
          currency: 'AOA',
          exchangeRate: 1,
          status: InvoiceStatus.PAID,
          isCertified: true,
          companyId: company.id,
          workLocationId: selectedWorkLocationId || currentUser.workLocationId || '',
          paymentMethod: paymentMethod,
          cashRegisterId: cashRegisters.find(c => c.status === 'OPEN')?.id,
          operatorName: currentUser.name,
          notes: orderNotes,
          source: 'POS'
      };

      onSaveInvoice(newInvoice, selectedSeriesId, 'CERTIFY');
      setLastInvoice(newInvoice);
      setCart([]);
      setReceivedAmount(0);
      setGlobalDiscount(0);
      setOrderNotes('');
      setShowPaymentModal(false);
      setShowReceipt(true);
  };

  const handleTableClick = (table: RestaurantTable) => {
    setSelectedTable(table);
    if (table.status === 'AVAILABLE') {
      setActiveInternalView('ORDER_FORM');
    } else {
      setActiveInternalView('COMANDA');
    }
  };

  // --- RENDERERS ---

  if (!selectedArea) {
      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
              <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                      <Monitor size={40}/>
                  </div>
                  <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Ponto de Venda Central</h1>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2">Selecione a área operacional para iniciar</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
                  {[
                      { id: 'RETAIL', label: 'Venda de Balcão / Loja', icon: ShoppingBag, color: 'blue', desc: 'Faturação direta e ágil' },
                      { id: 'RESTAURANT', label: 'Restaurante / Bar', icon: Utensils, color: 'orange', desc: 'Gestão de mesas e comandas' },
                      { id: 'HOTEL', label: 'Hotelaria / Alojamento', icon: BedDouble, color: 'indigo', desc: 'Reservas e check-out' },
                      { id: 'GENERAL', label: 'Vendas Corporativas', icon: BriefcaseBusiness, color: 'slate', desc: 'Documentos personalizados' }
                  ].map((area) => (
                      <button 
                        key={area.id}
                        onClick={() => setSelectedArea(area.id as any)}
                        className="bg-white/5 hover:bg-white/10 border-2 border-white/5 hover:border-blue-500 p-8 rounded-[2rem] flex flex-col items-center gap-6 transition-all duration-300 group hover:-translate-y-2"
                      >
                          <div className={`p-6 rounded-2xl bg-white/10 text-white group-hover:scale-110 transition-transform`}>
                              <area.icon size={48}/>
                          </div>
                          <div className="text-center">
                              <h3 className="text-white font-black text-lg uppercase tracking-tight mb-1">{area.label}</h3>
                              <p className="text-slate-500 text-xs font-medium">{area.desc}</p>
                          </div>
                      </button>
                  ))}
              </div>

              <button 
                onClick={onGoBack}
                className="mt-12 text-slate-500 font-bold uppercase text-xs hover:text-white transition flex items-center gap-2"
              >
                  <CornerUpLeft size={16}/> Sair do PDV
              </button>
          </div>
      );
  }

  const ReceiptView = () => {
    if (!lastInvoice) return null;
    return (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-[450px] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={24}/>
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter">Venda Concluída</h3>
                  </div>
                  <button onClick={() => setShowReceipt(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X/></button>
              </div>
              
              <div className="bg-white p-6 rounded-2xl w-full font-mono text-[10px] text-black shadow-inner border border-slate-200 overflow-y-auto max-h-[60vh] custom-scrollbar" id="receipt-thermal">
                  <div className="text-center mb-4 border-b border-dashed border-slate-300 pb-4">
                      <h4 className="font-black text-sm uppercase tracking-tight">{company.name}</h4>
                      <p className="text-[9px] text-slate-500">{company.address}</p>
                      <p className="text-[9px] text-slate-500">NIF: {company.nif}</p>
                  </div>
                  <div className="space-y-1 mb-4">
                      <p className="flex justify-between"><span>Data:</span> <span>{formatDate(lastInvoice.date)} {lastInvoice.time}</span></p>
                      <p className="flex justify-between"><span>Série:</span> <span>{lastInvoice.seriesId}</span></p>
                      <p className="flex justify-between font-bold"><span>Doc:</span> <span>{lastInvoice.number}</span></p>
                  </div>
                  <div className="border-y border-dashed border-slate-300 py-2 mb-4">
                      {lastInvoice.items.map((item, i) => (
                          <div key={i} className="flex justify-between mb-1">
                              <span>{item.quantity}x {item.description}</span>
                              <span>{formatCurrency(item.total)}</span>
                          </div>
                      ))}
                  </div>
                  <div className="text-right space-y-1">
                      <p className="flex justify-between"><span>Subtotal:</span> <span>{formatCurrency(lastInvoice.subtotal)}</span></p>
                      <p className="flex justify-between"><span>IVA (14%):</span> <span>{formatCurrency(lastInvoice.taxAmount)}</span></p>
                      <p className="flex justify-between font-black text-sm"><span>TOTAL:</span> <span>{formatCurrency(lastInvoice.total)}</span></p>
                  </div>
                  <div className="mt-6 text-center">
                      <img src={generateQrCodeUrl(lastInvoice.hash || 'POS')} alt="QR" className="w-24 h-24 mx-auto mb-2"/>
                      <p className="text-[8px] uppercase font-bold">{lastInvoice.hash}</p>
                      <p className="text-[8px] uppercase mt-2">Processado por Programa Certificado nº 25/AGT/2019</p>
                      <p className="text-[8px] uppercase">Obrigado pela preferência!</p>
                  </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                  <button onClick={() => { window.print(); }} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                      <Printer size={18}/> Imprimir
                  </button>
                  <button onClick={() => setShowReceipt(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">
                      Fechar
                  </button>
              </div>
          </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (selectedArea) {
      case 'RESTAURANT':
        // Fix: Use products prop as menuItems in Restaurant mode
        if (activeInternalView === 'ORDER_FORM') return <OrderForm table={selectedTable} menuItems={products} onCancel={() => setActiveInternalView('GRID')} onSave={handleSaveOrder} />;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4">
            {tables.map(table => (
              <div 
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`p-8 rounded-[3rem] border-4 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer hover:scale-105 shadow-xl relative group ${table.status === 'AVAILABLE' ? 'bg-white border-slate-50 text-slate-400 hover:border-blue-500' : 'bg-blue-600 border-blue-400 text-white shadow-blue-500/20'}`}
              >
                <span className="text-4xl font-black">{table.number}</span>
                <p className="text-[10px] font-black uppercase tracking-widest">{table.status}</p>
              </div>
            ))}
          </div>
        );
      case 'RETAIL':
      default:
        return (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4 flex items-center gap-4">
                <button onClick={() => setSelectedArea(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ChevronLeft size={24}/></button>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={20}/>
                  <input className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Pesquisar produto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                </div>
              </div>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full font-bold text-xs uppercase whitespace-nowrap transition ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border hover:bg-slate-50'}`}>{cat}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-2 custom-scrollbar">
                {filteredProducts.map(product => (
                  <div key={product.id} onClick={() => addToCart(product)} className="bg-white p-4 rounded-2xl border-2 border-transparent hover:border-blue-500 shadow-sm cursor-pointer transition-all flex flex-col h-48">
                    <div className="h-24 bg-slate-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"/> : <ImageIcon className="text-slate-300" size={32}/>}
                    </div>
                    <h4 className="font-bold text-slate-800 text-xs line-clamp-2">{product.name}</h4>
                    <p className="font-black text-blue-600 text-sm mt-auto">{formatCurrency(product.price)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-96 bg-white border-l flex flex-col shadow-xl">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50"><h3 className="font-black text-slate-800 uppercase tracking-tighter">Carrinho</h3></div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-xl border flex flex-col gap-2">
                    <div className="flex justify-between items-start"><h5 className="font-bold text-slate-700 text-[11px]">{item.description}</h5></div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center bg-white border rounded-lg px-2 py-1 gap-4">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-slate-400"><Minus size={14}/></button>
                        <span className="font-black text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-slate-400"><Plus size={14}/></button>
                      </div>
                      <span className="font-black text-slate-800 text-xs">{formatCurrency(item.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-slate-900 text-white rounded-t-[2rem] space-y-4">
                <div className="flex justify-between font-black text-xl border-t border-white/10 pt-4"><span>TOTAL</span><span>{formatCurrency(cartTotal)}</span></div>
                <button onClick={() => setShowPaymentModal(true)} disabled={cart.length === 0} className="w-full bg-blue-600 py-4 rounded-2xl font-black text-sm">FINALIZAR VENDA</button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
        {showReceipt && <ReceiptView />}
        {renderContent()}
        {showPaymentModal && (
          <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border"><p className="text-[10px] font-black text-slate-400 uppercase">Total</p><h4 className="text-4xl font-black font-mono">{formatCurrency(cartTotal)}</h4></div>
                <div className="grid grid-cols-2 gap-4">
                  {['CASH', 'MULTICAIXA', 'TRANSFER'].map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m as PaymentMethod)} className={`p-4 border-2 rounded-2xl font-black text-[10px] ${paymentMethod === m ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}>{m}</button>
                  ))}
                </div>
                <input type="number" className="w-full p-4 border-2 rounded-2xl text-2xl font-black" value={receivedAmount || ''} onChange={e => setReceivedAmount(Number(e.target.value))} placeholder="Recebido"/>
              </div>
              <div className="flex flex-col justify-between">
                <div className="bg-blue-900 text-white p-8 rounded-[2rem]"><p className="text-[10px] font-black uppercase mb-2">Troco</p><h4 className="text-5xl font-black font-mono">{formatCurrency(changeAmount)}</h4></div>
                <button onClick={handleFinalize} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-lg">CONFIRMAR E EMITIR</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default POS;
