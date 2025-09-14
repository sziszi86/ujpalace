
import AdminLayout from '@/components/admin/AdminLayout';
import { AuthProvider } from '@/contexts/AuthContext';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  );
}