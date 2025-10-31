export default function DetailsOrder() {
  const data = {
    id_api: 'DB001',
    title: 'Tokyo Grain Bowl',
    description:
      'Arroz de sushi y quinua, atún marinado en soya y jengibre, edamame, aguacate y aderezo wasabi-lima.',
    cost_unit: 14.5,
    categories: ['Dash Bowls', 'Seafood', 'Healthy'],
    extras: [
      { name: 'Proteína Doble', cost: 4.0 },
      { name: 'Aguacate Extra', cost: 1.5 },
    ],
    preview_img:
      'https://maisonmarmite.com/wp-content/uploads/2025/07/Tokyo-Street-Bowl-11.jpg',
  };

  return (
    <div className='absolute z-11 top-0 left-0 w-full h-full flex justify-center items-center bg-(--gray-traslucent)'>
      <div className='w-4/5 bg-(--secondary-color) h-9/10 rounded-2xl text-foreground text-xl shadow-[0_0_10px_var(--box-shadow-color)]'>
        <img
          src={data.preview_img}
          alt={data.title}
          className='w-full h-full object-cover rounded-2xl'
        />
      </div>
    </div>
  );
}
