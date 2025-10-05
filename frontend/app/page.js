import { redirect } from 'next/navigation';

export default function Home() {
  // Server component redirect to the login route
  redirect('/home');
}
