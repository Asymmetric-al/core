import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CarePersonnel,
  ActivityLogEntry,
  CareThread,
  CarePlan,
} from "../types";
import { MOCK_PERSONNEL, MOCK_ACTIVITY } from "../constants";

// Simulated API calls
const fetchPersonnel = async (): Promise<CarePersonnel[]> => {
  // In a real app, this would be: await fetch('/api/care/personnel').then(res => res.json())
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_PERSONNEL), 500),
  );
};

const fetchActivities = async (
  personnelId?: string,
): Promise<ActivityLogEntry[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = personnelId
        ? MOCK_ACTIVITY.filter((a) => a.personnelId === personnelId)
        : MOCK_ACTIVITY;
      resolve(filtered);
    }, 500);
  });
};

export function useCarePersonnel() {
  return useQuery({
    queryKey: ["care", "personnel"],
    queryFn: fetchPersonnel,
  });
}

export function useCareActivity(personnelId?: string) {
  return useQuery({
    queryKey: ["care", "activity", personnelId],
    queryFn: () => fetchActivities(personnelId),
  });
}

export function useCareProfile(id: string) {
  return useQuery({
    queryKey: ["care", "personnel", id],
    queryFn: async () => {
      const personnel = await fetchPersonnel();
      return personnel.find((p) => p.id === id);
    },
    enabled: !!id,
  });
}

export function useLogActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activity: Omit<ActivityLogEntry, "id" | "date">) => {
      // Mock save
      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ...activity,
              id: Math.random().toString(),
              date: new Date().toISOString(),
            }),
          500,
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care", "activity"] });
    },
  });
}
