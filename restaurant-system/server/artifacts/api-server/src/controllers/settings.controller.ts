import { Request, Response } from "express";
import Settings from "../models/Settings.js";

export async function getSettings(_req: Request, res: Response) {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json(settings);
}

export async function updateSettings(req: Request, res: Response) {
  const body = req.body;
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(body);
  } else {
    Object.assign(settings, body);
    await settings.save();
  }
  res.json(settings);
}
