import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { snakeToCamel, camelToSnake } from '@/lib/transform'
import { getTokenPayload } from '@/lib/auth'

// GET /api/clients — list all clients for the agent's agency
export async function GET(req: NextRequest) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('agency_number')
      .eq('id', payload.id)
      .single()

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('agency_number', agent.agency_number)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Clients list error:', error)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    // Enrich with creator names
    const agentIds = [...new Set((data || []).map((c: any) => c.created_by).filter(Boolean))]
    let agentMap: Record<string, string> = {}
    if (agentIds.length > 0) {
      const { data: agents } = await supabase
        .from('agents')
        .select('id, name')
        .in('id', agentIds)
      if (agents) {
        agentMap = Object.fromEntries(agents.map((a: any) => [a.id, a.name]))
      }
    }

    const enriched = (data || []).map((c: any) => ({
      ...snakeToCamel(c),
      createdByName: agentMap[c.created_by] || 'Inconnu',
    }))

    return NextResponse.json(enriched)
  } catch (err) {
    console.error('Clients GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/clients — create a new client
export async function POST(req: NextRequest) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('agency_number')
      .eq('id', payload.id)
      .single()

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const body = await req.json()
    const dbData = camelToSnake(body)
    dbData.agency_number = agent.agency_number
    dbData.created_by = payload.id
    dbData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('clients')
      .insert(dbData)
      .select()
      .single()

    if (error) {
      console.error('Client create error:', error)
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }

    return NextResponse.json(snakeToCamel(data), { status: 201 })
  } catch (err) {
    console.error('Clients POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
