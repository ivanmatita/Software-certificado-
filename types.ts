
export enum InvoiceStatus {
  DRAFT = 'Rascunho',
  PENDING = 'Pendente',
  PAID = 'Pago',
  PARTIAL = 'Parcelar',
  OVERDUE = 'Vencido',
  CANCELLED = 'Anulado'
}

export enum IntegrationStatus {
  EMITTED = 'Emitido',
  VALIDATED = 'Validado',
  ACCOUNTED = 'Contabilizado',
  REPORTED = 'Reportado AGT'
}

export enum InvoiceType {
  FT = 'Fatura',
  FR = 'Fatura/Recibo',
  PP = 'Fatura Pró-forma',
  OR = 'Orçamento',
  GR = 'Guia de Remessa',
  GT = 'Guia de Transporte',
  GE = 'Guia de Entrega',
  NE = 'Nota de Encomenda',
  NC = 'Nota de Crédito',
  ND = 'Nota de Débito',
  RG = 'Recibo',
  VD = 'Venda a Dinheiro',
  FS = 'Fatura Simplificada'
}

export enum PurchaseType {
  FT = 'Fatura Fornecedor',
  FR = 'Fatura/Recibo Fornecedor',
  ND = 'Nota de Débito',
  NC = 'Nota de Crédito',
  VD = 'Venda a Dinheiro',
  REC = 'Recibo'
}

export enum POSArea {
  RETAIL = 'Venda de Balcão / Loja',
  RESTAURANT = 'Restaurante / Bar',
  HOTEL = 'Hotelaria / Alojamento',
  CORPORATE = 'Vendas Corporativas'
}

export type PaymentMethod = 'CASH' | 'MULTICAIXA' | 'TRANSFER' | 'CHECK' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MCX_EXPRESS' | 'OTHERS' | 'CREDIT_ACCOUNT';

export type LicensePlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type CompanyStatus = 'TEST' | 'ACTIVE' | 'SUSPENDED';

export type AppLanguage = 'PT' | 'EN' | 'FR';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; 
  time?: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Bank {
  id: string;
  nome: string;
  sigla: string;
  iban: string;
  swift: string;
  accountNumber?: string;
  nib?: string;
}

export interface Metric {
  id: string;
  nome: string;
  sigla: string;
}

