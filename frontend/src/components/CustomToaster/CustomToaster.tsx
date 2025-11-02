import React from 'react';
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useToasterContext } from './ToasterContext';

const CustomToaster = ({ ...props }: ToasterProps) => {
  const { theme: themeRaw = 'system' } = useTheme();
  // Ajustar el tipo de theme para que coincida con ToasterProps['theme']
  const theme: ToasterProps['theme'] =
    themeRaw === 'light' || themeRaw === 'dark' || themeRaw === 'system'
      ? themeRaw
      : 'system';
  const { setToasterProps } = useToasterContext();
  // Permitir className y style personalizados
  const { className = '', style = {}, ...restProps } = props;

  const componentClassName = ['toaster group', className]
    .filter(Boolean)
    .join(' ');
  const componentStyle = {
    '--normal-bg': style.backgroundColor || 'var(--popover)',
    '--normal-text': 'var(--popover-foreground)',
    '--normal-border': 'var(--border)',
    '--border-radius': 'var(--radius)',
    ...style,
  } as React.CSSProperties & { [key: string]: string };

  React.useEffect(() => {
    setToasterProps({
      theme,
      className: componentClassName,
      style: componentStyle,
      icons: {
        success: <CircleCheckIcon className='size-4' />,
        info: <InfoIcon className='size-4' />,
        warning: <TriangleAlertIcon className='size-4' />,
        error: <OctagonXIcon className='size-4' />,
        loading: <Loader2Icon className='size-4 animate-spin' />,
      },
      ...restProps,
    });
  }, [theme, className, style, setToasterProps, JSON.stringify(restProps)]);

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className={componentClassName}
      style={componentStyle}
      {...restProps}
    />
  );
};

export { CustomToaster };
