import { useState, useCallback } from "react";
import type {
  UnlayerDesignJSON,
  EmailTemplate,
  EmailCampaign,
} from "@asym/email/email-studio-types";

const STORAGE_KEY = "email_studio_templates";
const CAMPAIGNS_KEY = "email_studio_campaigns";

export function useEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  const saveToStorage = useCallback((data: EmailTemplate[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const createTemplate = useCallback(
    async (
      name: string,
      design: UnlayerDesignJSON,
      html?: string,
      options?: Partial<EmailTemplate>,
    ): Promise<EmailTemplate> => {
      setIsLoading(true);
      try {
        const newTemplate: EmailTemplate = {
          id: crypto.randomUUID(),
          name,
          design,
          html,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "draft",
          ...options,
        };

        const updated = [...templates, newTemplate];
        setTemplates(updated);
        saveToStorage(updated);

        return newTemplate;
      } finally {
        setIsLoading(false);
      }
    },
    [templates, saveToStorage],
  );

  const updateTemplate = useCallback(
    async (
      id: string,
      updates: Partial<EmailTemplate>,
    ): Promise<EmailTemplate | null> => {
      setIsLoading(true);
      try {
        const index = templates.findIndex((t) => t.id === id);
        if (index === -1) return null;

        const updated = [...templates];
        const currentTemplate = updated[index];
        if (!currentTemplate) return null;

        updated[index] = {
          ...currentTemplate,
          ...updates,
          id: currentTemplate.id, // Preserve the original id
          updatedAt: new Date(),
        };

        setTemplates(updated);
        saveToStorage(updated);

        return updated[index];
      } finally {
        setIsLoading(false);
      }
    },
    [templates, saveToStorage],
  );

  const deleteTemplate = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        const updated = templates.filter((t) => t.id !== id);
        setTemplates(updated);
        saveToStorage(updated);
        return true;
      } finally {
        setIsLoading(false);
      }
    },
    [templates, saveToStorage],
  );

  const getTemplate = useCallback(
    (id: string): EmailTemplate | undefined => {
      return templates.find((t) => t.id === id);
    },
    [templates],
  );

  const duplicateTemplate = useCallback(
    async (id: string): Promise<EmailTemplate | null> => {
      const template = getTemplate(id);
      if (!template) return null;

      return createTemplate(
        `${template.name} (Copy)`,
        template.design,
        template.html,
        {
          description: template.description,
          category: template.category,
          tags: template.tags,
        },
      );
    },
    [getTemplate, createTemplate],
  );

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    duplicateTemplate,
  };
}

export function useEmailCampaigns() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(CAMPAIGNS_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  const saveToStorage = useCallback((data: EmailCampaign[]) => {
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(data));
  }, []);

  const createCampaign = useCallback(
    async (
      name: string,
      subject: string,
      design: UnlayerDesignJSON,
      options?: Partial<EmailCampaign>,
    ): Promise<EmailCampaign> => {
      setIsLoading(true);
      try {
        const newCampaign: EmailCampaign = {
          id: crypto.randomUUID(),
          name,
          subject,
          design,
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
          ...options,
        };

        const updated = [...campaigns, newCampaign];
        setCampaigns(updated);
        saveToStorage(updated);

        return newCampaign;
      } finally {
        setIsLoading(false);
      }
    },
    [campaigns, saveToStorage],
  );

  const updateCampaign = useCallback(
    async (
      id: string,
      updates: Partial<EmailCampaign>,
    ): Promise<EmailCampaign | null> => {
      setIsLoading(true);
      try {
        const index = campaigns.findIndex((c) => c.id === id);
        if (index === -1) return null;

        const updated = [...campaigns];
        const currentCampaign = updated[index];
        if (!currentCampaign) return null;

        updated[index] = {
          ...currentCampaign,
          ...updates,
          id: currentCampaign.id, // Preserve the original id
          updatedAt: new Date(),
        };

        setCampaigns(updated);
        saveToStorage(updated);

        return updated[index];
      } finally {
        setIsLoading(false);
      }
    },
    [campaigns, saveToStorage],
  );

  const deleteCampaign = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        const updated = campaigns.filter((c) => c.id !== id);
        setCampaigns(updated);
        saveToStorage(updated);
        return true;
      } finally {
        setIsLoading(false);
      }
    },
    [campaigns, saveToStorage],
  );

  const getCampaign = useCallback(
    (id: string): EmailCampaign | undefined => {
      return campaigns.find((c) => c.id === id);
    },
    [campaigns],
  );

  return {
    campaigns,
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaign,
  };
}

export const DEFAULT_STARTER_TEMPLATES: Partial<EmailTemplate>[] = [
  {
    name: "Blank Template",
    description: "Start from scratch with a blank canvas",
    category: "basic",
    tags: ["blank", "starter"],
  },
  {
    name: "Monthly Newsletter",
    description: "A clean newsletter layout for regular updates",
    category: "newsletter",
    tags: ["newsletter", "updates", "monthly"],
  },
  {
    name: "Donation Receipt",
    description: "Thank donors with a professional receipt email",
    category: "transactional",
    tags: ["receipt", "donation", "thank-you"],
  },
  {
    name: "Missionary Update",
    description: "Share field updates and prayer requests",
    category: "updates",
    tags: ["missionary", "field", "prayer"],
  },
  {
    name: "Event Invitation",
    description: "Invite supporters to upcoming events",
    category: "events",
    tags: ["event", "invitation", "rsvp"],
  },
  {
    name: "Year-End Appeal",
    description: "End-of-year giving campaign template",
    category: "fundraising",
    tags: ["fundraising", "year-end", "appeal"],
  },
];