export type ViewState = 
  | 'DASHBOARD' 
  | 'WORKSPACE' 
  | 'PROJECT_REPORT'
  | 'SECRETARIA_LIST' 
  | 'SECRETARIA_FORM'
  | 'ARCHIVES'
  | 'INVOICES_GROUP' 
  | 'CREATE_INVOICE' 
  | 'INVOICES' 
  | 'ACCOUNTING_REGULARIZATION' 
  | 'CLIENTS' 
  | 'PURCHASES_GROUP' 
  | 'CREATE_PURCHASE' 
  | 'PURCHASES' 
  | 'SUPPLIERS' 
  | 'PURCHASE_ANALYSIS' 
  | 'STOCK_GROUP' 
  | 'STOCK' 
  | 'FINANCE_GROUP' 
  | 'FINANCE_CASH' 
  | 'FINANCE_MAPS' 
  | 'FINANCE_REPORTS' 
  | 'FINANCE_TAX_DOCS'
  | 'ACCOUNTING_GROUP' 
  | 'ACCOUNTING_VAT' 
  | 'ACCOUNTING_PGC' 
  | 'ACCOUNTING_CLASSIFY_GROUP'
  | 'ACCOUNTING_CLASSIFY_SALES'
  | 'ACCOUNTING_CLASSIFY_PURCHASES'
  | 'ACCOUNTING_CLASSIFY_SALARY_PROC'
  | 'ACCOUNTING_CLASSIFY_SALARY_PAY' 
  | 'ACCOUNTING_RUBRICAS_GROUP'
  | 'ACCOUNTING_RUBRICAS_SALES'
  | 'ACCOUNTING_RUBRICAS_PURCHASES'
  | 'ACCOUNTING_MAPS'
  | 'ACCOUNTING_DECLARATIONS'
  | 'ACCOUNTING_TAXES'
  | 'ACCOUNTING_CALC'
  | 'ACCOUNTING_SAFT'
  | 'ACCOUNTING_OPENING_BALANCE'
  | 'ACCOUNTING_ACCOUNT_EXTRACT'
  | 'HR_GROUP'
  | 'HR'
  | 'HR_EMPLOYEES'
  | 'HR_PERFORMANCE'
  | 'HR_CONTRACT_ISSUE'
  | 'HR_TRANSFER_ORDER'
  | 'HR_EFFECTIVENESS'
  | 'HR_SALARY_LIST'
  | 'HR_ID_CARDS'
  | 'SETTINGS'
  | 'SETTINGS_TAX_TABLE'
  | 'POS_GROUP'
  | 'POS'
  | 'CASH_CLOSURE'
  | 'CASH_CLOSURE_HISTORY'
  | 'POS_SETTINGS'
  | 'SCHOOL_GROUP'
  | 'SCHOOL_STUDENTS'
  | 'SCHOOL_TEACHERS'
  | 'SCHOOL_ACADEMIC'
  | 'SCHOOL_DOCUMENTS'
  | 'SCHOOL_REPORTS'
  | 'RESTAURANT_GROUP'
  | 'RESTAURANT_MENU'
  | 'RESTAURANT_TABLES'
  | 'RESTAURANT_KDS'
  | 'RESTAURANT_PRODUCTION'
  | 'HOTEL_GROUP'
  | 'HOTEL_ROOMS'
  | 'HOTEL_RESERVATIONS'
  | 'HOTEL_CHECKIN'
  | 'HOTEL_GOVERNANCE'
  | 'REPORTS_GROUP'
  | 'REPORTS_MONTHLY'
  | 'REPORTS_YEARLY'
  | 'REPORTS_DEBTS'
  | 'REPORTS_MOVEMENTS';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  password?: string;
  phone?: string;
  accessValidity?: string;
  role: 'ADMIN' | 'OPERATOR' | 'ACCOUNTANT';
  companyId: string;
  permissions: ViewState[];
  createdAt: string;
  avatar?: string;
  workLocationId?: string;
}

export interface Company {
  id: string;
  name: string;
  nif: string;
  address: string;
  email: string;
  phone: string;
  regime: 'Regime Geral' | 'Regime Simplificado' | 'Regime de Exclusão';
  licensePlan: LicensePlan;
  status: CompanyStatus;
  validUntil: string;
  registrationDate: string;
  logo?: string;
  postalCode?: string;
  registrationNumber?: string;
  licenseNumber?: string;
  inssNumber?: string;
  companyType?: string;
  cashVAT?: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  vatNumber: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  accountBalance: number;
  initialBalance: number;
  clientType: string;
  province: string;
  municipality?: string;
  postalCode?: string;
  webPage?: string;
  iban?: string;
  isAccountShared?: boolean;
  transactions: any[];
}

export interface TaxRate {
  id: string;
  name: string;
  percentage: number;
  type: 'IVA' | 'IS' | 'OUT';
  region: string;
  code: string;
  description: string;
  exemptionCode?: string;
  exemptionReason?: string;
  startDate: string;
  isActive: boolean;
}

export interface WorkLocation {
  id: string;
  name: string;
  address: string;
  managerName?: string;
}

export interface Employee {
  id: string;
  idnf?: string;
  employeeNumber?: string;
  name: string;
  nif: string;
  biNumber: string;
  ssn: string;
  role: string;
  professionId?: string;
  professionName?: string;
  department: string;
  baseSalary: number;
  complementSalary?: number;
  status: 'Active' | 'Terminated' | 'OnLeave';
  admissionDate: string;
  terminationDate?: string;
  contractType: 'Determinado' | 'Indeterminado' | 'Estagio';
  contractClauses?: string[];
  isCashier?: boolean;
  
