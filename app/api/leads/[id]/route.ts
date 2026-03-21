import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { snakeToCamel } from '@/lib/transform'
import jwt from 'jsonwebtoken'

function getAgentId(req: NextRequest): string | null {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string }
    return decoded.id
  } catch {
    return null
  }
}

// GET /api/leads/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = getAgentId(req)
    if (!agentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .select('*, lead_actions(*)')
      .eq('id', params.id)
      .eq('agent_id', agentId)
      .single()

    if (error) throw error

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Enrich actions with agent names
    const agentIds = [...new Set((lead.lead_actions ?? []).map((a: any) => a.created_by).filter(Boolean))]
    let agentMap: Record<string, string> = {}
    if (agentIds.length > 0) {
      const { data: agents } = await supabase.from('agents').select('id, name').in('id', agentIds)
      if (agents) {
        agentMap = Object.fromEntries(agents.map((a: any) => [a.id, a.name]))
      }
    }
    lead.lead_actions = (lead.lead_actions ?? []).map((a: any) => ({
      ...a,
      agent_name: agentMap[a.created_by] || null,
    }))

    return NextResponse.json(snakeToCamel(lead))
  } catch (error) {
    console.error('Get lead error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    )
  }
}

// DELETE /api/leads/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = getAgentId(req)
    if (!agentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify lead belongs to agent
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('id', params.id)
      .eq('agent_id', agentId)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete lead error:', error)
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    )
  }
}
