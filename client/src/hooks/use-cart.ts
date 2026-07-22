import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { SelectedEvent } from "@shared/schema";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./use-auth";
import { useToast } from "@/hooks/use-toast";

const SESSION_KEY_STORAGE = "eventify_session_key";

export function useCart() {
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize session key for guests
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      let key = localStorage.getItem(SESSION_KEY_STORAGE);
      if (!key) {
        key = uuidv4();
        localStorage.setItem(SESSION_KEY_STORAGE, key);
      }
      setSessionKey(key);
    } else {
      setSessionKey(null);
    }
  }, [isAuthenticated, isAuthLoading]);

  // Fetch selected events
  const { data: items = [], isLoading } = useQuery<SelectedEvent[]>({
    queryKey: [api.selectedEvents.list.path, sessionKey, isAuthenticated],
    queryFn: async () => {
      if (isAuthLoading) return [];

      let url = api.selectedEvents.list.path;
      if (!isAuthenticated && sessionKey) {
        url += `?sessionKey=${sessionKey}`;
      } else if (!isAuthenticated && !sessionKey) {
        return [];
      }

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const json = await res.json();
      return json.data || [];
    },
    enabled: !isAuthLoading && (isAuthenticated || !!sessionKey),
  });

  // Add item
  const addMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const payload: any = { eventId };
      if (!isAuthenticated && sessionKey) {
        payload.sessionKey = sessionKey;
      }

      const res = await fetch(api.selectedEvents.add.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to add event");
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.selectedEvents.list.path] });
      toast({
        title: "Added to cart!",
        description: "Event package has been added to your selection.",
      });
    },
    onError: () => {
      toast({
        title: "Could not add event",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove item
  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      const url = api.selectedEvents.remove.path.replace(":id", id.toString());
      const options: RequestInit = {
        method: "DELETE",
        credentials: "include",
      };

      if (!isAuthenticated && sessionKey) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify({ sessionKey });
      }

      const res = await fetch(url, options);
      if (!res.ok) throw new Error("Failed to remove event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.selectedEvents.list.path] });
      toast({
        title: "Item removed",
        description: "Event removed from selection.",
      });
    },
  });

  const isSelected = (eventId: number) => items.some((item) => item.eventId === eventId);
  const getSelectionId = (eventId: number) => items.find((item) => item.eventId === eventId)?.id;

  const totalPrice = items.reduce((sum, item) => sum + (item.event ? Number(item.event.basePrice) : 0), 0);

  return {
    items,
    isLoading,
    addItem: addMutation.mutate,
    removeItem: removeMutation.mutate,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    isSelected,
    getSelectionId,
    totalPrice,
  };
}
