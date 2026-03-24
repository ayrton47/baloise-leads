-- Performance indexes for leads table
CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_agent_status ON leads(agent_id, status);

-- Performance indexes for lead_actions table
CREATE INDEX IF NOT EXISTS idx_lead_actions_lead_id ON lead_actions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_actions_created_at ON lead_actions(created_at DESC);

-- Performance indexes for tasks table (if not already created)
CREATE INDEX IF NOT EXISTS idx_tasks_agency ON tasks(agency_number);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_agency_status ON tasks(agency_number, status);

-- Performance indexes for task_comments
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
