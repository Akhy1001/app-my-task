"use client";

import { useState, useEffect } from "react";
import TodoApp from "@/components/TodoApp";
import LoginPage from "@/components/LoginPage";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [userRole, setUserRole] = useState<'anas' | 'rose' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Déterminer le rôle d'utilisateur en fonction de l'email
    const assignRole = async (email?: string) => {
        if (!email) {
            setUserRole(null);
            return;
        }

        const lowerEmail = email.toLowerCase();
        if (lowerEmail === "anas.fz1001@gmail.com" || lowerEmail.includes("anas")) {
            setUserRole('anas');
        } else if (lowerEmail === "rstrpn05@gmail.com" || lowerEmail.includes("rose") || lowerEmail.includes("rstrpn")) {
            setUserRole('rose');
        } else {
            // Utilisateur non autorisé
            await supabase.auth.signOut();
            setUserRole(null);
            alert("Accès refusé : Cette adresse e-mail n'est pas autorisée.");
        }
    };

    // Obtenir la session initiale
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
            await assignRole(session.user.email);
        }
        setIsLoaded(true);
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user?.email) {
            await assignRole(session.user.email);
        } else {
            setUserRole(null);
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!isLoaded) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="w-full h-full flex items-center justify-center">
        {userRole ? (
          <TodoApp user={userRole} onLogout={handleLogout} />
        ) : (
          <LoginPage />
        )}
      </main>
    </div>
  );
}
