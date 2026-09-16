import AuthGate from '@/components/admin/AuthGate';
import AdminNav from '@/components/admin/AdminNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="min-h-screen bg-porcelain">
        <AdminNav />
        <div className="mx-auto max-w-content px-6 py-10">{children}</div>
      </div>
    </AuthGate>
  );
}