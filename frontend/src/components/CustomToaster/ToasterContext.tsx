import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ToasterProps } from 'sonner';

interface ToasterContextProps {
  toasterProps: Partial<ToasterProps>;
  setToasterProps: (props: Partial<ToasterProps>) => void;
}

const ToasterContext = createContext<ToasterContextProps | undefined>(
  undefined
);

export const useToasterContext = () => {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('useToasterContext debe usarse dentro de ToasterProvider');
  }
  return context;
};

export const ToasterProvider = ({ children }: { children: ReactNode }) => {
  const [toasterProps, setToasterProps] = useState<Partial<ToasterProps>>({});

  return (
    <ToasterContext.Provider value={{ toasterProps, setToasterProps }}>
      {children}
    </ToasterContext.Provider>
  );
};
