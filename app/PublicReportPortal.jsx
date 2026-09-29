'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiRequestError } from '../lib/api';
import { publicReportApi } from '../lib/public-report-api';
import { ApiErrorState, ButtonProgress, FullPageLoader, InlineLoader } from './components/states';
import styles from './public-report.module.css';

const TOKEN_STORAGE_PREFIX = 'mosaiq.publicReport.access.';
const TAB_ICON_MAP = {
  reporting: 'reporting',
  marketing_intelligence: 'intelligence',
  mmm: 'metrics',
  executive_summary: 'summary',
  detailed_metrics: 'metrics',
  channels: 'channels',
  audience: 'audience',
  creative: 'creative',
  audience_profile: 'audience-research',
  demographic_profile: 'audience',
  geographic_insights: 'channels',
  behaviour: 'metrics',
  media_brand_intelligence: 'channels',
  insights_comparison: 'opportunity',
};

function unwrap(response) {
  return response?.data ?? response;
}

function storageKey(token) {
  return `${TOKEN_STORAGE_PREFIX}${token}`;
}

function readStoredToken(token) {
  if (typeof window === 'undefined') return '';
  try { return window.sessionStorage.getItem(storageKey(token)) || ''; }
  catch { return ''; }
}

function storeToken(token, accessToken) {
  if (typeof window === 'undefined') return;
  try {
    if (accessToken) window.sessionStorage.setItem(storageKey(token), accessToken);
    else window.sessionStorage.removeItem(storageKey(token));
  } catch {}
}

function formatValue(value, format = 'number', currency = 'CAD') {
  if (value === null || value === undefined || value === '') return '-';
  if (format === 'text') return String(value);
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  if (format === 'currency') {
    const compact = new Intl.NumberFormat('en-CA', { notation: 'compact', maximumFractionDigits: 1 }).format(number);
    const symbol = currency === 'CAD' || currency === 'USD' ? '$' : `${currency} `;
    return `${symbol}${compact}`;
  }
  if (format === 'percent') return `${new Intl.NumberFormat('en-CA', { maximumFractionDigits: 2 }).format(number)}%`;
  if (format === 'multiplier') return `${new Intl.NumberFormat('en-CA', { maximumFractionDigits: 2 }).format(number)}x`;
  return new Intl.NumberFormat('en-CA', { notation: Math.abs(number) >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(number);
}

function errorMessage(error) {
  if (!(error instanceof ApiRequestError)) return 'Something went wrong. Please try again.';
  if (error.code === 'REPORT_NOT_FOUND') return 'Report not found.';
  if (error.code === 'LINK_EXPIRED') return 'This link has expired.';
  if (error.code === 'LINK_REVOKED') return 'This link is no longer active.';
  if (error.code === 'TOO_MANY_ATTEMPTS') return error.message || 'Too many attempts. Try again in a moment.';
  if (error.code === 'RATE_LIMITED') return 'Please wait a moment and retry.';
  if (error.status >= 500) return error.requestId ? `The report server had a problem. Request ID: ${error.requestId}` : 'The report server had a problem.';
  return error.message || 'Something went wrong. Please try again.';
}

function firstTab(sections = []) {
  const section = sections.find((item) => item?.tabs?.length);
  return section ? { section: section.code, tab: section.tabs[0].code } : { section: '', tab: '' };
}

function defaultRange(metadata) {
  const range = metadata?.date_range?.default;
  return { from: range?.from || '', to: range?.to || '', preset: range?.preset || 'custom' };
}

function parseDate(value) {
  const [year, month, day] = String(value || '').split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function dateString(date) {
  return date ? date.toISOString().slice(0, 10) : '';
}

function clampDate(value, min, max) {
  const date = parseDate(value);
  const minDate = parseDate(min);
  const maxDate = parseDate(max);
  if (!date) return value || '';
  if (minDate && date < minDate) return dateString(minDate);
  if (maxDate && date > maxDate) return dateString(maxDate);
  return dateString(date);
}

function presetLabel(preset) {
  const labels = {
    last_7_days: 'Last 7 days',
    last_30_days: 'Last 30 days',
    last_90_days: 'Last 90 days',
    this_quarter: 'This quarter',
    custom: 'Custom',
  };
  return labels[preset] || String(preset || '').replaceAll('_', ' ');
}

function dateRangeOptions(metadata) {
  const presets = metadata?.date_range?.presets || [];
  const values = presets.includes('this_quarter') ? [...presets] : [...presets, 'this_quarter'];
  return values.filter(Boolean).map((value) => ({ value, label: presetLabel(value) }));
}

function rangeForPreset(metadata, preset) {
  const dateRange = metadata?.date_range || {};
  const available = dateRange.available || {};
  if (preset === 'custom') return { ...defaultRange(metadata), preset: 'custom' };
  if (preset === dateRange.default?.preset) return defaultRange(metadata);

  const to = available.to || dateRange.default?.to || '';
  const toDate = parseDate(to);
  if (!toDate) return { ...defaultRange(metadata), preset };

  if (preset === 'this_quarter') {
    const quarterMonth = Math.floor(toDate.getUTCMonth() / 3) * 3;
    const start = new Date(Date.UTC(toDate.getUTCFullYear(), quarterMonth, 1));
    return {
      preset,
      from: clampDate(dateString(start), available.from, available.to),
      to: clampDate(to, available.from, available.to),
    };
  }

  const match = /^last_(\d+)_days$/.exec(preset);
  if (match) {
    const days = Number(match[1]);
    const start = new Date(toDate);
    start.setUTCDate(start.getUTCDate() - Math.max(days - 1, 0));
    return {
      preset,
      from: clampDate(dateString(start), available.from, available.to),
      to: clampDate(to, available.from, available.to),
    };
  }

  return { ...defaultRange(metadata), preset };
}

function applyRangePreset(metadata, setRange, preset) {
  setRange(rangeForPreset(metadata, preset));
}

function changeClass(change) {
  if (!change) return '';
  if (change.sentiment === 'positive') return styles.positive;
  if (change.sentiment === 'negative') return styles.negative;
  return styles.neutral;
}

function StatusChip({ status }) {
  if (!status) return null;
  const code = status.code || 'neutral';
  return <span className={`${styles.status} ${styles[`status_${code}`] || styles.status_neutral}`}>{status.label || status.code}</span>;
}

function PasswordScreen({ metadata, busy, error, onUnlock }) {
  const [password, setPassword] = useState('');
  const accent = metadata?.theme?.accent || '#5b5bd6';
  return (
    <main className={styles.passwordPage} style={{ '--accent': accent }}>
      <form className={styles.passwordCard} onSubmit={(event) => { event.preventDefault(); onUnlock(password); }}>
        {metadata?.theme?.logo_url || metadata?.agency?.logo_url ? <img className={styles.passwordLogo} src={metadata.theme?.logo_url || metadata.agency.logo_url} alt="" /> : null}
        <p className={styles.eyebrow}>{metadata?.agency?.name || 'MOSAIQ'}</p>
        <h1>{metadata?.report?.name || 'Protected report'}</h1>
        <p>Enter the report password to continue.</p>
        <label className={styles.field}>
          <span>Password</span>
          <input value={password} type="password" autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} disabled={busy} autoFocus />
        </label>
        {error ? <p className={styles.formError} role="alert">{error}</p> : null}
        <button className={styles.primaryButton} type="submit" disabled={busy || !password}>
          {busy ? <ButtonProgress label="Unlocking" /> : 'Open report'}
        </button>
      </form>
    </main>
  );
}

function TabIcon({ name }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.9',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  switch (name) {
    case 'reporting':
      return <svg {...common}><path d="M4 6h16v12H4z" /><path d="M8 10h8" /><path d="M8 14h5" /></svg>;
    case 'intelligence':
      return <svg {...common}><path d="M12 3l4 4 5 1-1 5 1 5-5 1-4 4-4-4-5-1 1-5-1-5 5-1z" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>;
    case 'summary':
      return <svg {...common}><path d="M4 5h16v14H4z" /><path d="M8 9h8" /><path d="M8 13h4" /></svg>;
    case 'metrics':
      return <svg {...common}><path d="M5 19V5" /><path d="M5 19h14" /><path d="M8 15l3-4 3 2 5-7" /></svg>;
    case 'channels':
      return <svg {...common}><path d="M5 7h14" /><path d="M5 12h14" /><path d="M5 17h14" /><circle cx="9" cy="7" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="11" cy="17" r="1.5" /></svg>;
    case 'audience':
      return <svg {...common}><circle cx="12" cy="8" r="3" /><path d="M5 19c1.5-3.5 4.4-5 7-5s5.5 1.5 7 5" /></svg>;
    case 'creative':
      return <svg {...common}><path d="M4 7h16v10H4z" /><path d="M7 14l3-3 3 2 3-4 2 3" /></svg>;
    case 'reports':
      return <svg {...common}><path d="M6 4h9l3 3v13H6z" /><path d="M9 11h6" /><path d="M9 15h6" /></svg>;
    case 'audience-research':
      return <svg {...common}><circle cx="12" cy="12" r="6" /><path d="M12 6v3" /><path d="M18 12h-3" /><path d="M12 18v-3" /><path d="M6 12h3" /></svg>;
    case 'opportunity':
      return <svg {...common}><path d="M12 3v3" /><path d="M12 18v3" /><path d="M3 12h3M18 12h3" /><circle cx="12" cy="12" r="4" /></svg>;
    default:
      return null;
  }
}

function InsightIcon({ tone }) {
  if (tone === 'good') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 6.8" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" /></svg>;
}

function insightTone(widget) {
  const text = `${widget?.code || ''} ${widget?.title || ''}`.toLowerCase();
  if (text.includes("didn't") || text.includes('didnt') || text.includes('did_not') || text.includes('did-not') || text.includes('not work')) {
    return 'bad';
  }
  if (text.includes('what_worked') || text.includes('what-worked') || text.includes('what worked') || text.includes('worked')) {
    return 'good';
  }
  return '';
}

function isRoasDonut(widget) {
  const text = `${widget?.code || ''} ${widget?.title || ''}`.toLowerCase();
  return widget?.type === 'donut' && text.includes('roas') && text.includes('channel');
}

function isDetailedKpiGroup(widget) {
  return widget?.type === 'kpi_group' && (widget?.code === 'kpi_cards' || `${widget?.title || ''}`.toLowerCase().includes('key metrics'));
}

function isDetailedMetricTable(widget) {
  return widget?.type === 'metric_table' && (widget?.code === 'detailed_metrics_table' || `${widget?.title || ''}`.toLowerCase().includes('detailed metrics'));
}

function isActiveCampaigns(widget) {
  return widget?.type === 'data_table' && (widget?.code === 'active_campaigns' || `${widget?.title || ''}`.toLowerCase().includes('active campaigns'));
}

function iconForTab(tab) {
  return tab.icon || TAB_ICON_MAP[tab.code] || 'summary';
}

function Header({ metadata, activeSection, activeTab, onSelectTab, range, setRange }) {
  const sections = metadata?.sections || [];
  const active = sections.find((section) => section.code === activeSection);
  const dateOptions = dateRangeOptions(metadata);
  return (
    <header className={styles.header}>
      <div className={styles.topbar}>
        <div className={styles.brand}>
          {metadata?.theme?.logo_url ? <img src={metadata.theme.logo_url} alt="" /> : <span className={styles.logoMark}>M</span>}
          <div>
            <h1>MOSAIQ</h1>
            <p>{metadata?.report?.name || metadata?.report?.client_name || 'Prompt-driven client demo'}</p>
          </div>
        </div>
        <nav className={styles.sections} aria-label="Report sections">
          {sections.map((section) => (
            <button key={section.code} type="button" className={section.code === activeSection ? styles.active : ''} onClick={() => onSelectTab(section.code, section.tabs?.[0]?.code)}>
              <span className={styles.tabIcon}><TabIcon name={TAB_ICON_MAP[section.code] || 'reporting'} /></span>
              {section.name}
            </button>
          ))}
        </nav>
        <div className={styles.headerActions}>
          {dateOptions.length ? <select className={styles.headerSelect} value={range.preset} onChange={(event) => applyRangePreset(metadata, setRange, event.target.value)} aria-label="Select date range">
            {dateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select> : null}
        </div>
      </div>
      {active?.tabs?.length ? <nav className={styles.tabs} aria-label={`${active.name} tabs`}>
        {active.tabs.map((tab) => (
          <button key={tab.code} type="button" className={tab.code === activeTab ? styles.active : ''} onClick={() => onSelectTab(active.code, tab.code)}>
            <span className={styles.tabIcon}><TabIcon name={iconForTab(tab)} /></span>
            {tab.name}
          </button>
        ))}
      </nav> : null}
    </header>
  );
}

function Filters({ metadata, range, setRange, activeSection }) {
  if (['marketing_intelligence', 'mmm'].includes(activeSection)) return null;
  return (
    <div className={styles.reportControlBar}>
      <div className={styles.dateSummary}>
        <span>Date range</span>
        <div className={styles.dateInputs}>
          <label><em>From</em><input type="date" value={range.from} min={metadata?.date_range?.available?.from || undefined} max={range.to || metadata?.date_range?.available?.to || undefined} onChange={(event) => setRange((current) => ({ ...current, from: event.target.value, preset: 'custom' }))} /></label>
          <label><em>To</em><input type="date" value={range.to} min={range.from || metadata?.date_range?.available?.from || undefined} max={metadata?.date_range?.available?.to || undefined} onChange={(event) => setRange((current) => ({ ...current, to: event.target.value, preset: 'custom' }))} /></label>
        </div>
      </div>
    </div>
  );
}

function WidgetFrame({ widget, children }) {
  const span = widget.span === 2 || widget.type === 'recommendation_list' || isDetailedKpiGroup(widget) || isActiveCampaigns(widget) ? styles.span2 : styles.span1;
  const bodyOwnsHeader = widget.type === 'line_chart' || isRoasDonut(widget) || isDetailedKpiGroup(widget) || isDetailedMetricTable(widget) || isActiveCampaigns(widget);
  const tone = insightTone(widget);
  return (
    <article className={`${styles.widget} ${span} ${tone ? styles.insightWidget : ''}`}>
      {!bodyOwnsHeader ? <div className={styles.widgetHeader}>
        <div>
          <h2>{tone ? <span className={`${styles.insightTitleIcon} ${tone === 'good' ? styles.insightGood : styles.insightBad}`}><InsightIcon tone={tone} /></span> : null}{widget.title}</h2>
          {widget.subtitle ? <p>{widget.subtitle}</p> : null}
        </div>
        {widget.as_of ? <span>As of {widget.as_of}</span> : null}
      </div> : null}
      {widget.empty && !bodyOwnsHeader ? <p className={styles.empty}>No data for this period.</p> : children}
    </article>
  );
}

function HeroWidget({ summary, kpi, metadata }) {
  const currency = metadata?.currency || 'CAD';
  return (
    <section className={`${styles.heroCard} ${styles.span2}`}>
      <div className={styles.heroCopy}>
        <div className={styles.heroKicker}>{summary?.title || 'AI Summary'}</div>
        {summary?.empty ? <p className={styles.empty}>No data for this period.</p> : <>
          <h2>{summary?.headline || summary?.title || 'Report summary'}</h2>
          {summary?.body ? <p>{summary.body}</p> : null}
        </>}
      </div>
      <div className={styles.heroVisual} aria-hidden="true">
        <img src="/hero/executive-summary.png" alt="" />
      </div>
      {kpi ? <div className={styles.heroStat}>
        {kpi.empty ? <p className={styles.empty}>No data for this period.</p> : <>
          <strong>{formatValue(kpi.value, kpi.format, currency)}</strong>
          <span>{kpi.label || kpi.title}</span>
          <Change change={kpi.change} currency={currency} />
        </>}
      </div> : null}
    </section>
  );
}

function Change({ change, currency }) {
  if (!change) return null;
  return <span className={`${styles.change} ${changeClass(change)}`}>{change.value !== null && change.value !== undefined ? `${formatValue(change.value, change.format, currency)} ` : ''}{change.label || ''}</span>;
}

function Kpi({ item, currency }) {
  return <div className={styles.kpi}><span>{item.label || item.title}</span><strong>{formatValue(item.value, item.format, currency)}</strong><Change change={item.change} currency={currency} /></div>;
}function kpiTone(item, index) {
  const label = `${item?.label || item?.title || ''}`.toLowerCase();
  if (label.includes('spend')) return 'blue';
  if (label.includes('impression')) return 'purple';
  if (label.includes('ctr')) return 'green';
  if (label.includes('conversion')) return 'orange';
  if (label.includes('cpa')) return 'cyan';
  return ['blue', 'purple', 'green', 'orange', 'cyan'][index % 5];
}

function kpiLabel(item) {
  const label = item.label || item.title || '';
  if (label.toLowerCase() === 'spend') return 'Total spend';
  if (label.toLowerCase() === 'ctr') return 'Avg. CTR';
  if (label.toLowerCase() === 'cpa') return 'Blended CPA';
  return label;
}

function KpiIcon({ tone }) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.9', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' };
  if (tone === 'purple') return <svg {...common}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" /><circle cx="12" cy="12" r="2.5" /></svg>;
  if (tone === 'green') return <svg {...common}><path d="M4 17l5-5 4 3 7-8" /><path d="M15 7h5v5" /></svg>;
  if (tone === 'orange') return <svg {...common}><path d="M5 12l4 4L19 6" /></svg>;
  if (tone === 'cyan') return <svg {...common}><path d="M8 5h8" /><path d="M8 12h8" /><path d="M8 19h8" /><path d="M5 5h.01" /><path d="M5 12h.01" /><path d="M5 19h.01" /></svg>;
  return <svg {...common}><path d="M7 3v3" /><path d="M17 3v3" /><path d="M4 8h16" /><path d="M5 5h14v15H5z" /><path d="M10 13h4" /></svg>;
}

function Sparkline({ points = [], tone }) {
  const values = points.map((point) => Number(point.y)).filter(Number.isFinite);
  if (!values.length) return null;
  const width = 190;
  const height = 48;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const xFor = (index) => 10 + (points.length <= 1 ? (width - 20) / 2 : (index / (points.length - 1)) * (width - 20));
  const yFor = (value) => height - 8 - ((Number(value) - min) / (max - min || 1)) * (height - 16);
  const path = points.reduce((acc, point, index) => {
    const value = Number(point.y);
    if (!Number.isFinite(value)) return acc;
    return `${acc} ${acc ? 'L' : 'M'}${xFor(index).toFixed(2)},${yFor(value).toFixed(2)}`.trim();
  }, '');
  return <svg className={styles.kpiSparkline} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
    {path ? <path d={path} className={`${styles.kpiSparkPath} ${styles[`kpiTone_${tone}`]}`} /> : null}
    {points.map((point, index) => Number.isFinite(Number(point.y)) ? <circle key={point.x || index} cx={xFor(index)} cy={yFor(point.y)} r="2.4" className={`${styles.kpiSparkDot} ${styles[`kpiTone_${tone}`]}`} /> : null)}
  </svg>;
}

function KpiCardGroup({ items = [], currency }) {
  return <div className={styles.detailedKpiGrid}>{items.map((item, index) => {
    const tone = kpiTone(item, index);
    return <div className={`${styles.detailedKpiCard} ${styles[`kpiCard_${tone}`]}`} key={item.label || item.title || index}>
      <span className={styles.kpiIcon}><KpiIcon tone={tone} /></span>
      <span className={styles.kpiCardLabel}>{kpiLabel(item)}</span>
      <strong>{formatValue(item.value, item.format, currency)}</strong>
      {item.change ? <span className={`${styles.change} ${changeClass(item.change)}`}>{item.change.value !== null && item.change.value !== undefined ? `${formatValue(item.change.value, item.change.format, currency)} ` : ''}vs prior</span> : null}
      <Sparkline points={item.sparkline || []} tone={tone} />
    </div>;
  })}</div>;
}

function MetricTableWidget({ widget, currency, metadata, range, setRange }) {
  return <div className={styles.metricTableWidget}>
    <div className={styles.sectionHeaderRow}>
      <h2>{widget.title}</h2>
    </div>
    <div className={styles.metricTable}>
      <div className={styles.metricTableHead}><span>Metric</span><span>Value</span><span>Status</span><span>Details</span></div>
      {(widget.rows || []).map((row, index) => <div className={styles.metricTableRow} key={row.metric || row.label || index}>
        <strong>{row.label}</strong>
        <span>{formatValue(row.value, row.format, currency)}</span>
        <span>{row.status ? <StatusChip status={row.status} /> : null}</span>
        <em>{row.details || ''}</em>
      </div>)}
    </div>
  </div>;
}


function BarList({ items = [], currency, maxValue }) {
  const max = maxValue || Math.max(1, ...items.map((item) => Number(item.share ?? item.value) || 0));
  return <div className={styles.barList}>{items.map((item) => {
    const width = Math.max(0, Math.min(100, ((Number(item.share ?? item.value) || 0) / max) * 100));
    return <div className={styles.barRow} key={item.key || item.label}>
      <div><span>{item.label}</span><strong>{formatValue(item.value, item.format, currency)}</strong></div>
      <div className={styles.barTrack}><i style={{ width: `${width}%`, background: item.color || undefined }} /></div>
      {item.secondary ? <small>{item.secondary.label}: {formatValue(item.secondary.value, item.secondary.format, currency)}</small> : null}
    </div>;
  })}</div>;
}

function DataTable({ widget, currency }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [channel, setChannelFilter] = useState('');
  const [sortBy, setSortBy] = useState('spend');
  const rows = widget.rows || [];
  const columns = widget.columns || [];
  const activeCampaigns = isActiveCampaigns(widget);
  const statuses = [...new Set(rows.map((row) => row.status?.status?.label || row.status?.status?.code || row.status?.value || row.status).filter(Boolean))];
  const channels = [...new Set(rows.map((row) => row.channel).filter(Boolean))];
  const filtered = rows
    .filter((row) => !search || JSON.stringify(row).toLowerCase().includes(search.toLowerCase()))
    .filter((row) => !status || (row.status?.status?.label || row.status?.status?.code || row.status?.value || row.status) === status)
    .filter((row) => !channel || row.channel === channel)
    .slice()
    .sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      const an = typeof av === 'object' && av !== null ? Number(av.value) : Number(av);
      const bn = typeof bv === 'object' && bv !== null ? Number(bv.value) : Number(bv);
      if (Number.isFinite(an) && Number.isFinite(bn)) return bn - an;
      return String(av ?? '').localeCompare(String(bv ?? ''));
    });
  return <div className={activeCampaigns ? styles.campaignTableWidget : undefined}>
    {activeCampaigns ? <div className={styles.campaignHeader}><h2>{widget.title}</h2><span>{widget.total || rows.length} campaigns</span></div> : null}
    <div className={`${styles.tableTools} ${activeCampaigns ? styles.campaignFilters : ''}`}>
      <input placeholder={activeCampaigns ? 'Search campaigns...' : 'Search rows'} value={search} onChange={(event) => setSearch(event.target.value)} />
      {activeCampaigns ? <>
        <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select value={channel} onChange={(event) => setChannelFilter(event.target.value)}><option value="">All channels</option>{channels.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="spend">Spend</option><option value="impressions">Impressions</option><option value="ctr">CTR</option><option value="conversions">Conversions</option><option value="campaign">Campaign</option></select>
      </> : widget.truncated ? <span>Showing {rows.length} of {widget.total}</span> : null}
    </div>
    <div className={styles.tableWrap}>
      <table>
        <thead><tr>{columns.map((column) => <th key={column.key || column}>{column.label || column}</th>)}</tr></thead>
        <tbody>{filtered.map((row, index) => <tr key={row.key || row.id || index}>{columns.map((column) => {
          const key = column.key || String(column).toLowerCase();
          const cell = row[key];
          const value = cell && typeof cell === 'object' && !Array.isArray(cell) ? cell.value : cell;
          const format = cell && typeof cell === 'object' ? (cell.format || column.format) : column.format;
          return <td key={key}>{cell?.status ? <StatusChip status={cell.status} /> : formatValue(value, format, currency)}</td>;
        })}</tr>)}</tbody>
      </table>
    </div>
  </div>;
}

function CreativeGrid({ widget, currency }) {
  const [type, setType] = useState('');
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');
  const items = widget.items || [];
  const types = [...new Set(items.map((item) => item.type).filter(Boolean))];
  const platforms = [...new Set(items.map((item) => item.platform).filter(Boolean))];
  const statuses = [...new Set(items.map((item) => item.status?.code).filter(Boolean))];
  const filtered = items.filter((item) => (!type || item.type === type) && (!platform || item.platform === platform) && (!status || item.status?.code === status));
  return <>
    <div className={styles.tableTools}>
      <select value={type} onChange={(event) => setType(event.target.value)}><option value="">All types</option>{types.map((value) => <option key={value} value={value}>{value}</option>)}</select>
      <select value={platform} onChange={(event) => setPlatform(event.target.value)}><option value="">All platforms</option>{platforms.map((value) => <option key={value} value={value}>{value}</option>)}</select>
      <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select>
    </div>
    <div className={styles.creativeGrid}>{filtered.map((item) => <div className={styles.creativeCard} key={item.key || item.title}>
      {item.thumbnail_url ? <img src={item.thumbnail_url} alt="" /> : <div className={styles.thumbnailFallback}>{item.type || item.format || 'Creative'}</div>}
      <div>
        <h3>{item.title}</h3>
        <p>{item.campaign}</p>
        <StatusChip status={item.status} />
        <dl>{Object.entries(item.metrics || {}).map(([key, metric]) => <div key={key}><dt>{key}</dt><dd>{formatValue(metric.value, metric.format, currency)}</dd></div>)}</dl>
      </div>
    </div>)}</div>
  </>;
}

const DONUT_COLORS = ['#4f83f1', '#9b7cf3', '#f8cb5d', '#ff8a3d', '#2fc3c3', '#5a67f4'];

function donutSegmentPath(cx, cy, radius, startAngle, endAngle) {
  const start = polarPoint(cx, cy, radius, endAngle);
  const end = polarPoint(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarPoint(cx, cy, radius, angle) {
  const radians = (angle - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function Donut({ widget, currency, onChannel, metadata, range, setRange }) {
  const isRoas = isRoasDonut(widget);
  const items = widget.items || [];
  const values = items.map((item) => Number(item.share ?? item.percent ?? item.value) || 0);
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  let angle = 0;
  const centerValue = widget.center
    ? formatValue(widget.center.value, widget.center.format, currency)
    : formatValue(widget.value, widget.format || 'decimal', currency);
  const centerLabel = widget.center?.label || widget.label || 'Blended ROAS';

  if (!isRoas) {
    return <div className={styles.donutGrid}>
      {widget.center ? <div className={styles.donutCenter}><span>{widget.center.label}</span><strong>{formatValue(widget.center.value, widget.center.format, currency)}</strong></div> : null}
      <BarList items={items.map((item) => ({ ...item, value: item.share ?? item.value, format: item.share == null ? item.format : 'percent' }))} currency={currency} maxValue={100} />
      {widget.filterable ? <div className={styles.segmentButtons}>{items.map((item) => <button key={item.key} type="button" onClick={() => onChannel?.(item.key)}>{item.label}</button>)}</div> : null}
    </div>;
  }

  return (
    <div className={styles.roasDonutWidget}>
      <div className={styles.roasDonutHeader}>
        <h2>{widget.title}</h2>

      </div>
      <div className={styles.roasDonutBody}>
        <div className={styles.roasDonutChart}>
          <svg viewBox="0 0 280 280" aria-hidden="true">
            <circle cx="140" cy="140" r="88" fill="none" stroke="#edf1f7" strokeWidth="38" />
            {items.map((item, index) => {
              const value = values[index];
              const start = angle;
              const end = angle + (value / total) * 360;
              angle = end;
              return <path key={item.key || item.label || index} d={donutSegmentPath(140, 140, 88, start, end)} fill="none" stroke={item.color || DONUT_COLORS[index % DONUT_COLORS.length]} strokeWidth="38" />;
            })}
          </svg>
          <div className={styles.roasDonutCenter}>
            <strong>{centerValue}</strong>
            <span>{centerLabel}</span>
          </div>
        </div>
        <div className={styles.roasLegend}>
          {items.map((item, index) => {
            const share = item.share ?? item.percent ?? item.value;
            const spend = item.spend ?? item.amount ?? item.secondary_value;
            return (
              <button key={item.key || item.label || index} type="button" onClick={() => item.key && onChannel?.(item.key)}>
                <i style={{ background: item.color || DONUT_COLORS[index % DONUT_COLORS.length] }} />
                <span>
                  <b>{item.label}</b>
                  {spend !== undefined && spend !== null ? <small>{formatValue(spend, item.spend_format || item.secondary_format || 'currency', currency)}</small> : null}
                </span>
                <strong>{formatValue(share, 'percent', currency)}</strong>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Gauge({ widget, currency }) {
  const pct = Math.max(0, Math.min(100, ((Number(widget.value) || 0) / (Number(widget.max) || 100)) * 100));
  return <div className={styles.gaugeWrap}>
    <div className={styles.gauge} style={{ '--pct': `${pct}%` }}><strong>{formatValue(widget.value, widget.format, currency)}</strong><span>{widget.label}</span></div>
    <div className={styles.detailList}>{widget.status ? <StatusChip status={widget.status} /> : null}{(widget.details || []).map((detail) => <p key={detail.label}><span>{detail.label}</span><strong>{formatValue(detail.value, detail.format, currency)}</strong></p>)}</div>
  </div>;
}

const LINE_COLORS = {
  spend: '#4f8df7',
  conversions: '#8b5cf6',
  revenue: '#12b76a',
  impressions: '#f97316',
  clicks: '#06b6d4',
};

function seriesColor(series, index) {
  return LINE_COLORS[series.key] || ['#4f8df7', '#8b5cf6', '#12b76a', '#f97316'][index % 4];
}

function compactAxis(value, format, currency) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '';
  if (format === 'currency') return formatValue(value, 'currency', currency);
  return new Intl.NumberFormat('en-CA', { notation: Math.abs(Number(value)) >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value);
}

function weekLabel(index) {
  return `Wk${index + 1}`;
}

function LineChartWidget({ widget, metadata, range, setRange }) {
  const currency = metadata?.currency || 'CAD';
  const variants = widget.variants || [];
  const defaultVariant = variants.find((variant) => variant.key === 'spend_vs_conversions') || variants[0];
  const [variantKey, setVariantKey] = useState(defaultVariant?.key || '');
  const activeVariant = variants.find((variant) => variant.key === variantKey) || defaultVariant;
  const activeKeys = activeVariant?.series_keys || (widget.series || []).slice(0, 2).map((series) => series.key);
  const activeSeries = (widget.series || []).filter((series) => activeKeys.includes(series.key));

  const leftSeries = activeSeries.filter((series) => series.axis !== 'right');
  const rightSeries = activeSeries.filter((series) => series.axis === 'right');
  const allPoints = activeSeries[0]?.points || [];
  const chartWidth = 560;
  const chartHeight = 214;
  const pad = { left: 48, right: 46, top: 18, bottom: 34 };
  const innerWidth = chartWidth - pad.left - pad.right;
  const innerHeight = chartHeight - pad.top - pad.bottom;

  function domainFor(seriesList) {
    const values = seriesList.flatMap((series) => (series.points || []).map((point) => Number(point.y)).filter(Number.isFinite));
    if (!values.length) return { min: 0, max: 1 };
    const max = Math.max(...values, 0);
    return { min: 0, max: max || 1 };
  }

  const leftDomain = domainFor(leftSeries);
  const rightDomain = domainFor(rightSeries);
  const xFor = (index) => pad.left + (allPoints.length <= 1 ? innerWidth / 2 : (index / (allPoints.length - 1)) * innerWidth);
  const yFor = (value, domain) => pad.top + innerHeight - ((Number(value) - domain.min) / (domain.max - domain.min || 1)) * innerHeight;
  const linePath = (series) => (series.points || []).reduce((path, point, index) => {
    if (point.y === null || point.y === undefined || !Number.isFinite(Number(point.y))) return path;
    const command = path ? 'L' : 'M';
    const domain = series.axis === 'right' ? rightDomain : leftDomain;
    return `${path} ${command}${xFor(index).toFixed(2)},${yFor(point.y, domain).toFixed(2)}`.trim();
  }, '');

  return (
    <div className={styles.lineChartWidget}>
      <div className={styles.chartTop}>
        <h2>{widget.title}</h2>
        <div className={styles.chartControls}>
          {variants.length ? <select value={activeVariant?.key || ''} onChange={(event) => setVariantKey(event.target.value)} aria-label="Select chart metric">
            {variants.map((variant) => <option key={variant.key} value={variant.key}>{variant.label}</option>)}
          </select> : null}
        </div>
      </div>
      {widget.subtitle ? <p className={styles.chartSubtitle}>{widget.subtitle}</p> : null}
      {widget.empty ? <p className={styles.empty}>No data for this period.</p> : <div className={styles.lineChartArea}>
        <div className={styles.chartLegend}>
          {activeSeries.map((series, index) => <span key={series.key}><i style={{ background: seriesColor(series, index) }} />{series.label}</span>)}
        </div>
        <svg className={styles.lineChartSvg} viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={widget.title}>
          {[0, .25, .5, .75, 1].map((ratio) => {
            const y = pad.top + innerHeight - ratio * innerHeight;
            return <line key={ratio} x1={pad.left} x2={chartWidth - pad.right} y1={y} y2={y} className={styles.gridLine} />;
          })}
          {[0, .25, .5, .75, 1].map((ratio) => {
            const leftValue = leftDomain.min + (leftDomain.max - leftDomain.min) * ratio;
            const rightValue = rightDomain.min + (rightDomain.max - rightDomain.min) * ratio;
            const y = pad.top + innerHeight - ratio * innerHeight;
            return <g key={ratio}>
              <text x={pad.left - 8} y={y + 4} textAnchor="end" className={styles.axisLabel}>{compactAxis(leftValue, leftSeries[0]?.format, currency)}</text>
              {rightSeries.length ? <text x={chartWidth - pad.right + 8} y={y + 4} textAnchor="start" className={styles.axisLabel}>{compactAxis(rightValue, rightSeries[0]?.format, currency)}</text> : null}
            </g>;
          })}
          {allPoints.map((point, index) => <text key={point.x || index} x={xFor(index)} y={chartHeight - 8} textAnchor="middle" className={styles.axisLabel}>{widget.granularity === 'week' ? weekLabel(index) : point.x}</text>)}
          {activeSeries.map((series, index) => {
            const path = linePath(series);
            const domain = series.axis === 'right' ? rightDomain : leftDomain;
            return <g key={series.key}>
              {path ? <path d={path} fill="none" stroke={seriesColor(series, index)} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /> : null}
              {(series.points || []).map((point, pointIndex) => point.y === null || point.y === undefined || !Number.isFinite(Number(point.y)) ? null : (
                <circle key={`${series.key}-${point.x || pointIndex}`} cx={xFor(pointIndex)} cy={yFor(point.y, domain)} r="3.4" fill="#fff" stroke={seriesColor(series, index)} strokeWidth="2.2" />
              ))}
            </g>;
          })}
        </svg>
      </div>}
    </div>
  );
}

function InsightBulletList({ items, tone }) {
  return (
    <div className={styles.insightList}>
      {items.map((item, index) => (
        <div className={styles.insightRow} key={`${tone}-${index}-${item}`}>
          <span className={`${styles.insightPointIcon} ${tone === 'good' ? styles.insightGood : styles.insightBad}`}>
            <InsightIcon tone={tone} />
          </span>
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}

function RecommendationList({ items }) {
  return (
    <div className={styles.actionList}>
      {items.map((item, index) => {
        const step = item.step || item.number || String(index + 1);
        const title = item.title || item.label || item.name || '';
        const body = item.body || item.description || item.text || item.summary || '';
        const owner = item.owner || item.team || item.assignee || '';
        return (
          <div className={styles.actionRow} key={`${step}-${title || index}`}>
            <div className={styles.actionStep}>{step}</div>
            <div className={styles.actionContent}>
              <div className={styles.actionTitle}>{title}</div>
              {body ? <div className={styles.actionBody}>{body}</div> : null}
            </div>
            {owner ? <div className={styles.actionOwner}>OWNER: {owner}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

function WidgetBody({ widget, metadata, setChannel, range, setRange }) {
  const currency = metadata?.currency || 'CAD';
  const tone = insightTone(widget);
  switch (widget.type) {
    case 'text_hero':
      return <div className={styles.textHero}><h3>{widget.headline}</h3><p>{widget.body}</p></div>;
    case 'kpi':
      return <Kpi item={widget} currency={currency} />;
    case 'kpi_group':
      if (isDetailedKpiGroup(widget)) return <KpiCardGroup items={widget.items || []} currency={currency} />;
      return <div className={styles.kpiGrid}>{(widget.items || []).map((item) => <Kpi key={item.label} item={item} currency={currency} />)}</div>;
    case 'kpi_list':
      return <div className={styles.list}>{(widget.items || []).map((item) => <p key={item.label}><span>{item.label}</span><strong>{formatValue(item.value, item.format, currency)}</strong></p>)}</div>;
    case 'bar_chart':
    case 'progress_list':
      return <BarList items={widget.items || []} currency={currency} maxValue={widget.type === 'progress_list' ? 100 : undefined} />;
    case 'channel_list':
      return <BarList items={(widget.items || []).map((item) => ({ ...item, key: item.channel, value: item.spend, format: 'currency', color: metadata?.theme?.channel_colors?.[item.channel] }))} currency={currency} />;
    case 'donut':
      return <Donut widget={widget} currency={currency} onChannel={setChannel} metadata={metadata} range={range} setRange={setRange} />;
    case 'gauge':
      return <Gauge widget={widget} currency={currency} />;
    case 'metric_table':
      if (isDetailedMetricTable(widget)) return <MetricTableWidget widget={widget} currency={currency} metadata={metadata} range={range} setRange={setRange} />;
      return <div className={styles.list}>{(widget.rows || []).map((row) => <p key={row.metric || row.label}><span>{row.label}<small>{row.details}</small></span><strong>{formatValue(row.value, row.format, currency)}</strong><StatusChip status={row.status} /></p>)}</div>;
    case 'field_table':
    case 'data_table':
      return <DataTable widget={widget} currency={currency} />;
    case 'creative_grid':
      return <CreativeGrid widget={widget} currency={currency} />;
    case 'bullet_list':
      if (tone) return <InsightBulletList items={widget.items || []} tone={tone} />;
      return <ul className={styles.bulletList}>{(widget.items || []).map((item) => <li key={item}>{item}</li>)}</ul>;
    case 'recommendation_list':
      return <RecommendationList items={widget.items || []} />;
    case 'heatmap':
      return <DataTable widget={{ columns: [{ key: 'label', label: '' }, ...(widget.columns || []).map((label, index) => ({ key: `v${index}`, label, format: 'number' }))], rows: (widget.rows || []).map((row) => ({ label: row.label, ...(row.values || []).reduce((acc, value, index) => ({ ...acc, [`v${index}`]: value }), {}) })) }} currency={currency} />;
    case 'line_chart':
      return <LineChartWidget widget={widget} metadata={metadata} range={range} setRange={setRange} />;
    default:
      return null;
  }
}

const SUPPORTED_WIDGET_TYPES = new Set([
  'text_hero',
  'kpi',
  'kpi_group',
  'kpi_list',
  'line_chart',
  'bar_chart',
  'donut',
  'gauge',
  'progress_list',
  'channel_list',
  'metric_table',
  'field_table',
  'data_table',
  'heatmap',
  'creative_grid',
  'bullet_list',
  'recommendation_list',
]);

function renderWidgets(widgets, metadata, setChannel, range, setRange) {
  const supported = widgets.filter((widget) => SUPPORTED_WIDGET_TYPES.has(widget.type));
  const output = [];
  for (let index = 0; index < supported.length; index += 1) {
    const widget = supported[index];
    if (widget.type === 'text_hero') {
      const maybeKpi = supported[index + 1]?.type === 'kpi' ? supported[index + 1] : null;
      output.push(<HeroWidget key={widget.code || 'report-hero'} summary={widget} kpi={maybeKpi} metadata={metadata} />);
      if (maybeKpi) index += 1;
      continue;
    }
    if (!widget.group) {
      output.push(<WidgetFrame key={widget.code || index} widget={widget}><WidgetBody widget={widget} metadata={metadata} setChannel={setChannel} range={range} setRange={setRange} /></WidgetFrame>);
      continue;
    }
    const group = [widget];
    while (supported[index + 1]?.group === widget.group) {
      group.push(supported[index + 1]);
      index += 1;
    }
    output.push(<WidgetFrame key={widget.group} widget={{ ...widget, span: 2 }}>
      <div className={styles.groupedWidgets}>{group.map((item, groupIndex) => <section key={item.code || groupIndex}>{groupIndex > 0 ? <h3>{item.title}</h3> : null}<WidgetBody widget={item} metadata={metadata} setChannel={setChannel} range={range} setRange={setRange} /></section>)}</div>
    </WidgetFrame>);
  }
  return output;
}

export default function PublicReportPortal({ token }) {
  const [metadata, setMetadata] = useState(null);
  const [metadataStatus, setMetadataStatus] = useState('loading');
  const [metadataError, setMetadataError] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [range, setRange] = useState({ from: '', to: '', preset: 'custom' });
  const [tabData, setTabData] = useState(null);
  const [tabStatus, setTabStatus] = useState('idle');
  const [tabError, setTabError] = useState(null);

  const loadMetadata = useCallback(async (nextAccessToken = accessToken) => {
    setMetadataStatus('loading');
    setMetadataError(null);
    try {
      const next = unwrap(await publicReportApi.getReport(token, nextAccessToken));
      setMetadata(next);
      setMetadataStatus(next.requires_password ? 'password' : 'ready');
      if (!next.requires_password) {
        const initial = firstTab(next.sections || []);
        setActiveSection((current) => current || initial.section);
        setActiveTab((current) => current || initial.tab);
        setRange((current) => current.from && current.to ? current : defaultRange(next));
      }
    } catch (error) {
      if (error instanceof ApiRequestError && ['PASSWORD_REQUIRED', 'TOKEN_INVALID'].includes(error.code)) {
        storeToken(token, '');
        setAccessToken('');
        setMetadataStatus('password');
        return;
      }
      setMetadataError(error);
      setMetadataStatus('error');
    }
  }, [accessToken, token]);

  useEffect(() => {
    const stored = readStoredToken(token);
    setAccessToken(stored);
    loadMetadata(stored);
  }, [loadMetadata, token]);

  useEffect(() => {
    if (metadataStatus !== 'ready' || !activeTab || !range.from || !range.to) return;
    let alive = true;
    setTabStatus('loading');
    setTabError(null);
    publicReportApi.getTab(token, activeTab, { from: range.from, to: range.to, accessToken }).then((response) => {
      if (!alive) return;
      setTabData(unwrap(response));
      setTabStatus('ready');
    }).catch((error) => {
      if (!alive) return;
      if (error instanceof ApiRequestError && ['PASSWORD_REQUIRED', 'TOKEN_INVALID'].includes(error.code)) {
        storeToken(token, '');
        setAccessToken('');
        setMetadataStatus('password');
        return;
      }
      setTabError(error);
      setTabStatus('error');
    });
    return () => { alive = false; };
  }, [accessToken, activeTab, metadataStatus, range.from, range.to, token]);

  const accent = metadata?.theme?.accent || '#5b5bd6';
  const content = useMemo(() => {
    if (tabStatus === 'loading') return <div className={styles.loadingRow}><InlineLoader label="Loading tab data" /></div>;
    if (tabStatus === 'error') return <ApiErrorState compact title="We couldn't load this tab" message={errorMessage(tabError)} onRetry={() => setRange((current) => ({ ...current }))} />;
    const widgets = tabData?.widgets || [];
    if (!widgets.length) return <div className={styles.emptyTab}>No widgets are enabled for this tab.</div>;
    return renderWidgets(widgets, metadata, undefined, range, setRange);
  }, [metadata, range, tabData, tabError, tabStatus]);

  async function handleUnlock(password) {
    setUnlocking(true);
    setUnlockError('');
    try {
      const result = unwrap(await publicReportApi.unlockReport(token, password));
      const nextToken = result.access_token || '';
      setAccessToken(nextToken);
      storeToken(token, nextToken);
      await loadMetadata(nextToken);
    } catch (error) {
      setUnlockError(error instanceof ApiRequestError && error.code === 'INVALID_PASSWORD' ? 'The password is incorrect.' : errorMessage(error));
    } finally {
      setUnlocking(false);
    }
  }

  function selectTab(section, tab) {
    setActiveSection(section || '');
    setActiveTab(tab || '');
    setTabData(null);
  }

  if (metadataStatus === 'loading') return <FullPageLoader title="Opening report" message="We are loading the public report link." />;
  if (metadataStatus === 'password') return <PasswordScreen metadata={metadata} busy={unlocking} error={unlockError} onUnlock={handleUnlock} />;
  if (metadataStatus === 'error') return <ApiErrorState title="We couldn't open this report" message={errorMessage(metadataError)} onRetry={() => loadMetadata(accessToken)} />;

  return (
    <main className={styles.portal} style={{ '--accent': accent }}>
      <Header metadata={metadata} activeSection={activeSection} activeTab={activeTab} onSelectTab={selectTab} range={range} setRange={setRange} />
      <section className={styles.content}>
        <Filters metadata={metadata} range={range} setRange={setRange} activeSection={activeSection} />
        <div className={styles.widgets}>{content}</div>
      </section>
    </main>
  );
}













