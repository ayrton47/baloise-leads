export type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'TO_CONTACT' | 'QUOTED' | 'REFUSED' | 'CONVERTED'
export type ProductType = 'DRIVE' | 'HOME' | 'PENSION_PLAN'
export type RefusalReason = 'NO_ASSET' | 'PRICE_TOO_HIGH' | 'ALREADY_INSURED' | 'OTHER'
export type ActionType = 'REFUSED' | 'QUOTE_CREATED' | 'CALLBACK_SCHEDULED' | 'NOTE_ADDED'
export type LeadSource = 'MANUAL' | 'API_EXTERNAL'

export interface LeadAction {
  id: string
  leadId: string
  type: ActionType
  refusalReason?: RefusalReason
  refusalNote?: string
  quotedProduct?: ProductType
  quoteUrl?: string
  callbackDate?: string
  note?: string
  createdAt: string
  createdBy: string
}

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  productInterest: ProductType
  status: LeadStatus
  source: LeadSource
  externalId?: string
  agentId: string
  actions: LeadAction[]
  createdAt: string
  updatedAt: string
}

export interface Agent {
  id: string
  email: string
  name: string
}
