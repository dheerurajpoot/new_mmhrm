-- Create time_entries table for employee attendance tracking
CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,
    break_duration INTEGER DEFAULT 0, -- in minutes
    total_hours DECIMAL(4,2) DEFAULT 0,
    notes TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON public.time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON public.time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_date ON public.time_entries(employee_id, date);

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own time entries" ON public.time_entries
    FOR SELECT USING (
        auth.uid() = employee_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'hr')
        )
    );

CREATE POLICY "Users can insert their own time entries" ON public.time_entries
    FOR INSERT WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Users can update their own time entries" ON public.time_entries
    FOR UPDATE USING (
        auth.uid() = employee_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'hr')
        )
    );

CREATE POLICY "Admins and HR can delete time entries" ON public.time_entries
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'hr')
        )
    );

-- Create function to automatically calculate total hours
CREATE OR REPLACE FUNCTION calculate_total_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.clock_out IS NOT NULL THEN
        NEW.total_hours = EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600.0 - (COALESCE(NEW.break_duration, 0) / 60.0);
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate total hours
DROP TRIGGER IF EXISTS trigger_calculate_total_hours ON public.time_entries;
CREATE TRIGGER trigger_calculate_total_hours
    BEFORE INSERT OR UPDATE ON public.time_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total_hours();

-- Insert some sample data for testing
INSERT INTO public.time_entries (employee_id, clock_in, clock_out, date, notes) 
SELECT 
    p.id,
    (CURRENT_DATE - INTERVAL '1 day') + TIME '09:00:00',
    (CURRENT_DATE - INTERVAL '1 day') + TIME '17:30:00',
    CURRENT_DATE - INTERVAL '1 day',
    'Regular work day'
FROM public.profiles p 
WHERE p.role = 'employee'
LIMIT 3;

INSERT INTO public.time_entries (employee_id, clock_in, clock_out, date, notes) 
SELECT 
    p.id,
    CURRENT_DATE + TIME '08:30:00',
    CURRENT_DATE + TIME '16:45:00',
    CURRENT_DATE,
    'Early start today'
FROM public.profiles p 
WHERE p.role = 'employee'
LIMIT 2;

-- Insert some active entries (no clock_out)
INSERT INTO public.time_entries (employee_id, clock_in, date, notes) 
SELECT 
    p.id,
    CURRENT_DATE + TIME '09:15:00',
    CURRENT_DATE,
    'Currently working'
FROM public.profiles p 
WHERE p.role = 'employee'
LIMIT 1;
