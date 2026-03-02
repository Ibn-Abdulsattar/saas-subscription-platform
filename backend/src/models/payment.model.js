import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

class Payment extends Model {}

(async () => {
  Payment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
      stripe_invoice_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM({ values: ["paid", "failed", "pending"] }),
        allowNull: false,
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      invoice_url: {
  type: DataTypes.STRING,
  allowNull: true,
},
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      underscored: true,
      indexes: [
        {
          fields: ["user_id"],
          name: "idx_payments_user_id",
        },
        {
          fields: ["stripe_invoice_id"],
          name: "idx_payments_stripe_invoice_id",
        },
      ],
    },
  );
})();

export { Payment };
