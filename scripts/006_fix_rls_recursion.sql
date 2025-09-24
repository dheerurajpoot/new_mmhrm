-- Fix infinite recursion in profiles RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and HR can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "HR can view employee profiles" ON public.profiles;

-- Create a function to get current user's role without recursion
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
    LIMIT 1
  );
$$;

-- Create a function to check if current user is HR
CREATE OR REPLACE FUNCTION is_hr()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
    LIMIT 1
  );
$$;

-- Create a function to check if current user is admin or HR
CREATE OR REPLACE FUNCTION is_admin_or_hr()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
    LIMIT 1
  );
$$;

-- Recreate policies using functions to avoid recursion
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins and HR can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (is_admin_or_hr());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "HR can view employee profiles" ON public.profiles
  FOR SELECT USING (is_hr() AND role = 'employee');

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_hr() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_or_hr() TO authenticated;
