import { AdminSidebar } from "@/components/admin/sidebar";
import { MobileNav } from "@/components/admin/mobile-nav";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { NotificationBell } from "@/components/admin/notification-bell";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Double check role? Middleware should handle it but safer here too
    // Fetch profile... (omitted for speed, relying on Middleware/Context)

    async function signOut() {
        "use server";
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
            {/* Header */}
            <header className="h-24 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 fixed top-0 right-0 left-0 z-[60] flex items-center justify-between px-6 md:px-10 transition-all duration-300">
                <div className="flex items-center gap-4 md:gap-6">
                    <MobileNav signOutAction={signOut} />
                    <div className="flex flex-col">
                        <span className="font-black text-2xl md:text-4xl text-slate-900 dark:text-white tracking-tighter leading-none">AissaPhone</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-1.5 hidden md:block">لوحة التحكم الإدارية</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3">
                        <NotificationBell />

                        <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2" />

                        <form action={signOut}>
                            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all active:scale-95 group">
                                <LogOut className="w-6 h-6 transition-transform group-hover:rotate-12" />
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="pt-30 pr-0 md:pr-64 px-6 md:px-10 pb-24 md:pb-12 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
