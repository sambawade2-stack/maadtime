"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, X, Save, Loader2, GripVertical, ImagePlus } from "lucide-react";
import { Category } from "@/types";
import { dashboardApi } from "@/lib/api";
import toast from "react-hot-toast";

const EMPTY_FORM = { name: "", description: "", order: "0", is_active: true };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const { data } = await dashboardApi.allCategories();
    setCategories(data.results || data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description || "",
      order: c.order.toString(),
      is_active: c.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Le nom est obligatoire."); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        order: parseInt(form.order) || 0,
        is_active: form.is_active,
      };
      if (editing) {
        await dashboardApi.updateCategory(editing.slug, payload);
        toast.success("Catégorie mise à jour ✓");
      } else {
        await dashboardApi.createCategory(payload);
        toast.success("Catégorie créée ✓");
      }
      setModalOpen(false);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.name?.[0] || "Erreur lors de la sauvegarde");
    } finally { setSaving(false); }
  };

  const handleDelete = async (slug: string, name: string, count: number) => {
    if (count > 0 && !confirm(`"${name}" contient ${count} produit(s). Supprimer quand même ?`)) return;
    if (count === 0 && !confirm(`Supprimer "${name}" ?`)) return;
    try {
      await dashboardApi.deleteCategory(slug);
      toast.success("Catégorie supprimée");
      fetch();
    } catch { toast.error("Impossible de supprimer cette catégorie."); }
  };

  const EMOJI_MAP: Record<string, string> = {
    "maad-naturel": "🌰", "huile-de-maad": "🫙",
    "poudre-de-maad": "🌿", "savons-naturels": "🧼", "cosmetiques": "✨",
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Catégories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {categories.length} catégorie{categories.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Nouvelle catégorie
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-2xl animate-pulse shadow-card" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-card rounded-2xl shadow-card">
          <p className="text-4xl mb-3">🗂️</p>
          <p className="text-muted-foreground text-sm mb-4">Aucune catégorie — créez la première !</p>
          <button onClick={openCreate} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Créer une catégorie
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-card rounded-2xl shadow-card overflow-hidden group"
            >
              {/* Image zone */}
              <div className="aspect-video bg-brand-beige dark:bg-muted flex items-center justify-center relative overflow-hidden">
                {c.image ? (
                  <Image src={c.image} alt={c.name} fill className="object-cover" />
                ) : (
                  <span className="text-5xl">{EMOJI_MAP[c.slug] || "📦"}</span>
                )}
                {!c.is_active && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold bg-black/60 px-2 py-1 rounded-full">
                      Inactive
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.product_count} produit{c.product_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(c)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-beige transition-colors text-muted-foreground hover:text-brand-green"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.slug, c.name, c.product_count)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-muted-foreground">ordre #{c.order}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-card rounded-3xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="font-display text-xl font-bold">
                    {editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex : Huile de maad"
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Courte description de la catégorie..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Ordre d&apos;affichage</label>
                      <input
                        type="number"
                        value={form.order}
                        onChange={(e) => setForm({ ...form, order: e.target.value })}
                        min="0"
                        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, is_active: !form.is_active })}
                        className={`w-full py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.is_active ? "border-brand-green bg-brand-green/10 text-brand-green" : "border-border text-muted-foreground"}`}
                      >
                        {form.is_active ? "✓ Active" : "Inactive"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                  <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2.5">
                    {saving
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</>
                      : <><Save className="w-4 h-4" /> {editing ? "Enregistrer" : "Créer"}</>
                    }
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
