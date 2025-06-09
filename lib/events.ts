import { EventEmitter } from "events";

export const eventEmitter = new EventEmitter();

export const EVENTS = {
  REPRESENTATIVE_CREATED: "representative:created",
  REPRESENTATIVE_UPDATED: "representative:updated",
  REPRESENTATIVE_DELETED: "representative:deleted",
} as const; 