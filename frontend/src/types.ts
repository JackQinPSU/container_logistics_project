export interface ContainerRecord {
  equipment_id: string
  equipment_type: string
  size: string
  pickup_location: string
  return_location: string
  contract_free_days: number
  actual_dwell_days: number
  daily_rate_usd: number
  customer_id: string
  pickup_date: string
  return_date: string
  status: string
  overage_days: number
  accrued_cost: number
  action: string | null
}

export interface Summary {
  total_records: number
  flagged_records: number
  total_accrued_cost: number
  highest_cost_overage: number
}