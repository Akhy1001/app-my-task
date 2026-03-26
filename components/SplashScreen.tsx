"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function SplashScreen() {
  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-black z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="relative flex flex-col items-center">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-neutral-400/20 dark:bg-neutral-600/10 blur-3xl rounded-full" />
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 1 
          }}
          className="relative bg-white dark:bg-neutral-900 p-4 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 mb-8"
        >
          <div className="bg-black dark:bg-white text-white dark:text-black p-4 rounded-2xl flex items-center justify-center shadow-inner">
            <Check size={40} strokeWidth={3} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-3">
            My Task
          </h1>
          <motion.div 
            className="h-1.5 w-16 bg-black dark:bg-white mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ delay: 0.6, duration: 0.5, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-16 flex space-x-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="w-2.5 h-2.5 bg-neutral-800 dark:bg-neutral-200 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2.5 h-2.5 bg-neutral-800 dark:bg-neutral-200 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </motion.div>
    </motion.div>
  );
}
