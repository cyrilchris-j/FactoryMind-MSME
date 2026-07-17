'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F3A5F] mx-auto"></div>
        <p className="mt-4 text-[#6B7280]">Loading...</p>
      </div>
    </div>
  );
}
