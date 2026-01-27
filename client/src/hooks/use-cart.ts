import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type SelectedEventResponse } from "@shared/routes";
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
      // If authenticated, we don't strictly need the session key for the API 
      // as the backend handles userId from the session, but passing it doesn't hurt
      // logic-wise, we can clear it or keep it.
      setSessionKey(null);
    }
  }, [isAuthenticated, isAuthLoading]);

  // Fetch selected events
  const { data: items = [], isLoading } = useQuery({
    queryKey: [api.selectedEvents.list.path, sessionKey, isAuthenticated],
    queryFn: async () => {
      // If auth is loading, wait
      if (isAuthLoading) return [];

      let url = api.selectedEvents.list.path;
      // Only append sessionKey if user is NOT authenticated and we have a key
      if (!isAuthenticated && sessionKey) {
        url += `?sessionKey=${sessionKey}`;
      } else if (!isAuthenticated && !sessionKey) {
         // Should not happen due to useEffect, but defensive return
         return [];
      }

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cart");
      return api.selectedEvents.list.responses[200].parse(await res.json());
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
      return api.selectedEvents.add.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.selectedEvents.list.path] });
      toast({
        title: "Added to selection",
        description: "Event has been added to your plan.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not add event. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Remove item
  const removeMutation = useMutation({
    mutationFn: async (id: number) => { // id is the primary key of selected_events table
      let url = api.selectedEvents.remove.path.replace(":id", id.toString());
      
      // If guest, might need to pass sessionKey in body/query depending on API implementation
      // Routes manifest shows optional body input for remove.
      const options: RequestInit = { 
        method: "DELETE",
        credentials: "include" 
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
        title: "Removed",
        description: "Event removed from selection.",
      });
    },
  });

  // Helper to check if an event is selected
  const isSelected = (eventId: number) => items.some(item => item.eventId === eventId);
  const getSelectionId = (eventId: number) => items.find(item => item.eventId === eventId)?.id;

  return {
    items,
    isLoading,
    addItem: addMutation.mutate,
    removeItem: removeMutation.mutate,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    isSelected,
    getSelectionId,
    totalPrice: items.reduce((sum, item) => sum + Number(item.event.basePrice), 0),
  };
}
