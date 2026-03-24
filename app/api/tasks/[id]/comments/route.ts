import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { snakeToCamel } from '@/lib/transform'
import { getTokenPayload } from '@/lib/auth'

// POST /api/tasks/:id/comments
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { content } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Verify task exists and same agency
    const { data: task } = await supabase
      .from('tasks')
      .select('agency_number')
      .eq('id', params.id)
      .single()

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('agency_number, name')
      .eq('id', payload.id)
      .single()

    if (!agent || agent.agency_number !== task.agency_number) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: comment, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: params.id,
        agent_id: payload.id,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('Comment create error:', error)
      return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
    }

    // Update task's updated_at
    await supabase
      .from('tasks')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.id)

    return NextResponse.json(snakeToCamel({ ...comment, agent_name: agent.name }), { status: 201 })
  } catch (error) {
    console.error('Comment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
