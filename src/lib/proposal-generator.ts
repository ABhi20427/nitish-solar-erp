import fs from 'fs';
import path from 'path';
import { EmailData } from './mailer';

function formatNum(n: number): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function truncate(str: string, max: number): string {
  if (!str) return str;
  return str.length > max ? str.slice(0, max - 1).trimEnd() + '…' : str;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Embed the real brand assets as base64 so the PDF never depends on network access at render
// time (a network-fetched image silently failing in production previously produced "missing pics").
const assetCache = new Map<string, string>();
function getAssetDataUri(relativePath: string, mime: string): string {
  const cached = assetCache.get(relativePath);
  if (cached !== undefined) return cached;
  let uri = '';
  try {
    const filePath = path.join(process.cwd(), 'public', relativePath);
    const buf = fs.readFileSync(filePath);
    uri = `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    uri = '';
  }
  assetCache.set(relativePath, uri);
  return uri;
}

export interface ProposalSpecs {
  quotNo: string;
  dateStr: string;
  targetKw: number;
  panelCount: number;
  panelWattage: number;
  inverterRating: number;
  totalProjectCost: number;
  subsidyAmount: number;
  netCost: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: string;
  sectorName: string;
}

export function calculateProposalSpecs(data: EmailData): ProposalSpecs {
  const quotNo = 'NS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Map Property Type to Sector
  let sectorName = 'Residential';
  const rawType = (data.propertyType || '').toUpperCase();
  if (rawType.includes('COMMERCIAL')) sectorName = 'Commercial';
  if (rawType.includes('INDUSTRIAL')) sectorName = 'Industrial';

  // Calculate Capacity kW
  let kw = Number(data.requiredCapacity) || 0;
  if (!kw || kw <= 0) {
    const bill = Number(data.monthlyBill) || 6000;
    const estUnits = Math.round(bill / 7.5);
    kw = Math.max(1, Math.round((estUnits / 120) * 2) / 2);
  }

  // Panel specs: 550W Mono PERC
  const panelWattage = 550;
  const panelCount = Math.ceil((kw * 1000) / panelWattage);
  const actualKwp = (panelCount * panelWattage) / 1000;

  // Rate per kW depending on sector & capacity
  let costPerKw = 55000;
  if (sectorName === 'Commercial') costPerKw = 48000;
  if (sectorName === 'Industrial') costPerKw = 42000;
  if (actualKwp > 25) costPerKw = Math.max(38000, costPerKw - 4000);

  const totalProjectCost = Math.round(actualKwp * costPerKw);

  // PM Surya Ghar Subsidy Calculation
  let subsidyAmount = 0;
  if (sectorName === 'Residential') {
    if (actualKwp >= 3) subsidyAmount = 78000;
    else if (actualKwp >= 2) subsidyAmount = 60000;
    else if (actualKwp >= 1) subsidyAmount = 30000;
  }

  const netCost = Math.max(0, totalProjectCost - subsidyAmount);
  const monthlySavings = Math.round(actualKwp * 120 * 7.5);
  const annualSavings = monthlySavings * 12;
  const paybackYears = annualSavings > 0 ? (netCost / annualSavings).toFixed(1) : '3.5';

  const standardInverters = [3, 5, 8, 10, 15, 20, 30, 50, 100];
  const inverterRating = standardInverters.find(r => r >= actualKwp) || Math.ceil(actualKwp);

  return {
    quotNo,
    dateStr,
    targetKw: actualKwp,
    panelCount,
    panelWattage,
    inverterRating,
    totalProjectCost,
    subsidyAmount,
    netCost,
    monthlySavings,
    annualSavings,
    paybackYears,
    sectorName
  };
}

export function generateProposalHtml(data: EmailData): { html: string; specs: ProposalSpecs } {
  const specs = calculateProposalSpecs(data);
  const customerName = escapeHtml(truncate(data.name || 'Valued Customer', 60));
  const siteAddress = escapeHtml(truncate(data.location || 'Site Location', 90));

  const logoImage = getAssetDataUri('images/proposal-logo-mark.png', 'image/png');
  const heroImage = getAssetDataUri('images/proposal-hero.png', 'image/png');

  const panelBrand = 'Waaree 550W Mono PERC';
  const inverterBrand = 'Sungrow On-Grid';

  const panelTotal = Math.round(specs.totalProjectCost * 0.46);
  const panelRate = Math.round(panelTotal / specs.panelCount);
  const inverterTotal = Math.round(specs.totalProjectCost * 0.20);
  const structureTotal = Math.round(specs.totalProjectCost * 0.12);
  const cableTotal = Math.round(specs.totalProjectCost * 0.07);
  const dbTotal = Math.round(specs.totalProjectCost * 0.05);
  const earthingTotal = Math.round(specs.totalProjectCost * 0.04);
  const installTotal = specs.totalProjectCost - (panelTotal + inverterTotal + structureTotal + cableTotal + dbTotal + earthingTotal);

  const resChecked = specs.sectorName === 'Residential' ? 'checked' : '';
  const comChecked = specs.sectorName === 'Commercial' ? 'checked' : '';
  const indChecked = specs.sectorName === 'Industrial' ? 'checked' : '';

  const roiBadgeLabel = specs.sectorName === 'Residential' ? 'PM Surya Ghar Eligible' : '40% AD Tax Benefit';
  const roiBadgeBg = specs.sectorName === 'Residential' ? 'var(--green)' : 'var(--navy-mid)';
  const roiSubsidyText = specs.subsidyAmount > 0 ? `- ₹ ${formatNum(specs.subsidyAmount)}` : '₹ 0 (N/A)';

  const rowsData = [
    { desc: `Solar PV Modules — ${panelBrand}`, qty: `${specs.panelCount} Nos`, rate: formatNum(panelRate), amount: formatNum(panelTotal) },
    { desc: `On-Grid Inverter — ${inverterBrand} ${specs.inverterRating}kW`, qty: `1 Set`, rate: formatNum(inverterTotal), amount: formatNum(inverterTotal) },
    { desc: `Mounting Structure — Hot-dip GI, wind load certified`, qty: `1 Set`, rate: formatNum(structureTotal), amount: formatNum(structureTotal) },
    { desc: `DC/AC Cables, MC4 Connectors, Junction Boxes`, qty: `L.S.`, rate: formatNum(cableTotal), amount: formatNum(cableTotal) },
    { desc: `DCDB & ACDB Boxes with IP65 Enclosure`, qty: `1 Set`, rate: formatNum(dbTotal), amount: formatNum(dbTotal) },
    { desc: `Lightning Arrestor & Chemical Earthing System`, qty: `1 Set`, rate: formatNum(earthingTotal), amount: formatNum(earthingTotal) },
    { desc: `Supply, Installation, Testing & Commissioning`, qty: `L.S.`, rate: formatNum(installTotal), amount: formatNum(installTotal) },
  ];

  const quotTableRows = rowsData.map((item, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td class="cell-desc">${item.desc}</td>
            <td class="cell-qty">${item.qty}</td>
            <td class="cell-rate">${item.rate}</td>
            <td class="cell-amount">${item.amount}</td>
          </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Solar EPC Proposal — ${customerName}</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
    rel="stylesheet">
  <style>
    :root {
      --navy: #0B3E73;
      --navy-mid: #165A9E;
      --navy-light: #2D7FD3;
      --amber: #F39A4A;
      --amber-dark: #E97B1F;
      --amber-light: #FFC78A;
      --orange: #F39A4A;
      --green: #10b981;
      --green-dark: #059669;
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-300: #cbd5e1;
      --slate-400: #94a3b8;
      --slate-500: #64748b;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-800: #1e293b;
      --white: #ffffff;
      --page-w: 210mm;
      --page-h: 297mm;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body { font-family: 'Inter', Arial, sans-serif; background: #ffffff; }

    /* Page */
    .page {
      width: var(--page-w);
      min-height: var(--page-h);
      height: auto;
      background: var(--white);
      margin: 0 auto;
      position: relative;
      overflow: visible;
    }

    #page1 { height: var(--page-h); overflow: hidden; }

    #page2 {
      background: linear-gradient(180deg, #ffffff 0%, #f4f7fc 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: var(--page-h);
      height: auto;
      overflow: visible;
    }

    #page3 { height: var(--page-h); overflow: hidden; }

    /* ===== PAGE 1: COVER ===== */
    .cover-header {
      background: linear-gradient(135deg, #ffffff 0%, #f7fbff 62%, #eef6ff 100%);
      color: var(--navy);
      padding: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .cover-main { display: flex; align-items: center; justify-content: space-between; flex-grow: 1; padding: 14mm 16mm 10mm 0; }
    .cover-left { width: 48%; padding-left: 20mm; padding-right: 8mm; display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding-bottom: 6mm; border-left: 4px solid var(--amber); }
    .cover-right { width: 52%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }

    .brand-row { justify-content: flex-start; margin-bottom: 16mm; }

    .sun-icon {
      inline-size: clamp(70px, 10vw, 110px);
      aspect-ratio: 1 / 1;
      border-radius: 16px;
      background-color: transparent;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
      overflow: hidden;
    }

    .sun-icon .core { display: none; }

    .logo-slot, #page1 .logo-slot, #page2 .logo-slot, #page3 .logo-slot {
      background-color: transparent;
      background-image: url('${logoImage}');
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      padding: 0 !important;
      box-sizing: border-box;
      z-index: 2;
    }

    #page3 .sun-icon { inline-size: 57.2mm; block-size: 57.2mm; flex: 0 0 57.2mm; }
    #page1 .sun-icon, #page3 .sun-icon { margin-left: 0; position: relative; left: 0; transform: translateX(-50px); }
    /* The page-2 header is a slim single row — it must not inherit the huge 57.2mm badge sized
       for the page-1/page-3 hero logos, or the header balloons and pushes the page onto a 4th sheet. */
    .page2-header .sun-icon { inline-size: 16mm; block-size: 16mm; flex: 0 0 16mm; margin: 0; }

    .cover-title-area .proposal-title { font-family: 'Space Grotesk', sans-serif; font-size: 52px; font-weight: 700; color: var(--navy); letter-spacing: 1px; line-height: 1.1; margin-bottom: 6mm; }
    .cover-title-area .proposal-title span.highlight { color: var(--amber); display: block; }
    .cover-title-area .proposal-title::after { content: ''; display: block; width: 60px; height: 5px; background: var(--amber); margin-top: 8mm; }

    .tagline { font-size: 14px; letter-spacing: 0.5px; color: var(--slate-600); font-weight: 400; max-width: 68mm; margin-top: 8mm; line-height: 1.6; display: block; }

    .hero-image-container { width: 100%; height: 76%; background: var(--slate-100); border-radius: 22px; box-shadow: 0 18px 38px rgba(11, 62, 115, 0.15); display: flex; align-items: center; justify-content: center; overflow: hidden; }

    .proposal-meta { display: flex; flex-direction: column; gap: 2mm; padding: 4mm 5mm; background: rgba(255, 255, 255, 0.82); border: 1px solid var(--slate-200); border-radius: 10px; box-shadow: 0 8px 20px rgba(11, 62, 115, 0.06); text-align: left; color: var(--slate-700); font-size: 11px; }
    .proposal-meta strong { color: var(--navy); font-weight: 600; }

    .cover-contact { background: var(--navy); padding: 5mm 20mm; justify-content: space-between; color: var(--white); border-top: 3px solid var(--amber); width: 100%; }
    .cover-contact .sep { background: rgba(255, 255, 255, 0.35); }

    #page1 .cover-header { position: relative; display: flex; flex-direction: column; justify-content: space-between; height: 100%; background: linear-gradient(180deg, #ffffff 0%, #f4f7fc 100%); }
    #page1 .cover-main { display: flex; flex: 1; align-items: stretch; padding: 4mm 16mm 6mm 0; min-height: 0; }
    #page1 .cover-left { width: 46%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 0 8mm 0 12mm; border: 0; overflow: hidden; }
    #page1 .brand-row { margin: 0 0 2mm; display: flex; align-items: center; min-height: 0; padding-top: 0; margin-left: 0; }
    #page1 .sun-icon { inline-size: 57.2mm; block-size: 57.2mm; flex: 0 0 57.2mm; transform: translateX(-50px); margin: 0; }
    #page1 .cover-title-area::before { display: none; }
    #page1 .cover-title-area .proposal-title { margin: 0; color: #0B3E73; font-size: 37px; font-weight: 800; line-height: 1.05; letter-spacing: .6px; }
    #page1 .cover-title-area .proposal-title .highlight { margin-top: 2mm; color: #F39A4A; font-weight: 900; }
    #page1 .cover-title-area .proposal-title::after { content: ''; display: block; width: 42mm; height: 2.5px; margin-top: 3mm; background: #F39A4A; }
    #page1 .tagline { display: block; max-width: 66mm; margin-top: 2mm; color: var(--navy); font-size: 11px; font-weight: 500; line-height: 1.55; }
    #page1 .service-labels { display: flex; flex-wrap: wrap; gap: 2mm; margin-top: 3mm; }
    #page1 .service-labels label { position: relative; }
    #page1 .service-labels input { position: absolute; opacity: 0; pointer-events: none; }
    #page1 .service-labels label span { display: block; padding: 2mm 3.5mm; border: 1px solid #2D7FD3; border-radius: 99px; color: #0B3E73; font-size: 7.5px; font-weight: 700; letter-spacing: .35px; text-transform: uppercase; }
    #page1 .service-labels input:checked+span { border-color: var(--navy-mid); background: var(--navy-mid); color: #FFFFFF; box-shadow: 0 4px 10px rgba(22, 90, 158, .24); }
    #page1 .key-features { display: flex; flex-direction: column; gap: 4mm; margin-top: 10mm; margin-bottom: 10mm; }
    #page1 .decorative-lines { width: 100%; margin-top: 10mm; margin-bottom: 10mm; }
    #page1 .feature-item { display: flex; align-items: center; gap: 3mm; }
    #page1 .feature-icon { width: 10mm; height: 10mm; flex-shrink: 0; display: grid; place-items: center; border-radius: 50%; background: rgba(243, 154, 74, 0.1); color: var(--amber-dark); font-size: 14px; }
    #page1 .feature-text { display: flex; flex-direction: column; gap: 0.5mm; }
    #page1 .feature-text strong { font-size: 9px; font-weight: 700; color: var(--navy); }
    #page1 .feature-text span { font-size: 8px; color: var(--slate-500); }

    #page1 .proposal-meta { position: relative; display: flex; flex-direction: column; gap: 3mm; margin-top: 0mm; padding: 5mm 5mm 5mm 15mm; border: 0; border-radius: 14px; background: #FFFFFF; box-shadow: 0 12px 30px rgba(0, 0, 0, .08), 0 4px 10px rgba(0, 0, 0, .05); color: #165A9E; font-size: 9px; line-height: 1.4; word-break: break-word; }
    #page1 .proposal-meta::before { content: '☼'; position: absolute; top: 0; left: 0; display: grid; width: 10mm; height: 100%; place-items: center; border-radius: 14px 0 0 14px; background: #0B3E73; color: #FFC78A; font-size: 17px; }
    #page1 .proposal-meta strong { color: #0B3E73; }
    #page1 .proposal-meta strong span { font-weight: 800; }
    #page1 .proposal-meta>span { color: var(--slate-500); }

    #page1 .cover-right { position: relative; display: flex; width: 50%; height: 100%; align-items: center; justify-content: center; }
    #page1 .cover-right::before { content: ''; position: absolute; width: 108%; height: 80%; border-radius: 36px; background: #0B3E73; transform: rotate(-11deg); }
    #page1 .cover-right::after { content: ''; position: absolute; width: 106%; height: 11mm; border-radius: 99px; background: #F39A4A; transform: rotate(-11deg) translateY(31mm); }
    #page1 .hero-image-container { position: relative; z-index: 1; width: 96%; height: 215mm; max-height: 94%; overflow: hidden; border: 3.7mm solid #FFFFFF; border-radius: 28px; background: #FFFFFF; box-shadow: 0 12px 30px rgba(0, 0, 0, .08), 0 4px 10px rgba(0, 0, 0, .05); }
    #page1 .hero-image-container img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }

    #page1 .cover-contact { position: relative; display: flex; align-items: center; justify-content: space-between; min-height: 15mm; padding: 4mm 18mm; overflow: hidden; border: 0; background: linear-gradient(100deg, #0B3E73 0%, #165A9E 100%); color: #FFFFFF; font-size: 9px; }
    #page1 .cover-contact>* { position: relative; z-index: 1; }
    #page1 .cover-contact .sep { width: 1px; height: 10px; flex: 0 0 1px; background: rgba(255, 255, 255, .42); }

    .gstin-contact { display: inline-flex; align-items: center; gap: 6px; }

    /* ===== PAGE 2: QUOTATION + TERMS ===== */
    .page2-header { background: transparent; padding: 1mm 20mm 0 18mm; display: flex; justify-content: space-between; align-items: center; }
    .page2-header .page2-header-right { text-align: right; }
    .page2-header .page-title { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: 2px; color: var(--amber); margin-bottom: 0; }
    .brand-name .highlight { color: var(--amber); }

    .quot-body { display: block; padding: 2mm 20mm 4mm 20mm; min-height: calc(297mm - 24mm); height: auto; box-sizing: border-box; }

    .quot-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 6mm; margin-top: 0; margin-bottom: 3mm; }
    .quot-info-item { display: flex; flex-direction: column; padding: 2.5mm 4mm; background: var(--white); border-radius: 14px; border-left: none; position: relative; box-shadow: 0 4px 15px rgba(11, 62, 115, 0.06); overflow: hidden; }
    .quot-info-item::before { content: ''; position: absolute; top: 0; left: 0; width: 8px; height: 100%; background: var(--navy); border-radius: 14px 0 0 14px; }
    .quot-info-item .qi-label { font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--slate-500); margin-bottom: 1mm; padding-left: 4mm; }
    .quot-info-item .qi-value { font-size: 12px; font-weight: 700; color: var(--navy); padding-left: 4mm; word-break: break-word; }

    .quot-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 4mm; font-size: 9.5px; background: var(--white); border: 1px solid rgba(14, 52, 94, 0.15); border-radius: 14px; overflow: hidden; box-shadow: 0 12px 30px rgba(11, 62, 115, 0.06); }
    .quot-table thead th { background: var(--navy); color: var(--white); font-size: 9px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 8px 10px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.12); }
    .quot-table thead th:last-child { text-align: right; }
    .quot-table thead th:nth-child(3) { text-align: center; }
    .quot-table thead th:nth-child(4) { text-align: right; }
    .quot-table tbody td { padding: 7px 10px; border-bottom: 1px solid rgba(14, 52, 94, 0.08); color: var(--slate-700); vertical-align: top; font-size: 9.5px; line-height: 1.4; }
    .quot-table tbody tr:nth-child(odd) { background: #f8fbff; }
    .quot-table tbody tr:nth-child(even) { background: #ffffff; }
    .quot-table tbody td:first-child { font-weight: 600; color: var(--navy); }
    .quot-table tbody td:last-child { text-align: right; font-weight: 700; color: var(--navy); }
    .quot-table tbody td:nth-child(3) { text-align: center; }
    .quot-table tbody td:nth-child(4) { text-align: right; }
    .quot-table tfoot td { padding: 16px 14px; font-weight: 700; color: var(--navy); border-top: none; }
    .quot-table tfoot .total-row td { background: linear-gradient(135deg, var(--amber) 0%, #ffb86c 100%); color: var(--navy); font-size: 12.5px; letter-spacing: 0.5px; }
    .quot-table tfoot .total-row td:first-child { text-align: right; padding-right: 18px; text-transform: uppercase; letter-spacing: 1.2px; }
    .quot-table tfoot .total-row td:last-child { font-size: 16px; font-weight: 800; }

    .financial-roi-section { margin-bottom: 6mm; background: linear-gradient(135deg, #f0f7ff 0%, #eef6ff 100%); border: 1px solid rgba(45, 127, 211, 0.25); border-radius: 16px; padding: 4mm 5mm; box-shadow: 0 4px 15px rgba(11, 62, 115, 0.04); }
    .roi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3mm; }
    .roi-title { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: var(--navy); letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; }
    .roi-badge { background: var(--green); color: var(--white); font-size: 8px; font-weight: 700; padding: 2px 8px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px; }
    .roi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
    .roi-metric-card { background: var(--white); border: 1px solid var(--slate-200); border-radius: 10px; padding: 2.5mm 3.5mm; text-align: left; }
    .roi-metric-card .rm-label { font-size: 7.5px; font-weight: 700; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 1mm; }
    .roi-metric-card .rm-value { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 800; color: var(--navy); }
    .roi-metric-card .rm-value.green { color: var(--green-dark); }
    .roi-metric-card .rm-value.amber { color: var(--amber-dark); }

    .terms-section { margin-bottom: 6mm; }
    .terms-title { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; color: var(--navy); letter-spacing: 1px; margin-bottom: 4mm; display: flex; align-items: center; gap: 8px; }
    .terms-title .t-icon { width: 24px; height: 24px; border-radius: 10px; background: linear-gradient(135deg, #F39A4A, #FFC78A); display: flex; align-items: center; justify-content: center; color: var(--navy); }
    .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
    .term-card { background: linear-gradient(180deg, #ffffff, #f8fbff); border: 1px solid var(--slate-200); border-radius: 12px; padding: 3mm 4mm; }
    .term-card .tc-label { font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; color: var(--amber-dark); margin-bottom: 1.5mm; }
    .term-card .tc-value { font-size: 11px; font-weight: 500; color: var(--navy); line-height: 1.4; }

    .watermark { position: absolute; bottom: 15mm; right: 10mm; font-family: 'Space Grotesk', sans-serif; font-size: 60px; font-weight: 700; color: rgba(245, 158, 11, 0.03); letter-spacing: 5px; pointer-events: none; transform: rotate(-90deg); transform-origin: bottom right; }
    .page-strip { height: 4px; background: linear-gradient(90deg, var(--navy) 0%, var(--amber) 50%, var(--navy) 100%); }

    /* ===== PAGE 3: THANK YOU + BANK ===== */
    #page3 { display: flex; flex-direction: column; justify-content: space-between; height: var(--page-h); overflow: hidden; background: linear-gradient(145deg, #081f45 0%, #16386c 40%, #2269b4 100%); }
    .thankyou-section { background: transparent; padding: 16mm 20mm 10mm 20mm; text-align: center; color: var(--white); position: relative; overflow: visible; flex: 1; display: flex; flex-direction: column; justify-content: flex-start; }
    .thankyou-header-row { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; min-height: 57.2mm; margin-bottom: 5mm; }
    .thankyou-logo { position: absolute; top: 0; left: 0; z-index: 2; }
    #page3 .sun-icon, #page3 .thankyou-logo .sun-icon { inline-size: 57.2mm; block-size: 57.2mm; flex: 0 0 57.2mm; transform: translateX(-50px); margin: 0; }
    .thankyou-title-group { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; margin: 0 auto; z-index: 1; position: relative; }
    .thankyou-heading { font-family: 'Space Grotesk', sans-serif; font-size: 54px; font-weight: 800; margin-bottom: 1mm; color: var(--white); letter-spacing: 1px; line-height: 1.05; text-align: center; }
    .thankyou-sub { font-size: 16px; color: rgba(255, 255, 255, 0.88); font-weight: 400; margin-bottom: 0; max-width: 820px; text-align: center; }

    .contact-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; text-align: left; margin-top: 5mm; margin-bottom: 20mm; z-index: 1; position: relative; }
    .contact-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: rgba(255, 255, 255, 0.96); border-radius: 20px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04); border: 1px solid rgba(255, 255, 255, 0.5); }
    .contact-item .ci-icon { width: 46px; height: 46px; background: rgba(255, 167, 72, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--amber); flex-shrink: 0; }
    .contact-item .ci-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: var(--navy); margin-bottom: 2px; }
    .contact-item .ci-value { font-size: 13px; font-weight: 700; color: var(--navy); line-height: 1.4; }

    .bank-section { background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 24px; padding: 18px 20px; text-align: left; box-shadow: 0 8px 24px rgba(10, 32, 85, 0.12); z-index: 1; position: relative; }
    .bank-title { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 2px; color: var(--amber); margin-bottom: 8px; text-align: left; }
    .bank-title::after { content: ''; display: block; width: 52px; height: 3px; margin-top: 6px; background: var(--amber); border-radius: 999px; }
    .bank-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 24px; }
    .bank-item { padding: 8px 0; }
    .bank-item .bi-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: rgba(255, 255, 255, 0.7); margin-bottom: 3px; display: block; }
    .bank-item .bi-value { font-size: 13px; font-weight: 700; color: var(--white); line-height: 1.5; }
    .bank-item.full { grid-column: 1 / -1; }

    .proposal-end-emblem { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: auto; margin-bottom: 20mm; width: 100%; z-index: 1; position: relative; }
    .proposal-end-emblem .end-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4) 50%, transparent); }
    .proposal-end-emblem .end-badge { display: flex; align-items: center; gap: 8px; padding: 6px 18px; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.28); border-radius: 99px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); letter-spacing: 2.5px; font-size: 9.5px; font-weight: 800; color: var(--amber); text-transform: uppercase; }
    .proposal-end-emblem .end-icon { width: 14px; height: 14px; color: var(--amber); stroke: var(--amber); }

    #page3 .page-strip { height: 5px; background: linear-gradient(90deg, #0B3E73 0%, #F39A4A 50%, #0B3E73 100%); box-shadow: 0 -2px 10px rgba(243, 154, 74, 0.4); }

    /* Print styles - macOS, iOS Safari, WebKit, & Chrome compatibility */
    @media print {
      @page { size: A4 portrait; margin: 0mm; }

      html, body { width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; background: transparent !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }

      .page { box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; min-width: 100% !important; min-height: 297mm !important; height: auto !important; max-height: none !important; position: relative !important; overflow: visible !important; box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; display: block !important; }

      #page1 { background: linear-gradient(180deg, #ffffff 0%, #f4f7fc 100%) !important; height: 297mm !important; max-height: 297mm !important; overflow: hidden !important; break-after: page !important; page-break-after: always !important; }
      #page1 .cover-header { height: 297mm !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; }
      #page1 .hero-image-container { height: 215mm !important; }

      #page2 { background: linear-gradient(180deg, #ffffff 0%, #f4f7fc 100%) !important; min-height: 297mm !important; height: auto !important; max-height: none !important; overflow: visible !important; }
      #page2 .quot-body { display: block !important; height: auto !important; min-height: calc(297mm - 24mm) !important; overflow: visible !important; }
      #page2 .quot-table { display: table !important; width: 100% !important; }

      .quot-info-grid, .financial-roi-section, .terms-section, .term-card, .quot-table tr { break-inside: avoid !important; page-break-inside: avoid !important; }
      .quot-table tr { display: table-row !important; }

      #page3 { background: linear-gradient(145deg, #081f45 0%, #16386c 40%, #2269b4 100%) !important; width: 100% !important; min-width: 100% !important; height: 297mm !important; min-height: 297mm !important; max-height: 297mm !important; overflow: hidden !important; break-before: page !important; page-break-before: always !important; }
      #page3 .thankyou-section { background: linear-gradient(145deg, #081f45 0%, #16386c 40%, #2269b4 100%) !important; width: 100% !important; height: calc(297mm - 4px) !important; display: flex !important; flex-direction: column !important; justify-content: flex-start !important; padding: 16mm 20mm 10mm 20mm !important; overflow: visible !important; box-sizing: border-box !important; }

      *, *::before, *::after { box-shadow: none !important; -webkit-box-shadow: none !important; filter: none !important; -webkit-filter: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

      .bank-section, .end-badge, .contact-item, .quot-info-item, .quot-table, .term-card, .proposal-meta, .hero-image-container { box-shadow: none !important; -webkit-box-shadow: none !important; filter: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }

      .contact-item { background: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.6) !important; }
      .bank-section { background: rgba(255, 255, 255, 0.22) !important; border: 1px solid rgba(255, 255, 255, 0.35) !important; }
    }
  </style>
</head>

<body>

  <!-- ==================== PAGE 1: COVER ==================== -->
  <div class="page" id="page1">
    <div class="cover-header">
      <div class="cover-main">
        <div class="cover-left">
          <div>
            <div class="brand-row">
              <div class="sun-icon logo-slot has-logo"><div class="core"></div></div>
            </div>
            <div class="cover-title-area">
              <div class="proposal-title">SOLAR EPC<span class="highlight">PROPOSAL</span></div>
              <div class="tagline">Your Trusted Partner in Renewable Energy Solutions</div>
              <div class="service-labels" aria-label="Solar service sectors">
                <label><input type="radio" name="service-sector" value="Residential" ${resChecked}><span>Residential</span></label>
                <label><input type="radio" name="service-sector" value="Commercial" ${comChecked}><span>Commercial</span></label>
                <label><input type="radio" name="service-sector" value="Industrial" ${indChecked}><span>Industrial</span></label>
              </div>
              <div class="key-features">
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <div class="feature-text">
                    <strong>Tier-1 Panels</strong>
                    <span>25-Year Performance Warranty</span>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="2" width="20" height="12" rx="2" ry="2"></rect>
                      <line x1="2" y1="8" x2="22" y2="8"></line>
                      <line x1="12" y1="14" x2="12" y2="22"></line>
                      <line x1="8" y1="22" x2="16" y2="22"></line>
                    </svg>
                  </div>
                  <div class="feature-text">
                    <strong>Expert Installation</strong>
                    <span>Certified & Experienced Team</span>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div class="feature-text">
                    <strong>Hassle-Free Process</strong>
                    <span>End-to-End Project Management</span>
                  </div>
                </div>
              </div>
              <div class="decorative-lines">
                <svg width="100%" height="60" viewBox="0 0 300 60" preserveAspectRatio="none">
                  <path d="M0,30 Q50,10 100,30 T200,30 T300,30" stroke="rgba(22, 90, 158, 0.15)" fill="transparent" stroke-width="1.5" />
                  <path d="M0,40 Q50,60 100,40 T200,40 T300,40" stroke="rgba(243, 154, 74, 0.2)" fill="transparent" stroke-width="1.5" />
                </svg>
              </div>
            </div>
          </div>
          <div class="client-and-proposal-details">
            <div class="proposal-meta">
              <strong>Prepared for <span>${customerName}</span></strong>
              <span>${siteAddress}</span>
            </div>
          </div>
        </div>
        <div class="cover-right">
          <div class="hero-image-container" role="img" aria-label="Solar panels installed on a rooftop">
            <img src="${heroImage}" alt="Solar panels installed on a rooftop">
          </div>
        </div>
      </div>
      <div class="cover-contact">
        <span>📞 +91 7010899473</span>
        <span class="sep"></span>
        <span>✉ nitishsolar@zohomail.in</span>
        <span class="sep"></span>
        <span class="gstin-contact">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-1px; margin-right:4px;">
            <path d="M6 3h12" /><path d="M6 8h12" /><path d="M6 13l8.5 8" /><path d="M6 13h3a4.5 4.5 0 0 0 0-9" />
          </svg>
          <span>GSTIN 33AAYFN9905F1ZS</span>
        </span>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 2: QUOTATION + TERMS ==================== -->
  <div class="page" id="page2">
    <div class="page2-header">
      <div class="brand-row" style="margin-bottom:0; display: flex; align-items: center; gap: 5mm;">
        <div class="sun-icon logo-slot has-logo"><div class="core"></div></div>
        <div class="brand-name" style="font-size:16px; font-weight:800; color:#0B3E73;">NITISH <span class="highlight">SOLAR</span> EPC</div>
      </div>
      <div class="page2-header-right">
        <div class="page-title">PROJECT QUOTATION</div>
      </div>
    </div>

    <div class="quot-body">
      <div class="quot-info-grid">
        <div class="quot-info-item">
          <div class="qi-label">Quotation No.</div>
          <div class="qi-value">${specs.quotNo}</div>
        </div>
        <div class="quot-info-item">
          <div class="qi-label">Date</div>
          <div class="qi-value">${specs.dateStr}</div>
        </div>
        <div class="quot-info-item">
          <div class="qi-label">Customer Name</div>
          <div class="qi-value">${customerName}</div>
        </div>
        <div class="quot-info-item">
          <div class="qi-label">Site Address</div>
          <div class="qi-value">${siteAddress}</div>
        </div>
      </div>

      <table class="quot-table">
        <thead>
          <tr>
            <th style="width:8%;">S.No</th>
            <th>Description</th>
            <th style="width:12%;">Qty</th>
            <th style="width:18%;">Unit Price (₹)</th>
            <th style="width:18%;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>${quotTableRows}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4" style="text-align:right; padding-right:5mm;">TOTAL PROJECT COST</td>
            <td style="text-align:right;">₹ ${formatNum(specs.totalProjectCost)}</td>
          </tr>
        </tfoot>
      </table>

      <div class="financial-roi-section">
        <div class="roi-header">
          <div class="roi-title"><span>💡 Financial ROI & Savings Summary</span></div>
          <div class="roi-badge" style="background:${roiBadgeBg};">${roiBadgeLabel}</div>
        </div>
        <div class="roi-grid">
          <div class="roi-metric-card">
            <div class="rm-label">PM Surya Ghar Subsidy</div>
            <div class="rm-value green">${roiSubsidyText}</div>
          </div>
          <div class="roi-metric-card">
            <div class="rm-label">Net Investment Cost</div>
            <div class="rm-value">₹ ${formatNum(specs.netCost)}</div>
          </div>
          <div class="roi-metric-card">
            <div class="rm-label">Est. Monthly Savings</div>
            <div class="rm-value green">₹ ${formatNum(specs.monthlySavings)} / mo</div>
          </div>
          <div class="roi-metric-card">
            <div class="rm-label">ROI Payback Period</div>
            <div class="rm-value amber">${specs.paybackYears} Years</div>
          </div>
        </div>
      </div>

      <div class="terms-section">
        <div class="terms-title"><div class="t-icon">📜</div> Terms & Conditions</div>
        <div class="terms-grid">
          <div class="term-card">
            <div class="tc-label">Warranty</div>
            <div class="tc-value">25-Year Panel Performance | 5-Year Inverter Warranty</div>
          </div>
          <div class="term-card">
            <div class="tc-label">Payment Terms</div>
            <div class="tc-value">60% Advance, 30% Material Delivery, 10% Commissioning</div>
          </div>
          <div class="term-card">
            <div class="tc-label">Installation Timeline</div>
            <div class="tc-value">${specs.targetKw <= 10 ? '7 to 12 Working Days' : '15 to 25 Working Days'}</div>
          </div>
          <div class="term-card">
            <div class="tc-label">Validity</div>
            <div class="tc-value">Quotation valid for 15 days from issue date</div>
          </div>
        </div>
      </div>
    </div>

    <div class="watermark">SOLAR EPC</div>
    <div class="page-strip"></div>
  </div>

  <!-- ==================== PAGE 3: THANK YOU + BANK DETAILS ==================== -->
  <div class="page" id="page3">
    <div class="thankyou-section">
      <div class="thankyou-header-row">
        <div class="thankyou-logo">
          <div class="sun-icon logo-slot has-logo"><div class="core"></div></div>
        </div>
        <div class="thankyou-title-group">
          <div class="thankyou-heading">Thank You</div>
          <div class="thankyou-sub">Let's Build a Brighter Future Together</div>
        </div>
      </div>

      <div class="contact-grid">
        <div class="contact-item">
          <div class="ci-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-3.67-2.94 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div>
            <div class="ci-label">Phone</div>
            <div class="ci-value">+91 7010899473</div>
          </div>
        </div>
        <div class="contact-item">
          <div class="ci-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div>
            <div class="ci-label">Email</div>
            <div class="ci-value">nitishsolar@zohomail.in</div>
          </div>
        </div>
        <div class="contact-item">
          <div class="ci-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div>
            <div class="ci-label">Office Address</div>
            <div class="ci-value">Chromepet, Chennai</div>
          </div>
        </div>
        <div class="contact-item">
          <div class="ci-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3h12" /><path d="M6 8h12" /><path d="M6 13l8.5 8" /><path d="M6 13h3a4.5 4.5 0 0 0 0-9" />
            </svg>
          </div>
          <div>
            <div class="ci-label">GSTIN</div>
            <div class="ci-value">33AAYFN9905F1ZS</div>
          </div>
        </div>
        <div class="contact-item">
          <div class="ci-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
          <div>
            <div class="ci-label">Instagram</div>
            <div class="ci-value">@nitishsolar</div>
          </div>
        </div>
        <div class="contact-item">
          <div class="ci-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </div>
          <div>
            <div class="ci-label">Facebook</div>
            <div class="ci-value">Nitish Solar</div>
          </div>
        </div>
      </div>

      <div class="bank-section">
        <div class="bank-title">BANK DETAILS</div>
        <div class="bank-grid">
          <div class="bank-item">
            <div class="bi-label">Account Name</div>
            <div class="bi-value">NITISH SOLAR</div>
          </div>
          <div class="bank-item">
            <div class="bi-label">Bank Name</div>
            <div class="bi-value">THE KARUR VYSYA BANK LIMITED</div>
          </div>
          <div class="bank-item full">
            <div class="bi-label">Account Number</div>
            <div class="bi-value">1873010000000291</div>
          </div>
          <div class="bank-item">
            <div class="bi-label">IFSC</div>
            <div class="bi-value">KVBL0001873</div>
          </div>
          <div class="bank-item">
            <div class="bi-label">Branch</div>
            <div class="bi-value">NEW COLONY - CHROMEPET</div>
          </div>
        </div>
      </div>

      <div class="proposal-end-emblem">
        <div class="end-line"></div>
        <div class="end-badge">
          <svg class="end-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
          </svg>
          <span>END OF PROPOSAL</span>
        </div>
        <div class="end-line"></div>
      </div>
    </div>

    <div class="page-strip"></div>
  </div>

</body>
</html>`;

  return { html, specs };
}
