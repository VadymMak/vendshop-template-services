import AdminSidebar from '@/components/admin/AdminSidebar/AdminSidebar';
import styles from './admin.module.css';

// Authenticated panel shell — sidebar + content. Wraps every admin section
// except /admin/login (which lives outside this group).
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
