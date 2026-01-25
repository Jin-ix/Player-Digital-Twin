import { SidebarNew } from "@/components/SidebarNew";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0E1117] text-white selection:bg-[#00CC96] selection:text-black flex">
            <SidebarNew />
            <main className="flex-1 min-w-0">
                <div className="p-8 max-w-7xl mx-auto animate-fade-in pb-20">
                    {children}
                </div>
            </main>
        </div>
    );
}
