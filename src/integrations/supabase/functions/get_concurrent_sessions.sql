CREATE OR REPLACE FUNCTION get_concurrent_sessions(user_id_input UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO session_count
    FROM auth.sessions
    WHERE user_id = user_id_input
    AND not_after > now();
    
    RETURN session_count;
END;
$$;