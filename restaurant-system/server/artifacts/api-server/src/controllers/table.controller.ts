import { Request, Response } from "express";
import Table from "../models/Table.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export async function getTables(_req: Request, res: Response) {
  const tables = await Table.find().sort({ tableNumber: 1 });
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.json(tables);
}

export async function createTable(req: Request, res: Response) {
  const table = await Table.create(req.body);
  res.status(201).json(table);
}

export async function updateTable(req: Request, res: Response) {
  const table = await Table.findByIdAndUpdate(req.params["id"], req.body, { new: true });
  if (!table) { sendError(res, "Table not found", 404); return; }
  res.json(table);
}

export async function getTableOccupancy(_req: Request, res: Response) {
  const tables = await Table.find();
  const total = tables.length;
  const occupied = tables.filter((t) => t.status === "occupied").length;
  const available = tables.filter((t) => t.status === "available").length;
  const reserved = tables.filter((t) => t.status === "reserved").length;
  const cleaning = tables.filter((t) => t.status === "cleaning").length;
  res.json({ total, occupied, available, reserved, cleaning });
}
