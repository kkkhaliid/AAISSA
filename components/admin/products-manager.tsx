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
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96 text-right">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="البحث عن المنتجات..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10 h-11 bg-white border-0 shadow-sm ring-1 ring-gray-100 focus-visible:ring-primary/20 rounded-xl text-right"
                    />
                </div>
                <div className="w-full sm:w-auto flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handleExport} className="h-11 w-11 rounded-xl shadow-sm border-gray-200" title="Backup All">
                        <Download className="w-5 h-5" />
                    </Button>
                    <div className="relative">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".json" onChange={handleImport} />
                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shadow-sm border-gray-200" title="Restore Backup">
                            <Upload className="w-5 h-5" />
                        </Button>
                    </div>
                    <Button onClick={openAdd} className="gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20 font-bold w-full sm:w-auto">
                        <Plus className="w-4 h-4" />
                        <span>إضافة منتج</span>
                    </Button>
                </div>
            </div>

            <ProductDialog
                stores={stores}
                product={editingProduct}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-100">
                            <TableHead className="text-right h-12 font-bold text-gray-600">المنتج</TableHead>
                            <TableHead className="text-right font-bold text-gray-600">المتاجر</TableHead>
                            <TableHead className="text-center font-bold text-gray-600">المخزون الكلي</TableHead>
                            <TableHead className="text-right font-bold text-gray-600">التكلفة</TableHead>
                            <TableHead className="text-right font-bold text-gray-600">نطاق السعر</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product) => {
                            const isLowStock = product.total_stock < 5;

                            return (
                                <TableRow key={product.template_id} className="group hover:bg-gray-50/50 border-gray-100 transition-colors">
                                    <TableCell className="font-medium py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200/50 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                                                {product.product_templates?.image_url ? (
                                                    <img src={product.product_templates.image_url} alt={product.product_templates.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div className="min-w-0 text-right">
                                                <div className="font-bold text-gray-900 truncate">{product.product_templates?.name}</div>
                                                {product.product_templates?.barcode && (
                                                    <div className="text-[10px] text-muted-foreground font-mono bg-gray-100 px-1 rounded inline-block">
                                                        {product.product_templates.barcode}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-wrap gap-1 justify-end">
                                            {product.store_names.map((name: string, i: number) => (
                                                <span key={i} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold border border-primary/20 uppercase whitespace-nowrap">
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                            isLowStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                        )}>
                                            {isLowStock && <AlertCircle className="w-3 h-3 mr-1" />}
                                            {product.total_stock} قطعة
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                        {product.buy_price.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="font-bold text-gray-900 text-sm">
                                            {product.min_sell_price} - {product.max_sell_price} <span className="text-[10px] text-muted-foreground">DH</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg"
                                                onClick={() => openEdit(product)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <ActionIconButton
                                                action={deleteProduct}
                                                id={product.id}
                                                className="w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </ActionIconButton>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Search className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="font-bold text-gray-900">لم يتم العثور على منتجات</p>
                                        <p className="text-sm">حاول تغيير فلاتر البحث</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
