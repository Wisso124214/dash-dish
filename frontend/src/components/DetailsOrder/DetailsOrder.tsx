import { useEffect, useState } from 'react';
import { useSelectedDish } from '../DishList/SelectedDishContext';
import { NumberInput } from '../NumberInput/NumberInput';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

type Extra = {
  name: string;
  cost: number;
};

type Data = {
  id_api: string;
  title: string;
  description: string;
  cost_unit: number;
  categories: string[];
  extras: Extra[];
  preview_img: string;
};

export default function DetailsOrder(data: Data) {
  const { setSelectedDish } = useSelectedDish();
  const [totalCost, setTotalCost] = useState<Data['cost_unit']>(data.cost_unit);
  const [quantity, setQuantity] = useState(1);
  const [extras, setExtras] = useState<Data['extras']>([]);
  const [description, setDescription] = useState<Data['description']>('');

  useEffect(() => {
    const extrasCost = extras.reduce((sum, extra) => sum + extra.cost, 0);
    const newTotal = (data.cost_unit + extrasCost) * quantity;
    setTotalCost(newTotal);
  }, [quantity, extras, data]);

  const handleClose = () => {
    setSelectedDish(null);
  };

  return (
    <div
      id='details-order-container'
      className='absolute z-11 top-0 left-0 w-full h-full flex justify-center items-center bg-(--gray-traslucent)'
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className='w-4/5 bg-(--secondary-color) h-9/10 rounded-2xl text-foreground text-xl shadow-[0_0_10px_var(--box-shadow-color)] overflow-hidden flex flex-col'>
        {/* Scroll vertical para todo el contenido interno */}
        <div className='flex-1 overflow-y-auto no-scrollbar::-webkit-scrollbar no-scrollbar'>
          <div className='relative h-1/2'>
            <Button
              id='close-details-order-button'
              className='absolute z-20 top-0 left-0 m-2 aspect-square bg-(--tertiary-color-traslucent) hover:bg-(--tertiary-color-traslucent-2) active:bg-(--tertiary-color-traslucent-2) text-(--foreground-absolute)'
              onClick={handleClose}
            >
              <svg
                width='15'
                height='15'
                viewBox='0 0 15 15'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z'
                  fill='currentColor'
                  fill-rule='evenodd'
                  clip-rule='evenodd'
                  stroke='currentColor'
                  stroke-width='2'
                ></path>
              </svg>
            </Button>
            <img
              src={data.preview_img}
              alt={data.title}
              className='w-full h-full object-cover rounded-2xl'
            />
            <div className='absolute h-full w-full top-0 flex justify-center items-end p-6'>
              <h2
                className='relative font-bold text-4xl line-clamp-3 text-ellipsis'
                style={{
                  textShadow: '0px 0px 10px var(--foreground-absolute)',
                }}
              >
                {data.title}
              </h2>
            </div>
          </div>
          <div className='flex flex-col p-6 gap-2'>
            <div className=''>
              <p className='text-(--gray-muted-light) text-[16px]'>
                {data.description}
              </p>
              {data.extras.length > 0 && (
                <div className='flex flex-col gap-2'>
                  <h3 className='font-bold text-2xl mt-6 mb-3 text-(--tertiary-color) '>
                    Extras
                  </h3>
                  <div className='flex flex-col gap-2 max-h-40 overflow-y-auto pr-2'>
                    {data.extras.map((extra, index) => (
                      <div
                        key={index}
                        className='flex text-[18px] leading-tight align-center'
                      >
                        <Label className='w-full hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-aria-checked:border-(--tertiary-color) has-aria-checked:bg-blue-50 dark:has-aria-checked:border-(--tertiary-color-dark) dark:has-aria-checked:bg-(--gray-background-light) '>
                          <Checkbox
                            id={`extra-${index}`}
                            className='data-[state=checked]:border-(--tertiary-color) data-[state=checked]:bg-(--tertiary-color) data-[state=checked]:text-white dark:data-[state=checked]:border-(--tertiary-color) dark:data-[state=checked]:bg-(--tertiary-color)'
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setExtras((prev) => [...prev, extra]);
                              } else {
                                setExtras((prev) =>
                                  prev.filter(
                                    (item) => item.name !== extra.name
                                  )
                                );
                              }
                            }}
                          />
                          <div className='font-normal justify-between flex w-full'>
                            <span className='font-light'>{extra.name}</span>
                            <span className='font-semibold'>
                              (+${extra.cost.toFixed(2)})
                            </span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <Textarea
                className='w-full mt-8'
                placeholder='Enter your description...'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className='mt-6 flex flex-row justify-between items-center'>
              <span className='font-bold text-3xl pl-2 -mt-1'>
                ${totalCost.toFixed(2)}
              </span>
              <NumberInput
                className='w-32'
                id='quantityProduct'
                placeholder='Enter number'
                min={1}
                defaultValue={1}
                onValueChange={(value) => {
                  setQuantity(value ?? 1);
                }}
              />
            </div>
            <Button className='mt-8 mb-4 w-full bg-(--tertiary-color) hover:bg-(--tertiary-color-light) text-(--secondary-color) font-extrabold text-lg rounded-2xl '>
              Add to Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
