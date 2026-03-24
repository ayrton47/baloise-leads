import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { snakeToCamel } from '@/lib/transform'
import { getTokenPayload } from '@/lib/auth'

const VALID_PRIORITIES = ['URGENT', 'HIGH', 'NORMAL', 'LOW']
const VALID_CATEGORIES = ['ADMIN', 'COMMERCIAL', 'SINISTRE', 'RENEWAL', 'OTHER']

// GET /api/tasks
export async function GET(req: NextRequest) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agent info
    const { data: currentAgent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', payload.id)
      .single()

    if (!currentAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Fetch tasks for this agency
    let query = supabase
      .from('tasks')
      .select('*, task_comments(*)')
      .eq('agency_number', currentAgent.agency_number)
      .order('created_at', { ascending: false })

    const { data: tasks, error } = await query

    if (error) {
      console.error('Tasks fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    // Get all agents in agency for name enrichment
    const { data: agencyAgents } = await supabase
      .from('agents')
      .select('id, name, role')
      .eq('agency_number', currentAgent.agency_number)

    const agentMap = new Map(agencyAgents?.map((a: any) => [a.id, a]) || [])

    // Enrich tasks with agent names and lead info
    const enrichedTasks = await Promise.all((tasks || []).map(async (task: any) => {
      const assignedAgent = task.assigned_to ? agentMap.get(task.assigned_to) : null
      const createdAgent = agentMap.get(task.created_by)

      let leadName = null
      if (task.lead_id) {
        const { data: lead } = await supabase
          .from('leads')
          .select('first_name, last_name')
          .eq('id', task.lead_id)
          .single()
        if (lead) leadName = `${lead.first_name} ${lead.last_name}`
      }

      // Enrich comments with agent names
      const comments = (task.task_comments || []).map((c: any) => {
        const commentAgent = agentMap.get(c.agent_id)
        return {
          ...c,
          agent_name: (commentAgent as any)?.name || 'Inconnu',
        }
      })

      // Remove task_comments key, use comments instead
      const { task_comments: _, ...taskWithoutComments } = task
      return {
        ...taskWithoutComments,
        comments,
        assigned_to_name: (assignedAgent as any)?.name || null,
        assigned_to_role: (assignedAgent as any)?.role || null,
        created_by_name: (createdAgent as any)?.name || 'Inconnu',
        lead_name: leadName,
      }
    }))

    return NextResponse.json(snakeToCamel(enrichedTasks))
  } catch (error) {
    console.error('Tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  try {
    const payload = getTokenPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, category, priority, dueDate, leadId, assignedTo } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
    }

    // Get agent's agency
    const { data: agent } = await supabase
      .from('agents')
      .select('agency_number, role')
      .eq('id', payload.id)
      .single()

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Only RESPONSABLE can assign to others
    if (assignedTo && assignedTo !== payload.id && agent.role !== 'RESPONSABLE') {
      return NextResponse.json({ error: 'Only managers can assign tasks to others' }, { status: 403 })
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        agency_number: agent.agency_number,
        title: title.trim(),
        description: description?.trim() || null,
        category: category || 'OTHER',
        priority: priority || 'NORMAL',
        due_date: dueDate || null,
        lead_id: leadId || null,
        assigned_to: assignedTo || null,
        created_by: payload.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Task create error:', error)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    return NextResponse.json(snakeToCamel(task), { status: 201 })
  } catch (error) {
    console.error('Task create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
