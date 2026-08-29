import { EmailData } from './mailer';

function formatNum(n: number): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
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
  const customerName = data.name || 'Valued Customer';
  const siteAddress = data.location || 'Site Location';

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

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Solar EPC Proposal — ${customerName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #0B3E73;
      --navy-mid: #165A9E;
      --navy-light: #2D7FD3;
      --amber: #F39A4A;
      --amber-dark: #E97B1F;
      --green: #10b981;
      --green-dark: #059669;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-500: #64748b;
      --slate-700: #334155;
      --white: #ffffff;
      --page-w: 210mm;
      --page-h: 297mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: var(--slate-700); }
    .page { width: 210mm; min-height: 297mm; height: auto; background: var(--white); margin: 0 auto; position: relative; overflow: visible; box-sizing: border-box; }
    #page1 { height: 297mm; overflow: hidden; page-break-after: always; }
    .cover-header { background: linear-gradient(180deg, #ffffff 0%, #f4f7fc 100%); height: 297mm; display: flex; flex-direction: column; justify-content: space-between; }
    .cover-main { display: flex; flex: 1; padding: 4mm 16mm 6mm 0; }
    .cover-left { width: 46%; padding: 0 8mm 0 12mm; display: flex; flex-direction: column; justify-content: space-between; }
    .sun-icon { width: 50mm; height: 50mm; background: radial-gradient(circle, #0B3E73 0%, #165A9E 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #FFC78A; font-size: 24px; font-weight: bold; }
    .proposal-title { font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 800; color: #0B3E73; line-height: 1.05; }
    .proposal-title .highlight { color: #F39A4A; display: block; margin-top: 2mm; }
    .tagline { color: var(--navy); font-size: 11px; font-weight: 500; margin-top: 3mm; line-height: 1.5; }
    .service-labels { display: flex; gap: 2mm; margin-top: 4mm; }
    .service-labels label span { display: block; padding: 2mm 3.5mm; border: 1px solid #2D7FD3; border-radius: 99px; color: #0B3E73; font-size: 8px; font-weight: 700; text-transform: uppercase; }
    .service-labels input:checked+span { background: #165A9E; color: #ffffff; border-color: #165A9E; }
    .key-features { display: flex; flex-direction: column; gap: 3mm; margin-top: 6mm; }
    .feature-item { display: flex; align-items: center; gap: 3mm; }
    .feature-icon { width: 8mm; height: 8mm; border-radius: 50%; background: rgba(243, 154, 74, 0.15); color: #E97B1F; display: grid; place-items: center; font-size: 12px; font-weight: bold; }
    .feature-text strong { font-size: 9px; color: #0B3E73; display: block; }
    .feature-text span { font-size: 8px; color: var(--slate-500); }
    .proposal-meta { background: #ffffff; padding: 4mm 5mm 4mm 12mm; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.06); font-size: 9px; color: #165A9E; border-left: 4px solid #F39A4A; }
    .cover-right { width: 54%; display: flex; align-items: center; justify-content: center; position: relative; }
    .hero-image-container { width: 92%; height: 210mm; border-radius: 24px; border: 3mm solid #ffffff; box-shadow: 0 12px 30px rgba(0,0,0,0.08); overflow: hidden; background: #0B3E73; }
    .hero-image-container img { width: 100%; height: 100%; object-fit: cover; }
    .cover-contact { background: linear-gradient(100deg, #0B3E73 0%, #165A9E 100%); color: #ffffff; padding: 4mm 18mm; display: flex; align-items: center; justify-content: space-between; font-size: 9px; }
    
    #page2 { background: linear-gradient(180deg, #ffffff 0%, #f4f7fc 100%); min-height: 297mm; padding: 4mm 18mm; page-break-after: always; }
    .page2-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3mm; border-bottom: 2px solid var(--slate-200); padding-bottom: 2mm; }
    .page-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 800; color: var(--amber); }
    .quot-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 6mm; margin-bottom: 3mm; }
    .quot-info-item { background: #ffffff; padding: 2.5mm 4mm; border-radius: 12px; border-left: 4px solid #0B3E73; box-shadow: 0 4px 12px rgba(11,62,115,0.05); }
    .qi-label { font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--slate-500); }
    .qi-value { font-size: 11px; font-weight: 700; color: #0B3E73; margin-top: 1px; }
    
    .quot-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 4mm; font-size: 9px; background: #ffffff; border: 1px solid rgba(14,52,94,0.15); border-radius: 12px; overflow: hidden; }
    .quot-table th { background: #0B3E73; color: #ffffff; padding: 7px 9px; font-size: 8.5px; font-weight: 700; text-transform: uppercase; text-align: left; }
    .quot-table td { padding: 6px 9px; border-bottom: 1px solid #f1f5f9; color: var(--slate-700); }
    .quot-table tr:nth-child(odd) { background: #f8fbff; }
    .quot-table tfoot td { background: linear-gradient(135deg, #F39A4A 0%, #ffb86c 100%); color: #0B3E73; font-weight: 800; font-size: 11px; padding: 8px 9px; }
    
    .financial-roi-section { background: linear-gradient(135deg, #f0f7ff 0%, #eef6ff 100%); border: 1px solid rgba(45,127,211,0.25); border-radius: 14px; padding: 3mm 4mm; margin-bottom: 4mm; }
    .roi-title { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #0B3E73; margin-bottom: 2mm; }
    .roi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2mm; }
    .roi-card { background: #ffffff; border: 1px solid var(--slate-200); border-radius: 8px; padding: 2mm 3mm; }
    .rm-label { font-size: 7px; font-weight: 700; color: var(--slate-500); text-transform: uppercase; }
    .rm-value { font-family: 'Space Grotesk', sans-serif; font-size: 11.5px; font-weight: 800; color: #0B3E73; margin-top: 1px; }
    .rm-value.green { color: #059669; }
    .rm-value.amber { color: #E97B1F; }

    .terms-section { margin-bottom: 4mm; }
    .terms-title { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #0B3E73; margin-bottom: 2mm; }
    .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm; }
    .term-card { background: #ffffff; border: 1px solid var(--slate-200); border-radius: 8px; padding: 2mm 3mm; }
    .tc-label { font-size: 7.5px; font-weight: 700; color: #E97B1F; text-transform: uppercase; }
    .tc-value { font-size: 9.5px; font-weight: 600; color: #0B3E73; margin-top: 1px; }

    #page3 { background: linear-gradient(145deg, #081f45 0%, #16386c 40%, #2269b4 100%); height: 297mm; padding: 12mm 18mm; color: #ffffff; display: flex; flex-direction: column; justify-content: space-between; }
    .thankyou-heading { font-family: 'Space Grotesk', sans-serif; font-size: 42px; font-weight: 800; text-align: center; }
    .thankyou-sub { font-size: 14px; text-align: center; color: rgba(255,255,255,0.85); margin-top: 2px; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6mm; margin-bottom: 6mm; }
    .contact-item { background: rgba(255,255,255,0.95); border-radius: 12px; padding: 10px 14px; color: #0B3E73; font-size: 11px; }
    .contact-item .ci-label { font-size: 8px; text-transform: uppercase; font-weight: bold; color: var(--slate-500); }
    .contact-item .ci-value { font-size: 11px; font-weight: 700; color: #0B3E73; margin-top: 1px; }
    .bank-section { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 16px; padding: 14px; }
    .bank-title { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 800; color: #F39A4A; letter-spacing: 1px; margin-bottom: 6px; }
    .bank-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; font-size: 11px; }
    .bi-label { font-size: 8px; text-transform: uppercase; color: rgba(255,255,255,0.7); }
    .bi-value { font-weight: 700; color: #ffffff; }

    @media print {
      @page { size: A4 portrait; margin: 0mm; }
      .page { width: 100% !important; min-height: 297mm !important; height: auto !important; }
      #page1 { height: 297mm !important; page-break-after: always !important; }
      #page2 { min-height: 297mm !important; height: auto !important; }
      #page3 { height: 297mm !important; page-break-before: always !important; }
    }
  </style>
</head>
<body>

  <!-- PAGE 1: COVER -->
  <div class="page" id="page1">
    <div class="cover-header">
      <div class="cover-main">
        <div class="cover-left">
          <div>
            <div style="margin-bottom: 8mm;">
              <div class="sun-icon">☀</div>
            </div>
            <div class="proposal-title">SOLAR EPC<span class="highlight">PROPOSAL</span></div>
            <div class="tagline">Your Trusted Partner in Renewable Energy Solutions</div>
            <div class="service-labels">
              <label><input type="radio" name="sector" value="Residential" ${resChecked}><span>Residential</span></label>
              <label><input type="radio" name="sector" value="Commercial" ${comChecked}><span>Commercial</span></label>
              <label><input type="radio" name="sector" value="Industrial" ${indChecked}><span>Industrial</span></label>
            </div>
            <div class="key-features">
              <div class="feature-item">
                <div class="feature-icon">✓</div>
                <div class="feature-text">
                  <strong>Tier-1 Solar Panels</strong>
                  <span>25-Year Performance Guarantee</span>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">⚡</div>
                <div class="feature-text">
                  <strong>Smart String Inverter</strong>
                  <span>High Efficiency & MPPT Sizing</span>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🛡</div>
                <div class="feature-text">
                  <strong>Turnkey EPC Execution</strong>
                  <span>Net-Metering & Approval Included</span>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-bottom: 6mm;">
            <div class="proposal-meta">
              <strong>Prepared for <span>${customerName}</span></strong><br>
              <span>${siteAddress}</span>
            </div>
          </div>
        </div>
        <div class="cover-right">
          <div class="hero-image-container">
            <div style="width:100%; height:100%; background: linear-gradient(135deg, #0B3E73, #165A9E); display:flex; align-items:center; justify-center; text-align:center; padding: 20px; color:#ffffff;">
              <div>
                <div style="font-size: 32px; margin-bottom: 10px;">☀️</div>
                <h3 style="font-size: 20px; font-weight:800;">NITISH SOLAR</h3>
                <p style="font-size: 12px; opacity: 0.8; margin-top: 4px;">Engineered Solar EPC Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="cover-contact">
        <span>📞 +91 7010899473</span>
        <span>✉ nitishsolar@zohomail.in</span>
        <span>GSTIN 33AAYFN9905F1ZS</span>
      </div>
    </div>
  </div>

  <!-- PAGE 2: QUOTATION & FINANCIAL ROI -->
  <div class="page" id="page2">
    <div class="page2-header">
      <div style="font-size: 16px; font-weight: 800; color: #0B3E73;">NITISH SOLAR <span style="color: #F39A4A;">EPC</span></div>
      <div class="page-title">PROJECT QUOTATION</div>
    </div>

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
          <th>Item Description</th>
          <th style="width:12%; text-align:center;">Qty</th>
          <th style="width:18%; text-align:right;">Rate (₹)</th>
          <th style="width:18%; text-align:right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Solar PV Modules — Tier-1 550W Mono PERC (${specs.targetKw} kW System)</td>
          <td style="text-align:center;">${specs.panelCount} Nos</td>
          <td style="text-align:right;">${formatNum(Math.round((specs.totalProjectCost * 0.46) / specs.panelCount))}</td>
          <td style="text-align:right;">${formatNum(Math.round(specs.totalProjectCost * 0.46))}</td>
        </tr>
        <tr>
          <td>2</td>
          <td>On-Grid Solar String Inverter — ${specs.inverterRating}kW High-Efficiency</td>
          <td style="text-align:center;">1 Set</td>
          <td style="text-align:right;">${formatNum(Math.round(specs.totalProjectCost * 0.20))}</td>
          <td style="text-align:right;">${formatNum(Math.round(specs.totalProjectCost * 0.20))}</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Mounting Structure — Hot-Dip GI, Wind Load Certified (150 km/h)</td>
          <td style="text-align:center;">1 Set</td>
          <td style="text-align:right;">${formatNum(Math.round(specs.totalProjectCost * 0.12))}</td>
          <td style="text-align:right;">${formatNum(Math.round(specs.totalProjectCost * 0.12))}</td>
        </tr>
        <tr>
          <td>4</td>
          <td>Solar DC/AC UV Cables, MC4 Connectors & Accessories</td>
          <td style="text-align:center;">L.S.</td>
          <td style="text-align:right;">${formatNum(Math.round(specs.totalProjectCost * 0.07))}</td>
          <td style="text-align:right;">${formatNum(Math.round(specs.totalProjectCost * 0.07))}</td>
        </tr>
        <tr>
          <td>5</td>
          <td>DCDB & ACDB Array Protection Distribution Boxes (IP65)</td>
          <td style="text-align:center;">1 Set</td>
          <td style="text-align:right;">${formatNum(Math.round(specs.totalProjectCost * 0.05))}</td>
          <td style="text-align:right;">${formatNum(Math.round(specs.totalProjectCost * 0.05))}</td>
        </tr>
        <tr>
          <td>6</td>
          <td>Copper Lightning Arrestor & Chemical Earthing System</td>
          <td style="text-align:center;">1 Set</td>
          <td style="text-align:right;">${formatNum(Math.round(specs.totalProjectCost * 0.04))}</td>
          <td style="text-align:right;">${formatNum(Math.round(specs.totalProjectCost * 0.04))}</td>
        </tr>
        <tr>
          <td>7</td>
          <td>Supply, Installation, Testing & Net-Metering Commissioning</td>
          <td style="text-align:center;">L.S.</td>
          <td style="text-align:right;">${formatNum(specs.totalProjectCost - Math.round(specs.totalProjectCost * (0.46 + 0.20 + 0.12 + 0.07 + 0.05 + 0.04)))}</td>
          <td style="text-align:right;">${formatNum(specs.totalProjectCost - Math.round(specs.totalProjectCost * (0.46 + 0.20 + 0.12 + 0.07 + 0.05 + 0.04)))}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" style="text-align:right;">TOTAL TURNKEY EPC COST:</td>
          <td style="text-align:right;">₹ ${formatNum(specs.totalProjectCost)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="financial-roi-section">
      <div class="roi-title">💡 Financial ROI & Government Subsidy Summary (${specs.sectorName})</div>
      <div class="roi-grid">
        <div class="roi-card">
          <div class="rm-label">PM Surya Ghar Subsidy</div>
          <div class="rm-value green">${specs.subsidyAmount > 0 ? `- ₹ ${formatNum(specs.subsidyAmount)}` : '₹ 0 (40% AD Tax Benefit)'}</div>
        </div>
        <div class="roi-card">
          <div class="rm-label">Net Investment</div>
          <div class="rm-value">₹ ${formatNum(specs.netCost)}</div>
        </div>
        <div class="roi-card">
          <div class="rm-label">Est. Monthly Savings</div>
          <div class="rm-value green">₹ ${formatNum(specs.monthlySavings)} / mo</div>
        </div>
        <div class="roi-card">
          <div class="rm-label">ROI Payback Period</div>
          <div class="rm-value amber">${specs.paybackYears} Years</div>
        </div>
      </div>
    </div>

    <div class="terms-section">
      <div class="terms-title">📜 Terms & Conditions</div>
      <div class="terms-grid">
        <div class="term-card">
          <div class="tc-label">Warranty</div>
          <div class="tc-value">25-Yr Panel Guarantee | 5-Yr Inverter Warranty</div>
        </div>
        <div class="term-card">
          <div class="tc-label">Payment Terms</div>
          <div class="tc-value">60% Advance, 30% Delivery, 10% Commissioning</div>
        </div>
        <div class="term-card">
          <div class="tc-label">Execution Timeline</div>
          <div class="tc-value">${specs.targetKw <= 10 ? '7 to 12 Working Days' : '15 to 25 Working Days'}</div>
        </div>
        <div class="term-card">
          <div class="tc-label">Quotation Validity</div>
          <div class="tc-value">Valid for 15 days from issue date</div>
        </div>
      </div>
    </div>
  </div>

  <!-- PAGE 3: THANK YOU & BANK DETAILS -->
  <div class="page" id="page3">
    <div>
      <div class="thankyou-heading">Thank You</div>
      <div class="thankyou-sub">Let's Build a Brighter, Sustainable Future Together</div>

      <div class="contact-grid">
        <div class="contact-item">
          <div class="ci-label">Phone</div>
          <div class="ci-value">+91 7010899473</div>
        </div>
        <div class="contact-item">
          <div class="ci-label">Email</div>
          <div class="ci-value">nitishsolar@zohomail.in</div>
        </div>
        <div class="contact-item">
          <div class="ci-label">Office Address</div>
          <div class="ci-value">Chromepet, Chennai</div>
        </div>
        <div class="contact-item">
          <div class="ci-label">GSTIN</div>
          <div class="ci-value">33AAYFN9905F1ZS</div>
        </div>
      </div>

      <div class="bank-section">
        <div class="bank-title">OFFICIAL BANK DETAILS FOR NEFT/RTGS</div>
        <div class="bank-grid">
          <div>
            <div class="bi-label">Account Name</div>
            <div class="bi-value">NITISH SOLAR</div>
          </div>
          <div>
            <div class="bi-label">Bank Name</div>
            <div class="bi-value">THE KARUR VYSYA BANK LIMITED</div>
          </div>
          <div style="grid-column: 1 / -1; margin-top: 4px;">
            <div class="bi-label">Account Number</div>
            <div class="bi-value">1873010000000291</div>
          </div>
          <div style="margin-top: 4px;">
            <div class="bi-label">IFSC Code</div>
            <div class="bi-value">KVBL0001873</div>
          </div>
          <div style="margin-top: 4px;">
            <div class="bi-label">Branch</div>
            <div class="bi-value">NEW COLONY - CHROMEPET</div>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align:center; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; font-size: 10px; color: rgba(255,255,255,0.7);">
      END OF OFFICIAL PROPOSAL — NITISH SOLAR EPC
    </div>
  </div>

</body>
</html>`;

  return { html, specs };
}
