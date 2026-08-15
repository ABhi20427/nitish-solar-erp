export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SALES_MANAGER'
  | 'SALES_EXECUTIVE'
  | 'PROJECT_MANAGER'
  | 'FINANCE'
  | 'VIEWER';

export type CustomerType = 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'GOVERNMENT';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'SURVEY_SCHEDULED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATING'
  | 'WON'
  | 'LOST';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'NEGOTIATION'
  | 'ACCEPTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PARTIALLY_DELIVERED'
  | 'DELIVERED'
  | 'CANCELLED';

export type InventoryTransactionType =
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'RESERVATION'
  | 'ALLOCATION'
  | 'ADJUSTMENT';

export type InstallationStageType =
  | 'MATERIAL_DELIVERY'
  | 'MOUNTING'
  | 'PANEL_INSTALLATION'
  | 'INVERTER_INSTALLATION'
  | 'DC_WIRING'
  | 'AC_WIRING'
  | 'EARTHING'
  | 'TESTING'
  | 'COMMISSIONING';

export type ProjectStatus =
  | 'PLANNING'
  | 'SITE_SURVEY'
  | 'DESIGN'
  | 'ENGINEERING_DESIGN'
  | 'PROCUREMENT'
  | 'MATERIAL_DISPATCH'
  | 'INSTALLATION'
  | 'STRUCTURE_MOUNTING'
  | 'ELECTRICAL_WIRING'
  | 'TESTING'
  | 'GRID_SYNCHRONIZATION'
  | 'COMMISSIONING'
  | 'COMMISSIONED'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED';

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethod = 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CASH' | 'CARD' | 'OTHER';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  projectId?: string;
  projectNumber?: string;
  quotationId?: string;
  paymentTerms?: string;
  items?: QuotationItem[];
  subtotal: number;
  discountAmount?: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
}

export type ProductType =
  | 'SOLAR_PANEL'
  | 'INVERTER'
  | 'MOUNTING_STRUCTURE'
  | 'BATTERY_STORAGE'
  | 'CABLES'
  | 'PROTECTION_EQUIPMENT'
  | 'MONITORING_SYSTEM'
  | 'ACCESSORIES'
  | 'BOS_CABLE_SWITCHGEAR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  password?: string;
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  type: ProductType;
  brand: string;
  model?: string;
  capacity?: string;
  unit?: string;
  specifications?: Record<string, string | number>;
  unitPrice: number;
  costPrice?: number;
  gstPercentage?: number;
  pricePerWatt?: number;
  stockQuantity: number;
  quantityReserved?: number;
  quantityAllocated?: number;
  reorderLevel?: number;
  warehouseLocation?: string;
  warrantyYears: number;
  description?: string;
  imageUrl?: string;
}

export interface Lead {
  id: string;
  leadNumber: string;
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  customerType: CustomerType;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  monthlyBillAmount: number;
  proposedCapacityKw?: number;
  estimatedProjectValue?: number;
  roofType?: string;
  roofAreaSqFt?: number;
  status: LeadStatus;
  priority: Priority;
  source: string;
  notes?: string;
  assignedToId?: string;
  assignedToName?: string;
  nextFollowUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  customerNumber: string;
  leadId?: string;
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  customerType: CustomerType;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  gstNumber?: string;
  discomName?: string;
  consumerNumber?: string;
  sanctionedLoadKw?: number;
  assignedToId?: string;
  assignedToName?: string;
  totalProjectValue?: number;
  activeProjectsCount?: number;
  paymentStatus?: 'PAID' | 'PARTIALLY_PAID' | 'PENDING_PAYMENT' | 'OVERDUE';
  createdAt: string;
}

export interface SiteSurvey {
  id: string;
  surveyNumber: string;
  leadId?: string;
  leadNumber?: string;
  customerId?: string;
  customerName?: string;
  scheduledDate: string;
  completedDate?: string;
  surveyorName: string;
  siteAddress?: string;
  propertyType?: string;
  roofType?: string;
  roofLengthFt?: number;
  roofWidthFt?: number;
  roofAreaSqFt: number;
  roofTiltAngle?: number;
  azimuthDirection?: string;
  shadingFactorPct?: number;
  shadingCondition?: string;
  structureType?: string;
  meterType?: string;
  discomConnection?: string;
  cableDistanceMeters?: number;
  monthlyUnitsKwh?: number;
  monthlyBillAmount?: number;
  requiredCapacityKw?: number;
  recommendedCapacityKw?: number;
  notes?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  gstPercentage?: number;
  gstAmount?: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  leadId?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  salesExecutiveName?: string;
  proposalTitle?: string;
  siteAddress?: string;
  systemCapacityKw: number;
  capacityUnit?: 'kW' | 'MW';
  subtotalAmount: number;
  discountAmount?: number;
  subsidyAmount?: number;
  taxAmount: number;
  installationCharges?: number;
  transportationCharges?: number;
  otherCharges?: number;
  totalAmount: number;
  paybackPeriodYears?: number;
  annualSavingsEst?: number;
  paymentTerms?: string;
  warrantyTerms?: string;
  notes?: string;
  status: QuotationStatus;
  validUntil: string;
  items: QuotationItem[];
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  quotationId: string;
  customerId: string;
  customerName: string;
  systemCapacityKw: number;
  totalAmount: number;
  paidAmount: number;
  status: OrderStatus;
  orderDate: string;
  expectedDelivery?: string;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  sequence: number;
  status: MilestoneStatus;
  assignedToName?: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
}

export interface Project {
  id: string;
  projectNumber: string;
  orderId?: string;
  quotationId?: string;
  customerId: string;
  customerName: string;
  projectManagerId?: string;
  projectManagerName?: string;
  electricalEngineerName?: string;
  installerLeadName?: string;
  systemSizeKw: number;
  siteAddress: string;
  city: string;
  projectValue?: number;
  allocatedProducts?: QuotationItem[];
  status: ProjectStatus;
  progressPct: number;
  startDate: string;
  targetDate?: string;
  completionDate?: string;
  milestones: ProjectMilestone[];
}



export interface Payment {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  notes?: string;
}

export type FollowUpType = 'Call' | 'Meeting' | 'Site Visit' | 'Email' | 'WhatsApp' | 'Other';
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface FollowUp {
  id: string;
  leadId?: string;
  leadName?: string;
  customerId?: string;
  customerName?: string;
  userId: string;
  userName: string;
  title: string;
  type?: FollowUpType;
  dueDate: string;
  time?: string;
  notes?: string;
  priority: Priority;
  status?: FollowUpStatus;
  isCompleted: boolean;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: Role;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: InventoryTransactionType;
  quantity: number;
  referenceNo?: string;
  warehouseLocation?: string;
  userName: string;
  timestamp: string;
  notes?: string;
}

export interface ProjectHardwareAllocation {
  id: string;
  projectId: string;
  projectNumber: string;
  customerName: string;
  productId: string;
  productName: string;
  sku: string;
  requiredQty: number;
  allocatedQty: number;
  deliveredQty: number;
  installedQty: number;
}

export interface InstallationStage {
  id: string;
  name: string;
  stageType: InstallationStageType;
  sequence: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedToName?: string;
  dueDate?: string;
  completedDate?: string;
  notes?: string;
}

export interface InstallationJob {
  id: string;
  installationNumber: string;
  projectId: string;
  projectNumber: string;
  customerName: string;
  siteAddress: string;
  systemSizeKw: number;
  projectManagerName: string;
  installerLeadName: string;
  progressPct: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  stages: InstallationStage[];
  startDate: string;
  expectedCompletion?: string;
}
