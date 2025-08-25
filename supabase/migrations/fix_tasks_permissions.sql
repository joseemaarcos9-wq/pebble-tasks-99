-- Grant permissions for all task tables to authenticated users
GRANT ALL PRIVILEGES ON tasks TO authenticated;
GRANT ALL PRIVILEGES ON task_lists TO authenticated;
GRANT ALL PRIVILEGES ON subtasks TO authenticated;

-- Grant read access to anon users (for public data if needed)
GRANT SELECT ON tasks TO anon;
GRANT SELECT ON task_lists TO anon;
GRANT SELECT ON subtasks TO anon;

-- Ensure RLS is enabled on all task tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for task_lists
DROP POLICY IF EXISTS "Users can manage own task lists" ON task_lists;
CREATE POLICY "Users can manage own task lists" ON task_lists
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for subtasks (based on parent task ownership)
DROP POLICY IF EXISTS "Users can manage own subtasks" ON subtasks;
CREATE POLICY "Users can manage own subtasks" ON subtasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = subtasks.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Verify permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name IN ('tasks', 'task_lists', 'subtasks') 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;