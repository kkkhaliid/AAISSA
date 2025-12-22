import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Image as ImageIcon, X, Upload } from "lucide-react";
import { createProduct, updateProduct } from "@/app/admin/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

            if (result.error) {
                toast.error(result.error);
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
            <DialogContent className="max-w-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-0 shadow-2xl rounded-[3.5rem] p-0 overflow-hidden" dir="rtl">
                <DialogHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                    <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white text-right">
                        {isEdit ? "تعديل البيانات" : "إضافة منتج جديد"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="p-10 space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Left Column: Image & Basic Info */}
                        <div className="space-y-8">
                            <div className="relative group">
                                <div
                                    className={cn(
                                        "w-full aspect-square rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border-0 shadow-inner flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:bg-slate-100",
                                        preview && "p-4"
                                    )}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-2xl" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 text-slate-300 group-hover:text-primary transition-colors">
                                            <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                                                <Upload className="w-10 h-10" />
                                            </div>
                                            <p className="font-black text-sm uppercase tracking-widest">رفع صورة المنتج</p>
                                        </div>
                                    )}
                                    {preview && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-4 right-4 rounded-2xl h-12 w-12 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
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

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px]">اسم المنتج</Label>
                                    <Input
                                        name="name"
                                        required
                                        defaultValue={product?.product_templates?.name}
                                        placeholder="مثال: iPhone 15 Pro Max"
                                        className="h-14 text-lg font-bold text-right border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px]">الباركود</Label>
                                    <Input
                                        name="barcode"
                                        defaultValue={product?.product_templates?.barcode || ""}
                                        placeholder="اختياري"
                                        className="h-14 font-mono font-bold text-left border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner focus-visible:ring-primary/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Stores & Pricing */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px]">توزيع الكميات (المتاجر)</Label>
                                <div className="grid grid-cols-1 gap-3 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-0 shadow-inner max-h-48 overflow-y-auto custom-scrollbar">
                                    {stores.map((store) => (
                                        <label key={store.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors group">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{store.name}</span>
                                            <input
                                                type="checkbox"
                                                name="store_ids"
                                                value={store.id}
                                                defaultChecked={product?.all_store_ids?.includes(store.id) || product?.store_id === store.id}
                                                className="w-6 h-6 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary transition-all checked:bg-primary"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-right block font-black text-slate-400 uppercase tracking-widest text-[10px]">الكمية</Label>
                                    <Input
                                        name="stock"
                                        type="number"
                                        defaultValue={product?.stock ?? "1"}
                                        className="h-14 text-xl font-black text-center border-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-right block font-black text-rose-400 uppercase tracking-widest text-[10px]">سعر الشراء</Label>
                                    <Input
                                        name="buy_price"
                                        type="number"
                                        step="0.01"
                                        required
                                        defaultValue={product?.buy_price}
                                        className="h-14 text-xl font-black text-center border-0 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-2xl shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-right block font-black text-emerald-400 uppercase tracking-widest text-[10px]">أقل سعر للبيع</Label>
                                        <Input
                                            name="min_sell_price"
                                            type="number"
                                            step="0.01"
                                            required
                                            defaultValue={product?.min_sell_price}
                                            className="h-14 text-xl font-black text-center border-0 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-2xl shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-right block font-black text-primary uppercase tracking-widest text-[10px]">أقصى سعر للبيع</Label>
                                        <Input
                                            name="max_sell_price"
                                            type="number"
                                            step="0.01"
                                            required
                                            defaultValue={product?.max_sell_price}
                                            className="h-14 text-xl font-black text-center border-0 bg-primary/10 text-primary rounded-2xl shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button type="submit" disabled={loading} className="w-full h-20 rounded-3xl gradient-primary text-2xl font-black shadow-xl border-0 text-white transition-all active:scale-[0.98]">
                            {loading ? "جاري الحفظ..." : (isEdit ? "حفظ التغييرات" : "إضافة المنتج للنظام")}
                        </Button>
                        <Button type="button" variant="ghost" className="w-full h-14 rounded-2xl font-black text-slate-400" onClick={handleClose}>
                            إلغاء
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
