-- Allow users to read and update their own profile (for Settings/Profile page)
CREATE POLICY "Users can read own profile" ON profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
