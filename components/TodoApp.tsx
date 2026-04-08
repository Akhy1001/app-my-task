"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Switch, SwitchThumb, SwitchIcon } from "@/components/animate-ui/primitives/radix/switch";
import { Check, Moon, Sun } from "lucide-react";
import { Flag } from "@/components/animate-ui/icons/flag";
import { Clock } from "@/components/animate-ui/icons/clock";
import { Plus } from "@/components/animate-ui/icons/plus";
import { Calendar } from "@/components/animate-ui/icons/calendar";
import { Search } from "@/components/animate-ui/icons/search";
import { ArrowUpDown } from "@/components/animate-ui/icons/arrow-up-down";
import { BarChart2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Progress, ProgressLabel, ProgressTrack } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import TodoItem, { Todo } from "./TodoItem";
import SplashScreen from "./SplashScreen";
import TrackerScore from "./TrackerScore";

type Priority = "low" | "medium" | "high";
type SortOption = "default" | "date" | "priority";

const PRIORITY_COLORS = {
    low: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    medium: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    high: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
};

const PRIORITY_LABELS = {
    low: "Basse",
    medium: "Moyenne",
    high: "Haute",
};

const PRIORITY_VALUES = {
    high: 3,
    medium: 2,
    low: 1,
};

interface TodoAppProps {
    user: 'anas' | 'rose';
    onLogout: () => void;
}

