export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    points: number;
    streak_count: number;
    last_task_date?: string;
    created_at: string;
}

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    due_date: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
    completed_at?: string;
    is_recurring: boolean;
    created_at: string;
}

export interface Note {
    id: string;
    user_id: string;
    title: string;
    file_path: string;
    created_at: string;
}
