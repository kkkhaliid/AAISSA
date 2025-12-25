"use client";

import { useState } from "react";
import { ProductDialog } from "@/components/admin/product-dialog";
import { Input } from "@/components/ui/input";
import { Search, Package, Plus, Trash2, Edit2, AlertCircle, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActionIconButton } from "@/components/admin/action-icon-button";
import { deleteProduct } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductPreviewDialog } from "@/components/admin/product-preview-dialog";

type Store = { id: string; name: string };
type Product = {
    id: string;
    template_id: string;
    store_id: string;
    all_store_ids?: string[]; // Track all stores for this template
    stock: number;
    buy_price: number;
    min_sell_price: number;
    max_sell_price: number;
    created_at: string;
    product_templates: {
        name: string;
        barcode: string | null;
        image_url: string | null;
    } | null;
    stores: { name: string } | null;
};

import { downloadJson, readJsonFile } from "@/lib/utils";
import { importProducts } from "@/app/admin/actions";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

export function ProductsManager({ products, stores }: { products: Product[], stores: Store[] }) {
    const [search, setSearch] = useState("");
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);


    // 1. Group by template
    const groupedMap = new Map<string, any>();
    products.forEach(p => {
        const tid = p.template_id;
        if (!groupedMap.has(tid)) {
            groupedMap.set(tid, {
                ...p,
                store_names: [],
                all_store_ids: [],
                total_stock: 0
            });
        }
        const entry = groupedMap.get(tid);
        if (p.stores?.name) entry.store_names.push(p.stores.name);
        entry.all_store_ids.push(p.store_id);
        entry.total_stock += p.stock;
    });

    const groupedProducts = Array.from(groupedMap.values());

    const filteredProducts = groupedProducts.filter(p => {
        const name = p.product_templates?.name || "";
        const barcode = p.product_templates?.barcode || "";
        return name.toLowerCase().includes(search.toLowerCase()) || barcode.includes(search);
    });

    const handleExport = () => {
        // Group by template for a clean backup
        const templatesMap = new Map();
        products.forEach(p => {
            if (!p.product_templates) return;
            const tid = p.template_id;
            if (!templatesMap.has(tid)) {
                templatesMap.set(tid, {
                    name: p.product_templates.name,
                    barcode: p.product_templates.barcode,
                    image_url: p.product_templates.image_url,
                    inventory: []
                });
            }
            templatesMap.get(tid).inventory.push({
                store_id: p.store_id,
                stock: p.stock,
                buy_price: p.buy_price,
                min_sell_price: p.min_sell_price,
                max_sell_price: p.max_sell_price
            });
        });
        downloadJson(Array.from(templatesMap.values()), "aissaphone_products_backup.json");
        toast.success("Backup downloaded successfully");
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const data = await readJsonFile(file);
            const result = await importProducts(data);
            if (result.success) toast.success("Recovery successful");
            else toast.error(result.error);
        } catch (err) {
            toast.error("Invalid backup file");
        }
    };

    const openEdit = (product: any) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    const openAdd = () => {
        setEditingProduct(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 md:pb-0">
            {/* Header Actions */}
            <div className="flex flex-col gap-6 md:gap-10 px-4 md:px-0">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-right">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">إدارة المخزون</h1>
                        <p className="text-slate-500 font-medium mt-2 text-sm md:text-lg">إدارة المخزون والأسعار وتفاصيل المنتجات</p>
                    </div>
                    {/* Desktop Add Product Button - Hidden on mobile */}
                    <Button onClick={openAdd} className="hidden md:flex gap-3 h-14 px-8 rounded-2xl gradient-primary shadow-xl shadow-indigo-200 dark:shadow-none font-black text-lg active:scale-95 transition-all text-white border-0 hover:brightness-110">
                        <Plus className="w-6 h-6" />
                        <span>إضافة منتج جديد</span>
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-center justify-between">
                    <div className="relative w-full lg:w-[450px] group">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder="البحث عن المنتجات بالاسم أو الباركود..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pr-12 h-12 md:h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus-visible:border-indigo-500 rounded-2xl text-right text-base md:text-lg font-medium shadow-sm transition-all"
                        />
                    </div>
                    <div className="w-full lg:w-auto flex items-center justify-center md:justify-end gap-2 md:gap-3">
                        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <Button variant="ghost" size="icon" onClick={handleExport} className="h-10 w-10 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400" title="Backup All">
                                <Download className="w-5 h-5" />
                            </Button>
                            <div className="relative">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".json" onChange={handleImport} />
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400" title="Restore Backup">
                                    <Upload className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ProductDialog
                stores={stores}
                product={editingProduct}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4 md:px-0">
                {filteredProducts.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 md:py-32 text-slate-400">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-sm">
                            <Search className="w-10 h-10 md:w-12 md:h-12 text-slate-300" />
                        </div>
                        <p className="font-black text-xl md:text-2xl text-slate-900 dark:text-white">لا توجد نتائج</p>
                        <p className="text-slate-500 font-medium mt-2 text-center text-sm md:text-base px-10">جرب البحث بكلمات مختلفة أو إضافة منتج جديد</p>
                    </div>
                ) : (
                    filteredProducts.map((product) => {
                        const isLowStock = product.total_stock < 5;
                        const stockPercentage = Math.min((product.total_stock / 50) * 100, 100);

                        return (
                            <div
                                key={product.template_id}
                                className="group relative bg-white dark:bg-slate-900 rounded-[24px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800 overflow-hidden"
                            >
                                {/* Card Body */}
                                <div className="p-5">
                                    <div className="flex gap-5">
                                        {/* Image Container */}
                                        <div className="w-28 h-28 shrink-0 rounded-2xl bg-slate-50 dark:bg-slate-800 p-2 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700/50 group-hover:border-indigo-100 dark:group-hover:border-indigo-900/30 transition-colors">
                                            {product.product_templates?.image_url ? (
                                                <img src={product.product_templates.image_url} alt={product.product_templates.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <Package className="w-10 h-10 text-slate-300" />
                                            )}
                                        </div>

                                        {/* Info & Title */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <div>
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black tracking-wider text-slate-500 uppercase h-6">
                                                        {product.product_templates?.barcode || "NO-ID"}
                                                    </span>
                                                    {/* Price Tag */}
                                                    <div className="flex flex-col items-end leading-none">
                                                        <span className="text-xl font-black text-slate-900 dark:text-white">
                                                            {product.min_sell_price}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400">DH</span>
                                                    </div>
                                                </div>
                                                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg leading-tight line-clamp-2" title={product.product_templates?.name}>
                                                    {product.product_templates?.name}
                                                </h3>
                                            </div>

                                            {/* Stores Icons */}
                                            <div className="flex -space-x-2 flex-row-reverse pt-2">
                                                {product.store_names.length > 0 ? (
                                                    product.store_names.slice(0, 4).map((name: string, i: number) => (
                                                        <div key={i} className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center relative z-0 hover:z-10 transition-all hover:scale-110 shadow-sm" title={name}>
                                                            <div className="w-full h-full rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 bg-gradient-to-br from-indigo-500 to-violet-600">
                                                                {name.charAt(0).toUpperCase()}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">No stores</span>
                                                )}
                                                {product.store_names.length > 4 && (
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                                        +{product.store_names.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stock & Progress */}
                                    <div className="mt-5 space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-1.5">
                                                <div className={cn("w-2 h-2 rounded-full animate-pulse", isLowStock ? "bg-rose-500" : "bg-emerald-500")}></div>
                                                <span className={cn("text-xs font-bold", isLowStock ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>
                                                    {isLowStock ? "مخزون منخفض" : "متوفر"}
                                                </span>
                                            </div>
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                                                {product.total_stock} <span className="text-[10px] font-medium text-slate-400">قطعة</span>
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000 ease-out",
                                                    isLowStock ? "bg-rose-500" : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                                )}
                                                style={{ width: `${stockPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="h-14 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 divide-x divide-x-reverse divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <Button
                                        variant="ghost"
                                        className="h-full rounded-none text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors gap-2 text-sm font-bold"
                                        onClick={() => openEdit(product)}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        تعديل
                                    </Button>
                                    <ActionIconButton
                                        action={deleteProduct}
                                        id={product.id}
                                        className="h-full w-full rounded-none text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        حذف
                                    </ActionIconButton>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            <div className="fixed bottom-24 left-6 md:hidden z-50">
                <Button
                    onClick={openAdd}
                    className="w-16 h-16 rounded-3xl gradient-primary shadow-2xl shadow-primary/40 flex items-center justify-center text-white active:scale-90 transition-all duration-300 group"
                >
                    <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
                </Button>
            </div>
        </div>
    );
}
