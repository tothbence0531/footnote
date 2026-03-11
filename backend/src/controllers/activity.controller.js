import {
  getActivityFeed,
  getUserActivityFeed,
} from "../services/activity.service.js";

export const getFeed = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const feed = await getActivityFeed(limit);
    res.status(200).json(feed);
  } catch (error) {
    next(error);
  }
};

export const getUserFeed = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const feed = await getUserActivityFeed(userId, limit);
    res.status(200).json(feed);
  } catch (error) {
    next(error);
  }
};
