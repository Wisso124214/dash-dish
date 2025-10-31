import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';

export default function Loader() {
  return (
    <div className='flex w-full flex-col gap-10 [--radius:1rem] items-center'>
      <Item
        variant='muted'
        className='absolute flex flex-row [--radius:1rem] w-full max-w-xs'
      >
        <ItemMedia className='left-10'>
          <Spinner className='text-sm' />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className='line-clamp-1 w-full text-center'>
            Loading...
          </ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
}
