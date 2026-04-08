import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Todo } from './TodoItem';
import { cn } from '@/lib/utils';
import { CheckCircle2, Target, ListTodo, Flame, PieChart, BarChart2, ChevronLeft, ChevronRight, TrendingUp, Calendar } from 'lucide-react';
import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/animate-ui/components/radix/toggle-group';
import { Input } from '@/components/ui/Input';
import ActivityCalendar from './ActivityCalendar';

interface TrackerScoreProps {
    todos: Todo[];
    user: 'anas' | 'rose';
}

function SparkLine({ data, color }: { data: number[]; color: string }) {
    const width = 600;
    const height = 140;
    const padX = 32;
    const padY = 24;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;
    const max = Math.max(...data, 1);

    const points = data.map((v, i) => ({
        x: padX + (i / Math.max(data.length - 1, 1)) * innerW,
        y: padY + innerH - (v / max) * innerH,
    }));

    const pathD = points.reduce((acc, pt, i, arr) => {
        if (i === 0) return `M ${pt.x} ${pt.y}`;
        const prev = arr[i - 1];
        const cpx = (prev.x + pt.x) / 2;
        return `${acc} C ${cpx} ${prev.y}, ${cpx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <motion.path
                d={areaD}
                fill="url(#sparkGrad)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            />
            <motion.path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            {points.map((pt, i) => (
                <motion.circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="white"
                    stroke={color}
                    strokeWidth="2.5"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.07, type: 'spring', stiffness: 300 }}
                />
            ))}
        </svg>
    );
}

export default function TrackerScore({ todos, user }: TrackerScoreProps) {
    const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
    const [trackerTab, setTrackerTab] = useState<'day' | 'week'>('day');
    const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'));
    const [weekOffset, setWeekOffset] = useState(0);

    const getWeekDays = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay() || 7;
        startOfWeek.setDate(startOfWeek.getDate() - day + 1 + weekOffset * 7);
        const labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
        const todayStr = new Date().toLocaleDateString('en-CA');
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            const dateStr = date.toLocaleDateString('en-CA');
            return { label: labels[i], dateStr, isToday: dateStr === todayStr, dayNumber: date.getDate() };
        });
    };

    const weekDays = getWeekDays();

    // Current week (Mon–Sun) for the graph
    const last7Days = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Find Monday of the current week
        const monday = new Date(today);
        const dayOfWeek = today.getDay() || 7; // 1=Mon … 7=Sun
        monday.setDate(today.getDate() - dayOfWeek + 1);

        const labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const dateStr = d.toLocaleDateString('en-CA');
            const dayTodos = todos.filter(t => t.date === dateStr);
            const total = dayTodos.length;
            const completed = dayTodos.filter(t => t.completed).length;
            const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
            return { dateStr, label: labels[i], dayNumber: d.getDate(), total, completed, pct };
        });
    }, [todos]);

    const weeklyAvg = Math.round(last7Days.reduce((s, d) => s + d.pct, 0) / 7);
    const weeklyCompleted = last7Days.reduce((s, d) => s + d.completed, 0);
    const weeklyTotal = last7Days.reduce((s, d) => s + d.total, 0);

    // Day filter
    const filteredTodos = todos.filter(t => t.date && t.date === selectedDate);
    const totalTasks = filteredTodos.length;
    const completedTasks = filteredTodos.filter(t => t.completed).length;
    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const highPriorityTasks = filteredTodos.filter(t => t.priority === 'high');
    const completedHighPriority = highPriorityTasks.filter(t => t.completed).length;
    const shortTermTasks = filteredTodos.filter(t => t.horizon === 'short');
    const completedShortTerm = shortTermTasks.filter(t => t.completed).length;
    let totalSubtasks = 0, completedSubtasks = 0;
    filteredTodos.forEach(todo => {
        if (todo.comments?.length) {
            totalSubtasks += todo.comments.length;
            completedSubtasks += todo.comments.filter(c => c.isCompleted).length;
        }
    });

    const isRose = user === 'rose';
    const bgCardClass = isRose
        ? 'bg-[#FDF2F5] dark:bg-[#2A1D1F] border-pink-100 dark:border-pink-900'
        : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800';
    const primaryBgFill = isRose ? '#F472B6' : '#3B82F6';
    const strokeWidth = 14;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

    return (
        <motion.div
            className="flex-1 w-full flex flex-col md:overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <div className="flex flex-col md:overflow-y-auto flex-1 p-2 gap-4 h-full pb-10">

                {/* Tab switcher */}
                <div className="flex gap-2">
                    {[
                        { key: 'day', icon: <Calendar size={14} />, label: 'Jour' },
                        { key: 'week', icon: <TrendingUp size={14} />, label: '7 jours' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setTrackerTab(tab.key as 'day' | 'week')}
                            className={cn(
                                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border shadow-sm',
                                trackerTab === tab.key
                                    ? (isRose ? 'bg-pink-500 text-white border-pink-400' : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white')
                                    : 'bg-white dark:bg-neutral-900 text-neutral-500 border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {trackerTab === 'day' ? (
                        <motion.div
                            key="day"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-4"
                        >
                            {/* Day nav */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-3 rounded-2xl border shadow-sm border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setWeekOffset(p => p - 1)} className="p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 rounded-lg dark:hover:bg-neutral-800 transition-colors">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <ToggleGroup
                                        type="single"
                                        value={selectedDate}
                                        onValueChange={val => { if (val) setSelectedDate(val); }}
                                        className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 gap-1"
                                        highlightClassName="bg-white shadow-sm dark:bg-black"
                                    >
                                        {weekDays.map((d, i) => {
                                            const isSelected = selectedDate === d.dateStr;
                                            return (
                                                <ToggleGroupItem
                                                    key={i}
                                                    value={d.dateStr}
                                                    className={cn(
                                                        'flex flex-col items-center justify-center w-10 sm:w-12 h-14 rounded-lg transition-all relative outline-none',
                                                        isSelected
                                                            ? (isRose ? 'text-pink-600 dark:text-pink-500' : 'text-neutral-900 dark:text-white')
                                                            : 'text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50'
                                                    )}
                                                >
                                                    <span className="text-[10px] font-semibold uppercase">{d.label}</span>
                                                    <span className={cn('text-sm font-bold', isSelected ? 'text-current' : 'text-neutral-700 dark:text-neutral-300')}>{d.dayNumber}</span>
                                                    <div className="absolute bottom-1 inset-x-0 flex justify-center h-1.5">
                                                        {d.isToday && <div className={cn('w-1 h-1 rounded-full', isRose ? 'bg-pink-400' : 'bg-blue-500')} />}
                                                    </div>
                                                </ToggleGroupItem>
                                            );
                                        })}
                                    </ToggleGroup>
                                    <button onClick={() => setWeekOffset(p => p + 1)} className="p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 rounded-lg dark:hover:bg-neutral-800 transition-colors">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 px-2 shrink-0">
                                    <span className="text-sm font-medium text-neutral-500">Aller au :</span>
                                    <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className={cn('h-9 text-xs sm:w-36', isRose && 'focus:border-pink-300')} />
                                </div>
                            </div>

                            {/* Score card */}
                            <div className={cn('rounded-2xl p-6 border shadow-sm relative', bgCardClass)}>
                                <div className="absolute top-4 right-4 z-10 flex border rounded-md overflow-hidden dark:border-neutral-800">
                                    <button onClick={() => setChartType('donut')} className={cn('p-1.5 transition-colors', chartType === 'donut' ? (isRose ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/40' : 'bg-neutral-200 dark:bg-neutral-700') : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400')}>
                                        <PieChart size={16} />
                                    </button>
                                    <button onClick={() => setChartType('bar')} className={cn('p-1.5 transition-colors', chartType === 'bar' ? (isRose ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/40' : 'bg-neutral-200 dark:bg-neutral-700') : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400')}>
                                        <BarChart2 size={16} />
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-8 justify-center w-full">
                                    {chartType === 'donut' ? (
                                        <div className="relative flex items-center justify-center shrink-0">
                                            <svg className="w-40 h-40 transform -rotate-90">
                                                <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className={isRose ? 'text-pink-100 dark:text-pink-900/40' : 'text-neutral-100 dark:text-neutral-800'} />
                                                <motion.circle cx="80" cy="80" r={radius} stroke={primaryBgFill} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 1.5, ease: 'easeOut' }} strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">{completionPercentage}%</span>
                                                <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">Avancement</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 w-full max-w-md py-4">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Avancement Global</span>
                                                <span className="text-3xl font-bold font-mono tracking-tight">{completionPercentage}%</span>
                                            </div>
                                            <div className={cn('h-6 w-full rounded-full overflow-hidden', isRose ? 'bg-white border border-pink-100 shadow-inner dark:bg-black dark:border-pink-900' : 'bg-neutral-100 dark:bg-neutral-800')}>
                                                <motion.div className={cn('h-full', isRose ? 'bg-pink-400' : 'bg-blue-500')} initial={{ width: 0 }} animate={{ width: `${completionPercentage}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} />
                                            </div>
                                            <div className="flex justify-between mt-2 text-xs text-neutral-400 font-medium">
                                                <span>0 tâches</span><span>{totalTasks} tâches</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2 text-center sm:text-left flex-1 max-w-xs">
                                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Score de Productivité</h2>
                                        <p className="text-sm text-neutral-500">
                                            {completionPercentage === 100 ? 'Félicitations ! Vous avez complété toutes vos tâches.' : completionPercentage > 50 ? 'Beau travail, vous êtes sur la bonne voie !' : 'Concentrez-vous sur vos priorités.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: <Target size={24} />, label: 'Court Terme', val: completedShortTerm, total: shortTermTasks.length, color: isRose ? 'bg-white dark:bg-[#1A1214] text-pink-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' },
                                    { icon: <Flame size={24} />, label: 'Haute Priorité', val: completedHighPriority, total: highPriorityTasks.length, color: isRose ? 'bg-white dark:bg-[#1A1214] text-red-500' : 'bg-red-50 dark:bg-red-900/20 text-red-500' },
                                    { icon: <ListTodo size={24} />, label: 'Sous-tâches', val: completedSubtasks, total: totalSubtasks, color: isRose ? 'bg-white dark:bg-[#1A1214] text-indigo-500' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' },
                                    { icon: <CheckCircle2 size={24} />, label: 'Tâches Globales', val: completedTasks, total: totalTasks, color: isRose ? 'bg-white dark:bg-[#1A1214] text-emerald-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' },
                                ].map((card, i) => (
                                    <div key={i} className={cn('p-5 rounded-xl border shadow-sm flex items-center gap-4', bgCardClass)}>
                                        <div className={cn('p-3 rounded-lg', card.color)}>{card.icon}</div>
                                        <div>
                                            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">{card.label}</p>
                                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{card.val} <span className="text-base font-normal text-neutral-400">/ {card.total}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredTodos.length === 0 && (
                                <div className={cn('p-8 rounded-xl border border-dashed text-center', isRose ? 'border-pink-200' : 'border-neutral-200')}>
                                    <p className="text-neutral-500 text-sm">Aucune tâche planifiée ou terminée à cette date.</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="week"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-4"
                        >
                            {/* Summary cards */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Complétées', value: weeklyCompleted, sub: `sur ${weeklyTotal} tâches` },
                                    { label: 'Moyenne / jour', value: `${weeklyAvg}%`, sub: 'complétion' },
                                    { label: 'Jours actifs', value: last7Days.filter(d => d.total > 0).length, sub: 'sur 7 jours' },
                                ].map((card, i) => (
                                    <div key={i} className={cn('p-4 rounded-2xl border shadow-sm', bgCardClass)}>
                                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">{card.label}</p>
                                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{card.value}</p>
                                        <p className="text-xs text-neutral-400 mt-0.5">{card.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Sparkline chart */}
                            <div className={cn('rounded-2xl border shadow-sm p-5', bgCardClass)}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Progression sur 7 jours</h3>
                                        <p className="text-xs text-neutral-400 mt-0.5">% de tâches complétées par jour</p>
                                    </div>
                                    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', isRose ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30')}>
                                        {weeklyAvg}% moy.
                                    </span>
                                </div>
                                <SparkLine data={last7Days.map(d => d.pct)} color={primaryBgFill} />
                                <div className="relative mt-1 h-8">
                                    {last7Days.map((d, i) => {
                                        // Match exact SVG point position: padX=32, width=600
                                        const pct = (32 + (i / 6) * 536) / 600 * 100;
                                        return (
                                            <div
                                                key={i}
                                                className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2"
                                                style={{ left: `${pct}%` }}
                                            >
                                                <span className="text-[10px] font-semibold text-neutral-400 uppercase">{d.label}</span>
                                                <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">{d.dayNumber}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Per-day bars */}
                            <div className={cn('rounded-2xl border shadow-sm p-5', bgCardClass)}>
                                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm mb-4">Détail par jour</h3>
                                <div className="flex flex-col gap-3">
                                    {last7Days.map((d, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-neutral-400 w-5 text-right uppercase">{d.label}</span>
                                            <span className="text-xs text-neutral-500 w-5 text-right">{d.dayNumber}</span>
                                            <div className={cn('flex-1 h-2.5 rounded-full overflow-hidden', isRose ? 'bg-pink-100 dark:bg-pink-900/20' : 'bg-neutral-100 dark:bg-neutral-800')}>
                                                <motion.div
                                                    className={cn('h-full rounded-full', isRose ? 'bg-pink-400' : 'bg-blue-500')}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${d.pct}%` }}
                                                    transition={{ duration: 0.7, delay: i * 0.07, ease: 'easeOut' }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 w-10 text-right">{d.total === 0 ? '–' : `${d.pct}%`}</span>
                                            <span className="text-[10px] text-neutral-400 w-14 text-right">{d.total === 0 ? 'Aucune' : `${d.completed}/${d.total}`}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Activity Calendar Section */}
                <div className={cn('rounded-2xl border shadow-sm p-5 mt-2', bgCardClass)}>
                    <ActivityCalendar todos={todos} user={user} />
                </div>

            </div>
        </motion.div>
    );
}
