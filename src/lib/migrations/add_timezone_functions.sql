-- Add timezone-aware functions for daily task transitions

-- Function to get user's timezone
CREATE OR REPLACE FUNCTION get_user_timezone(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_tz TEXT;
BEGIN
    SELECT timezone INTO user_tz
    FROM user_settings
    WHERE user_id = user_uuid;
    
    -- Default to UTC if no timezone is set
    RETURN COALESCE(user_tz, 'UTC');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get start of day in user's timezone
CREATE OR REPLACE FUNCTION get_user_start_of_day(user_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS TIMESTAMPTZ AS $$
DECLARE
    user_tz TEXT;
    start_of_day TIMESTAMPTZ;
BEGIN
    user_tz := get_user_timezone(user_uuid);
    
    -- Create timestamp at midnight in user's timezone
    start_of_day := (target_date || ' 00:00:00')::TIMESTAMP AT TIME ZONE user_tz;
    
    RETURN start_of_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get end of day in user's timezone
CREATE OR REPLACE FUNCTION get_user_end_of_day(user_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS TIMESTAMPTZ AS $$
DECLARE
    user_tz TEXT;
    end_of_day TIMESTAMPTZ;
BEGIN
    user_tz := get_user_timezone(user_uuid);
    
    -- Create timestamp at 23:59:59.999 in user's timezone
    end_of_day := (target_date || ' 23:59:59.999')::TIMESTAMP AT TIME ZONE user_tz;
    
    RETURN end_of_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a timestamp is today in user's timezone
CREATE OR REPLACE FUNCTION is_today_in_user_timezone(user_uuid UUID, check_timestamp TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
DECLARE
    user_tz TEXT;
    user_date DATE;
    check_date DATE;
BEGIN
    user_tz := get_user_timezone(user_uuid);
    
    -- Get current date in user's timezone
    user_date := (NOW() AT TIME ZONE user_tz)::DATE;
    
    -- Get the date of the timestamp in user's timezone
    check_date := (check_timestamp AT TIME ZONE user_tz)::DATE;
    
    RETURN user_date = check_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a task is overdue in user's timezone
CREATE OR REPLACE FUNCTION is_task_overdue_in_user_timezone(user_uuid UUID, due_date TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
DECLARE
    user_end_of_today TIMESTAMPTZ;
BEGIN
    user_end_of_today := get_user_end_of_day(user_uuid, CURRENT_DATE);
    
    RETURN due_date < user_end_of_today;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tasks due today in user's timezone
DROP FUNCTION IF EXISTS get_tasks_due_today(UUID);
CREATE OR REPLACE FUNCTION get_tasks_due_today(user_uuid UUID)
RETURNS TABLE(
    id UUID,
    title TEXT,
    notes TEXT,
    due_date TIMESTAMPTZ,
    status task_status,
    category_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    user_id UUID,
    recurrence_type recurrence_type,
    recurrence_interval INTEGER,
    recurrence_end_date TIMESTAMPTZ,
    recurrence_max_occurrences INTEGER,
    parent_recurring_task_id UUID,
    is_recurring_instance BOOLEAN
) AS $$
DECLARE
    start_of_today TIMESTAMPTZ;
    end_of_today TIMESTAMPTZ;
BEGIN
    start_of_today := get_user_start_of_day(user_uuid, CURRENT_DATE);
    end_of_today := get_user_end_of_day(user_uuid, CURRENT_DATE);
    
    RETURN QUERY
    SELECT t.id, t.title, t.notes, t.due_date, t.status, 
           t.category_id, t.created_at, t.updated_at, t.completed_at,
           t.user_id, t.recurrence_type, t.recurrence_interval,
           t.recurrence_end_date, t.recurrence_max_occurrences,
           t.parent_recurring_task_id, t.is_recurring_instance
    FROM tasks t
    WHERE t.user_id = user_uuid
      AND t.due_date >= start_of_today
      AND t.due_date <= end_of_today
      AND t.status != 'completed'
    ORDER BY t.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get overdue tasks in user's timezone
DROP FUNCTION IF EXISTS get_overdue_tasks(UUID);
CREATE OR REPLACE FUNCTION get_overdue_tasks(user_uuid UUID)
RETURNS TABLE(
    id UUID,
    title TEXT,
    notes TEXT,
    due_date TIMESTAMPTZ,
    status task_status,
    category_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    user_id UUID,
    recurrence_type recurrence_type,
    recurrence_interval INTEGER,
    recurrence_end_date TIMESTAMPTZ,
    recurrence_max_occurrences INTEGER,
    parent_recurring_task_id UUID,
    is_recurring_instance BOOLEAN
) AS $$
DECLARE
    start_of_today TIMESTAMPTZ;
BEGIN
    start_of_today := get_user_start_of_day(user_uuid, CURRENT_DATE);
    
    RETURN QUERY
    SELECT t.id, t.title, t.notes, t.due_date, t.status, 
           t.category_id, t.created_at, t.updated_at, t.completed_at,
           t.user_id, t.recurrence_type, t.recurrence_interval,
           t.recurrence_end_date, t.recurrence_max_occurrences,
           t.parent_recurring_task_id, t.is_recurring_instance
    FROM tasks t
    WHERE t.user_id = user_uuid
      AND t.due_date < start_of_today
      AND t.status != 'completed'
    ORDER BY t.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to transition tasks at user's midnight
CREATE OR REPLACE FUNCTION transition_daily_tasks(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    moved_count INTEGER := 0;
    overdue_count INTEGER := 0;
BEGIN
    -- This function should be called by a scheduled job at each user's midnight
    -- It handles moving incomplete tasks and updating statuses
    
    -- Count overdue tasks that will be marked
    SELECT COUNT(*) INTO overdue_count
    FROM tasks t
    WHERE t.user_id = user_uuid
      AND is_task_overdue_in_user_timezone(user_uuid, t.due_date)
      AND t.status = 'pending';
    
    -- Update overdue tasks status (optional - you might want to keep them as pending)
    -- UPDATE tasks 
    -- SET status = 'overdue', updated_at = NOW()
    -- WHERE user_id = user_uuid
    --   AND is_task_overdue_in_user_timezone(user_uuid, due_date)
    --   AND status = 'pending';
    
    -- You can add more transition logic here based on your app's requirements
    -- For example: moving tasks to next day, creating recurring tasks, etc.
    
    result := json_build_object(
        'user_id', user_uuid,
        'transition_time', NOW(),
        'overdue_tasks_found', overdue_count,
        'tasks_moved', moved_count
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_timezone(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_start_of_day(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_end_of_day(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION is_today_in_user_timezone(UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION is_task_overdue_in_user_timezone(UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tasks_due_today(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_overdue_tasks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION transition_daily_tasks(UUID) TO authenticated;