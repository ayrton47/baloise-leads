import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json()

    if (!email || !name || !password) {
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
      .insert([{ email, name, password: hashedPassword }])
      .select()
      .single()

    if (error) throw error

    const token = jwt.sign(
      { id: agent.id, email: agent.email, name: agent.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    )

    return NextResponse.json(
      { token, agent: { id: agent.id, email: agent.email, name: agent.name } },
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
