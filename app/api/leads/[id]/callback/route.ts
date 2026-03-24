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

    const { callbackDate, note } = await req.json()

    if (!callbackDate) {
      return NextResponse.json(
        { error: 'Callback date is required' },
        { status: 400 }
      )
    }

    // Reject dates in the past or today
    const selectedDate = new Date(callbackDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    if (selectedDate <= today) {
      return NextResponse.json(
        { error: 'La date doit être dans le futur' },
        { status: 400 }
      )
    }

    // Verify lead exists (any agent in the agency can act)
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const { data: action, error: actionError } = await supabase
      .from('lead_actions')
      .insert([
        {
          lead_id: params.id,
          type: 'CALLBACK_SCHEDULED',
          callback_date: new Date(callbackDate).toISOString(),
          note,
          created_by: agentId,
        },
      ])
      .select()
      .single()

    if (actionError) throw actionError

    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'TO_CONTACT' })
      .eq('id', params.id)

    if (updateError) throw updateError

    // Auto-create a task for this callback
    const { data: fullLead } = await supabase
      .from('leads')
      .select('first_name, last_name, agent_id, agency_number')
      .eq('id', params.id)
      .single()

    if (fullLead) {
      // Get agent's agency_number for the task
      const { data: agent } = await supabase
        .from('agents')
        .select('agency_number')
        .eq('id', agentId)
        .single()

      await supabase.from('tasks').insert({
        agency_number: agent?.agency_number || fullLead.agency_number,
        title: `Recontacter ${fullLead.first_name} ${fullLead.last_name}`,
        description: note || null,
        category: 'COMMERCIAL',
        priority: 'NORMAL',
        status: 'TODO',
        due_date: new Date(callbackDate).toISOString(),
        lead_id: params.id,
        assigned_to: fullLead.agent_id || null,
        created_by: agentId,
      })
    }

    return NextResponse.json(snakeToCamel(action))
  } catch (error) {
    console.error('Schedule callback error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule callback' },
      { status: 500 }
    )
  }
}