export default function TodoApp({ user, onLogout }: TodoAppProps) {
    const [todos, setTodos] = useState<Todo[]>([]);
    const lastChangeRef = useRef(0);
    const isSavingRef = useRef(false); // Prevents concurrent saves
    const hasSavedOnceRef = useRef(false); // True once a real save has been done

    const markLocalChange = useCallback(() => {
        lastChangeRef.current = Date.now();
    }, []);

    const setTodosWithSync = useCallback((updater: React.SetStateAction<Todo[]>) => {
        markLocalChange();
        setTodos(updater);
    }, [markLocalChange]);

    const { theme, setTheme: setRawTheme } = useTheme();

    const setTheme = useCallback((newTheme: string) => {
        markLocalChange();
        setRawTheme(newTheme);
    }, [markLocalChange, setRawTheme]);

    const [inputValue, setInputValue] = useState("");
    const [dateValue, setDateValue] = useState("");
    const [priorityValue, setPriorityValue] = useState<Priority | undefined>(undefined);
    const [horizonValue, setHorizonValue] = useState<'short' | 'long'>('short');
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    
    const [sortOption, setSortOptionRaw] = useState<SortOption>("default");
    const setSortOption = useCallback((newOption: SortOption | ((prev: SortOption) => SortOption)) => {
        markLocalChange();
        setSortOptionRaw(newOption);
    }, [markLocalChange]);

    const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const isLoadedRef = useRef(false); // Ref copy so autosave can read it without being in deps
    const [showSplash, setShowSplash] = useState(true);
    const [currentView, setCurrentView] = useState<'tasks' | 'tracker'>('tasks');

    const [editingComment, setEditingComment] = useState<{ todoId: string; index: number } | null>(null);
    
    // Reset state on user switch to prevent cross-account data leaks
    useEffect(() => {
        setTodos([]);
        setIsLoaded(false);
        isLoadedRef.current = false;
        lastChangeRef.current = 0;
        hasSavedOnceRef.current = false;
        isSavingRef.current = false;
    }, [user]);

    // Load data from Supabase on mount, then poll every 5s
    useEffect(() => {
        let cancelled = false;

        const loadData = async (silent = false) => {
            // Skip polling if there's a recent local change (user is actively editing)
            if (silent && Date.now() - lastChangeRef.current < 5000) return;

            let success = false;
            try {
                const response = await fetch(`/api/todos?user=${user}&t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });

                // If Supabase is down (503) or any error — do NOT touch todos, just bail
                if (!response.ok) {
                    console.warn(`[TodoApp] Load skipped — API returned ${response.status}`);
                    return;
                }
                if (cancelled) return;

                const data = await response.json();
                const newTodos: Todo[] = Array.isArray(data) ? data : (data.todos || []);
                const newSettings = Array.isArray(data) ? {} : (data.settings || {});

                if (cancelled) return;

                // Skip overwriting if there's a recent local change
                if (Date.now() - lastChangeRef.current < 5000) {
                    success = true; // Still counts as a successful load for the finally block
                    return;
                }

                setTodos(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(newTodos)) return prev;
                    return newTodos;
                });

                if (newSettings.theme) setRawTheme(newSettings.theme);
                if (newSettings.sortOption) setSortOptionRaw(newSettings.sortOption);

                success = true;

            } catch (error) {
                console.warn('[TodoApp] Load failed (network error):', error);
            } finally {
                // Only mark as loaded after a REAL successful response.
                // If Supabase timed out, we keep retrying — don't show empty UI.
                if (!silent && !cancelled && success) {
                    isLoadedRef.current = true;
                    setIsLoaded(true);
                    setTimeout(() => { if (!cancelled) setShowSplash(false); }, 2000);
                }
            }
        };

        loadData(false);
        // Retry every 2s if not yet loaded, otherwise poll every 5s
        const interval = setInterval(() => {
            if (!isLoadedRef.current) {
                loadData(false); // Keep retrying initial load
            } else {
                loadData(true);  // Normal polling
            }
        }, 2000);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [user]);


    // Save data — only triggered when lastChangeRef is set (i.e. by real user actions)
    useEffect(() => {
        // NEVER save if: not loaded, no user action happened, or in initial zero-state
        if (!isLoadedRef.current) return;
        if (lastChangeRef.current === 0) return;
        // CRITICAL: never save an empty todos list unless user has already done at least one successful save
        // This prevents mounting race conditions from wiping Supabase data
        if (todos.length === 0 && !hasSavedOnceRef.current) {
            console.warn('[TodoApp] Blocked save of empty todos — hasSavedOnce is false, skipping.');
            return;
        }

        const capturedTodos = todos; // Already a stable React state snapshot
        const capturedUser = user;
        const capturedTheme = theme;
        const capturedSort = sortOption;

        const saveData = async () => {
            if (capturedUser !== user) return; // User switched during debounce
            if (!isLoadedRef.current) return;
            if (isSavingRef.current) return;

            isSavingRef.current = true;
            try {
                const res = await fetch(`/api/todos?user=${capturedUser}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ todos: capturedTodos, settings: { theme: capturedTheme, sortOption: capturedSort } }),
                });
                if (res.ok) {
                    hasSavedOnceRef.current = true;
                } else {
                    // Use warn (not error) to avoid the browser red overlay
                    const text = await res.text().catch(() => 'unknown');
                    console.warn('[TodoApp] Save failed (will retry on next change):', text);
                }
            } catch (error) {
                // Network issues (e.g. Supabase timeout) — warn only, no error overlay
                console.warn('[TodoApp] Save network error (will retry on next change):', error);
            } finally {
                isSavingRef.current = false;
            }
        };

        const timer = setTimeout(saveData, 800);
        return () => clearTimeout(timer);
    }, [todos, theme, sortOption, user]);


    const addTodo = useCallback(() => {
        if (inputValue.trim() === "") return;
        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text: inputValue,
            completed: false,
            date: dateValue,
            priority: priorityValue,
            comments: [],
            horizon: horizonValue,
        };
        setTodosWithSync((prev) => [newTodo, ...prev]);
        setInputValue("");
        setDateValue("");
        setPriorityValue(undefined);
        setHorizonValue('short'); // Reset to default
    }, [inputValue, dateValue, priorityValue, horizonValue, markLocalChange]);

    const toggleTodo = useCallback((id: string) => {
        setTodosWithSync((prev) =>
            prev.map((todo) => {
                if (todo.id === id) {
                    // Prevent toggling if there are incomplete comments
                    const hasIncompleteComments = todo.comments?.some(c => !c.isCompleted);
                    if (hasIncompleteComments && !todo.completed) {
                        return todo;
                    }
                    
                    const newCompleted = !todo.completed;
                    
                    // Auto-archive after 1.5s if marked as completed
                    if (newCompleted) {
                        setTimeout(() => {
                            setTodosWithSync(current => 
                                current.map(t => 
                                    (t.id === id && t.completed) ? { ...t, archived: true } : t
                                )
                            );
                        }, 1500);
                    }
                    
                    return { ...todo, completed: newCompleted };
                }
                return todo;
            })
        );
    }, [setTodosWithSync]);

    const deleteTodo = useCallback((id: string) => {
        setTodosWithSync((prev) => prev.filter((todo) => todo.id !== id));
        setExpandedTodoId((prev) => (prev === id ? null : prev));
    }, [setTodosWithSync]);

    const addComment = useCallback((id: string, commentText: string, date?: string) => {
        setTodosWithSync((prev) =>
            prev.map((todo) =>
                todo.id === id
                    ? {
                        ...todo,
                        comments: [
                            ...(todo.comments || []),
                            { id: crypto.randomUUID(), text: commentText, isCompleted: false, date }
                        ]
                    }
                    : todo
            )
        );
    }, [setTodosWithSync]);

    const toggleComment = useCallback((todoId: string, commentId: string) => {
        setTodosWithSync((prev) =>
            prev.map((todo) => {
                if (todo.id === todoId) {
                    return {
                        ...todo,
                        comments: todo.comments?.map(c =>
                            c.id === commentId ? { ...c, isCompleted: !c.isCompleted } : c
                        )
                    };
                }
                return todo;
            })
        );
    }, []);

    const deleteComment = useCallback((todoId: string, commentId: string) => {
        setTodosWithSync((prev) =>
            prev.map((todo) => {
                if (todo.id === todoId) {
                    return {
                        ...todo,
                        comments: todo.comments?.filter(c => c.id !== commentId)
                    };
                }
                return todo;
            })
        );
    }, []);

    const startEditingComment = useCallback((todoId: string, index: number) => {
        setEditingComment({ todoId, index });
    }, []);

    const saveEditComment = useCallback((todoId: string, index: number, text: string) => {
        setTodosWithSync((prev) => prev.map(todo => {
            if (todo.id === todoId) {
                const newComments = [...(todo.comments || [])];
                // Handle both new Comment objects and legacy strings just in case, though migration should handle it
                const comment = newComments[index];
                if (typeof comment === 'object') {
                    newComments[index] = { ...comment, text };
                } else {
                    // Fallback for strict typing if types get confused, though logic implies object
                    newComments[index] = { id: crypto.randomUUID(), text, isCompleted: false };
                }
                return { ...todo, comments: newComments };
            }
            return todo;
        }));
        setEditingComment(null);
    }, []);

    const cancelEditComment = useCallback(() => {
        setEditingComment(null);
    }, []);

    const toggleComments = useCallback((id: string) => {
        setExpandedTodoId((prev) => {
            if (prev === id) {
                setEditingComment(null);
                return null;
            }
            return id;
        });
        setEditingComment(null);
    }, []);

    const moveToHorizon = useCallback((id: string, horizon: 'short' | 'long') => {
        setTodosWithSync((prev) =>
            prev.map((todo) =>
                todo.id === id ? { ...todo, horizon } : todo
            )
        );
    }, [setTodosWithSync]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            addTodo();
        }
    };

    const sortedTodos = useMemo(() => {
        const filtered = todos.filter((todo) =>
            !todo.archived && todo.text.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filtered.sort((a, b) => {
            if (sortOption === "date") {
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            }
            if (sortOption === "priority") {
                const priorityA = a.priority ? PRIORITY_VALUES[a.priority] : 0;
                const priorityB = b.priority ? PRIORITY_VALUES[b.priority] : 0;
                return priorityB - priorityA;
            }
            return 0;
        });
    }, [todos, searchQuery, sortOption]);

    const shortTermTodos = useMemo(() => sortedTodos.filter(t => t.horizon !== 'long'), [sortedTodos]);
    const longTermTodos = useMemo(() => sortedTodos.filter(t => t.horizon === 'long'), [sortedTodos]);

    const completedCount = todos.filter(t => t.completed).length;
    const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

    // Prevent hydration mismatch by rendering null until loaded
    if (!isLoaded) {
        return <SplashScreen />;
    }

    return (
        <>
            <AnimatePresence>
                {showSplash && <SplashScreen />}
            </AnimatePresence>
            <div className={cn("w-[96%] mx-auto rounded-2xl shadow-xl overflow-hidden border transition-all duration-300 h-[90vh] flex flex-col my-[5vh]", user === 'rose' ? "bg-[#FDF2F5] dark:bg-[#2A1D1F] border-pink-100 dark:border-pink-900" : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800")}>
                <div className={cn("p-6 border-b shrink-0", user === 'rose' ? "bg-[#FDF2F5] dark:bg-[#2A1D1F] border-pink-100 dark:border-pink-900" : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800")}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Task</h1>
                        <span className={cn(
                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-2 border",
                            user === 'anas' 
                                ? "bg-blue-50 text-blue-500 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800" 
                                : "bg-pink-50 text-pink-500 border-pink-100 dark:bg-pink-900/20 dark:border-pink-800"
                        )}>
                            {user}
                        </span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onLogout}
                            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white mr-2"
                        >
                            Déconnexion
                        </Button>
                        <div className="flex items-center mr-1">
                            <Switch checked={theme === 'dark'} onCheckedChange={(checked: boolean) => setTheme(checked ? 'dark' : 'light')} className="h-8 w-14 bg-neutral-200 dark:bg-neutral-800 border overflow-hidden border-neutral-200 dark:border-neutral-700 relative flex items-center p-1 cursor-pointer rounded-full [&[data-state=checked]]:justify-end [&[data-state=unchecked]]:justify-start">
                                <SwitchThumb className="h-6 w-6 bg-white dark:bg-black rounded-full shadow-sm border border-neutral-200 dark:border-neutral-700 z-10 flex items-center justify-center">
                                    <SwitchIcon position="thumb" className="flex items-center justify-center h-full w-full text-neutral-900 dark:text-white">
                                        {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                                    </SwitchIcon>
                                </SwitchThumb>
                            </Switch>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className={cn(
                                        "p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                                        sortOption !== "default" ? (user === 'rose' ? "text-pink-500" : "text-blue-500") : "text-neutral-600 dark:text-neutral-400"
                                    )}
                                >
                                    <ArrowUpDown animateOnHover size={20} />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-40 p-1" align="end">
                                <div className="flex flex-col">
                                    <button
                                        onClick={() => setSortOption("default")}
                                        className={cn(
                                            "text-sm text-left px-3 py-2 rounded-md transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                            sortOption === "default" && (user === 'rose' ? "bg-pink-50 text-pink-600 font-medium" : "bg-neutral-100 dark:bg-neutral-800 font-medium")
                                        )}
                                    >
                                        Par défaut
                                    </button>
                                    <button
                                        onClick={() => setSortOption("priority")}
                                        className={cn(
                                            "text-sm text-left px-3 py-2 rounded-md transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                            sortOption === "priority" && (user === 'rose' ? "bg-pink-50 text-pink-600 font-medium" : "bg-neutral-100 dark:bg-neutral-800 font-medium")
                                        )}
                                    >
                                        Par priorité
                                    </button>
                                    <button
                                        onClick={() => setSortOption("date")}
                                        className={cn(
                                            "text-sm text-left px-3 py-2 rounded-md transition-colors",
                                            sortOption === "date" 
                                                ? (user === 'rose' ? "bg-pink-50 text-pink-600 font-medium" : "bg-neutral-100 dark:bg-neutral-800 font-medium")
                                                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        )}
                                    >
                                        Par date
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <button
                            onClick={() => setIsSearchVisible(!isSearchVisible)}
                            className={cn("p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors", isSearchVisible ? (user === 'rose' ? "text-pink-500 bg-pink-50 dark:bg-pink-900/20" : "text-blue-500 bg-blue-50 dark:bg-blue-900/20") : "text-neutral-600 dark:text-neutral-400")}
                        >
                            <Search animateOnHover size={20} />
                        </button>
                        <button
                            onClick={() => setCurrentView(prev => prev === 'tasks' ? 'tracker' : 'tasks')}
                            className={cn(
                                "p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                                currentView === 'tracker' ? (user === 'rose' ? "text-pink-500 bg-pink-50 dark:bg-pink-900/20" : "text-blue-500 bg-blue-50 dark:bg-blue-900/20") : "text-neutral-600 dark:text-neutral-400"
                            )}
                        >
                            <BarChart2 size={20} />
                        </button>
                    </div>
                </div>



                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                    {currentView === 'tracker' ? "Vos statistiques de productivité" : "Restez organisé et productif."}
                </p>

                <AnimatePresence>
                    {isSearchVisible && currentView === 'tasks' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="overflow-hidden p-1"
                        >
                            <Input
                                type="text"
                                placeholder="Rechercher une tâche..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn("w-full transition-colors", user === 'rose' ? "border-pink-200 focus-visible:ring-pink-300" : "bg-neutral-50 dark:bg-neutral-800/50 border-transparent focus:bg-white dark:focus:bg-neutral-900")}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-4 space-y-4 flex-1 flex flex-col min-h-0">
                <AnimatePresence>
                    {currentView === 'tasks' && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex flex-col gap-2 shrink-0 overflow-hidden"
                        >
                            <div className="flex gap-2">
                        <Input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ajouter une nouvelle tâche..."
                            onKeyDown={handleKeyDown}
                            className={cn("flex-1 bg-white", user === 'rose' && "border-pink-200 focus-visible:ring-pink-300")}
                        />
                        <Button onClick={addTodo} size="icon" className={user === 'rose' ? "bg-white text-neutral-900 hover:bg-neutral-50 border border-pink-200 shadow-sm dark:bg-[#2A1D1F] dark:text-white dark:border-pink-900" : ""}>
                            <Plus animateOnHover size={20} />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className={cn(
                                        "transition-colors", 
                                        dateValue ? (user === 'rose' ? "text-pink-500 border-pink-200 bg-pink-50" : "text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800") : "text-neutral-400"
                                    )}
                                >
                                    <Calendar animateOnHover size={20} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <div className="p-4">
                                    <label className="text-sm font-medium mb-2 block">Définir une date d&apos;échéance</label>
                                    <Input
                                        type="date"
                                        value={dateValue}
                                        onChange={(e) => setDateValue(e.target.value)}
                                        className="w-full text-neutral-500 dark:text-neutral-400"
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className={cn("transition-colors", priorityValue ? PRIORITY_COLORS[priorityValue] : "text-neutral-400")}>
                                    <Flag animateOnHover size={20} className={cn(priorityValue && "fill-current")} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2" align="start">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-neutral-500 px-2 py-1">Priorité</span>
                                    {(["low", "medium", "high"] as Priority[]).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPriorityValue(p)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                                priorityValue === p && "bg-neutral-100 dark:bg-neutral-800"
                                            )}
                                        >
                                            <Flag size={14} className={cn(PRIORITY_COLORS[p], "fill-current")} />
                                            <span>{PRIORITY_LABELS[p]}</span>
                                            {priorityValue === p && <Check size={14} className={cn("ml-auto", user === 'rose' ? "text-pink-500" : "text-neutral-400")} />}
                                        </button>
                                    ))}
                                    {priorityValue && (
                                        <button
                                            onClick={() => setPriorityValue(undefined)}
                                            className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 px-3 py-1.5 mt-1 border-t border-neutral-100 dark:border-neutral-800"
                                        >
                                            Effacer la priorité
                                        </button>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className={cn("transition-colors", horizonValue === 'long' ? "text-purple-500 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800" : "text-neutral-400")}>
                                    <Clock animateOnHover size={20} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2" align="start">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-neutral-500 px-2 py-1">Horizon</span>
                                    <button
                                        onClick={() => setHorizonValue('short')}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                            horizonValue === 'short' && "bg-neutral-100 dark:bg-neutral-800"
                                        )}
                                    >
                                        <span>Court Terme</span>
                                        {horizonValue === 'short' && <Check size={14} className="ml-auto text-neutral-400" />}
                                    </button>
                                    <button
                                        onClick={() => setHorizonValue('long')}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                            horizonValue === 'long' && "bg-neutral-100 dark:bg-neutral-800"
                                        )}
                                    >
                                        <span>Long Terme</span>
                                        {horizonValue === 'long' && <Check size={14} className="ml-auto text-neutral-400" />}
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </motion.div>
                )}
                </AnimatePresence>

                <div className={cn(
                    "flex-1 min-h-0 overflow-y-auto md:pr-1 pb-4 md:pb-0",
                    currentView === 'tasks' ? "flex flex-col md:grid md:grid-cols-2 gap-6" : "flex flex-col"
                )}>
                    <AnimatePresence mode="wait">
                        {currentView === 'tasks' && (
                            <>
                                {/* Short Term Column */}
                                <div className="flex flex-col gap-2 md:h-full md:overflow-hidden shrink-0">
                                    <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2 shrink-0">Court Terme</h3>
                                    <div className="md:overflow-y-auto flex-1 md:pr-2 space-y-2 pb-2">
                                        <AnimatePresence initial={false} mode="popLayout">
                                            {shortTermTodos.length === 0 ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className={cn("flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl", user === 'rose' ? "border-pink-200 dark:border-pink-800" : "border-neutral-100 dark:border-neutral-800")}
                                                >
                                                    <p className="text-neutral-400 dark:text-neutral-500 text-sm">Rien à l&apos;horizon</p>
                                                </motion.div>
                                            ) : (
                                                shortTermTodos.map((todo) => (
                                                    <TodoItem
                                                        key={todo.id}
                                                        todo={todo}
                                                        user={user}
                                                        toggleTodo={toggleTodo}
                                                        deleteTodo={deleteTodo}
                                                        addComment={addComment}
                                                        toggleComments={toggleComments}
                                                        toggleComment={toggleComment}
                                                        deleteComment={deleteComment}
                                                        isExpanded={expandedTodoId === todo.id}
                                                        editingComment={editingComment}
                                                        startEditingComment={startEditingComment}
                                                        saveEditComment={saveEditComment}
                                                        cancelEditComment={cancelEditComment}
                                                        onMoveToHorizon={moveToHorizon}
                                                    />
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Long Term Column */}
                                <div className="flex flex-col gap-2 md:h-full md:overflow-hidden shrink-0">
                                    <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2 text-left shrink-0">Long Terme</h3>
                                    <div className="md:overflow-y-auto flex-1 md:pr-2 space-y-2 pb-2">
                                        <AnimatePresence initial={false} mode="popLayout">
                                            {longTermTodos.length === 0 ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className={cn("flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl", user === 'rose' ? "border-pink-200 dark:border-pink-800" : "border-neutral-100 dark:border-neutral-800")}
                                                >
                                                    <p className="text-neutral-400 dark:text-neutral-500 text-sm">Tranquille pour le moment</p>
                                                </motion.div>
                                            ) : (
                                                longTermTodos.map((todo) => (
                                                    <TodoItem
                                                        key={todo.id}
                                                        todo={todo}
                                                        user={user}
                                                        toggleTodo={toggleTodo}
                                                        deleteTodo={deleteTodo}
                                                        addComment={addComment}
                                                        toggleComments={toggleComments}
                                                        toggleComment={toggleComment}
                                                        deleteComment={deleteComment}
                                                        isExpanded={expandedTodoId === todo.id}
                                                        editingComment={editingComment}
                                                        startEditingComment={startEditingComment}
                                                        saveEditComment={saveEditComment}
                                                        cancelEditComment={cancelEditComment}
                                                        onMoveToHorizon={moveToHorizon}
                                                    />
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </>
                        )}
                        {currentView === 'tracker' && (
                            <TrackerScore key="tracker" todos={todos} user={user} />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className={cn("p-4 border-t flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400", user === 'rose' ? "bg-[#FDF2F5] dark:bg-[#2A1D1F] border-pink-100 dark:border-pink-900/50" : "bg-neutral-50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800")}>
                <span>{todos.filter(t => !t.completed).length} tâches restantes</span>
                <div className="flex gap-2">
                    {todos.some(t => t.completed && !t.archived) && (
                        <button
                            onClick={() => setTodosWithSync(prev => prev.map(t => t.completed ? { ...t, archived: true } : t))}
                            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                            Effacer les terminées
                        </button>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}
