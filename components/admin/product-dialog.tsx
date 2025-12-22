import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Image as ImageIcon, X, Upload } from "lucide-react";
import { createProduct, updateProduct } from "@/app/admin/actions";
import { toast } from "sonner";

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
                    <Button className="gap-2 h-10 px-4 rounded-xl shadow-sm hover:shadow-md transition-all font-bold">
                        <Plus className="w-4 h-4" />
                        <span>إضافة منتج جديد</span>
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl overflow-hidden p-0 rounded-2xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold">
                        {isEdit ? "تعديل بيانات المنتج" : "إضافة منتج للنظام"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="p-6 pt-2 space-y-6">
                    {/* Image Upload Section */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors group relative">
                        {preview ? (
                            <div className="relative w-full aspect-video max-h-48 rounded-xl overflow-hidden shadow-sm">
                                <img src={preview} alt="Preview" className="w-full h-full object-contain bg-white" />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 rounded-full h-8 w-8"
                                    onClick={() => {
                                        setPreview(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="flex flex-col items-center gap-2 cursor-pointer py-8"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-gray-700">اضغط لرفع صورة المنتج</p>
                                    <p className="text-xs text-gray-400">PNG, JPG حتى 5 ميجابايت</p>
                                </div>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-600 font-bold">اسم المنتج</Label>
                            <Input id="name" name="name" required defaultValue={product?.product_templates?.name} placeholder="مثال: iPhone 15 Pro Max" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="barcode" className="text-gray-600 font-bold">الباركود</Label>
                            <Input id="barcode" name="barcode" defaultValue={product?.product_templates?.barcode || ""} placeholder="اختياري" className="h-11 rounded-xl font-mono" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-gray-600 font-bold">تحديد المتاجر</Label>
                        <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 max-h-32 overflow-y-auto">
                            {stores.map((store) => (
                                <div key={store.id} className="flex items-center space-x-2 space-x-reverse">
                                    <input
                                        type="checkbox"
                                        id={`store-${store.id}`}
                                        name="store_ids"
                                        value={store.id}
                                        defaultChecked={product?.all_store_ids?.includes(store.id) || product?.store_id === store.id}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor={`store-${store.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                        {store.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stock" className="text-gray-600 font-bold">الكمية المتوفرة</Label>
                            <Input id="stock" name="stock" type="number" defaultValue={product?.stock ?? "1"} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="buy_price" className="text-red-600 font-bold underline decoration-dotted">سعر الشراء</Label>
                            <Input id="buy_price" name="buy_price" type="number" step="0.01" defaultValue={product?.buy_price} className="h-11 rounded-xl bg-red-50/50 border-red-100" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div className="space-y-2">
                            <Label htmlFor="min_sell_price" className="text-green-600 font-bold">أقل سعر للبيع</Label>
                            <Input id="min_sell_price" name="min_sell_price" type="number" step="0.01" defaultValue={product?.min_sell_price} className="h-11 rounded-xl" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max_sell_price" className="text-primary font-bold">أقصى سعر للبيع</Label>
                            <Input id="max_sell_price" name="max_sell_price" type="number" step="0.01" defaultValue={product?.max_sell_price} className="h-11 rounded-xl" required />
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                        {loading ? "جاري الحفظ..." : (isEdit ? "حفظ التعديلات" : "إضافة المنتج للنظام")}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
