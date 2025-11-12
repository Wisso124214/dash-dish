import React, { createContext, useContext, useState } from 'react';
import type { Dish as DishData } from '@/lib/types';

interface SelectedDishContextType {
  selectedDish: DishData | null;
  setSelectedDish: (dish: DishData | null) => void;
  selectedPage: string;
  setSelectedPage: (page: string) => void;
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
  const [selectedPage, setSelectedPage] = useState<string>('');

  return (
    <SelectedDishContext.Provider
      value={{ selectedDish, setSelectedDish, selectedPage, setSelectedPage }}
    >
      {children}
    </SelectedDishContext.Provider>
  );
};
