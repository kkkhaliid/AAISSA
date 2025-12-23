"use client";

import { useState } from "react";
import { ProductDialog } from "@/components/admin/product-dialog";
import { Input } from "@/components/ui/input";
import { Search, Package, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActionIconButton } from "@/components/admin/action-icon-button";
import { deleteProduct } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Actions */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="relative w-full lg:w-[450px] group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="البحث عن المنتجات بالاسم أو الباركود..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-12 h-14 bg-white/50 dark:bg-slate-800/50 border-0 shadow-premium glass dark:glass-dark ring-1 ring-slate-200/50 dark:ring-white/5 focus-visible:ring-primary/30 rounded-2xl text-right text-lg font-medium"
                    />
                </div>
                <div className="w-full lg:w-auto flex items-center gap-3">
                    <div className="flex bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-2xl shadow-premium border border-slate-100 dark:border-white/5 glass dark:glass-dark">
                        <Button variant="ghost" size="icon" onClick={handleExport} className="h-11 w-11 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" title="Backup All">
                            <Download className="w-5 h-5" />
                        </Button>
                        <div className="relative">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".json" onChange={handleImport} />
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" title="Restore Backup">
                                <Upload className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                    <Button onClick={openAdd} className="gap-3 h-14 px-8 rounded-2xl gradient-primary shadow-xl shadow-indigo-200 dark:shadow-none font-black text-lg w-full lg:w-auto active:scale-95 transition-all text-white">
                        <Plus className="w-6 h-6" />
                        <span>إضافة منتج جديد</span>
                    </Button>
                </div>
            </div>

            <ProductDialog
                stores={stores}
                product={editingProduct}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />

            {/* Content Table */}
            {/* Products List - Floating Card Rows */}
            <div className="space-y-4">
                {/* Custom Card Header - Only visible on desktop */}
                <div className="grid grid-cols-6 px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hidden md:grid">
                    <div className="col-span-2 pr-4">المنتج والتفاصيل</div>
                    <div>المتاجر المتواجد بها</div>
                    <div className="text-center">المخزون الكلي</div>
                    <div className="text-right">سعر البيع</div>
                    <div className="text-left">الإجراءات</div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-sm">
                            <Search className="w-12 h-12 text-slate-300" />
                        </div>
                        <p className="font-black text-2xl text-slate-900 dark:text-white">لا توجد نتائج</p>
                        <p className="text-slate-500 font-medium mt-2">جرب البحث بكلمات مختلفة أو إضافة منتج جديد</p>
                    </div>
                ) : (
                    filteredProducts.map((product) => {
                        const isLowStock = product.total_stock < 5;

                        return (
                            <div
                                key={product.template_id}
                                className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center bg-white dark:bg-slate-900 p-6 md:p-4 md:px-10 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5 group active:scale-[0.99]"
                            >
                                {/* Product Info */}
                                <div className="col-span-2 flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 overflow-hidden shrink-0 shadow-inner ring-1 ring-black/5 dark:ring-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2">
                                        {product.product_templates?.image_url ? (
                                            <img src={product.product_templates.image_url} alt={product.product_templates.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-10 h-10" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-black text-slate-900 dark:text-white text-xl tracking-tight truncate">{product.product_templates?.name}</div>
                                        {product.product_templates?.barcode && (
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                                    ID: {product.product_templates.barcode}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stores List */}
                                <div className="flex flex-wrap gap-2">
                                    {product.store_names.map((name: string, i: number) => (
                                        <div key={i} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            {name}
                                        </div>
                                    ))}
                                </div>

                                {/* Stock Info */}
                                <div className="flex justify-center">
                                    <div className={cn(
                                        "inline-flex flex-col items-center px-6 py-3 rounded-2xl shadow-sm transition-all duration-300 group-hover:scale-105",
                                        isLowStock
                                            ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20 shadow-rose-200/20"
                                            : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20 shadow-emerald-200/20"
                                    )}>
                                        <div className="text-2xl font-black tabular-nums">{product.total_stock}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">قطعة متوفرة</div>
                                    </div>
                                </div>

                                {/* Price Info */}
                                <div className="text-right">
                                    <div className="flex flex-col items-end">
                                        <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                                            {product.min_sell_price} <span className="text-xs font-bold mr-1">DH</span>
                                        </div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">تبدأ من</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-primary"
                                        onClick={() => openEdit(product)}
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </Button>
                                    <ActionIconButton
                                        action={deleteProduct}
                                        id={product.id}
                                        className="w-12 h-12 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-slate-400 hover:text-rose-600"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </ActionIconButton>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
