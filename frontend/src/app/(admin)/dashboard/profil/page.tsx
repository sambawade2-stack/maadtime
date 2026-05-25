"use client";

import { useState } from "react";
import { User, Lock, Eye, EyeOff, Save } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminProfilPage() {
  const { user, updateUser } = useAuthStore();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [pwd, setPwd] = useState({ old_password: "", new_password: "", confirm: "" });
  const [name, setName] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
  });

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameLoading(true);
    try {
      const { data } = await authApi.updateProfile(name);
      updateUser(data);
      toast.success("Nom mis à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.new_password !== pwd.confirm) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (pwd.new_password.length < 8) {
      toast.error("Minimum 8 caractères.");
      return;
    }
    setPwdLoading(true);
    try {
      await authApi.changePassword(pwd.old_password, pwd.new_password);
      toast.success("Mot de passe modifié !");
      setPwd({ old_password: "", new_password: "", confirm: "" });
    } catch (err: any) {
      const msg = err?.response?.data?.old_password?.[0] || err?.response?.data?.detail || "Erreur lors du changement.";
      toast.error(msg);
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-display text-2xl font-bold mb-6">Mon profil</h1>

      {/* Infos compte */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-card p-6 mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-brand-green" />
          Informations du compte
        </h2>
        <div className="flex justify-between items-center py-2 border-b border-border mb-4 text-sm">
          <span className="text-muted-foreground">Email</span>
          <span className="font-medium">{user?.email}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border mb-4 text-sm">
          <span className="text-muted-foreground">Rôle</span>
          <span className="px-2 py-0.5 bg-brand-green/10 text-brand-green rounded-full text-xs font-semibold">
            Administrateur
          </span>
        </div>
        <form onSubmit={handleUpdateName} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Prénom</label>
              <input
                value={name.first_name}
                onChange={(e) => setName({ ...name, first_name: e.target.value })}
                placeholder="Prénom"
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nom</label>
              <input
                value={name.last_name}
                onChange={(e) => setName({ ...name, last_name: e.target.value })}
                placeholder="Nom"
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={nameLoading}
            className="btn-primary justify-center py-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {nameLoading ? "Enregistrement..." : "Enregistrer le nom"}
          </button>
        </form>
      </div>

      {/* Changer mot de passe */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-green" />
          Changer le mot de passe
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              placeholder="Ancien mot de passe"
              value={pwd.old_password}
              onChange={(e) => setPwd({ ...pwd, old_password: e.target.value })}
              required
              className="w-full px-4 py-2.5 pr-10 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
            <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              value={pwd.new_password}
              onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })}
              required
              className="w-full px-4 py-2.5 pr-10 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input
            type="password"
            placeholder="Confirmer le nouveau mot de passe"
            value={pwd.confirm}
            onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
          <button
            type="submit"
            disabled={pwdLoading}
            className="btn-primary justify-center py-2.5 text-sm"
          >
            <Save className="w-4 h-4" />
            {pwdLoading ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
