import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (eventIds: number[]) => {
      const res = await fetch(api.bookings.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventIds }),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to create booking");
      }
      return api.bookings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.selectedEvents.list.path] }); // Cart should clear
      queryClient.invalidateQueries({ queryKey: [api.dashboard.get.path] });
      toast({
        title: "Booking Confirmed!",
        description: "Your events have been successfully booked.",
      });
    },
    onError: (error) => {
       toast({
        title: "Booking Failed",
        description: error.message === "Unauthorized" ? "Please log in to book." : "Something went wrong.",
        variant: "destructive",
      });
    }
  });
}

export function useBookings() {
  return useQuery({
    queryKey: [api.bookings.list.path],
    queryFn: async () => {
      const res = await fetch(api.bookings.list.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error("Failed to fetch bookings");
      }
      return api.bookings.list.responses[200].parse(await res.json());
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.get.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.get.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error("Failed to fetch stats");
      }
      return api.dashboard.get.responses[200].parse(await res.json());
    },
  });
}
