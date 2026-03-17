import { addEvent } from "../services/event.service.js";

export const createEvent = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const eventData = {
      ...req.body,
      user_id: userId,
      rating: parseInt(req.body.rating),
      wallet_address: req.body.wallet_address ?? null,
      signature: req.body.signature ?? null,
      created_at: req.body.created_at ?? null,
    };
    const event = await addEvent(eventData, req.files ?? []);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};
