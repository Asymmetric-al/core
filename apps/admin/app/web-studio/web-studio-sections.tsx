"use client";

import { SafeHtml } from "@asym/lib/components/safe-html";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { cn } from "@asym/ui/lib/utils";
import {
  Edit2,
  ExternalLink,
  Eye,
  Globe,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Monitor,
  Plus,
  Save,
  Smartphone,
  Target,
  Wand2,
} from "lucide-react";
import Image from "next/image";

export interface ProjectPage {
  id: string;
  title: string;
  slug: string;
  status: "Public" | "Draft" | "Private";
  goal: string;
  description: string;
}

export type WebStudioView = "content" | "projects" | "updates";
export type PreviewMode = "mobile" | "desktop";

export interface BasicInfo {
  displayName: string;
  location: string;
  bio: string;
}

interface PreviewContentProps {
  mode: PreviewMode;
  coverImage: string;
  profileImage: string;
  basicInfo: BasicInfo;
  projects: ProjectPage[];
}

export const INITIAL_PROJECTS: ProjectPage[] = [
  {
    id: "1",
    title: "Vehicle Fund",
    slug: "vehicle-2024",
    status: "Public",
    goal: "12000",
    description:
      "Help us purchase a reliable 4x4 vehicle to reach remote villages.",
  },
  {
    id: "2",
    title: "Fall Outreach Event",
    slug: "outreach-fall",
    status: "Draft",
    goal: "2500",
    description: "Funding for the community harvest festival.",
  },
];

export const DEFAULT_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop";

export const DEFAULT_COVER_IMAGE =
  "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&h=400&fit=crop";

export const isWebStudioView = (value: string): value is WebStudioView =>
  value === "content" || value === "projects" || value === "updates";

const PREVIEW_UPDATES = [
  {
    title: "Foundation Complete!",
    date: "2 days ago",
    type: "Impact Report",
  },
  {
    title: "Border Delay",
    date: "1 week ago",
    type: "Prayer Request",
  },
] as const;

