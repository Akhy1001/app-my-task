"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Todo } from './TodoItem';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ActivityCalendarProps {
    todos: Todo[];
    user: 'anas' | 'rose';
}

export default function ActivityCalendar({ todos, user }: ActivityCalendarProps) {
    const isRose = user === 'rose';

    // Configuration des couleurs selon l'utilisateur
    const colorScale = useMemo(() => {
        if (isRose) {
            return [
                'bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100/20 dark:border-pink-900/20', // 0
                'bg-pink-200/60 dark:bg-pink-900/40',      // 1-2
                'bg-pink-400/80 dark:bg-pink-700/60',      // 3-4
                'bg-pink-500 dark:bg-pink-500',           // 5+
            ];
        }
        return [
            'bg-neutral-100/50 dark:bg-neutral-800/30 border border-neutral-200/20 dark:border-neutral-700/20', // 0
            'bg-blue-200/60 dark:bg-blue-900/40',      // 1-2
            'bg-blue-400/80 dark:bg-blue-700/60',      // 3-4
            'bg-blue-600 dark:bg-blue-500',            // 5+
        ];
    }, [isRose]);

    const getLevel = (count: number) => {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        return 3;
    };

    // Générer les données pour l'année écoulée
    const calendarData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Aller au dimanche de la semaine d'il y a 52 semaines pour avoir des colonnes complètes
        const endDate = new Date(today);
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 364);
        // Ajuster pour commencer un lundi (index 1)
        const startDay = startDate.getDay() || 7;
        startDate.setDate(startDate.getDate() - (startDay - 1));

        const days = [];
        const current = new Date(startDate);
        
        // Grouper les todos par date
        const activityMap: Record<string, number> = {};
        todos.forEach(todo => {
            if (todo.completed && todo.date) {
                activityMap[todo.date] = (activityMap[todo.date] || 0) + 1;
            }
        });

        while (current <= endDate) {
            const dateStr = current.toLocaleDateString('en-CA'); // YYYY-MM-DD
            days.push({
                date: new Date(current),
                dateStr,
                count: activityMap[dateStr] || 0
            });
            current.setDate(current.getDate() + 1);
        }

        return days;
    }, [todos]);

    // Grouper par colonnes (semaines)
    const weeks = useMemo(() => {
        const result = [];
        for (let i = 0; i < calendarData.length; i += 7) {
            result.push(calendarData.slice(i, i + 7));
        }
        return result;
    }, [calendarData]);

    const monthLabels = useMemo(() => {
        const labels: { label: string; index: number }[] = [];
        let lastMonth = -1;
        
        weeks.forEach((week, i) => {
            const month = week[0].date.getMonth();
            if (month !== lastMonth) {
                const monthName = week[0].date.toLocaleDateString('fr-FR', { month: 'short' });
                labels.push({ label: monthName, index: i });
                lastMonth = month;
            }
        });
        
        return labels;
    }, [weeks]);

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Calendrier d&apos;activité</h3>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium">
                    <span>Moins</span>
                    <div className="flex gap-1">
                        {colorScale.map((bg, i) => (
                            <div key={i} className={cn("w-3 h-3 rounded-[2px]", bg)} />
                        ))}
                    </div>
                    <span>Plus</span>
                </div>
            </div>

            <div className="relative">
                <div className="overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex flex-col gap-2 min-w-max">
                        {/* Mois */}
                        <div className="flex h-5 relative ml-8"> {/* ml-8 matches the day labels column width */}
                            {monthLabels.map((m, i) => (
                                <span 
                                    key={i} 
                                    className="absolute text-[10px] text-neutral-400 font-medium"
                                    style={{ left: `${m.index * 16}px` }} // 16px = 12px (w-3) + 4px (gap-1)
                                >
                                    {m.label}
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-1">
                            {/* Labels des jours - Largeur fixe pour l'alignement */}
                            <div className="flex flex-col gap-1 w-8 pr-2 shrink-0">
                                <span className="h-3 text-[10px] text-neutral-400 flex items-center">Lun.</span>
                                <div className="h-3" /> {/* Mar. */}
                                <span className="h-3 text-[10px] text-neutral-400 flex items-center">Mer.</span>
                                <div className="h-3" /> {/* Jeu. */}
                                <span className="h-3 text-[10px] text-neutral-400 flex items-center">Ven.</span>
                                <div className="h-3" /> {/* Sam. */}
                                <div className="h-3" /> {/* Dim. */}
                            </div>

                            {/* La grille */}
                            <div className="flex gap-1">
                                {weeks.map((week, weekIdx) => (
                                    <div key={weekIdx} className="flex flex-col gap-1">
                                        {week.map((day, dayIdx) => (
                                            <Popover key={dayIdx}>
                                                <PopoverTrigger asChild>
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, zIndex: 10 }}
                                                        className={cn(
                                                            "w-3 h-3 rounded-[2px] transition-colors cursor-pointer",
                                                            colorScale[getLevel(day.count)]
                                                        )}
                                                    />
                                                </PopoverTrigger>
                                                <PopoverContent side="top" className="w-auto p-2 text-[11px] font-medium pointer-events-none mb-1">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className={cn(isRose ? "text-pink-600" : "text-emerald-600")}>
                                                            {day.count} tâche{day.count > 1 ? 's' : ''} complétée{day.count > 1 ? 's' : ''}
                                                        </span>
                                                        <span className="text-neutral-400">
                                                            {day.date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
