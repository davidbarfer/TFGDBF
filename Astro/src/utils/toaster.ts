export type ToastType = 'success' | 'error';
export const TOASTSTYLE : Record<ToastType, ToastType> = { success: 'success', error: 'error'}
/**
 * Lanza un toast de inmediato (para acciones que no recargan la página)
 */
export const showToast = (message: string, type: ToastType = 'success'): void => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('toast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }
};

/**
 * Programa un toast para que se muestre inmediatamente después de cambiar de página o recargar
 */
export const showToastOnLoad = (message: string, type: ToastType = 'success'): void => {
  if (typeof window !== 'undefined') {
    const pendingToast = { message, type };
    // Guardamos el toast como texto en el localStorage
    localStorage.setItem('pending_toast', JSON.stringify(pendingToast));
  }
};