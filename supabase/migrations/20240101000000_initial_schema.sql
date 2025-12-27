-- CricBase Initial Schema Migration
-- This migration creates all the base tables, indexes, and policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team1 TEXT NOT NULL,
    team2 TEXT NOT NULL,
    team1_logo TEXT,
    team2_logo TEXT,
    venue TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('live', 'completed', 'upcoming')),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('T20', 'ODI', 'Test')),
    score JSONB,
    current_over INTEGER,
    current_ball INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    over INTEGER NOT NULL,
    ball INTEGER NOT NULL,
    bowler TEXT NOT NULL,
    batsman TEXT NOT NULL,
    runs INTEGER NOT NULL DEFAULT 0,
    is_wicket BOOLEAN NOT NULL DEFAULT FALSE,
    wicket_type TEXT,
    is_four BOOLEAN NOT NULL DEFAULT FALSE,
    is_six BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment votes table
CREATE TABLE IF NOT EXISTS public.comment_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vote TEXT NOT NULL CHECK (vote IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Player stats table
CREATE TABLE IF NOT EXISTS public.player_stats (
    player_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name TEXT NOT NULL,
    matches INTEGER DEFAULT 0,
    runs INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    average DECIMAL(10, 2) DEFAULT 0,
    strike_rate DECIMAL(10, 2) DEFAULT 0,
    economy DECIMAL(10, 2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team stats table
CREATE TABLE IF NOT EXISTS public.team_stats (
    team_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_name TEXT NOT NULL UNIQUE,
    matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_percentage DECIMAL(5, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_deliveries_match_id ON public.deliveries(match_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_timestamp ON public.deliveries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_comments_delivery_id ON public.comments(delivery_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comment_votes_comment_id ON public.comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(date DESC);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read access to matches and deliveries
DROP POLICY IF EXISTS "Public read access to matches" ON public.matches;
CREATE POLICY "Public read access to matches" ON public.matches
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access to deliveries" ON public.deliveries;
CREATE POLICY "Public read access to deliveries" ON public.deliveries
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access to comments" ON public.comments;
CREATE POLICY "Public read access to comments" ON public.comments
    FOR SELECT USING (true);

-- Policies: Allow authenticated users to create comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies: Allow users to update their own comments
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies: Allow authenticated users to vote
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.comment_votes;
CREATE POLICY "Authenticated users can vote" ON public.comment_votes
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

