-- Verificar dados existentes
SELECT 'task_lists' as table_name, count(*) as count FROM task_lists
UNION ALL
SELECT 'tasks' as table_name, count(*) as count FROM tasks;

-- Verificar permissões
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
AND table_name IN ('tasks', 'task_lists', 'subtasks', 'custom_views')
ORDER BY table_name, grantee;

-- Garantir permissões corretas para todas as tabelas
GRANT ALL PRIVILEGES ON tasks TO authenticated;
GRANT ALL PRIVILEGES ON task_lists TO authenticated;
GRANT ALL PRIVILEGES ON subtasks TO authenticated;
GRANT ALL PRIVILEGES ON custom_views TO authenticated;

GRANT SELECT ON tasks TO anon;
GRANT SELECT ON task_lists TO anon;
GRANT SELECT ON subtasks TO anon;
GRANT SELECT ON custom_views TO anon;

-- Verificar se há políticas RLS ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('tasks', 'task_lists', 'subtasks', 'custom_views');