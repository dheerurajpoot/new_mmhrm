-- Set up default admin user
-- This script ensures iconic.chandu777@gmail.com is always an admin

-- First, check if the user exists in auth.users and create if not
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if user exists in profiles
    SELECT id INTO admin_user_id FROM profiles WHERE email = 'iconic.chandu777@gmail.com';
    
    -- If user doesn't exist in profiles, create a placeholder profile
    IF admin_user_id IS NULL THEN
        INSERT INTO profiles (id, email, full_name, role, department, position, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'iconic.chandu777@gmail.com',
            'System Administrator',
            'admin',
            'IT',
            'System Administrator',
            NOW(),
            NOW()
        );
    ELSE
        -- If user exists, ensure they are admin
        UPDATE profiles 
        SET role = 'admin', 
            full_name = COALESCE(full_name, 'System Administrator'),
            department = COALESCE(department, 'IT'),
            position = COALESCE(position, 'System Administrator'),
            updated_at = NOW()
        WHERE email = 'iconic.chandu777@gmail.com';
    END IF;
END $$;

-- Create a function to automatically set admin role for this email
CREATE OR REPLACE FUNCTION ensure_default_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- If the email is our default admin, ensure admin role
    IF NEW.email = 'iconic.chandu777@gmail.com' THEN
        NEW.role = 'admin';
        NEW.full_name = COALESCE(NEW.full_name, 'System Administrator');
        NEW.department = COALESCE(NEW.department, 'IT');
        NEW.position = COALESCE(NEW.position, 'System Administrator');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure admin role
DROP TRIGGER IF EXISTS ensure_default_admin_trigger ON profiles;
CREATE TRIGGER ensure_default_admin_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_default_admin();
