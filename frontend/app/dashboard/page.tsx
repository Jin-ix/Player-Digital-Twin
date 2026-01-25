import { redirect } from 'next/navigation';

export default function DashboardHome() {
    // In a real app, check server session logic here.
    // For now, default to player view or redirect to root if unauthorized.
    // We'll just show a "Select Module" screen.

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to Prehab 2.0</h1>
            <p className="text-[#8B949E] mb-8">Select a module from the sidebar to begin.</p>
        </div>
    );
}
