import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, name, password, agencyNumber } = await req.json()

    if (!email || !name || !password || !agencyNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('email', email)
      .single()

    if (existingAgent) {
      return NextResponse.json(
        { error: 'Agent already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const { data: agent, error } = await supabase
      .from('agents')
      .insert([{ email, name, password: hashedPassword, agency_number: agencyNumber, role: 'EMPLOYE' }])
      .select()
      .single()

    if (error) throw error

    const token = jwt.sign(
      { id: agent.id, email: agent.email, name: agent.name, agencyNumber: agent.agency_number, role: agent.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    )

    return NextResponse.json(
      { token, agent: { id: agent.id, email: agent.email, name: agent.name, agencyNumber: agent.agency_number, role: agent.role } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
