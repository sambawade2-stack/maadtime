"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit, Trash2, AlertTriangle, X, Upload,
  ImagePlus, Save, Loader2, Eye, EyeOff, Star, Tag,
} from "lucide-react";
import { Product, Category } from "@/types";
import { dashboardApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  name: "", category: "", description: "", short_description: "",
  price: "", compare_price: "", stock: "", weight: "",
  is_active: true, is_featured: false, is_new: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await dashboardApi.products({ search, page_size: 100 });
      setProducts(data.results || data);
    } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    const { data } = await dashboardApi.allCategories();
    setCategories(data.results || data);
  };

  useEffect(() => { fetchProducts(); }, [search]);
  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category?.id?.toString() || "",
      description: p.description || "",
      short_description: p.short_description || "",
      price: p.price.toString(),
      compare_price: p.compare_price?.toString() || "",
      stock: p.stock.toString(),
      weight: p.weight || "",
      is_active: p.is_active,
      is_featured: p.is_featured,
      is_new: p.is_new,
    });
    setImagePreview(p.main_image || null);
    setImageFile(null);
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      toast.error("Nom, prix et stock sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category || null,
        description: form.description,
        short_description: form.short_description,
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        stock: parseInt(form.stock),
        weight: form.weight,
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_new: form.is_new,
      };

      let savedSlug = editing?.slug;

      if (editing) {
        await dashboardApi.updateProduct(editing.slug, payload);
        toast.success("Produit mis à jour ✓");
      } else {
        const { data } = await dashboardApi.createProduct(payload);
        savedSlug = data.slug;
        toast.success("Produit créé ✓");
      }

      // Upload image if selected
      if (imageFile && savedSlug) {
        setUploadingImage(true);
        const fd = new FormData();
        fd.append("image", imageFile);
        await dashboardApi.uploadProductImage(savedSlug, fd);
        setUploadingImage(false);
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      const d = err.response?.data;
      const msg = !d
        ? "Erreur lors de la sauvegarde"
        : typeof d === "string" && d.includes("<!doctype")
          ? "Erreur serveur (500) — vérifiez les logs backend"
          : typeof d === "object"
            ? Object.values(d).flat().join(" · ")
            : String(d);
      toast.error(msg);
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`Supprimer "${name}" définitivement ?`)) return;
    try {
      await dashboardApi.deleteProduct(slug);
      toast.success("Produit supprimé");
      fetchProducts();
    } catch { toast.error("Erreur lors de la suppression"); }
  };

  const toggleField = async (slug: string, field: string, value: boolean) => {
    try {
      await dashboardApi.updateProduct(slug, { [field]: !value });
      fetchProducts();
    } catch { toast.error("Erreur"); }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Produits</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products.length} produit{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Nouveau produit
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Produit</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Prix</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Stock</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Vedette</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50 animate-pulse">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-10 bg-muted rounded" />
                      </td>
                    </tr>
                  ))
                : products.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-brand-beige rounded-xl overflow-hidden shrink-0">
                            {p.main_image ? (
                              <Image src={p.main_image} alt={p.name} width={48} height={48} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{p.name}</p>
                            {p.weight && <p className="text-xs text-muted-foreground">{p.weight}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-muted text-muted-foreground px-2 py-1 rounded-lg text-xs">
                          {p.category_name || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-brand-green">{formatPrice(p.price)}</p>
                        {p.compare_price && (
                          <p className="text-xs text-muted-foreground line-through">{formatPrice(p.compare_price)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${p.stock === 0 ? "text-red-500" : p.stock <= 5 ? "text-orange-500" : "text-green-600"}`}>
                          {p.stock === 0 && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleField(p.slug, "is_featured", p.is_featured)}
                          title="Produit vedette"
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${p.is_featured ? "bg-brand-brown/20 text-brand-brown" : "bg-muted text-muted-foreground hover:text-brand-brown"}`}
                        >
                          <Star className={`w-3.5 h-3.5 ${p.is_featured ? "fill-brand-brown" : ""}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleField(p.slug, "is_active", p.is_active)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${p.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        >
                          {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {p.is_active ? "Actif" : "Inactif"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-beige transition-colors text-muted-foreground hover:text-brand-green"
                            title="Modifier"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.slug, p.name)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!loading && products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-muted-foreground text-sm">Aucun produit — créez le premier !</p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-card rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal header */}
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white dark:bg-card rounded-t-3xl z-10">
                  <h2 className="font-display text-xl font-bold">
                    {editing ? "Modifier le produit" : "Nouveau produit"}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Image upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Image principale</label>
                    <div
                      onClick={() => imageRef.current?.click()}
                      className="relative border-2 border-dashed border-border rounded-2xl overflow-hidden cursor-pointer hover:border-brand-green transition-colors group"
                    >
                      {imagePreview ? (
                        <div className="relative aspect-video">
                          <Image src={imagePreview} alt="Aperçu" fill className="object-contain" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 bg-white text-sm font-medium px-3 py-1.5 rounded-lg transition-opacity">
                              Changer l&apos;image
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video flex flex-col items-center justify-center gap-3 text-muted-foreground group-hover:text-brand-green transition-colors">
                          <ImagePlus className="w-10 h-10" />
                          <div className="text-center">
                            <p className="text-sm font-medium">Cliquer pour ajouter une image</p>
                            <p className="text-xs opacity-60">JPG, PNG, WebP — max 10 MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Nom du produit <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex : Huile de maad premium 250ml"
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Catégorie</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-white"
                    >
                      <option value="">— Sans catégorie —</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price + Compare price + Stock + Weight */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Prix (FCFA) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="2500"
                        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Prix barré (FCFA)</label>
                      <input
                        type="number"
                        value={form.compare_price}
                        onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
                        placeholder="3000"
                        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        placeholder="50"
                        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Poids / Contenance</label>
                      <input
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                        placeholder="250ml, 1kg..."
                        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                  </div>

                  {/* Short description */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Description courte</label>
                    <input
                      value={form.short_description}
                      onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                      placeholder="Résumé en 1-2 phrases affiché sur la carte produit"
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>

                  {/* Full description */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Description complète</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      placeholder="Description détaillée, bienfaits, mode d'emploi..."
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="flex flex-wrap gap-4">
                    {[
                      { key: "is_active", label: "Produit actif", icon: Eye },
                      { key: "is_featured", label: "Produit vedette", icon: Star },
                      { key: "is_new", label: "Nouveau produit", icon: Tag },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm({ ...form, [key]: !form[key as keyof typeof form] })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                          form[key as keyof typeof form]
                            ? "border-brand-green bg-brand-green/10 text-brand-green"
                            : "border-border text-muted-foreground hover:border-brand-green/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-white dark:bg-card rounded-b-3xl">
                  <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary text-sm py-2.5"
                  >
                    {saving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {uploadingImage ? "Upload image..." : "Sauvegarde..."}</>
                    ) : (
                      <><Save className="w-4 h-4" /> {editing ? "Enregistrer" : "Créer le produit"}</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
