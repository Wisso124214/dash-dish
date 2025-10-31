import { useEffect, useState } from 'react';
import { SERVER_URL, endpoints } from '../../../config';
import Dish from '../Dish/Dish';
import Loader from '../Loader/Loader';

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
  const [dishes, setDishes] = useState<DishData[]>([]);

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
    const fetchData = async () => {
      await fetchDishes();
    };
    fetchData();
  }, []);

  return (
    <div
      className='flex flex-col gap-4 p-4 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-(--foreground-smooth) scrollbar-track-(--background-smooth)'
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
          {dishes.map((dish) => (
            <Dish key={dish.id_api} data={dish} />
          ))}
          <Loader />
        </>
      )}
    </div>
  );
}
