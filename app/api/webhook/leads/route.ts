import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function validateWebhookSignature(req: NextRequest, body: any): boolean {
  const signature = req.headers.get('x-webhook-signature')
  const webhookSecret = process.env.WEBHOOK_SECRET || 'secret'

  if (!signature) return false

  const hash = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(body))
    .digest('hex')

  return hash === signature
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate webhook signature
    if (!validateWebhookSignature(req, body)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { externalId, firstName, lastName, email, phone, product, agentEmail } = body

    if (!externalId || !firstName || !lastName || !product || !agentEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find agent by email
    const agent = await prisma.agent.findUnique({
      where: { email: agentEmail },
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Upsert lead
    const lead = await prisma.lead.upsert({
      where: { externalId },
      update: { status: 'NEW' },
      create: {
        externalId,
        firstName,
        lastName,
        email,
        phone,
        productInterest: product,
        source: 'API_EXTERNAL',
        agentId: agent.id,
      },
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
