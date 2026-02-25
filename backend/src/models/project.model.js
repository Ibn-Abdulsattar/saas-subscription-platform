import { Model, DataTypes, UUIDV4 } from "sequelize";
import { sequelize } from "../config/db.js";

class Project extends Model {}

(async () => {
  Project.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
      },
      user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "user_id" }
    },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "compeleted", "hold"),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Project",
      tableName: "projects",
      underscored: true,
      indexes: [
        {
          fields: ["user_id"],
          name: "idx_projects_user_id",
        },
      ],
    },
  );
})();

export { Project };
