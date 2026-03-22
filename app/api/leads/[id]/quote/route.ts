import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { snakeToCamel } from '@/lib/transform'
import { getAgentIdFromRequest, verifyAgentCanAccessLead } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = getAgentIdFromRequest(req)
    if (!agentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canAccess = await verifyAgentCanAccessLead(agentId, params.id)
    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { product, quoteUrl } = await req.json()

    if (!product) {
      return NextResponse.json({ error: 'Product is required' }, { status: 400 })
    }

    // Validate quoteUrl protocol if provided
    if (quoteUrl) {
      try {
        const url = new URL(quoteUrl)
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return NextResponse.json({ error: 'Invalid quote URL protocol. Only http and https are allowed.' }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid quote URL format' }, { status: 400 })
      }
    }

    // Verify lead exists (any agent in the agency can act)
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const { data: action, error: actionError } = await supabase
      .from('lead_actions')
      .insert([
        {
          lead_id: params.id,
          type: 'QUOTE_CREATED',
          quoted_product: product,
          quote_url: quoteUrl,
          created_by: agentId,
        },
      ])
      .select()
      .single()

    if (actionError) throw actionError

    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', params.id)

    if (updateError) throw updateError

    return NextResponse.json(snakeToCamel(action))
  } catch (error) {
    console.error('Create quote error:', error)
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    )
  }
}
