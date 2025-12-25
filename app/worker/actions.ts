"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type SaleItemInput = {
    product_id: string;
    quantity: number;
    unit_price: number;
};

export async function processSale(items: SaleItemInput[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "User not authenticated" };

    // Get Store ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .single();

    if (!profile?.store_id) return { error: "No store assigned" };

    // Call the secure database function
    const { data, error } = await supabase.rpc('process_sale_transaction', {
        p_worker_id: user.id,
        p_store_id: profile.store_id,
        p_items: items
    });

    if (error) {
        console.error("Sale Error:", error);
        return { error: error.message };
    }

    revalidatePath("/worker/pos");
    return { success: true };
}

export async function getWorkerSales() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: sales, error } = await supabase
        .from("sales")
        .select(`
            *,
            sale_items (
                *,
                products (
                    product_templates (
                        name,
                        image_url
                    )
                )
            )
        `)
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to last 50 sales for performance

    if (error) {
        console.error("Error fetching worker sales:", error);
        return [];
    }

    return sales;
}
