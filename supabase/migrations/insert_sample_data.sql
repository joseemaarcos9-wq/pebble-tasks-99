-- Inserir dados de exemplo para testar o sistema de tarefas
-- Este script deve ser executado quando há um usuário autenticado

-- Primeiro, vamos verificar se existem usuários na tabela auth.users
-- e usar o primeiro usuário encontrado para criar os dados de exemplo

DO $$
DECLARE
    sample_user_id UUID;
    default_list_id UUID;
BEGIN
    -- Buscar um usuário existente
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- Se não houver usuário, criar dados sem user_id (para teste)
    IF sample_user_id IS NULL THEN
        -- Criar um UUID fictício para teste
        sample_user_id := gen_random_uuid();
    END IF;
    
    -- Inserir lista padrão se não existir
    INSERT INTO task_lists (id, name, color, user_id, created_at)
    VALUES (
        gen_random_uuid(),
        'Lista Geral',
        '#3b82f6',
        sample_user_id,
        NOW()
    )
    ON CONFLICT DO NOTHING;
    
    -- Buscar o ID da lista criada
    SELECT id INTO default_list_id FROM task_lists WHERE user_id = sample_user_id LIMIT 1;
    
    -- Inserir tarefas de exemplo
    INSERT INTO tasks (id, title, description, priority, status, kanban_status, list_id, user_id, tags, created_at, updated_at)
    VALUES 
    (
        gen_random_uuid(),
        'Configurar ambiente de desenvolvimento',
        'Instalar e configurar todas as ferramentas necessárias para o projeto',
        'alta',
        'concluida',
        'done',
        default_list_id,
        sample_user_id,
        ARRAY['desenvolvimento', 'setup'],
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day'
    ),
    (
        gen_random_uuid(),
        'Implementar sistema de autenticação',
        'Criar login, registro e recuperação de senha usando Supabase Auth',
        'urgente',
        'pendente',
        'in_progress',
        default_list_id,
        sample_user_id,
        ARRAY['autenticação', 'supabase', 'urgente'],
        NOW() - INTERVAL '1 day',
        NOW()
    ),
    (
        gen_random_uuid(),
        'Criar interface de usuário',
        'Desenvolver componentes React com Tailwind CSS',
        'media',
        'pendente',
        'todo',
        default_list_id,
        sample_user_id,
        ARRAY['frontend', 'react', 'ui'],
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'Testar funcionalidades',
        'Realizar testes unitários e de integração',
        'media',
        'pendente',
        'backlog',
        default_list_id,
        sample_user_id,
        ARRAY['testes', 'qualidade'],
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'Documentar API',
        'Criar documentação completa da API REST',
        'baixa',
        'pendente',
        'backlog',
        default_list_id,
        sample_user_id,
        ARRAY['documentação', 'api'],
        NOW(),
        NOW()
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Dados de exemplo inseridos com sucesso para o usuário: %', sample_user_id;
END $$;

-- Verificar dados inseridos
SELECT 'task_lists' as tabela, count(*) as total FROM task_lists
UNION ALL
SELECT 'tasks' as tabela, count(*) as total FROM tasks;