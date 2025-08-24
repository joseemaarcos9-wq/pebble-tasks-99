-- =========================================
-- CORREÇÃO DE SEGURANÇA - SEARCH PATH
-- =========================================

-- Corrigir funções para usar search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;