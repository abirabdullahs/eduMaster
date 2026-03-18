-- ==========================================
-- Fix: Supabase Auth 500 on signup
-- handle_new_user: set search_path, safer casts
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val user_role := 'student';
  user_status_val user_status := 'active';
  user_class TEXT;
BEGIN
  -- Safe role cast
  IF (NEW.raw_user_meta_data->>'role') IN ('student', 'teacher', 'admin') THEN
    user_role_val := (NEW.raw_user_meta_data->>'role')::user_role;
  END IF;
  
  IF user_role_val = 'teacher' THEN
    user_status_val := 'pending'::user_status;
  END IF;
  
  IF (NEW.raw_user_meta_data->>'class') IN ('SSC', 'HSC') THEN
    user_class := NEW.raw_user_meta_data->>'class';
  END IF;

  INSERT INTO public.profiles (id, name, email, mobile, class, role, status)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), 'New User'),
    COALESCE(NEW.email, ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'mobile'), ''),
    user_class,
    user_role_val,
    user_status_val
  );
  RETURN NEW;
END;
$$;
