import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

class Team extends Model {}

Team.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Team",
    tableName: "teams",
    underscored: true,
    indexes: [
      {
        fields: ["name"],
        name: "idx_teams_name",
      },
    ],
  },
);

export { Team };
