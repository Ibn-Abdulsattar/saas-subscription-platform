import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

class SubscriptionPlan extends Model {};

(async () => {
  SubscriptionPlan.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      plan_type: {
        type: DataTypes.ENUM({ values: ["free", "basic", "pro"] }),
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      billing_interval: {
        type: DataTypes.ENUM({ values: ["monthly", "yearly"] }),
      },
      stripe_price_id:{
        type: DataTypes.STRING,
        allowNull:false,
      },
      feature_flags:{
        type: DataTypes.JSON,
        allowNull: true,
      }
    },
    { sequelize,
      modelName: "SubscriptionPlan",
      tableName: "subscription_plans",
      underscored: true,
      indexes: [
        {
          fields: ["stripe_price_id"],
          name: "idx_subscription_plans_stripe_price_id",
        },
        {
          unique: true,
          fields: ["plan_type"],
          name: "idx_subscription_plans_plan_type",
        },
        {
          fields: ["billing_interval"],
          name: "idx_subscription_plans_billing_interval"
        }
      ]
     },
  );
})();

export {SubscriptionPlan};