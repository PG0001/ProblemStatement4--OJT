import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios";

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  venue: string;
  startDate: string;
  endDate: string;
  totalSeats: number;
  availableSeats: number;
}

interface EventsContextType {
  events: Event[];
  fetchEvents: () => Promise<void>;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

const EventsContext = createContext<EventsContextType>({
  events: [],
  fetchEvents: async () => {},
  setEvents: () => {},
});

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get("/Event");
      setEvents(res.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  }, []);

  return (
    <EventsContext.Provider value={{ events, fetchEvents, setEvents }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) throw new Error("useEvents must be used within EventsProvider");
  return context;
};

