-- Grant permissions for all finance tables to authenticated users
GRANT ALL PRIVILEGES ON finance_accounts TO authenticated;
GRANT ALL PRIVILEGES ON finance_transactions TO authenticated;
GRANT ALL PRIVILEGES ON finance_categories TO authenticated;
GRANT ALL PRIVILEGES ON finance_tags TO authenticated;
GRANT ALL PRIVILEGES ON finance_budgets TO authenticated;
GRANT ALL PRIVILEGES ON finance_recurrences TO authenticated;

-- Grant read access to anon users (for public data if needed)
GRANT SELECT ON finance_accounts TO anon;
GRANT SELECT ON finance_transactions TO anon;
GRANT SELECT ON finance_categories TO anon;
GRANT SELECT ON finance_tags TO anon;
GRANT SELECT ON finance_budgets TO anon;
GRANT SELECT ON finance_recurrences TO anon;

-- Ensure RLS is enabled on all finance tables
ALTER TABLE finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_recurrences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for finance_accounts
DROP POLICY IF EXISTS "Users can manage own accounts" ON finance_accounts;
CREATE POLICY "Users can manage own accounts" ON finance_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for finance_transactions
DROP POLICY IF EXISTS "Users can manage own transactions" ON finance_transactions;
CREATE POLICY "Users can manage own transactions" ON finance_transactions
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for finance_categories
DROP POLICY IF EXISTS "Users can manage own categories" ON finance_categories;
CREATE POLICY "Users can manage own categories" ON finance_categories
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for finance_tags
DROP POLICY IF EXISTS "Users can manage own tags" ON finance_tags;
CREATE POLICY "Users can manage own tags" ON finance_tags
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for finance_budgets
DROP POLICY IF EXISTS "Users can manage own budgets" ON finance_budgets;
CREATE POLICY "Users can manage own budgets" ON finance_budgets
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for finance_recurrences
DROP POLICY IF EXISTS "Users can manage own recurrences" ON finance_recurrences;
CREATE POLICY "Users can manage own recurrences" ON finance_recurrences
  FOR ALL USING (auth.uid() = user_id);

-- Verify permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name LIKE 'finance_%' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;