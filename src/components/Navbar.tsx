'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import {
    LayoutDashboard,
    Trophy,
    BookOpen,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
    const { user, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-black/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
                        <span className="text-xl font-bold gradient-text">PlanMySemester</span>
                    </Link>

                    {/* Desktop Navigation */}
                    {user && (
                        <div className="hidden md:flex items-center space-x-6">
                            <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
                                Dashboard
                            </NavLink>
                            <NavLink href="/tasks" icon={<BookOpen className="h-4 w-4" />}>
                                Tasks
                            </NavLink>
                            <NavLink href="/leaderboard" icon={<Trophy className="h-4 w-4" />}>
                                Leaderboard
                            </NavLink>
                            <NavLink href="/notes" icon={<BookOpen className="h-4 w-4" />}>
                                Notes (AI)
                            </NavLink>
                            <Button variant="ghost" size="sm" onClick={signOut}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    )}

                    {!user && (
                        <div className="hidden md:flex items-center space-x-4">
                            <Link href="/auth/login">
                                <Button variant="ghost">Sign In</Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button>Get Started</Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    {user && (
                        <button
                            className="md:hidden p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    )}
                </div>

                {/* Mobile Menu */}
                {user && mobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-2 border-t border-border">
                        <MobileNavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
                            Dashboard
                        </MobileNavLink>
                        <MobileNavLink href="/tasks" icon={<BookOpen className="h-4 w-4" />}>
                            Tasks
                        </MobileNavLink>
                        <MobileNavLink href="/leaderboard" icon={<Trophy className="h-4 w-4" />}>
                            Leaderboard
                        </MobileNavLink>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center"
                            onClick={signOut}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Link href={href} className="flex items-center space-x-1 text-muted-foreground hover:text-blue-400 transition-colors">
            {icon}
            <span>{children}</span>
        </Link>
    );
}

function MobileNavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Link href={href} className="flex items-center space-x-2 px-4 py-2 hover:bg-accent rounded-lg">
            {icon}
            <span>{children}</span>
        </Link>
    );
}
