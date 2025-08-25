-- Add kanban_status column to tasks table
-- This will allow tasks to be organized in different Kanban columns

-- Create enum for kanban status
CREATE TYPE kanban_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done');

-- Add kanban_status column to tasks table
ALTER TABLE tasks ADD COLUMN kanban_status kanban_status DEFAULT 'backlog';

-- Update existing tasks based on their current status
-- Completed tasks go to 'done', pending tasks go to 'todo'
UPDATE tasks 
SET kanban_status = CASE 
    WHEN status = 'concluida' THEN 'done'::kanban_status
    ELSE 'todo'::kanban_status
END;

-- Add index for better performance when filtering by kanban_status
CREATE INDEX idx_tasks_kanban_status ON tasks(kanban_status);

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;