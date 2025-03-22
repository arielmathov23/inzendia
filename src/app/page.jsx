import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to mood tracking page
  redirect('/mood-tracking');
} 