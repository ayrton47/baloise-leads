export type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'TO_CONTACT' | 'QUOTED' | 'REFUSED' | 'CONVERTED'
export type ProductType = 'DRIVE' | 'HOME' | 'PENSION_PLAN' | 'OTHER'
export type RefusalReason = 'NO_ASSET' | 'PRICE_TOO_HIGH' | 'ALREADY_INSURED' | 'OTHER'
export type ActionType = 'REFUSED' | 'REFUSAL_CANCELLED' | 'QUOTE_CREATED' | 'CALLBACK_SCHEDULED' | 'NOTE_ADDED' | 'CONVERTED'
export type LeadSource = 'MANUAL' | 'API_EXTERNAL'
export type AgentRole = 'RESPONSABLE' | 'EMPLOYE'

export interface LeadAction {
  id: string
  leadId: string
  type: ActionType
  refusalReason?: RefusalReason
  refusalNote?: string
  quotedProduct?: ProductType
  quoteUrl?: string
  quoteAmount?: number
  callbackDate?: string
  note?: string
  createdAt: string
  createdBy: string
  agentName?: string
}

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  productInterest: string
  status: LeadStatus
  source: LeadSource
  externalId?: string
  agencyNumber: string
  agentId: string
  assignedAgentName?: string
  assignedAgentRole?: AgentRole
  leadActions: LeadAction[]
  createdAt: string
  updatedAt: string
}

export interface Agent {
  id: string
  email: string
  name: string
  agencyNumber: string
  role: AgentRole
}

// Clients module
export type FamilyStatus = 'SINGLE' | 'MARRIED' | 'COHABITING' | 'DIVORCED' | 'WIDOWED'

export interface Client {
  id: string
  agencyNumber: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  dateOfBirth?: string
  familyStatus?: FamilyStatus
  childrenCount: number
  notes?: string
  createdBy: string
  createdByName?: string
  createdAt: string
  updatedAt: string
}

// Tasks module
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
export type TaskPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'
export type TaskCategory = 'ADMIN' | 'COMMERCIAL' | 'SINISTRE' | 'RENEWAL' | 'OTHER'

export interface TaskComment {
  id: string
  taskId: string
  agentId: string
  agentName?: string
  content: string
  createdAt: string
}

export interface Task {
  id: string
  agencyNumber: string
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  leadId?: string
  leadName?: string
  assignedTo?: string
  assignedToName?: string
  assignedToRole?: AgentRole
  createdBy: string
  createdByName?: string
  completedAt?: string
  comments: TaskComment[]
  createdAt: string
  updatedAt: string
}
