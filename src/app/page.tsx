import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    CheckCircle2,
    Calendar,
    Trophy,
    Brain,
    Target,
    ArrowRight
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="py-20 px-4 text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text animate-fadeIn">
                    Plan Your Semester,
                    <br />
                    Crush Your Goals
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    The anti-procrastination task manager built for students.
                    Stay focused, earn rewards, and ace your exams.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                    <Link href="/auth/register">
                        <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/auth/login">
                        <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 px-4">
                <h2 className="text-3xl font-bold text-center mb-12">
                    Everything You Need to Stay on Track
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <FeatureCard
                        icon={<Target className="h-10 w-10 text-blue-600" />}
                        title="Today Focus"
                        description="See only what matters today. High → Medium → Low priority tasks at a glance."
                    />
                    <FeatureCard
                        icon={<CheckCircle2 className="h-10 w-10 text-green-600" />}
                        title="Minimal Task Entry"
                        description="No complex forms. Just subject, deadline, priority. Done in 5 seconds."
                    />
                    <FeatureCard
                        icon={<Calendar className="h-10 w-10 text-purple-600" />}
                        title="Drag & Drop"
                        description="Reschedule tasks by dragging between days. Visual planning made easy."
                    />
                    <FeatureCard
                        icon={<Trophy className="h-10 w-10 text-yellow-600" />}
                        title="Rewards System"
                        description="Earn points, maintain streaks, unlock badges. Stay motivated daily."
                    />
                    <FeatureCard
                        icon={<Brain className="h-10 w-10 text-pink-600" />}
                        title="AI Assistant"
                        description="Upload your notes, ask questions. AI answers from YOUR study materials only."
                    />
                    <FeatureCard
                        icon={<Trophy className="h-10 w-10 text-orange-600" />}
                        title="Leaderboard"
                        description="Compete with classmates. Weekly, monthly, and all-time rankings."
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl max-w-5xl mx-auto my-16">
                <h2 className="text-4xl font-bold mb-4">
                    Ready to Stop Procrastinating?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                    Join thousands of students who transformed their semester
                </p>
                <Link href="/auth/register">
                    <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                        Start Planning Now
                    </Button>
                </Link>
            </section>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="p-6 rounded-xl bg-card shadow-lg hover:shadow-xl transition-shadow border border-border">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}
