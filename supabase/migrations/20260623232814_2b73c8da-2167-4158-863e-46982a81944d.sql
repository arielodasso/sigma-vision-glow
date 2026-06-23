UPDATE auth.users
SET encrypted_password = crypt('argentina_mundial2026#', gen_salt('bf')),
    updated_at = now()
WHERE email = 'arielodassotec@gmail.com';