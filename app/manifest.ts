import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Silo',
    short_name: 'Silo',
    description: 'Gamified Student Productivity App',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#534AB7', // Silo's primary purple
    icons: [
      {
        src: '/assets/mascots/neko_greeting_login_1781150904124.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/assets/mascots/neko_greeting_login_1781150904124.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
