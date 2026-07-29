'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QualityPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/owner/dashboard'); }, [router]);
  return null;
}
