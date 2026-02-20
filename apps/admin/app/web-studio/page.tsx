"use client";

import React, { useState } from "react";

import {
  DEFAULT_COVER_IMAGE,
  DEFAULT_PROFILE_IMAGE,
  INITIAL_PROJECTS,
  type BasicInfo,
  type PreviewMode,
  type WebStudioView,
  WebStudioEditorPanel,
  WebStudioHeader,
  WebStudioPreviewRail,
  isWebStudioView,
} from "./web-studio-sections";

export default function WebStudio() {
  const [view, setView] = useState<WebStudioView>("content");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("mobile");
  const [isSaving, setIsSaving] = useState(false);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    displayName: "The Miller Family",
    location: "Chiang Mai, Thailand",
    bio: "<p>We are serving the Northern Thailand community, bringing hope through education and clean water initiatives.</p>",
  });

  const projects = INITIAL_PROJECTS;
  const profileImage = DEFAULT_PROFILE_IMAGE;
  const coverImage = DEFAULT_COVER_IMAGE;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col bg-slate-50 overflow-hidden border border-slate-200 rounded-xl text-left">
      <WebStudioHeader
        view={view}
        isSaving={isSaving}
        onViewChange={(value) => {
          if (isWebStudioView(value)) {
            setView(value);
          }
        }}
        onSave={handleSave}
      />

      <div className="flex-1 overflow-hidden flex">
        <WebStudioEditorPanel
          view={view}
          basicInfo={basicInfo}
          projects={projects}
          onBasicInfoChange={(updater) =>
            setBasicInfo((current) => updater(current))
          }
        />
        <WebStudioPreviewRail
          previewMode={previewMode}
          coverImage={coverImage}
          profileImage={profileImage}
          basicInfo={basicInfo}
          projects={projects}
          onPreviewModeChange={setPreviewMode}
        />
      </div>
    </div>
  );
}
