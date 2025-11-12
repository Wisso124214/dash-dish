export type Dish = {
  _id: string;
  title: string;
  description: string;
  cost_unit: number;
  categories: string[];
  extras: { name: string; cost: number }[];
  preview_img: string;
};

export type CartItem = {
  _id: string;
  title: string;
  description: string;
  cost_unit: number;
  categories: string[];
  extras: { name: string; cost: number }[];
  preview_img: string;
  quantity: number;
  selectedExtras: { name: string; cost: number }[];
};

export type Cart = CartItem[];
