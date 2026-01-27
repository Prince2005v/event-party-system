import { useQuery } from "@tanstack/react-query";
import { api, type EventResponse } from "@shared/routes";
import { z } from "zod";

export function useEvents(filters?: { category?: string; featured?: boolean }) {
  const queryParams = new URLSearchParams();
  if (filters?.category) queryParams.append("category", filters.category);
  if (filters?.featured) queryParams.append("featured", "true");

  return useQuery({
    queryKey: [api.events.list.path, filters],
    queryFn: async () => {
      const url = `${api.events.list.path}?${queryParams.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch events");
      return api.events.list.responses[200].parse(await res.json());
    },
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: [api.events.get.path, id],
    queryFn: async () => {
      // Manual URL building since we don't have the buildUrl helper imported here yet
      // In a real scenario, ensure buildUrl is exported from shared/routes
      const url = api.events.get.path.replace(":id", id.toString());
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch event");
      return api.events.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
