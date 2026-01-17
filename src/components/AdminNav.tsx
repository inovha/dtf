'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';

export function AdminNav() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-xl font-bold text-white">
              DTF <span className="text-indigo-400">Admin</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-4">
              <Link 
                href="/admin" 
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Pedidos
              </Link>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </nav>
  );
}
