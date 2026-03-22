import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { getJwtSecret, getAgentIdFromRequest } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  try {
    const agentId = getAgentIdFromRequest(req)
    if (!agentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, currentPassword, newPassword } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 })
    }

    // Get current agent
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (!agent) {
      return NextResponse.json({ error: 'Agent non trouvé' }, { status: 404 })
    }

    // Only name, email, and password are updatable (role is NOT allowed)
    const updates: Record<string, any> = { name, email }
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Mot de passe actuel requis' }, { status: 400 })
      }
      const passwordMatch = await bcryptjs.compare(currentPassword, agent.password)
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
      }
      updates.password = await bcryptjs.hash(newPassword, 10)
    }

    // Check email uniqueness if changed
    if (email !== agent.email) {
      const { data: existing } = await supabase
        .from('agents')
        .select('id')
        .eq('email', email)
        .neq('id', agentId)
        .single()
      if (existing) {
        return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
      }
    }

    const { error: updateError } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', agentId)

    if (updateError) throw updateError

    // Fetch updated agent to get current role and agency
    const { data: updatedAgent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    const finalRole = updatedAgent?.role ?? agent.role
    const agencyNumber = updatedAgent?.agency_number ?? agent.agency_number

    // Return updated agent info and new token
    const token = jwt.sign(
      { id: agentId, email, name, agencyNumber, role: finalRole },
      getJwtSecret(),
      { expiresIn: '24h' }
    )

    return NextResponse.json({ token, agent: { id: agentId, email, name, agencyNumber, role: finalRole } })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Échec de la mise à jour' }, { status: 500 })
  }
}
