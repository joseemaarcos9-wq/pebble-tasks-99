-- Check current permissions for profiles table
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- Grant read access to anon users (for public profiles)
GRANT SELECT ON profiles TO anon;

-- Create RLS policies for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify permissions after changes
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;