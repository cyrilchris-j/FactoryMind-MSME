'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AlertsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/owner/dashboard'); }, [router]);
  return null;
}
