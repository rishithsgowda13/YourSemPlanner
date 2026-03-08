'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Task, Profile } from '@/lib/types';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { Plus, Trophy, Flame, Target } from 'lucide-react';
import Link from 'next/link';
import { calculateStreak } from '@/lib/utils';

export default function DashboardPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchTodayTasks();
            fetchProfile();
        }
    }, [user]);

    const fetchTodayTasks = async () => {
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('due_date', today)
            .eq('completed', false)
            .order('priority', { ascending: true })
            .order('created_at', { ascending: true });

        if (!error && data) {
            // Sort by priority: high, medium, low
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const sorted = data.sort(
                (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
            );
            setTasks(sorted);
        }

        setLoading(false);
    };

    const fetchProfile = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!error && data) {
            setProfile(data);
        }
    };

    const handleTaskComplete = async (taskId: string) => {
        // Optimistically update UI
        setTasks(tasks.filter(t => t.id !== taskId));

        // Refresh profile to update points and streak
        await fetchProfile();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const streak = profile?.last_task_date ? calculateStreak(profile.last_task_date) : 0;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Stats */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
                </h1>
                <p className="text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard
                    icon={<Trophy className="h-6 w-6 text-yellow-600" />}
                    label="Total Points"
                    value={profile?.points || 0}
                    gradient="from-yellow-500 to-orange-500"
                />
                <StatCard
                    icon={<Flame className="h-6 w-6 text-red-600" />}
                    label="Current Streak"
                    value={`${streak} days`}
                    gradient="from-red-500 to-pink-500"
                />
                <StatCard
                    icon={<Target className="h-6 w-6 text-blue-600" />}
                    label="Tasks Today"
                    value={tasks.length}
                    gradient="from-blue-500 to-purple-500"
                />
            </div>

            {/* Today's Tasks */}
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Today's Focus</h2>
                    <Link href="/tasks/new">
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                        </Button>
                    </Link>
                </div>

                {tasks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                        <p className="text-muted-foreground mb-4">
                            No tasks due today. Time to plan ahead or take a break!
                        </p>
                        <Link href="/tasks/new">
                            <Button variant="outline">Add a task for today</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onComplete={handleTaskComplete}
                                onUpdate={fetchTodayTasks}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <QuickAction href="/tasks" label="All Tasks" emoji="📋" />
                <QuickAction href="/tasks/calendar" label="Calendar" emoji="📅" />
                <QuickAction href="/notes" label="Notes" emoji="📝" />
                <QuickAction href="/leaderboard" label="Leaderboard" emoji="🏆" />
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    gradient
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    gradient: string;
}) {
    return (
        <div className={`bg-gradient-to-br ${gradient} p-6 rounded-xl text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-2 rounded-lg">{icon}</div>
            </div>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className="text-sm opacity-90">{label}</div>
        </div>
    );
}

function QuickAction({
    href,
    label,
    emoji
}: {
    href: string;
    label: string;
    emoji: string;
}) {
    return (
        <Link href={href}>
            <div className="bg-card p-4 rounded-xl shadow hover:shadow-lg transition-shadow border border-border text-center">
                <div className="text-3xl mb-2">{emoji}</div>
                <div className="text-sm font-medium">{label}</div>
            </div>
        </Link>
    );
}
