"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Mail, Palette, Layout, Send, Sparkles } from "@/components/ui/icons";
import { motion } from "motion/react";

const features = [
  {
    icon: Palette,
    title: "Drag & Drop Editor",
    description:
      "Create beautiful emails with an intuitive visual editor. No coding required.",
  },
  {
    icon: Layout,
    title: "Pre-built Templates",
    description:
      "Start with professionally designed templates for newsletters, updates, and appeals.",
  },
  {
    icon: Send,
    title: "Smart Scheduling",
    description:
      "Schedule emails to send at optimal times for maximum engagement.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Content",
    description:
      "Get AI suggestions to improve your email copy and subject lines.",
  },
];

export default function EmailStudioPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1200px] mx-auto pb-20"
    >
      <PageHeader
        title="Email Studio"
        description="Create and send beautiful emails to your supporters."
      />

      <div className="space-y-8">
        <Card className="border-2 border-dashed border-border bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6"
            >
              <Mail className="h-10 w-10 text-primary" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold tracking-tight mb-2"
            >
              Coming Soon
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground max-w-md mb-6"
            >
              We&apos;re building a powerful email studio with drag-and-drop
              editing, beautiful templates, and smart analytics. Stay tuned!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Button variant="outline" disabled className="gap-2">
                <Sparkles className="h-4 w-4" />
                Notify Me When Ready
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
