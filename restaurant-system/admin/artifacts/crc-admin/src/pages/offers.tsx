import { useRef, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import {
  useGetOffers,
  useCreateOffer,
  useUpdateOffer,
  useDeleteOffer,
  getGetOffersQueryKey,
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Tag, Calendar, Percent, Star, ToggleLeft, ToggleRight, ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface OfferForm {
  title: string;
  description: string;
  original_price: string;
  discounted_price: string;
  badge: string;
  category: string;
  start_date: string;
  end_date: string;
  is_featured: boolean;
  is_active: boolean;
  bannerUrl: string | null;
}

const emptyForm: OfferForm = {
  title: "",
  description: "",
  original_price: "",
  discounted_price: "",
  badge: "",
  category: "",
  start_date: new Date().toISOString().split("T")[0],
  end_date: new Date(Date.now() + 7 * 864e5).toISOString().split("T")[0],
  is_featured: false,
  is_active: true,
  bannerUrl: null,
};

function imageServingUrl(objectPath: string) {
  return `/api/storage${objectPath}`;
}

export default function Offers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: offers, isLoading } = useGetOffers();
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<OfferForm>(emptyForm);
  const [filter, setFilter] = useState<"all" | "active" | "featured">("all");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (response) => {
      setForm((prev) => ({ ...prev, bannerUrl: response.objectPath }));
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
    setForm((prev) => ({ ...prev, bannerUrl: null }));
    setImagePreview(null);
  };

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getGetOffersQueryKey() });

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (offer: NonNullable<typeof offers>[0]) => {
    setEditId(offer.id);
    setForm({
      title: offer.title,
      description: offer.description || "",
      original_price: String(offer.originalPrice),
      discounted_price: String(offer.discountedPrice),
      badge: offer.badge || "",
      category: offer.category || "",
      start_date: offer.startDate || new Date().toISOString().split("T")[0],
      end_date: offer.endDate || new Date(Date.now() + 7 * 864e5).toISOString().split("T")[0],
      is_featured: offer.isFeatured || false,
      is_active: offer.isActive ?? true,
      bannerUrl: offer.bannerUrl ?? null,
    });
    setImagePreview(offer.bannerUrl ? imageServingUrl(offer.bannerUrl) : null);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (isUploading) {
      toast({ title: "Please wait for the image to finish uploading" });
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      originalPrice: parseFloat(form.original_price),
      discountedPrice: parseFloat(form.discounted_price),
      discountPercent:
        ((parseFloat(form.original_price) - parseFloat(form.discounted_price)) /
          parseFloat(form.original_price)) *
        100,
      badge: form.badge,
      category: form.category,
      startDate: form.start_date,
      endDate: form.end_date,
      isFeatured: form.is_featured,
      isActive: form.is_active,
      bannerUrl: form.bannerUrl ?? undefined,
    };

    if (editId) {
      updateOffer.mutate(
        { id: editId, data: payload },
        {
          onSuccess: () => {
            invalidate();
            setDialogOpen(false);
            toast({ title: "Offer updated successfully" });
          },
        }
      );
    } else {
      createOffer.mutate(
        { data: payload },
        {
          onSuccess: () => {
            invalidate();
            setDialogOpen(false);
            toast({ title: "Offer created successfully" });
          },
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteOffer.mutate(
      { id },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: "Offer deleted", description: "The offer has been removed." });
        },
      }
    );
  };

  const filtered = offers?.filter((o) => {
    if (filter === "active") return o.isActive;
    if (filter === "featured") return o.isFeatured;
    return true;
  });

  return (
    <Layout title="Offers & Promotions">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {(["all", "active", "featured"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className={filter === f ? "bg-[#FF2B2B] hover:bg-[#cc2222] text-white" : ""}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
          <Button
            onClick={openCreate}
            className="bg-[#FF2B2B] hover:bg-[#cc2222] text-white gap-2"
          >
            <Plus className="w-4 h-4" /> New Offer
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Offers", value: offers?.length || 0, color: "text-foreground" },
            { label: "Active", value: offers?.filter((o) => o.isActive).length || 0, color: "text-green-500" },
            { label: "Featured", value: offers?.filter((o) => o.isFeatured).length || 0, color: "text-yellow-400" },
            { label: "Avg Discount", value: offers?.length ? `${(offers.reduce((s, o) => s + (o.discountPercent || 0), 0) / offers.length).toFixed(0)}%` : "0%", color: "text-[#FF2B2B]" },
          ].map((s) => (
            <GlassCard key={s.label} className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </GlassCard>
          ))}
        </div>

        {/* Offers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <GlassCard key={i} className="h-64 animate-pulse"><span /></GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered?.map((offer, i) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06 }}
                >
                  {offer.isFeatured ? (
                    <GlassCard
                      highlighted
                      className="flex flex-col overflow-hidden h-full group"
                    >
                      <div className="relative h-36 bg-gradient-to-br from-[#1a0a00] to-[#0d0d0d] overflow-hidden flex-shrink-0">
                        {offer.bannerUrl ? (
                          <img
                            src={imageServingUrl(offer.bannerUrl)}
                            alt={offer.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Star className="w-12 h-12 text-yellow-400/20" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-white bg-gradient-to-r from-[#FF2B2B] to-[#C1121F]">
                            <Star className="w-3 h-3 fill-white" /> Featured
                          </div>
                        </div>
                        <div className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full ${offer.isActive ? "bg-green-500" : "bg-gray-500"}`} />
                      </div>
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        {offer.badge && (
                          <Badge className="text-xs bg-[#FF2B2B]/20 text-[#FF2B2B] border-[#FF2B2B]/30 self-start">
                            {offer.badge}
                          </Badge>
                        )}
                        <h3 className="font-serif font-bold text-foreground leading-tight">{offer.title}</h3>
                        {offer.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{offer.description}</p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-xl font-bold text-[#FF2B2B]">₹{offer.discountedPrice}</span>
                          <span className="text-xs text-muted-foreground line-through">₹{offer.originalPrice}</span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => openEdit(offer)}>
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(offer.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </GlassCard>
                  ) : (
                    <GlassCard
                      className="p-6 flex flex-col gap-4 h-full relative overflow-hidden group"
                    >
                      {/* Decorative gradient */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF2B2B]/5 rounded-full -mr-12 -mt-12 group-hover:bg-[#FF2B2B]/10 transition-colors" />

                      {/* Banner Image */}
                      {offer.bannerUrl ? (
                        <div className="relative w-full h-40 -mx-6 -mt-6 mb-2 overflow-hidden">
                          <img
                            src={imageServingUrl(offer.bannerUrl)}
                            alt={offer.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null}

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {offer.badge && (
                              <Badge className="text-xs bg-[#FF2B2B]/20 text-[#FF2B2B] border-[#FF2B2B]/30">
                                {offer.badge}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-serif font-bold text-lg text-foreground leading-tight">
                            {offer.title}
                          </h3>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${offer.isActive ? "bg-green-500" : "bg-gray-500"}`} />
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>

                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Original</p>
                          <p className="text-sm line-through text-muted-foreground">₹{offer.originalPrice}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Offer Price</p>
                          <p className="text-xl font-bold text-[#FF2B2B]">₹{offer.discountedPrice}</p>
                        </div>
                        <div className="ml-auto">
                          <div className="bg-[#FF2B2B]/20 text-[#FF2B2B] text-lg font-bold px-3 py-1 rounded-xl flex items-center gap-1">
                            <Percent className="w-4 h-4" />
                            {(offer.discountPercent || 0).toFixed(0)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{offer.startDate} → {offer.endDate}</span>
                      </div>

                      {offer.category && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{offer.category}</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1"
                          onClick={() => openEdit(offer)}
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDelete(offer.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </GlassCard>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty state */}
            {!filtered?.length && (
              <div className="col-span-full text-center py-24 text-muted-foreground">
                <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No offers found</p>
                <p className="text-sm mt-1">Create your first promotional offer</p>
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
              {editId ? "Edit Offer" : "Create New Offer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Image Upload */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Banner Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {imagePreview || form.bannerUrl ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-white/5 group">
                  <img
                    src={imagePreview || (form.bannerUrl ? imageServingUrl(form.bannerUrl) : "")}
                    alt="Offer banner preview"
                    className="w-full h-full object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-white" />
                        <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
                          <div
                            className="h-full bg-[#FF2B2B] transition-all duration-300 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
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
                  <span className="text-sm font-medium">Click to upload banner image</span>
                  <span className="text-xs opacity-60">PNG, JPG, WEBP up to 10MB</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Offer title"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Offer description"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Original Price (₹)</label>
                <Input
                  type="number"
                  value={form.original_price}
                  onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                  placeholder="0"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Offer Price (₹)</label>
                <Input
                  type="number"
                  value={form.discounted_price}
                  onChange={(e) => setForm({ ...form, discounted_price: e.target.value })}
                  placeholder="0"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Badge Label</label>
                <Input
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  placeholder="e.g. Weekend Special"
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
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <button
                onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {form.is_featured ? (
                  <ToggleRight className="w-6 h-6 text-yellow-400" />
                ) : (
                  <ToggleLeft className="w-6 h-6" />
                )}
                Featured
              </button>
              <button
                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {form.is_active ? (
                  <ToggleRight className="w-6 h-6 text-green-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6" />
                )}
                Active
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#FF2B2B] hover:bg-[#cc2222] text-white"
                onClick={handleSubmit}
                disabled={createOffer.isPending || updateOffer.isPending}
              >
                {editId ? "Save Changes" : "Create Offer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
