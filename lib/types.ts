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
