type DishData = {
  id_api: string;
  title: string;
  description: string;
  cost_unit: number;
  categories: string[];
  extras: { name: string; cost: number }[];
  preview_img: string;
};

export default function Dish({ data }: { data: DishData }) {
  return (
    <div className='flex flex-row bg-(--gray-background) rounded-xl gap-2 text-background shadow-xl shadow-black/70 hover:scale-105 transition-transform duration-300'>
      <div
        className='flex w-50 rounded-xl overflow-hidden min-w-[100px]'
        style={{ boxShadow: '2.5px 0 5px 1px rgba(0, 0, 0, .8)' }}
      >
        <img
          src={
            data?.preview_img
              ? data.preview_img
              : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcAtu_MJr5s8ZPqarl-I9M06w1RTwHOP0iHw&s'
          }
          alt={data?.title ? data.title : 'Dish Image'}
          className='object-cover aspect-square justify-center h-full w-full'
        />
      </div>
      <div className='flex flex-col p-4 w-full'>
        <div className='flex flex-row justify-left items-center mb-1'>
          <h2 className='font-bold text-lg mb-3 w-17/20 text-ellipsis line-clamp-1 overflow-hidden'>
            {data?.title ? data.title : ''}
          </h2>
          <div className='mb-2 text-xs font-semibold pl-2 pr-2 pt-1.5 pb-1.5 bg-(--primary-color) rounded-xl shadow-[inset_0_-2px_7px_rgba(0,0,0,0.6)]'>
            <span className=''>
              ${data?.cost_unit ? data.cost_unit.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
        <p className='text-(--gray-muted) text-xs text-left leading-tight h-8 mb-4 overflow-hidden line-clamp-2 text-ellipsis pr-2 pl-2'>
          {data?.description ? data.description : ''}
        </p>
        <div className='font-bold bg-(--tertiary-color) text-(--gray-background) rounded-xl text-sm p-1 hover:cursor-pointer hover:bg-(--tertiary-color-light)'>
          <span className=''>Add to cart</span>
        </div>
      </div>
    </div>
  );
}
