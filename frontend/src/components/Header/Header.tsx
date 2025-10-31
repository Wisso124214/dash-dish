export default function Header() {
  return (
    <header className='w-full py-4 px-6 bg-(--foreground-absolute) fixed z-10 top-0 left-0 flex items-center '>
      <img
        src='/src/assets/logo-mini.png'
        alt='Dash Dish Logo'
        className='h-8 w-8 mr-8 scale-150'
      />
      <h1 className='text-2xl font-bold text-foreground'>Dash Dish</h1>
    </header>
  );
}
