'use client';

import { Toaster as SonnerToaster } from '@/components/ui/sonner';

/**
 * CosmicToast — wraps the Sonner Toaster with AyuAstro-specific defaults.
 * Place this component once at the root layout level.
 */
export default function CosmicToast() {
  return (
    <SonnerToaster
      position="top-center"
      richColors={false}
      closeButton
      toastOptions={{
        duration: 4000,
        className: 'cosmic-toast',
      }}
    />
  );
}
