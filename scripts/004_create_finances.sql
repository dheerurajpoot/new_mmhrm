-- Create employee finances table
CREATE TABLE IF NOT EXISTS public.employee_finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  base_salary DECIMAL(12,2),
  hourly_rate DECIMAL(8,2),
  currency TEXT DEFAULT 'USD',
  pay_frequency TEXT DEFAULT 'monthly', -- weekly, bi-weekly, monthly
  bank_account TEXT,
  tax_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- Create payroll records table
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  gross_pay DECIMAL(12,2) NOT NULL,
  deductions DECIMAL(12,2) DEFAULT 0,
  net_pay DECIMAL(12,2) NOT NULL,
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  overtime_pay DECIMAL(12,2) DEFAULT 0,
  bonus DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, processed, paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.employee_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_finances
CREATE POLICY "Employees can view their own finances" ON public.employee_finances
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins and HR can view all finances" ON public.employee_finances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

CREATE POLICY "Admins and HR can manage finances" ON public.employee_finances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

-- RLS Policies for payroll_records
CREATE POLICY "Employees can view their own payroll" ON public.payroll_records
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins and HR can view all payroll" ON public.payroll_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

CREATE POLICY "Admins and HR can manage payroll" ON public.payroll_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );
