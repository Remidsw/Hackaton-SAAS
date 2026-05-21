import { jsPDF } from 'jspdf';

export const generateBSDPDF = (entry: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const site = entry.site;
  
  const drawBox = (x: number, y: number, w: number, h: number, title: string) => {
    doc.setLineWidth(0.1);
    doc.rect(x, y, w, h);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(title, x + 2, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
  };

  const drawCheckbox = (x: number, y: number, checked: boolean, label: string) => {
    doc.rect(x, y, 3, 3);
    if (checked) {
      doc.line(x, y, x + 3, y + 3);
      doc.line(x + 3, y, x, y + 3);
    }
    doc.text(label, x + 5, y + 2.5);
  };

  // Header
  doc.setFontSize(8);
  doc.text('cerfa', 15, 10);
  doc.setFontSize(6);
  doc.text('Formulaire CERFA n° 12571*01', 15, 13);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Bordereau de suivi des déchets', pageWidth / 2, 20, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 40, 22, pageWidth / 2 + 40, 22);

  // 1. Émetteur
  drawBox(10, 30, 95, 40, '1. Émetteur du bordereau');
  doc.text(`NOM : ${site?.companyName}`, 12, 40);
  doc.text(`N° SIRET : ${site?.companySiret || 'N/A'}`, 12, 44);
  doc.text(`ADRESSE : ${site?.address}`, 12, 48);
  doc.text(`Chantier : ${site?.name}`, 12, 52);

  // 2. Installation de destination
  drawBox(105, 30, 95, 40, '2. Installation de destination');
  doc.text(`NOM : ${entry.outletName}`, 107, 40);
  doc.text(`N° SIRET : ${entry.outletSiret}`, 107, 44);
  doc.text(`Adresse : ${entry.outletAddress}`, 107, 48);

  // 3. Dénomination du déchet
  drawBox(10, 72, 190, 20, '3. Dénomination du déchet');
  doc.text(`Rubrique déchet : ${entry.wasteCode}`, 12, 80);
  doc.text(`Dénomination usuelle : ${entry.wasteType}`, 60, 80);
  doc.text('Consistance :', 12, 86);
  drawCheckbox(35, 84, entry.consistance === 'solide', 'solide');
  drawCheckbox(55, 84, entry.consistance === 'liquide', 'liquide');
  drawCheckbox(75, 84, entry.consistance === 'gazeux', 'gazeux');

  // 4. Mentions ADR
  drawBox(10, 92, 190, 12, '4. Mentions au titre des règlements ADR, RID, ADNR, IMDG');
  doc.text(`${entry.adrMentions || 'Néant'}`, 12, 100);

  // 5. Conditionnement
  drawBox(10, 104, 190, 12, '5. Conditionnement');
  drawCheckbox(12, 110, entry.packaging === 'benne', 'benne');
  drawCheckbox(32, 110, entry.packaging === 'citerne', 'citerne');
  drawCheckbox(52, 110, entry.packaging === 'fût', 'fût');
  drawCheckbox(72, 110, !['benne', 'citerne', 'fût'].includes(entry.packaging), `autre (${entry.packaging})`);

  // 6. Quantité
  drawBox(10, 116, 190, 12, '6. Quantité');
  drawCheckbox(12, 122, entry.quantityType === 'réelle', 'réelle');
  drawCheckbox(32, 122, entry.quantityType === 'estimée', 'estimée');
  doc.text(`Poids / Volume : ${entry.volume}`, 80, 122);

  // 8. Collecteur-transporteur
  drawBox(10, 130, 190, 25, '8. Collecteur-transporteur');
  doc.text(`NOM : ${entry.carrierName}`, 12, 138);
  doc.text(`N° SIREN/SIRET : ${entry.carrierSiret}`, 12, 143);
  doc.text(`Date de prise en charge : ${new Date(entry.createdAt).toLocaleDateString()} à ${new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 120, 138);

  // 9. Déclaration / Signature
  drawBox(10, 157, 190, 55, '9. Déclaration générale de l\'émetteur / Signature');
  doc.setFontSize(6);
  doc.text('Je soussigné certifie que les renseignements portés dans les cadres ci-dessus sont exacts et établis de bonne foi.', 12, 165);
  
  if (entry.signatureData) {
    doc.setFontSize(8);
    doc.text('Signature et cachet du responsable déchetterie :', 110, 175);
    doc.addImage(entry.signatureData, 'PNG', 110, 180, 60, 25);
  }

  doc.setFontSize(8);
  doc.text(`Fait à : ${entry.signingCity}`, 12, 205);
  doc.text(`Le : ${new Date(entry.createdAt).toLocaleDateString()} à ${new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 60, 205);

  // Footer
  doc.setFontSize(6);
  doc.text('L\'original du bordereau suit le déchet.', pageWidth / 2, 280, { align: 'center' });

  doc.save(`BSD_CERTIFIE_${site?.name}_${new Date(entry.createdAt).getTime()}.pdf`);
};
