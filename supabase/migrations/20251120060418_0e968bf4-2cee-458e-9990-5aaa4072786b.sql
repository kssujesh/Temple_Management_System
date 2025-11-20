-- Fix critical security issue: Require authentication for donation creation
-- Drop the insecure policy that allows anyone to create donations
DROP POLICY IF EXISTS "Anyone can create donations" ON donations;

-- Create secure policy: Only authenticated users can create their own donations
CREATE POLICY "Authenticated users can create their own donations"
ON donations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- Ensure user_id is set when creating donations (server-side enforcement)
-- This prevents NULL user_id which would bypass RLS
ALTER TABLE donations 
ALTER COLUMN user_id SET NOT NULL;