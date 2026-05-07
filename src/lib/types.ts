export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: 'active' | 'inactive'
  notes?: string
  createdAt: string
}

export interface Project {
  id: string
  clientId: string
  clientName: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  budget: number
  startDate: string
  endDate?: string
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNumber?: string
  projectId: string
  clientId: string
  clientName: string
  projectTitle: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: string
  paidAt?: string
  createdAt: string
}

export interface Profile {
  id?: string
  fullName: string
  businessName: string
  email: string
  phone: string
  address: string
  taxId: string
  paymentInfo?: string
  plan: 'free' | 'pro'
}
