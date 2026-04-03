import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { snakeToCamel, camelToSnake } from '@/lib/transform'
import { getTokenPayload } from '@/lib/auth'

// GET /api/bilan360?clientId=xxx — load a bilan for a client
// GET /api/bilan360 — load all bilans for the agent's agency
export async function GET(req: NextRequest) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = req.nextUrl.searchParams.get('clientId')

    const bilanId = req.nextUrl.searchParams.get('bilanId')

    // Load a specific bilan by ID
    if (bilanId) {
      const { data, error } = await supabase
        .from('bilan360')
        .select('*, agents:created_by(name)')
        .eq('id', bilanId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Bilan360 fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch bilan' }, { status: 500 })
      }

      if (data) {
        const agentName = (data as any).agents?.name || null
        const { agents: _, ...rest } = data as any
        return NextResponse.json({ ...snakeToCamel(rest), createdByName: agentName })
      }
      return NextResponse.json(null)
    }

    if (clientId) {
      // Load ALL bilans for a client
      const { data, error } = await supabase
        .from('bilan360')
        .select('*, agents:created_by(name)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Bilan360 fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch bilans' }, { status: 500 })
      }

      const bilans = (data || []).map((b: any) => {
        const agentName = b.agents?.name || null
        const { agents: _, ...rest } = b
        return { ...snakeToCamel(rest), createdByName: agentName }
      })
      return NextResponse.json(bilans)
    }

    // Load all bilans for the agency
    const { data: agent } = await supabase
      .from('agents')
      .select('agency_number')
      .eq('id', payload.id)
      .single()

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('bilan360')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Bilan360 list error:', error)
      return NextResponse.json({ error: 'Failed to fetch bilans' }, { status: 500 })
    }

    return NextResponse.json(snakeToCamel(data || []))
  } catch (err) {
    console.error('Bilan360 GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/bilan360 — create or update a bilan
export async function POST(req: NextRequest) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { clientId, bilanId, ...bilanData } = body

    // Convert to snake_case for DB
    const dbData = camelToSnake(bilanData)
    dbData.created_by = payload.id
    dbData.updated_at = new Date().toISOString()

    // Ensure children_ages is a proper array of strings for PostgreSQL text[]
    if (dbData.children_ages && Array.isArray(dbData.children_ages)) {
      dbData.children_ages = dbData.children_ages.map((a: any) => String(a || ''))
    }

    if (clientId) {
      dbData.client_id = clientId
    }

    // Update existing bilan if bilanId provided
    if (bilanId) {
      const { data, error } = await supabase
        .from('bilan360')
        .update(dbData)
        .eq('id', bilanId)
        .select()
        .single()

      if (error) {
        console.error('Bilan360 update error:', error)
        return NextResponse.json({ error: 'Failed to update bilan' }, { status: 500 })
      }

      return NextResponse.json(snakeToCamel(data))
    }

    // Always create a new bilan
    const { data, error } = await supabase
      .from('bilan360')
      .insert(dbData)
      .select()
      .single()

    if (error) {
      console.error('Bilan360 insert error:', error)
      return NextResponse.json({ error: 'Failed to create bilan' }, { status: 500 })
    }

    return NextResponse.json(snakeToCamel(data), { status: 201 })
  } catch (err) {
    console.error('Bilan360 POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
