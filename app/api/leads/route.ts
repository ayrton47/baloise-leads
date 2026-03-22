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

    // Filter by agency if possible, otherwise by agent_id
    if (currentAgent?.agency_number) {
      const { data: agencyAgents } = await supabase
        .from('agents')
        .select('id')
        .eq('agency_number', currentAgent.agency_number)

      if (agencyAgents && agencyAgents.length > 0) {
        query = query.in('agent_id', agencyAgents.map((a: any) => a.id))
      } else {
        query = query.eq('agent_id', payload.id)
      }
    } else {
      // No agency_number — just show this agent's leads
      query = query.eq('agent_id', payload.id)
    }

    if (status) query = query.eq('status', status)
    if (product) query = query.ilike('product_interest', `%${product}%`)

    const { data: leads, error } = await query

    if (error) throw error

    // Enrich actions with agent names
    const allAgentIds = new Set<string>()
    for (const lead of (leads ?? [])) {
      for (const a of (lead.lead_actions ?? [])) {
        if (a.created_by) allAgentIds.add(a.created_by)
      }
    }
    let agentMap: Record<string, string> = {}
    if (allAgentIds.size > 0) {
      const { data: agents } = await supabase.from('agents').select('id, name').in('id', [...allAgentIds])
      if (agents) {
        agentMap = Object.fromEntries(agents.map((a: any) => [a.id, a.name]))
      }
    }
    const enrichedLeads = (leads ?? []).map((lead: any) => ({
      ...lead,
      lead_actions: (lead.lead_actions ?? []).map((a: any) => ({
        ...a,
        agent_name: agentMap[a.created_by] || null,
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

    const { firstName, lastName, email, phone, productInterest } = await req.json()

    if (!firstName || !lastName || !productInterest) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          product_interest: productInterest,
          agent_id: payload.id,
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
