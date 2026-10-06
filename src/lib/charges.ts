export type FeeType = 'flat' | 'per_day' | 'per_kg';

export interface ChargeableStatus {
  id: string;
  name: string;
  description: string;
  feeType: FeeType;
  amount: number;
  currency: string;
  customerMessage: string;
  active: boolean;
  createdAt: string;
}

export const FEE_TYPE_LABELS: Record<FeeType, string> = {
  flat:    'Flat fee',
  per_day: 'Per day',
  per_kg:  'Per kg',
};

export function formatFee(charge: ChargeableStatus): string {
  const symbol = charge.currency === 'USD' ? '$' : charge.currency;
  return `${symbol}${charge.amount.toFixed(2)} ${FEE_TYPE_LABELS[charge.feeType]}`;
}
