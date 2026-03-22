import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { snakeToCamel } from '@/lib/transform'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  id: string
  agencyNumber?: string
}

function getTokenPayload(req: NextRequest): TokenPayload | null {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload
    return decoded
  } catch {
    return null
  }
}

// GET /api/leads
export async function GET(req: NextRequest) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const product = searchParams.get('product')

    // Get agent info to find agency colleagues
    const { data: currentAgent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', payload.id)
      .single()

    let query = supabase
      .from('leads')
      .select('*, lead_actions(*)')
      .order('created_at', { ascending: false })

    // Filter by agency: include assigned leads + unassigned leads created by agency members
    if (currentAgent?.agency_number) {
      const { data: agencyAgents } = await supabase
        .from('agents')
        .select('id')
        .eq('agency_number', currentAgent.agency_number)

      if (agencyAgents && agencyAgents.length > 0) {
        const agentIds = agencyAgents.map((a: any) => a.id)
        // Show leads assigned to agency agents OR unassigned leads created by agency agents
        query = query.or(
          `agent_id.in.(${agentIds.join(',')}),and(agent_id.is.null,created_by.in.(${agentIds.join(',')}))`
        )
      } else {
        query = query.or(`agent_id.eq.${payload.id},and(agent_id.is.null,created_by.eq.${payload.id})`)
      }
    } else {
      query = query.or(`agent_id.eq.${payload.id},and(agent_id.is.null,created_by.eq.${payload.id})`)
    }

    if (status) query = query.eq('status', status)
    if (product) query = query.ilike('product_interest', `%${product}%`)

    const { data: leads, error } = await query

    if (error) throw error

    // Collect all agent IDs (action creators + lead owners)
    const allAgentIds = new Set<string>()
    for (const lead of (leads ?? [])) {
      if (lead.agent_id) allAgentIds.add(lead.agent_id)
      for (const a of (lead.lead_actions ?? [])) {
        if (a.created_by) allAgentIds.add(a.created_by)
      }
    }
    let agentMap: Record<string, { name: string; role: string }> = {}
    if (allAgentIds.size > 0) {
      const { data: agents } = await supabase.from('agents').select('id, name, role').in('id', [...allAgentIds])
      if (agents) {
        agentMap = Object.fromEntries(agents.map((a: any) => [a.id, { name: a.name, role: a.role }]))
      }
    }
    const enrichedLeads = (leads ?? []).map((lead: any) => ({
      ...lead,
      assigned_agent_name: agentMap[lead.agent_id]?.name || null,
      assigned_agent_role: agentMap[lead.agent_id]?.role || null,
      lead_actions: (lead.lead_actions ?? []).map((a: any) => ({
        ...a,
        agent_name: agentMap[a.created_by]?.name || null,
      })),
    }))

    return NextResponse.json(snakeToCamel(enrichedLeads))
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// POST /api/leads
export async function POST(req: NextRequest) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { firstName, lastName, email, phone, productInterest, assignedAgentId } = await req.json()

    if (!firstName || !lastName || !productInterest) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use assignedAgentId if provided, otherwise null (unassigned)
    const agentId = assignedAgentId || null

    const { data: lead, error } = await supabase
      .from('leads')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          product_interest: productInterest,
          agent_id: agentId,
          created_by: payload.id,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(snakeToCamel(lead), { status: 201 })
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
