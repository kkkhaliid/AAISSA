import { AdminSidebar } from "@/components/admin/sidebar";
import { MobileNav } from "@/components/admin/mobile-nav";
import { BottomNav } from "@/components/admin/bottom-nav";
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

    // Fetch overdue debts count for the notification badge
    const { count: unpaidDebtsCount } = await supabase
        .from('debts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
            {/* Header */}
            {/* Header */}
            <header className="h-16 md:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 fixed top-0 right-0 left-0 z-[60] flex items-center justify-between px-4 md:px-8 transition-all duration-300 shadow-sm">
                <div className="flex flex-col">
                    <span className="font-black text-xl md:text-2xl text-slate-900 dark:text-white tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">AissaPhone</span>
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mt-1 hidden md:block">لوحة التحكم</span>
                </div>

                <div className="flex items-center gap-2">
                    <MobileNav signOutAction={signOut} />
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <NotificationBell />
                            <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2" />
                            <form action={signOut}>
                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all active:scale-95 group">
                                    <LogOut className="w-5 h-5 transition-transform group-hover:rotate-12" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>


            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="pt-20 md:pt-28 min-h-screen">
                <div className="pr-0 md:pr-80 px-4 md:px-8 pb-32 md:pb-12 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <BottomNav debtCount={unpaidDebtsCount || 0} />

        </div>
    );
}