  // Subsidies
  subsidyTransport: number;
  subsidyTransportStart?: string;
  subsidyTransportEnd?: string;
  subsidyFood: number;
  subsidyFoodStart?: string;
  subsidyFoodEnd?: string;
  subsidyFamily: number;
  subsidyFamilyStart?: string;
  subsidyFamilyEnd?: string;
  subsidyHousing: number;
  subsidyHousingStart?: string;
  subsidyHousingEnd?: string;
  subsidyChristmas: number;
  subsidyChristmasStart?: string;
  subsidyChristmasEnd?: string;
  subsidyVacation: number;
  subsidyVacationStart?: string;
  subsidyVacationEnd?: string;
  otherSubsidies?: number;
  subsidyExtra?: number;
  subsidyExtraStart?: string;
  subsidyExtraEnd?: string;
  subsidyOther?: number;
  subsidyOtherStart?: string;
  subsidyOtherEnd?: string;
  
  // Financial Adjustments
  salaryAdjustments?: number;
  penalties?: number;
  advances?: number;
  advancesStart?: string;
  advancesEnd?: string;
  allowances?: number;
  allowancesStart?: string;
  allowancesEnd?: string;
  
  // UI States
  isMagic?: boolean;
  isItemChecked?: boolean;
  
  // Others
  photoUrl?: string;
  bankAccount?: string;
  bankName?: string;
  iban?: string;
  email?: string;
  phone?: string;
  gender: 'M' | 'F';
  birthDate: string;
  maritalStatus: 'Solteiro' | 'Casado' | 'Divorciado' | 'Viuvo';
  address: string;
  municipality: string;
  neighborhood: string;
  province?: string;
  country?: string;
  nationality?: string;
  workLocationId?: string;
  companyId?: string;
  turnoverRisk?: 'Low' | 'Medium' | 'High';
  performanceScore?: number;
  category?: string;
}

export interface SalarySlip {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  professionCode?: string;
  baseSalary: number;
  allowances: number;
  bonuses: number;
  subsidies: number;
  subsidyTransport: number;
  subsidyFood: number;
  subsidyFamily: number;
  subsidyHousing: number;
  absences: number;
  advances: number;
  grossTotal: number;
  inss: number;
  irt: number;
  netTotal: number;
  transferred?: boolean; // New Field for Transfer tracking
  attendanceDetails?: {
    folgas: number;
    servicos: number;
    faltasJust: number;
    faltasInjust: number;
    ferias: number;
  };
}

export interface HrTransaction {
  id: string;
  employeeId: string;
  date: string;
  type: 'BONUS' | 'ALLOWANCE' | 'ABSENCE' | 'ADVANCE';
  amount: number;
  description: string;
  processed?: boolean;
}

export interface HrVacation {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'REQUESTED' | 'APPROVED' | 'CANCELLED';
  year: number;
}

export interface Profession {
  id: string;
  code: string;
  name: string;
  category: string;
  indexedProfessionName?: string;
  indexedProfessionCode?: string;
  baseSalary?: number;
  complement?: number;
  createdAt?: string;
  userName?: string;
  description?: string;
  group?: string;
}

