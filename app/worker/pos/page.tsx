import { createClient } from "@/utils/supabase/server";
import { POSInterface } from "@/components/worker/pos-interface";

export default async function POSPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get worker's store
    const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user?.id)
        .single();

    if (!profile?.store_id) {
        return <div className="p-8 text-center text-red-500">لا يوجد متجر مخصص لك. يرجى مراجعة المسؤول.</div>;
    }

    // Fetch products for this store (Server Side to filter out secrets if needed, 
    // though RLS/Select limits what we see. We map to safe object).
    const { data: products } = await supabase
        .from("products")
        .select("id, stock, min_sell_price, max_sell_price, product_templates(name, barcode, image_url)")
        .eq('store_id', profile.store_id)
        .gt('stock', 0);

    // Map the joined data to match what POSInterface expects
    const safeProducts = (products || []).map((p: any) => ({
        ...p,
        product_templates: Array.isArray(p.product_templates) ? p.product_templates[0] : p.product_templates
    }));

    return <POSInterface products={safeProducts as any[]} />;
}
