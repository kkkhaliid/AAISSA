"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Trash2, Plus, Minus, Tag, CreditCard, X } from "lucide-react";
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
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[85vh] overflow-hidden">
            {/* LEFT: Product Grid */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                {/* Search Bar */}
                <div className="relative shrink-0">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                        placeholder="Search products..."
                        className="pr-12 h-14 text-lg bg-white shadow-sm border-0 ring-1 ring-gray-100"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-1 pb-20">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => addToCartAttempt(product)}
                            className={cn(
                                "group relative bg-white rounded-2xl p-4 shadow-sm border border-transparent hover:border-primary/10 hover:shadow-md transition-all cursor-pointer active:scale-95",
                                product.stock <= 0 && "opacity-60 pointer-events-none grayscale"
                            )}
                        >
                            {/* Product Image Area */}
                            <div className="aspect-square rounded-xl bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-colors overflow-hidden">
                                {product.product_templates?.image_url ? (
                                    <img src={product.product_templates.image_url} alt={product.product_templates.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                ) : (
                                    <Tag className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors" />
                                )}
                            </div>

                            <h3 className="font-bold text-gray-900 line-clamp-2 text-right leading-tight min-h-[2.5em]">
                                {product.product_templates?.name}
                            </h3>

                            <div className="mt-3 flex items-end justify-between">
                                <div className="text-xs text-muted-foreground font-medium bg-gray-100 px-2 py-1 rounded-md">
                                    Stock: {product.stock}
                                </div>
                                <div className="text-primary font-bold text-lg">
                                    {product.min_sell_price} <span className="text-xs font-normal text-muted-foreground">DH</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-20 opacity-50">
                            <Search className="w-12 h-12 mb-2" />
                            <p>No products found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Cart Sidebar */}
            <div className="w-full lg:w-[400px] shrink-0 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cart Header */}
                <div className="p-5 border-b bg-gray-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-lg">Current Sale</h2>
                    </div>
                    <div className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                        {cart.length} Items
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map((item) => (
                        <div key={item.cartId} className="flex gap-3 items-center bg-gray-50 rounded-xl p-3 group">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-400 shrink-0">
                                <Tag className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate text-gray-900">{item.product_templates?.name}</h4>
                                <p className="text-primary font-bold text-sm">{item.sellPrice.toFixed(2)} DH</p>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => removeFromCart(item.cartId)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40 p-10 text-center">
                            <ShoppingCart className="w-16 h-16 mb-4 stroke-1" />
                            <p>Cart is empty</p>
                            <p className="text-sm">Tap on products to start selling</p>
                        </div>
                    )}
                </div>

                {/* Cart Footer / Checkout */}
                <div className="p-5 bg-gray-50 border-t space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span>
                            <span>{total.toFixed(2)} DH</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold text-gray-900">
                            <span>Total</span>
                            <span>{total.toFixed(2)} DH</span>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full h-14 text-xl font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || loading}
                    >
                        {loading ? "Processing..." : (
                            <>
                                <CreditCard className="mr-2 w-6 h-6" />
                                Charge {total.toFixed(2)} DH
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Price Selection Dialog */}
            <Dialog open={!!selectedProduct} onOpenChange={(val) => !val && setSelectedProduct(null)}>
                <DialogContent className="max-w-sm rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">Set Price</DialogTitle>
                    </DialogHeader>

                    <div className="py-6 space-y-6">
                        <div className="flex flex-col items-center gap-4 text-center">
                            {selectedProduct?.product_templates?.image_url ? (
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-sm bg-white">
                                    <img src={selectedProduct.product_templates.image_url} alt={selectedProduct.product_templates.name} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                                    <Tag className="w-10 h-10" />
                                </div>
                            )}
                            <div>
                                <p className="text-muted-foreground text-xs mb-0.5">Product</p>
                                <h3 className="font-bold text-lg leading-tight">{selectedProduct?.product_templates?.name}</h3>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl text-center space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Allowed Range</p>
                            <p className="font-mono text-lg font-bold text-gray-700">
                                {selectedProduct?.min_sell_price} - {selectedProduct?.max_sell_price}
                            </p>
                        </div>

                        <div>
                            <Label className="mb-2 block text-center">Final Sale Price (DH)</Label>
                            <Input
                                type="number"
                                value={priceInput}
                                onChange={(e) => setPriceInput(e.target.value)}
                                className="text-center text-3xl font-bold h-16 rounded-xl border-2 focus-visible:ring-0 focus-visible:border-primary"
                                autoFocus
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={confirmAddToCart}
                            className="w-full h-12 text-lg font-bold rounded-xl"
                        >
                            Confirm Price
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
