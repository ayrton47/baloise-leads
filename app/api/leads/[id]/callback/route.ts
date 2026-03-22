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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = getAgentId(req)
    if (!agentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    return NextResponse.json(snakeToCamel(action))
  } catch (error) {
    console.error('Schedule callback error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule callback' },
      { status: 500 }
    )
  }
}