const PreviewContent = ({
  mode,
  coverImage,
  profileImage,
  basicInfo,
  projects,
}: PreviewContentProps) => {
  return (
    <div className="bg-white min-h-full font-sans text-zinc-900 pb-10 text-left">
      <div
        className={cn(
          "bg-zinc-100 w-full relative overflow-hidden shrink-0 group",
          mode === "mobile" ? "h-32" : "h-48",
        )}
      >
        {coverImage ? (
          <Image
            src={coverImage}
            fill
            sizes="(max-width: 640px) 100vw, 768px"
            className="object-cover"
            alt="Cover"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center text-zinc-200">
            <ImageIcon className="size-8 opacity-50" />
          </div>
        )}
      </div>

      <div
        className={cn(
          "relative",
          mode === "mobile" ? "px-4 -mt-10" : "max-w-4xl mx-auto px-6 -mt-16",
        )}
      >
        <div
          className={cn(
            "relative rounded-2xl border-[4px] border-white bg-white overflow-hidden shadow-lg z-20",
            mode === "mobile" ? "size-20 mx-auto" : "size-32",
          )}
        >
          <Image
            src={profileImage}
            fill
            sizes="(max-width: 640px) 80px, 128px"
            className="object-cover"
            alt="Profile"
          />
        </div>

        <div
          className={cn(
            "space-y-4 z-10 relative",
            mode === "mobile"
              ? "pt-3 text-center"
              : "pt-4 flex flex-col items-start",
          )}
        >
          <div className="w-full">
            <h3
              className={cn(
                "font-semibold tracking-tight text-zinc-900",
                mode === "mobile" ? "text-xl" : "text-3xl",
              )}
            >
              {basicInfo.displayName}
            </h3>
            <div
              className={cn(
                "flex items-center gap-1.5 text-zinc-500 font-medium",
                mode === "mobile" ? "justify-center text-xs" : "text-sm",
              )}
            >
              <MapPin className="size-3.5" />
              <span>{basicInfo.location}</span>
            </div>
          </div>

          <SafeHtml
            className={cn(
              "text-zinc-600 leading-relaxed font-medium",
              mode === "mobile" ? "text-[11px] px-2" : "text-sm max-w-2xl",
            )}
            html={basicInfo.bio}
          />

          <div
            className={cn(
              "flex flex-wrap gap-2 w-full",
              mode === "mobile" && "justify-center pt-2",
            )}
          >
            <Button
              size="sm"
              className="rounded-full bg-zinc-900 text-white font-semibold uppercase tracking-wider text-[10px] h-8 px-6 shadow-md"
            >
              Give Support
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 px-4 text-[10px] font-semibold uppercase tracking-wider"
            >
              Follow
            </Button>
          </div>

          <div
            className={cn(
              "w-full pt-6",
              mode === "desktop" ? "grid grid-cols-2 gap-4" : "space-y-3 px-1",
            )}
          >
            {projects
              .filter((project) => project.status === "Public")
              .map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl bg-white shadow-sm border border-zinc-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className={cn(
                      "bg-zinc-50 relative",
                      mode === "mobile" ? "h-20" : "h-32",
                    )}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-200">
                      <ImageIcon className="size-6" />
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <h4 className="font-semibold text-xs text-zinc-900 leading-tight">
                      {project.title}
                    </h4>
                    <div className="pt-1 flex items-center justify-between">
                      <div className="h-1 w-16 bg-zinc-100 rounded-full overflow-hidden flex-1 mr-3">
                        <div className="h-full bg-blue-600 w-2/3" />
                      </div>
                      <span className="text-[9px] font-semibold text-blue-600">
                        Give &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface WebStudioHeaderProps {
  view: WebStudioView;
  isSaving: boolean;
  onViewChange: (value: string) => void;
  onSave: () => void;
}

export function WebStudioHeader({
  view,
  isSaving,
  onViewChange,
  onSave,
}: WebStudioHeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
            <Globe className="size-4" />
          </div>
          <span className="uppercase tracking-widest text-[11px]">
            Web Studio
          </span>
        </div>
        <div className="h-6 w-px bg-zinc-200 mx-1" />
        <Tabs value={view} onValueChange={onViewChange} className="h-10">
          <TabsList className="bg-transparent h-full p-0 gap-4 border-none">
            <TabsTrigger
              value="content"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 rounded-none px-0 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 shadow-none"
            >
              Live Content
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 rounded-none px-0 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 shadow-none"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="updates"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 rounded-none px-0 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 shadow-none"
            >
              Updates
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 bg-white border-zinc-200 text-zinc-600 text-[10px] font-semibold uppercase tracking-wider"
        >
          <Eye className="size-3.5 mr-1.5" /> View Live
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="h-8 px-4 font-semibold uppercase tracking-wider text-[10px] bg-zinc-900 hover:bg-zinc-800"
        >
          {isSaving ? (
            <Loader2 className="size-3.5 animate-spin mr-1.5" />
          ) : (
            <Save className="size-3.5 mr-1.5" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </header>
  );
}

interface WebStudioEditorPanelProps {
  view: WebStudioView;
  basicInfo: BasicInfo;
  projects: ProjectPage[];
  onBasicInfoChange: (updater: (current: BasicInfo) => BasicInfo) => void;
}

export function WebStudioEditorPanel({
  view,
  basicInfo,
  projects,
  onBasicInfoChange,
}: WebStudioEditorPanelProps) {
  return (
    <ScrollArea className="flex-1 bg-white border-r border-zinc-200">
      <div className="p-8 max-w-3xl mx-auto space-y-10">
        {view === "content" ? (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 text-left border-b border-zinc-100 pb-2">
              Global Branding
            </h3>
            <div className="grid grid-cols-2 gap-6 text-left">
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Public Display Name
                </Label>
                <Input
                  value={basicInfo.displayName}
                  onChange={(event) =>
                    onBasicInfoChange((current) => ({
                      ...current,
                      displayName: event.target.value,
                    }))
                  }
                  className="h-10 bg-zinc-50 border-zinc-200 font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Location Base
                </Label>
                <Input
                  value={basicInfo.location}
                  onChange={(event) =>
                    onBasicInfoChange((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  className="h-10 bg-zinc-50 border-zinc-200 font-medium"
                />
              </div>
            </div>
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Public Bio
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[9px] font-semibold uppercase tracking-wider gap-1 border border-purple-100 bg-purple-50 text-purple-700"
                >
                  <Wand2 className="size-3" /> AI Polish
                </Button>
              </div>
              <Textarea
                value={basicInfo.bio}
                onChange={(event) =>
                  onBasicInfoChange((current) => ({
                    ...current,
                    bio: event.target.value,
                  }))
                }
                className="min-h-[150px] bg-zinc-50 border-zinc-200 leading-relaxed text-sm font-medium"
              />
            </div>
          </div>
        ) : view === "projects" ? (
          <div className="space-y-6 text-left">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 text-left border-b border-zinc-100 pb-2 flex items-center justify-between">
              Active Giving Pages
              <Button
                size="sm"
                className="h-7 px-3 text-[10px] font-semibold uppercase tracking-wider bg-zinc-900 text-white shadow-sm"
              >
                <Plus className="size-3 mr-1" /> New Page
              </Button>
            </h3>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="size-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Target className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 text-sm">
                        {project.title}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-400">
                        /{project.slug} • Goal: ${project.goal}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-zinc-400 hover:text-zinc-900"
                      aria-label={`Open ${project.title} in new tab`}
                    >
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-zinc-400 hover:text-zinc-900"
                      aria-label={`Edit ${project.title}`}
                    >
                      <Edit2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-left">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 text-left border-b border-zinc-100 pb-2 flex items-center justify-between">
              Field Journal Updates
              <Button
                size="sm"
                className="h-7 px-3 text-[10px] font-semibold uppercase tracking-wider bg-zinc-900 text-white shadow-sm"
              >
                <Plus className="size-3 mr-1" /> New Update
              </Button>
            </h3>
            <div className="space-y-4">
              {PREVIEW_UPDATES.map((update) => (
                <div
                  key={`${update.type}-${update.title}`}
                  className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-blue-300 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-zinc-900 text-sm">
                          {update.title}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-[9px] h-4 font-semibold uppercase tracking-widest px-1.5"
                        >
                          {update.type}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        {update.date}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-zinc-400 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                      aria-label={`Edit ${update.title}`}
                    >
                      <Edit2 className="size-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

interface WebStudioPreviewRailProps {
  previewMode: PreviewMode;
  coverImage: string;
  profileImage: string;
  basicInfo: BasicInfo;
  projects: ProjectPage[];
  onPreviewModeChange: (mode: PreviewMode) => void;
}

export function WebStudioPreviewRail({
  previewMode,
  coverImage,
  profileImage,
  basicInfo,
  projects,
  onPreviewModeChange,
}: WebStudioPreviewRailProps) {
  return (
    <div className="w-[450px] bg-zinc-50 flex flex-col shrink-0 overflow-hidden relative">
      <div className="h-14 border-b border-zinc-200 flex items-center justify-between px-4 bg-white shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Live Preview
        </span>
        <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 scale-90">
          <button
            type="button"
            onClick={() => onPreviewModeChange("mobile")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              previewMode === "mobile"
                ? "bg-white shadow-sm text-blue-600"
                : "text-zinc-500 hover:text-zinc-900",
            )}
          >
            <Smartphone className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onPreviewModeChange("desktop")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              previewMode === "desktop"
                ? "bg-white shadow-sm text-blue-600"
                : "text-zinc-500 hover:text-zinc-900",
            )}
          >
            <Monitor className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
        {previewMode === "mobile" ? (
          <div className="w-[300px] h-[600px] rounded-[40px] border-[6px] border-zinc-900 bg-white shadow-2xl relative overflow-hidden ring-1 ring-black/5 scale-[0.9] origin-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-50" />
            <PreviewContent
              mode="mobile"
              coverImage={coverImage}
              profileImage={profileImage}
              basicInfo={basicInfo}
              projects={projects}
            />
          </div>
        ) : (
          <div className="size-full rounded-xl border border-zinc-200 bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="h-8 border-b border-zinc-100 flex items-center px-3 gap-1.5 shrink-0 bg-zinc-50/50">
              <div className="flex gap-1">
                <div className="size-2 rounded-full bg-red-400" />
                <div className="size-2 rounded-full bg-amber-400" />
                <div className="size-2 rounded-full bg-emerald-400" />
              </div>
              <div className="mx-auto bg-white border border-zinc-200 rounded h-5 w-48 text-[8px] font-mono flex items-center justify-center text-zinc-400">
                example.com/the-miller-family
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <PreviewContent
                mode="desktop"
                coverImage={coverImage}
                profileImage={profileImage}
                basicInfo={basicInfo}
                projects={projects}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
