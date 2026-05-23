import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Trash2, BarChart3, Building2, FileText } from 'lucide-react';
import api from '../api/client';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setProfile(data);
    } catch (err) {
      setError('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/delete-account');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      setError('Erreur lors de la suppression du compte');
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Informations Personnelles
        </h1>
        <p className="text-slate-900 dark:text-white font-medium">Gérez vos données et votre compte</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                <User size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Mail size={16} />
                  <span>{profile.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400 dark:text-slate-500 text-sm mb-1 flex items-center gap-2">
                  <Shield size={14} /> Rôle
                </div>
                <div className="font-bold text-slate-900 dark:text-white capitalize">{profile.role.toLowerCase()}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400 dark:text-slate-500 text-sm mb-1 flex items-center gap-2">
                  <Calendar size={14} /> Membre depuis
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {new Date(profile.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-8 border-red-200/50 dark:border-red-900/30">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <Trash2 size={20} /> Zone de danger
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              La suppression de votre compte est définitive. Toutes vos données (sites, BSD, historique) seront supprimées sans possibilité de récupération.
            </p>
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="btn bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white border-none w-full sm:w-auto"
              >
                Supprimer mon compte
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleDeleteAccount}
                  className="btn bg-red-600 text-white hover:bg-red-700 border-none"
                >
                  Confirmer la suppression
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border-none"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stats */}
        <div className="space-y-6">
          <div className="glass-card p-8 bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-none shadow-xl shadow-purple-500/20">
            <BarChart3 className="mb-6 opacity-80" size={32} />
            <h3 className="text-lg font-bold mb-6">Statistiques d'activité</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <Building2 size={20} />
                  <span className="font-medium">Sites créés</span>
                </div>
                <span className="text-2xl font-black">{profile.stats.totalSites}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <FileText size={20} />
                  <span className="font-medium">BSD générés</span>
                </div>
                <span className="text-2xl font-black">{profile.stats.totalBSDs}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
