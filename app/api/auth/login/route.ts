import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { getJwtSecret } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('email', email)
      .single()

    if (!agent) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const passwordMatch = await bcryptjs.compare(password, agent.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { id: agent.id, email: agent.email, name: agent.name, agencyNumber: agent.agency_number, role: agent.role },
      getJwtSecret(),
      { expiresIn: '24h' }
    )

    return NextResponse.json({ token, agent: { id: agent.id, email: agent.email, name: agent.name, agencyNumber: agent.agency_number, role: agent.role } })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
