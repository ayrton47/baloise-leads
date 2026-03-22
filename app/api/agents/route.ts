import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import jwt from 'jsonwebtoken'

function getTokenPayload(req: NextRequest): { id: string; agencyNumber?: string } | null {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string; agencyNumber?: string }
  } catch {
    return null
  }
}

// GET /api/agents — list agents of the same agency
export async function GET(req: NextRequest) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agent's agency_number
    let agencyNumber = payload.agencyNumber
    if (!agencyNumber) {
      const { data: agent } = await supabase.from('agents').select('agency_number').eq('id', payload.id).single()
      agencyNumber = agent?.agency_number
    }

    if (!agencyNumber) {
      return NextResponse.json({ error: 'No agency found' }, { status: 400 })
    }

    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, name, email, role, agency_number, created_at')
      .eq('agency_number', agencyNumber)
      .order('role', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error

    const result = (agents ?? []).map((a: any) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      role: a.role,
      agencyNumber: a.agency_number,
      createdAt: a.created_at,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get agents error:', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}
