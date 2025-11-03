import { useEffect, useState, useRef } from 'react';
import { SERVER_URL, endpoints } from '../../../config';
import Dish from '../Dish/Dish';
import Loader from '../Loader/Loader';
import { useSelectedDish } from './SelectedDishContext';

type DishData = {
  id_api: string;
  title: string;
  description: string;
  cost_unit: number;
  categories: string[];
  extras: { name: string; cost: number }[];
  preview_img: string;
};

export default function DishList() {
  const intervalRef = useRef<number | null>(null);
  const [dishes, setDishes] = useState<DishData[]>([]);
  const { setSelectedDish } = useSelectedDish();

  const fetchDishes = async () => {
    await fetch(SERVER_URL + endpoints.dishes + '?offset=' + dishes.length)
      .then((response) => response.json())
      .then((data) => {
        setDishes((prevDishes) => [...prevDishes, ...data]);
      })
      .catch((error) => {
        console.error('Error fetching dishes:', error);
      });
  };

  useEffect(() => {
    const fetchDishesLocal = async () => {
      await fetch(SERVER_URL + endpoints.dishes + '?offset=' + dishes.length)
        .then((response) => response.json())
        .then((data) => {
          setDishes((prevDishes) => [...prevDishes, ...data]);
        })
        .catch((error) => {
          console.error('Error fetching dishes:', error);
        });
    };
    const fetchData = async () => {
      if (dishes.length === 0) {
        await fetchDishesLocal();
      }
    };
    intervalRef.current = window.setInterval(fetchData, 1000);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dishes.length]);

  useEffect(() => {
    if (dishes.length > 0 && intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [dishes.length]);

  return (
    <div
      className='flex flex-col gap-2'
      onScroll={(e) => {
        const target = e.target as HTMLDivElement;
        if (target.scrollTop + target.clientHeight >= target.scrollHeight) {
          fetchDishes();
        }
      }}
    >
      {dishes.length === 0 ? (
        <Loader />
      ) : (
        <>
          {dishes.map((dish, index) => (
            <div key={index} onClick={() => setSelectedDish(dish)}>
              <Dish data={dish} />
            </div>
          ))}
          <Loader />
        </>
      )}
    </div>
  );
}
