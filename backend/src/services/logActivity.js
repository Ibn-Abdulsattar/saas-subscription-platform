import { Activity } from "../models/activity.model.js";
import wrapAsync from "../utils/wrapAsync.js";

export const logActivity = wrapAsync(
  async (userId, action, entityType, entityId) => {
    try {
      await Activity.create({
        user_id: userId,
        action: action.toUpperCase(),
        entity_type: entityType,
        entity_id: entityId?.toString(),
      });
    } catch (e) {
      console.log(e)
    }
  },
);
