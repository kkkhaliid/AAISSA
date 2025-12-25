import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { LogOut, ShoppingCart } from "lucide-react";
import { redirect } from "next/navigation";

export default async function WorkerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch store name
    const { data: profile } = await supabase
        .from('profiles')
        .select('stores(name)')
        .eq('id', user.id)
        .single();

    // @ts-ignore
    const storeName = profile?.stores?.name || profile?.stores?.[0]?.name || "المتجر";

    async function signOut() {
        "use server";
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500" dir="rtl">
            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="h-20 lg:h-24 fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 lg:px-8 transition-all duration-300">
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-sm" />

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/20">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-black text-xl lg:text-2xl text-slate-900 dark:text-white tracking-tight leading-none">
                            AissaPhone
                        </h1>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {storeName}
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <form action={signOut}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-12 h-12 rounded-2xl hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 text-slate-400 transition-all hover:scale-105 active:scale-95"
                        >
                            <LogOut className="w-6 h-6" />
                        </Button>
                    </form>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 lg:pt-32 pb-8 px-4 lg:px-8 relative z-10 h-screen overflow-hidden">
                {children}
            </main>
        </div>
    );
}
