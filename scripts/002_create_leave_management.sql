-- Create leave types enum
CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

-- Create leave requests table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  reason TEXT,
  status leave_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leave balances table
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  total_days INTEGER DEFAULT 0,
  used_days INTEGER DEFAULT 0,
  remaining_days INTEGER GENERATED ALWAYS AS (total_days - used_days) STOred,
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, leave_type, year)
);

-- Enable RLS
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_requests
CREATE POLICY "Employees can view their own leave requests" ON public.leave_requests
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Employees can create their own leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Admins and HR can view all leave requests" ON public.leave_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

CREATE POLICY "Admins and HR can update leave requests" ON public.leave_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

-- RLS Policies for leave_balances
CREATE POLICY "Employees can view their own leave balances" ON public.leave_balances
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins and HR can view all leave balances" ON public.leave_balances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

CREATE POLICY "Admins and HR can manage leave balances" ON public.leave_balances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );
