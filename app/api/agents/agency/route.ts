import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/auth'

// GET /api/agents/agency — returns all agents in the same agency as the current user
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, getJwtSecret())
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current agent's agency
    const { data: currentAgent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', decoded.id)
      .single()

    if (!currentAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Get all agents in the same agency
    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, name, email, role, agency_number')
      .eq('agency_number', currentAgent.agency_number)
      .order('name')

    if (error) throw error

    return NextResponse.json(
      (agents ?? []).map((a: any) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        role: a.role,
        agencyNumber: a.agency_number,
      }))
    )
  } catch (error) {
    console.error('Get agency agents error:', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}
