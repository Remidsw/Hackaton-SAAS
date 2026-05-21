import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ChevronLeft, Building } from 'lucide-react';

export default function CreateSite() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companySiret, setCompanySiret] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim() || name.length < 3) return 'Le nom du chantier doit faire au moins 3 caractères';
    if (!companyName.trim()) return "Le nom de l'entreprise est obligatoire";
    if (!/^\d{14}$/.test(companySiret.replace(/\s/g, ''))) return 'Le SIRET doit contenir exactement 14 chiffres';
    if (!address.trim() || address.length < 5) return "L'adresse semble incomplète";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await api.post('/bsd/sites', { 
        name: name.trim(), 
        address: address.trim(), 
        companyName: companyName.trim(), 
        companySiret: companySiret.replace(/\s/g, '') 
      });
      navigate('/dashboard');
    } catch (error) {
      setError('Erreur lors de la création du chantier');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <header className="mb-10 pt-8">
        <button onClick={() => navigate(-1)} className="btn btn-secondary inline-flex items-center gap-2 mb-6 text-sm">
          <ChevronLeft size={18} /> Retour
        </button>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-700 rounded-2xl shadow-lg shadow-purple-900/30">
            <Building className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Ajouter un Chantier</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Configurez un nouveau lieu d'intervention</p>
          </div>
        </div>
      </header>

      <div className="glass-card p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30 animate-shake">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nom du chantier</label>
              <input 
                type="text" 
                className="input" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="ex: Rénovation Ecole"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nom de l'entreprise</label>
              <input 
                type="text" 
                className="input" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                placeholder="ex: BTP Services SAS"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SIRET Entreprise</label>
            <input 
              type="text" 
              className="input" 
              value={companySiret}
              onChange={(e) => setCompanySiret(e.target.value)}
              required
              placeholder="123 456 789 00012"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Adresse complète</label>
            <input 
              type="text" 
              className="input" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="12 rue des Alpes, 75000 Paris"
            />
          </div>
          
          <button type="submit" className="w-full btn btn-primary py-5 text-xl shadow-2xl shadow-purple-900/40">
            Créer le chantier
          </button>
        </form>
      </div>
    </div>
  );
}
