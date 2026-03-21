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

// GET /api/leads
export async function GET(req: NextRequest) {
  try {
    const agentId = getAgentId(req)
    if (!agentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const product = searchParams.get('product')

    let query = supabase
      .from('leads')
      .select('*, lead_actions(*)')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (product) query = query.ilike('product_interest', `%${product}%`)

    const { data: leads, error } = await query

    if (error) throw error

    return NextResponse.json(snakeToCamel(leads))
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// POST /api/leads
export async function POST(req: NextRequest) {
  try {
    const agentId = getAgentId(req)
    if (!agentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { firstName, lastName, email, phone, productInterest } = await req.json()

    if (!firstName || !lastName || !productInterest) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          product_interest: productInterest,
          agent_id: agentId,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(snakeToCamel(lead), { status: 201 })
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
