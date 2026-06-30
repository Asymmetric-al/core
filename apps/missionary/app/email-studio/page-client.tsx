"use client";

import { motion } from "@asym/lib/motion";
import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import { PageHeader } from "@asym/ui/components/page-header";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Mail,
  Palette,
  Layout,
  Send,
  Sparkles,
} from "@asym/ui/components/shadcn/icons";

const features = [
  {
    icon: Palette,
    title: "React Email Editor",
    description:
      "Author supporter emails with the same React Email editor used in admin.",
  },
  {
    icon: Layout,
    title: "Pre-built Templates",
    description:
      "Start with professionally designed templates for newsletters, updates, and appeals.",
  },
  {
    icon: Send,
    title: "Resend Delivery",
    description:
      "Send through the tenant Resend connection with audit logs and webhooks.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Content",
    description:
      "Get AI suggestions to improve your email copy and subject lines.",
  },
];

export default function EmailStudioPage() {
  // Route VT owns the entrance when active; only animate on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();

  return (
    <motion.div
      initial={withinRouteVt ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1200px] mx-auto pb-20"
    >
      <PageHeader
        title="Email Studio"
        description="Create supporter emails with React Email and send them through Resend."
      />

      <div className="space-y-8">
        <Card className="border-2 border-dashed border-border bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <motion.div
              initial={withinRouteVt ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6"
            >
              <Mail className="size-10 text-primary" />
            </motion.div>

            <motion.h2
              initial={withinRouteVt ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-semibold tracking-tight mb-2"
            >
              Coming Soon
            </motion.h2>

            <motion.p
              initial={withinRouteVt ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground max-w-md mb-6"
            >
              We&apos;re preparing a campaign-ready Email Studio backed by React
              Email templates, Asym merge tags, and Resend delivery.
            </motion.p>

            <motion.div
              initial={withinRouteVt ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Button variant="outline" disabled className="gap-2">
                <Sparkles className="size-4" />
                Notify Me When Ready
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={withinRouteVt ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                      <feature.icon className="size-5 text-muted-foreground" />
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
