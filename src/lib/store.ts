import { createClient } from './supabase'
import { Client, Project, Invoice, Profile } from './types'

const db = () => createClient()

async function getUserId() {
  const { data } = await db().auth.getUser()
  return data.user?.id
}

export const clientStore = {
  async getAll(): Promise<Client[]> {
    const userId = await getUserId()
    if (!userId) return []
    const { data } = await db().from('clients').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return (data || []).map(r => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, company: r.company, status: r.status, notes: r.notes || undefined, createdAt: r.created_at }))
  },
  async add(client: Client) {
    const userId = await getUserId()
    if (!userId) return
    await db().from('clients').insert({ id: client.id, user_id: userId, name: client.name, email: client.email, phone: client.phone || null, company: client.company || null, status: client.status, notes: client.notes || null, created_at: client.createdAt })
  },
  async update(client: Client) {
    await db().from('clients').update({ name: client.name, email: client.email, phone: client.phone || null, company: client.company || null, status: client.status, notes: client.notes || null }).eq('id', client.id)
  },
  async delete(id: string) {
    await db().from('clients').delete().eq('id', id)
  },
}

export const projectStore = {
  async getAll(): Promise<Project[]> {
    const userId = await getUserId()
    if (!userId) return []
    const { data } = await db().from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return (data || []).map(r => ({ id: r.id, clientId: r.client_id, clientName: r.client_name, title: r.title, description: r.description, status: r.status, budget: r.budget, startDate: r.start_date, endDate: r.end_date, createdAt: r.created_at }))
  },
  async add(project: Project) {
    const userId = await getUserId()
    if (!userId) return
    await db().from('projects').insert({ id: project.id, user_id: userId, client_id: project.clientId, client_name: project.clientName, title: project.title, description: project.description || null, status: project.status, budget: project.budget, start_date: project.startDate, created_at: project.createdAt })
  },
  async update(project: Project) {
    await db().from('projects').update({ title: project.title, description: project.description || null, status: project.status, budget: project.budget }).eq('id', project.id)
  },
  async delete(id: string) {
    await db().from('projects').delete().eq('id', id)
  },
}

export const invoiceStore = {
  async getAll(): Promise<Invoice[]> {
    const userId = await getUserId()
    if (!userId) return []
    const { data } = await db().from('invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return (data || []).map(r => ({ id: r.id, invoiceNumber: r.invoice_number || undefined, projectId: r.project_id, clientId: r.client_id, clientName: r.client_name, projectTitle: r.project_title, amount: r.amount, status: r.status, dueDate: r.due_date, paidAt: r.paid_at || undefined, createdAt: r.created_at }))
  },
  async nextNumber(): Promise<string> {
    const userId = await getUserId()
    if (!userId) return `FAC-${new Date().getFullYear()}-001`
    const { count } = await db().from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    const year = new Date().getFullYear()
    return `FAC-${year}-${String((count || 0) + 1).padStart(3, '0')}`
  },
  async add(invoice: Invoice) {
    const userId = await getUserId()
    if (!userId) return
    await db().from('invoices').insert({ id: invoice.id, invoice_number: invoice.invoiceNumber || null, user_id: userId, project_id: invoice.projectId, client_id: invoice.clientId, client_name: invoice.clientName, project_title: invoice.projectTitle, amount: invoice.amount, status: invoice.status, due_date: invoice.dueDate, paid_at: invoice.paidAt || null, created_at: invoice.createdAt })
  },
  async update(invoice: Invoice) {
    await db().from('invoices').update({ amount: invoice.amount, status: invoice.status, due_date: invoice.dueDate, paid_at: invoice.paidAt || null }).eq('id', invoice.id)
  },
  async delete(id: string) {
    await db().from('invoices').delete().eq('id', id)
  },
}

export const profileStore = {
  async get(): Promise<Profile | null> {
    const userId = await getUserId()
    if (!userId) return null
    const { data } = await db().from('profiles').select('*').eq('id', userId).single()
    if (!data) return null
    return {
      id: data.id,
      fullName: data.full_name || '',
      businessName: data.business_name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      taxId: data.tax_id || '',
      paymentInfo: data.payment_info || undefined,
    }
  },
  async save(profile: Profile) {
    const userId = await getUserId()
    if (!userId) return
    await db().from('profiles').upsert({
      id: userId,
      full_name: profile.fullName,
      business_name: profile.businessName,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      tax_id: profile.taxId,
      payment_info: profile.paymentInfo || null,
      updated_at: new Date().toISOString(),
    })
  },
}
