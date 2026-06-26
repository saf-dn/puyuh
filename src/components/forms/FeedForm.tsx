import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Camera } from 'lucide-react';

interface FeedFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { puyuhGroupId: string; photo: string; }) => Promise<void>;
  selectedGroup: { id: string; name: string; count: number } | null;
  isLoading: boolean;
}

export default function FeedForm({ isOpen, onClose, onSubmit, selectedGroup, isLoading }: FeedFormProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show loading state while compressing?
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimension 1000px
        const MAX_SIZE = 1000;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG, quality 0.7 to ensure < 1MB
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhoto(dataUrl);
      };
    };
    reader.onerror = () => {
      setError('Gagal membaca file gambar');
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedGroup?.id) {
      setError('Kelompok puyuh tidak valid');
      return;
    }

    if (!photo) {
      window.alert('Mohon ambil foto pakan terlebih dahulu!');
      return;
    }

    try {
      await onSubmit({
        puyuhGroupId: selectedGroup.id,
        photo,
      });

      // Reset
      setPhoto(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Beri Pakan">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Kelompok Puyuh</label>
          <input
            type="text"
            className="form-input"
            value={selectedGroup?.name || ''}
            disabled
            style={{ backgroundColor: 'var(--bg-secondary)', fontWeight: 'bold' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Foto Pakan (Bukti Harian)</label>
          
          <div style={{ marginTop: '0.5rem', marginBottom: '1rem', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '1rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
            {photo ? (
              <div>
                <img src={photo} alt="Bukti pakan" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }} />
                <button type="button" onClick={() => setPhoto(null)} style={{ marginTop: '0.5rem', display: 'block', width: '100%', padding: '0.5rem', backgroundColor: 'var(--danger-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hapus Foto</button>
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '2rem 1rem' }}>
                <Camera size={32} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-secondary)' }}>Ambil Foto / Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ backgroundColor: '#1565C0' }}
            disabled={isLoading || !photo}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Foto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