export interface Contract {
  id: string;
  employeeId: string;
  type: 'Determinado' | 'Indeterminado' | 'Estagio';
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Terminated' | 'OnLeave';
  clauses: string[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Folga' | 'Servico' | 'FaltaJustificada' | 'FaltaInjustificada' | 'Ferias';
  justification?: string;
  overtimeHours?: number;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  reference?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
  type?: 'PRODUCT' | 'SERVICE';
  expiryDate?: string;
  valueDate?: string;
  showMetrics?: boolean;
  length?: number;
  width?: number;
  height?: number;
  rubrica?: string;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  seriesId: string;
  seriesCode?: string;
  number: string;
  date: string;
  time?: string;
  dueDate: string;
  accountingDate: string;
  clientId: string;
  clientName: string;
  clientNif?: string;
  items: InvoiceItem[];
  subtotal: number;
  globalDiscount: number;
  taxRate: number;
  taxAmount: number;
  withholdingAmount?: number;
  retentionType?: 'NONE' | 'CAT_50' | 'CAT_100';
  retentionAmount?: number;
  total: number;
  paidAmount?: number;
  currency: string;
  exchangeRate: number;
  contraValue?: number;
  status: InvoiceStatus;
  notes?: string;
  isCertified: boolean;
  hash?: string;
  companyId: string;
  workLocationId?: string;
  paymentMethod?: PaymentMethod;
  cashRegisterId?: string;
  operatorName?: string;
  typology?: string;
  source?: 'MANUAL' | 'POS';
  attachment?: string;
  sourceInvoiceId?: string;
  cancellationReason?: string;
  integrationStatus?: IntegrationStatus;
  processedAt?: string;
  targetWarehouseId?: string;
  deliveryAddress?: string;
}

export interface PurchaseItem {
  id: string;
  productId?: string;
  description: string;
  reference?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxAmount?: number;
  total: number;
  rubrica?: string;
  warehouseId?: string;
  itemType?: string;
  length?: number;
  width?: number;
  height?: number;
  showMetrics?: boolean;
  withholdingRate?: number;
  withholdingAmount?: number;
  expiryDate?: string;
}

export interface Purchase {
  id: string;
  type: PurchaseType;
  supplierId: string;
  supplier: string;
  nif: string;
  date: string;
  dueDate: string;
  documentNumber: string;
  hash?: string;
  items: PurchaseItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  globalDiscount?: number;
  currency?: string;
  exchangeRate?: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  notes?: string;
  workLocationId?: string;
  warehouseId?: string;
  paymentMethod?: PaymentMethod;
  cashRegisterId?: string;
  attachment?: string;
  integrationStatus?: IntegrationStatus;
  processedAt?: string;
  retentionType?: 'NONE' | 'CAT_50' | 'CAT_100';
}

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  price: number;
  unit?: string;
  category?: string;
  stock: number;
  warehouseId?: string;
  priceTableId?: string;
  minStock?: number;
  barcode?: string;
  imageUrl?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  description?: string;
  managerName?: string;
  contact?: string;
  observations?: string;
}

export interface PriceTable {
  id: string;
  name: string;
  percentage: number;
}

export interface StockMovement {
  id: string;
  date: string;
  type: 'ENTRY' | 'EXIT';
  productId: string;
  productName: string;
  quantity: number;
  warehouseId: string;
  documentRef?: string;
  notes?: string;
  expiryDate?: string;
  itemType?: string;
}

export interface CashRegister {
  id: string;
  name: string;
  status: 'OPEN' | 'CLOSED' | 'SUSPENDED';
  balance: number;
  initialBalance: number;
  operatorId?: string;
  notes?: string;
}

export interface DocumentSeries {
  id: string;
  name: string;
  code: string;
  type: 'NORMAL' | 'MANUAL' | 'POS';
  year: number;
  currentSequence: number;
  sequences: Record<string, number>;
  isActive: boolean;
  allowedUserIds: string[];
  bankDetails?: string;
  footerText?: string;
  logo?: string;
}

export interface Supplier {
  id: string;
  name: string;
  vatNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  municipality?: string;
  country: string;
  webPage?: string;
  inssNumber?: string;
  bankInitials?: string;
  iban?: string;
  swift?: string;
  supplierType: string;
  accountBalance: number;
  transactions: any[];
}

export interface CashMovement {
  id: string;
  date: string;
  type: 'ENTRY' | 'EXIT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  amount: number;
  description: string;
  cashRegisterId: string;
  targetCashRegisterId?: string;
  documentRef?: string;
  operatorName: string;
  source: 'SALES' | 'PURCHASES' | 'MANUAL';
}

export interface PGCAccount {
  id: string;
  code: string;
  description: string;
  type: 'CLASSE' | 'GRUPO' | 'SUBGRUPO' | 'CONTA' | 'SUBCONTA';
  nature: 'DEBITO' | 'CREDITO' | 'AMBOS';
  parentCode?: string;
  systemAuto?: boolean;
}

export interface SecretariaDocument {
  id: string;
  type: string;
  seriesId: string;
  seriesCode: string;
  number: string;
  date: string;
  dateExtended?: string;
  destinatarioNome: string;
  destinatarioIntro: string;
  destinatarioLocalidade?: string;
  destinatarioPais?: string;
  assunto: string;
  corpo: string;
  confidencial: boolean;
  imprimirPagina: boolean;
  createdBy: string;
  createdAt: string;
  isLocked: boolean;
  departamento: string;
}

