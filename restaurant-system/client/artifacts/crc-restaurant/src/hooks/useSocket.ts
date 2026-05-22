import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

type OrderStatusEvent = {
  orderId: string;
  status: string;
  tableNumber: number;
};

export function useSocket(onOrderStatus?: (data: OrderStatusEvent) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    const events = [
      "order-accepted",
      "order-preparing",
      "order-cooking",
      "order-ready",
      "order-completed",
      "order-cancelled",
    ];

    events.forEach((event) => {
      socket.on(event, (data: OrderStatusEvent) => {
        onOrderStatus?.(data);
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [onOrderStatus]);

  return socketRef;
}
