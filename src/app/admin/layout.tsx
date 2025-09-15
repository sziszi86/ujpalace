
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/components/admin/Alert';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AlertProvider>
        <SimpleAdminLayout>{children}</SimpleAdminLayout>
      </AlertProvider>
    </AuthProvider>
  );
}