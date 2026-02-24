import { Model, DataTypes, UUIDV4 } from "sequelize";
import { sequelize } from "../config/db.js";

class Subscription extends Model {}

(async () => {
  Subscription.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: "users",
          key: "user_id",
        },
        allowNull: false,
      },
      stripe_subscription_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      plan_id: {
        type: DataTypes.UUID,
        references: {
          model: "subscription_plans",
          key: "id",
        },
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM({
          values: ["active", "canceled", "past_due", "trialing"],
        }),
        allowNull: false,
      },
      current_period_start: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      current_period_end: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Subscription",
      tableName: "subscriptions",
      underscored: true,
      indexes: [
        {
          fields: ["user_id"],
          name: "idx_subscriptions_user_id",
        },
        {
          fields: ["plan_id"],
          name: "idx_subscriptions_plan_id",
        },
        {
          fields: ["stripe_subscription_id"],
          name: "idx_subscriptions_stripe_subscription_id",
        },
      ],
    },
  );
})();

export {Subscription};
