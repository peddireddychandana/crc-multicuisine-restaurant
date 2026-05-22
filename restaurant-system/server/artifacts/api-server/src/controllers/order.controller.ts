import { Request, Response } from "express";
import mongoose from "mongoose";
import Order, { OrderStatus } from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Table from "../models/Table.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { createNotification } from "../services/notification.service.js";
import { getIO } from "../config/socket.js";

const GST_RATE = 0.05;
const ADMIN_SERVER_URL = process.env["ADMIN_SERVER_URL"] || "http://localhost:5001";

async function syncTableStatus(tableNumber: number, status: string, customerName?: string) {
  try {
    await fetch(`${ADMIN_SERVER_URL}/api/tables/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableNumber, status, customerName }),
    });
  } catch (err) {
    console.error("Failed to sync table status to admin server:", err);
  }
}

export async function getOrders(req: Request, res: Response) {
  try {
    const { status, tableNumber } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter["orderStatus"] = status;
    if (tableNumber) filter["tableNumber"] = Number(tableNumber);
    const orders = await Order.find(filter).populate("orderedItems.menuItem", "name image").sort({ createdAt: -1 });
    res.json({ orders, summary: { total: orders.length, pending: orders.filter((o) => o.orderStatus === "pending").length } });
  } catch (err) {
    console.error("getOrders error:", err);
    sendError(res, "Failed to fetch orders", 500);
  }
}

async function resolveOrder(id: string) {
  const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);
  if (isObjectId) return Order.findById(id);
  if (/^\d+$/.test(id)) {
    const targetId = parseInt(id, 10);
    const orders = await Order.find({}).limit(1000).lean();
    for (const order of orders) {
      const vid = parseInt(order._id.toString().slice(-8), 16) || 0;
      if (vid === targetId) return Order.findById(order._id);
    }
    return null;
  }
  return Order.findOne({ orderId: id });
}

export async function getOrder(req: Request, res: Response) {
  try {
    const order = await resolveOrder(req.params["id"]);
    if (!order) { sendError(res, "Order not found", 404); return; }
    await order.populate("orderedItems.menuItem");
    res.json(order);
  } catch (err) {
    console.error("getOrder error:", err);
    sendError(res, "Failed to fetch order", 500);
  }
}

export async function createOrder(req: Request, res: Response) {
  try {
    const { tableNumber, customerName, customerPhone, cookingNotes, items } = req.body as {
      tableNumber?: number;
      customerName?: string;
      customerPhone?: string;
      cookingNotes?: string;
      items?: Array<{ menuItemId?: number; quantity?: number; name?: string; price?: number; image?: string }>;
    };

    const errors: string[] = [];
    if (!tableNumber) errors.push("tableNumber is required");
    if (!customerName || !customerName.trim()) errors.push("customerName is required");
    if (!items || !Array.isArray(items) || items.length === 0) errors.push("items must be a non-empty array");

    if (errors.length > 0) {
      res.status(400).json({ success: false, message: "Validation error", errors });
      return;
    }

    const validItems: Array<{
      menuItem: mongoose.Types.ObjectId;
      name: string;
      price: number;
      quantity: number;
      image?: string;
    }> = [];

    for (const item of items) {
      if (!item.menuItemId || !item.quantity || item.quantity < 1) {
        errors.push(`Invalid item: ${JSON.stringify(item)}`);
        continue;
      }

      let menuItemDoc = null;
      if (item.name && item.price) {
        const oid = await findMenuItemId(item.menuItemId);
        if (oid) {
          menuItemDoc = { _id: oid, name: item.name, price: item.price, image: item.image || "" };
        }
      }

      if (!menuItemDoc) {
        const found = await findMenuItemByVirtualId(item.menuItemId);
        if (found) {
          menuItemDoc = found;
        }
      }

      if (!menuItemDoc) {
        if (item.name && item.price) {
          validItems.push({
            menuItem: new mongoose.Types.ObjectId(),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || "",
          });
          continue;
        }
        errors.push(`Menu item with id ${item.menuItemId} not found`);
        continue;
      }

      validItems.push({
        menuItem: new mongoose.Types.ObjectId(menuItemDoc._id),
        name: menuItemDoc.name,
        price: menuItemDoc.price,
        quantity: item.quantity,
        image: item.image || menuItemDoc.image || "",
      });
    }

    if (errors.length > 0) {
      res.status(400).json({ success: false, message: "Validation error", errors });
      return;
    }

    const totalAmount = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = Math.round(totalAmount * GST_RATE * 100) / 100;
    const finalAmount = Math.round((totalAmount + gst) * 100) / 100;
    const orderId = generateOrderId();

    const order = await Order.create({
      orderId,
      customerName: customerName.trim(),
      tableNumber,
      customerPhone: customerPhone || "",
      orderedItems: validItems,
      totalAmount,
      gst,
      finalAmount,
      notes: cookingNotes || "",
    });

    await Table.findOneAndUpdate(
      { tableNumber },
      { status: "occupied", currentOrder: order._id, occupancy: 1 }
    ).catch((err) => console.error("Failed to update table status:", err));
    syncTableStatus(tableNumber!, "occupied", customerName?.trim());

    try {
      const io = getIO();
      io.emit("new-order", order);
      io.to("admin").emit("new-order", order);
    } catch (err) {
      console.error("Socket emit error:", err);
    }

    try {
      await createNotification(
        "New Order Received",
        `Order ${orderId} from Table ${tableNumber} — ${customerName?.trim()}`,
        "order",
        { orderId, tableNumber }
      );
    } catch (err) {
      console.error("Notification error:", err);
    }

    res.status(201).json(order);
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function findMenuItemId(virtualId: number): Promise<string | null> {
  try {
    const items = await MenuItem.find({}, "_id").lean();
    for (const item of items) {
      const vid = parseInt(item._id.toString().slice(-8), 16) || 0;
      if (vid === virtualId) return item._id.toString();
    }
  } catch (err) {
    console.error("findMenuItemId error:", err);
  }
  return null;
}

async function findMenuItemByVirtualId(virtualId: number): Promise<{ _id: string; name: string; price: number; image?: string } | null> {
  try {
    const items = await MenuItem.find({}, "_id name price image").lean();
    for (const item of items) {
      const vid = parseInt(item._id.toString().slice(-8), 16) || 0;
      if (vid === virtualId) {
        return { _id: item._id.toString(), name: item.name, price: item.price, image: item.image || "" };
      }
    }
  } catch (err) {
    console.error("findMenuItemByVirtualId error:", err);
  }
  return null;
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { status } = req.body as { status: OrderStatus };
    const order = await resolveOrder(req.params["id"]);
    if (!order) { sendError(res, "Order not found", 404); return; }

    order.orderStatus = status;
    await order.save();

    if (status === "completed") {
      await Table.findOneAndUpdate({ tableNumber: order.tableNumber }, { status: "available", currentOrder: undefined, occupancy: 0 }).catch((err) =>
        console.error("Failed to update table status:", err)
      );
      syncTableStatus(order.tableNumber, "available");
    }

    const io = getIO();
    const eventMap: Record<string, string> = {
      accepted: "order-accepted",
      preparing: "order-preparing",
      cooking: "order-cooking",
      ready: "order-ready",
      served: "order-served",
      completed: "order-completed",
      cancelled: "order-cancelled",
      rejected: "order-rejected",
    };
    const event = eventMap[status] || "order-accepted";
    const virtualId = parseInt(order._id.toString().slice(-8), 16) || 0;
    io.emit(event, { orderId: virtualId, status, tableNumber: order.tableNumber });

    sendSuccess(res, order, `Order status updated to ${status}`);
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    sendError(res, "Failed to update order status", 500);
  }
}

export async function updateOrder(req: Request, res: Response) {
  try {
    const order = await resolveOrder(req.params["id"]);
    if (!order) { sendError(res, "Order not found", 404); return; }
    Object.assign(order, req.body);
    await order.save();
    sendSuccess(res, order, "Order updated");
  } catch (err) {
    console.error("updateOrder error:", err);
    sendError(res, "Failed to update order", 500);
  }
}

export async function deleteOrder(req: Request, res: Response) {
  try {
    const order = await resolveOrder(req.params["id"]);
    if (!order) { sendError(res, "Order not found", 404); return; }
    await order.deleteOne();
    sendSuccess(res, null, "Order deleted");
  } catch (err) {
    console.error("deleteOrder error:", err);
    sendError(res, "Failed to delete order", 500);
  }
}
