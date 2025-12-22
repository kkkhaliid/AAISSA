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
            <div className="glass dark:glass-dark rounded-[2.5rem] shadow-premium border-0 overflow-hidden relative group/table">
                <div className="overflow-x-auto scrollbar-hide">
                    <Table className="min-w-[900px]">
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                            <TableRow className="hover:bg-transparent border-slate-100 dark:border-white/5 h-16">
                                <TableHead className="text-right px-8 font-black text-slate-500 uppercase tracking-widest text-[10px]">المنتج التفاصيل</TableHead>
                                <TableHead className="text-right font-black text-slate-500 uppercase tracking-widest text-[10px]">المتاجر المتواجد بها</TableHead>
                                <TableHead className="text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">المخزون الكلي</TableHead>
                                <TableHead className="text-right font-black text-slate-500 uppercase tracking-widest text-[10px]">سعر التكلفة</TableHead>
                                <TableHead className="text-right font-black text-slate-500 uppercase tracking-widest text-[10px]">سعر البيع</TableHead>
                                <TableHead className="w-[120px] px-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map((product) => {
                                const isLowStock = product.total_stock < 5;

                                return (
                                    <TableRow key={product.template_id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-slate-50 dark:border-white/5 transition-all h-20">
                                        <TableCell className="px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-300 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                                    {product.product_templates?.image_url ? (
                                                        <img src={product.product_templates.image_url} alt={product.product_templates.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-6 h-6" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 text-right">
                                                    <div className="font-black text-slate-900 dark:text-white truncate text-lg">{product.product_templates?.name}</div>
                                                    {product.product_templates?.barcode && (
                                                        <div className="text-[10px] text-slate-400 font-black tracking-widest mt-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block">
                                                            ID: {product.product_templates.barcode}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2 justify-end">
                                                {product.store_names.map((name: string, i: number) => (
                                                    <span key={i} className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-xl text-xs font-black border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                                                        {name}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className={cn(
                                                "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black shadow-sm",
                                                isLowStock ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                            )}>
                                                {isLowStock && <AlertCircle className="w-3.5 h-3.5 ml-1.5 animate-pulse" />}
                                                {product.total_stock} <span className="mr-1 opacity-70">قطعة</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-mono text-sm font-bold text-slate-500 dark:text-slate-400">
                                                {product.buy_price.toFixed(2)} <span className="text-[10px]">DH</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-indigo-600 dark:text-indigo-400 text-lg">
                                                    {product.min_sell_price} <span className="text-xs">DH</span>
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold -mt-1">أقل سعر</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8">
                                            <div className="flex items-center justify-end gap-2 px-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                                    onClick={() => openEdit(product)}
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </Button>
                                                <ActionIconButton
                                                    action={deleteProduct}
                                                    id={product.id}
                                                    className="w-10 h-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </ActionIconButton>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {filteredProducts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-96 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
                                                <Search className="w-12 h-12 text-slate-300" />
                                            </div>
                                            <p className="font-black text-2xl text-slate-900 dark:text-white">لا توجد نتائج</p>
                                            <p className="text-slate-500 font-medium mt-2">جرب البحث بكلمات مختلفة أو إضافة منتج جديد</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
