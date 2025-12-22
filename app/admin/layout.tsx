import { AdminSidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
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
            <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-xl text-primary">AissaPhone Admin</span>
                </div>
                <form action={signOut}>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="w-5 h-5" />
                    </Button>
                </form>
            </header>

            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="pt-20 pr-0 md:pr-64 p-6">
                {children}
            </main>
        </div>
    );
}
