import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Pirca | Mood Tracking',
  description: 'Track your daily mood with a beautiful, minimalist interface',
  appleWebApp: {
    title: 'Pirca',
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
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-background antialiased">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
} 