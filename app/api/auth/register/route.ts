import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json()

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const existingAgent = await prisma.agent.findUnique({
      where: { email },
    })

    if (existingAgent) {
      return NextResponse.json(
        { error: 'Agent already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const agent = await prisma.agent.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    })

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
