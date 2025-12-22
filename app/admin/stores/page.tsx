import { createClient } from "@/utils/supabase/server";
import { StoresManager } from "@/components/admin/stores-manager";

export default async function StoresPage() {
    const supabase = await createClient();
    const { data: stores } = await supabase
        .from("stores")
        .select("*")
        .order("created_at", { ascending: false });

    return <StoresManager stores={stores || []} />;
}
