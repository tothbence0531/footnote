import { addEvent } from "../services/event.service.js";

export const createEvent = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const eventData = {
      ...req.body,
      user_id: userId,
      rating: parseInt(req.body.rating),
    };
    const event = await addEvent(eventData, req.files ?? []);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};
