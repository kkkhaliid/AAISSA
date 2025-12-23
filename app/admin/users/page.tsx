import { createClient } from "@/utils/supabase/server";
import { UsersManager } from "@/components/admin/users-manager";

export default async function UsersPage() {
    try {
        const supabase = await createClient();

        const [storesResult, profilesResult] = await Promise.all([
            supabase.from("stores").select("id, name"),
            supabase.from("profiles").select("*, stores(name)").order("created_at", { ascending: false })
        ]);

        // Log any errors for debugging
        if (storesResult.error) console.error("Stores query error:", storesResult.error);
        if (profilesResult.error) console.error("Profiles query error:", profilesResult.error);

        return (
            <UsersManager
                initialUsers={profilesResult.data || []}
                stores={storesResult.data || []}
            />
        );
    } catch (error) {
        console.error("Users page error:", error);
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Users</h1>
                    <p className="text-gray-600">Please check the console for details</p>
                    <pre className="mt-4 text-left bg-gray-100 p-4 rounded">{String(error)}</pre>
                </div>
            </div>
        );
    }
}
