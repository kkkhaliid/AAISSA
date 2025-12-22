"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, X, CreditCard, Tag, Package, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { processSale } from "@/app/worker/actions";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Product = {
    id: string;
    stock: number;
    min_sell_price: number;
    max_sell_price: number;
    product_templates: {
        name: string;
        barcode: string | null;
        image_url: string | null;
    } | null;
};

type CartItem = Product & {
    cartId: string;
    quantity: number;
    sellPrice: number;
};

export function POSInterface({ products }: { products: Product[] }) {
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [priceInput, setPriceInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

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
            toast.success("Sale completed successfully!");
            setCart([]);
            setIsCartOpen(false);
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full lg:h-[calc(100vh-160px)] overflow-hidden relative pb-4 px-1" dir="rtl">
            {/* Mobile Cart Trigger - Modern Floating Pill */}
            <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm">
                <Button
                    size="lg"
                    className="w-full h-16 rounded-[2rem] gradient-primary shadow-2xl shadow-indigo-500/40 flex justify-between px-8 font-black text-xl active:scale-95 border-0 text-white"
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

            {/* LEFT: Product Grid */}
            <div className="flex-1 flex flex-col gap-6 min-w-0 h-full">
                {/* Modern Search Bar */}
                <div className="relative shrink-0 group">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="البحث عن المنتجات..."
                        className="pr-14 h-16 text-xl bg-white/70 dark:bg-slate-800/70 glass dark:glass-dark border-0 ring-1 ring-slate-200/50 dark:ring-white/5 rounded-3xl shadow-premium focus-visible:ring-primary/30 text-right"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Refined Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 overflow-y-auto pr-2 pb-32 lg:pb-6 scrollbar-hide">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => addToCartAttempt(product)}
                            className={cn(
                                "group relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-4 md:p-5 shadow-premium border-0 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer active:scale-95",
                                product.stock <= 0 && "opacity-60 pointer-events-none grayscale"
                            )}
                        >
                            <div className="aspect-square rounded-[2rem] bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center mb-4 md:mb-5 group-hover:bg-primary/5 transition-colors overflow-hidden border border-slate-100/50 dark:border-white/5 relative">
                                {product.product_templates?.image_url ? (
                                    <img src={product.product_templates.image_url} alt={product.product_templates.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <Package className="w-12 h-12 text-slate-200 group-hover:text-primary/20 transition-colors" />
                                )}

                                <div className={cn(
                                    "absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                                    product.stock < 5 ? "bg-rose-500 text-white" : "bg-white/90 text-slate-900 backdrop-blur-md"
                                )}>
                                    {product.stock} pcs
                                </div>
                            </div>

                            <h3 className="font-black text-slate-900 dark:text-white line-clamp-2 text-right leading-tight min-h-[2.5em] text-base md:text-lg tracking-tight group-hover:text-primary transition-colors">
                                {product.product_templates?.name}
                            </h3>

                            <div className="mt-4 md:mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl">
                                    AissaPhone
                                </div>
                                <div className="text-primary font-black text-xl md:text-2xl tracking-tighter">
                                    {product.min_sell_price} <span className="text-xs font-bold text-slate-400">DH</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center text-slate-300 py-32">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6">
                                <Search className="w-12 h-12" />
                            </div>
                            <p className="font-black text-2xl text-slate-900 dark:text-white">لم يتم العثور على المنتج</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT / OVERLAY: Cart Sidebar */}
            <div className={cn(
                "fixed inset-0 z-[100] lg:relative lg:inset-auto lg:z-auto transition-all duration-700 ease-in-out",
                isCartOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0",
                "lg:w-[450px] shrink-0 flex flex-col h-full bg-slate-50/95 dark:bg-slate-950/95 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none lg:p-0 overflow-hidden lg:overflow-visible"
            )}>
                <div className="flex-1 flex flex-col bg-white/90 dark:bg-slate-900/90 glass dark:glass-dark lg:rounded-[3rem] shadow-2xl lg:shadow-premium border-0 overflow-hidden m-0 lg:m-0 h-full relative">
                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="font-black text-xl text-slate-900 dark:text-white">البيع الخاص بك</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{cart.length} منتجات</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="lg:hidden rounded-2xl bg-slate-100 dark:bg-slate-800 w-12 h-12" onClick={() => setIsCartOpen(false)}>
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
                        {cart.map((item) => (
                            <div key={item.cartId} className="flex gap-4 items-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-5 group/item transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md border border-slate-100 dark:border-white/5">
                                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-200 shrink-0 shadow-sm overflow-hidden font-bold">
                                    {item.product_templates?.image_url ? (
                                        <img src={item.product_templates.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-8 h-8" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-lg truncate text-slate-900 dark:text-white text-right tracking-tight">{item.product_templates?.name}</h4>
                                    <p className="text-primary font-black text-xl text-right mt-1">{item.sellPrice.toFixed(2)} <span className="text-xs">DH</span></p>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.cartId)}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors text-slate-300 hover:text-rose-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        ))}

                        {cart.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50 py-32 text-center">
                                <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center mb-6">
                                    <ShoppingCart className="w-16 h-16 stroke-[1.5]" />
                                </div>
                                <p className="font-black text-2xl text-slate-900 dark:text-white">السلة فارغة</p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 md:p-10 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-white/5 space-y-8 pb-12 lg:pb-10">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="uppercase tracking-[0.2em] text-[10px] text-primary font-black">إجمالي الدفع</span>
                                    <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{total.toFixed(2)} <span className="text-lg">DH</span></span>
                                </div>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full h-20 text-2xl font-black rounded-3xl gradient-primary shadow-2xl shadow-indigo-500/30 hover:scale-[1.02] transition-all active:scale-[0.98] border-0 text-white"
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || loading}
                        >
                            {loading ? "جاري المعالجة..." : "إتمام البيع"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Price Modal */}
            <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
                <DialogContent className="max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-0 shadow-2xl rounded-[3.5rem] p-0 overflow-hidden">
                    <div className="p-10 space-y-10">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white text-right">تحديد السعر</DialogTitle>
                            <p className="text-right text-slate-500 font-medium">أدخل سعر البيع المتفق عليه</p>
                        </DialogHeader>

                        <div className="space-y-8">
                            <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-200 shrink-0 shadow-sm overflow-hidden">
                                    {selectedProduct?.product_templates?.image_url ? (
                                        <img src={selectedProduct.product_templates.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-10 h-10" />
                                    )}
                                </div>
                                <div className="min-w-0 text-right flex-1">
                                    <h4 className="font-black text-2xl text-slate-900 dark:text-white truncate leading-tight">{selectedProduct?.product_templates?.name}</h4>
                                    <p className="text-sm font-bold text-primary mt-1">الكمية المتوفرة: {selectedProduct?.stock}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-right block font-black text-slate-400 uppercase tracking-widest text-xs">سعر البيع</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={priceInput}
                                        onChange={(e) => setPriceInput(e.target.value)}
                                        className="h-24 text-5xl font-black text-center border-0 bg-slate-100/50 dark:bg-slate-800 rounded-[2rem] shadow-inner focus-visible:ring-primary/20"
                                        onFocus={(e) => e.target.select()}
                                    />
                                    <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-3xl text-slate-300">DH</span>
                                </div>
                                <div className="flex justify-between px-2 text-xs font-black uppercase text-slate-400">
                                    <span>الحد الأقصى: {selectedProduct?.max_sell_price}</span>
                                    <span>أقل سعر: {selectedProduct?.min_sell_price}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button
                                size="lg"
                                className="w-full h-20 rounded-3xl gradient-primary text-2xl font-black shadow-xl border-0 text-white"
                                onClick={confirmAddToCart}
                            >
                                تأكيد وإضافة
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-14 rounded-2xl font-black text-slate-400"
                                onClick={() => setSelectedProduct(null)}
                            >
                                إلغاء
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
