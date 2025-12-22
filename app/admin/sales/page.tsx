import { createClient } from "@/utils/supabase/server";
import { SalesManager } from "@/components/admin/sales-manager";

export default async function SalesPage() {
    const supabase = await createClient();

    const { data: sales } = await supabase
        .from("sales")
        .select(`
            *,
            stores(name),
            profiles(full_name)
        `)
        .order("created_at", { ascending: false });

    return <SalesManager initialSales={sales || []} />;
}
