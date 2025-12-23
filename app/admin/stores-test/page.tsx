import { createClient } from "@/utils/supabase/server";

export default async function StoresTestPage() {
    console.log("=== STORES TEST PAGE LOADING ===");

    try {
        console.log("Creating Supabase client...");
        const supabase = await createClient();
        console.log("Supabase client created successfully");

        console.log("Querying stores table...");
        const { data: stores, error } = await supabase
            .from("stores")
            .select("*");

        console.log("Stores query result:", { data: stores, error });

        if (error) {
            return (
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Stores Query Error</h1>
                    <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Stores Loaded Successfully!</h1>
                <p className="mb-4">Found {stores?.length || 0} stores</p>
                <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(stores, null, 2)}</pre>
            </div>
        );
    } catch (error) {
        console.error("Stores test page error:", error);
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Exception Caught</h1>
                <pre className="bg-gray-100 p-4 rounded">{String(error)}</pre>
            </div>
        );
    }
}
