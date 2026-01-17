import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { AdminNav } from '@/components/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNav />
      <main className="p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
