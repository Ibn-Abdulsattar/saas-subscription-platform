import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

class UserChecklistItem extends Model {}

UserChecklistItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    taskId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    itemName: { type: DataTypes.STRING, allowNull: false },
    isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: "UserChecklistItem",
    tableName: "user_checklist_items",
    underscored: true,
  },
);

export default UserChecklistItem;
