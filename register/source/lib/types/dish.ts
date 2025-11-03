export interface DishExtra {
  name: string;
  cost: number;
}

export interface Dish {
  _id?: string;
  title: string;
  description?: string;
  cost_unit: number;
  id_categories: string[];
  preview_image?: string;
  extras?: DishExtra[];
}