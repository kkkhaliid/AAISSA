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
        description: string | null;
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
            <div className="flex-1 flex flex-col gap-8 min-w-0 h-full">
                {/* Modern Search & Filter Area */}
                <div className="flex flex-col md:flex-row gap-4 shrink-0 px-2 lg:px-0">
                    <div className="relative flex-1 group">
                        <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="البحث عن المنتجات بالاسم أو الباركود..."
                            className="pr-14 h-16 text-xl bg-white dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl shadow-premium focus-visible:ring-primary/40 text-right font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Refined Grid - More Compact */}
                <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 overflow-y-auto pr-2 pb-32 lg:pb-6 scrollbar-hide">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => addToCartAttempt(product)}
                            className={cn(
                                "group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-5 shadow-premium border-0 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer active:scale-95 ring-1 ring-slate-100 dark:ring-slate-800/50",
                                product.stock <= 0 && "opacity-60 pointer-events-none grayscale"
                            )}
                        >
                            {/* Stock Badge - Premium Float */}
                            <div className={cn(
                                "absolute top-4 left-4 z-10 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md backdrop-blur-md ring-1 ring-white/20",
                                product.stock < 5 ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-emerald-500 text-white shadow-emerald-500/20"
                            )}>
                                {product.stock} pcs
                            </div>

                            {/* Image Container */}
                            <div className="aspect-square rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors overflow-hidden relative ring-1 ring-slate-100/50 dark:ring-white/5">
                                {product.product_templates?.image_url ? (
                                    <img
                                        src={product.product_templates.image_url}
                                        alt={product.product_templates.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <Package className="w-12 h-12 text-slate-200 group-hover:text-primary/20 transition-colors" />
                                )}
                            </div>

                            {/* Text Content */}
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <h3 className="font-black text-slate-900 dark:text-white line-clamp-1 text-right leading-tight text-base tracking-tight group-hover:text-primary transition-colors duration-300">
                                        {product.product_templates?.name}
                                    </h3>
                                    {product.product_templates?.description && (
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 text-right font-bold uppercase tracking-tight">
                                            {product.product_templates.description}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                    <div className="flex flex-col items-end">
                                        <div className="text-primary font-black text-xl tracking-tighter">
                                            {product.min_sell_price.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">DH</span>
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                                        <ShoppingCart className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center text-slate-300 py-32 space-y-6">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                                <Search className="w-12 h-12" />
                            </div>
                            <div className="text-center">
                                <p className="font-black text-2xl text-slate-900 dark:text-white">لم يتم العثور على أي منتج</p>
                                <p className="text-slate-500 font-medium mt-1">جرب كلمات بحث أخرى أو ابحث بالباركود</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Cart Sidebar - Premium Panel */}
            <div className={cn(
                "fixed inset-0 z-[100] lg:relative lg:inset-auto lg:z-auto transition-all duration-700 ease-in-out",
                isCartOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0",
                "lg:w-[480px] shrink-0 flex flex-col h-full bg-slate-50/95 dark:bg-slate-950/95 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none"
            )}>
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 lg:rounded-[3rem] shadow-2xl lg:shadow-premium border-0 overflow-hidden h-full relative ring-1 ring-black/5 dark:ring-white/5">
                    <div className="px-8 py-8 border-b border-slate-50 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 backdrop-blur-sm shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 ring-4 ring-primary/10">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <h2 className="font-black text-2xl text-slate-900 dark:text-white leading-tight">سلة المبيعات</h2>
                                <p className="text-xs text-primary font-black uppercase tracking-[0.2em] mt-1">{cart.length} منتجات مضافة</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {cart.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearCart}
                                    className="hidden lg:flex items-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-black text-xs h-10 px-4 rounded-xl"
                                >
                                    <span>تفريغ السلة</span>
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden rounded-2xl bg-slate-100 dark:bg-slate-800 w-12 h-12"
                                onClick={() => setIsCartOpen(false)}
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>

                    {/* Cart Body - Custom Scrollbar */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
                        {cart.length > 0 ? (
                            cart.map((item) => (
                                <div key={item.cartId} className="flex gap-4 items-center bg-white dark:bg-slate-800/50 rounded-[1.5rem] p-4 group/item transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-lg ring-1 ring-slate-100 dark:ring-white/5">
                                    {/* Item Image - Compact */}
                                    <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-200 shrink-0 shadow-inner overflow-hidden font-bold">
                                        {item.product_templates?.image_url ? (
                                            <img src={item.product_templates.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-6 h-6" />
                                        )}
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 min-w-0 text-right">
                                        <h4 className="font-black text-sm truncate text-slate-900 dark:text-white tracking-tight">{item.product_templates?.name}</h4>
                                        <div className="flex items-center justify-between gap-1 mt-1">
                                            <div className="flex items-center gap-1.5 font-black text-primary">
                                                <span className="text-lg tracking-tighter">{item.sellPrice.toLocaleString()}</span>
                                                <span className="text-[9px] uppercase opacity-70">DH</span>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center bg-slate-50 dark:bg-slate-900 rounded-lg p-0.5 ring-1 ring-black/5">
                                                <button
                                                    onClick={() => updateQuantity(item.cartId, 1)}
                                                    className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-primary"
                                                >
                                                    <span className="text-lg font-black">+</span>
                                                </button>
                                                <span className="w-6 text-center text-xs font-black text-slate-600 dark:text-slate-300">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.cartId, -1)}
                                                    className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-rose-500"
                                                >
                                                    <span className="text-xl font-black">−</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remove Item - Absolute position for cleaner look */}
                                    <button
                                        onClick={() => removeFromCart(item.cartId)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center px-10 text-center space-y-6 py-20">
                                <div className="w-40 h-40 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-premium relative">
                                    <ShoppingCart className="w-16 h-16 text-slate-200" />
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-full animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <p className="font-black text-2xl text-slate-900 dark:text-white">سلة المبيعات فارغة</p>
                                    <p className="text-slate-500 font-medium leading-relaxed">ابدأ بإضافة المنتجات من قائمة المعروضات لإتمام عملية البيع</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cart Footer - Premium Sticky */}
                    <div className="p-8 md:p-10 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-white/5 space-y-8 pb-12 lg:pb-12 shrink-0 z-30">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col gap-1 items-start">
                                <span className="uppercase tracking-[0.3em] text-[10px] text-primary font-black">المجموع النهائي</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{total.toLocaleString()}</span>
                                    <span className="text-xl font-bold text-slate-400">DH</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full h-20 text-2xl font-black rounded-3xl gradient-primary shadow-2xl shadow-indigo-500/40 hover:scale-[1.02] transition-all active:scale-[0.98] border-0 text-white gap-4 group"
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || loading}
                        >
                            {loading ? "جاري المعالجة..." : (
                                <>
                                    <span>إتمام عملية البيع</span>
                                    <CreditCard className="w-7 h-7 group-hover:translate-x-[-4px] transition-transform" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>


            {/* Price Modal */}
            <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
                <DialogContent className="max-w-[80vw] sm:max-w-[80vw] w-full h-[70vh] max-h-[750px] flex flex-col p-0 gap-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl overflow-hidden rounded-[2.5rem] border-0 ring-1 ring-slate-200/50 dark:ring-white/10 shadow-premium transition-all duration-500 [&>button]:hidden text-right" dir="rtl">
                    {/* Header - Compact */}
                    <DialogHeader className="px-8 py-5 border-b border-slate-100 dark:border-white/5 flex flex-row items-center justify-between bg-gradient-to-l from-slate-50/50 via-white/50 to-slate-50/50 dark:from-slate-900/50 dark:via-slate-900/80 dark:to-slate-900/50 shrink-0 z-20">
                        <div className="flex flex-col gap-0.5 items-start text-right">
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/10">
                                    <Tag className="w-5 h-5" />
                                </div>
                                تحديد سعر البيع
                            </DialogTitle>
                            <p className="text-slate-500 font-bold text-xs mr-12">تأكد من السعر المتفق عليه مع العميل</p>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedProduct(null)}
                            className="rounded-full w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </DialogHeader>

                    {/* Body - Optimized for 0 Scrolling */}
                    <div className="flex-1 overflow-hidden p-8 flex flex-col justify-center bg-slate-50/20 dark:bg-transparent">
                        <div className="grid grid-cols-12 gap-10 items-stretch">

                            {/* LEFT: Price Input & Description (7 Cols) */}
                            <div className="col-span-7 flex flex-col gap-6 justify-center">
                                {/* Price Focus Block */}
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>
                                        <div className="relative h-28 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-inner ring-1 ring-black/5 dark:ring-white/5 flex items-center justify-center px-10 overflow-hidden">
                                            <div className="absolute top-2.5 right-8 text-[9px] font-black text-primary uppercase tracking-[0.3em]">السعر الحالي</div>
                                            <div className="flex items-center justify-center w-full">
                                                <Input
                                                    type="number"
                                                    value={priceInput}
                                                    onChange={(e) => setPriceInput(e.target.value)}
                                                    className="w-full h-20 text-6xl font-black text-center border-0 bg-transparent focus-visible:ring-0 text-primary caret-primary"
                                                    onFocus={(e) => e.target.select()}
                                                />
                                                <span className="text-2xl font-black text-slate-300 mr-2">DH</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Range Visualization */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-5 rounded-2xl ring-1 ring-black/5 dark:ring-white/5 shadow-sm transition-transform hover:scale-[1.02]">
                                            <div className="absolute top-0 right-0 w-1 h-full bg-rose-500/20"></div>
                                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">الحد الأدنى للبيع</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedProduct?.min_sell_price.toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">DH</span>
                                            </div>
                                        </div>
                                        <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-5 rounded-2xl ring-1 ring-black/5 dark:ring-white/5 shadow-sm transition-transform hover:scale-[1.02]">
                                            <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500/20"></div>
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">السعر المقترح</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedProduct?.max_sell_price.toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">DH</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Description - High Visibility */}
                                {selectedProduct?.product_templates?.description && (
                                    <div className="bg-white/40 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 backdrop-blur-sm self-stretch group/desc hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors cursor-default">
                                        <div className="flex items-center gap-2 mb-2 justify-start">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/desc:bg-primary transition-colors"></div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">تفاصيل المنتج</h4>
                                        </div>
                                        <p className="text-base font-bold text-slate-700 dark:text-slate-200 leading-relaxed text-right line-clamp-3">
                                            {selectedProduct.product_templates.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT: Product Identity (5 Cols) - Mega Image */}
                            <div className="col-span-5">
                                <div className="h-full bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 ring-1 ring-black/5 dark:ring-white/5 shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden group">
                                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                                    <div className="aspect-square w-full max-w-[260px] rounded-[2rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-1 shadow-inner ring-1 ring-black/5 overflow-hidden mb-6">
                                        {selectedProduct?.product_templates?.image_url ? (
                                            <img src={selectedProduct.product_templates.image_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <Package className="w-24 h-24 text-slate-300" />
                                        )}
                                    </div>

                                    <div className="space-y-4 w-full">
                                        <h4 className="font-black text-3xl text-slate-900 dark:text-white leading-tight tracking-tight px-4">{selectedProduct?.product_templates?.name}</h4>
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="px-5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 ring-1 ring-black/5 dark:ring-white/5 inline-flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">متوفر: {selectedProduct?.stock}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Final Slim */}
                    <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 backdrop-blur-md flex flex-row items-center justify-end gap-3 shrink-0 z-20">
                        <Button
                            variant="ghost"
                            className="h-12 px-6 rounded-xl font-black text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs"
                            onClick={() => setSelectedProduct(null)}
                        >
                            إلغاء العملية
                        </Button>
                        <Button
                            className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white text-base font-black shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 group/btn"
                            onClick={confirmAddToCart}
                        >
                            <ShoppingCart className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span>إضافة للسلة</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
