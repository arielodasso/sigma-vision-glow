-- ============================================================
-- Assign superadmin role to arielodassotec@gmail.com
-- ============================================================

-- First, ensure the profile exists (in case they signed up but trigger didn't fire)
INSERT INTO public.profiles (id, email, full_name, active)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name', 'Ariel Odasso'), true
FROM auth.users u
WHERE u.email = 'arielodassotec@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  active = true;

-- Assign superadmin role
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'superadmin'::public.app_role
FROM public.profiles p
WHERE p.email = 'arielodassotec@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.active,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
WHERE p.email = 'arielodassotec@gmail.com';