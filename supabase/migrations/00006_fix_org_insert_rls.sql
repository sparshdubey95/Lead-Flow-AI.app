BEGIN;

-- 1. Organizations: Allow any authenticated user to create an organization
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow authenticated users to create organizations" ON public.organizations;

CREATE POLICY "Allow authenticated users to create organizations" 
ON public.organizations
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 2. Profiles: Allow users to UPDATE their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;

CREATE POLICY "Allow users to update their own profile" 
ON public.profiles
FOR UPDATE 
TO authenticated 
USING (id = auth.uid()) 
WITH CHECK (id = auth.uid());

COMMIT;
