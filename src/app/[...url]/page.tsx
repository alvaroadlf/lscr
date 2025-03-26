'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CleanPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (!params.url) {
      console.error('No URL provided in params');
      router.replace('/proxy'); // Redirige a una página predeterminada
      return;
    }

    const segments = Array.isArray(params.url) ? params.url : [params.url];
    let fullUrl = segments.join('/');

    // Corrige el problema con http:/ y https:/ convirtiéndolos en http:// y https://
    if (fullUrl.startsWith('http:/') && !fullUrl.startsWith('http://')) {
      fullUrl = fullUrl.replace('http:/', 'http://');
    } else if (fullUrl.startsWith('https:/') && !fullUrl.startsWith('https://')) {
      fullUrl = fullUrl.replace('https:/', 'https://');
    }

    // Normaliza cualquier barra duplicada en la URL
    fullUrl = fullUrl.replace(/([^:])\/{2,}/g, '$1/');

    try {
      // Decodifica la URL para asegurarte de que no esté codificada
      const decodedUrl = decodeURIComponent(fullUrl);

      // Verifica que la URL sea válida
      const validatedUrl = new URL(decodedUrl);

      // Redirige a /proxy con la URL completa como parámetro de consulta
      router.replace(`/proxy?url=${validatedUrl.href}`);
    } catch (error) {
      console.error('Error processing URL:', error);
      router.replace('/proxy'); // Redirige a una página predeterminada en caso de error
    }
  }, [params, router]);

  return null; // No se renderiza ninguna interfaz de usuario
}