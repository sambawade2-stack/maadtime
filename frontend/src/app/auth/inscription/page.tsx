"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf, Eye, EyeOff, UserPlus } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const schema = z
  .object({
    first_name: z.string().min(2, "Prénom requis"),
    last_name: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(9, "Téléphone invalide"),
    password: z.string().min(8, "Minimum 8 caractères"),
    password2: z.string(),
    username: z.string().min(2, "Nom d'utilisateur requis"),
  })
  .refine((d) => d.password === d.password2, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password2"],
  });

type Form = z.infer<typeof schema>;

export default function InscriptionPage() {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      const { data: res } = await authApi.register(data);
      Cookies.set("access_token", res.access, { expires: 1 });
      Cookies.set("refresh_token", res.refresh, { expires: 7 });
      updateUser(res.user);
      toast.success("Compte créé avec succès !");
      router.push("/profil");
    } catch (err: any) {
      const errors = err.response?.data;
      const msg = errors?.email?.[0] || errors?.detail || "Erreur lors de l'inscription.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-brand-green rounded-2xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-brand-green">Maadtime</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">Créer un compte</h1>
          <p className="text-muted-foreground text-sm mt-1">Rejoignez la communauté Maadtime</p>
        </div>

        <div className="bg-white rounded-2xl shadow-premium p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Prénom</label>
                <input
                  {...register("first_name")}
                  placeholder="Fatou"
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom</label>
                <input
                  {...register("last_name")}
                  placeholder="Diallo"
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Nom d&apos;utilisateur</label>
              <input
                {...register("username")}
                placeholder="fatou.diallo"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="votre@email.com"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Téléphone</label>
              <input
                {...register("phone")}
                placeholder="77 XXX XX XX"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-12 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Confirmer mot de passe</label>
              <input
                {...register("password2")}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
              {errors.password2 && <p className="text-red-500 text-xs mt-1">{errors.password2.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><UserPlus className="w-4 h-4" /> Créer mon compte</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Déjà un compte ?{" "}
            <Link href="/auth/connexion" className="text-brand-green font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
