"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { Switch, SwitchThumb, SwitchIcon } from "@/components/animate-ui/primitives/radix/switch";
import { Check, Moon, Sun } from "lucide-react";
import { Flag } from "@/components/animate-ui/icons/flag";
import { Clock } from "@/components/animate-ui/icons/clock";
import { Plus } from "@/components/animate-ui/icons/plus";
import { Calendar } from "@/components/animate-ui/icons/calendar";
import { Search } from "@/components/animate-ui/icons/search";
import { ArrowUpDown } from "@/components/animate-ui/icons/arrow-up-down";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Progress, ProgressLabel, ProgressTrack } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import TodoItem, { Todo } from "./TodoItem";

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

export default function TodoApp() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [dateValue, setDateValue] = useState("");
    const [priorityValue, setPriorityValue] = useState<Priority | undefined>(undefined);
    const [horizonValue, setHorizonValue] = useState<'short' | 'long'>('short');
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // State for editing comments - Coordination still in parent to ensure only one edit at a time
    const [editingComment, setEditingComment] = useState<{ todoId: string; index: number } | null>(null);

    // Load todos from localStorage on mount
    useEffect(() => {
        const savedTodos = localStorage.getItem("todos");
        if (savedTodos) {
            try {
                const parsed = JSON.parse(savedTodos);
                // Migration logic: Convert string[] comments to Comment[]
                const migratedTodos = parsed.map((t: any) => ({
                    ...t,
                    horizon: t.horizon || 'short',
                    comments: t.comments?.map((c: any) =>
                        typeof c === 'string'
                            ? { id: crypto.randomUUID(), text: c, isCompleted: false }
                            : c
                    ) || []
                }));
                setTodos(migratedTodos);
            } catch (error) {
                console.error("Failed to parse todos from localStorage:", error);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save todos to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("todos", JSON.stringify(todos));
        }
    }, [todos, isLoaded]);

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
        setTodos((prev) => [newTodo, ...prev]);
        setInputValue("");
        setDateValue("");
        setPriorityValue(undefined);
        setHorizonValue('short'); // Reset to default
    }, [inputValue, dateValue, priorityValue, horizonValue]);

    const toggleTodo = useCallback((id: string) => {
        setTodos((prev) =>
            prev.map((todo) => {
                if (todo.id === id) {
                    // Prevent toggling if there are incomplete comments
                    const hasIncompleteComments = todo.comments?.some(c => !c.isCompleted);
                    if (hasIncompleteComments && !todo.completed) {
                        return todo;
                    }
                    return { ...todo, completed: !todo.completed };
                }
                return todo;
            })
        );
    }, []);

    const deleteTodo = useCallback((id: string) => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
        setExpandedTodoId((prev) => (prev === id ? null : prev));
    }, []);

    const addComment = useCallback((id: string, commentText: string) => {
        setTodos((prev) =>
            prev.map((todo) =>
                todo.id === id
                    ? {
                        ...todo,
                        comments: [
                            ...(todo.comments || []),
                            { id: crypto.randomUUID(), text: commentText, isCompleted: false }
                        ]
                    }
                    : todo
            )
        );
    }, []);

    const toggleComment = useCallback((todoId: string, commentId: string) => {
        setTodos((prev) =>
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

    const startEditingComment = useCallback((todoId: string, index: number, text: string) => {
        setEditingComment({ todoId, index });
    }, []);

    const saveEditComment = useCallback((todoId: string, index: number, text: string) => {
        setTodos((prev) => prev.map(todo => {
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
        setTodos((prev) =>
            prev.map((todo) =>
                todo.id === id ? { ...todo, horizon } : todo
            )
        );
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            addTodo();
        }
    };

    const sortedTodos = useMemo(() => {
        const filtered = todos.filter((todo) =>
            todo.text.toLowerCase().includes(searchQuery.toLowerCase())
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

    const { theme, setTheme } = useTheme();

    // Prevent hydration mismatch by rendering null until loaded
    if (!isLoaded) {
        return null;
    }

    return (
        <div className="w-[98%] mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-neutral-100 dark:border-neutral-800 transition-all duration-300 h-[85vh] flex flex-col my-4">
            <div className="p-6 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Mes Tâches</h1>
                    <div className="flex gap-2 items-center">
                        <div className="flex items-center mr-1">
                            <Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} className="h-8 w-14 bg-neutral-200 dark:bg-neutral-800 border overflow-hidden border-neutral-200 dark:border-neutral-700 relative flex items-center p-1 cursor-pointer rounded-full [&[data-state=checked]]:justify-end [&[data-state=unchecked]]:justify-start">
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
                                        sortOption !== "default" ? "text-blue-500" : "text-neutral-600 dark:text-neutral-400"
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
                                            sortOption === "default" && "bg-neutral-100 dark:bg-neutral-800 font-medium"
                                        )}
                                    >
                                        Par défaut
                                    </button>
                                    <button
                                        onClick={() => setSortOption("priority")}
                                        className={cn(
                                            "text-sm text-left px-3 py-2 rounded-md transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                            sortOption === "priority" && "bg-neutral-100 dark:bg-neutral-800 font-medium"
                                        )}
                                    >
                                        Par priorité
                                    </button>
                                    <button
                                        onClick={() => setSortOption("date")}
                                        className={cn(
                                            "text-sm text-left px-3 py-2 rounded-md transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                            sortOption === "date" && "bg-neutral-100 dark:bg-neutral-800 font-medium"
                                        )}
                                    >
                                        Par date
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <button
                            onClick={() => setIsSearchVisible(!isSearchVisible)}
                            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                        >
                            <Search animateOnHover size={20} />
                        </button>
                    </div>
                </div>

                <Progress value={completedCount} max={todos.length} className="mb-4">
                    <ProgressLabel>
                        <span>Progression</span>
                        <span className="text-neutral-500 text-xs">{Math.round(progress)}%</span>
                    </ProgressLabel>
                    <ProgressTrack />
                </Progress>

                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Restez organisé et productif.</p>

                <AnimatePresence>
                    {isSearchVisible && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="overflow-hidden p-1"
                        >
                            <Input
                                type="text"
                                placeholder="Rechercher des tâches..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-800/50 border-transparent focus:bg-white dark:focus:bg-neutral-900 transition-colors"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-4 space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex flex-col gap-2 shrink-0">
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Ajouter une nouvelle tâche..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1"
                        />
                        <Button onClick={addTodo} size="icon">
                            <Plus animateOnHover size={20} />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className={cn("transition-colors", dateValue ? "text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800" : "text-neutral-400")}>
                                    <Calendar animateOnHover size={20} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <div className="p-4">
                                    <label className="text-sm font-medium mb-2 block">Définir une date d'échéance</label>
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
                                            {priorityValue === p && <Check size={14} className="ml-auto text-neutral-400" />}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 overflow-hidden">
                    {/* Short Term Column */}
                    <div className="flex flex-col gap-2 h-full overflow-hidden">
                        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2 shrink-0">Court Terme</h3>
                        <div className="overflow-y-auto flex-1 pr-2 space-y-2 pb-2">
                            <AnimatePresence initial={false} mode="popLayout">
                                {shortTermTodos.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-xl"
                                    >
                                        <p className="text-neutral-400 dark:text-neutral-500 text-sm">Rien à l'horizon</p>
                                    </motion.div>
                                ) : (
                                    shortTermTodos.map((todo) => (
                                        <TodoItem
                                            key={todo.id}
                                            todo={todo}
                                            toggleTodo={toggleTodo}
                                            deleteTodo={deleteTodo}
                                            addComment={addComment}
                                            toggleComments={toggleComments}
                                            toggleComment={toggleComment}
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
                    <div className="flex flex-col gap-2 h-full overflow-hidden">
                        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2 text-right md:text-left shrink-0">Long Terme</h3>
                        <div className="overflow-y-auto flex-1 pr-2 space-y-2 pb-2">
                            <AnimatePresence initial={false} mode="popLayout">
                                {longTermTodos.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-xl"
                                    >
                                        <p className="text-neutral-400 dark:text-neutral-500 text-sm">Tranquille pour le moment</p>
                                    </motion.div>
                                ) : (
                                    longTermTodos.map((todo) => (
                                        <TodoItem
                                            key={todo.id}
                                            todo={todo}
                                            toggleTodo={toggleTodo}
                                            deleteTodo={deleteTodo}
                                            addComment={addComment}
                                            toggleComments={toggleComments}
                                            toggleComment={toggleComment}
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
                </div>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
                <span>{todos.filter(t => !t.completed).length} tâches restantes</span>
                <div className="flex gap-2">
                    {todos.some(t => t.completed) && (
                        <button
                            onClick={() => setTodos(prev => prev.filter(t => !t.completed))}
                            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                            Effacer les terminées
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
}
