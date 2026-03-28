"use client";

import { useState, useEffect } from "react";
import TodoApp from "@/components/TodoApp";
import LoginPage from "@/components/LoginPage";

export default function Home() {
  const [user, setUser] = useState<'anas' | 'rose' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("my-task-user") as 'anas' | 'rose' | null;
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoaded(true);
  }, []);

  const handleLogin = (selectedUser: 'anas' | 'rose') => {
    setUser(selectedUser);
    localStorage.setItem("my-task-user", selectedUser);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("my-task-user");
  };

  if (!isLoaded) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="w-full h-full flex items-center justify-center">
        {user ? (
          <TodoApp user={user} onLogout={handleLogout} />
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </main>
    </div>
  );
}
