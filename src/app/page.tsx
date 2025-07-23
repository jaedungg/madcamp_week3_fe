import Image from 'next/image';
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/chart');
  return (
    <div className="font-sans items-center justify-items-center min-h-screen">
      Hello World!
    </div>
  );
}
