"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Share2, Heart, ShieldCheck, Truck, Package, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: any;
}

export function ProductPreviewDialog({ open, onOpenChange, product }: ProductPreviewDialogProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    if (!product) return null;

    const stockPercentage = Math.min((product.total_stock / 50) * 100, 100);
    const isLowStock = product.total_stock < 5;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white dark:bg-slate-950 rounded-[2.5rem] border-0 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 h-[80vh] md:h-auto overflow-y-auto md:overflow-visible">

                    {/* Left: Image Gallery (Mock) */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-10 flex flex-col items-center justify-center relative group">
                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                            <Badge className="bg-rose-500 text-white border-0 px-3 py-1 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-500/20">
                                تخفيض
                            </Badge>
                            <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-black uppercase tracking-widest">
                                جديد
                            </Badge>
                        </div>

                        <div className="relative w-full aspect-square max-w-sm mx-auto mb-8 transition-transform duration-500 hover:scale-105">
                            {product.product_templates?.image_url ? (
                                <img
                                    src={product.product_templates.image_url}
                                    alt={product.product_templates.name}
                                    className="w-full h-full object-contain drop-shadow-2xl"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white dark:bg-slate-800 rounded-3xl shadow-inner">
                                    <Package className="w-24 h-24 text-slate-200" />
                                </div>
                            )}

                            {/* Reflection Effect */}
                            <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-b from-black/5 to-transparent blur-xl opacity-50 transform scale-y-[-0.5]" />
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-2 w-full justify-center">
                            {[1, 2, 3].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={cn(
                                        "w-16 h-16 rounded-2xl border-2 flex items-center justify-center bg-white dark:bg-slate-800 transition-all",
                                        selectedImage === i
                                            ? "border-primary ring-2 ring-primary/20 scale-110 shadow-lg"
                                            : "border-transparent opacity-50 hover:opacity-100"
                                    )}
                                >
                                    {product.product_templates?.image_url ? (
                                        <img src={product.product_templates.image_url} className="w-10 h-10 object-contain" />
                                    ) : (
                                        <Package className="w-6 h-6 text-slate-300" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Details */}
                    <div className="p-6 md:p-10 flex flex-col h-full bg-white dark:bg-slate-950 relative" dir="rtl">
                        {/* Header Actions */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost" className="rounded-full hover:bg-rose-50 hover:text-rose-500">
                                    <Heart className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">المتجر</p>
                                <div className="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
                                    <Store className="w-3.5 h-3.5" />
                                    {product.stores?.name || "Global Store"}
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                            {product.product_templates?.name}
                        </h2>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <Badge variant="secondary" className="rounded-lg px-2 text-[10px] font-bold">
                                {product.product_templates?.barcode || "No Barcode"}
                            </Badge>
                            <Badge variant="secondary" className="rounded-lg px-2 text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                إلكترونيات
                            </Badge>
                        </div>

                        {/* Price Block */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-6 mb-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10 flex items-end gap-3">
                                <div className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {product.min_sell_price}
                                </div>
                                <div className="pb-1.5 md:pb-2.5">
                                    <span className="text-sm md:text-lg font-bold text-slate-400">DH</span>
                                </div>
                                {product.max_sell_price > product.min_sell_price && (
                                    <div className="mr-auto pb-2 decoration-rose-500/50 line-through text-slate-300 text-lg font-bold">
                                        {product.max_sell_price} DH
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-400 text-xs font-semibold mt-2">شامل الضريبة • توصيل مجاني للطلبات فوق 500 DH</p>
                        </div>

                        {/* Stock Status */}
                        <div className="space-y-3 mb-8">
                            <div className="flex justify-between text-sm font-bold">
                                <span className={cn(isLowStock ? "text-rose-500" : "text-emerald-500")}>
                                    {isLowStock ? "🔥 مخزون منخفض جداً" : "متوفر في المخزون"}
                                </span>
                                <span className="text-slate-400">{product.total_stock} قطعة</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full", isLowStock ? "bg-rose-500" : "bg-emerald-500")}
                                    style={{ width: `${stockPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Features List (Mock) */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="text-xs font-bold">
                                    <p className="text-slate-900 dark:text-white">ضمان سنة</p>
                                    <p className="text-slate-400">شامل العيوب</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div className="text-xs font-bold">
                                    <p className="text-slate-900 dark:text-white">توصيل سريع</p>
                                    <p className="text-slate-400">خلال 24 ساعة</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50">
                            <Button className="w-full h-14 rounded-2xl text-lg font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 mb-3">
                                <ShoppingCart className="mr-3 w-5 h-5" />
                                إضافة للسلة (محاكاة)
                            </Button>
                            <p className="text-center text-[10px] text-slate-400 font-medium">
                                هذه معاينة لكيفية ظهور المنتج للعملاء في واجهة المتجر
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
