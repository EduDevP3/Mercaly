'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Awakener() {
  const router = useRouter();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tribuna-back-nfl9.onrender.com/api/v1';
    
    console.log('Data cargada local, llamando a Render...');

    // Fire and forget ping with 2 minute timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes (120000 ms)

    fetch(`${apiUrl}/ping`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Ping failed');
        clearTimeout(timeoutId);
        console.log('Render ya cargado');
        // Set cookie to indicate backend is ready (expires in 1 hour)
        document.cookie = "backend_ready=true; path=/; max-age=3600";
        // Refresh the page to trigger server components re-fetch
        router.refresh();
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
             console.warn('Wake-up ping timed out after 2 minutes');
        } else {
             console.warn('Wake-up ping failed:', err);
        }
      });

      return () => clearTimeout(timeoutId);
  }, [router]);

  return null;
}
