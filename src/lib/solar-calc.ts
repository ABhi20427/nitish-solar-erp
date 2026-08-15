import { CustomerType } from './types';

export interface SolarCalcInput {
  monthlyBillAmount: number; // in currency units (e.g. ₹ or $)
  tariffRatePerKwh?: number;  // average tariff rate (default 8.5)
  availableRoofAreaSqFt?: number;
  customerType?: CustomerType;
}

export interface SolarCalcResult {
  recommendedCapacityKw: number; // e.g. 5 kW
  panelCountEst: number;           // 540W N-type panels count
  roofAreaRequiredSqFt: number;   // 100 sq ft per kW
  annualGenerationKwh: number;    // 1450 kWh per kW per year
  monthlySavingsEst: number;
  annualSavingsEst: number;
  grossSystemCostEst: number;
  subsidyEstimate: number;        // Government rebate (PM Surya Ghar scheme or commercial tax credit)
  netSystemCostEst: number;
  paybackPeriodYears: number;
  co2OffsetTonsPerYear: number;
  treesPlantedEquivalent: number;
}

export function calculateSolarSystem(input: SolarCalcInput): SolarCalcResult {
  const bill = Math.max(500, input.monthlyBillAmount || 3500);
  const tariff = input.tariffRatePerKwh || 8.5;
  const isResidential = input.customerType !== 'COMMERCIAL' && input.customerType !== 'INDUSTRIAL';

  // 1. Estimate monthly energy consumption in kWh
  const monthlyKwh = bill / tariff;
  // Daily consumption = monthly / 30
  const dailyKwh = monthlyKwh / 30;

  // Average 4.3 peak sun hours per day
  let recommendedKw = Math.ceil((dailyKwh / 4.0) * 10) / 10;
  if (recommendedKw < 1) recommendedKw = 1;
  if (isResidential && recommendedKw > 25) recommendedKw = 25;

  // Check roof area limitation if provided (approx 80-100 sq ft per kW)
  if (input.availableRoofAreaSqFt && input.availableRoofAreaSqFt > 0) {
    const maxKwFromRoof = Math.floor(input.availableRoofAreaSqFt / 85);
    if (maxKwFromRoof > 0 && maxKwFromRoof < recommendedKw) {
      recommendedKw = maxKwFromRoof;
    }
  }

  // 540W N-Type TOPCon Panels
  const panelWattage = 540;
  const panelCount = Math.ceil((recommendedKw * 1000) / panelWattage);
  const roofAreaReq = Math.round(recommendedKw * 90);

  // Annual Generation: ~1450 kWh per kWp per year
  const annualGenKwh = Math.round(recommendedKw * 1450);
  const annualSavings = Math.round(annualGenKwh * tariff);
  const monthlySavings = Math.round(annualSavings / 12);

  // System Cost Tier: Commercial drops cost per watt
  let costPerWatt = 55; // ₹55 per watt baseline turnkey
  if (recommendedKw >= 10) costPerWatt = 48;
  if (recommendedKw >= 50) costPerWatt = 42;
  if (recommendedKw >= 100) costPerWatt = 38;

  const grossCost = Math.round(recommendedKw * 1000 * costPerWatt);

  // Subsidy Calculation (PM Surya Ghar scheme rules simulation)
  let subsidy = 0;
  if (isResidential) {
    if (recommendedKw <= 1) subsidy = 30000;
    else if (recommendedKw <= 2) subsidy = 60000;
    else subsidy = 78000; // max cap ₹78,000 for residential
  } else {
    // Accelerated depreciation / tax benefits ~ 15% net savings
    subsidy = Math.round(grossCost * 0.15);
  }

  const netCost = Math.max(0, grossCost - subsidy);
  const payback = Math.round((netCost / annualSavings) * 10) / 10;

  // CO2 offset: 0.82 kg CO2 per kWh generated in grid
  const co2Tons = Math.round((annualGenKwh * 0.82) / 1000 * 10) / 10;
  const treesEquivalent = Math.round(co2Tons * 45);

  return {
    recommendedCapacityKw: recommendedKw,
    panelCountEst: panelCount,
    roofAreaRequiredSqFt: roofAreaReq,
    annualGenerationKwh: annualGenKwh,
    monthlySavingsEst: monthlySavings,
    annualSavingsEst: annualSavings,
    grossSystemCostEst: grossCost,
    subsidyEstimate: subsidy,
    netSystemCostEst: netCost,
    paybackPeriodYears: Math.max(2.5, payback),
    co2OffsetTonsPerYear: co2Tons,
    treesPlantedEquivalent: treesEquivalent,
  };
}
