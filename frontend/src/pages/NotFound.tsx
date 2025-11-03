export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center h-full w-full'>
      <div className='bg-(--foreground-absolute-translucent) pt-8 pb-12 rounded-4xl w-9/10 max-w-2xl flex flex-col items-center'>
        <h1
          className='text-[120px] font-extrabold -mb-8 text-(--primary-color)'
          style={{ fontFamily: 'var(--font-big-title)' }}
        >
          404
        </h1>
        <h1 className='text-4xl font-bold mb-8 text-(--primary-color)'>
          Page Not Found
        </h1>
        <p className='text-lg font-semibold w-9/10'>
          The page you are looking for does not exist.{' '}
        </p>
        <a
          className='text-lg font-semibold text-(--primary-color-light) active:underline hover:underline'
          href='/'
        >
          Go back home
        </a>
      </div>
    </div>
  );
}
