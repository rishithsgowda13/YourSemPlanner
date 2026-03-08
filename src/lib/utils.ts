import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function calculatePoints(dueDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return 10; // Early
    if (diffDays === 0) return 5; // On time
    return 2; // Late
}

export function calculateStreak(lastTaskDate: string): number {
    // Simple streak calculation stub
    // In a real app, this would check consecutive days from DB logs
    const last = new Date(lastTaskDate);
    const today = new Date();

    const diffTime = Math.abs(today.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 1;
    return 0;
}
