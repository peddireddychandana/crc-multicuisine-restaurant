import { useRef, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import {
  useGetMenuItems,
  useGetMenuCategories,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  getGetMenuItemsQueryKey,
  MenuItemFoodType,
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Utensils, Leaf, Star,
  ImageIcon, Upload, X, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface MenuForm {
  name: string;
  description: string;
  price: string;
  category: string;
  foodType: "veg" | "non-veg";
  isAvailable: boolean;
  isBestseller: boolean;
  imageUrl: string | null;
}

const emptyForm: MenuForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  foodType: "non-veg",
  isAvailable: true,
  isBestseller: false,
  imageUrl: null,
};

function imageServingUrl(objectPath: string) {
  return `/api/storage${objectPath}`;
}

export default function Menu() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: menuItems, isLoading } = useGetMenuItems();
  const { data: categoriesRaw } = useGetMenuCategories();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const [activeCategory, setActiveCategory] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<MenuForm>(emptyForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (response) => {
      setForm((prev) => ({ ...prev, imageUrl: response.objectPath }));
      toast({ title: "Image uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Image upload failed", variant: "destructive" });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    await uploadFile(file);

    e.target.value = "";
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: null }));
    setImagePreview(null);
  };

  const categoryNames = ["All", ...(categoriesRaw?.map((c) => c.name) ?? [])];

  const filtered = menuItems?.filter((item) =>
    activeCategory === "All" || item.category === activeCategory
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getGetMenuItemsQueryKey() });

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (item: NonNullable<typeof menuItems>[0]) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      category: item.category,
      foodType: item.foodType === MenuItemFoodType.veg ? "veg" : "non-veg",
      isAvailable: item.isAvailable,
      isBestseller: item.isBestseller,
      imageUrl: item.imageUrl ?? null,
    });
    setImagePreview(item.imageUrl ? imageServingUrl(item.imageUrl) : null);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (isUploading) {
      toast({ title: "Please wait for the image to finish uploading" });
      return;
    }
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      foodType: form.foodType,
      isAvailable: form.isAvailable,
      isBestseller: form.isBestseller,
      imageUrl: form.imageUrl ?? undefined,
    };

    if (editId) {
      updateItem.mutate(
        { id: editId, data: payload },
        {
          onSuccess: () => {
            invalidate();
            setDialogOpen(false);
            toast({ title: "Menu item updated" });
          },
          onError: (err) => {
            toast({ title: "Failed to update menu item", description: (err as Error)?.message || "An error occurred", variant: "destructive" });
          },
        }
      );
    } else {
      createItem.mutate(
        { data: payload },
        {
          onSuccess: () => {
            invalidate();
            setDialogOpen(false);
            toast({ title: "Menu item added" });
          },
          onError: (err) => {
            toast({ title: "Failed to add menu item", description: (err as Error)?.message || "An error occurred", variant: "destructive" });
          },
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate(
      { id },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: "Item removed from menu" });
        },
        onError: (err) => {
          toast({ title: "Failed to delete menu item", description: (err as Error)?.message || "An error occurred", variant: "destructive" });
        },
      }
    );
  };

  const isVeg = (item: NonNullable<typeof menuItems>[0]) =>
    item.foodType === MenuItemFoodType.veg;

  return (
    <Layout title="Menu Management">
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <Button
            onClick={openCreate}
            className="bg-[#FF2B2B] hover:bg-[#cc2222] text-white gap-2"
          >
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Items", value: menuItems?.length ?? 0, color: "text-foreground" },
            { label: "Available", value: menuItems?.filter((m) => m.isAvailable).length ?? 0, color: "text-green-500" },
            { label: "Vegetarian", value: menuItems?.filter((m) => m.foodType === MenuItemFoodType.veg).length ?? 0, color: "text-emerald-400" },
            { label: "Bestsellers", value: menuItems?.filter((m) => m.isBestseller).length ?? 0, color: "text-yellow-400" },
          ].map((s) => (
            <GlassCard key={s.label} className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </GlassCard>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap">
          {categoryNames.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={activeCategory === cat ? "default" : "outline"}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? "bg-[#FF2B2B] hover:bg-[#cc2222] text-white" : ""}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <GlassCard key={i} className="h-60 animate-pulse">
                <span />
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered?.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <GlassCard
                    highlighted={item.isBestseller}
                    className={`flex flex-col gap-0 h-full overflow-hidden ${!item.isAvailable ? "opacity-50" : ""}`}
                  >
                    {/* Image Area */}
                    <div className="relative w-full h-36 bg-white/5 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={imageServingUrl(item.imageUrl)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-white/10" />
                        </div>
                      )}
                      {/* Badges overlay */}
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        {isVeg(item) ? (
                          <span className="bg-green-900/80 text-green-400 text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Leaf className="w-3 h-3" /> Veg
                          </span>
                        ) : (
                          <span className="bg-orange-900/80 text-orange-400 text-xs px-1.5 py-0.5 rounded">
                            🍗 Non-Veg
                          </span>
                        )}
                        {item.isBestseller && (
                          <span className="bg-yellow-900/80 text-yellow-400 text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400" /> Best
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge className="text-xs bg-white/5 text-muted-foreground border-white/10">
                              {item.category}
                            </Badge>
                          </div>
                          <h3 className="font-serif font-bold text-foreground">{item.name}</h3>
                        </div>
                        <p className="text-xl font-bold text-[#FF2B2B] shrink-0">₹{item.price}</p>
                      </div>

                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 flex-wrap mt-auto">
                        <span
                          className={`text-xs font-medium ${item.isAvailable ? "text-green-500" : "text-red-500"}`}
                        >
                          {item.isAvailable ? "● Available" : "● Unavailable"}
                        </span>
                        {item.rating > 0 && (
                          <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-yellow-400" />
                            {item.rating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1 border-t border-white/5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>

            {!filtered?.length && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No menu items found</p>
                <p className="text-sm mt-1">Try a different category</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editId ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">

            {/* Image Upload */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Food Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {imagePreview ? (
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/10 group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                      <span className="text-sm text-white font-medium">Uploading... {progress}%</span>
                      <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF2B2B] rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {!isUploading && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1.5 backdrop-blur-sm"
                      >
                        <Upload className="w-4 h-4" /> Change
                      </button>
                      <button
                        onClick={removeImage}
                        className="bg-red-500/30 hover:bg-red-500/50 text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1.5 backdrop-blur-sm"
                      >
                        <X className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-36 rounded-xl border-2 border-dashed border-white/10 hover:border-[#FF2B2B]/50 hover:bg-[#FF2B2B]/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">Click to upload food image</span>
                  <span className="text-xs opacity-60">PNG, JPG, WEBP up to 10MB</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Dish name"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Price (₹)</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Biryanis"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            {/* Food Type */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Food Type</label>
              <div className="flex gap-3">
                {(["veg", "non-veg"] as const).map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={form.foodType === type ? "default" : "outline"}
                    onClick={() => setForm({ ...form, foodType: type })}
                    className={`capitalize ${form.foodType === type ? "bg-[#FF2B2B] text-white hover:bg-[#cc2222]" : ""}`}
                  >
                    {type === "veg" ? "🌿 Veg" : "🍗 Non-Veg"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-6 flex-wrap">
              {[
                { key: "isAvailable", label: "Available", color: "text-blue-400" },
                { key: "isBestseller", label: "Bestseller", color: "text-yellow-400" },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setForm({ ...form, [key]: !form[key as keyof MenuForm] })}
                  className={`flex items-center gap-2 text-sm transition-colors ${form[key as keyof MenuForm] ? color : "text-muted-foreground"}`}
                >
                  <span
                    className={`w-8 h-5 rounded-full transition-colors flex items-center ${form[key as keyof MenuForm] ? "bg-[#FF2B2B] justify-end" : "bg-white/10 justify-start"} px-0.5`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block" />
                  </span>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#FF2B2B] hover:bg-[#cc2222] text-white"
                onClick={handleSubmit}
                disabled={createItem.isPending || updateItem.isPending || isUploading}
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </span>
                ) : editId ? "Save Changes" : "Add to Menu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
