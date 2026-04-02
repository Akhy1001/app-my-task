"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import SplashScreen from "./SplashScreen";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;
                alert("Si l'inscription a réussi, vous êtes maintenant connecté(e) ou devez vérifier votre e-mail (selon la configuration de Supabase).");
                setIsSignUp(false);
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
            }
        } catch (err: any) {
            if (err.message === "Invalid login credentials") {
                setError("Identifiants incorrects.");
            } else if (err.message.includes("User already registered")) {
                setError("Cet utilisateur existe déjà.");
            } else {
                setError(err.message || "Une erreur est survenue.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {showSplash && <SplashScreen />}
            </AnimatePresence>
            
            <div className="min-h-screen w-full flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: showSplash ? 0 : 0.2, duration: 0.5 }}
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
                                My Task
                            </h1>
                            <p className="text-neutral-500 dark:text-neutral-400">
                                {isSignUp ? "Créez votre compte pour commencer." : "Connectez-vous pour accéder à votre espace."}
                            </p>
                        </div>
                        
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black to-neutral-300 dark:from-white dark:to-neutral-600 opacity-50" />
                            <form onSubmit={handleAuth} className="p-8 space-y-4">
                                {error && (
                                    <div className="p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                            Adresse e-mail
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="pl-10 w-full bg-neutral-50 dark:bg-neutral-800/50"
                                                placeholder="vous@exemple.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                            Mot de passe
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                                            <Input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="pl-10 w-full bg-neutral-50 dark:bg-neutral-800/50"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full mt-6 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : isSignUp ? (
                                        "S'inscrire"
                                    ) : (
                                        "Se connecter"
                                    )}
                                </Button>

                                <div className="mt-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                                        className="text-sm text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                                    >
                                        {isSignUp ? "Déjà un compte ? Connectez-vous" : "Pas de compte ? S'inscrire"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 text-center"
                        >
                            <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-widest font-medium">
                                Synchronisation sécurisée par Supabase
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
