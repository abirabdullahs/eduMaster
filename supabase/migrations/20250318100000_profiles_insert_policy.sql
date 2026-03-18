-- ==========================================
-- Fix: "Database error saving new user"
-- 1. Profiles had RLS but NO INSERT policy - client upsert failed
-- 2. Trigger didn't include mobile/class - now reads from user_metadata
-- ==========================================

-- 1. Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Update trigger to include mobile & class from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, mobile, class, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email,
    NEW.raw_user_meta_data->>'mobile',
    NEW.raw_user_meta_data->>'class',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role') = 'teacher' THEN 'pending'::user_status
      ELSE 'active'::user_status
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
