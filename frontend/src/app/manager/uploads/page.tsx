'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BulkUploadPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/manager/data-entry?tab=upload');
  }, [router]);

  return null;
}
