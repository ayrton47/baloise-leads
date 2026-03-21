import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const agent = await prisma.agent.findUnique({
      where: { email },
    })

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
      { id: agent.id, email: agent.email, name: agent.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    )

    return NextResponse.json({ token, agent: { id: agent.id, email: agent.email, name: agent.name } })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
