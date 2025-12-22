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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                    <span className="font-bold text-xl text-primary">AissaPhone - {storeName}</span>
                </div>
                <form action={signOut}>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="w-5 h-5" />
                    </Button>
                </form>
            </header>

            {/* Main Content */}
            <main className="pt-20 p-4 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}
