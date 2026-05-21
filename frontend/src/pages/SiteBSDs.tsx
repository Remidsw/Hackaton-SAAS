import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ChevronLeft, Download, FileText, Calendar, Trash2 } from 'lucide-react';
import { generateBSDPDF } from '../utils/pdfGenerator';

interface BSD {
  id: number;
  wasteType: string;
  volume: string;
  createdAt: string;
  carrierName: string;
  outletName: string;
  [key: string]: any;
}

export default function SiteBSDs() {
  const { siteId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [site, setSite] = useState<any>(location.state?.site);
  const [bsds, setBsds] = useState<BSD[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce bordereau ?')) return;
    
    try {
      await api.delete(`/bsd/${id}`);
      setBsds(prev => prev.filter(bsd => bsd.id !== id));
    } catch (error) {
      alert('Erreur lors de la suppression du BSD');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch site details if missing
        if (!site) {
          const sitesRes = await api.get('/bsd/sites');
          const currentSite = sitesRes.data.find((s: any) => s.id === parseInt(siteId!));
          if (currentSite) setSite(currentSite);
        }

        const { data } = await api.get(`/bsd/history/${siteId}`);
        setBsds(data);
      } catch (error) {
        console.error('Error fetching BSD history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [siteId, site]);

  return (
    <div className="p-4 max-w-3xl mx-auto pb-24">
      <header className="mb-10 pt-8">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary inline-flex items-center gap-2 mb-6 text-sm">
          <ChevronLeft size={18} /> Retour
        </button>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-700 rounded-2xl shadow-lg shadow-purple-900/30">
            <FileText className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Historique BSD</h1>
            <p className="text-purple-700 dark:text-purple-400 font-bold flex items-center gap-2 mt-1 italic">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              Chantier : {site?.name}
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-700 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">Chargement des bordereaux...</p>
        </div>
      ) : bsds.length === 0 ? (
        <div className="glass-card p-12 text-center border-2 border-dashed border-slate-200/50 dark:border-slate-800/50">
          <div className="bg-slate-50 dark:bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Aucun bordereau</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">Vous n'avez pas encore créé de bordereau pour ce chantier.</p>

          <button 
            onClick={() => navigate(`/create-bsd/${siteId}`, { state: { site } })}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            + Créer le premier BSD
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bsds.map((bsd) => (
            <div key={bsd.id} className="glass-card p-6 transition-all hover:shadow-2xl hover:shadow-purple-900/10 dark:hover:shadow-purple-500/10 group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-bold text-2xl text-slate-800 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors mb-2">{bsd.wasteType}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
                    <Calendar size={16} className="text-purple-700 dark:text-purple-500" /> 
                    {new Date(bsd.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    {new Date(bsd.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-black px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-800/50 shadow-sm">
                  {bsd.volume}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6">
                <div className="space-y-1">
                  <span className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Transporteur</span>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{bsd.carrierName}</p>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Destination</span>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{bsd.outletName}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => generateBSDPDF(bsd)}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-3 py-4 text-base"
                >
                  <Download size={20} /> Télécharger le BSD (PDF)
                </button>
                <button 
                  onClick={() => handleDelete(bsd.id)}
                  className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors shadow-sm active:scale-95"
                  title="Supprimer ce BSD"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={() => navigate(`/create-bsd/${siteId}`, { state: { site } })}
        className="fixed bottom-8 right-8 w-16 h-16 bg-purple-700 text-white rounded-2xl shadow-2xl shadow-purple-900/40 flex items-center justify-center hover:bg-purple-800 hover:scale-110 active:scale-95 transition-all z-50 group"
        title="Créer un nouveau BSD"
      >
        <FileText size={32} className="group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}
