import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = getAgentId(req)
    if (!agentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { product, quoteUrl } = await req.json()

    if (!product) {
      return NextResponse.json({ error: 'Product is required' }, { status: 400 })
    }

    const lead = await prisma.lead.findFirst({
      where: { id: params.id, agentId },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const [action] = await prisma.$transaction([
      prisma.leadAction.create({
        data: {
          leadId: params.id,
          type: 'QUOTE_CREATED',
          quotedProduct: product,
          quoteUrl,
          createdBy: agentId,
        },
      }),
      prisma.lead.update({
        where: { id: params.id },
        data: { status: 'QUOTED' },
      }),
    ])

    return NextResponse.json(action)
  } catch (error) {
    console.error('Create quote error:', error)
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    )
  }
}
