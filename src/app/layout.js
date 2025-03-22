import './globals.css';

export const metadata = {
  title: 'inzendia | Mood Tracking',
  description: 'Track your daily mood with a beautiful, minimalist interface',
  appleWebApp: {
    title: 'inzendia',
    statusBarStyle: 'default',
    startupImage: [
      '/apple-splash.png',
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-background antialiased">
          {children}
        </div>
      </body>
    </html>
  );
} 