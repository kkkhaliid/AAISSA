import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Image as ImageIcon, X, Upload, AlignLeft } from "lucide-react";
import { createProduct, updateProduct } from "@/app/admin/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

type Store = { id: string; name: string };
type Product = {
    id: string;
    template_id: string;
    store_id: string;
    all_store_ids?: string[]; // Added to track all stores for this template
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEdit = !!product;

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

    function handleClose() {
        setOpen(false);
        if (!isEdit) setPreview(null);
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isEdit && (
                <DialogTrigger asChild>
                    <Button className="gap-3 h-14 px-8 rounded-2xl gradient-primary shadow-xl shadow-indigo-200 dark:shadow-none font-black text-lg active:scale-95 transition-all text-white border-0">
                        <Plus className="w-6 h-6" />
                        <span>إضافة منتج جديد</span>
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl border border-white/20 dark:border-white/5 shadow-2xl rounded-[4rem] p-0 overflow-hidden" dir="rtl">
                {/* Background Accent Glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <DialogHeader className="p-10 pb-0 flex flex-row items-center justify-between relative z-10">
                    <div>
                        <DialogTitle className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}
                        </DialogTitle>
                        <p className="text-slate-500 font-medium mt-1">قم بتعبئة بيانات المنتج بدقة في النظام</p>
                    </div>
                </DialogHeader>

                <form onSubmit={onSubmit} className="p-10 space-y-10 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column: Image & Basic Info */}
                        <div className="space-y-8">
                            <div className="relative group">
                                <div
                                    className={cn(
                                        "w-full aspect-square rounded-[3rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1",
                                        preview && "p-6"
                                    )}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {preview ? (
                                        <div className="relative w-full h-full group/preview">
                                            <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-3xl" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                                                <Upload className="w-10 h-10 text-white animate-bounce" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-6 text-slate-300 group-hover:text-primary transition-all duration-500">
                                            <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-800 shadow-premium flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Upload className="w-10 h-10" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-black text-sm uppercase tracking-[0.2em]">رفع صورة المنتج</p>
                                                <p className="text-[10px] opacity-60 mt-1">يفضل أن تكون الخلفية بيضاء</p>
                                            </div>
                                        </div>
                                    )}
                                    {preview && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-8 right-8 rounded-2xl h-12 w-12 shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreview(null);
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                        >
                                            <X className="w-6 h-6" />
                                        </Button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    name="image"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px] pr-2">اسم المنتج</Label>
                                    <Input
                                        name="name"
                                        required
                                        defaultValue={product?.product_templates?.name}
                                        placeholder="مثال: iPhone 15 Pro Max"
                                        className="h-16 text-xl font-bold text-right border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl shadow-inner focus-visible:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px] pr-2">الباركود</Label>
                                    <div className="relative">
                                        <Input
                                            name="barcode"
                                            defaultValue={product?.product_templates?.barcode || ""}
                                            placeholder="اختياري أو اتركه فارغاً"
                                            className="h-16 font-mono font-bold text-left border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl shadow-inner focus-visible:ring-primary/20 transition-all pl-12"
                                        />
                                        <AlignLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px] pr-2">وصف المنتج</Label>
                                    <Textarea
                                        name="description"
                                        defaultValue={product?.product_templates?.description || ""}
                                        placeholder="اكتب تفاصيل ومواصفات المنتج هنا..."
                                        className="min-h-[120px] text-lg font-bold text-right border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-slate-800/50 rounded-[2rem] shadow-inner focus-visible:ring-primary/20 p-6 resize-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Stores & Pricing */}
                        <div className="space-y-10 flex flex-col justify-between h-full">
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px] mb-4 pr-2">توزيع الكميات (المتاجر)</Label>
                                    <div className="grid grid-cols-1 gap-3 p-2 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-white/5 max-h-64 overflow-y-auto custom-scrollbar">
                                        {stores.map((store) => {
                                            const isChecked = product?.all_store_ids?.includes(store.id) || product?.store_id === store.id;
                                            return (
                                                <label
                                                    key={store.id}
                                                    className={cn(
                                                        "flex items-center justify-between p-5 rounded-[1.5rem] cursor-pointer transition-all active:scale-[0.98] border-2",
                                                        isChecked
                                                            ? "bg-white dark:bg-slate-800 border-primary shadow-lg shadow-primary/5"
                                                            : "bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-slate-800/50"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                            isChecked ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                                        )}>
                                                            <Plus className={cn("w-5 h-5 transition-transform", isChecked && "rotate-45")} />
                                                        </div>
                                                        <span className={cn("font-black text-lg", isChecked ? "text-slate-900 dark:text-white" : "text-slate-500")}>
                                                            {store.name}
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        name="store_ids"
                                                        value={store.id}
                                                        defaultChecked={isChecked}
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            // Force parent re-render or just let the native checkbox do its thing if needed
                                                            // For now we rely on defaultChecked and CSS selection
                                                        }}
                                                    />
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                        isChecked ? "border-primary bg-primary" : "border-slate-200 dark:border-slate-700"
                                                    )}>
                                                        {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px] pr-2">الكمية المتوفرة</Label>
                                        <Input
                                            name="stock"
                                            type="number"
                                            defaultValue={product?.stock ?? "1"}
                                            className="h-16 text-2xl font-black text-center border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-right block font-black text-rose-400 uppercase tracking-widest text-[10px] pr-2">سعر الشراء</Label>
                                        <div className="relative">
                                            <Input
                                                name="buy_price"
                                                type="number"
                                                step="0.01"
                                                required
                                                defaultValue={product?.buy_price}
                                                className="h-16 text-2xl font-black text-center border-0 bg-rose-50/50 dark:bg-rose-500/5 text-rose-600 rounded-2xl shadow-inner pr-14"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-xs">DH</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-10 border-t border-slate-100 dark:border-white/5 relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 px-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                    أسعار البيع للعملاء
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-right block font-black text-emerald-400 uppercase tracking-widest text-[10px] pr-2">أقل سعر ممكن</Label>
                                        <div className="relative">
                                            <Input
                                                name="min_sell_price"
                                                type="number"
                                                step="0.01"
                                                required
                                                defaultValue={product?.min_sell_price}
                                                className="h-16 text-2xl font-black text-center border-0 bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-600 rounded-2xl shadow-inner pr-14"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xs">DH</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-right block font-black text-primary uppercase tracking-widest text-[10px] pr-2">أقصى سعر مقترح</Label>
                                        <div className="relative">
                                            <Input
                                                name="max_sell_price"
                                                type="number"
                                                step="0.01"
                                                required
                                                defaultValue={product?.max_sell_price}
                                                className="h-16 text-2xl font-black text-center border-0 bg-primary/5 text-primary rounded-2xl shadow-inner pr-14"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 font-bold text-xs">DH</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 pt-6">
                        <Button type="submit" disabled={loading} className="flex-1 h-20 rounded-[2rem] gradient-primary text-2xl font-black shadow-2xl shadow-primary/20 border-0 text-white transition-all active:scale-[0.97] group">
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>جاري المعالجة...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" />
                                    <span>{isEdit ? "حفظ التعديلات" : "إضافة المنتج للنظام"}</span>
                                </div>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-20 md:w-48 rounded-[2rem] font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl"
                            onClick={handleClose}
                        >
                            إلغاء
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
