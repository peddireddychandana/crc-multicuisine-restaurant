import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PlacedOrder {
  orderId: string;
  tableNumber: number;
  customerName: string;
  status: string;
  finalAmount: number;
  createdAt: string;
}

interface OrderContextType {
  currentOrder: PlacedOrder | null;
  setCurrentOrder: (order: PlacedOrder | null) => void;
  tableNumber: number;
  setTableNumber: (n: number) => void;
  customerName: string;
  setCustomerName: (n: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [currentOrder, setCurrentOrderState] = useState<PlacedOrder | null>(null);
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("");

  const setCurrentOrder = async (order: PlacedOrder | null) => {
    setCurrentOrderState(order);
    if (order) {
      await AsyncStorage.setItem("currentOrder", JSON.stringify(order));
    } else {
      await AsyncStorage.removeItem("currentOrder");
    }
  };

  return (
    <OrderContext.Provider value={{ currentOrder, setCurrentOrder, tableNumber, setTableNumber, customerName, setCustomerName }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside OrderProvider");
  return ctx;
}
