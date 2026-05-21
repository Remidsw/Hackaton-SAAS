import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Calendar, Download, FileText, Trash2, MapPin } from 'lucide-react';
import { generateBSDPDF } from '../utils/pdfGenerator';

interface BSD {
  id: number;
  wasteType: string;
  volume: string;
  createdAt: string;
  carrierName: string;
  outletName: string;
  site: {
    name: string;
  };
  [key: string]: any;
}

export default function AllBSDs() {
  const navigate = useNavigate();
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
        const { data } = await api.get('/bsd/all');
        setBsds(data);
      } catch (error) {
        console.error('Error fetching all BSDs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24">
      <header className="mb-10 pt-8 text-center">
        <div className="inline-block p-4 bg-purple-700 rounded-3xl shadow-xl shadow-purple-900/30 mb-6">
          <FileText className="text-white" size={40} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Historique Global</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold italic">Tous vos bordereaux, tous chantiers confondus</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-700 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">Récupération de l'historique...</p>
        </div>
      ) : bsds.length === 0 ? (
        <div className="glass-card p-12 text-center border-2 border-dashed border-slate-200/50 dark:border-slate-800/50">
          <div className="bg-slate-50 dark:bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Aucun bordereau trouvé</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">Il n'y a pas encore de BSD enregistré dans le système.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Aller aux chantiers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bsds.map((bsd) => (
            <div key={bsd.id} className="glass-card p-6 transition-all hover:shadow-2xl hover:shadow-purple-900/10 dark:hover:shadow-purple-500/10 group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-[10px] font-black px-2 py-1 rounded-md border border-purple-100 dark:border-purple-800/50 flex items-center gap-1">
                    <MapPin size={12} />
                    {bsd.site.name}
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-800 text-purple-900 dark:text-purple-100 text-xs font-black px-3 py-1 rounded-lg shadow-sm">
                    {bsd.volume}
                  </div>
                </div>

                <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors mb-2">{bsd.wasteType}</h2>
                
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-2 mb-6">
                  <Calendar size={14} className="text-purple-700 dark:text-purple-500" /> 
                  {new Date(bsd.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  {new Date(bsd.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <span className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Transport</span>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{bsd.carrierName}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Dest.</span>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{bsd.outletName}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => generateBSDPDF(bsd)}
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2 py-3 text-xs"
                  >
                    <Download size={14} /> PDF
                  </button>
                  <button 
                    onClick={() => handleDelete(bsd.id)}
                    className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-colors shadow-sm active:scale-95"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
