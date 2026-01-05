
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Bell, AlertTriangle, ShieldAlert, ClipboardCheck, Clock, X, ChevronRight, Activity, Calendar } from 'lucide-react';
import { Button, Badge, ScrollArea, Avatar, AvatarImage, AvatarFallback, cn } from './UI';
import { MOCK_MISSIONARIES, CURRENT_USER, getDaysFromInterval } from '../constants';
import { CarePriority, SecurityLevel, CareInterval, ActivityType, CarePlanStatus } from '../types';

interface NotificationCenterProps {
    onNavigateToMissionary: (id: string) => void;
}

type NotificationType = 'critical' | 'security' | 'task' | 'gap';

interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    timestamp: string; 
    missionaryId: string;
    missionaryName: string;
    missionaryAvatar: string;
    priority: number; 
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigateToMissionary }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'alerts' | 'tasks'>('all');

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const notifications = useMemo(() => {
        const list: NotificationItem[] = [];
        const today = new Date();
        today.setHours(0,0,0,0);

        // 1. Critical Priority Alerts
        MOCK_MISSIONARIES.filter(m => m.carePriority === CarePriority.CRITICAL || m.carePriority === CarePriority.HIGH).forEach(m => {
            list.push({
                id: `crit_${m.id}`,
                type: 'critical',
                title: `Critical Care Priority`,
                description: `${m.name} is marked as ${m.carePriority} priority.`,
                timestamp: 'Active',
                missionaryId: m.id,
                missionaryName: m.name,
                missionaryAvatar: m.avatar,
                priority: m.carePriority === CarePriority.CRITICAL ? 0 : 1
            });
        });

        // 2. Security Alerts
        MOCK_MISSIONARIES.filter(m => m.securityLevel === SecurityLevel.CRITICAL || m.securityLevel === SecurityLevel.HIGH).forEach(m => {
            list.push({
                id: `sec_${m.id}`,
                type: 'security',
                title: `High Security Risk`,
                description: `Security level is ${m.securityLevel}. Encrypted comms only.`,
                timestamp: 'Active',
                missionaryId: m.id,
                missionaryName: m.name,
                missionaryAvatar: m.avatar,
                priority: 0
            });
        });

        // 3. Tasks Assigned to Me
        MOCK_MISSIONARIES.forEach(m => {
            m.carePlan.filter(t => t.assignedTo?.id === CURRENT_USER.id && t.status !== CarePlanStatus.COMPLETED).forEach(t => {
                const isOverdue = new Date(t.targetDate) < today;
                list.push({
                    id: `task_${t.id}`,
                    type: 'task',
                    title: isOverdue ? 'Overdue Task' : 'Assigned Task',
                    description: t.description,
                    timestamp: isOverdue ? 'Overdue' : `Due ${new Date(t.targetDate).toLocaleDateString()}`,
                    missionaryId: m.id,
                    missionaryName: m.name,
                    missionaryAvatar: m.avatar,
                    priority: isOverdue ? 2 : 4
                });
            });
        });

        // 4. Care Gaps
        MOCK_MISSIONARIES.forEach(m => {
             if (!m.careRequirements || m.careRequirements.length === 0) {
                 const last = new Date(m.lastContactDate.replace(/-/g, '/')); 
                 const diffTime = today.getTime() - last.getTime();
                 const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
                 if (diffDays > 30) {
                     list.push({
                         id: `gap_${m.id}_default`,
                         type: 'gap',
                         title: 'Routine Check-in Overdue',
                         description: `No contact recorded for ${diffDays} days.`,
                         timestamp: `${diffDays - 30}d late`,
                         missionaryId: m.id,
                         missionaryName: m.name,
                         missionaryAvatar: m.avatar,
                         priority: 3
                     });
                 }
             } else {
                 m.careRequirements.forEach(req => {
                    const requiredDays = getDaysFromInterval(req.interval);
                    const relevantLogs = m.activityLog.filter(log => log.type === req.type);
                    
                    let daysSince = 0;
                    if (relevantLogs.length > 0) {
                        const lastLogDate = new Date(relevantLogs[0].date.replace(/-/g, '/'));
                        const diffTime = today.getTime() - lastLogDate.getTime();
                        daysSince = Math.floor(diffTime / (1000 * 3600 * 24));
                    } else {
                        daysSince = 999; 
                    }

                    if (daysSince > requiredDays) {
                        const overdueDays = daysSince === 999 ? 0 : daysSince - requiredDays;
                         list.push({
                             id: `gap_${m.id}_${req.id}`,
                             type: 'gap',
                             title: `Missing ${req.type}`,
                             description: `${req.interval} requirement not met.`,
                             timestamp: daysSince === 999 ? 'Never' : `${overdueDays}d overdue`,
                             missionaryId: m.id,
                             missionaryName: m.name,
                             missionaryAvatar: m.avatar,
                             priority: 2
                         });
                    }
                 });
             }
        });

        return list.sort((a,b) => a.priority - b.priority);
    }, []);

    const filteredNotifications = useMemo(() => {
        if (activeTab === 'all') return notifications;
        if (activeTab === 'alerts') return notifications.filter(n => n.type === 'critical' || n.type === 'security' || n.type === 'gap');
        if (activeTab === 'tasks') return notifications.filter(n => n.type === 'task');
        return notifications;
    }, [notifications, activeTab]);

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'critical': return <Activity className="h-4 w-4 text-white" />;
            case 'security': return <ShieldAlert className="h-4 w-4 text-white" />;
            case 'task': return <ClipboardCheck className="h-4 w-4 text-white" />;
            case 'gap': return <Clock className="h-4 w-4 text-white" />;
        }
    };

    const getBgColor = (type: NotificationType) => {
        switch (type) {
            case 'critical': return 'bg-rose-500';
            case 'security': return 'bg-amber-500';
            case 'task': return 'bg-blue-500';
            case 'gap': return 'bg-orange-400';
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <Button 
                variant="ghost" 
                size="icon" 
                className={cn("relative text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors", isOpen && "bg-slate-100 text-foreground")}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-background animate-in zoom-in duration-300"></span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute top-full right-[-70px] md:right-0 mt-2 w-[calc(100vw-2rem)] md:w-96 bg-background rounded-xl border shadow-xl z-50 animate-in fade-in zoom-in-95 origin-top-right overflow-hidden mx-4 md:mx-0">
                    <div className="flex items-center justify-between p-4 border-b bg-slate-50/50">
                        <div className="flex items-center gap-2">
                             <h3 className="font-semibold text-sm">Notifications</h3>
                             <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem] justify-center bg-slate-200 text-slate-700">{notifications.length}</Badge>
                        </div>
                        <div className="flex bg-slate-200/50 rounded-md p-0.5">
                            {(['all', 'alerts', 'tasks'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "text-[10px] uppercase font-bold px-2.5 py-1 rounded-sm transition-all",
                                        activeTab === tab ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="h-[400px]">
                        {filteredNotifications.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {filteredNotifications.map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={() => {
                                            onNavigateToMissionary(item.missionaryId);
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors group relative"
                                    >
                                        <div className="relative shrink-0">
                                            <Avatar className="h-10 w-10 border border-slate-200">
                                                <AvatarImage src={item.missionaryAvatar} />
                                                <AvatarFallback>{item.missionaryName.substring(0,2)}</AvatarFallback>
                                            </Avatar>
                                            <div className={cn("absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm", getBgColor(item.type))}>
                                                {getIcon(item.type)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={cn("text-xs font-semibold", item.type === 'critical' ? "text-rose-600" : "text-slate-700")}>
                                                    {item.title}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                    {item.timestamp}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 line-clamp-2 leading-snug">
                                                {item.description}
                                            </p>
                                            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground font-medium group-hover:text-primary transition-colors">
                                                View Case <ChevronRight className="h-3 w-3" />
                                            </div>
                                        </div>
                                        {item.priority === 0 && (
                                            <div className="absolute top-4 left-2 w-1 h-1 rounded-full bg-rose-500"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground p-6 text-center">
                                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <ClipboardCheck className="h-6 w-6 opacity-20" />
                                </div>
                                <p className="text-sm font-medium text-foreground">All caught up!</p>
                                <p className="text-xs">No active notifications in this category.</p>
                            </div>
                        )}
                    </ScrollArea>
                    
                    <div className="p-2 border-t bg-slate-50/50 text-center">
                        <Button variant="ghost" size="sm" className="h-7 text-xs w-full text-muted-foreground hover:text-primary" onClick={() => setIsOpen(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
