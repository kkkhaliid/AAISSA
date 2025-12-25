import { createClient } from "@/utils/supabase/server";
import { ProductsManager } from "@/components/admin/products-manager";

export default async function ProductsPage() {
    try {
        const supabase = await createClient();

        const [storesResult, productsResult] = await Promise.all([
            supabase.from("stores").select("id, name"),
            supabase.from("products").select("*, stores(name), product_templates(name, barcode, image_url)").order("created_at", { ascending: false })
        ]);

        if (storesResult.error) console.error("Stores query error:", storesResult.error);
        if (productsResult.error) console.error("Products query error:", productsResult.error);

        // Normalize joined data
        const safeProducts = (productsResult.data || []).map((p: any) => ({
            ...p,
            product_templates: Array.isArray(p.product_templates) ? p.product_templates[0] : p.product_templates
        }));

        return (
            <ProductsManager products={safeProducts as any[]} stores={storesResult.data || []} />
        );
    } catch (error) {
        console.error("Products page error:", error);
        return (
            <div className="flex items-center justify-center h-screen" dir="rtl">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ في تحميل المنتجات</h1>
                    <p className="text-gray-600">يرجى مراجعة وحدة التحكم للحصول على التفاصيل</p>
                    <pre className="mt-4 text-left bg-gray-100 p-4 rounded">{String(error)}</pre>
                </div>
            </div>
        );
    }
}
