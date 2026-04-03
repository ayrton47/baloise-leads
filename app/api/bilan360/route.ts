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

    if (clientId) {
      // Load specific bilan for a client
      const { data, error } = await supabase
        .from('bilan360')
        .select('*, agents:created_by(name)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
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
    const { clientId, ...bilanData } = body

    // Convert to snake_case for DB
    const dbData = camelToSnake(bilanData)
    dbData.created_by = payload.id
    dbData.updated_at = new Date().toISOString()

    if (clientId) {
      dbData.client_id = clientId

      // Check if a bilan already exists for this client
      const { data: existing } = await supabase
        .from('bilan360')
        .select('id')
        .eq('client_id', clientId)
        .limit(1)
        .single()

      if (existing) {
        // Update existing bilan
        const { data, error } = await supabase
          .from('bilan360')
          .update(dbData)
          .eq('id', existing.id)
          .select()
          .single()

        if (error) {
          console.error('Bilan360 update error:', error)
          return NextResponse.json({ error: 'Failed to update bilan' }, { status: 500 })
        }

        return NextResponse.json(snakeToCamel(data))
      }
    }

    // Create new bilan (without client association if no clientId)
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
