import { toast as sonnerToast } from 'sonner';
import type { ExternalToast, Action } from 'sonner';
import React from 'react';
import { useToasterContext } from './ToasterContext';

/**
 * Custom toast que permite pasar un componente en la prop 'action',
 * o personalizar el botón de acción con className y estilos.
 * También permite renderizar cualquier componente adicional dentro del toast.
 */

// Renderiza el toast personalizado directamente usando el contexto global
function renderCustomToast(
  message: React.ReactNode,
  options?: ExternalToast & {
    action?: React.ReactNode | ExternalToast['action'];
    extra?: React.ReactNode;
    actionButtonClassName?: string;
  },
  toasterProps?: Partial<ExternalToast>
) {
  const { action, extra, actionButtonClassName } = options || {};

  function closeToast(id?: string | number) {
    if (id !== undefined) {
      sonnerToast.dismiss(id);
    }
  }

  let customAction: React.ReactNode = undefined;
  return (id: string | number) => {
    if (action) {
      if (React.isValidElement(action)) {
        customAction = action;
      } else if (
        typeof action === 'object' &&
        'label' in action &&
        typeof (action as Action).onClick === 'function'
      ) {
        const act = action as Action;
        customAction = (
          <button
            className={actionButtonClassName || 'custom-toast-action-btn'}
            style={act.actionButtonStyle}
            onClick={(e) => {
              e.preventDefault();
              act.onClick(e);
              closeToast(id);
            }}
          >
            {act.label}
          </button>
        );
      }
    }

    // Filtrar solo propiedades válidas para CSSProperties
    const restPropsRaw = toasterProps || {};
    const deniedKeys = ['position'];
    const restPropsGlobal = Object.fromEntries(
      Object.entries(restPropsRaw).filter(([key]) => !deniedKeys.includes(key))
    );
    // Combinar estilos locales y globales
    const componentStyle: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 260,
      maxWidth: 400,
      minHeight: 56,
      width: '100%',
      boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
      borderRadius: 'var(--radius, 8px)',
      border: '1px solid var(--border, #222)',
    };
    // Permitir pasar className global
    const className = toasterProps?.className || '';
    return (
      <div
        id='custom-toast'
        style={componentStyle}
        className={className}
        {...restPropsGlobal}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          {extra && <div style={{ marginBottom: 8 }}>{extra}</div>}
          <div style={{ position: 'relative' }}>{message}</div>
          {customAction && (
            <div
              style={{
                marginTop: 8,
                alignSelf: 'flex-end',
                position: 'relative',
              }}
            >
              {customAction}
            </div>
          )}
        </div>
      </div>
    );
  };
}

// Hook para mostrar el toast usando el contexto de React
import { useCallback } from 'react';

export function useCustomToast() {
  const { toasterProps } = useToasterContext();
  // Memoizar la función para que la referencia sea estable
  return useCallback(
    (
      message: React.ReactNode,
      options?: ExternalToast & {
        action?: React.ReactNode | ExternalToast['action'];
        extra?: React.ReactNode;
        actionButtonClassName?: string;
      }
    ) => {
      sonnerToast.custom(renderCustomToast(message, options, toasterProps), {
        ...toasterProps,
        ...options,
      });
    },
    [toasterProps]
  );
}

// Para compatibilidad, exportar una función que requiere estar dentro de ToasterProvider
export function customToast(
  message: React.ReactNode,
  options?: ExternalToast & {
    action?: React.ReactNode | ExternalToast['action'];
    extra?: React.ReactNode;
    actionButtonClassName?: string;
  }
) {
  // Advertencia: esta función debe usarse dentro de un componente envuelto por ToasterProvider
  throw new Error(
    'customToast debe usarse dentro de un componente envuelto por ToasterProvider. Usa el hook useCustomToast en su lugar.'
  );
}
