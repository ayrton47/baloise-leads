import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import jwt from 'jsonwebtoken'

// PATCH /api/leads/[id]/assign — assign a lead to an agent (responsable only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { agentId } = await req.json()
    if (!agentId) {
      return NextResponse.json({ error: 'agentId requis' }, { status: 400 })
    }

    // Get current user (must be RESPONSABLE)
    const { data: currentAgent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', decoded.id)
      .single()

    if (!currentAgent) {
      return NextResponse.json({ error: 'Agent non trouvé' }, { status: 404 })
    }

    if (currentAgent.role !== 'RESPONSABLE') {
      return NextResponse.json({ error: 'Seul un responsable peut attribuer un lead' }, { status: 403 })
    }

    // Get target agent — must be in same agency
    const { data: targetAgent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (!targetAgent) {
      return NextResponse.json({ error: 'Agent cible non trouvé' }, { status: 404 })
    }

    if (targetAgent.agency_number !== currentAgent.agency_number) {
      return NextResponse.json({ error: 'L\'agent cible n\'appartient pas à la même agence' }, { status: 403 })
    }

    // Get lead — must belong to the same agency
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead non trouvé' }, { status: 404 })
    }

    // Update lead's agent_id
    const { error: updateError } = await supabase
      .from('leads')
      .update({ agent_id: agentId, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    if (updateError) throw updateError

    // Log the assignment as a note action
    await supabase.from('lead_actions').insert({
      lead_id: params.id,
      type: 'NOTE_ADDED',
      note: `Lead attribué à ${targetAgent.name}`,
      created_by: decoded.id,
    })

    return NextResponse.json({
      success: true,
      assignedAgentId: agentId,
      assignedAgentName: targetAgent.name,
    })
  } catch (error) {
    console.error('Assign lead error:', error)
    return NextResponse.json({ error: 'Échec de l\'attribution' }, { status: 500 })
  }
}
