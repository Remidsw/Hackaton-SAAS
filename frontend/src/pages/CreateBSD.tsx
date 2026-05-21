import React, { useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { ChevronLeft, Save, FileText } from 'lucide-react';
import api from '../api/client';

export default function CreateBSD() {
  const { siteId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [site, setSite] = useState<any>(location.state?.site);

  // 2. Installation de destination
  const [outletName, setOutletName] = useState('');
  const [outletSiret, setOutletSiret] = useState('');
  const [outletAddress, setOutletAddress] = useState('');

  // 3. Dénomination du déchet
  const [wasteCode, setWasteCode] = useState('17 01 01'); 
  const [wasteType, setWasteType] = useState('Gravats propres');
  const [consistance, setConsistance] = useState('solide');

  // 4. Mentions ADR
  const [adrMentions, setAdrMentions] = useState('');

  // 5. Conditionnement
  const [packaging, setPackaging] = useState('benne');

  // 6. Quantité
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('t');
  const [quantityType, setQuantityType] = useState('réelle');
  
  // 8. Collecteur-transporteur
  const [carrierName, setCarrierName] = useState('');
  const [carrierSiret, setCarrierSiret] = useState('');
  
  // 9. Signature / Ville
  const [signingCity, setSigningCity] = useState('');
  const [error, setError] = useState('');
  const sigPad = useRef<any>(null);

  React.useEffect(() => {
    if (!site) {
      api.get('/bsd/sites').then(res => {
        const currentSite = res.data.find((s: any) => s.id === parseInt(siteId!));
        if (currentSite) setSite(currentSite);
      });
    }
  }, [siteId, site]);

  const validateForm = () => {
    if (!outletName.trim()) return "Le nom de l'installation de destination est obligatoire";
    if (!/^\d{14}$/.test(outletSiret.replace(/\s/g, ''))) return "Le SIRET de l'installation doit contenir 14 chiffres";
    if (!outletAddress.trim()) return "L'adresse de destination est obligatoire";
    
    if (!wasteCode.trim()) return "Le code déchet est obligatoire";
    if (!wasteType.trim()) return "La dénomination du déchet est obligatoire";
    
    if (!quantity.trim() || isNaN(Number(quantity.replace(',', '.')))) return "La quantité doit être un nombre valide";
    
    if (!carrierName.trim()) return "Le nom du transporteur est obligatoire";
    const cleanCarrierSiret = carrierSiret.replace(/\s/g, '');
    if (!/^\d{9}$|^\d{14}$/.test(cleanCarrierSiret)) return "Le SIRET/SIREN du transporteur doit contenir 9 ou 14 chiffres";
    
    if (!signingCity.trim()) return "La ville de signature est obligatoire";
    if (!sigPad.current || sigPad.current.isEmpty()) return "La signature est obligatoire";
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const signatureData = sigPad.current.getCanvas().toDataURL('image/png');

    try {
      await api.post('/bsd/create', {
        siteId,
        wasteCode: wasteCode.trim(),
        wasteType: wasteType.trim(),
        adrMentions: adrMentions.trim(),
        consistance,
        packaging,
        volume: `${quantity} ${unit}`,
        quantityType,
        carrierName: carrierName.trim(),
        carrierSiret: carrierSiret.replace(/\s/g, ''),
        outletName: outletName.trim(),
        outletSiret: outletSiret.replace(/\s/g, ''),
        outletAddress: outletAddress.trim(),
        signingCity: signingCity.trim(),
        signatureData,
      });

      alert('BSD créé avec succès !');
      navigate(`/site-bsds/${siteId}`, { state: { site } });
    } catch (error) {
      setError('Erreur lors de la création du BSD');
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto pb-20">
      <header className="mb-10 pt-8">
        <button onClick={() => navigate(-1)} className="btn btn-secondary inline-flex items-center gap-2 mb-6 text-sm">
          <ChevronLeft size={18} /> Retour
        </button>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-700 rounded-2xl shadow-lg shadow-purple-900/30">
            <FileText className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Nouveau Bordereau</h1>
            <p className="text-slate-900 dark:text-white font-bold flex items-center gap-2 mt-1 italic">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              Chantier : {site?.name}
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30 animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Cadre 1: Émetteur */}
        <div className="glass-card p-6 bg-slate-900/5 dark:bg-white/5 border-slate-900/10 dark:border-white/10 shadow-none">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-widest">1. Émetteur du bordereau</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">Entreprise</p>
              <p className="font-semibold text-slate-900 dark:text-white">{site?.companyName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">SIRET</p>
              <p className="font-semibold text-slate-900 dark:text-white">{site?.companySiret || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">Adresse</p>
              <p className="font-semibold text-slate-900 dark:text-white">{site?.address}</p>
            </div>
          </div>
        </div>

        {/* Cadre 2: Destination */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 text-sm uppercase tracking-wider">2. Installation de destination</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Nom de l'installation</label>
              <input type="text" className="input" value={outletName} onChange={(e) => setOutletName(e.target.value)} required placeholder="ex: Centre de Recyclage IdF" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">N° SIRET</label>
              <input type="text" className="input" value={outletSiret} onChange={(e) => setOutletSiret(e.target.value)} required placeholder="14 chiffres" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Adresse complète</label>
              <input type="text" className="input" value={outletAddress} onChange={(e) => setOutletAddress(e.target.value)} required placeholder="Ville, Code Postal..." />
            </div>
          </div>
        </div>

        {/* Cadre 3: Dénomination du déchet */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 text-sm uppercase tracking-wider">3. Dénomination du déchet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Rubrique Déchet (Code)</label>
              <input type="text" className="input" value={wasteCode} onChange={(e) => setWasteCode(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Dénomination usuelle</label>
              <input type="text" className="input" value={wasteType} onChange={(e) => setWasteType(e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Consistance</label>
              <div className="grid grid-cols-3 gap-3">
                {['solide', 'liquide', 'gazeux'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setConsistance(type)}
                    className={`py-3 rounded-xl font-bold capitalize transition-all ${
                      consistance === type 
                      ? 'bg-purple-700 text-white shadow-md shadow-purple-900/30' 
                      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cadre 6: Quantité & Conditionnement */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 text-sm uppercase tracking-wider">4. Conditionnement & Quantité</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Conditionnement</label>
              <select className="input" value={packaging} onChange={(e) => setPackaging(e.target.value)}>
                <option value="benne">Benne</option>
                <option value="citerne">Citerne</option>
                <option value="fût">Fût</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Quantité</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="input flex-1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value.replace(/[^-0-9,.]/g, ''))} 
                  required 
                  placeholder="ex: 5.5" 
                />
                <select 
                  className="input w-32" 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="t">Tonne(s)</option>
                  <option value="m³">m³</option>
                  <option value="kg">Kilo(s)</option>
                  <option value="L">Litre(s)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Cadre 7: Collecteur-transporteur */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 text-sm uppercase tracking-wider">5. Collecteur-transporteur</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Nom du transporteur</label>
              <input type="text" className="input" value={carrierName} onChange={(e) => setCarrierName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">N° SIREN / SIRET</label>
              <input type="text" className="input" value={carrierSiret} onChange={(e) => setCarrierSiret(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Cadre 9: Signature & Ville */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 text-sm uppercase tracking-wider">6. Certification & Signature</h2>
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Fait à (Ville)</label>
            <input type="text" className="input" value={signingCity} onChange={(e) => setSigningCity(e.target.value)} required placeholder="ex: Paris" />
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Signature tactile</label>
            <div className="border-2 border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden ring-purple-700/20 focus-within:ring-4 transition-all">
              <SignatureCanvas 
                ref={sigPad}
                penColor={document.documentElement.classList.contains('dark') ? '#a855f7' : '#7e22ce'}
                canvasProps={{className: 'sigCanvas w-full h-48 cursor-crosshair'}} 
              />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => sigPad.current?.clear()} className="text-xs text-red-500 dark:text-red-400 font-bold uppercase hover:text-red-600 transition-colors py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                Effacer la signature
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full btn btn-primary flex items-center justify-center gap-3 py-6 text-xl shadow-2xl shadow-purple-900/40">
          <Save size={28} /> Enregistrer le BSD
        </button>
      </form>
    </div>
  );
}
