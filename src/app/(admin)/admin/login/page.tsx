import type { Metadata } from 'next';
import LoginForm from '@/components/admin/LoginForm/LoginForm';

export const metadata: Metadata = {
  title: 'Вхід — Admin ElectroMarket',
  robots: { index: false, follow: false },
};

// Standalone login page — root admin layout only (no sidebar shell).
export default function AdminLoginPage() {
  return <LoginForm />;
}
