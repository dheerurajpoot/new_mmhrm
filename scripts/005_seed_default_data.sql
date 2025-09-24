-- Insert default leave balances for existing employees
INSERT INTO public.leave_balances (employee_id, leave_type, total_days, used_days, year)
SELECT 
  p.id,
  lt.leave_type,
  CASE 
    WHEN lt.leave_type = 'annual' THEN 25
    WHEN lt.leave_type = 'sick' THEN 10
    WHEN lt.leave_type = 'personal' THEN 5
    ELSE 0
  END as total_days,
  0 as used_days,
  EXTRACT(YEAR FROM NOW()) as year
FROM public.profiles p
CROSS JOIN (
  SELECT unnest(enum_range(NULL::leave_type)) as leave_type
) lt
WHERE NOT EXISTS (
  SELECT 1 FROM public.leave_balances lb 
  WHERE lb.employee_id = p.id 
  AND lb.leave_type = lt.leave_type 
  AND lb.year = EXTRACT(YEAR FROM NOW())
)
ON CONFLICT (employee_id, leave_type, year) DO NOTHING;
