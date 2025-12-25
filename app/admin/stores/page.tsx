import { createClient } from "@/utils/supabase/server";
import { StoresManager } from "@/components/admin/stores-manager";

export default async function StoresPage() {
    try {
        const supabase = await createClient();
        const { data: stores, error } = await supabase
            .from("stores")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Stores query error details:", JSON.stringify(error, null, 2));
        }


        return <StoresManager stores={stores || []} />;
    } catch (error) {
        console.error("Stores page error:", error);
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Stores</h1>
                    <p className="text-gray-600">Please check the console for details</p>
                    <pre className="mt-4 text-left bg-gray-100 p-4 rounded">{String(error)}</pre>
                </div>
            </div>
        );
    }
}
