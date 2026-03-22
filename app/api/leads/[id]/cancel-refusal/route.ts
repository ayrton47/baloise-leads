import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { snakeToCamel } from '@/lib/transform'
import { getAgentIdFromRequest, verifyAgentCanAccessLead } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = getAgentIdFromRequest(req)
    if (!agentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canAccess = await verifyAgentCanAccessLead(agentId, params.id)
    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Verify lead exists and is currently REFUSED (any agent in the agency can act)
    const { data: lead } = await supabase
      .from('leads')
      .select('id, status')
      .eq('id', params.id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (lead.status !== 'REFUSED') {
      return NextResponse.json(
        { error: 'Ce lead n\'est pas en statut Refusé' },
        { status: 400 }
      )
    }

    // Parse optional note from request body
    let note: string | null = null
    try {
      const body = await req.json()
      note = body.note || null
    } catch {
      // No body is fine
    }

    // Create REFUSAL_CANCELLED action for audit trail
    const { data: action, error: actionError } = await supabase
      .from('lead_actions')
      .insert([
        {
          lead_id: params.id,
          type: 'REFUSAL_CANCELLED',
          note,
          created_by: agentId,
        },
      ])
      .select()
      .single()

    if (actionError) throw actionError

    // Set lead back to IN_PROGRESS
    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', params.id)

    if (updateError) throw updateError

    return NextResponse.json(snakeToCamel(action))
  } catch (error) {
    console.error('Cancel refusal error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel refusal' },
      { status: 500 }
    )
  }
}
