import { MESSAGE_STATUSES } from "../models/index.js";
import {
  listMessages,
  getMessage,
  markRead,
  setStatus,
  deleteMessage,
  countByStatus,
} from "../services/message.service.js";
import { badRequest, notFoundError } from "../utils/httpError.js";

export async function listInbox(req, res) {
  const { status, q, page } = req.query;
  const payload = await listMessages({ status, q, page });
  res.json(payload);
}

export async function inboxCounts(req, res) {
  res.json({ counts: await countByStatus() });
}

export async function readMessage(req, res) {
  const opened = await markRead(req.params.id);
  const item = opened || (await getMessage(req.params.id));

  if (!item) throw notFoundError("No message with that id.");
  res.json({ item, counts: await countByStatus() });
}

export async function updateMessage(req, res) {
  const status = req.body?.status;

  if (!MESSAGE_STATUSES.includes(status)) {
    throw badRequest(`status must be one of ${MESSAGE_STATUSES.join(", ")}.`, "VALIDATION_ERROR");
  }

  const item = await setStatus(req.params.id, status);
  if (!item) throw notFoundError("No message with that id.");

  res.json({ item, counts: await countByStatus() });
}

export async function removeMessage(req, res) {
  const deleted = await deleteMessage(req.params.id);
  if (!deleted) throw notFoundError("No message with that id.");

  res.json({ counts: await countByStatus() });
}
