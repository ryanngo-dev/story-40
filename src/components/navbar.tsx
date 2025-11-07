'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur dark:bg-gray-950/95 shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            Story40
          </Link>

          <div className="flex gap-2">
            <Link href="/">
              <Button variant={pathname === '/' ? 'default' : 'ghost'}>
                Write
              </Button>
            </Link>
            <Link href="/history">
              <Button variant={pathname === '/history' ? 'default' : 'ghost'}>
                My Stories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
