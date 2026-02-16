"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Pencil, X, Flag } from "lucide-react";
import { Plus } from "@/components/animate-ui/icons/plus";
import { Trash2 } from "@/components/animate-ui/icons/trash2";
import { MessageSquare } from "@/components/animate-ui/icons/message-square";
import { Send } from "@/components/animate-ui/icons/send";
import { Calendar } from "@/components/animate-ui/icons/calendar";
import { Search } from "@/components/animate-ui/icons/search";
import { ArrowUpDown } from "@/components/animate-ui/icons/arrow-up-down";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Progress, ProgressLabel, ProgressTrack, ProgressValue } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Priority = "low" | "medium" | "high";
type SortOption = "default" | "date" | "priority";

interface Todo {
    id: string;
    text: string;
    completed: boolean;
    date?: string;
    comments?: string[];
    priority?: Priority;
}

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
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);
    const [commentInput, setCommentInput] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    // State for editing comments
    const [editingComment, setEditingComment] = useState<{ todoId: string; index: number } | null>(null);
    const [editCommentText, setEditCommentText] = useState("");

    // Load todos from localStorage on mount
    useEffect(() => {
        const savedTodos = localStorage.getItem("todos");
        if (savedTodos) {
            try {
                setTodos(JSON.parse(savedTodos));
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

    const addTodo = () => {
        if (inputValue.trim() === "") return;
        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text: inputValue,
            completed: false,
            date: dateValue,
            priority: priorityValue,
            comments: [],
        };
        setTodos([newTodo, ...todos]);
        setInputValue("");
        setDateValue("");
        setPriorityValue(undefined);
    };

    const toggleTodo = (id: string) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const deleteTodo = (id: string) => {
        setTodos(todos.filter((todo) => todo.id !== id));
        if (expandedTodoId === id) setExpandedTodoId(null);
    };

    const addComment = (id: string) => {
        if (commentInput.trim() === "") return;
        setTodos(
            todos.map((todo) =>
                todo.id === id
                    ? { ...todo, comments: [...(todo.comments || []), commentInput] }
                    : todo
            )
        );
        setCommentInput("");
    };

    const startEditingComment = (todoId: string, index: number, text: string) => {
        setEditingComment({ todoId, index });
        setEditCommentText(text);
    };

    const saveEditComment = () => {
        if (!editingComment || editCommentText.trim() === "") return;

        setTodos(todos.map(todo => {
            if (todo.id === editingComment.todoId) {
                const newComments = [...(todo.comments || [])];
                newComments[editingComment.index] = editCommentText;
                return { ...todo, comments: newComments };
            }
            return todo;
        }));
        setEditingComment(null);
        setEditCommentText("");
    };

    const cancelEditComment = () => {
        setEditingComment(null);
        setEditCommentText("");
    };

    const toggleComments = (id: string) => {
        if (expandedTodoId === id) {
            setExpandedTodoId(null);
            setEditingComment(null); // Close edit mode if closing comments
        } else {
            setExpandedTodoId(id);
            setCommentInput("");
            setEditingComment(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            addTodo();
        }
    };

    const filteredTodos = todos.filter((todo) =>
        todo.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedTodos = [...filteredTodos].sort((a, b) => {
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
        return 0; // Default order (insertion order, reversed by UI)
    });

    const completedCount = todos.filter(t => t.completed).length;
    const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

    // Prevent hydration mismatch by rendering null until loaded
    if (!isLoaded) {
        return null;
    }

    return (
        <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-neutral-100 dark:border-neutral-800">
            <div className="p-6 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Mes Tâches</h1>
                    <div className="flex gap-1">
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
                            className="overflow-hidden"
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

            <div className="p-4 space-y-4">
                <div className="flex flex-col gap-2">
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
                                    <Flag size={20} className={cn(priorityValue && "fill-current")} />
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
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-h-[300px]">
                    <AnimatePresence initial={false} mode="popLayout">
                        {sortedTodos.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                {todos.length === 0 ? (
                                    <>
                                        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                            <Check className="h-8 w-8 text-neutral-400" />
                                        </div>
                                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">Aucune tâche pour le moment</p>
                                        <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-1">Ajoutez une tâche pour commencer</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                            <Search size={32} className="text-neutral-400" />
                                        </div>
                                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">Aucune tâche correspondante</p>
                                        <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-1">Essayez un autre terme de recherche</p>
                                    </>
                                )}
                            </motion.div>
                        ) : (
                            sortedTodos.map((todo) => (
                                <motion.div
                                    key={todo.id}
                                    layout
                                    className={cn(
                                        "group flex flex-col rounded-xl border transition-all duration-200 overflow-hidden",
                                        todo.completed
                                            ? "bg-neutral-50 border-transparent dark:bg-neutral-800/50"
                                            : "bg-white border-neutral-100 hover:border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3 p-3">
                                        <Checkbox
                                            checked={todo.completed}
                                            onCheckedChange={() => toggleTodo(todo.id)}
                                            className={cn(
                                                "transition-colors data-[state=checked]:!bg-green-500 data-[state=checked]:!border-green-500",
                                                todo.completed ? "!border-green-500" : "border-neutral-300 dark:border-neutral-600"
                                            )}
                                        />

                                        <div className="flex-1 flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        "text-sm font-medium transition-all",
                                                        todo.completed
                                                            ? "text-neutral-400 line-through decoration-neutral-400"
                                                            : "text-neutral-700 dark:text-neutral-200"
                                                    )}
                                                >
                                                    {todo.text}
                                                </span>
                                                {todo.priority && (
                                                    <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1", PRIORITY_COLORS[todo.priority])}>
                                                        <Flag size={10} className="fill-current" />
                                                        {PRIORITY_LABELS[todo.priority]}
                                                    </span>
                                                )}
                                            </div>
                                            {todo.date && (
                                                <div className="flex items-center gap-1 mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                                                    <Calendar animateOnHover className="h-3 w-3" />
                                                    <span>{new Date(todo.date).toLocaleDateString("fr-FR")}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => toggleComments(todo.id)}
                                                className={cn(
                                                    "p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                                                    expandedTodoId === todo.id ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20" : "text-neutral-400 hover:text-blue-500"
                                                )}
                                            >
                                                <MessageSquare animateOnHover className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteTodo(todo.id)}
                                                className="p-2 text-neutral-400 hover:text-red-500 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                            >
                                                <Trash2 animateOnHover className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedTodoId === todo.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800"
                                            >
                                                <div className="p-3 space-y-3">
                                                    {todo.comments && todo.comments.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {todo.comments.map((comment, index) => (
                                                                <li key={index} className="text-sm text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm group/comment flex justify-between items-start gap-2">
                                                                    {editingComment?.todoId === todo.id && editingComment?.index === index ? (
                                                                        <div className="flex-1 flex flex-col gap-2">
                                                                            <Input
                                                                                value={editCommentText}
                                                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                                                className="h-8 text-sm"
                                                                                autoFocus
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === "Enter") saveEditComment();
                                                                                    if (e.key === "Escape") cancelEditComment();
                                                                                }}
                                                                            />
                                                                            <div className="flex gap-2 justify-end">
                                                                                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={cancelEditComment}>Annuler</Button>
                                                                                <Button size="sm" className="h-6 px-2 text-xs" onClick={saveEditComment}>Enregistrer</Button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <span className="flex-1 break-words">{comment}</span>
                                                                            <button
                                                                                onClick={() => startEditingComment(todo.id, index, comment)}
                                                                                className="opacity-0 group-hover/comment:opacity-100 text-neutral-400 hover:text-blue-500 transition-opacity p-1"
                                                                            >
                                                                                <Pencil className="h-3 w-3" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-xs text-neutral-400 italic">Aucun commentaire pour le moment</p>
                                                    )}

                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={commentInput}
                                                            onChange={(e) => setCommentInput(e.target.value)}
                                                            placeholder="Ajouter un commentaire..."
                                                            className="flex-1 text-sm h-9"
                                                            onKeyDown={(e) => e.key === "Enter" && addComment(todo.id)}
                                                            // Auto-focus only if not editing to prevent stealing focus
                                                            autoFocus={!editingComment}
                                                        />
                                                        <Button onClick={() => addComment(todo.id)} size="icon" className="h-9 w-9">
                                                            <Send animateOnHover className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
                <span>{filteredTodos.filter(t => !t.completed).length} tâches restantes</span>
                <div className="flex gap-2">
                    {todos.some(t => t.completed) && (
                        <button
                            onClick={() => setTodos(todos.filter(t => !t.completed))}
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
