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

    const { reason, note } = await req.json()

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
    }

    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('id', params.id)
      .eq('agent_id', agentId)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const { data: action, error: actionError } = await supabase
      .from('lead_actions')
      .insert([
        {
          lead_id: params.id,
          type: 'REFUSED',
          refusal_reason: reason,
          refusal_note: reason === 'OTHER' ? note : null,
          created_by: agentId,
        },
      ])
      .select()
      .single()

    if (actionError) throw actionError

    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'REFUSED' })
      .eq('id', params.id)

    if (updateError) throw updateError

    return NextResponse.json(snakeToCamel(action))
  } catch (error) {
    console.error('Refuse lead error:', error)
    return NextResponse.json(
      { error: 'Failed to refuse lead' },
      { status: 500 }
    )
  }
}
