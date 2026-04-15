import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

class Project extends Model {}

(async () => {
  Project.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "user_id" },
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
      pdf: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deadline: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      teamId: {
        type: DataTypes.UUID,
        references: {
          model: "teams",
          key: "id",
        },
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
