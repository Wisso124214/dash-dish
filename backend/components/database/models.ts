import mongoose from "mongoose";

export interface IUser {
  username: string;
  password: string;
  createdAt: string;
  email: string;
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

interface ICategory {
  name: string;
  description?: string;
}

const categoriesSchema = new mongoose.Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
});

interface IDish {
  title: string;
  description: string;
  cost_unit: number;
  categoryId: string[];
  extras?: object[];
  preview_img?: string;
}

const dishSchema = new mongoose.Schema<IDish>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost_unit: {
      type: Number,
      required: true,
    },
    categoryId: {
      type: [String],
      required: true,
    },
    extras: {
      type: [Object],
    },
    preview_img: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

interface IDishExtra {
  name: string;
  cost: number;
}

interface IOrderItem {
  id_dish: string;
  quantity: number;
  selected_extras?: IDishExtra[];
}

export type OrderStatus = "preparing" | "done" | "delivered";
export type OrderType = "dinein" | "delivery";

export interface IOrder {
  id_user: string;
  items: IOrderItem[];
  total_cost: number;
  status: OrderStatus;
  type: OrderType;
  created_at: Date;
  updated_at?: Date;
}

const dishExtraSchema = new mongoose.Schema<IDishExtra>({
  name: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
});

const orderItemSchema = new mongoose.Schema<IOrderItem>({
  id_dish: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  selected_extras: {
    type: [dishExtraSchema],
    default: [],
  },
});

const orderSchema = new mongoose.Schema<IOrder>(
  {
    id_user: {
      type: String,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    total_cost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["preparing", "done", "delivered"],
      required: true,
      default: "preparing",
    },
    type: {
      type: String,
      enum: ["dinein", "delivery"],
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const User = mongoose.model<IUser>("user", userSchema);
export const Dish = mongoose.model<IDish>("dish", dishSchema);
export const Category = mongoose.model<ICategory>("category", categoriesSchema);
export const Order = mongoose.model<IOrder>("order", orderSchema);

export const models = { User, Dish, Category, Order };
