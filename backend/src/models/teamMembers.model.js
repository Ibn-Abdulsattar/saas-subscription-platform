import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

class TeamMembers extends Model {}

TeamMembers.init(
  {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    teamId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: "teams",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "TeamMember",
    tableName: "team_members",
    underscored: true,
  },
);

export { TeamMembers };
