export type YesNo = 'Yes' | 'No'
export type Gender = 'Male' | 'Female'
export type ContractType = 'Month-to-month' | 'One year' | 'Two year'
export type InternetService = 'DSL' | 'Fiber optic' | 'No'
export type PaymentMethod =
  | 'Electronic check'
  | 'Mailed check'
  | 'Bank transfer (automatic)'
  | 'Credit card (automatic)'

export type ServiceOption = YesNo | 'No internet service'
export type MultipleLinesOption = YesNo | 'No phone service'
export type RiskTier = 'low' | 'high'

export interface RiskFactor {
  feature: string
  impact: number
  shapValue?: number
  direction: 'increases' | 'decreases'
}

export interface Customer {
  customerID: string
  fullName?: string | null
  gender: Gender
  SeniorCitizen: 0 | 1
  Partner: YesNo
  Dependents: YesNo
  tenure: number
  Contract: ContractType
  PaperlessBilling: YesNo
  PaymentMethod: PaymentMethod
  MonthlyCharges: number
  TotalCharges: number
  PhoneService: YesNo
  MultipleLines: MultipleLinesOption
  InternetService: InternetService
  OnlineSecurity: ServiceOption
  OnlineBackup: ServiceOption
  DeviceProtection: ServiceOption
  TechSupport: ServiceOption
  StreamingTV: ServiceOption
  StreamingMovies: ServiceOption
  Churn: YesNo
  churnProbability: number
  riskLevel?: 'LOW' | 'HIGH' | null
  riskFactors: RiskFactor[]
  lastUpdated: string
  lastPredictedAt?: string | null
}

export interface User {
  id: string
  name: string
  email: string
  role: 'CS Agent' | 'ChurnAi Manager' | 'Admin'
}

export type BackendRole = 'CS_AGENT' | 'MANAGER'

export interface AgentUser {
  id: string
  name: string
  email: string
  role: BackendRole
}

export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type OutreachChannel = 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'SMS' | 'IN_APP' | 'OTHER'
export type OutreachOutcome =
  | 'CONTACTED'
  | 'NO_RESPONSE'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'COMPLAINED'
  | 'ESCALATED'
  | 'FOLLOW_UP_NEEDED'
export type OfferType =
  | 'DISCOUNT'
  | 'CONTRACT_UPGRADE'
  | 'FREE_SUPPORT'
  | 'SERVICE_BUNDLE'
  | 'DEVICE_PROTECTION'
  | 'CUSTOM'
export type OfferStatus = 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'
export type CaseResolutionOutcome =
  | 'RETAINED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'CUSTOMER_UNREACHABLE'
  | 'CHURN_CONFIRMED'
  | 'OTHER'

export interface RecommendedAction {
  type: string
  label: string
  reason: string
}

export interface CaseUser {
  id: string
  name: string
  email: string
  role: BackendRole
}

export interface OutreachLog {
  id: string
  caseId: string
  customerID: string
  agentId: string | null
  channel: OutreachChannel
  outcome: OutreachOutcome
  notes: string | null
  nextFollowUpAt: string | null
  createdAt: string
  updatedAt: string
  agent?: CaseUser | null
}

export interface RetentionOffer {
  id: string
  caseId: string
  customerID: string
  offeredById: string | null
  offerType: OfferType
  title: string
  description: string | null
  discountPercent: number | null
  discountAmount: number | null
  durationMonths: number | null
  status: OfferStatus
  offeredAt: string
  respondedAt: string | null
  createdAt: string
  updatedAt: string
  offeredBy?: CaseUser | null
}

export interface InterventionCase {
  id: string
  customerID: string
  assignedToId: string | null
  createdById: string | null
  status: CaseStatus
  priority: CasePriority
  title: string | null
  reason: string | null
  churnProbabilitySnapshot: number
  riskLevelSnapshot: 'LOW' | 'HIGH' | null
  riskFactorsSnapshot: RiskFactor[] | null
  recommendedActions: RecommendedAction[] | null
  resolutionOutcome: CaseResolutionOutcome | null
  resolutionNote: string | null
  finalOutreachLogId: string | null
  finalOfferId: string | null
  resolvedAt: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
  customer?: Customer & { displayName?: string }
  assignedTo?: CaseUser | null
  createdBy?: CaseUser | null
  outreachLogs?: OutreachLog[]
  retentionOffers?: RetentionOffer[]
}

export interface InterventionAnalytics {
  totalCases: number
  openCases: number
  inProgressCases: number
  resolvedCases: number
  closedCases: number
  unassignedCases: number
  highRiskCustomersWithoutActiveCase: number
  averageTimeToFirstOutreachHours: number
  offerAcceptanceRate: number
  offersByStatus: Record<OfferStatus, number>
  casesByPriority: Record<CasePriority, number>
}

export interface FilterState {
  search: string
  minProbability: number
  maxProbability: number
  contract: ContractType | 'all'
  internet: InternetService | 'all'
  tenureRange: 'all' | '0-12' | '13-24' | '25-48' | '49+'
  riskTier: RiskTier | 'all'
}
