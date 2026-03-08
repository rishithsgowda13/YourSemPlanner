'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Task } from '@/lib/types';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function TasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchTasks();
        }
    }, [user, filter]);

    const fetchTasks = async () => {
        if (!user) return;

        let query = supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('due_date', { ascending: true });

        if (filter === 'active') {
            query = query.eq('completed', false);
        } else if (filter === 'completed') {
            query = query.eq('completed', true);
        }

        const { data, error } = await query;

        if (!error && data) {
            setTasks(data);
        }

        setLoading(false);
    };

    const groupTasksByDate = () => {
        const grouped: { [key: string]: Task[] } = {};

        tasks.forEach((task) => {
            const date = new Date(task.due_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(task);
        });

        return grouped;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const groupedTasks = groupTasksByDate();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold gradient-text">All Tasks</h1>
                <Link href="/tasks/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                    </Button>
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                <Button
                    variant={filter === 'active' ? 'default' : 'outline'}
                    onClick={() => setFilter('active')}
                >
                    Active
                </Button>
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                >
                    All
                </Button>
                <Button
                    variant={filter === 'completed' ? 'default' : 'outline'}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </Button>
            </div>

            {/* Tasks Grouped by Date */}
            {Object.keys(groupedTasks).length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
                    <p className="text-muted-foreground mb-4">
                        {filter === 'completed'
                            ? 'You haven\'t completed any tasks yet.'
                            : 'Create your first task to get started!'}
                    </p>
                    <Link href="/tasks/new">
                        <Button variant="outline">Create Task</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedTasks).map(([date, dateTasks]) => (
                        <div key={date}>
                            <h2 className="text-xl font-semibold mb-3 text-muted-foreground">
                                {date}
                            </h2>
                            <div className="space-y-3">
                                {dateTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onComplete={() => fetchTasks()}
                                        onUpdate={fetchTasks}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
