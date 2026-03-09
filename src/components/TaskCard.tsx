'use client';

import { Task } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';
import { CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { calculatePoints } from '@/lib/utils';

interface TaskCardProps {
    task: Task;
    onComplete: (taskId: string) => void;
    onUpdate: () => void;
}

export function TaskCard({ task, onComplete, onUpdate }: TaskCardProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const priorityColors: Record<Task['priority'], string> = {
        high: 'border-l-4 border-l-red-500 bg-red-900/20',
        medium: 'border-l-4 border-l-yellow-500 bg-yellow-900/20',
        low: 'border-l-4 border-l-green-500 bg-green-900/20',
    };

    const priorityBadges: Record<Task['priority'], string> = {
        high: 'bg-red-900 text-red-200',
        medium: 'bg-yellow-900 text-yellow-200',
        low: 'bg-green-900 text-green-200',
    };

    const handleComplete = async () => {
        if (!user) return;
        setLoading(true);

        // Calculate points based on completion timing
        const points = calculatePoints(task.due_date);

        // Mark task as completed
        const { error: taskError } = await supabase
            .from('tasks')
            .update({
                completed: true,
                completed_at: new Date().toISOString(),
            })
            .eq('id', task.id);

        if (taskError) {
            toast({
                title: 'Error',
                description: 'Failed to complete task',
                variant: 'destructive',
            });
            setLoading(false);
            return;
        }

        // Award points
        const { error: pointsError } = await supabase
            .from('points_log')
            .insert({
                user_id: user.id,
                task_id: task.id,
                points: points,
                reason: `Completed: ${task.title}`,
            });

        // Update user's total points and last task date
        const { data: profileData } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', user.id)
            .single();

        const currentPoints = profileData?.points || 0;

        await supabase
            .from('profiles')
            .update({
                points: currentPoints + points,
                last_task_date: new Date().toISOString(),
            })
            .eq('id', user.id);

        toast({
            title: '🎉 Task Completed!',
            description: `+${points} points earned`,
        });

        onComplete(task.id);
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        setLoading(true);
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', task.id);

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete task',
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Success',
                description: 'Task deleted',
            });
            onUpdate();
        }

        setLoading(false);
    };

    return (
        <div className={`p-4 rounded-lg ${priorityColors[task.priority]} border border-border transition-all hover:shadow-md`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityBadges[task.priority]}`}>
                            {task.priority.toUpperCase()}
                        </span>
                        {task.is_recurring && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                🔄 Recurring
                            </span>
                        )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
                    {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                        </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Button
                        size="sm"
                        onClick={handleComplete}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
