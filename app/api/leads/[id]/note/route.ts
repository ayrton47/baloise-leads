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

    const { note } = await req.json()

    if (!note || !note.trim()) {
      return NextResponse.json(
        { error: 'La remarque ne peut pas être vide' },
        { status: 400 }
      )
    }

    // Verify lead exists
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
          type: 'NOTE_ADDED',
          note: note.trim(),
          created_by: agentId,
        },
      ])
      .select()
      .single()

    if (actionError) throw actionError

    return NextResponse.json(snakeToCamel(action))
  } catch (error) {
    console.error('Add note error:', error)
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    )
  }
}
