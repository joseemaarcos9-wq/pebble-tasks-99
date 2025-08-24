-- =========================================
-- SCHEMA COMPLETO - APP PESSOAL
-- =========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- PROFILES TABLE (User data)
-- =========================================
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- =========================================
-- TASK SYSTEM TABLES
-- =========================================

-- Task Lists
CREATE TABLE public.task_lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own task lists" 
  ON public.task_lists FOR ALL 
  USING (auth.uid() = user_id);

-- Tasks
CREATE TYPE task_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');
CREATE TYPE task_status AS ENUM ('pendente', 'concluida');

CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES public.task_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority DEFAULT 'media',
  status task_status DEFAULT 'pendente',
  tags TEXT[] DEFAULT '{}',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  link TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks" 
  ON public.tasks FOR ALL 
  USING (auth.uid() = user_id);

-- Subtasks
CREATE TABLE public.subtasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage subtasks of their own tasks" 
  ON public.subtasks FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  ));

-- Custom Views
CREATE TABLE public.custom_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT,
  filters JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.custom_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own custom views" 
  ON public.custom_views FOR ALL 
  USING (auth.uid() = user_id);

-- =========================================
-- FINANCE SYSTEM TABLES
-- =========================================

-- Account Types
CREATE TYPE account_type AS ENUM ('carteira', 'banco', 'cartao');
CREATE TYPE category_type AS ENUM ('despesa', 'receita');
CREATE TYPE transaction_type AS ENUM ('despesa', 'receita', 'transferencia');
CREATE TYPE transaction_status AS ENUM ('pendente', 'compensada');
CREATE TYPE recurrence_frequency AS ENUM ('mensal', 'semanal', 'anual', 'custom');

-- Finance Accounts
CREATE TABLE public.finance_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo account_type NOT NULL,
  saldo_inicial DECIMAL(12,2) DEFAULT 0,
  moeda TEXT DEFAULT 'BRL',
  cor TEXT,
  arquivada BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own finance accounts" 
  ON public.finance_accounts FOR ALL 
  USING (auth.uid() = user_id);

-- Categories
CREATE TABLE public.finance_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo category_type NOT NULL,
  parent_id UUID REFERENCES public.finance_categories(id) ON DELETE CASCADE,
  cor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own finance categories" 
  ON public.finance_categories FOR ALL 
  USING (auth.uid() = user_id);

-- Tags
CREATE TABLE public.finance_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, nome)
);

ALTER TABLE public.finance_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own finance tags" 
  ON public.finance_tags FOR ALL 
  USING (auth.uid() = user_id);

-- Transactions
CREATE TABLE public.finance_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conta_id UUID NOT NULL REFERENCES public.finance_accounts(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  valor DECIMAL(12,2) NOT NULL,
  tipo transaction_type NOT NULL,
  descricao TEXT,
  tags TEXT DEFAULT '',
  anexo_url TEXT,
  status transaction_status DEFAULT 'pendente',
  data DATE NOT NULL,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own finance transactions" 
  ON public.finance_transactions FOR ALL 
  USING (auth.uid() = user_id);

-- Recurrences
CREATE TABLE public.finance_recurrences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conta_id UUID NOT NULL REFERENCES public.finance_accounts(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  tipo transaction_type NOT NULL CHECK (tipo != 'transferencia'),
  frequencia recurrence_frequency NOT NULL,
  dia_base INTEGER NOT NULL,
  proxima_ocorrencia DATE NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  descricao TEXT,
  tags TEXT DEFAULT '',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.finance_recurrences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own finance recurrences" 
  ON public.finance_recurrences FOR ALL 
  USING (auth.uid() = user_id);

-- Budgets
CREATE TABLE public.finance_budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES public.finance_categories(id) ON DELETE CASCADE,
  valor_planejado DECIMAL(12,2) NOT NULL,
  mes_ano TEXT NOT NULL, -- 'YYYY-MM' format
  alert_threshold_pct INTEGER DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, categoria_id, mes_ano)
);

ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own finance budgets" 
  ON public.finance_budgets FOR ALL 
  USING (auth.uid() = user_id);

-- Filter Presets
CREATE TABLE public.finance_filter_presets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.finance_filter_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own finance filter presets" 
  ON public.finance_filter_presets FOR ALL 
  USING (auth.uid() = user_id);

-- =========================================
-- TRIGGERS FOR updated_at
-- =========================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_accounts_updated_at
  BEFORE UPDATE ON public.finance_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_transactions_updated_at
  BEFORE UPDATE ON public.finance_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_recurrences_updated_at
  BEFORE UPDATE ON public.finance_recurrences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_budgets_updated_at
  BEFORE UPDATE ON public.finance_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- PROFILE AUTO-CREATION TRIGGER
-- =========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- Task indexes
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_list_id ON public.tasks(list_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_tags ON public.tasks USING GIN(tags);

-- Finance indexes
CREATE INDEX idx_finance_transactions_user_id ON public.finance_transactions(user_id);
CREATE INDEX idx_finance_transactions_conta_id ON public.finance_transactions(conta_id);
CREATE INDEX idx_finance_transactions_data ON public.finance_transactions(data);
CREATE INDEX idx_finance_transactions_tipo ON public.finance_transactions(tipo);

-- =========================================
-- DEFAULT DATA SETUP
-- =========================================

-- Function to create default data for new users
CREATE OR REPLACE FUNCTION public.setup_user_defaults(user_id UUID)
RETURNS VOID AS $$
DECLARE
  inbox_list_id UUID;
  conta_principal_id UUID;
  cat_alimentacao_id UUID;
  cat_transporte_id UUID;
  cat_salario_id UUID;
BEGIN
  -- Create default task list
  INSERT INTO public.task_lists (user_id, name, color)
  VALUES (user_id, 'Inbox', '#ff6b35')
  RETURNING id INTO inbox_list_id;

  -- Create default finance account
  INSERT INTO public.finance_accounts (user_id, nome, tipo, saldo_inicial)
  VALUES (user_id, 'Conta Principal', 'banco', 0)
  RETURNING id INTO conta_principal_id;

  -- Create default categories
  INSERT INTO public.finance_categories (user_id, nome, tipo, cor)
  VALUES 
    (user_id, 'Alimentação', 'despesa', '#ef4444'),
    (user_id, 'Transporte', 'despesa', '#3b82f6'),
    (user_id, 'Salário', 'receita', '#10b981');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to include defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Setup default data
  PERFORM public.setup_user_defaults(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;