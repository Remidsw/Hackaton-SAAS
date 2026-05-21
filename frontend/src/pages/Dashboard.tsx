import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { HardHat, MapPin, Plus, FileText } from 'lucide-react';

interface Site {
  id: number;
  name: string;
  address: string;
  companyName: string;
}

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const { data } = await api.get('/bsd/sites');
        setSites(data);
      } catch (error) {
        console.error('Error fetching sites', error);
      }
    };
    fetchSites();
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <header className="flex justify-between items-end mb-10 pt-8">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-purple-700 rounded-xl shadow-lg shadow-purple-900/30">
              <HardHat className="text-white" size={28} />
            </div>
            Mes Chantiers
          </h1>
          <p className="text-slate-900 dark:text-white mt-2 font-medium">Gérez vos chantiers et bordereaux</p>
        </div>
        <button 
          onClick={() => navigate('/create-site')}
          className="p-4 bg-purple-700 text-white rounded-2xl shadow-xl shadow-purple-900/40 hover:bg-purple-800 hover:scale-105 transition-all active:scale-95"
          title="Ajouter un chantier"
        >
          <Plus size={28} />
        </button>
      </header>

      <div className="space-y-6">
        {sites.length === 0 && (
          <div className="text-center py-20 glass-card border-2 border-dashed border-slate-200/50 dark:border-slate-800/50 text-slate-400">
            <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-semibold text-lg dark:text-slate-300">Aucun chantier trouvé</p>
            <p className="text-sm">Commencez par en ajouter un nouveau</p>
          </div>
        )}
        {sites.map((site) => (
          <div 
            key={site.id} 
            className="glass-card p-6 transition-all group hover:shadow-2xl hover:shadow-purple-900/10 dark:hover:shadow-purple-500/10 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="font-bold text-2xl text-slate-800 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors mb-2">{site.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2 font-medium">
                  <MapPin size={16} className="text-purple-700 dark:text-purple-500" /> {site.address}
                </p>
                <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-bold px-3 py-1.5 rounded-lg mt-4 border border-purple-100 dark:border-purple-800/50">
                  <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                  {site.companyName}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate(`/site-bsds/${site.id}`, { state: { site } })}
                className="btn btn-secondary flex items-center justify-center gap-2 py-4"
              >
                <FileText size={18} className="text-purple-700 dark:text-purple-400" />
                Historique
              </button>
              <button 
                onClick={() => navigate(`/create-bsd/${site.id}`, { state: { site } })}
                className="btn btn-primary flex items-center justify-center gap-2 py-4"
              >
                <Plus size={18} />
                Nouveau BSD
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
