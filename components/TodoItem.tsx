import { motion, AnimatePresence } from 'motion/react';
import { Brush } from "@/components/animate-ui/icons/brush";
import { Flag } from "@/components/animate-ui/icons/flag";
import { ChevronLeft } from "@/components/animate-ui/icons/chevron-left";
import { ChevronRight } from "@/components/animate-ui/icons/chevron-right";
import { Trash2 } from "@/components/animate-ui/icons/trash2";
import { MessageSquare } from "@/components/animate-ui/icons/message-square";
import { Send } from "@/components/animate-ui/icons/send";
import { Calendar } from "@/components/animate-ui/icons/calendar";
import { ListTodo } from "lucide-react";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";

type Priority = "low" | "medium" | "high";

export interface Comment {
    id: string;
    text: string;
    isCompleted: boolean;
    date?: string;
}

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    date?: string;
    comments?: Comment[];
    priority?: Priority;
    horizon: 'short' | 'long';
}

interface TodoItemProps {
    todo: Todo;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
    addComment: (id: string, comment: string, date?: string) => void;
    toggleComments: (id: string) => void;
    toggleComment: (todoId: string, commentId: string) => void;
    deleteComment: (todoId: string, commentId: string) => void;
    isExpanded: boolean;
    editingComment: { todoId: string; index: number } | null;
    startEditingComment: (todoId: string, index: number, text: string) => void;
    saveEditComment: (todoId: string, index: number, text: string) => void;
    cancelEditComment: () => void;
    onMoveToHorizon: (id: string, horizon: 'short' | 'long') => void;
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

const getPathAnimate = (isCompleted: boolean) => ({
    pathLength: isCompleted ? 1 : 0,
    opacity: isCompleted ? 1 : 0,
});

const getPathTransition = (isCompleted: boolean) => ({
    pathLength: { duration: 0.5, ease: 'easeInOut' as const },
    opacity: { duration: 0.01, delay: isCompleted ? 0 : 0.5 },
});

const TodoItem = memo(function TodoItem({
    todo,
    toggleTodo,
    deleteTodo,
    addComment,
    toggleComments,
    toggleComment,
    deleteComment,
    isExpanded,
    editingComment,
    startEditingComment,
    saveEditComment,
    cancelEditComment,
    onMoveToHorizon,
}: TodoItemProps) {
    const [localCommentInput, setLocalCommentInput] = useState("");
    const [localCommentDate, setLocalCommentDate] = useState("");
    const [localEditText, setLocalEditText] = useState("");

    const hasIncompleteComments = todo.comments?.some(c => !c.isCompleted) ?? false;
    const isMainCheckboxDisabled = hasIncompleteComments && !todo.completed;

    useEffect(() => {
        if (editingComment?.todoId === todo.id) {
            // Logic handled by parent or local state depending on design.
        }
    }, [editingComment, todo.id]);

    const handleAddComment = () => {
        if (localCommentInput.trim()) {
            addComment(todo.id, localCommentInput, localCommentDate || undefined);
            setLocalCommentInput("");
            setLocalCommentDate("");
        }
    };

    const handleStartEditing = (index: number, text: string) => {
        setLocalEditText(text);
        startEditingComment(todo.id, index, text);
    };

    const handleSaveEdit = (index: number) => {
        saveEditComment(todo.id, index, localEditText);
    };

    const totalComments = todo.comments?.length || 0;
    const completedComments = todo.comments?.filter(c => c.isCompleted).length || 0;
    const progressPercentage = totalComments > 0 ? (completedComments / totalComments) * 100 : 0;

    return (
        <motion.div
            layout
            className={cn(
                "group flex flex-col rounded-xl border transition-colors duration-200 overflow-hidden",
                todo.completed
                    ? "bg-neutral-50 border-transparent dark:bg-neutral-800/50"
                    : "bg-white border-neutral-100 hover:border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700"
            )}
        >
            <div className="flex items-start sm:items-center gap-3 p-3">
                <div className="mt-0.5 sm:mt-0" title={isMainCheckboxDisabled ? "Validez toutes les sous-tâches d'abord" : undefined}>
                    <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => !isMainCheckboxDisabled && toggleTodo(todo.id)}
                        disabled={isMainCheckboxDisabled}
                        className={cn(
                            "transition-colors data-[state=checked]:!bg-green-500 data-[state=checked]:!border-green-500",
                            todo.completed ? "!border-green-500" : "border-neutral-300 dark:border-neutral-600",
                            isMainCheckboxDisabled && "opacity-50 cursor-not-allowed"
                        )}
                    />
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative max-w-full">
                            <span
                                className={cn(
                                    "text-sm font-medium transition-all break-words relative z-10",
                                    todo.completed
                                        ? "text-neutral-400"
                                        : "text-neutral-700 dark:text-neutral-200"
                                )}
                            >
                                {todo.text}
                            </span>
                            <motion.svg
                                viewBox="0 0 340 32"
                                className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-20 w-full h-[80%]"
                                preserveAspectRatio="none"
                            >
                                <motion.path
                                    d="M 10 16.91 s 79.8 -11.36 98.1 -11.34 c 22.2 0.02 -47.82 14.25 -33.39 22.02 c 12.61 6.77 124.18 -27.98 133.31 -17.28 c 7.52 8.38 -26.8 20.02 4.61 22.05 c 24.55 1.93 113.37 -20.36 113.37 -20.36"
                                    vectorEffect="non-scaling-stroke"
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    strokeMiterlimit={10}
                                    fill="none"
                                    initial={false}
                                    animate={getPathAnimate(todo.completed)}
                                    transition={getPathTransition(todo.completed)}
                                    className="stroke-neutral-400/80 dark:stroke-neutral-500/80"
                                />
                            </motion.svg>
                        </div>
                        {todo.priority && (
                            <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1", PRIORITY_COLORS[todo.priority])}>
                                <Flag size={10} className="fill-current" />
                                {PRIORITY_LABELS[todo.priority]}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {todo.date && (
                            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/50 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-700">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span className="truncate">{new Date(todo.date).toLocaleDateString("fr-FR")}</span>
                            </div>
                        )}
                        {totalComments > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/50 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-700">
                                <ListTodo className="h-3 w-3 shrink-0 text-neutral-400" />
                                <div className="w-10 sm:w-12 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden shrink-0">
                                    <motion.div 
                                        className="h-full bg-blue-500 rounded-full" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    />
                                </div>
                                <span className="font-medium shrink-0">{completedComments}/{totalComments}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 -mr-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMoveToHorizon(todo.id, todo.horizon === 'long' ? 'short' : 'long');
                        }}
                        className={cn(
                            "p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-purple-500",
                        )}
                        title={todo.horizon === 'long' ? "Passer à court terme" : "Passer à long terme"}
                    >
                        {todo.horizon === 'long' ? (
                            <ChevronLeft animateOnHover className="h-4 w-4" />
                        ) : (
                            <ChevronRight animateOnHover className="h-4 w-4" />
                        )}
                    </button>
                    <button
                        onClick={() => toggleComments(todo.id)}
                        className={cn(
                            "p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                            isExpanded ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20" : "text-neutral-400 hover:text-blue-500"
                        )}
                    >
                        <div className="relative">
                            <ListTodo className="h-4 w-4 transition-transform group-hover:scale-110" />
                            {hasIncompleteComments && !todo.completed && (
                                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500" />
                            )}
                        </div>
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
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 overflow-hidden"
                    >
                        <div className="p-3 space-y-3">
                            {todo.comments && todo.comments.length > 0 ? (
                                <ul className="space-y-2">
                                    <AnimatePresence initial={false}>
                                        {todo.comments.map((comment, index) => (
                                            <motion.li 
                                                key={comment.id} 
                                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-sm text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm group/comment flex items-start gap-3 overflow-hidden"
                                            >
                                                <Checkbox
                                                    checked={comment.isCompleted}
                                                onCheckedChange={() => toggleComment(todo.id, comment.id)}
                                                className={cn(
                                                    "mt-0.5 transition-colors data-[state=checked]:!bg-green-500 data-[state=checked]:!border-green-500",
                                                    comment.isCompleted ? "!border-green-500" : "border-neutral-300 dark:border-neutral-600"
                                                )}
                                            />
                                            {editingComment?.todoId === todo.id && editingComment?.index === index ? (
                                                <div className="flex-1 flex flex-col gap-2">
                                                    <Input
                                                        value={localEditText}
                                                        onChange={(e) => setLocalEditText(e.target.value)}
                                                        className="h-8 text-sm"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleSaveEdit(index);
                                                            if (e.key === "Escape") cancelEditComment();
                                                        }}
                                                    />
                                                    <div className="flex gap-2 justify-end">
                                                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={cancelEditComment}>Annuler</Button>
                                                        <Button size="sm" className="h-6 px-2 text-xs" onClick={() => handleSaveEdit(index)}>Enregistrer</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="relative inline-block max-w-full">
                                                            <span className={cn("block break-words transition-all relative z-10", comment.isCompleted ? "text-neutral-400" : "text-neutral-700 dark:text-neutral-200")}>{comment.text}</span>
                                                            <motion.svg
                                                                viewBox="0 0 340 32"
                                                                className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-20 w-full h-[80%]"
                                                                preserveAspectRatio="none"
                                                            >
                                                                <motion.path
                                                                    d="M 10 16.91 s 79.8 -11.36 98.1 -11.34 c 22.2 0.02 -47.82 14.25 -33.39 22.02 c 12.61 6.77 124.18 -27.98 133.31 -17.28 c 7.52 8.38 -26.8 20.02 4.61 22.05 c 24.55 1.93 113.37 -20.36 113.37 -20.36"
                                                                    vectorEffect="non-scaling-stroke"
                                                                    strokeWidth={3}
                                                                    strokeLinecap="round"
                                                                    strokeMiterlimit={10}
                                                                    fill="none"
                                                                    initial={false}
                                                                    animate={getPathAnimate(comment.isCompleted)}
                                                                    transition={getPathTransition(comment.isCompleted)}
                                                                    className="stroke-neutral-400/80 dark:stroke-neutral-500/80"
                                                                />
                                                            </motion.svg>
                                                        </div>
                                                        {comment.date && (
                                                            <div className="flex items-center gap-1 mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>{new Date(comment.date).toLocaleDateString("fr-FR")}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex shrink-0">
                                                        <button
                                                            onClick={() => handleStartEditing(index, comment.text)}
                                                            className="opacity-100 text-neutral-400 hover:text-blue-500 transition-opacity p-1"
                                                            title="Modifier la sous-tâche"
                                                        >
                                                            <Brush animateOnHover className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteComment(todo.id, comment.id)}
                                                            className="opacity-100 text-neutral-400 hover:text-red-500 transition-opacity p-1"
                                                            title="Supprimer la sous-tâche"
                                                        >
                                                            <Trash2 animateOnHover className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                </ul>
                            ) : (
                                <p className="text-xs text-neutral-400 italic">Aucune sous-tâche pour le moment</p>
                            )}

                            <div className="flex gap-2">
                                <Input
                                    value={localCommentInput}
                                    onChange={(e) => setLocalCommentInput(e.target.value)}
                                    placeholder="Ajouter une sous-tâche..."
                                    className="flex-1 text-sm h-9"
                                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                                    autoFocus={!editingComment}
                                />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="icon" className={cn("h-9 w-9 shrink-0 transition-colors", localCommentDate ? "text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800" : "text-neutral-400")}>
                                            <Calendar animateOnHover className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <div className="p-4">
                                            <label className="text-sm font-medium mb-2 block">Définir une date d&apos;échéance</label>
                                            <Input
                                                type="date"
                                                value={localCommentDate}
                                                onChange={(e) => setLocalCommentDate(e.target.value)}
                                                className="w-full text-neutral-500 dark:text-neutral-400"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddComment();
                                                        // Note: We don't manually close the popover here as standard behavior usually requires user dismissal, but clicking outside or pressing Escape handles it.
                                                    }
                                                }}
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <Button onClick={handleAddComment} size="icon" className="h-9 w-9 shrink-0">
                                    <Send animateOnHover className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

export default TodoItem;