export interface VatSettlement {
  id: string;
  month: number;
  year: number;
  dateProcessed: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  status: 'PROCESSED';
  details?: any;
}

export interface OpeningBalance {
  id: string;
  accountCode: string;
  description: string;
  debit: number;
  credit: number;
  year: number;
  balanceType: 'DEBIT' | 'CREDIT';
}

export interface UserActivityLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface POSConfig {
  defaultSeriesId: string;
  printerType: 'A4' | '80mm';
  autoPrint: boolean;
  allowDiscounts: boolean;
  defaultClientId: string;
  defaultPaymentMethod: PaymentMethod;
  showImages: boolean;
  quickMode: boolean;
}

export interface CashClosure {
  id: string;
  date: string;
  openedAt: string;
  closedAt: string;
  operatorId: string;
  operatorName: string;
  cashRegisterId: string;
  expectedCash: number;
  expectedMulticaixa: number;
  expectedTransfer: number;
  expectedCredit: number;
  totalSales: number;
  actualCash: number;
  difference: number;
  initialBalance: number;
  finalBalance: number;
  status: 'CLOSED';
  notes?: string;
}

export interface WorkProject {
  id: string;
  clientId: string;
  clientName: string;
  startDate: string;
  endDate?: string;
  title: string;
  code: string;
  personnelPerDay: number;
  totalPersonnel: number;
  location: string;
  description: string;
  contact: string;
  observations: string;
}

export interface DisciplinaryAction {
  id: string;
  employeeId: string;
  date: string;
  type: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
}

// School
export interface SchoolStudent {
  id: string;
  registrationNumber: string;
  name: string;
  birthDate: string;
  gender: 'M' | 'F';
  address: string;
  parentName: string;
  parentPhone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SchoolTeacher {
  id: string;
  name: string;
  nif: string;
  specialization: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SchoolClass {
  id: string;
  name: string;
  courseId: string;
  roomNumber: string;
  period: 'MANHÃ' | 'TARDE' | 'NOITE';
  year: number;
  capacity: number;
}

export interface SchoolCourse {
  id: string;
  name: string;
  duration: number;
}

export interface SchoolGrade {
  id: string;
  studentId: string;
  classId: string;
  subject: string;
  mac: number;
  cpp: number;
  exam: number;
  finalGrade: number;
}

export interface SchoolAttendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface SchoolAttendanceSummary {
  employeeId: string;
  employeeName: string;
  profession: string;
  nif: string;
  ssn: string;
  servico: number;
  folga: number;
  justificadas: number;
  injustificadas: number;
  ferias: number;
  total: number;
}

export interface SchoolOccurrence {
  id: string;
  studentId: string;
  date: string;
  type: string;
  description: string;
}

// Restaurant
export interface RestaurantTable {
  id: string;
  number: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  currentOrderValue?: number;
}

// Hotel
export interface HotelRoom {
  id: string;
  number: string;
  type: 'SINGLE' | 'DOUBLE' | 'SUITE' | 'MASTER';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE';
  dailyRate: number;
}

export interface HotelReservation {
  id: string;
  guestName: string;
  guestDoc?: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  totalValue: number;
}

export interface HotelConsumption {
  id: string;
  reservationId: string;
  description: string;
  category: 'RESTAURANT' | 'LAUNDRY' | 'BAR' | 'OTHERS';
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
}

// Archives
export interface ArchiveDocument {
  id: string;
  name: string;
  type: 'Administrativo' | 'Empresa' | 'Corporativo' | 'Clientes' | 'Outros';
  observations: string;
  contact: string;
  responsible: string;
  date: string;
  fileUrl?: string;
  isSigned: boolean;
  associatedDocNo?: string;
  occurrences: ArchiveOccurrence[];
}

export interface ArchiveOccurrence {
  id: string;
  date: string;
  description: string;
  user: string;
}

// Tax
export interface TaxDocument {
  id: string;
  dateDoc: string;
  dateContab: string;
  name: string;
  description: string;
  reference: string;
  amountPaid: number;
  observations: string;
  fileUrl?: string;
  fileName?: string;
  occurrences: TaxOccurrence[];
}

export interface TaxOccurrence {
  id: string;
  date: string;
  description: string;
  user: string;
}
