import { toast } from 'sonner';

export const cosmicToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      style: {
        background: 'var(--ayu-cream)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        color: 'var(--ayu-brown-900)',
      },
    });
  },
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      style: {
        background: 'var(--ayu-cream)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        color: '#b91c1c',
      },
    });
  },
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: '✦',
      style: {
        background: 'var(--ayu-cream)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        color: 'var(--ayu-brown-900)',
      },
    });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: '⚠️',
      style: {
        background: 'var(--ayu-cream)',
        border: '1px solid rgba(196, 151, 59, 0.2)',
        color: 'var(--ayu-brown-900)',
      },
    });
  },
  cosmic: (message: string, description?: string) => {
    toast(message, {
      description,
      icon: '🔮',
      style: {
        background: 'linear-gradient(135deg, var(--ayu-cream) 0%, var(--ayu-cream-dark) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        color: 'var(--ayu-brown-900)',
      },
    });
  },
};
