import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserRole } from '../types';

export function CompleteProfile() {
  const { user, profile, loading: authLoading, reloadProfile } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('mahasiswa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
    }
  }, [user]);

  useEffect(() => {
    // If somehow they already have a profile, send them home
    if (!authLoading && profile) {
      navigate('/', { replace: true });
    }
  }, [profile, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name || user.displayName || 'New User',
        email: user.email,
        role: role,
        createdAt: new Date().toISOString()
      });
      
      // Reload profile in AuthContext
      await reloadProfile();
      
      navigate('/', { replace: true });
    } catch (err: any) {
      setError('Gagal melengkapi profile. Silakan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-campus-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-campus-blue rounded-2xl text-white text-3xl font-black mb-6 shadow-xl shadow-blue-900/20">K</div>
          <h2 className="editorial-title text-4xl font-bold text-campus-blue">Lengkapi Pendaftaran</h2>
          <p className="text-gray-500 mt-2 text-sm">Mohon lengkapi beberapa detail untuk menyelesaikan akun Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Nama Lengkap" 
            placeholder="Contoh: Budi Santoso" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe Akun</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('mahasiswa')}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                  role === 'mahasiswa' ? 'border-campus-blue bg-blue-50 text-campus-blue' : 'border-gray-100 text-gray-500 hover:border-gray-300'
                }`}
              >
                Mahasiswa/User
              </button>
              <button
                type="button"
                onClick={() => setRole('panitia')}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                  role === 'panitia' ? 'border-campus-blue bg-blue-50 text-campus-blue' : 'border-gray-100 text-gray-500 hover:border-gray-300'
                }`}
              >
                Panitia/Organizer
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {role === 'mahasiswa' 
                ? 'Ikuti event, berinteraksi dengan yang lain, dan dapatkan update terbaru.' 
                : 'Buat dan kelola event untuk kampus Anda.'}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full py-4 text-lg"
            loading={loading}
          >
            {loading ? 'Menyimpan...' : 'Selesaikan Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
