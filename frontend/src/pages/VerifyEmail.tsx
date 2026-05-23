import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function VerifyEmail() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [debugCode, setDebugCode] = useState(location.state?.debugCode);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setMessage('');
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setError('Veuillez entrer le code complet à 6 chiffres');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-email', { email, code: fullCode });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { data } = await api.post('/auth/resend-code', { email });
      setMessage(data.message);
      if (data.debugCode) {
        setDebugCode(data.debugCode);
      }
      setCooldown(30);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du renvoi du code');
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Vérification</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Un code a été envoyé à :</p>
          <p className="text-purple-700 dark:text-purple-400 font-bold">{email}</p>
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

        {debugCode && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm border border-blue-100 dark:border-blue-900/30">
            <p className="font-bold mb-1">Debug Mode (Hackathon):</p>
            <p>Votre code est : <span className="font-mono text-lg tracking-widest">{debugCode}</span></p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 text-lg disabled:opacity-50">
            {loading ? 'Vérification...' : 'Vérifier mon compte'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Vous n'avez pas reçu le code ?{' '}
            <button 
              onClick={handleResend} 
              disabled={loading || cooldown > 0}
              className="text-purple-700 dark:text-purple-400 font-bold hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0 ? `Renvoyer (${cooldown}s)` : 'Renvoyer le code'}
            </button>
          </p>
          <button onClick={() => navigate('/login')} className="text-slate-500 dark:text-slate-400 hover:text-purple-700 dark:hover:text-purple-400 font-medium">
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
