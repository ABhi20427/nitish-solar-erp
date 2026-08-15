'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Role,
  Product,
  Lead,
  Customer,
  SiteSurvey,
  Quotation,
  Order,
  Project,
  ProjectMilestone,
  Invoice,
  Payment,
  FollowUp,
  AuditLog,
  LeadStatus,
  ProjectStatus,
  OrderStatus,
  InvoiceStatus,
  Priority,
  CustomerType,
  InventoryTransaction,
  ProjectHardwareAllocation,
  InstallationJob,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_LEADS,
  INITIAL_CUSTOMERS,
  INITIAL_SURVEYS,
  INITIAL_QUOTATIONS,
  INITIAL_ORDERS,
  INITIAL_PROJECTS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_FOLLOWUPS,
  INITIAL_AUDITLOGS,
  INITIAL_TRANSACTIONS,
  INITIAL_ALLOCATIONS,
  INITIAL_INSTALLATIONS,
} from './seed-data';
import { calculateSolarSystem } from './solar-calc';

interface SolarStoreContextType {
  // Auth Session State
  isAuthenticated: boolean;
  currentUser: User;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: { name: string; email: string; phone?: string }) => void;
  changePassword: (oldPw: string, newPw: string) => { success: boolean; error?: string };
  setCurrentRole: (role: Role) => void;

  // Domain Collections
  users: User[];
  products: Product[];
  leads: Lead[];
  customers: Customer[];
  siteSurveys: SiteSurvey[];
  quotations: Quotation[];
  orders: Order[];
  projects: Project[];
  invoices: Invoice[];
  payments: Payment[];
  followUps: FollowUp[];
  auditLogs: AuditLog[];
  inventoryTransactions: InventoryTransaction[];
  projectAllocations: ProjectHardwareAllocation[];
  installations: InstallationJob[];

  // User Admin Actions
  addUser: (userData: Partial<User>) => User;
  updateUser: (id: string, userData: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;

  // Business Workflow Actions
  addLead: (leadData: Partial<Lead>) => Lead;
  updateLead: (leadId: string, leadData: Partial<Lead>) => void;
  deleteLead: (leadId: string) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  convertLeadToCustomer: (leadId: string) => Customer;
  addCustomer: (customerData: Partial<Customer>) => Customer;
  updateCustomer: (customerId: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (customerId: string) => void;
  addSiteSurvey: (surveyData: Partial<SiteSurvey>) => SiteSurvey;
  updateSiteSurvey: (surveyId: string, surveyData: Partial<SiteSurvey>) => void;
  deleteSiteSurvey: (surveyId: string) => void;
  addProduct: (productData: Partial<Product>) => Product;
  updateProduct: (productId: string, productData: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  createQuotation: (quotationData: Partial<Quotation>) => Quotation;
  updateQuotation: (quotationId: string, quotationData: Partial<Quotation>) => void;
  deleteQuotation: (quotationId: string) => void;
  updateQuotationStatus: (quotationId: string, status: Quotation['status']) => void;
  addOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  convertQuotationToOrder: (quotationId: string) => Order;
  addProject: (projectData: Partial<Project>) => Project;
  updateProject: (projectId: string, projectData: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  updateProjectProgress: (projectId: string, progressPct: number, status: ProjectStatus) => void;
  updateMilestoneStatus: (projectId: string, milestoneId: string, completed: boolean) => void;
  addInventoryTransaction: (txData: Partial<InventoryTransaction>) => InventoryTransaction;
  allocateHardwareToProject: (allocData: Partial<ProjectHardwareAllocation>) => ProjectHardwareAllocation;
  updateInstallationStage: (jobId: string, stageId: string, completed: boolean) => void;
  addInvoice: (invoiceData: Partial<Invoice>) => Invoice;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  recordPayment: (paymentData: Partial<Payment>) => Payment;
  toggleFollowUp: (followUpId: string) => void;
  updateFollowUpStatus: (followUpId: string, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') => void;
  addFollowUp: (followUpData: Partial<FollowUp>) => FollowUp;
}

const SolarStoreContext = createContext<SolarStoreContextType | undefined>(undefined);

export const SolarStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default Super Admin
  
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [siteSurveys, setSiteSurveys] = useState<SiteSurvey[]>(INITIAL_SURVEYS);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [followUps, setFollowUps] = useState<FollowUp[]>(INITIAL_FOLLOWUPS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDITLOGS);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(INITIAL_TRANSACTIONS);
  const [projectAllocations, setProjectAllocations] = useState<ProjectHardwareAllocation[]>(INITIAL_ALLOCATIONS);
  const [installations, setInstallations] = useState<InstallationJob[]>(INITIAL_INSTALLATIONS);

  // Initialize session from localStorage if available
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('nitish_solar_user');
      const savedAuth = localStorage.getItem('nitish_solar_auth');
      if (savedUser && savedAuth === 'true') {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.warn('Failed to parse saved auth session');
    }
  }, []);

  const logAuditAction = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Auth & Session Handling
  const login = (email: string, password?: string): { success: boolean; error?: string } => {
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (!foundUser.active) {
      return { success: false, error: 'Your user account has been deactivated. Please contact Super Admin.' };
    }

    setCurrentUser(foundUser);
    setIsAuthenticated(true);

    try {
      localStorage.setItem('nitish_solar_user', JSON.stringify(foundUser));
      localStorage.setItem('nitish_solar_auth', 'true');
    } catch (e) {}

    logAuditAction('USER_LOGIN', 'Authentication', `User ${foundUser.name} logged into ERP session`);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('nitish_solar_user');
      localStorage.removeItem('nitish_solar_auth');
    } catch (e) {}
    logAuditAction('USER_LOGOUT', 'Authentication', `User ${currentUser.name} logged out`);
  };

  const updateProfile = (data: { name: string; email: string; phone?: string }) => {
    const updated = { ...currentUser, name: data.name, email: data.email, phone: data.phone };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    try {
      localStorage.setItem('nitish_solar_user', JSON.stringify(updated));
    } catch (e) {}
    logAuditAction('PROFILE_UPDATED', 'Users', `User updated profile information`);
  };

  const changePassword = (oldPw: string, newPw: string): { success: boolean; error?: string } => {
    if (newPw.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }
    const updated = { ...currentUser, password: newPw };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    logAuditAction('PASSWORD_CHANGED', 'Users', `User changed password successfully`);
    return { success: true };
  };

  const setCurrentRole = (role: Role) => {
    const matchedUser = users.find((u) => u.role === role) || {
      ...currentUser,
      role,
      name: `${role.replace(/_/g, ' ')} User`,
    };
    setCurrentUser(matchedUser);
    logAuditAction('ROLE_SWITCHED', 'Users', `Role switched to ${role}`);
  };

  // User Admin Actions
  const addUser = (userData: Partial<User>): User => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || 'New Employee',
      email: userData.email || `user${Date.now()}@nitishsolar.com`,
      role: userData.role || 'SALES_EXECUTIVE',
      phone: userData.phone || '+91 90000 00000',
      active: userData.active !== undefined ? userData.active : true,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    logAuditAction('USER_CREATED', 'Users', `Created user ${newUser.name} with role ${newUser.role}`);
    return newUser;
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...userData } : u))
    );
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...userData }));
    }
    logAuditAction('USER_UPDATED', 'Users', `Updated user ID ${id}`);
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
    logAuditAction('USER_STATUS_TOGGLED', 'Users', `Toggled active status for user ID ${id}`);
  };

  // Business Actions
  const addLead = (leadData: Partial<Lead>): Lead => {
    const calcRes = calculateSolarSystem({
      monthlyBillAmount: leadData.monthlyBillAmount || 5000,
      customerType: leadData.customerType || 'RESIDENTIAL',
      availableRoofAreaSqFt: leadData.roofAreaSqFt,
    });

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      leadNumber: `LD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      fullName: leadData.fullName || 'New Prospect',
      email: leadData.email || 'prospect@solar.com',
      phone: leadData.phone || '+91 99999 00000',
      companyName: leadData.companyName || undefined,
      customerType: leadData.customerType || 'RESIDENTIAL',
      address: leadData.address || 'Site Address Pending',
      city: leadData.city || 'City',
      state: leadData.state || 'State',
      pinCode: leadData.pinCode || '000000',
      monthlyBillAmount: leadData.monthlyBillAmount || 5000,
      proposedCapacityKw: leadData.proposedCapacityKw || calcRes.recommendedCapacityKw,
      roofType: leadData.roofType || 'Terrace RCC',
      roofAreaSqFt: leadData.roofAreaSqFt || calcRes.roofAreaRequiredSqFt,
      status: 'NEW',
      priority: leadData.priority || 'MEDIUM',
      source: leadData.source || 'Website Quote Form',
      notes: leadData.notes || 'Auto-generated lead from quote calculation',
      assignedToId: 'user-4',
      assignedToName: 'Siddharth Patel',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLeads((prev) => [newLead, ...prev]);
    logAuditAction('LEAD_CREATED', 'Leads', `Created new lead ${newLead.leadNumber} (${newLead.fullName})`);
    return newLead;
  };

  const updateLead = (leadId: string, leadData: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, ...leadData, updatedAt: new Date().toISOString() } : l
      )
    );
    logAuditAction('LEAD_UPDATED', 'Leads', `Updated details for lead ID ${leadId}`);
  };

  const deleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    logAuditAction('LEAD_DELETED', 'Leads', `Deleted lead ID ${leadId}`);
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, status, updatedAt: new Date().toISOString() }
          : l
      )
    );
    const targetLead = leads.find((l) => l.id === leadId);
    if (targetLead) {
      logAuditAction('LEAD_STATUS_CHANGED', 'Leads', `Updated ${targetLead.leadNumber} status to ${status}`);
    }
  };

  const addCustomer = (customerData: Partial<Customer>): Customer => {
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      customerNumber: `CUST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      fullName: customerData.fullName || 'New Customer',
      email: customerData.email || 'customer@nitishsolar.com',
      phone: customerData.phone || '+91 98765 43210',
      companyName: customerData.companyName || undefined,
      customerType: customerData.customerType || 'RESIDENTIAL',
      address: customerData.address || 'Address Line 1',
      city: customerData.city || 'Pune',
      state: customerData.state || 'Maharashtra',
      pinCode: customerData.pinCode || '411001',
      gstNumber: customerData.gstNumber || undefined,
      assignedToId: customerData.assignedToId || 'user-4',
      assignedToName: customerData.assignedToName || 'Siddharth Patel',
      sanctionedLoadKw: customerData.sanctionedLoadKw || 10,
      totalProjectValue: customerData.totalProjectValue || 450000,
      activeProjectsCount: customerData.activeProjectsCount || 1,
      paymentStatus: customerData.paymentStatus || 'PAID',
      createdAt: new Date().toISOString(),
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    logAuditAction('CUSTOMER_CREATED', 'Customers', `Created customer ${newCustomer.customerNumber} (${newCustomer.fullName})`);
    return newCustomer;
  };

  const updateCustomer = (customerId: string, customerData: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...customerData } : c))
    );
    logAuditAction('CUSTOMER_UPDATED', 'Customers', `Updated customer ID ${customerId}`);
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    logAuditAction('CUSTOMER_DELETED', 'Customers', `Deleted customer ID ${customerId}`);
  };

  const convertLeadToCustomer = (leadId: string): Customer => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) throw new Error('Lead not found');

    const capacity = targetLead.proposedCapacityKw || 10;
    const estVal = targetLead.estimatedProjectValue || capacity * 45000;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      customerNumber: `CUST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      leadId: targetLead.id,
      fullName: targetLead.fullName,
      email: targetLead.email,
      phone: targetLead.phone,
      companyName: targetLead.companyName,
      customerType: targetLead.customerType,
      address: targetLead.address,
      city: targetLead.city,
      state: targetLead.state,
      pinCode: targetLead.pinCode,
      gstNumber: targetLead.customerType === 'COMMERCIAL' || targetLead.customerType === 'INDUSTRIAL' ? '27AAAAA0000A1Z5' : undefined,
      sanctionedLoadKw: Math.round(capacity * 1.2),
      assignedToId: targetLead.assignedToId || 'user-4',
      assignedToName: targetLead.assignedToName || 'Siddharth Patel',
      totalProjectValue: estVal,
      activeProjectsCount: 1,
      paymentStatus: 'PARTIALLY_PAID',
      createdAt: new Date().toISOString(),
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    updateLeadStatus(leadId, 'WON');
    logAuditAction('LEAD_CONVERTED', 'Customers', `Converted lead ${targetLead.leadNumber} to Customer ${newCustomer.customerNumber}`);
    return newCustomer;
  };

  const addSiteSurvey = (surveyData: Partial<SiteSurvey>): SiteSurvey => {
    const newSurvey: SiteSurvey = {
      id: `surv-${Date.now()}`,
      surveyNumber: `SURV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      leadId: surveyData.leadId || 'lead-1',
      leadNumber: surveyData.leadNumber || 'LD-2025-001',
      customerName: surveyData.customerName || 'Solar Prospect',
      scheduledDate: surveyData.scheduledDate || new Date().toISOString(),
      surveyorName: surveyData.surveyorName || currentUser.name,
      roofLengthFt: surveyData.roofLengthFt || 50,
      roofWidthFt: surveyData.roofWidthFt || 30,
      roofAreaSqFt: surveyData.roofAreaSqFt || 1200,
      roofTiltAngle: 20,
      azimuthDirection: 'SOUTH',
      shadingFactorPct: 5,
      structureType: 'Hot Dip Galvanized',
      meterType: 'Bi-directional Net Meter',
      discomConnection: 'MSEDCL LT',
      cableDistanceMeters: 40,
      status: 'COMPLETED',
      notes: surveyData.notes || 'Site clear for 10kW N-type TOPCon module mounting.',
    };

    setSiteSurveys((prev) => [newSurvey, ...prev]);
    logAuditAction('SURVEY_COMPLETED', 'Site Surveys', `Completed site survey ${newSurvey.surveyNumber}`);
    return newSurvey;
  };

  const createQuotation = (quotationData: Partial<Quotation>): Quotation => {
    const subtotal = (quotationData.systemCapacityKw || 10) * 45000;
    const subsidy = 78000;
    const tax = Math.round(subtotal * 0.12);
    const total = Math.max(0, subtotal + tax - subsidy);

    const newQuotation: Quotation = {
      id: `quot-${Date.now()}`,
      quotationNumber: `QUO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      leadId: quotationData.leadId || 'lead-1',
      customerId: quotationData.customerId || 'cust-1',
      customerName: quotationData.customerName || 'Solar Customer',
      customerPhone: quotationData.customerPhone || '+91 98765 43210',
      systemCapacityKw: quotationData.systemCapacityKw || 10,
      subtotalAmount: subtotal,
      subsidyAmount: subsidy,
      taxAmount: tax,
      totalAmount: total,
      paybackPeriodYears: 3.5,
      annualSavingsEst: 110000,
      status: 'DRAFT',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          productName: 'nitish solar Apex 540W N-Type TOPCon Panel',
          quantity: 20,
          unitPrice: 14500,
          totalPrice: 290000,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setQuotations((prev) => [newQuotation, ...prev]);
    logAuditAction('QUOTATION_CREATED', 'Quotations', `Created quotation ${newQuotation.quotationNumber}`);
    return newQuotation;
  };

  const updateQuotationStatus = (quotationId: string, status: Quotation['status']) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotationId ? { ...q, status } : q))
    );
    logAuditAction('QUOTATION_STATUS_CHANGED', 'Quotations', `Updated quotation ID ${quotationId} to ${status}`);
  };

  const convertQuotationToOrder = (quotationId: string): Order => {
    const quotation = quotations.find((q) => q.id === quotationId);
    if (!quotation) throw new Error('Quotation not found');

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      quotationId: quotation.id,
      customerId: quotation.customerId || 'cust-1',
      customerName: quotation.customerName,
      systemCapacityKw: quotation.systemCapacityKw,
      totalAmount: quotation.totalAmount,
      paidAmount: Math.round(quotation.totalAmount * 0.2),
      status: 'CONFIRMED',
      orderDate: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    updateQuotationStatus(quotationId, 'APPROVED');

    // Create Project from Quotation
    const STANDARD_MILESTONES: ProjectMilestone[] = [
      { id: `m1-${Date.now()}`, name: 'Site Survey', sequence: 1, status: 'COMPLETED', assignedToName: 'Er. Sandeep Joshi', dueDate: '2025-03-01' },
      { id: `m2-${Date.now()}`, name: 'Engineering Design', sequence: 2, status: 'IN_PROGRESS', assignedToName: 'Priya Iyer', dueDate: '2025-03-05' },
      { id: `m3-${Date.now()}`, name: 'Material Procurement', sequence: 3, status: 'PENDING', assignedToName: 'Siddharth Patel', dueDate: '2025-03-10' },
      { id: `m4-${Date.now()}`, name: 'Material Delivery', sequence: 4, status: 'PENDING', assignedToName: 'Siddharth Patel', dueDate: '2025-03-15' },
      { id: `m5-${Date.now()}`, name: 'Installation', sequence: 5, status: 'PENDING', assignedToName: 'Vikram Singh', dueDate: '2025-03-22' },
      { id: `m6-${Date.now()}`, name: 'Electrical Work', sequence: 6, status: 'PENDING', assignedToName: 'Anil Mehta', dueDate: '2025-03-26' },
      { id: `m7-${Date.now()}`, name: 'Testing', sequence: 7, status: 'PENDING', assignedToName: 'Anil Mehta', dueDate: '2025-03-28' },
      { id: `m8-${Date.now()}`, name: 'Commissioning', sequence: 8, status: 'PENDING', assignedToName: 'Priya Iyer', dueDate: '2025-04-02' },
      { id: `m9-${Date.now()}`, name: 'Handover', sequence: 9, status: 'PENDING', assignedToName: 'Priya Iyer', dueDate: '2025-04-05' },
    ];

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      projectNumber: `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      orderId: newOrder.id,
      quotationId: quotation.id,
      customerId: newOrder.customerId,
      customerName: newOrder.customerName,
      systemSizeKw: newOrder.systemCapacityKw,
      siteAddress: quotation.siteAddress || 'Project Site Location',
      city: 'Pune',
      projectManagerId: 'user-5',
      projectManagerName: 'Priya Iyer',
      electricalEngineerName: 'Anil Mehta',
      installerLeadName: 'Vikram Singh',
      projectValue: quotation.totalAmount,
      allocatedProducts: quotation.items,
      status: 'DESIGN',
      progressPct: 22,
      startDate: new Date().toISOString(),
      targetDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
      milestones: STANDARD_MILESTONES,
    };

    setProjects((prev) => [newProject, ...prev]);
    logAuditAction('ORDER_CREATED', 'Orders', `Converted quotation ${quotation.quotationNumber} to Order ${newOrder.orderNumber} & initialized Project ${newProject.projectNumber}`);
    return newOrder;
  };

  const updateSiteSurvey = (surveyId: string, surveyData: Partial<SiteSurvey>) => {
    setSiteSurveys((prev) =>
      prev.map((s) => (s.id === surveyId ? { ...s, ...surveyData } : s))
    );
    logAuditAction('SURVEY_UPDATED', 'Site Surveys', `Updated site survey ID ${surveyId}`);
  };

  const deleteSiteSurvey = (surveyId: string) => {
    setSiteSurveys((prev) => prev.filter((s) => s.id !== surveyId));
    logAuditAction('SURVEY_DELETED', 'Site Surveys', `Deleted site survey ID ${surveyId}`);
  };

  const addProject = (projectData: Partial<Project>): Project => {
    const STANDARD_MILESTONES: ProjectMilestone[] = [
      { id: `m1-${Date.now()}`, name: 'Site Survey', sequence: 1, status: 'COMPLETED', dueDate: '2025-03-01' },
      { id: `m2-${Date.now()}`, name: 'Engineering Design', sequence: 2, status: 'IN_PROGRESS', dueDate: '2025-03-05' },
      { id: `m3-${Date.now()}`, name: 'Material Procurement', sequence: 3, status: 'PENDING', dueDate: '2025-03-10' },
      { id: `m4-${Date.now()}`, name: 'Material Delivery', sequence: 4, status: 'PENDING', dueDate: '2025-03-15' },
      { id: `m5-${Date.now()}`, name: 'Installation', sequence: 5, status: 'PENDING', dueDate: '2025-03-22' },
      { id: `m6-${Date.now()}`, name: 'Electrical Work', sequence: 6, status: 'PENDING', dueDate: '2025-03-26' },
      { id: `m7-${Date.now()}`, name: 'Testing', sequence: 7, status: 'PENDING', dueDate: '2025-03-28' },
      { id: `m8-${Date.now()}`, name: 'Commissioning', sequence: 8, status: 'PENDING', dueDate: '2025-04-02' },
      { id: `m9-${Date.now()}`, name: 'Handover', sequence: 9, status: 'PENDING', dueDate: '2025-04-05' },
    ];

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      projectNumber: `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      customerId: projectData.customerId || 'cust-1',
      customerName: projectData.customerName || 'Solar Client',
      systemSizeKw: projectData.systemSizeKw || 10,
      siteAddress: projectData.siteAddress || 'Site Location Address',
      city: projectData.city || 'Pune',
      projectManagerName: projectData.projectManagerName || 'Priya Iyer',
      electricalEngineerName: 'Anil Mehta',
      installerLeadName: 'Vikram Singh',
      projectValue: projectData.projectValue || 450000,
      status: projectData.status || 'PLANNING',
      progressPct: projectData.progressPct || 11,
      startDate: new Date().toISOString(),
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      milestones: projectData.milestones || STANDARD_MILESTONES,
    };

    setProjects((prev) => [newProject, ...prev]);
    logAuditAction('PROJECT_CREATED', 'Projects', `Created project ${newProject.projectNumber}`);
    return newProject;
  };

  const updateProject = (projectId: string, projectData: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...projectData } : p))
    );
    logAuditAction('PROJECT_UPDATED', 'Projects', `Updated project ID ${projectId}`);
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    logAuditAction('PROJECT_DELETED', 'Projects', `Deleted project ID ${projectId}`);
  };

  const updateProjectProgress = (projectId: string, progressPct: number, status: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, progressPct, status } : p))
    );
    logAuditAction('PROJECT_PROGRESS_UPDATED', 'Projects', `Updated project ID ${projectId} progress to ${progressPct}% (${status})`);
  };

  const addOrder = (orderData: Partial<Order>): Order => {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      quotationId: orderData.quotationId || 'qt-1',
      customerId: orderData.customerId || 'cust-1',
      customerName: orderData.customerName || 'Solar Client',
      systemCapacityKw: orderData.systemCapacityKw || 10,
      totalAmount: orderData.totalAmount || 450000,
      paidAmount: orderData.paidAmount || 90000,
      status: orderData.status || 'CONFIRMED',
      orderDate: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    logAuditAction('ORDER_CREATED', 'Orders', `Created order ${newOrder.orderNumber}`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    logAuditAction('ORDER_STATUS_UPDATED', 'Orders', `Updated order ID ${orderId} status to ${status}`);
  };

  const addInventoryTransaction = (txData: Partial<InventoryTransaction>): InventoryTransaction => {
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      productId: txData.productId || 'prod-1',
      productName: txData.productName || 'Solar Module',
      sku: txData.sku || 'SKU-001',
      type: txData.type || 'STOCK_IN',
      quantity: txData.quantity || 10,
      referenceNo: txData.referenceNo || 'REF-101',
      warehouseLocation: txData.warehouseLocation || 'Pune Main Logistics Hub',
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      notes: txData.notes || '',
    };
    setInventoryTransactions((prev) => [newTx, ...prev]);
    logAuditAction('INVENTORY_TRANSACTION', 'Inventory', `Logged ${newTx.type} for ${newTx.productName} (${newTx.quantity} units)`);
    return newTx;
  };

  const allocateHardwareToProject = (allocData: Partial<ProjectHardwareAllocation>): ProjectHardwareAllocation => {
    const newAlloc: ProjectHardwareAllocation = {
      id: `alloc-${Date.now()}`,
      projectId: allocData.projectId || 'proj-1',
      projectNumber: allocData.projectNumber || 'PRJ-2025-001',
      customerName: allocData.customerName || 'Solar Client',
      productId: allocData.productId || 'prod-1',
      productName: allocData.productName || 'Solar Hardware',
      sku: allocData.sku || 'SKU-001',
      requiredQty: allocData.requiredQty || 10,
      allocatedQty: allocData.allocatedQty || 10,
      deliveredQty: allocData.deliveredQty || 0,
      installedQty: allocData.installedQty || 0,
    };
    setProjectAllocations((prev) => [newAlloc, ...prev]);

    // Automatically record allocation transaction
    addInventoryTransaction({
      productId: newAlloc.productId,
      productName: newAlloc.productName,
      sku: newAlloc.sku,
      type: 'ALLOCATION',
      quantity: newAlloc.allocatedQty,
      referenceNo: newAlloc.projectNumber,
      notes: `Allocated to project ${newAlloc.projectNumber} (${newAlloc.customerName})`,
    });

    return newAlloc;
  };

  const updateInstallationStage = (jobId: string, stageId: string, completed: boolean) => {
    setInstallations((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        const updatedStages = job.stages.map((stg) =>
          stg.id === stageId
            ? { ...stg, status: (completed ? 'COMPLETED' : 'IN_PROGRESS') as any, completedDate: completed ? new Date().toISOString() : undefined }
            : stg
        );

        const doneCount = updatedStages.filter((s) => s.status === 'COMPLETED').length;
        const newPct = Math.round((doneCount / updatedStages.length) * 100);

        return {
          ...job,
          progressPct: newPct,
          status: newPct === 100 ? 'COMPLETED' : 'IN_PROGRESS',
          stages: updatedStages,
        };
      })
    );
    logAuditAction('INSTALLATION_STAGE_UPDATED', 'Installations', `Updated installation stage on job ID ${jobId}`);
  };

  const updateMilestoneStatus = (projectId: string, milestoneId: string, completed: boolean) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedMs = p.milestones.map((m) =>
          m.id === milestoneId
            ? { ...m, status: (completed ? 'COMPLETED' : 'IN_PROGRESS') as any, completedAt: completed ? new Date().toISOString() : undefined }
            : m
        );
        const completedCount = updatedMs.filter((m) => m.status === 'COMPLETED').length;
        const newPct = Math.round((completedCount / updatedMs.length) * 100);

        return { ...p, progressPct: newPct, milestones: updatedMs };
      })
    );
  };

  const addInvoice = (invoiceData: Partial<Invoice>): Invoice => {
    const subtotal = invoiceData.subtotal || 400000;
    const taxAmount = invoiceData.taxAmount || Math.round(subtotal * 0.12);
    const totalAmount = invoiceData.totalAmount || subtotal + taxAmount;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      customerId: invoiceData.customerId || 'cust-1',
      customerName: invoiceData.customerName || 'Solar Client',
      projectId: invoiceData.projectId,
      projectNumber: invoiceData.projectNumber,
      quotationId: invoiceData.quotationId,
      paymentTerms: invoiceData.paymentTerms || 'Advance + Balance',
      items: invoiceData.items || [],
      subtotal,
      discountAmount: invoiceData.discountAmount || 0,
      taxAmount,
      totalAmount,
      paidAmount: invoiceData.paidAmount || 0,
      balanceAmount: totalAmount - (invoiceData.paidAmount || 0),
      status: invoiceData.status || 'ISSUED',
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    logAuditAction('INVOICE_CREATED', 'Invoices', `Created invoice ${newInvoice.invoiceNumber}`);
    return newInvoice;
  };

  const updateInvoiceStatus = (invoiceId: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status } : i))
    );
    logAuditAction('INVOICE_STATUS_UPDATED', 'Invoices', `Updated invoice ID ${invoiceId} to ${status}`);
  };

  const recordPayment = (paymentData: Partial<Payment>): Payment => {
    const targetInv = invoices.find((i) => i.id === paymentData.invoiceId || i.invoiceNumber === paymentData.invoiceNumber);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      receiptNumber: `RCP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      invoiceId: paymentData.invoiceId || (targetInv ? targetInv.id : 'inv-1'),
      invoiceNumber: paymentData.invoiceNumber || (targetInv ? targetInv.invoiceNumber : 'INV-2025-001'),
      customerName: paymentData.customerName || (targetInv ? targetInv.customerName : 'Solar Client'),
      amount: paymentData.amount || 50000,
      paymentMethod: paymentData.paymentMethod || 'BANK_TRANSFER',
      referenceNo: paymentData.referenceNo || `TXN${Date.now().toString().slice(-8)}`,
      paymentDate: paymentData.paymentDate || new Date().toISOString(),
      notes: paymentData.notes || 'Payment recorded via ERP finance module',
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Automatically recalculate invoice paidAmount, balanceAmount, and status
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== newPayment.invoiceId && inv.invoiceNumber !== newPayment.invoiceNumber) return inv;
        const newPaidAmount = inv.paidAmount + newPayment.amount;
        const newBalanceAmount = Math.max(0, inv.totalAmount - newPaidAmount);
        let newStatus: InvoiceStatus = inv.status;

        if (newPaidAmount >= inv.totalAmount) {
          newStatus = 'PAID';
        } else if (newPaidAmount > 0) {
          newStatus = 'PARTIALLY_PAID';
        }

        return {
          ...inv,
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
          status: newStatus,
        };
      })
    );

    logAuditAction('PAYMENT_RECORDED', 'Payments', `Recorded payment ${newPayment.receiptNumber} of ₹${newPayment.amount.toLocaleString()} for Invoice ${newPayment.invoiceNumber}`);
    return newPayment;
  };

  const toggleFollowUp = (followUpId: string) => {
    setFollowUps((prev) =>
      prev.map((f) => {
        if (f.id !== followUpId) return f;
        const nextCompleted = !f.isCompleted;
        const nextStatus = nextCompleted ? 'COMPLETED' : 'PENDING';
        logAuditAction('FOLLOWUP_TOGGLED', 'Follow-ups', `Marked follow-up '${f.title}' as ${nextStatus}`);
        return { ...f, isCompleted: nextCompleted, status: nextStatus };
      })
    );
  };

  const updateFollowUpStatus = (followUpId: string, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') => {
    setFollowUps((prev) =>
      prev.map((f) => {
        if (f.id !== followUpId) return f;
        logAuditAction('FOLLOWUP_STATUS_CHANGED', 'Follow-ups', `Updated follow-up '${f.title}' status to ${status}`);
        return { ...f, status, isCompleted: status === 'COMPLETED' };
      })
    );
  };

  const addFollowUp = (followUpData: Partial<FollowUp>): FollowUp => {
    const newFollowUp: FollowUp = {
      id: `fol-${Date.now()}`,
      leadId: followUpData.leadId,
      leadName: followUpData.leadName,
      customerId: followUpData.customerId,
      customerName: followUpData.customerName,
      userId: followUpData.userId || currentUser.id,
      userName: followUpData.userName || currentUser.name,
      dueDate: followUpData.dueDate || new Date().toISOString(),
      time: followUpData.time || '10:00 AM',
      type: followUpData.type || 'Call',
      title: followUpData.title || 'Follow-up Task',
      notes: followUpData.notes || 'Discuss technical system proposal',
      priority: followUpData.priority || 'MEDIUM',
      status: followUpData.status || 'PENDING',
      isCompleted: followUpData.status === 'COMPLETED' ? true : false,
      createdAt: new Date().toISOString(),
    };

    setFollowUps((prev) => [newFollowUp, ...prev]);
    logAuditAction('FOLLOWUP_CREATED', 'Follow-ups', `Scheduled follow-up '${newFollowUp.title}' for ${newFollowUp.leadName || newFollowUp.customerName || 'Lead'}`);
    return newFollowUp;
  };

  const addProduct = (productData: Partial<Product>): Product => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: productData.name || 'New Solar Hardware',
      sku: productData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      type: productData.type || 'SOLAR_PANEL',
      brand: productData.brand || 'nitish solar Tech',
      specifications: productData.specifications || { wattage: 540 },
      unitPrice: productData.unitPrice || 15000,
      stockQuantity: productData.stockQuantity || 100,
      warrantyYears: productData.warrantyYears || 25,
      imageUrl: productData.imageUrl,
    };

    setProducts((prev) => [newProduct, ...prev]);
    logAuditAction('PRODUCT_ADDED', 'Products', `Added product ${newProduct.name}`);
    return newProduct;
  };

  const updateProduct = (productId: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...productData } : p))
    );
    logAuditAction('PRODUCT_UPDATED', 'Products', `Updated product ID ${productId}`);
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    logAuditAction('PRODUCT_DELETED', 'Products', `Deleted product ID ${productId}`);
  };

  const updateQuotation = (quotationId: string, quotationData: Partial<Quotation>) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotationId ? { ...q, ...quotationData } : q))
    );
    logAuditAction('QUOTATION_UPDATED', 'Quotations', `Updated quotation ID ${quotationId}`);
  };

  const deleteQuotation = (quotationId: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== quotationId));
    logAuditAction('QUOTATION_DELETED', 'Quotations', `Deleted quotation ID ${quotationId}`);
  };

  return (
    <SolarStoreContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        updateProfile,
        changePassword,
        setCurrentRole,
        users,
        products,
        leads,
        customers,
        siteSurveys,
        quotations,
        orders,
        projects,
        invoices,
        payments,
        followUps,
        auditLogs,
        inventoryTransactions,
        projectAllocations,
        installations,
        addUser,
        updateUser,
        toggleUserStatus,
        addLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        convertLeadToCustomer,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSiteSurvey,
        updateSiteSurvey,
        deleteSiteSurvey,
        addProduct,
        updateProduct,
        deleteProduct,
        createQuotation,
        updateQuotation,
        deleteQuotation,
        updateQuotationStatus,
        addOrder,
        updateOrderStatus,
        convertQuotationToOrder,
        addProject,
        updateProject,
        deleteProject,
        updateProjectProgress,
        updateMilestoneStatus,
        addInventoryTransaction,
        allocateHardwareToProject,
        updateInstallationStage,
        addInvoice,
        updateInvoiceStatus,
        recordPayment,
        toggleFollowUp,
        updateFollowUpStatus,
        addFollowUp,
      }}
    >
      {children}
    </SolarStoreContext.Provider>
  );
};

export const useSolarStore = () => {
  const context = useContext(SolarStoreContext);
  if (!context) {
    throw new Error('useSolarStore must be used within a SolarStoreProvider');
  }
  return context;
};
