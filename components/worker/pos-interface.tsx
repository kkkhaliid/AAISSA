"use client";
import React from 'react';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, X, CreditCard, Tag, Package, AlertCircle, History, Calendar, Clock, ChevronRight, Calculator } from "lucide-react";
import { toast } from "sonner";
import { processSale, getWorkerSales } from "@/app/worker/actions";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Product = {
    id: string;
    stock: number;
    min_sell_price: number;
    max_sell_price: number;
    product_templates: {
        name: string;
        barcode: string | null;
        image_url: string | null;
        description: string | null;
    } | null;
};

type CartItem = Product & {
    cartId: string;
    quantity: number;
    sellPrice: number;
};

export function POSInterface({ products }: { products: Product[] }) {
    const [activeTab, setActiveTab] = useState("pos");

    // POS State
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [priceInput, setPriceInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // History State
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab]);

    async function loadHistory() {
        setLoadingHistory(true);
        const sales = await getWorkerSales();
        setHistory(sales || []);
        setLoadingHistory(false);
    }

    // Filter products
    const filteredProducts = products.filter((p) => {
        const name = p.product_templates?.name || "";
        const barcode = p.product_templates?.barcode || "";
        return name.toLowerCase().includes(search.toLowerCase()) || barcode.includes(search);
    });

    function addToCartAttempt(product: Product) {
        setSelectedProduct(product);
        setPriceInput(product.min_sell_price.toString());
    }

    function confirmAddToCart() {
        if (!selectedProduct) return;
        const price = parseFloat(priceInput);

        if (isNaN(price) || price < selectedProduct.min_sell_price || price > selectedProduct.max_sell_price) {
            toast.error(`Price must be between ${selectedProduct.min_sell_price} and ${selectedProduct.max_sell_price}`);
            return;
        }

        const newItem: CartItem = {
            ...selectedProduct,
            cartId: Math.random().toString(36),
            quantity: 1,
            sellPrice: price,
        };

        setCart([...cart, newItem]);
        setSelectedProduct(null);
        toast.success("Added to cart");
    }

    function removeFromCart(cartId: string) {
        setCart(cart.filter((item) => item.cartId !== cartId));
    }

    function updateQuantity(cartId: string, delta: number) {
        setCart(cart.map(item => {
            if (item.cartId === cartId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    }

    function clearCart() {
        if (cart.length > 0) {
            setCart([]);
            toast.success("تم تفريغ السلة");
        }
    }

    const total = cart.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0);

    async function handleCheckout() {
        if (cart.length === 0) return;
        setLoading(true);

        const items = cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.sellPrice
        }));

        const result = await processSale(items);
        setLoading(false);

        if (result.error) {
            toast.error("Transaction failed: " + result.error);
        } else {
            toast.success("تمت عملية البيع بنجاح!");
            setCart([]);
            setIsCartOpen(false);
            // Switch to history to see the new sale
            setActiveTab('history');
        }
    }

    return (
        <div className="flex flex-col h-full lg:h-[calc(100vh-160px)] relative" dir="rtl">

            {/* Navigation Tabs */}
            <div className="mb-6 flex justify-center sticky top-0 z-40">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-lg flex gap-1">
                    <button
                        onClick={() => setActiveTab('pos')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300 flex items-center gap-2",
                            activeTab === 'pos'
                                ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                    >
                        <Calculator className="w-4 h-4" />
                        نقطة البيع
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300 flex items-center gap-2",
                            activeTab === 'history'
                                ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                    >
                        <History className="w-4 h-4" />
                        سجل مبيعاتي
                    </button>
                </div>
            </div>

            {activeTab === 'pos' ? (
                /* POS VIEW */
                <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 relative pb-safe">
                    {/* Mobile Cart Trigger */}
                    <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm">
                        <Button
                            size="lg"
                            className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-indigo-600 to-primary shadow-2xl shadow-indigo-500/40 flex justify-between px-8 font-black text-xl active:scale-95 border-0 text-white"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <span>سلة التسوق</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-black">{cart.length}</span>
                                <span className="text-2xl tracking-tighter">{total.toFixed(0)} <span className="text-sm">DH</span></span>
                            </div>
                        </Button>
                    </div>

                    {/* Left: Product Grid */}
                    <div className="flex-1 flex flex-col gap-6 min-w-0 h-full overflow-hidden">
                        <div className="relative group shrink-0 mx-2 lg:mx-0">
                            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="بحث عن منتج..."
                                className="pr-12 h-14 bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl shadow-sm focus-visible:ring-primary/40 text-right font-bold"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-32 lg:pb-0 scrollbar-hide flex-1">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCartAttempt(product)}
                                    className={cn(
                                        "group relative bg-white dark:bg-slate-900 rounded-[2rem] p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer active:scale-95 ring-1 ring-slate-100 dark:ring-white/5",
                                        product.stock <= 0 && "opacity-60 pointer-events-none grayscale"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-3 left-3 z-10 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider backdrop-blur-md ring-1 ring-white/20",
                                        product.stock < 5 ? "bg-rose-500/90 text-white" : "bg-emerald-500/90 text-white"
                                    )}>
                                        {product.stock} pcs
                                    </div>

                                    <div className="aspect-square rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 overflow-hidden relative group-hover:bg-primary/5 transition-colors">
                                        {product.product_templates?.image_url ? (
                                            <img
                                                src={product.product_templates.image_url}
                                                alt={product.product_templates.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <Package className="w-10 h-10 text-slate-300" />
                                        )}
                                    </div>

                                    <div className="space-y-2 text-right">
                                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 leading-tight text-sm">
                                            {product.product_templates?.name}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div className="text-primary font-black text-lg tracking-tight">
                                                {product.min_sell_price.toLocaleString()} <span className="text-[10px] text-slate-400">DH</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <ShoppingCart className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Cart Sidebar (Desktop) */}
                    <div className={cn(
                        "fixed inset-0 z-[100] lg:relative lg:inset-auto lg:z-auto transition-all duration-500",
                        isCartOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0",
                        "lg:w-[420px] shrink-0 flex flex-col h-full bg-slate-50/95 dark:bg-slate-950/95 lg:bg-transparent backdrop-blur-3xl lg:backdrop-blur-none"
                    )}>
                        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 lg:rounded-[2.5rem] shadow-2xl lg:shadow-xl border-0 overflow-hidden h-full relative ring-1 ring-black/5 dark:ring-white/5">
                            {/* Cart Header */}
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                        <ShoppingCart className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-black text-lg text-slate-900 dark:text-white">سلة المبيعات</h2>
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{cart.length} منتجات</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {cart.length > 0 && (
                                        <Button variant="ghost" size="sm" onClick={clearCart} className="text-rose-500 hover:bg-rose-50 h-9 px-3 text-xs font-bold rounded-lg hidden lg:flex">
                                            تفريغ
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="lg:hidden rounded-xl" onClick={() => setIsCartOpen(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {cart.length > 0 ? (
                                    cart.map((item) => (
                                        <div key={item.cartId} className="flex gap-3 items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 ring-1 ring-slate-100 dark:ring-white/5">
                                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                                                {item.product_templates?.image_url ? (
                                                    <img src={item.product_templates.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-5 h-5 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 text-right">
                                                <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white">{item.product_templates?.name}</h4>
                                                <div className="flex items-center justify-between gap-2 mt-1">
                                                    <div className="font-black text-primary text-sm flex items-baseline gap-0.5">
                                                        {item.sellPrice.toLocaleString()} <span className="text-[9px] opacity-70">DH</span>
                                                    </div>
                                                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg p-0.5 ring-1 ring-black/5 dark:ring-white/10">
                                                        <button onClick={() => updateQuantity(item.cartId, 1)} className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-primary transition-colors">+</button>
                                                        <span className="w-5 text-center text-[10px] font-bold">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.cartId, -1)} className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-rose-500 transition-colors">−</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.cartId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-50">
                                        <ShoppingCart className="w-16 h-16 text-slate-300" />
                                        <p className="font-medium text-sm">السلة فارغة حالياً</p>
                                    </div>
                                )}
                            </div>

                            {/* Checkout Footer */}
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-white/5 space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">الإجمالي</span>
                                    <div className="font-black text-3xl text-slate-900 dark:text-white tracking-tighter">
                                        {total.toLocaleString()} <span className="text-sm text-slate-400">DH</span>
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || loading}
                                >
                                    {loading ? "جاري المعالجة..." : "إتمام البيع"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            ) : (
                /* HISTORY VIEW */
                <div className="flex-1 overflow-hidden min-h-0 relative animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="h-full overflow-y-auto custom-scrollbar px-2 lg:px-4 pb-12">
                        <div className="max-w-4xl mx-auto space-y-4">
                            {loadingHistory ? (
                                <div className="py-20 text-center text-slate-400">جاري تحميل السجل...</div>
                            ) : history.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                        <History className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p className="font-bold">لا يوجد سجل مبيعات حتى الآن</p>
                                </div>
                            ) : (
                                history.map((sale) => (
                                    <div key={sale.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
                                            <div className="flex gap-3 items-center">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-lg">
                                                    $
                                                </div>
                                                <div>
                                                    <div className="font-black text-lg text-slate-900 dark:text-white">
                                                        {sale.total_price.toLocaleString()} <span className="text-xs text-slate-400">DH</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mt-0.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(sale.created_at).toLocaleDateString('ar-MA')}
                                                        <Clock className="w-3 h-3 mr-2" />
                                                        {new Date(sale.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-500">
                                                {sale.sale_items?.length || 0} منتجات
                                            </div>
                                        </div>

                                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                            {sale.sale_items?.map((item: any, idx: number) => (
                                                <div key={idx} className="flex-none w-16 group relative">
                                                    <div className="aspect-square rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden mb-1 ring-1 ring-black/5">
                                                        {item.products?.product_templates?.image_url ? (
                                                            <img src={item.products.product_templates.image_url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-6 h-6 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-center truncate text-slate-600 dark:text-slate-400">
                                                        x{item.quantity}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Price Modal */}
            <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
                <DialogContent className="max-w-[80vw] sm:max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl" dir="rtl">
                    <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50">
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Tag className="w-5 h-5 text-primary" />
                            تحديد السعر
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        <div className="text-center">
                            <p className="text-sm font-bold text-slate-500 mb-2">السعر المقترح</p>
                            <div className="text-4xl font-black text-primary tracking-tighter">
                                {selectedProduct?.min_sell_price.toLocaleString()} <span className="text-lg text-slate-300">DH</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">سعر البيع الفعلي</Label>
                            <Input
                                type="number"
                                value={priceInput}
                                onChange={(e) => setPriceInput(e.target.value)}
                                className="h-14 text-center text-2xl font-black rounded-2xl border-slate-200 dark:border-slate-800 focus-visible:ring-primary"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setSelectedProduct(null)}>
                                إلغاء
                            </Button>
                            <Button className="flex-[2] h-12 rounded-xl font-bold text-lg" onClick={confirmAddToCart}>
                                تأكيد وإضافة
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
