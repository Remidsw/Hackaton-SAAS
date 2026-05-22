import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugToken, setDebugToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      if (data.debugToken) {
        setDebugToken(data.debugToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Mot de passe oublié</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Entrez votre email pour réinitialiser</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm border border-green-100 dark:border-green-900/30">
            {message}
          </div>
        )}

        {debugToken && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm border border-blue-100 dark:border-blue-900/30 overflow-hidden">
            <p className="font-bold mb-1">Debug Mode (Hackathon):</p>
            <Link to={`/reset-password/${debugToken}`} className="underline break-all">
              Cliquez ici pour réinitialiser
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="chef@chantier.fr"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 text-lg disabled:opacity-50">
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-purple-700 dark:text-purple-400 font-bold hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
