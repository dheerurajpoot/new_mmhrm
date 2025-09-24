-- Create time tracking table
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  break_duration INTEGER DEFAULT 0, -- in minutes
  total_hours DECIMAL(4,2) GENERATED ALWAYS AS (
    CASE 
      WHEN clock_out IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600 - (break_duration / 60.0)
      ELSE 0
    END
  ) STOred,
  notes TEXT,
  date DATE GENERATED ALWAYS AS (clock_in::DATE) STOred,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work from home requests table
CREATE TABLE IF NOT EXISTS public.wfh_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_date DATE NOT NULL,
  reason TEXT,
  status leave_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wfh_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_entries
CREATE POLICY "Employees can view their own time entries" ON public.time_entries
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Employees can create their own time entries" ON public.time_entries
  FOR INSERT WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Employees can update their own time entries" ON public.time_entries
  FOR UPDATE USING (auth.uid() = employee_id);

CREATE POLICY "Admins and HR can view all time entries" ON public.time_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

-- RLS Policies for wfh_requests
CREATE POLICY "Employees can view their own WFH requests" ON public.wfh_requests
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Employees can create their own WFH requests" ON public.wfh_requests
  FOR INSERT WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Admins and HR can view all WFH requests" ON public.wfh_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

CREATE POLICY "Admins and HR can update WFH requests" ON public.wfh_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );
