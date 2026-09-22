export type EntityId = number | string;
export type ISODate = string;
export type ISODateTime = string;
export type CurrencyCode = string;
export type MetricValue = number | null;

export interface ApiEnvelope<T> {
  data: T;
  message?: string | null;
  errors?: Record<string, string[]> | null;
}

export interface ApiErrorPayload {
  message: string;
  error_code?: string;
  request_id?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

export type PlatformRoleCode = 'SUPER_ADMIN' | null;
export type AgencyRoleCode = 'AGENCY_ADMIN' | 'MANAGER' | 'ANALYST' | 'VIEWER' | 'CLIENT_USER';

export interface Membership {
  agency_id: EntityId;
  role_code: AgencyRoleCode;
  client_id: EntityId | null;
  workspace_ids: EntityId[];
}

export interface CurrentUser {
  id: EntityId;
  name: string;
  email: string;
  platform_role_code: PlatformRoleCode;
  membership: Membership | null;
}

export interface Agency {
  id: EntityId;
  name: string;
  code?: string | null;
  status: 'active' | 'inactive';
  timezone?: string | null;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

export interface Client {
  id: EntityId;
  agency_id: EntityId;
  name: string;
  status: 'active' | 'inactive';
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

export interface Workspace {
  id: EntityId;
  agency_id: EntityId;
  client_id: EntityId | null;
  name: string;
  status: 'active' | 'inactive';
  currency: CurrencyCode;
  timezone: string;
  reporting_start_date?: ISODate | null;
  reporting_end_date?: ISODate | null;
}

export interface DateRange {
  start_date: ISODate;
  end_date: ISODate;
  label?: string;
}

export interface ReportingFilters {
  workspace_id: EntityId;
  date_range: DateRange;
  channels?: string[];
  campaign_ids?: EntityId[];
  search?: string;
  status?: string[];
}

export interface KpiMetric {
  key: string;
  label: string;
  value: MetricValue;
  formatted_value: string;
  previous_value?: MetricValue;
  change_percent?: number | null;
  trend?: 'up' | 'down' | 'flat' | null;
  unit?: 'currency' | 'percent' | 'number' | 'ratio' | string;
}

export interface TimeSeriesPoint {
  date: ISODate;
  spend?: MetricValue;
  impressions?: MetricValue;
  clicks?: MetricValue;
  conversions?: MetricValue;
  revenue?: MetricValue;
  roas?: MetricValue;
  [metric: string]: string | number | null | undefined;
}

export interface AiSummary {
  headline: string;
  what_worked: string[];
  what_did_not_work: string[];
  recommendations: string[];
  generated_at?: ISODateTime | null;
  source?: 'seeded' | 'imported' | 'generated' | string;
}

export interface DashboardSummary {
  workspace: Workspace;
  date_range: DateRange;
  kpis: KpiMetric[];
  performance: TimeSeriesPoint[];
  ai_summary: AiSummary | null;
  data_updated_at: ISODateTime | null;
}

export interface DetailedMetricRow {
  date: ISODate;
  campaign_id?: EntityId | null;
  campaign: string;
  channel: string;
  spend: MetricValue;
  impressions: MetricValue;
  clicks: MetricValue;
  conversions: MetricValue;
  revenue: MetricValue;
  ctr?: MetricValue;
  cpc?: MetricValue;
  cpa?: MetricValue;
  roas?: MetricValue;
}

export interface Campaign {
  id: EntityId;
  workspace_id: EntityId;
  name: string;
  channel: string;
  status: 'active' | 'paused' | 'completed' | 'draft' | string;
  start_date: ISODate | null;
  end_date: ISODate | null;
  budget?: MetricValue;
  spend: MetricValue;
  impressions: MetricValue;
  clicks: MetricValue;
  conversions: MetricValue;
  revenue: MetricValue;
}

export interface ChannelPerformance {
  channel: string;
  spend: MetricValue;
  impressions: MetricValue;
  clicks: MetricValue;
  conversions: MetricValue;
  revenue: MetricValue;
  share_of_spend?: MetricValue;
  contribution_percent?: MetricValue;
  roas?: MetricValue;
}

export interface AudienceSegment {
  id?: EntityId;
  name: string;
  category?: string | null;
  size?: MetricValue;
  share_percent?: MetricValue;
  impressions?: MetricValue;
  clicks?: MetricValue;
  conversions?: MetricValue;
  index?: MetricValue;
}

export interface CreativePerformance {
  id: EntityId;
  campaign_id?: EntityId | null;
  name: string;
  asset_url?: string | null;
  asset_type?: 'image' | 'video' | 'audio' | 'display' | string;
  status?: string;
  spend: MetricValue;
  impressions: MetricValue;
  clicks: MetricValue;
  conversions: MetricValue;
  ctr?: MetricValue;
  cpa?: MetricValue;
}

export interface ReportDefinition {
  id: EntityId;
  name: string;
  type: string;
  status: 'ready' | 'processing' | 'failed' | string;
  period_start: ISODate;
  period_end: ISODate;
  created_at: ISODateTime;
  download_url?: string | null;
}

export interface IntelligenceMetric {
  key: string;
  label: string;
  value: string | number | null;
  category?: string | null;
  source?: string | null;
  planning_implication?: string | null;
}

export interface ProfileSection {
  title: string;
  summary?: string | null;
  metrics: IntelligenceMetric[];
  insights?: string[];
}

export interface DemographicBreakdown {
  dimension: string;
  segments: Array<{ label: string; value: number; percent?: number | null; index?: number | null }>;
}

export interface GeographicInsight {
  geography: string;
  geography_type?: 'country' | 'region' | 'province' | 'city' | 'postal_area' | string;
  value: number | null;
  share_percent?: number | null;
  index?: number | null;
  planning_implication?: string | null;
}

export interface BehaviourInsight {
  category: string;
  behaviour: string;
  affinity?: number | null;
  index?: number | null;
  source?: string | null;
  planning_implication?: string | null;
}

export interface MediaBrandInsight {
  category: string;
  brand_or_platform: string;
  reach_percent?: number | null;
  affinity?: number | null;
  index?: number | null;
  source?: string | null;
}

export interface IntelligenceFinding {
  id?: EntityId;
  type: 'insight' | 'comparison' | 'opportunity' | 'risk' | string;
  title: string;
  description: string;
  implication?: string | null;
  priority?: 'high' | 'medium' | 'low' | null;
}

export interface MarketingIntelligenceResponse {
  workspace_id: EntityId;
  audience_profile: ProfileSection[];
  demographic_profile: DemographicBreakdown[];
  geographic_insights: GeographicInsight[];
  behaviour: BehaviourInsight[];
  media_and_brand: MediaBrandInsight[];
  findings: IntelligenceFinding[];
  data_updated_at: ISODateTime | null;
  source_label?: string | null;
}

export interface MmmInputRow {
  date: ISODate;
  channel: string;
  spend: number;
  impressions?: number | null;
  clicks?: number | null;
  conversions?: number | null;
  revenue?: number | null;
  promotion?: number | boolean | null;
  seasonality?: string | number | null;
}

export interface DataReadinessCheck {
  key: string;
  label: string;
  status: 'ready' | 'warning' | 'error';
  message: string;
  affected_rows?: number;
}

export interface MmmModelSettings {
  outcome_metric: string;
  date_granularity: 'daily' | 'weekly' | 'monthly';
  currency: CurrencyCode;
  include_seasonality: boolean;
  include_promotions: boolean;
  model_version?: string | null;
}

export interface ChannelContribution {
  channel: string;
  spend: number;
  contribution: number;
  contribution_percent: number;
  incremental_outcome?: number | null;
  roas?: number | null;
  carryover_percent?: number | null;
  saturation_percent?: number | null;
  confidence?: 'high' | 'medium' | 'low' | null;
}

export interface ResponseCurvePoint {
  channel: string;
  spend: number;
  predicted_outcome: number;
  marginal_return?: number | null;
}

export interface BudgetAllocation {
  channel: string;
  current_budget: number;
  recommended_budget: number;
  change_percent: number;
  expected_outcome_change?: number | null;
}

export interface ScenarioInput {
  name?: string;
  total_budget: number;
  allocations: Array<{ channel: string; budget: number }>;
}

export interface ScenarioResult {
  name: string;
  total_budget: number;
  predicted_outcome: number;
  predicted_roas?: number | null;
  outcome_change_percent?: number | null;
  allocations: BudgetAllocation[];
}

export interface MmmAiReadout {
  outcome_story: string;
  channel_diagnosis: string[];
  recommendations: string[];
  caveats: string[];
}

export interface MmmResults {
  workspace_id: EntityId;
  model_status: 'not_started' | 'processing' | 'ready' | 'failed';
  data_readiness: DataReadinessCheck[];
  settings: MmmModelSettings;
  channel_contributions: ChannelContribution[];
  response_curves: ResponseCurvePoint[];
  recommended_budget: BudgetAllocation[];
  scenarios: ScenarioResult[];
  ai_readout: MmmAiReadout | null;
  model_run_at: ISODateTime | null;
}
