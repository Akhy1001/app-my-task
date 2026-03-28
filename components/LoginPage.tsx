"use client";

import { motion } from "framer-motion";
import { User, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LoginPageProps {
    onLogin: (user: 'anas' | 'rose') => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa] dark:bg-[#050505] p-4 font-sans">
            <div className="max-w-md w-full">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
                        My Task
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Choisissez votre espace pour commencer.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <button
                            onClick={() => onLogin('anas')}
                            className="w-full group relative flex flex-col items-center p-8 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                <User className="h-8 w-8 text-blue-500" />
                            </div>
                            <span className="text-xl font-semibold text-neutral-900 dark:text-white">Anas</span>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Espace personnel</span>
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <button
                            onClick={() => onLogin('rose')}
                            className="w-full group relative flex flex-col items-center p-8 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-rose-500/50 dark:hover:border-rose-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                <Heart className="h-8 w-8 text-rose-500" />
                            </div>
                            <span className="text-xl font-semibold text-neutral-900 dark:text-white">Rose</span>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Espace personnel</span>
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 text-center"
                >
                    <p className="text-xs text-neutral-400 dark:text-neutral-600 uppercase tracking-widest font-medium">
                        Synchronisation sécurisée activée
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
