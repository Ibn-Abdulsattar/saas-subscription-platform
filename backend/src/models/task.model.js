import { Model, DataTypes, UUIDV4 } from "sequelize";
import { sequelize } from "../config/db.js";

class Task extends Model {}

(() => {
  Task.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        references: {
          model: "projects",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      assigned_to: {
        type: DataTypes.UUID,
        references: {
          model: "users",
          key: "user_id",
        },
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(200),
      },
      description: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM("pending", "in_progress", "completed"),
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high"),
      },
      due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Task",
      tableName: "tasks",
      underscored: true,
      indexes: [
        {
          fields: ["project_id"],
          name: "idx_tasks_project_id",
        },
        {
          fields: ["status"],
          name: "idx_tasks_status",
        },
                {
          fields: ["priority"],
          name: "idx_tasks_priority",
        },
        {
          fields: ["created_at"],
          name: "idx_task_created_at"
        }
      ],
    },
  );
})();

export { Task };
