import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { Event } from "@shared/schema";

export function useEvents(filters?: {
  search?: string;
  category?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
}) {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.category && filters.category !== 'All') queryParams.append("category", filters.category);
  if (filters?.featured) queryParams.append("featured", "true");
  if (filters?.minPrice !== undefined) queryParams.append("minPrice", filters.minPrice.toString());
  if (filters?.maxPrice !== undefined) queryParams.append("maxPrice", filters.maxPrice.toString());
  if (filters?.rating !== undefined) queryParams.append("rating", filters.rating.toString());
  if (filters?.sortBy) queryParams.append("sortBy", filters.sortBy);

  return useQuery<Event[]>({
    queryKey: [api.events.list.path, filters],
    queryFn: async () => {
      const url = `${api.events.list.path}?${queryParams.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch events");
      const json = await res.json();
      return json.data || [];
    },
  });
}

export function useEvent(id: number) {
  return useQuery<Event>({
    queryKey: [api.events.get.path, id],
    queryFn: async () => {
      const url = api.events.get.path.replace(":id", id.toString());
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch event");
      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}
