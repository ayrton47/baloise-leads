import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase-client'

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is required')
  return secret
}

export function getWebhookSecret(): string {
  const secret = process.env.WEBHOOK_SECRET
  if (!secret) throw new Error('WEBHOOK_SECRET environment variable is required')
  return secret
}

export function getAgentIdFromRequest(req: NextRequest): string | null {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) return null
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string }
    return decoded.id
  } catch {
    return null
  }
}

export function getTokenPayload(req: NextRequest): { id: string; agencyNumber?: string } | null {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) return null
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; agencyNumber?: string }
    return decoded
  } catch {
    return null
  }
}

export async function verifyAgentCanAccessLead(agentId: string, leadId: string): Promise<boolean> {
  // Get agent's agency
  const { data: agent } = await supabase.from('agents').select('agency_number').eq('id', agentId).single()
  if (!agent) return false

  // Get all agents in this agency
  const { data: agencyAgents } = await supabase.from('agents').select('id').eq('agency_number', agent.agency_number)
  if (!agencyAgents) return false
  const agencyAgentIds = agencyAgents.map((a: any) => a.id)

  // Verify the lead belongs to this agency (via agent_id or created_by)
  const { data: lead } = await supabase
    .from('leads')
    .select('id, agent_id, created_by')
    .eq('id', leadId)
    .single()

  if (!lead) return false

  // Lead is accessible if assigned to an agency member, or unassigned but created by an agency member
  if (lead.agent_id && agencyAgentIds.includes(lead.agent_id)) return true
  if (!lead.agent_id && lead.created_by && agencyAgentIds.includes(lead.created_by)) return true

  return false
}
