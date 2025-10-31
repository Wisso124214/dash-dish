import React, { createContext, useContext, useState } from 'react';

export type DishData = {
  id_api: string;
  title: string;
  description: string;
  cost_unit: number;
  categories: string[];
  extras: { name: string; cost: number }[];
  preview_img: string;
};

interface SelectedDishContextType {
  selectedDish: DishData | null;
  setSelectedDish: (dish: DishData | null) => void;
}

const SelectedDishContext = createContext<SelectedDishContextType | undefined>(
  undefined
);

export const useSelectedDish = () => {
  const context = useContext(SelectedDishContext);
  if (!context) {
    throw new Error(
      'useSelectedDish must be used within a SelectedDishProvider'
    );
  }
  return context;
};

export const SelectedDishProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedDish, setSelectedDish] = useState<DishData | null>(null);

  return (
    <SelectedDishContext.Provider value={{ selectedDish, setSelectedDish }}>
      {children}
    </SelectedDishContext.Provider>
  );
};
