import { createClient } from "@/utils/supabase/server";
import { ProductsManager } from "@/components/admin/products-manager";

export default async function ProductsPage() {
    const supabase = await createClient();

    // Fetch stores for the dialog
    const { data: stores } = await supabase.from("stores").select("id, name");

    // Fetch products with store name
    // Fetch products with store name
    const { data: products } = await supabase
        .from("products")
        .select("*, stores(name), product_templates(name, barcode, image_url)")
        .order("created_at", { ascending: false });

    // Normalize joined data
    const safeProducts = (products || []).map((p: any) => ({
        ...p,
        product_templates: Array.isArray(p.product_templates) ? p.product_templates[0] : p.product_templates
    }));

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Inventory Management</h1>
                <p className="text-muted-foreground mt-1">Manage stock, prices, and product details</p>
            </div>

            <ProductsManager products={safeProducts as any[]} stores={stores || []} />
        </div>
    );
}
