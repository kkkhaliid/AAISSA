"use client";

import { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Upload, Store, Package, Barcode, DollarSign, Image as ImageIcon, Save, AlertCircle } from "lucide-react";
import { createProduct, updateProduct } from "@/app/admin/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Store = { id: string; name: string };
type Product = {
    id: string;
    template_id: string;
    store_id: string;
    all_store_ids?: string[];
    stock: number;
    buy_price: number;
    min_sell_price: number;
    max_sell_price: number;
    product_templates: {
        name: string;
        description: string | null;
        barcode: string | null;
        image_url: string | null;
    } | null;
};

interface ProductDialogProps {
    stores: Store[];
    product?: Product | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ProductDialog({ stores, product, open: externalOpen, onOpenChange: setExternalOpen }: ProductDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = setExternalOpen || setInternalOpen;

    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(product?.product_templates?.image_url || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEdit = !!product;

    function handleClose() {
        setOpen(false);
        if (!isEdit) setPreview(null);
    }

    async function optimizeImage(file: File): Promise<File> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;
                    const maxWidth = 1200;

                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                                    type: "image/webp",
                                    lastModified: Date.now(),
                                }));
                            } else {
                                reject(new Error("Canvas toBlob failed"));
                            }
                        },
                        "image/webp",
                        0.7
                    );
                };
            };
            reader.onerror = (error) => reject(error);
        });
    }

    async function handleFile(file: File) {
        if (!file) return;
        try {
            const optimizedFile = await optimizeImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(optimizedFile);

            // Manually set the file to the input if coming from drop
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file); // Note: We might want to use the optimized file here but for form submission we handle it in onSubmit
                fileInputRef.current.files = dataTransfer.files;
            }

        } catch (error) {
            console.error("Image optimization failed:", error);
            toast.error("فشل تحسين الصورة، سيتم استخدام النسخة الأصلية");
        }
    }

    async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }

    function onDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function onDragLeave(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
    }

    function onDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    }

    useEffect(() => {
        if (product) {
            setPreview(product.product_templates?.image_url || null);
        } else {
            setPreview(null);
        }
    }, [product, open]);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        const formData = new FormData(e.currentTarget);
        const fileInput = fileInputRef.current;
        if (fileInput?.files?.[0]) {
            try {
                const optimized = await optimizeImage(fileInput.files[0]);
                formData.set("image", optimized);
            } catch (err) {
                console.error("Optimization failed on submit:", err);
            }
        }

        setLoading(true);
        try {
            const result = isEdit
                ? await updateProduct(product.id, formData)
                : await createProduct(formData);

            if (result && 'error' in result) {
                toast.error(result.error as string);
            } else {
                toast.success(isEdit ? "تم تحديث المنتج" : "تم إضافة المنتج بنجاح");
                handleClose();
            }
        } catch (err: any) {
            toast.error("حدث خطأ ما");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isEdit && (
                <DialogTrigger asChild>
                    <Button className="hidden md:inline-flex gap-2 h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-sm active:scale-95 transition-all">
                        <Plus className="w-4 h-4" />
                        <span>إضافة منتج</span>
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-[80vw] sm:max-w-[80vw] w-full h-[70vh] max-h-[800px] flex flex-col p-0 gap-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden rounded-2xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50 shadow-2xl transition-all duration-300 [&>button]:hidden" dir="rtl">

                {/* Header */}
                <DialogHeader className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-gradient-to-l from-slate-50/50 via-white/50 to-slate-50/50 dark:from-slate-900/50 dark:via-slate-900/80 dark:to-slate-900/50 shrink-0 z-20">
                    <div className="flex flex-col gap-1 items-start">
                        <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                                <Package className="w-6 h-6" />
                            </div>
                            {isEdit ? "تعديل بيانات المنتج" : "إضافة منتج جديد للمخزن"}
                        </DialogTitle>
                        <p className="text-slate-500 font-medium text-sm">قم بتعبئة تفاصيل المنتج والأسعار والمخزون</p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="rounded-full w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </DialogHeader>

                {/* Body - Scrollable */}
                <form onSubmit={onSubmit} className="flex-1 overflow-y-auto custom-scrollbar" id="product-form">
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-full">

                        {/* Column 1: Core Info (Left) - 5 Cols */}
                        <div className="lg:col-span-5 space-y-6">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <AlertCircle className="w-4 h-4 text-slate-400" />
                                <span>البيانات الأساسية</span>
                            </h3>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">اسم المنتج</Label>
                                    <Input
                                        name="name"
                                        required
                                        defaultValue={product?.product_templates?.name}
                                        placeholder="مثال: iPhone 15 Pro Max"
                                        className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">الباركود (Serial Number)</Label>
                                    <div className="relative group">
                                        <Input
                                            name="barcode"
                                            defaultValue={product?.product_templates?.barcode || ""}
                                            placeholder="scan or type..."
                                            className="h-11 pl-10 font-mono text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-lg group-hover:border-slate-300 dark:group-hover:border-slate-700"
                                        />
                                        <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-primary/70 transition-colors" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">الكمية المتوفرة</Label>
                                        <Input
                                            name="stock"
                                            type="number"
                                            defaultValue={product?.stock ?? "1"}
                                            className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">سعر التكلفة</Label>
                                        <div className="relative">
                                            <Input
                                                name="buy_price"
                                                type="number"
                                                step="0.01"
                                                required
                                                defaultValue={product?.buy_price}
                                                className="h-11 pl-8 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all rounded-lg"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">DH</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5 pt-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-emerald-600 dark:text-emerald-400">أقل سعر بيع</Label>
                                        <div className="relative">
                                            <Input
                                                name="min_sell_price"
                                                type="number"
                                                step="0.01"
                                                required
                                                defaultValue={product?.min_sell_price}
                                                className="h-11 pl-8 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all rounded-lg placeholder:text-emerald-700/30"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">DH</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-primary">سعر البيع المقترح</Label>
                                        <div className="relative">
                                            <Input
                                                name="max_sell_price"
                                                type="number"
                                                step="0.01"
                                                required
                                                defaultValue={product?.max_sell_price}
                                                className="h-11 pl-8 font-bold bg-primary/5 border-primary/20 text-primary focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all rounded-lg"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary/70">DH</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Metadata (Center) - 4 Cols */}
                        <div className="lg:col-span-4 space-y-6 lg:border-r border-slate-100 dark:border-slate-800 lg:pr-8">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <Store className="w-4 h-4 text-slate-400" />
                                <span>التوافر والمواصفات</span>
                            </h3>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">المتاجر المتاحة</Label>
                                    <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                                        {stores.map((store) => {
                                            const isChecked = product?.all_store_ids?.includes(store.id) || product?.store_id === store.id;
                                            return (
                                                <label key={store.id} className={cn(
                                                    "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 group",
                                                    isChecked
                                                        ? "border-primary/30 bg-primary/5 shadow-sm"
                                                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                )}>
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                        isChecked ? "bg-primary border-primary text-white" : "border-slate-300 bg-white dark:bg-slate-800"
                                                    )}>
                                                        {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        name="store_ids"
                                                        value={store.id}
                                                        defaultChecked={isChecked}
                                                        className="hidden"
                                                    />
                                                    <span className={cn(
                                                        "text-sm font-medium transition-colors",
                                                        isChecked ? "text-primary" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                                                    )}>{store.name}</span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">الوصف</Label>
                                    <Textarea
                                        name="description"
                                        defaultValue={product?.product_templates?.description || ""}
                                        placeholder="وصف مختصر للمنتج..."
                                        className="min-h-[140px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none text-sm transition-all rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Image (Right) - 3 Cols */}
                        <div className="lg:col-span-3 space-y-6 lg:border-r border-slate-100 dark:border-slate-800 lg:pr-8">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                                <span>الصورة</span>
                            </h3>

                            <div
                                className={cn(
                                    "relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-4 text-center cursor-pointer overflow-hidden group",
                                    isDragging
                                        ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
                                        : preview
                                            ? "border-transparent shadow-md"
                                            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                                )}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {preview ? (
                                    <>
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-sm">
                                            <Upload className="w-8 h-8 text-white mb-2 opacity-90" />
                                            <p className="text-white text-sm font-medium">تغيير الصورة</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="pointer-events-none transform group-hover:scale-105 transition-transform duration-300">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-white shadow-sm transition-colors">
                                            <Upload className="w-7 h-7 text-slate-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Drag & Drop image</p>
                                        <p className="text-xs text-slate-400">or click to browse</p>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    name="image"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>

                            {preview && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100/50 h-9 rounded-lg transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPreview(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                >
                                    <X className="w-3 h-3 mr-2" />
                                    حذف الصورة
                                </Button>
                            )}
                        </div>

                    </div>
                </form>

                {/* Footer - Sticky */}
                <DialogFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-row items-center justify-end gap-3 z-20">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClose}
                        className="h-10 px-6 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        إلغاء
                    </Button>
                    <Button
                        type="submit"
                        form="product-form"
                        disabled={loading}
                        className={cn(
                            "h-10 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md hover:shadow-lg transition-all rounded-lg font-medium",
                            loading && "opacity-80 cursor-not-allowed"
                        )}
                    >
                        {loading ? "جاري الحفظ..." : (
                            <span className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                {isEdit ? "حفظ التعديلات" : "إضافة المنتج"}
                            </span>
                        )}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
