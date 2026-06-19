'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './settings.module.css';

interface Master {
  id: string;
  name: string;
  role: string;
  bio?: string | null;
  photo?: string | null;
  active: boolean;
  sortOrder: number;
}

interface MasterForm {
  name: string;
  role: string;
  bio: string;
  photoFile: File | null;
  photoUrl: string;
}

const EMPTY_FORM: MasterForm = { name: '', role: '', bio: '', photoFile: null, photoUrl: '' };

async function uploadPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', 'master');
  const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  const { url } = (await res.json()) as { url: string };
  return url;
}

export default function MastersTab() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<MasterForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MasterForm>(EMPTY_FORM);
  const addPhotoRef = useRef<HTMLInputElement>(null);
  const editPhotoRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/masters');
    if (r.ok) setMasters((await r.json()) as Master[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const setAdd = <K extends keyof MasterForm>(k: K, v: MasterForm[K]) =>
    setAddForm((p) => ({ ...p, [k]: v }));
  const setEdit = <K extends keyof MasterForm>(k: K, v: MasterForm[K]) =>
    setEditForm((p) => ({ ...p, [k]: v }));

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdd('photoFile', file);
    setAdd('photoUrl', URL.createObjectURL(file));
  };

  const handleEditPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEdit('photoFile', file);
    setEdit('photoUrl', URL.createObjectURL(file));
  };

  const submitAdd = async () => {
    if (!addForm.name.trim() || !addForm.role.trim()) return;
    setSaving(true);
    try {
      let photo: string | undefined;
      if (addForm.photoFile) photo = await uploadPhoto(addForm.photoFile);
      await fetch('/api/admin/masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addForm.name, role: addForm.role, bio: addForm.bio || null, photo }),
      });
      setAddForm(EMPTY_FORM);
      if (addPhotoRef.current) addPhotoRef.current.value = '';
      setShowAdd(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (m: Master) => {
    setEditingId(m.id);
    setEditForm({ name: m.name, role: m.role, bio: m.bio ?? '', photoFile: null, photoUrl: m.photo ?? '' });
  };

  const submitEdit = async (id: string) => {
    setSaving(true);
    try {
      let photo: string | undefined = editForm.photoUrl || undefined;
      if (editForm.photoFile) photo = await uploadPhoto(editForm.photoFile);
      await fetch(`/api/admin/masters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name, role: editForm.role, bio: editForm.bio || null, photo }),
      });
      setEditingId(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (m: Master) => {
    await fetch(`/api/admin/masters/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !m.active }),
    });
    setMasters((prev) => prev.map((x) => (x.id === m.id ? { ...x, active: !m.active } : x)));
  };

  const remove = async (m: Master) => {
    if (!confirm(`Vymazať majstra "${m.name}"?`)) return;
    await fetch(`/api/admin/masters/${m.id}`, { method: 'DELETE' });
    setMasters((prev) => prev.filter((x) => x.id !== m.id));
  };

  if (loading) return <p style={{ color: '#888', fontSize: 14 }}>Načítavam...</p>;

  return (
    <>
      {/* Add form toggle */}
      {!showAdd && (
        <button type="button" className={styles.saveBtn} onClick={() => setShowAdd(true)} style={{ marginBottom: 4 }}>
          + Pridať majstra
        </button>
      )}

      {/* Add form */}
      {showAdd && (
        <div className={styles.addForm}>
          <p className={styles.addFormTitle}>Nový majster</p>
          <div className={styles.addFormRow}>
            <label className={styles.field} style={{ flex: 1, minWidth: 140 }}>
              <span className={styles.label}>Meno *</span>
              <input className={styles.input} value={addForm.name} onChange={(e) => setAdd('name', e.target.value)} placeholder="Martin" />
            </label>
            <label className={styles.field} style={{ flex: 1, minWidth: 140 }}>
              <span className={styles.label}>Rola *</span>
              <input className={styles.input} value={addForm.role} onChange={(e) => setAdd('role', e.target.value)} placeholder="Senior barber" />
            </label>
            <label className={styles.field} style={{ flex: 1, minWidth: 140 }}>
              <span className={styles.label}>Bio</span>
              <input className={styles.input} value={addForm.bio} onChange={(e) => setAdd('bio', e.target.value)} placeholder="Skúsenosti, špeciality..." />
            </label>
            <div className={styles.field} style={{ justifyContent: 'flex-end' }}>
              <span className={styles.label}>Foto</span>
              <label className={styles.photoUploadLabel}>
                <input ref={addPhotoRef} type="file" accept="image/*" onChange={handleAddPhoto} />
                {addForm.photoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={addForm.photoUrl} alt="" className={styles.photoPreview} />
                ) : '↑ Foto'}
              </label>
            </div>
          </div>
          <div className={styles.addFormActions}>
            <button type="button" className={styles.saveBtn} onClick={submitAdd} disabled={saving || !addForm.name.trim() || !addForm.role.trim()}>
              {saving ? 'Ukladám...' : 'Uložiť'}
            </button>
            <button type="button" className={styles.outlineBtn} onClick={() => { setShowAdd(false); setAddForm(EMPTY_FORM); }}>
              Zrušiť
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className={styles.masterList}>
        {masters.length === 0 && <p style={{ color: '#888', fontSize: 14 }}>Žiadni majstri.</p>}
        {masters.map((m) => (
          <div key={m.id}>
            {editingId === m.id ? (
              /* Inline edit form */
              <div className={styles.addForm}>
                <p className={styles.addFormTitle}>Upraviť: {m.name}</p>
                <div className={styles.addFormRow}>
                  <label className={styles.field} style={{ flex: 1, minWidth: 140 }}>
                    <span className={styles.label}>Meno</span>
                    <input className={styles.input} value={editForm.name} onChange={(e) => setEdit('name', e.target.value)} />
                  </label>
                  <label className={styles.field} style={{ flex: 1, minWidth: 140 }}>
                    <span className={styles.label}>Rola</span>
                    <input className={styles.input} value={editForm.role} onChange={(e) => setEdit('role', e.target.value)} />
                  </label>
                  <label className={styles.field} style={{ flex: 1, minWidth: 140 }}>
                    <span className={styles.label}>Bio</span>
                    <input className={styles.input} value={editForm.bio} onChange={(e) => setEdit('bio', e.target.value)} />
                  </label>
                  <div className={styles.field} style={{ justifyContent: 'flex-end' }}>
                    <span className={styles.label}>Foto</span>
                    <label className={styles.photoUploadLabel}>
                      <input ref={editPhotoRef} type="file" accept="image/*" onChange={handleEditPhoto} />
                      {editForm.photoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={editForm.photoUrl} alt="" className={styles.photoPreview} />
                      ) : '↑ Foto'}
                    </label>
                  </div>
                </div>
                <div className={styles.addFormActions}>
                  <button type="button" className={styles.saveBtn} onClick={() => submitEdit(m.id)} disabled={saving}>
                    {saving ? 'Ukladám...' : 'Uložiť'}
                  </button>
                  <button type="button" className={styles.outlineBtn} onClick={() => setEditingId(null)}>
                    Zrušiť
                  </button>
                </div>
              </div>
            ) : (
              /* Master row */
              <div className={`${styles.masterRow} ${!m.active ? styles.masterInactive : ''}`}>
                {m.photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={m.photo} alt={m.name} className={styles.masterPhoto} />
                ) : (
                  <div className={styles.masterPhotoPlaceholder}>{m.name[0]}</div>
                )}
                <div className={styles.masterInfo}>
                  <div className={styles.masterName}>{m.name}</div>
                  <div className={styles.masterRole}>{m.role}</div>
                </div>
                <div className={styles.masterActions}>
                  <button type="button" className={styles.outlineBtn} onClick={() => toggleActive(m)}>
                    {m.active ? 'Skryť' : 'Zobraziť'}
                  </button>
                  <button type="button" className={styles.outlineBtn} onClick={() => startEdit(m)}>
                    Upraviť
                  </button>
                  <button type="button" className={styles.dangerBtn} onClick={() => remove(m)}>
                    Zmazať
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
