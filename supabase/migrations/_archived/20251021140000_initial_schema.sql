-- Initial schema for Sunday Proto
-- This migration sets up the basic structure using Supabase standards

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table that extends auth.users (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'agent', 'lawyer', 'admin', 'super_admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles(status);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only create if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles') THEN
    CREATE POLICY "Admins can view all profiles" ON profiles
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'super_admin')
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can update all profiles') THEN
    CREATE POLICY "Admins can update all profiles" ON profiles
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
