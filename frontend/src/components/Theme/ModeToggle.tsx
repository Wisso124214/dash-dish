import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from './UseTheme';
import { useState } from 'react';

export default function ModeToggle() {
  const { setTheme } = useTheme();
  const [isLightTheme, setIsLightTheme] = useState(true);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        onClick={() => {
          if (isLightTheme) {
            setTheme('dark');
            setIsLightTheme(false);
          } else {
            setTheme('light');
            setIsLightTheme(true);
          }
        }}
      >
        <Button
          className='bg-(--foreground-smooth) hover:bg-(--foreground-smooth-translucent)'
          size='icon'
        >
          <Sun className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 text-background' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 text-background' />
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
