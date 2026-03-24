import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { snakeToCamel } from '@/lib/transform'
import { getTokenPayload } from '@/lib/auth'

const VALID_PRIORITIES = ['URGENT', 'HIGH', 'NORMAL', 'LOW']
const VALID_CATEGORIES = ['ADMIN', 'COMMERCIAL', 'SINISTRE', 'RENEWAL', 'OTHER']
const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']

// GET /api/tasks/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .select('*, task_comments(*)')
      .eq('id', params.id)
      .single()

    if (error || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify same agency
    const { data: agent } = await supabase
      .from('agents')
      .select('agency_number')
      .eq('id', payload.id)
      .single()

    if (!agent || agent.agency_number !== task.agency_number) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(snakeToCamel(task))
  } catch (error) {
    console.error('Task fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/tasks/:id
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, category, priority, status, dueDate, leadId, assignedTo } = body

    // Verify task exists and same agency
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('agency_number, role')
      .eq('id', payload.id)
      .single()

    if (!agent || agent.agency_number !== existingTask.agency_number) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only RESPONSABLE can reassign tasks
    if (assignedTo !== undefined && assignedTo !== payload.id && agent.role !== 'RESPONSABLE') {
      return NextResponse.json({ error: 'Only managers can reassign tasks' }, { status: 403 })
    }

    // Validate fields
    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updates: any = { updated_at: new Date().toISOString() }
    if (title !== undefined) updates.title = title.trim()
    if (description !== undefined) updates.description = description?.trim() || null
    if (category !== undefined) updates.category = category
    if (priority !== undefined) updates.priority = priority
    if (status !== undefined) {
      updates.status = status
      if (status === 'DONE') updates.completed_at = new Date().toISOString()
      if (status === 'TODO' || status === 'IN_PROGRESS') updates.completed_at = null
    }
    if (dueDate !== undefined) updates.due_date = dueDate || null
    if (leadId !== undefined) updates.lead_id = leadId || null
    if (assignedTo !== undefined) updates.assigned_to = assignedTo || null

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Task update error:', error)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    return NextResponse.json(snakeToCamel(task))
  } catch (error) {
    console.error('Task update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/tasks/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify task exists
    const { data: task } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Only creator or RESPONSABLE can delete
    const { data: agent } = await supabase
      .from('agents')
      .select('agency_number, role')
      .eq('id', payload.id)
      .single()

    if (!agent || agent.agency_number !== task.agency_number) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (task.created_by !== payload.id && agent.role !== 'RESPONSABLE') {
      return NextResponse.json({ error: 'Only task creator or managers can delete tasks' }, { status: 403 })
    }

    const { error } = await supabase.from('tasks').delete().eq('id', params.id)

    if (error) {
      console.error('Task delete error:', error)
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Task delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
