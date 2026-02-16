import { motion, AnimatePresence } from "motion/react";
import { Check, Pencil, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { Trash2 } from "@/components/animate-ui/icons/trash2";
import { MessageSquare } from "@/components/animate-ui/icons/message-square";
import { Send } from "@/components/animate-ui/icons/send";
import { Calendar } from "@/components/animate-ui/icons/calendar";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { memo, useRef, useEffect, useState } from "react";

type Priority = "low" | "medium" | "high";

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    date?: string;
    comments?: string[];
    priority?: Priority;
    horizon: 'short' | 'long';
}

interface TodoItemProps {
    todo: Todo;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
    addComment: (id: string, comment: string) => void;
    toggleComments: (id: string) => void;
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

const TodoItem = memo(function TodoItem({
    todo,
    toggleTodo,
    deleteTodo,
    addComment,
    toggleComments,
    isExpanded,
    editingComment,
    startEditingComment,
    saveEditComment,
    cancelEditComment,
    onMoveToHorizon,
}: TodoItemProps) {
    const [commentInput, setCommentInput] = useState("");
    const [editCommentText, setEditCommentText] = useState("");

    // Reset local state when edit mode changes
    useEffect(() => {
        if (editingComment?.todoId === todo.id) {
            // Logic handled by parent or local state depending on design.
            // In previous design, editCommentText was in parent.
            // To keep it simple and performant, we might want to keep some state local or pass it down.
            // The implementation plan said "Move item-specific state... to this component where possible"
            // But existing callbacks rely on parent state.
            // Let's adapt.
        }
    }, [editingComment, todo.id]);

    // Actually, for optimal performance and cleaner Architecture, handling input state locally for comments is better, 
    // but the edit state involves UI coordination (only one editing at a time).
    // Let's re-use the passed props for now to minimize refactor risk, 
    // but we need to handle the input values.

    // WAIT. Filtering `editCommentText` from parent props might be better to avoid prop drilling 
    // if we want full memoization benefits.
    // However, the prompt asked to "Extract and memoize".

    // Let's keep `editCommentText` local to the editing mode if possible?
    // The previous implementation had `editCommentText` in `TodoApp`. 
    // If I move it here, I need to make sure `saveEditComment` receives the new text.

    // Let's use local state for the input fields to avoid re-rendering the parent on every keystroke.

    const [localCommentInput, setLocalCommentInput] = useState("");
    const [localEditText, setLocalEditText] = useState("");

    useEffect(() => {
        if (editingComment?.todoId === todo.id) {
            // We need the text of the comment being edited. 
            // But we don't have it easily here unless passed or found.
            // Let's trust the parent triggers the startEditing with text, 
            // but here we need to Initialize localEditText.
            // ACTUALLY, simpler approach: Parent handles coordination, but we can pass `currentEditText` prop.
        }
    }, [editingComment, todo.id]);

    // To properly decouple:
    // 1. `toggleComments`: Expand/Collapse is UI state, could be local if only one item expanded isn't a strict requirement (it is in the code: `expandedTodoId`).
    // 2. `addComment`: Input is local.
    // 3. `editComment`: Input is local.

    // Let's refine the props.

    // ... Rethinking to match existing logic perfectly first, then optimize.
    // Existing logic has `editCommentText` in parent.
    // I should probably accept `currentEditText` if this item is being edited.

    // BUT, to optimize, typing in an input shouldn't re-render the list. 
    // So distinct local state for inputs is crucial.

    const handleAddComment = () => {
        if (localCommentInput.trim()) {
            addComment(todo.id, localCommentInput);
            setLocalCommentInput("");
        }
    };

    const handleStartEditing = (index: number, text: string) => {
        setLocalEditText(text);
        startEditingComment(todo.id, index, text);
    };

    const handleSaveEdit = (index: number) => {
        saveEditComment(todo.id, index, localEditText);
    };

    return (
        <motion.div
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

                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "text-sm font-medium transition-all break-words",
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
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(todo.date).toLocaleDateString("fr-FR")}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-1 shrink-0">
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
                            <ChevronLeft className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>
                    <button
                        onClick={() => toggleComments(todo.id)}
                        className={cn(
                            "p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                            isExpanded ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20" : "text-neutral-400 hover:text-blue-500"
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
                {isExpanded && (
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
                                                    <span className="flex-1 break-words">{comment}</span>
                                                    <button
                                                        onClick={() => handleStartEditing(index, comment)}
                                                        className="opacity-100 text-neutral-400 hover:text-blue-500 transition-opacity p-1"
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
                                    value={localCommentInput}
                                    onChange={(e) => setLocalCommentInput(e.target.value)}
                                    placeholder="Ajouter un commentaire..."
                                    className="flex-1 text-sm h-9"
                                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                                    autoFocus={!editingComment}
                                />
                                <Button onClick={handleAddComment} size="icon" className="h-9 w-9">
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
