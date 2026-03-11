import * as activityDao from "../daos/activity.dao.js";

export const ACTIVITY_TYPES = {
  USER_REGISTERED: "user_registered",
  BOOK_ADDED: "book_added",
  EVENT_ADDED: "event_added",
};

export async function logActivity({ user_id, type, entity_id }) {
  return await activityDao.createActivity({ user_id, type, entity_id });
}

export async function getActivityFeed(limit) {
  return await activityDao.selectActivityFeed(limit);
}

export async function getUserActivityFeed(userId, limit) {
  return await activityDao.selectActivityFeedByUserId(userId, limit);
}
