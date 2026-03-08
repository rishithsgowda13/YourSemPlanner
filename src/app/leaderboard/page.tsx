'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
    id: string;
    full_name: string;
    points: number;
    rank: number;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [period, setPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [period]);

    const fetchLeaderboard = async () => {
        setLoading(true);

        let query = supabase
            .from('profiles')
            .select('id, full_name, points')
            .order('points', { ascending: false })
            .limit(50);

        // For weekly/monthly, filter by last_task_date
        if (period === 'weekly') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            query = query.gte('last_task_date', weekAgo.toISOString());
        } else if (period === 'monthly') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            query = query.gte('last_task_date', monthAgo.toISOString());
        }

        const { data, error } = await query;

        if (!error && data) {
            const withRanks = data.map((entry, index) => ({
                ...entry,
                rank: index + 1,
            }));
            setEntries(withRanks);
        }

        setLoading(false);
    };

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 gradient-text">🏆 Leaderboard</h1>
            <p className="text-muted-foreground mb-8">
                Compete with fellow students and climb the ranks!
            </p>

            {/* Period Selector */}
            <div className="flex gap-2 mb-6">
                <button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === 'weekly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-accent/50 hover:bg-accent text-muted-foreground'
                        }`}
                    onClick={() => setPeriod('weekly')}
                >
                    This Week
                </button>
                <button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === 'monthly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-accent/50 hover:bg-accent text-muted-foreground'
                        }`}
                    onClick={() => setPeriod('monthly')}
                >
                    This Month
                </button>
                <button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === 'alltime'
                        ? 'bg-blue-600 text-white'
                        : 'bg-accent/50 hover:bg-accent text-muted-foreground'
                        }`}
                    onClick={() => setPeriod('alltime')}
                >
                    All Time
                </button>
            </div>

            {/* Leaderboard Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {entries.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                            No data available for this period
                                        </td>
                                    </tr>
                                ) : (
                                    entries.map((entry) => (
                                        <tr
                                            key={entry.id}
                                            className={`hover:bg-accent/50 transition-colors ${entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-900/10 to-transparent' : ''
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-2xl font-bold">
                                                    {getRankEmoji(entry.rank)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {entry.full_name || 'Anonymous Student'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">
                                                    {entry.points} pts
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-semibold mb-1">How Points Work</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li>🎯 Complete task early: +10 points</li>
                    <li>✅ Complete on due date: +5 points</li>
                    <li>⏰ Complete late: +2 points</li>
                    <li>🔥 Maintain streaks for bonus multipliers!</li>
                </ul>
            </div>
        </div>
    );
}
