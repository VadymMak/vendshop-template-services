'use client';

import styles from './AdminLoading.module.css';

interface AdminLoadingProps {
  rows?: number;
  label?: string;
}

export default function AdminLoading({ rows = 5, label }: AdminLoadingProps) {
  return (
    <div className={styles.root}>
      <div className={styles.spinner} aria-hidden="true" />
      {label && <p className={styles.label}>{label}</p>}
      {rows > 0 && (
        <div className={styles.skeletons}>
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}
    </div>
  );
}
