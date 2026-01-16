'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { 
  Eye, Globe, Smartphone, Monitor, Image as ImageIcon, Plus, 
  ExternalLink, Edit2, Loader2, Target,
  Wand2, Save, MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// --- Types ---

interface ProjectPage {
  id: string
  title: string
  slug: string
  status: 'Public' | 'Draft' | 'Private'
  goal: string
  description: string
}

// --- Constants ---

const INITIAL_PROJECTS: ProjectPage[] = [
  { 
    id: '1', 
    title: 'Vehicle Fund', 
    slug: 'vehicle-2024', 
    status: 'Public', 
    goal: '12000', 
    description: 'Help us purchase a reliable 4x4 vehicle to reach remote villages.' 
  },
  { 
    id: '2', 
    title: 'Fall Outreach Event', 
    slug: 'outreach-fall', 
    status: 'Draft', 
    goal: '2500', 
    description: 'Funding for the community harvest festival.' 
  }
]

// --- Preview Component ---

const PreviewContent = ({ mode, coverImage, profileImage, basicInfo, projects }: any) => {
  return (
    <div className="bg-white min-h-full font-sans text-slate-900 pb-10 text-left">
        {/* Cover */}
        <div className={cn("bg-slate-100 w-full relative overflow-hidden shrink-0 group", mode === 'mobile' ? "h-32" : "h-48")}>
            {coverImage ? (
                <Image src={coverImage} fill className="object-cover" alt="Cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-200">
                     <ImageIcon className="h-8 w-8 opacity-50" />
                </div>
            )}
        </div>

        {/* Profile Section */}
        <div className={cn("relative", mode === 'mobile' ? "px-4 -mt-10" : "max-w-4xl mx-auto px-6 -mt-16")}>
             <div className={cn("relative rounded-2xl border-[4px] border-white bg-white overflow-hidden shadow-lg z-20", mode === 'mobile' ? "h-20 w-20 mx-auto" : "h-32 w-32")}>
                     <Image src={profileImage} fill className="object-cover" alt="Profile" />
             </div>
            
            <div className={cn("space-y-4 z-10 relative", mode === 'mobile' ? "pt-3 text-center" : "pt-4 flex flex-col items-start")}>
                <div className="w-full">
                    <h3 className={cn("font-bold tracking-tight text-slate-900", mode === 'mobile' ? "text-xl" : "text-3xl")}>{basicInfo.displayName}</h3>
                    <div className={cn("flex items-center gap-1.5 text-slate-500 font-medium", mode === 'mobile' ? "justify-center text-xs" : "text-sm")}>
                        <MapPin className="h-3.5 w-3.5" /> <span>{basicInfo.location}</span>
                    </div>
                </div>

                <div 
                    className={cn("text-slate-600 leading-relaxed font-medium", mode === 'mobile' ? "text-[11px] px-2" : "text-sm max-w-2xl")}
                    dangerouslySetInnerHTML={{ __html: basicInfo.bio }}
                />
                
                <div className={cn("flex flex-wrap gap-2 w-full", mode === 'mobile' && "justify-center pt-2")}>
                    <Button size="sm" className="rounded-full bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px] h-8 px-6 shadow-md">Give Support</Button>
                    <Button variant="outline" size="sm" className="rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-wider">Follow</Button>
                </div>
                
                {/* Projects Grid Preview */}
                <div className={cn("w-full pt-6", mode === 'desktop' ? "grid grid-cols-2 gap-4" : "space-y-3 px-1")}>
                    {projects.filter((p: any) => p.status === 'Public').map((p: any) => (
                        <div key={p.id} className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className={cn("bg-slate-50 relative", mode === 'mobile' ? "h-20" : "h-32")}>
                                <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                                    <ImageIcon className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="p-3 space-y-2">
                                <h4 className="font-bold text-xs text-slate-900 leading-tight">{p.title}</h4>
                                <div className="pt-1 flex items-center justify-between">
                                    <div className="h-1 w-16 bg-slate-100 rounded-full overflow-hidden flex-1 mr-3">
                                        <div className="h-full bg-blue-600 w-2/3" />
                                    </div>
                                    <span className="text-[9px] font-bold text-blue-600">Give &rarr;</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
       </div>
    </div>
  )
}

export default function WebStudio() {
  const [view, setView] = useState<'content' | 'projects' | 'updates'>('content')
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile')
  const [isSaving, setIsSaving] = useState(false)
  
  // Content State
  const [basicInfo, setBasicInfo] = useState({
    displayName: "The Miller Family",
    location: "Chiang Mai, Thailand",
    bio: "<p>We are serving the Northern Thailand community, bringing hope through education and clean water initiatives.</p>"
  })

  const [projects, setProjects] = useState<ProjectPage[]>(INITIAL_PROJECTS)
  const [profileImage] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop")
  const [coverImage] = useState("https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&h=400&fit=crop")

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col bg-slate-50 overflow-hidden border border-slate-200 rounded-xl text-left">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
              <Globe className="h-4 w-4" />
            </div>
            <span className="uppercase tracking-widest text-[11px]">Web Studio</span>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="h-10">
            <TabsList className="bg-transparent h-full p-0 gap-4 border-none">
                <TabsTrigger value="content" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 rounded-none px-0 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 shadow-none">Live Content</TabsTrigger>
                <TabsTrigger value="projects" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 rounded-none px-0 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 shadow-none">Projects</TabsTrigger>
                <TabsTrigger value="updates" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 rounded-none px-0 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 shadow-none">Updates</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 bg-white border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
            <Eye className="h-3.5 w-3.5 mr-1.5" /> View Live
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-8 px-4 font-bold uppercase tracking-wider text-[10px] bg-slate-900 hover:bg-slate-800">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        <ScrollArea className="flex-1 bg-white border-r border-slate-200">
            <div className="p-8 max-w-3xl mx-auto space-y-10">
                {view === 'content' ? (
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 text-left border-b border-slate-100 pb-2">Global Branding</h3>
                        <div className="grid grid-cols-2 gap-6 text-left">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Public Display Name</Label>
                                <Input value={basicInfo.displayName} onChange={(e) => setBasicInfo({...basicInfo, displayName: e.target.value})} className="h-10 bg-slate-50 border-slate-200 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Location Base</Label>
                                <Input value={basicInfo.location} onChange={(e) => setBasicInfo({...basicInfo, location: e.target.value})} className="h-10 bg-slate-50 border-slate-200 font-medium" />
                            </div>
                        </div>
                        <div className="space-y-2 text-left">
                            <div className="flex justify-between items-center mb-1">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Public Bio</Label>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold uppercase tracking-wider gap-1 border border-purple-100 bg-purple-50 text-purple-700">
                                        <Wand2 className="h-3 w-3" /> AI Polish
                                    </Button>
                                </div>
                            </div>
                            <Textarea value={basicInfo.bio} onChange={(e) => setBasicInfo({...basicInfo, bio: e.target.value})} className="min-h-[150px] bg-slate-50 border-slate-200 leading-relaxed text-sm font-medium" />
                        </div>
                    </div>
                ) : view === 'projects' ? (
                    <div className="space-y-6 text-left">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 text-left border-b border-slate-100 pb-2 flex items-center justify-between">
                            Active Giving Pages
                            <Button size="sm" className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white shadow-sm"><Plus className="h-3 w-3 mr-1" /> New Page</Button>
                        </h3>
                        <div className="space-y-3">
                            {projects.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20 transition-all group">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                                            <p className="text-[10px] font-mono text-slate-400">/{p.slug} • Goal: ${p.goal}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900"><ExternalLink className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900"><Edit2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 text-left">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 text-left border-b border-slate-100 pb-2 flex items-center justify-between">
                            Field Journal Updates
                            <Button size="sm" className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white shadow-sm"><Plus className="h-3 w-3 mr-1" /> New Update</Button>
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: "Foundation Complete!", date: "2 days ago", type: "Impact Report" },
                                { title: "Border Delay", date: "1 week ago", type: "Prayer Request" }
                            ].map((upd, i) => (
                                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all group">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-900 text-sm">{upd.title}</p>
                                                <Badge variant="secondary" className="text-[9px] h-4 font-bold uppercase tracking-widest px-1.5">{upd.type}</Badge>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium">{upd.date}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Edit2 className="h-3.5 w-3.5" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>

        {/* 3. Live Preview Rail */}
        <div className="w-[450px] bg-slate-50 flex flex-col shrink-0 overflow-hidden relative">
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-white shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Preview</span>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 scale-90">
                    <button onClick={() => setPreviewMode('mobile')} className={cn("p-1.5 rounded-md transition-all", previewMode === 'mobile' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900")}><Smartphone className="h-4 w-4" /></button>
                    <button onClick={() => setPreviewMode('desktop')} className={cn("p-1.5 rounded-md transition-all", previewMode === 'desktop' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900")}><Monitor className="h-4 w-4" /></button>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
                {previewMode === 'mobile' ? (
                    <div className="w-[300px] h-[600px] rounded-[40px] border-[6px] border-slate-900 bg-white shadow-2xl relative overflow-hidden ring-1 ring-black/5 scale-[0.9] origin-center">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50" />
                        <PreviewContent mode="mobile" coverImage={coverImage} profileImage={profileImage} basicInfo={basicInfo} projects={projects} />
                    </div>
                ) : (
                    <div className="w-full h-full rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col">
                        <div className="h-8 border-b border-slate-100 flex items-center px-3 gap-1.5 shrink-0 bg-slate-50/50">
                            <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /><div className="w-2 h-2 rounded-full bg-amber-400" /><div className="w-2 h-2 rounded-full bg-emerald-400" /></div>
                            <div className="mx-auto bg-white border border-slate-200 rounded h-5 w-48 text-[8px] font-mono flex items-center justify-center text-slate-400">example.com/the-miller-family</div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <PreviewContent mode="desktop" coverImage={coverImage} profileImage={profileImage} basicInfo={basicInfo} projects={projects} />
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}
