-- Create leave_types table
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    max_days_per_year INTEGER NOT NULL DEFAULT 0,
    carry_forward BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default leave types
INSERT INTO leave_types (name, description, max_days_per_year, carry_forward) VALUES
('Annual Leave', 'Yearly vacation days', 25, true),
('Sick Leave', 'Medical leave for illness', 10, false),
('Personal Leave', 'Personal time off', 5, false),
('Maternity Leave', 'Maternity leave for new mothers', 90, false),
('Paternity Leave', 'Paternity leave for new fathers', 15, false)
ON CONFLICT (name) DO NOTHING;

-- Create function to update leave balance when request is approved
CREATE OR REPLACE FUNCTION update_leave_balance_on_approval(
    p_employee_id UUID,
    p_leave_type TEXT,
    p_days_used INTEGER,
    p_year INTEGER
)
RETURNS VOID AS $$
BEGIN
    -- Update or insert leave balance
    INSERT INTO leave_balances (employee_id, leave_type, year, used_days, remaining_days, total_days)
    VALUES (
        p_employee_id,
        p_leave_type,
        p_year,
        p_days_used,
        GREATEST(0, COALESCE((SELECT total_days FROM leave_balances WHERE employee_id = p_employee_id AND leave_type = p_leave_type AND year = p_year), 0) - p_days_used),
        COALESCE((SELECT total_days FROM leave_balances WHERE employee_id = p_employee_id AND leave_type = p_leave_type AND year = p_year), 0)
    )
    ON CONFLICT (employee_id, leave_type, year)
    DO UPDATE SET
        used_days = leave_balances.used_days + p_days_used,
        remaining_days = GREATEST(0, leave_balances.remaining_days - p_days_used),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leave_types
CREATE POLICY "Allow all authenticated users to read leave types" ON leave_types
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin and hr to manage leave types" ON leave_types
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'hr')
        )
    );
