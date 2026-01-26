import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";
import { CheckSquare, Plus, Clock } from "lucide-react";

interface Task {
  id: number;
  title: string;
  priority: string;
  dueDate: string;
}

interface TasksPreviewProps {
  tasks: Task[];
}

export function TasksPreview({ tasks }: TasksPreviewProps) {
  return (
    <Card className="border-zinc-100 bg-white shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-3 border-b border-zinc-50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 border border-violet-100/50">
            <CheckSquare className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 leading-none mb-1">
              Queue
            </CardTitle>
            <p className="text-lg font-bold text-zinc-900 tracking-tighter">
              {tasks.length} Actions Needed
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent hover:border-zinc-100"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-zinc-50">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="group flex cursor-pointer items-start gap-4 p-4 transition-all hover:bg-zinc-50/50"
            >
              <div
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${task.priority === "high" ? "bg-rose-500" : "bg-amber-500"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight leading-snug">
                  {task.title}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  <Clock className="h-3 w-3" />
                  <span>Due {task.dueDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-zinc-50/50">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full rounded-md border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 shadow-sm"
            asChild
          >
            <Link href="/missionary-dashboard/tasks">
              Enterprise Task Manager
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
