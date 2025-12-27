-- CricBase Seed Data Migration
-- This migration inserts sample users, matches, deliveries, and stats
-- Note: Auth users must be created first via Supabase Dashboard > Authentication > Users

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    match1_id UUID;
    match2_id UUID;
    match3_id UUID;
    delivery1_id UUID;
    comment1_id UUID;
BEGIN
    -- Get user IDs from auth.users (if they exist)
    -- Create these users first: cricket_lover@cricbase.com, stats_guru@cricbase.com, bowling_fan@cricbase.com
    SELECT id INTO user1_id FROM auth.users WHERE email = 'cricket_lover@cricbase.com' LIMIT 1;
    SELECT id INTO user2_id FROM auth.users WHERE email = 'stats_guru@cricbase.com' LIMIT 1;
    SELECT id INTO user3_id FROM auth.users WHERE email = 'bowling_fan@cricbase.com' LIMIT 1;

    -- Insert sample users into public.users (only if auth users exist)
    IF user1_id IS NOT NULL THEN
        INSERT INTO public.users (id, username, email, avatar, created_at)
        VALUES (user1_id, 'cricket_lover', 'cricket_lover@cricbase.com', NULL, NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;

    IF user2_id IS NOT NULL THEN
        INSERT INTO public.users (id, username, email, avatar, created_at)
        VALUES (user2_id, 'stats_guru', 'stats_guru@cricbase.com', NULL, NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;

    IF user3_id IS NOT NULL THEN
        INSERT INTO public.users (id, username, email, avatar, created_at)
        VALUES (user3_id, 'bowling_fan', 'bowling_fan@cricbase.com', NULL, NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Sample Matches (always insert these)
    INSERT INTO public.matches (team1, team2, venue, status, date, format, score, current_over, current_ball)
    VALUES
        (
            'India',
            'Australia',
            'MCG, Melbourne',
            'live',
            NOW() - INTERVAL '2 hours',
            'T20',
            '{
                "team1": {"runs": 185, "wickets": 4, "overs": 20},
                "team2": {"runs": 120, "wickets": 3, "overs": 15.2}
            }'::jsonb,
            15,
            2
        ),
        (
            'England',
            'Pakistan',
            'Lord''s, London',
            'upcoming',
            NOW() + INTERVAL '1 day',
            'ODI',
            NULL,
            NULL,
            NULL
        ),
        (
            'New Zealand',
            'South Africa',
            'Eden Park, Auckland',
            'completed',
            NOW() - INTERVAL '1 day',
            'T20',
            '{
                "team1": {"runs": 210, "wickets": 6, "overs": 20},
                "team2": {"runs": 195, "wickets": 8, "overs": 20}
            }'::jsonb,
            NULL,
            NULL
        )
    ON CONFLICT DO NOTHING;

    -- Get the match IDs we just inserted
    SELECT id INTO match1_id FROM public.matches WHERE team1 = 'India' AND team2 = 'Australia' ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO match2_id FROM public.matches WHERE team1 = 'England' AND team2 = 'Pakistan' ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO match3_id FROM public.matches WHERE team1 = 'New Zealand' AND team2 = 'South Africa' ORDER BY created_at DESC LIMIT 1;

    -- Sample Deliveries (only if matches exist)
    IF match1_id IS NOT NULL THEN
        INSERT INTO public.deliveries (match_id, over, ball, bowler, batsman, runs, is_wicket, wicket_type, is_four, is_six, description, timestamp, comment_count)
        VALUES
            (
                match1_id,
                15,
                3,
                'Pat Cummins',
                'Virat Kohli',
                6,
                false,
                NULL,
                false,
                true,
                'Massive six! Kohli sends it over long-on for a maximum!',
                NOW() - INTERVAL '30 minutes',
                42
            ),
            (
                match1_id,
                14,
                5,
                'Mitchell Starc',
                'Rohit Sharma',
                4,
                false,
                NULL,
                true,
                false,
                'Beautiful cover drive! Four runs to the boundary.',
                NOW() - INTERVAL '35 minutes',
                28
            ),
            (
                match1_id,
                13,
                2,
                'Josh Hazlewood',
                'Rohit Sharma',
                0,
                true,
                'Bowled',
                false,
                false,
                'OUT! Clean bowled! Hazlewood gets the breakthrough!',
                NOW() - INTERVAL '40 minutes',
                156
            )
        ON CONFLICT DO NOTHING;
    END IF;

    IF match3_id IS NOT NULL THEN
        INSERT INTO public.deliveries (match_id, over, ball, bowler, batsman, runs, is_wicket, wicket_type, is_four, is_six, description, timestamp, comment_count)
        VALUES
            (
                match3_id,
                19,
                4,
                'Trent Boult',
                'Quinton de Kock',
                6,
                false,
                NULL,
                false,
                true,
                'Huge six! De Kock clears the boundary with ease!',
                NOW() - INTERVAL '1 day 10 minutes',
                89
            ),
            (
                match3_id,
                18,
                3,
                'Lockie Ferguson',
                'David Miller',
                4,
                false,
                NULL,
                true,
                false,
                'Classic drive through covers! Four runs!',
                NOW() - INTERVAL '1 day 15 minutes',
                52
            )
        ON CONFLICT DO NOTHING;
    END IF;

    -- Sample Comments (only if users and deliveries exist)
    IF match1_id IS NOT NULL THEN
        SELECT id INTO delivery1_id FROM public.deliveries WHERE match_id = match1_id AND over = 15 AND ball = 3 LIMIT 1;

        IF delivery1_id IS NOT NULL AND user1_id IS NOT NULL THEN
            INSERT INTO public.comments (delivery_id, user_id, content, parent_id, upvotes, downvotes, created_at)
            VALUES
                (
                    delivery1_id,
                    user1_id,
                    'What a shot! Kohli is in amazing form today!',
                    NULL,
                    15,
                    2,
                    NOW() - INTERVAL '25 minutes'
                )
            ON CONFLICT DO NOTHING;

            -- Get the comment ID for replies
            SELECT id INTO comment1_id FROM public.comments 
            WHERE delivery_id = delivery1_id AND user_id = user1_id 
            AND content = 'What a shot! Kohli is in amazing form today!'
            LIMIT 1;

            -- Reply comment
            IF user2_id IS NOT NULL AND comment1_id IS NOT NULL THEN
                INSERT INTO public.comments (delivery_id, user_id, content, parent_id, upvotes, downvotes, created_at)
                VALUES
                    (
                        delivery1_id,
                        user2_id,
                        'His strike rate has been incredible this season!',
                        comment1_id,
                        8,
                        0,
                        NOW() - INTERVAL '22 minutes'
                    )
                ON CONFLICT DO NOTHING;
            END IF;

            IF user3_id IS NOT NULL THEN
                INSERT INTO public.comments (delivery_id, user_id, content, parent_id, upvotes, downvotes, created_at)
                VALUES
                    (
                        delivery1_id,
                        user3_id,
                        'Cummins needs to adjust his line here.',
                        NULL,
                        5,
                        3,
                        NOW() - INTERVAL '18 minutes'
                    )
                ON CONFLICT DO NOTHING;
            END IF;
        END IF;
    END IF;

    -- Sample Player Stats
    INSERT INTO public.player_stats (player_name, matches, runs, wickets, average, strike_rate, economy, updated_at)
    VALUES
        ('Virat Kohli', 254, 12169, 0, 57.38, 93.17, NULL, NOW()),
        ('Jasprit Bumrah', 72, 35, 128, 20.99, 0, 4.63, NOW()),
        ('Rohit Sharma', 243, 9205, 8, 48.96, 90.31, NULL, NOW()),
        ('Pat Cummins', 143, 456, 217, 21.56, 0, 4.47, NOW()),
        ('Kane Williamson', 161, 8150, 29, 54.69, 81.57, NULL, NOW())
    ON CONFLICT DO NOTHING;

    -- Sample Team Stats
    INSERT INTO public.team_stats (team_name, matches, wins, losses, win_percentage, updated_at)
    VALUES
        ('India', 1024, 638, 350, 62.30, NOW()),
        ('Australia', 958, 581, 332, 60.60, NOW()),
        ('England', 781, 387, 362, 49.50, NOW()),
        ('Pakistan', 892, 456, 401, 51.10, NOW()),
        ('New Zealand', 678, 378, 276, 55.75, NOW()),
        ('South Africa', 745, 421, 299, 56.51, NOW())
    ON CONFLICT (team_name) DO UPDATE SET
        matches = EXCLUDED.matches,
        wins = EXCLUDED.wins,
        losses = EXCLUDED.losses,
        win_percentage = EXCLUDED.win_percentage,
        updated_at = NOW();

END $$;
