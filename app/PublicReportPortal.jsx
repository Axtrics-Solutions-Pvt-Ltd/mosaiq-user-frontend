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
  const safeValue = displayText(value);
  if (format === 'text') return String(safeValue);
  const number = Number(safeValue);
  if (!Number.isFinite(number)) return String(safeValue);
  if (format === 'currency') {
    const compact = new Intl.NumberFormat('en-CA', { notation: 'compact', maximumFractionDigits: 1 }).format(number);
    const symbol = currency === 'CAD' || currency === 'USD' ? '$' : `${currency} `;
    return `${symbol}${compact}`;
  }
  if (format === 'percent') return `${new Intl.NumberFormat('en-CA', { maximumFractionDigits: 2 }).format(number)}%`;
  if (format === 'multiplier') return `${new Intl.NumberFormat('en-CA', { maximumFractionDigits: 2 }).format(number)}x`;
  return new Intl.NumberFormat('en-CA', { notation: Math.abs(number) >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(number);
}

function formatCompactPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '-';
  if (Math.abs(number) < 10000) return formatValue(number, 'percent');
  return `${new Intl.NumberFormat('en-CA', { notation: 'compact', maximumFractionDigits: 2 }).format(number)}%`;
}

function displayText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return value.label ?? value.value ?? value.name ?? value.title ?? value.key ?? '';
  return value;
}


function itemTooltip(item, currency = 'CAD', fallbackFormat = 'number') {
  const parts = [];
  const label = displayText(item?.label || item?.title || item?.key);
  if (label) parts.push(label);
  const value = item?.value ?? item?.share ?? item?.percent;
  if (value !== null && value !== undefined && value !== '') {
    parts.push(`Value ${formatValue(value, item?.format || fallbackFormat, currency)}`);
  }
  if (item?.share !== null && item?.share !== undefined && item?.share !== value) {
    parts.push(`Share ${formatValue(item.share, 'percent', currency)}`);
  }
  if (item?.secondary) {
    parts.push(`${item.secondary.label || 'Secondary'} ${formatValue(item.secondary.value, item.secondary.format, currency)}`);
  }
  return parts.join('\n');
}

function axisTicks(values = [], format = 'number') {
  const numeric = values.map((value) => Number(value)).filter(Number.isFinite);
  if (!numeric.length) return [];
  const min = Math.min(0, ...numeric);
  const max = Math.max(...numeric, 1);
  return [1, 0.75, 0.5, 0.25, 0].map((ratio) => ({
    ratio,
    value: min + (max - min) * ratio,
    format,
  }));
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

function selectionFromUrl(sections = []) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const sectionCode = params.get('section') || '';
  const tabCode = params.get('tab') || '';
  if (!sectionCode || !tabCode) return null;
  const section = sections.find((item) => item.code === sectionCode);
  const tab = section?.tabs?.find((item) => item.code === tabCode);
  return section && tab ? { section: section.code, tab: tab.code } : null;
}

function syncSelectionToUrl(section, tab) {
  if (typeof window === 'undefined' || !section || !tab) return;
  const url = new URL(window.location.href);
  url.searchParams.set('section', section);
  url.searchParams.set('tab', tab);
  window.history.replaceState(null, '', url.toString());
}

function defaultRange(metadata) {
  const range = metadata?.date_range?.default || {};
  const available = metadata?.date_range?.available || {};
  return {
    from: clampDate(range.from || available.from || '', available.from, available.to),
    to: clampDate(range.to || available.to || '', available.from, available.to),
    preset: range.preset || 'custom',
  };
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
  const base = presets.includes('this_quarter') ? [...presets] : [...presets, 'this_quarter'];
  const values = [...new Set(base.filter((value) => value && value !== 'custom')), 'custom'];
  return values.map((value) => ({ value, label: presetLabel(value) }));
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

function syncAudienceProfileWidgets(tabData, audienceTabData) {
  if (!tabData?.widgets?.length || !audienceTabData?.widgets?.length) return tabData;
  const audienceWidgets = new Map((audienceTabData.widgets || []).map((widget) => [widget.code, widget]));
  const replacements = {
    audience_by_segment: 'cultural_segments',
    language_province_mix: 'audience_language_province_mix',
  };
  return {
    ...tabData,
    widgets: tabData.widgets.map((widget) => {
      const sourceCode = replacements[widget.code];
      const source = sourceCode ? audienceWidgets.get(sourceCode) : null;
      return source ? { ...source, span: widget.span ?? source.span } : widget;
    }),
  };
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
    case 'globe':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c3 3.2 3 14.8 0 18" /><path d="M12 3c-3 3.2-3 14.8 0 18" /></svg>;
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

function isChannelRoas(widget) {
  return widget?.type === 'channel_list' && (widget?.code === 'channel_roas' || `${widget?.title || ''}`.toLowerCase().includes('channel roas'));
}

function isBudgetUtilization(widget) {
  return widget?.type === 'gauge' && (widget?.code === 'budget_utilization' || `${widget?.title || ''}`.toLowerCase().includes('budget utilization'));
}

function isChannelInsight(widget) {
  return widget?.code === 'channel_insights';
}

function isChannelRecommendation(widget) {
  return widget?.code === 'channel_recommendations';
}

function iconForTab(tab) {
  return tab.icon || TAB_ICON_MAP[tab.code] || 'summary';
}

function Header({ metadata, activeSection, activeTab, onSelectTab, range, setRange }) {
  const sections = metadata?.sections || [];
  const active = sections.find((section) => section.code === activeSection);
  const dateOptions = dateRangeOptions(metadata);
  const showTabNav = active?.tabs?.length && active.code !== 'mmm';
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
          {sections.map((section) => {
            const sectionAccent = section.accent || {};
            const sectionStyle = section.accent ? {
              '--section-base': sectionAccent.base,
              '--section-strong': sectionAccent.strong,
              '--section-soft': sectionAccent.soft,
            } : undefined;
            return (
              <button key={section.code} type="button" style={sectionStyle} className={section.code === activeSection ? styles.active : ''} onClick={() => onSelectTab(section.code, section.tabs?.[0]?.code)}>
                <span className={styles.tabIcon}><TabIcon name={TAB_ICON_MAP[section.code] || 'reporting'} /></span>
                {section.name}
              </button>
            );
          })}
        </nav>
        <div className={styles.headerActions}>
          {dateOptions.length ? <div className={styles.headerDateControl}>
            <select className={styles.headerSelect} value={range.preset} onChange={(event) => {
              const nextPreset = event.target.value;
              if (nextPreset === 'custom') {
                setRange((current) => ({ ...current, preset: 'custom' }));
                return;
              }
              applyRangePreset(metadata, setRange, nextPreset);
            }} aria-label="Select date range">
              {dateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {range.preset === 'custom' ? <div className={styles.customDatePanel}>
              <label><em>From</em><input type="date" value={range.from} min={metadata?.date_range?.available?.from || undefined} max={range.to || metadata?.date_range?.available?.to || undefined} onChange={(event) => setRange((current) => ({ ...current, from: event.target.value, preset: 'custom' }))} /></label>
              <label><em>To</em><input type="date" value={range.to} min={range.from || metadata?.date_range?.available?.from || undefined} max={metadata?.date_range?.available?.to || undefined} onChange={(event) => setRange((current) => ({ ...current, to: event.target.value, preset: 'custom' }))} /></label>
            </div> : null}
          </div> : null}
        </div>
      </div>
      {showTabNav ? <nav className={styles.tabs} style={active.accent ? { '--section-strong': active.accent.strong, '--section-soft': active.accent.soft } : undefined} aria-label={`${active.name} tabs`}>
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

function Filters() {
  return null;
}

function WidgetFrame({ widget, children }) {
  const span = widget.span === 2 || widget.type === 'recommendation_list' || widget.type === 'creative_grid' || isDetailedKpiGroup(widget) || isActiveCampaigns(widget) ? styles.span2 : styles.span1;
  const bodyOwnsHeader = widget.type === 'line_chart' || widget.type === 'creative_grid' || widget.type === 'progress_list' || isRoasDonut(widget) || isDetailedKpiGroup(widget) || isDetailedMetricTable(widget) || isActiveCampaigns(widget) || isChannelRoas(widget) || isBudgetUtilization(widget);
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
    {points.map((point, index) => Number.isFinite(Number(point.y)) ? <circle key={point.x || index} cx={xFor(index)} cy={yFor(point.y)} r="2.4" className={`${styles.kpiSparkDot} ${styles[`kpiTone_${tone}`]}`}><title>{`${point.x || `Point ${index + 1}`}: ${point.y}`}</title></circle> : null)}
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
    return <div className={styles.barRow} key={item.key || item.label} data-tooltip={itemTooltip(item, currency, item.format || 'number')}>
      <div><span>{item.label}</span><strong>{formatValue(item.value, item.format, currency)}</strong></div>
      <div className={styles.barTrack}><i style={{ width: `${width}%`, background: item.color || undefined }} /></div>
      {item.secondary ? <small>{item.secondary.label}: {formatValue(item.secondary.value, item.secondary.format, currency)}</small> : null}
    </div>;
  })}</div>;
}

const PROGRESS_COLORS = ['#ff5b6b', '#2fc3c3', '#f7bd31', '#7c4ff4', '#4f83f1', '#ff8a3d'];
const BADGE_OVERRIDES = { hinglish: 'HN', punjabi: 'PN', mandarin: 'MA', cantonese: 'CN', tagalog: 'TL' };

function isProvinceGroup(key = '') {
  return String(key || '').toLowerCase().includes('province');
}

function progressBadge(label = '') {
  const clean = String(label).trim();
  const key = clean.toLowerCase();
  if (BADGE_OVERRIDES[key]) return BADGE_OVERRIDES[key];
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length > 1) return parts.map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

function normalizeAudienceProgressWidget(widget) {
  if (!['audience_by_segment', 'language_province_mix'].includes(widget.code)) return widget;
  const footer = [...(widget.footer || [])];
  if (widget.code === 'audience_by_segment') {
    const hasShare = footer.some((item) => String(item.label || '').toLowerCase().includes('share'));
    const shareTotal = (widget.items || []).reduce((sum, item) => sum + (Number(item.share ?? item.value) || 0), 0);
    if (!hasShare && shareTotal > 0) {
      footer.push({ label: 'Total share', value: Math.min(100, Math.round(shareTotal)), format: 'percent' });
    }
  }
  if (widget.code === 'language_province_mix' && footer.length === 2) {
    const total = footer.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    footer.push({ label: 'Languages & regions', value: total, format: 'number' });
  }
  return { ...widget, footer };
}

function ProgressFooter({ footer = [], currency }) {
  if (!footer.length) return null;
  return <div className={styles.progressFooter}>{footer.map((item, index) => {
    const change = item.change;
    const labelText = String(item.label || '');
    const sentiment = change?.sentiment || change?.direction;
    const inferredComparison = !change && index === footer.length - 1 && item.format === 'percent' && (labelText.toLowerCase().includes('prev') || labelText.toLowerCase().startsWith('vs '));
    const isNegative = sentiment === 'negative' || sentiment === 'down' || (inferredComparison && Number(item.value) < 0);
    const isChangeOnly = inferredComparison || (Boolean(change) && (item.value === null || item.value === undefined || item.value === change.value || labelText.toLowerCase().includes('prev') || labelText.toLowerCase().startsWith('vs ')));
    const changeValue = change ? change.value : item.value;
    const changeFormat = change ? change.format : item.format;
    const changeLabel = change?.label || item.label;
    const changePrefix = isNegative ? '− ' : '+ ';
    return <div className={isChangeOnly ? styles.progressFooterChange : ''} key={`${item.label}-${index}`}>
      {index === 0 ? <span className={styles.progressFooterIcon}><TabIcon name="audience" /></span> : null}
      <strong className={isChangeOnly ? (isNegative ? styles.negative : styles.positive) : ''}>{isChangeOnly ? `${changePrefix}${formatValue(Math.abs(Number(changeValue)), changeFormat, currency)}` : formatValue(item.value, item.format, currency)}</strong>
      <small>{isChangeOnly ? changeLabel : item.label}</small>
      {change && !isChangeOnly ? <em className={isNegative ? styles.negative : styles.positive}>{change.value !== null && change.value !== undefined ? `${changePrefix}${formatValue(Math.abs(Number(change.value)), change.format, currency)}` : changePrefix.trim()}{change.label ? <b>{change.label}</b> : null}</em> : null}
    </div>;
  })}</div>;
}

function AgeDistributionWidget({ widget, currency }) {
  const items = widget.items || [];
  return <div className={styles.ageDistributionWidget}>
    <div className={styles.ageDistributionHeader}>
      <h2>{widget.title}</h2>
      {widget.subtitle ? <span>{widget.subtitle}</span> : null}
    </div>
    <p>Population by age</p>
    <div className={styles.ageDistributionRows}>{items.map((item, index) => {
      const color = item.color || PROGRESS_COLORS[index % PROGRESS_COLORS.length];
      const width = Math.max(0, Math.min(100, Number(item.share ?? item.value) || 0));
      return <div className={styles.ageDistributionRow} key={item.key || item.label} data-tooltip={itemTooltip(item, currency, item.format || 'percent')} style={{ '--age-color': color }}>
        <span>{item.label}</span>
        <i><em style={{ width: `${width}%` }} /></i>
        <strong>{formatValue(item.value, item.format, currency)}</strong>
      </div>;
    })}</div>
  </div>;
}

function ProgressListWidget({ widget, currency }) {
  const groups = widget.groups || [];
  const [activeGroup, setActiveGroup] = useState(groups[0]?.key || '');
  const effectiveGroup = groups.find((group) => group.key === activeGroup)?.key || groups[0]?.key || '';
  const items = (widget.items || []).filter((item) => !groups.length || item.group === effectiveGroup);
  return <div className={styles.progressListWidget}>
    <div className={styles.progressHeader}>
      <div><h2>{widget.title}</h2>{widget.subtitle ? <p>{widget.subtitle}</p> : null}</div>
      {widget.as_of ? <span>As of {widget.as_of}</span> : null}
    </div>
    {groups.length ? <div className={styles.progressGroupToggle}>{groups.map((group) => <button key={group.key} type="button" className={group.key === effectiveGroup ? styles.active : ''} onClick={() => setActiveGroup(group.key)}><span className={styles.tabIcon}><TabIcon name={isProvinceGroup(group.key) ? 'audience' : 'globe'} /></span>{group.label}</button>)}</div> : null}
    {widget.empty ? <p className={styles.empty}>No data for this period.</p> : <div className={`${styles.progressRows} ${isProvinceGroup(effectiveGroup) ? styles.provinceRows : ''}`}>{items.map((item, index) => {
      const color = item.color || PROGRESS_COLORS[index % PROGRESS_COLORS.length];
      const width = Math.max(0, Math.min(100, Number(item.share) || 0));
      return <div className={`${styles.progressRow} ${groups.length ? styles.progressGroupedRow : ''} ${isProvinceGroup(effectiveGroup) ? styles.provinceRow : ''}`} key={`${item.group || 'row'}-${item.label}-${index}`} data-tooltip={itemTooltip(item, currency, item.format || 'number')} style={{ '--progress-color': color }}>
        <span className={styles.progressBadge}>{groups.length ? progressBadge(item.label) : <TabIcon name="audience" />}</span>
        <div className={styles.progressInfo}><strong>{item.label}</strong><i><em style={{ width: `${width}%` }} /></i></div>
        <div className={styles.progressValue}><strong>{formatValue(item.value, item.format, currency)}</strong>{groups.length ? null : <small>{item.format === 'percent' ? 'Share of reach' : item.label}</small>}</div>
        {item.secondary ? <div className={styles.progressSecondary}><strong>{formatValue(item.secondary.value, item.secondary.format, currency)}</strong><small>{item.secondary.label}</small></div> : null}
      </div>;
    })}</div>}
    <ProgressFooter footer={widget.footer || []} currency={currency} />
  </div>;
}

function dataColumnKey(column) {
  if (column?.key) return column.key;
  const label = displayText(column?.label || column).toLowerCase();
  const mapped = {
    dimension: 'field',
    field: 'field',
    driver: 'field',
    category: 'field',
    indicator: 'field',
    attitude: 'field',
    channel: 'field',
    platform: 'field',
    content: 'field',
    topic: 'field',
    moment: 'field',
    brand: 'field',
    metric: 'metric',
    source: 'field',
    recommendation: 'recommendation',
    'insight type': 'field',
    pattern: 'value',
    value: 'value',
    'position & momentum': 'value',
    importance: 'value',
    spending: 'value',
    direction: 'value',
    mix: 'value',
    usage: 'value',
    engagement: 'value',
    status: 'value',
    'best fit': 'best_fit',
    'data type': 'value',
    'draft output': 'value',
    notes: 'note',
    note: 'note',
    details: 'details',
    'why it matters': 'note',
    'what it means': 'note',
    'planning implication': 'note',
    'planning note': 'note',
    'activation note': 'note',
    'use in creative': 'note',
    'planning cue': 'note',
    'how the 2027 plan answers': 'note',
    reason: 'reason',
    role: 'note',
    'use case': 'note',
  };
  return mapped[label] || label.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function plainCellValue(cell) {
  return cell && typeof cell === 'object' && !Array.isArray(cell) ? (cell.value ?? cell.label ?? '') : cell;
}

function GeoDataTable({ widget, currency }) {
  const columns = widget.columns || [];
  return <div className={styles.geoTableWrap}>
    <table>
      <thead><tr>{columns.map((column, index) => <th key={column.key || index}>{displayText(column.label || column)}</th>)}</tr></thead>
      <tbody>{(widget.rows || []).map((row, rowIndex) => <tr key={row.key || row.id || rowIndex}>{columns.map((column, columnIndex) => {
        const key = dataColumnKey(column);
        const cell = row[key];
        const value = plainCellValue(cell);
        const format = cell && typeof cell === 'object' ? (cell.format || column.format) : column.format;
        return <td key={key || columnIndex}>{formatValue(displayText(value), format, currency)}</td>;
      })}</tr>)}</tbody>
    </table>
  </div>;
}

function GeoConcentrationChart({ widget }) {
  const [hoverPoint, setHoverPoint] = useState(null);
  const items = widget.items || [];
  const points = items.map((item, index) => ({
    label: String(item.label || '').replace(' CMA', ''),
    value: Number(item.value) || 0,
    format: item.format || 'number',
    x: 40 + index * (420 / Math.max(items.length - 1, 1)),
    y: 32 + (1 - ((Number(item.value) || 0) / Math.max(1, ...items.map((entry) => Number(entry.value) || 0)))) * 190,
    color: item.color || PROGRESS_COLORS[index % PROGRESS_COLORS.length],
  }));
  const tickFormat = items.find((item) => item.format)?.format || points[0]?.format || 'number';
  const ticks = axisTicks(points.map((point) => point.value), tickFormat);
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  return <div className={styles.geoConcentrationChart}>
    <h3>{widget.title}</h3>
    <div className={styles.geoChartStage}>
      <div className={styles.customYAxis}>{ticks.map((tick) => <span key={tick.ratio} style={{ top: `${20 + (1 - tick.ratio) * 212}px` }}>{formatValue(tick.value, tick.format)}</span>)}</div>
      <span>Key markets</span>
      <span>Concentration</span>
      <svg viewBox="0 0 520 270" aria-hidden="true">
        <path className={styles.geoAxis} d="M40 20 V232 H500" />
        <path className={styles.geoLine} d={path} />
        {points.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r="6.5" fill={point.color} stroke="#fff" strokeWidth="3" onMouseEnter={() => setHoverPoint(point)} onMouseLeave={() => setHoverPoint(null)} />)}
      </svg>
      {hoverPoint ? <div className={styles.chartTooltip} style={{ left: `${(hoverPoint.x / 520) * 100}%`, top: `${(hoverPoint.y / 270) * 100}%` }}><strong>{hoverPoint.label}</strong><b>{formatValue(hoverPoint.value, hoverPoint.format)}</b></div> : null}
      <div className={styles.geoChartLabels}>{points.map((point) => <strong key={point.label}>{point.label}</strong>)}</div>
    </div>
  </div>;
}

function GeoDensityGrid({ widget }) {
  return <div className={styles.geoDensityGrid}>
    <p>Population and reach</p>
    <div className={styles.geoDensityHeader}><span />{(widget.columns || []).map((column) => <span key={column}>{column}</span>)}</div>
    {(widget.rows || []).map((row) => <div className={styles.geoDensityRow} key={row.label}>
      <strong>{row.label}</strong>
      {(row.values || []).map((value, index) => <span key={`${row.label}-${index}`} data-tooltip={`${row.label}\n${widget.columns?.[index] || `Value ${index + 1}`} ${value}`}>{value}</span>)}
    </div>)}
  </div>;
}

function GeoCard({ widget, children }) {
  return <article className={styles.geoCard}>
    <div className={styles.geoCardHeader}><h2>{widget.title}</h2>{widget.subtitle ? <span>{widget.subtitle}</span> : null}</div>
    {children}
  </article>;
}

function MmmHero() {
  const refreshModel = () => {
    if (typeof window === 'undefined') return;
    syncSelectionToUrl('mmm', 'mmm');
    window.location.reload();
  };
  return <article className={styles.mmmHero}>
    <div><span>Media Mix Model</span><h1>Turn media history into the next best plan</h1><p>One view of what created demand, where spend is nearing its limit, and how the next budget could perform.</p></div>
    <div><em>● Model ready</em><button type="button" onClick={refreshModel}>↻ Refresh model</button></div>
  </article>;
}

function MmmContextBar() {
  return <article className={styles.mmmContextBar}>
    <div><strong>Vibrant Reach Media</strong><span>Connected data · 26 weeks · 5 channels</span></div>
    <div><label>Outcome<select><option>Revenue</option></select></label><label>View<select><option>Weekly</option></select></label><label>Market<select><option>National</option></select></label></div>
  </article>;
}

function MmmSteps() {
  const steps = [['01', 'Build the model', 'Choose what to measure'], ['02', 'Read the result', 'Separate demand from media'], ['03', 'Plan the next dollar', 'Optimize or test a scenario']];
  return <div className={styles.mmmSteps}>{steps.map((step) => <div key={step[0]}><b>{step[0]}</b><strong>{step[1]}</strong><span>{step[2]}</span></div>)}</div>;
}

function MmmModelInput({ widget }) {
  return <MediaCard widget={widget}>
    <div className={styles.mmmInputIntro}><h3>The model starts with the data you already have</h3><p>We match campaign activity to a business outcome and clean the common issues before modelling begins.</p></div>
    <div className={styles.mmmInputList}>{(widget.items || []).map((item, index) => <div key={item}><strong>{['Media activity', 'Business result', 'Context signals', 'Model note'][index] || `Input ${index + 1}`}</strong><span>{item}</span></div>)}</div>
    <div className={styles.mmmTags}><span>Excel</span><span>CSV</span><span>Manual entry</span><em>API connection planned for Phase 2</em></div>
  </MediaCard>;
}

function MmmReadiness({ widget, currency }) {
  const overall = widget.footer?.[0];
  return <MediaCard widget={widget}>
    {overall ? <div className={styles.mmmReadinessScore}><strong>{formatValue(overall.value, overall.format, currency)}</strong><span>Ready to model</span><small>High-quality history for this view</small></div> : null}
    <BehaviourProgress widget={widget} currency={currency} />
    <p className={styles.mmmHelpText}>Checks include missing dates, duplicate rows, inconsistent names or dates, negative spend, spikes, zeros, and gaps in the time series.</p>
  </MediaCard>;
}

function MmmKpiStrip({ widget, currency }) {
  return <div className={styles.mmmKpiStrip}>{(widget.items || []).map((item) => <div key={item.label}><span>{item.label}</span><strong>{formatValue(item.value, item.format, currency)}</strong>{item.change ? <small className={styles.positive}>↑ {formatValue(item.change.value, item.change.format, currency)} {item.change.label}</small> : null}</div>)}</div>;
}

function MmmOutcomeStory({ summary, composition, currency }) {
  return <article className={`${styles.mediaCard} ${styles.mmmOutcomeStory}`}>
    <div className={styles.mmmOutcomeHeader}><div><span>The outcome story</span><h2>Marketing created {summary?.items?.[1]?.value || 'meaningful'} of the result</h2><p>The model separates natural demand from the lift created by media.</p></div>{summary ? <MmmKpiStrip widget={summary} currency={currency} /> : null}</div>
    {composition ? <div className={styles.mmmComposition}><MediaBrandDonut widget={composition} currency={currency} hideLegend /><div className={styles.mmmCompositionTable}>{(composition.items || []).map((item, index) => <div key={item.key || item.label} data-tooltip={itemTooltip(item, currency, item.format || 'number')}><i style={{ background: item.color || DONUT_COLORS[index % DONUT_COLORS.length] }} /><span>{item.label}</span><strong>{formatValue(item.value, item.format, currency)}</strong></div>)}</div></div> : null}
  </article>;
}

function MmmWhy({ carryover, diminishing, fit, currency }) {
  return <MediaCard widget={{ title: 'Why this is MMM', subtitle: 'Model evidence' }}>
    {diminishing ? <div className={styles.mmmWhyText}><h3>{diminishing.headline}</h3><p>{diminishing.body}</p></div> : null}
    {carryover ? <BehaviourProgress widget={carryover} currency={currency} /> : null}
    {fit ? <div className={styles.mmmFitGrid}>{(fit.items || []).map((item) => <div key={item.label}><span>{item.label}</span><strong>{formatValue(item.value, item.format, currency)}</strong></div>)}</div> : null}
  </MediaCard>;
}

function MmmReadout({ widget }) {
  return <MediaCard widget={{ ...widget, title: 'AI Readout' }}>
    <div className={styles.mmmReadout}>{(widget.items || []).map((item, index) => <div key={item.title}><b>{index + 1}</b><p><strong>{item.title}</strong> {item.body}</p><a>{item.owner}</a></div>)}</div>
  </MediaCard>;
}

function MmmLayout({ widgets, metadata }) {
  const currency = metadata?.currency || 'CAD';
  const byCode = new Map(widgets.map((widget) => [widget.code, widget]));
  const input = byCode.get('mmm_model_input');
  const readiness = byCode.get('mmm_data_readiness');
  const summary = byCode.get('mmm_outcome_summary');
  const composition = byCode.get('mmm_outcome_composition');
  const diagnosis = byCode.get('mmm_channel_diagnosis');
  const carryover = byCode.get('mmm_carryover');
  const diminishing = byCode.get('mmm_diminishing_returns');
  const fit = byCode.get('mmm_model_fit');
  const optimizer = byCode.get('mmm_optimizer_mix');
  const readout = byCode.get('mmm_readout');
  return <div className={styles.mmmLayout}>
    <MmmHero />
    <MmmContextBar />
    <MmmSteps />
    <div className={styles.mmmTwoCol}>{input ? <MmmModelInput widget={input} /> : null}{readiness ? <MmmReadiness widget={readiness} currency={currency} /> : null}</div>
    <MmmOutcomeStory summary={summary} composition={composition} currency={currency} />
    <div className={styles.mmmTwoCol}>{diagnosis ? <MediaCard widget={diagnosis}><BehaviourTable widget={diagnosis} currency={currency} /></MediaCard> : null}<MmmWhy carryover={carryover} diminishing={diminishing} fit={fit} currency={currency} /></div>
    <article className={styles.mmmPlan}><div><span>Plan the next dollar</span><h2>Use the model to move budget before performance moves</h2><p>Recommendations balance historical performance, marginal ROAS, saturation, carryover, and the constraints you set.</p></div><strong>Expected upside vs current plan<br /><em>+6% conversions</em></strong></article>
    <div className={styles.mmmTwoCol}>{optimizer ? <MediaCard widget={{ ...optimizer, title: 'Optimizer' }}><BehaviourTable widget={optimizer} currency={currency} /></MediaCard> : null}{readout ? <MmmReadout widget={readout} /> : null}</div>
  </div>;
}

function AudienceOverviewCard({ widget, currency }) {
  return <MediaCard widget={{ ...widget, subtitle: widget.subtitle || 'Snapshot' }}>
    <div className={styles.audienceOverviewRows}>{(widget.items || []).map((item) => <div key={item.label}>
      <span>{item.label}</span>
      <strong>{formatValue(item.value, item.format, currency)}</strong>
    </div>)}</div>
  </MediaCard>;
}

function AudienceProfileDonut({ widget, currency }) {
  const items = widget.items || [];
  const [hoverItem, setHoverItem] = useState(null);
  const total = items.reduce((sum, item) => sum + (Number(item.share ?? item.value) || 0), 0) || 100;
  let angle = 0;
  const centerValue = widget.center ? formatValue(widget.center.value, widget.center.format, currency) : '100%';
  const centerLabel = widget.center?.label || 'Split';
  return <div className={styles.mediaDonutBlock}>
    <div className={styles.mediaDonutChart}>
      <svg viewBox="0 0 220 220" aria-hidden="true">
        {items.map((item, index) => {
          const value = Number(item.share ?? item.value) || 0;
          const start = angle;
          const end = angle + (value / total) * 360;
          angle = end;
          return <path key={item.key || item.label} d={donutSegmentPath(110, 110, 78, start, end)} stroke={item.color || DONUT_COLORS[index % DONUT_COLORS.length]} strokeWidth="34" fill="none" onMouseEnter={() => setHoverItem(item)} onMouseLeave={() => setHoverItem(null)} />;
        })}
      </svg>
      <div><strong>{centerValue}</strong><span>{centerLabel}</span></div>
      {hoverItem ? <div className={styles.chartTooltip} style={{ left: '50%', top: '30%' }}><strong>{displayText(hoverItem.label)}</strong><b>{formatValue(hoverItem.value ?? hoverItem.share, hoverItem.format || 'percent', currency)}</b></div> : null}
    </div>
    <div className={styles.mediaDonutLegend}>{items.map((item, index) => <div key={item.key || item.label}>
        <i style={{ background: item.color || DONUT_COLORS[index % DONUT_COLORS.length] }} />
      <span>{item.label}</span>
      <strong>{formatValue(item.value, item.format || 'percent', currency)}</strong>
    </div>)}</div>
  </div>;
}

function AudienceProfileContent({ widget, currency }) {
  if (widget.type === 'progress_list') return <ProgressListWidget widget={widget} currency={currency} />;
  if (widget.type === 'donut') return <AudienceProfileDonut widget={widget} currency={currency} />;
  if (widget.type === 'heatmap') return <BehaviourHeatmap widget={widget} />;
  return <BehaviourTable widget={widget} currency={currency} />;
}

function AudienceProfileLayout({ widgets, metadata }) {
  const currency = metadata?.currency || 'CAD';
  const byCode = new Map(widgets.map((widget) => [widget.code, widget]));
  const left = [
    byCode.get('audience_overview'),
    byCode.get('language_province_mix'),
    byCode.get('language_reach'),
    byCode.get('language_insights'),
  ].filter(Boolean);
  const right = [
    byCode.get('audience_by_segment'),
    byCode.get('cultural_identity'),
    byCode.get('religion_faith'),
    byCode.get('generation_split'),
    byCode.get('immigration_profile'),
    byCode.get('cultural_values_index'),
    byCode.get('family_values'),
  ].filter(Boolean);
  const renderWidget = (widget) => widget.code === 'audience_overview'
    ? <AudienceOverviewCard key={widget.code} widget={widget} currency={currency} />
    : <MediaCard key={widget.code} widget={widget}><AudienceProfileContent widget={widget} currency={currency} /></MediaCard>;
  return <div className={styles.audienceProfileLayout}>
    <div className={styles.mediaColumn}>{left.map(renderWidget)}</div>
    <div className={styles.mediaColumn}>{right.map(renderWidget)}</div>
  </div>;
}

function InsightGaugeCard({ gauge, scores, currency }) {
  const [hoverGauge, setHoverGauge] = useState(false);
  const value = Number(gauge?.value) || 0;
  const max = Number(gauge?.max) || 100;
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const items = scores?.items || [];
  const label = gauge?.label || gauge?.title || 'Opportunity score';
  const formattedValue = formatValue(value, gauge?.format || 'number', currency);
  return <MediaCard widget={gauge || scores}>
    <div className={styles.insightGaugeBlock}>
      <div className={styles.insightGauge} onMouseEnter={() => setHoverGauge(true)} onMouseLeave={() => setHoverGauge(false)} style={{ '--gauge-pct': `${pct}%` }}>
        <div className={styles.insightGaugeCenter}><strong>{formattedValue}%</strong><span>{gauge?.label || 'Opportunity score'}</span></div>
        {hoverGauge ? <div className={styles.chartTooltip} style={{ left: '50%', top: '18%' }}>
          <strong>{label}</strong>
          <b>{formattedValue}</b>
        </div> : null}
      </div>
    </div>
    <div className={styles.insightScoreList}>{items.map((item) => <div key={item.label} data-tooltip={itemTooltip(item, currency, item.format || 'number')}>
      <span>{item.label}</span><strong>{formatValue(item.value, item.format, currency)}</strong>
    </div>)}</div>
  </MediaCard>;
}

function InsightProgress({ widget, currency }) {
  return <BehaviourProgress widget={widget} currency={currency} />;
}

function InsightLayout({ widgets, metadata }) {
  const currency = metadata?.currency || 'CAD';
  const byCode = new Map(widgets.map((widget) => [widget.code, widget]));
  const gauge = byCode.get('opportunity_index');
  const scores = byCode.get('opportunity_scores');
  const left = [
    { type: 'gauge', gauge, scores },
    { first: byCode.get('opportunity_drivers') },
    { first: byCode.get('media_planning_recs') },
  ];
  const right = [
    { first: byCode.get('cross_audience_comparison'), second: byCode.get('audience_comparison_score') },
    { first: byCode.get('ai_strategic_insights') },
    { first: byCode.get('data_sources') },
  ];
  const renderEntry = (entry) => {
    if (entry.type === 'gauge') return (entry.gauge || entry.scores) ? <InsightGaugeCard key="opportunity-index" gauge={entry.gauge} scores={entry.scores} currency={currency} /> : null;
    const widget = entry.first;
    if (!widget) return null;
    if (entry.second) return <MediaCard key={widget.code} widget={widget}>
      <BehaviourTable widget={widget} currency={currency} />
      <div className={styles.mediaGroupedBlock}><h3>{entry.second.title}</h3><InsightProgress widget={entry.second} currency={currency} /></div>
    </MediaCard>;
    return <MediaCard key={widget.code} widget={widget}>{widget.type === 'progress_list' ? <InsightProgress widget={widget} currency={currency} /> : <BehaviourTable widget={widget} currency={currency} />}</MediaCard>;
  };
  return <div className={styles.insightLayout}>
    <div className={styles.mediaColumn}>{left.map(renderEntry)}</div>
    <div className={styles.mediaColumn}>{right.map(renderEntry)}</div>
  </div>;
}

function MediaBrandDonut({ widget, currency, hideLegend = false }) {
  const items = widget.items || [];
  const [hoverItem, setHoverItem] = useState(null);
  const total = items.reduce((sum, item) => sum + (Number(item.share ?? item.value) || 0), 0) || 100;
  let angle = 0;
  return <div className={`${styles.mediaDonutBlock} ${hideLegend ? styles.mediaDonutGraphOnly : ''}`}>
    <div className={styles.mediaDonutChart}>
      <svg viewBox="0 0 220 220" aria-hidden="true">
        {items.map((item, index) => {
          const value = Number(item.share ?? item.value) || 0;
          const start = angle;
          const end = angle + (value / total) * 360;
          angle = end;
          return <path key={item.key || item.label} d={donutSegmentPath(110, 110, 78, start, end)} stroke={item.color || DONUT_COLORS[index % DONUT_COLORS.length]} strokeWidth="34" fill="none" onMouseEnter={() => setHoverItem(item)} onMouseLeave={() => setHoverItem(null)} />;
        })}
      </svg>
      <div><strong>100%</strong><span>Reach mix</span></div>
      {hoverItem ? <div className={styles.chartTooltip} style={{ left: '50%', top: '30%' }}><strong>{displayText(hoverItem.label)}</strong><b>{formatValue(hoverItem.value ?? hoverItem.share, hoverItem.format || 'percent', currency)}</b></div> : null}
    </div>
    {hideLegend ? null : <div className={styles.mediaDonutLegend}>{items.map((item, index) => <div key={item.key || item.label}>
        <i style={{ background: item.color || DONUT_COLORS[index % DONUT_COLORS.length] }} />
      <span>{item.label}</span>
      <strong>{formatValue(item.value, item.format || 'percent', currency)}</strong>
    </div>)}</div>}
  </div>;
}

function MediaBrandHeatmap({ widget }) {
  const columns = widget.columns || [];
  return <div className={styles.mediaHeatmap}>
    <div className={styles.mediaHeatmapHeader} style={{ '--media-columns': columns.length + 1 }}><span>{displayText(widget.rows?.[0]?.label ? '' : 'Interest')}</span>{columns.map((column) => <span key={column}>{column}</span>)}</div>
    {(widget.rows || []).map((row) => <div className={styles.mediaHeatmapRow} key={row.label} style={{ '--media-columns': columns.length + 1 }}>
      <strong>{row.label}</strong>
      {(row.values || []).map((value, index) => <span key={`${row.label}-${index}`} data-tooltip={`${row.label}\n${columns[index] || `Value ${index + 1}`} ${value}`}>{value}</span>)}
    </div>)}
  </div>;
}

function MediaSeasonalityChart({ widget }) {
  const [hoverPoint, setHoverPoint] = useState(null);
  const items = widget.items || [];
  const values = items.map((item) => Number(item.value) || 0);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const points = items.map((item, index) => ({
    label: item.label,
    value: Number(item.value) || 0,
    format: item.format || 'number',
    x: 34 + index * (430 / Math.max(items.length - 1, 1)),
    y: 28 + (1 - (((Number(item.value) || 0) - min) / Math.max(max - min, 1))) * 174,
    color: item.color || PROGRESS_COLORS[index % PROGRESS_COLORS.length],
  }));
  const tickFormat = items.find((item) => item.format)?.format || points[0]?.format || 'number';
  const ticks = axisTicks(points.map((point) => point.value), tickFormat);
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  return <div className={styles.mediaSeasonalityChart}>
    <div className={styles.customYAxis}>{ticks.map((tick) => <span key={tick.ratio} style={{ top: `${20 + (1 - tick.ratio) * 184}px` }}>{formatValue(tick.value, tick.format)}</span>)}</div>
    <div><span>Seasonal weight</span><span>Campaign window</span></div>
    <svg viewBox="0 0 500 240" aria-hidden="true">
      <path className={styles.geoAxis} d="M34 20 V204 H476" />
      <path className={styles.geoLine} d={path} />
      {points.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r="6" fill={point.color} stroke="#fff" strokeWidth="3" onMouseEnter={() => setHoverPoint(point)} onMouseLeave={() => setHoverPoint(null)} />)}
    </svg>
    {hoverPoint ? <div className={styles.chartTooltip} style={{ left: `${(hoverPoint.x / 500) * 100}%`, top: `${(hoverPoint.y / 240) * 100}%` }}><strong>{hoverPoint.label}</strong><b>{formatValue(hoverPoint.value, hoverPoint.format)}</b></div> : null}
    <div className={styles.mediaSeasonalityLabels}>{points.map((point) => <strong key={point.label}>{point.label}</strong>)}</div>
  </div>;
}

function MediaCard({ widget, children }) {
  return <article className={styles.mediaCard}>
    <div className={styles.mediaCardHeader}><h2>{widget.title}</h2>{widget.subtitle ? <span>{widget.subtitle}</span> : null}</div>
    {children}
  </article>;
}

function MediaWidgetContent({ widget, currency }) {
  if (widget.code === 'media_consumption') return <MediaBrandDonut widget={widget} currency={currency} />;
  if (widget.type === 'progress_list' || widget.type === 'bar_chart') return <BehaviourProgress widget={widget} currency={currency} />;
  if (widget.type === 'heatmap') return <MediaBrandHeatmap widget={widget} />;
  return <BehaviourTable widget={widget} currency={currency} />;
}

function MediaGroupedCard({ first, second, currency }) {
  return <MediaCard widget={first}>
    <MediaWidgetContent widget={first} currency={currency} />
    {second ? <div className={styles.mediaGroupedBlock}>
      <h3>{second.title}</h3>
      <MediaWidgetContent widget={second} currency={currency} />
    </div> : null}
  </MediaCard>;
}

function MediaBrandLayout({ widgets, metadata }) {
  const currency = metadata?.currency || 'CAD';
  const byCode = new Map(widgets.map((widget) => [widget.code, widget]));
  const left = [
    { first: byCode.get('media_consumption'), second: byCode.get('social_penetration') },
    { first: byCode.get('media_mix_detail') },
    { first: byCode.get('social_media_profile') },
    { first: byCode.get('content_preferences') },
  ];
  const right = [
    { first: byCode.get('content_emphasis') },
    { first: byCode.get('brand_relationships') },
    { first: byCode.get('advertising_insights') },
    { first: byCode.get('cultural_calendar') },
    { first: byCode.get('seasonality_curve') },
  ];
  return <div className={styles.mediaLayout}>
    <div className={styles.mediaColumn}>{left.filter((entry) => entry.first).map((entry) => entry.second ? <MediaGroupedCard key={entry.first.code} first={entry.first} second={entry.second} currency={currency} /> : <MediaCard key={entry.first.code} widget={entry.first}><MediaWidgetContent widget={entry.first} currency={currency} /></MediaCard>)}</div>
    <div className={styles.mediaColumn}>{right.filter((entry) => entry.first).map((entry) => entry.first.code === 'seasonality_curve' ? <MediaCard key={entry.first.code} widget={entry.first}><MediaSeasonalityChart widget={entry.first} /></MediaCard> : <MediaCard key={entry.first.code} widget={entry.first}><MediaWidgetContent widget={entry.first} currency={currency} /></MediaCard>)}</div>
  </div>;
}

function BehaviourTable({ widget, currency }) {
  return <GeoDataTable widget={widget} currency={currency} />;
}

function BehaviourProgress({ widget, currency }) {
  const items = widget.items || [];
  return <div className={styles.behaviourProgress}>
    {items.map((item, index) => {
      const color = item.color || PROGRESS_COLORS[index % PROGRESS_COLORS.length];
      const width = Math.max(0, Math.min(100, Number(item.share ?? item.value) || 0));
      return <div className={styles.behaviourProgressRow} key={item.key || item.label} data-tooltip={itemTooltip(item, currency, item.format || 'number')} style={{ '--behaviour-color': color }}>
        <span>{item.label}</span>
        <i><em style={{ width: `${width}%` }} /></i>
        <strong>{formatValue(item.value, item.format, currency)}</strong>
      </div>;
    })}
  </div>;
}

function BehaviourHeatmap({ widget }) {
  return <div className={styles.behaviourHeatmap}>
    <div className={styles.behaviourHeatmapHeader}><span>{displayText(widget.rows?.[0]?.label ? '' : 'Attitude strength')}</span>{(widget.columns || []).map((column) => <span key={column}>{column}</span>)}</div>
    {(widget.rows || []).map((row) => <div className={styles.behaviourHeatmapRow} key={row.label}>
      <strong>{row.label}</strong>
      {(row.values || []).map((value, index) => <span key={`${row.label}-${index}`} data-tooltip={`${row.label}\n${widget.columns?.[index] || `Value ${index + 1}`} ${value}`}>{value}</span>)}
    </div>)}
  </div>;
}

function BehaviourCard({ widget, children }) {
  return <article className={styles.behaviourCard}>
    <div className={styles.behaviourCardHeader}><h2>{widget.title}</h2>{widget.subtitle ? <span>{widget.subtitle}</span> : null}</div>
    {children}
  </article>;
}

function BehaviourWidgetContent({ widget, currency }) {
  if (widget.type === 'progress_list' || widget.type === 'bar_chart') return <BehaviourProgress widget={widget} currency={currency} />;
  if (widget.type === 'heatmap') return <BehaviourHeatmap widget={widget} />;
  return <BehaviourTable widget={widget} currency={currency} />;
}

function BehaviourGroupedCard({ first, second, currency }) {
  return <BehaviourCard widget={first}>
    <BehaviourWidgetContent widget={first} currency={currency} />
    {second ? <div className={styles.behaviourGroupedProgress}>
      <h3>{second.title}</h3>
      <BehaviourWidgetContent widget={second} currency={currency} />
    </div> : null}
  </BehaviourCard>;
}

function BehaviourLayout({ widgets, metadata }) {
  const currency = metadata?.currency || 'CAD';
  const byCode = new Map(widgets.map((widget) => [widget.code, widget]));
  const left = [
    byCode.get('psychographic_profile'),
    byCode.get('core_values'),
    byCode.get('cultural_mindset'),
    byCode.get('mindset_matrix'),
    byCode.get('shopping_behaviour'),
    byCode.get('category_spending'),
  ].filter(Boolean);
  const rightTop = [byCode.get('purchase_drivers'), byCode.get('consumer_categories')].filter(Boolean);
  const financial = byCode.get('financial_behaviour');
  const financialActivity = byCode.get('financial_activity');
  const digital = byCode.get('digital_behaviour');
  const digitalAdoption = byCode.get('digital_adoption');
  return <div className={styles.behaviourLayout}>
    <div className={styles.behaviourColumn}>{left.map((widget) => <BehaviourCard key={widget.code} widget={widget}><BehaviourWidgetContent widget={widget} currency={currency} /></BehaviourCard>)}</div>
    <div className={styles.behaviourColumn}>
      {rightTop.map((widget) => <BehaviourCard key={widget.code} widget={widget}><BehaviourWidgetContent widget={widget} currency={currency} /></BehaviourCard>)}
      {financial ? <BehaviourGroupedCard first={financial} second={financialActivity} currency={currency} /> : null}
      {digital ? <BehaviourGroupedCard first={digital} second={digitalAdoption} currency={currency} /> : null}
    </div>
  </div>;
}

function GeographicInsightsLayout({ widgets, metadata }) {
  const currency = metadata?.currency || 'CAD';
  const byCode = new Map(widgets.map((widget) => [widget.code, widget]));
  const province = byCode.get('province_concentration');
  const concentration = byCode.get('regional_concentration');
  const clusters = byCode.get('top_cma_clusters');
  const density = byCode.get('regional_density');
  return <div className={styles.geoLayout}>
    {province || concentration ? <GeoCard widget={province || concentration}>
      {province ? <GeoDataTable widget={province} currency={currency} /> : null}
      {concentration ? <GeoConcentrationChart widget={concentration} /> : null}
    </GeoCard> : null}
    <div className={styles.geoRightColumn}>
      {clusters ? <GeoCard widget={clusters}><GeoDataTable widget={clusters} currency={currency} /></GeoCard> : null}
      {density ? <GeoCard widget={density}><GeoDensityGrid widget={density} /></GeoCard> : null}
    </div>
  </div>;
}

function DataTable({ widget, currency }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [channel, setChannelFilter] = useState('');
  const [sortBy, setSortBy] = useState('spend');
  const rows = widget.rows || [];
  const columns = widget.columns || [];
  const activeCampaigns = isActiveCampaigns(widget);
  const showTableTools = activeCampaigns || widget.truncated;
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
    {showTableTools ? <div className={`${styles.tableTools} ${activeCampaigns ? styles.campaignFilters : ''}`}>
      {activeCampaigns ? <input placeholder="Search campaigns..." value={search} onChange={(event) => setSearch(event.target.value)} /> : null}
      {activeCampaigns ? <>
        <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select value={channel} onChange={(event) => setChannelFilter(event.target.value)}><option value="">All channels</option>{channels.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="spend">Spend</option><option value="impressions">Impressions</option><option value="ctr">CTR</option><option value="conversions">Conversions</option><option value="campaign">Campaign</option></select>
      </> : widget.truncated ? <span>Showing {rows.length} of {widget.total}</span> : null}
    </div> : null}
    <div className={styles.tableWrap}>
      <table>
        <thead><tr>{columns.map((column, index) => <th key={column.key || displayText(column) || index}>{displayText(column.label || column)}</th>)}</tr></thead>
        <tbody>{filtered.map((row, index) => <tr key={row.key || row.id || index}>{columns.map((column) => {
          const key = dataColumnKey(column);
          const cell = row[key];
          const value = cell && typeof cell === 'object' && !Array.isArray(cell) ? cell.value : cell;
          const format = cell && typeof cell === 'object' ? (cell.format || column.format) : column.format;
          return <td key={key}>{cell?.status ? <StatusChip status={cell.status} /> : formatValue(displayText(value), format, currency)}</td>;
        })}</tr>)}</tbody>
      </table>
    </div>
  </div>;
}

function CreativeGrid({ widget, currency }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('performance');
  const [viewMode, setViewMode] = useState('grid');
  const items = widget.items || [];
  const normalized = (value) => String(value || '').toLowerCase();
  const titleFor = (item) => item.title || item.name || item.label || 'Untitled creative';
  const typeFor = (item) => item.type || item.format || item.kind || '';
  const platformFor = (item) => item.platform || item.channel || '';
  const statusParts = (item) => {
    const raw = item.status;
    if (!raw) {
      const uploadLike = normalized(titleFor(item)).includes('upload new creative') || item.kind === 'upload' || item.kind === 'system';
      return uploadLike ? { label: 'Coming soon', code: 'coming_soon' } : { label: 'Active', code: 'active' };
    }
    if (typeof raw === 'object') return { label: raw.label || raw.code || raw.value || '', code: raw.code || raw.label || raw.value || '' };
    return { label: String(raw), code: String(raw) };
  };
  const statusFor = (item) => statusParts(item).code || statusParts(item).label;
  const metricFor = (item, key) => {
    const metric = item.metrics?.[key] ?? item[key];
    return metric && typeof metric === 'object' && !Array.isArray(metric) ? metric.value : metric;
  };
  const metricFormat = (item, key, fallback) => {
    const metric = item.metrics?.[key] ?? item[key];
    return metric && typeof metric === 'object' && !Array.isArray(metric) ? (metric.format || fallback) : fallback;
  };
  const types = [...new Set(items.map(typeFor).filter(Boolean))];
  const platforms = [...new Set(items.map(platformFor).filter(Boolean))];
  const statuses = [...new Set(items.map(statusFor).filter(Boolean))];
  const filtered = items
    .filter((item) => {
      const haystack = [titleFor(item), item.campaign, item.description, typeFor(item), platformFor(item)].map(normalized).join(' ');
      return (!search || haystack.includes(normalized(search)))
        && (!type || typeFor(item) === type)
        && (!platform || platformFor(item) === platform)
        && (!status || statusFor(item) === status);
    })
    .sort((a, b) => {
      if (sortBy === 'title') return titleFor(a).localeCompare(titleFor(b));
      if (sortBy === 'status') return statusFor(a).localeCompare(statusFor(b));
      if (sortBy === 'conversions') return (Number(metricFor(b, 'conversions')) || 0) - (Number(metricFor(a, 'conversions')) || 0);
      const bCtr = Number(metricFor(b, 'ctr')) || Number(metricFor(b, 'performance')) || 0;
      const aCtr = Number(metricFor(a, 'ctr')) || Number(metricFor(a, 'performance')) || 0;
      return bCtr - aCtr;
    });
  const initials = (item) => {
    const raw = item.badge || titleFor(item).split(/\s+/).map((part) => part[0]).join('').slice(0, 3) || '+';
    return String(raw).replace(/[^a-z0-9+]/gi, '').slice(0, 3).toUpperCase();
  };
  const typeLabel = (item) => typeFor(item) || platformFor(item) || 'Creative';
  const statusChip = (item) => {
    const { label, code: rawCode } = statusParts(item);
    const code = normalized(rawCode || label);
    if (!label) return null;
    const isActive = code.includes('active') || code.includes('live');
    return <span className={`${styles.creativeStatus} ${isActive ? styles.creativeStatusActive : ''}`}><span aria-hidden="true">✓</span>{label}</span>;
  };

  return <div className={styles.creativeBoard}>
    <div className={styles.creativeBoardHeader}>
      <h2>{widget.title || 'Top performing creative'}</h2>
      {widget.subtitle ? <p>{widget.subtitle}</p> : null}
    </div>
    <div className={styles.creativeFilters}>
        <input placeholder="Filter creatives..." value={search} onChange={(event) => setSearch(event.target.value)} />
      <select value={type} onChange={(event) => setType(event.target.value)}><option value="">All types</option>{types.map((value) => <option key={value} value={value}>{value}</option>)}</select>
      <select value={platform} onChange={(event) => setPlatform(event.target.value)}><option value="">All platforms</option>{platforms.map((value) => <option key={value} value={value}>{value}</option>)}</select>
      <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select>
      <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="performance">Performance</option><option value="conversions">Conversions</option><option value="title">Name</option><option value="status">Status</option></select>
      <div className={styles.creativeViewToggle} aria-label="Creative view">
        <button type="button" className={viewMode === 'grid' ? styles.active : ''} onClick={() => setViewMode('grid')} aria-label="Grid view">▦</button>
        <button type="button" className={viewMode === 'list' ? styles.active : ''} onClick={() => setViewMode('list')} aria-label="List view">☰</button>
      </div>
    </div>
    {filtered.length ? <div className={`${styles.creativeGrid} ${viewMode === 'list' ? styles.creativeListView : ''}`}>{filtered.map((item, index) => {
      const ctr = metricFor(item, 'ctr') ?? metricFor(item, 'performance');
      const conversions = metricFor(item, 'conversions');
      const isUpload = normalized(titleFor(item)).includes('upload new creative') || item.kind === 'upload';
      return <article className={`${styles.creativeCard} ${isUpload ? styles.creativeUploadCard : ''}`} key={item.key || item.id || titleFor(item)}>
        {item.thumbnail_url || item.image_url ? <img src={item.thumbnail_url || item.image_url} alt="" /> : <div className={styles.thumbnailFallback}>{isUpload ? '＋' : typeLabel(item)}</div>}
        <div className={styles.creativeCardBody}>
          <div className={styles.creativeTitleRow}>
            <span className={styles.creativeBadge} style={{ '--creative-color': item.color || CHANNEL_COLORS[index % CHANNEL_COLORS.length] }}>{isUpload ? '+' : initials(item)}</span>
            <div><h3>{titleFor(item)}</h3><p>{typeLabel(item)}</p></div>
            <button type="button" aria-label="Creative actions">⋮</button>
          </div>
          {item.description ? <p className={styles.creativeDescription}>{item.description}</p> : null}
          <div className={styles.creativeMetrics}>
            <div><strong>{ctr !== undefined && ctr !== null ? `↑ ${formatValue(ctr, metricFormat(item, 'ctr', 'percent'), currency)}` : '—'}</strong><small>CTR</small></div>
            <div><strong>{conversions !== undefined && conversions !== null ? formatValue(conversions, metricFormat(item, 'conversions', 'number'), currency) : '—'}</strong><small>Conversions</small></div>
            <div>{statusChip(item)}</div>
          </div>
        </div>
      </article>;
    })}</div> : <p className={styles.empty}>No creatives match these filters.</p>}
  </div>;
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

function GenderSplitWidget({ widget, currency }) {
  const items = widget.items || [];
  const [hoverItem, setHoverItem] = useState(null);
  const total = items.reduce((sum, item) => sum + (Number(item.share ?? item.value) || 0), 0) || 100;
  let angle = 0;
  return <div className={styles.genderSplitWidget}>
    <div className={styles.genderSplitChart}>
      <svg viewBox="0 0 220 220" aria-hidden="true">
        {items.map((item, index) => {
          const value = Number(item.share ?? item.value) || 0;
          const start = angle;
          const end = angle + (value / total) * 360;
          angle = end;
          return <path key={item.key || item.label} d={donutSegmentPath(110, 110, 84, start, end)} stroke={item.color || DONUT_COLORS[index % DONUT_COLORS.length]} strokeWidth="36" fill="none" onMouseEnter={() => setHoverItem(item)} onMouseLeave={() => setHoverItem(null)} />;
        })}
      </svg>
      <div><strong>100%</strong><span>Split</span></div>
      {hoverItem ? <div className={styles.chartTooltip} style={{ left: '50%', top: '30%' }}><strong>{displayText(hoverItem.label)}</strong><b>{formatValue(hoverItem.value ?? hoverItem.share, hoverItem.format || 'percent', currency)}</b></div> : null}
    </div>
    <div className={styles.genderSplitLegend}>{items.map((item, index) => (
      <div key={item.key || item.label}>
        <i style={{ background: item.color || DONUT_COLORS[index % DONUT_COLORS.length] }} />
        <span>{item.label}</span>
        <strong>{formatValue(item.value, item.format || 'percent', currency)}</strong>
      </div>
    ))}</div>
  </div>;
}

function Donut({ widget, currency, onChannel, metadata, range, setRange }) {
  const isRoas = isRoasDonut(widget);
  const [hoverSegment, setHoverSegment] = useState(null);
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
              const share = item.share ?? item.percent ?? item.value;
              const spend = item.spend ?? item.amount ?? item.secondary_value;
              return (
                <path
                  key={item.key || item.label || index}
                  d={donutSegmentPath(140, 140, 88, start, end)}
                  fill="none"
                  stroke={item.color || DONUT_COLORS[index % DONUT_COLORS.length]}
                  strokeWidth="38"
                  onMouseEnter={() => setHoverSegment({
                    label: item.label,
                    share,
                    spend,
                    spendFormat: item.spend_format || item.secondary_format || 'currency',
                  })}
                  onMouseLeave={() => setHoverSegment(null)}
                />
              );
            })}
          </svg>
          <div className={styles.roasDonutCenter}>
            <strong>{centerValue}</strong>
            <span>{centerLabel}</span>
          </div>
          {hoverSegment ? (
            <div className={styles.chartTooltip}>
              <strong>{hoverSegment.label}</strong>
              {hoverSegment.spend !== undefined && hoverSegment.spend !== null ? <span>Spend {formatValue(hoverSegment.spend, hoverSegment.spendFormat, currency)}</span> : null}
              <b>Share {formatValue(hoverSegment.share, 'percent', currency)}</b>
            </div>
          ) : null}
        </div>
        <div className={styles.roasLegend}>
          {items.map((item, index) => {
            const share = item.share ?? item.percent ?? item.value;
            const spend = item.spend ?? item.amount ?? item.secondary_value;
            return (
              <button key={item.key || item.label || index} type="button" data-tooltip={`${item.label}\nShare ${formatValue(share, 'percent', currency)}${spend !== undefined && spend !== null ? `\nSpend ${formatValue(spend, item.spend_format || item.secondary_format || 'currency', currency)}` : ''}`} onClick={() => item.key && onChannel?.(item.key)}>
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
  if (isBudgetUtilization(widget)) return <BudgetUtilizationWidget widget={widget} currency={currency} />;
  const pct = Math.max(0, Math.min(100, ((Number(widget.value) || 0) / (Number(widget.max) || 100)) * 100));
  return <div className={styles.gaugeWrap}>
    <div className={styles.gauge} data-tooltip={`${widget.label || widget.title || 'Value'}\n${formatValue(widget.value, widget.format, currency)}`} style={{ '--pct': `${pct}%` }}><strong>{formatValue(widget.value, widget.format, currency)}</strong><span>{widget.label}</span></div>
    <div className={styles.detailList}>{widget.status ? <StatusChip status={widget.status} /> : null}{(widget.details || []).map((detail) => <p key={detail.label}><span>{detail.label}</span><strong>{formatValue(detail.value, detail.format, currency)}</strong></p>)}</div>
  </div>;
}

const CHANNEL_COLORS = ['#4f83f1', '#a78bfa', '#f8cb5d', '#fb7d2b', '#5cc7ce'];

function ChannelIcon({ index }) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.9', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' };
  const icons = [
    <svg {...common}><path d="M4 14c3-6 5-7 8-2s5 4 8-2" /><circle cx="8" cy="11" r="2" /></svg>,
    <svg {...common}><path d="M6 18V9" /><path d="M12 18V6" /><path d="M18 18v-8" /><path d="M6 9l4 4 5-7 3 3" /></svg>,
    <svg {...common}><rect x="5" y="6" width="14" height="12" rx="2" /><path d="M11 10l4 2-4 2z" /></svg>,
    <svg {...common}><path d="M5 12h8" /><circle cx="16" cy="12" r="2" /><path d="M8 16h3" /><circle cx="13" cy="16" r="1.5" /><path d="M8 8h3" /><circle cx="13" cy="8" r="1.5" /></svg>,
    <svg {...common}><path d="M5 12v4" /><path d="M9 9v10" /><path d="M13 6v12" /><path d="M17 10v6" /><path d="M21 12v2" /></svg>,
  ];
  return icons[index % icons.length];
}

function ChannelRoasWidget({ widget, currency }) {
  const [sortBy, setSortBy] = useState('spend');
  const items = widget.items || [];
  const sortedItems = [...items].sort((a, b) => (Number(b[sortBy]) || 0) - (Number(a[sortBy]) || 0));
  const maxShare = Math.max(1, ...sortedItems.map((item) => Number(item.share) || 0));
  const totalSpend = items.reduce((sum, item) => sum + (Number(item.spend) || 0), 0);
  const avgRoas = items.length ? items.reduce((sum, item) => sum + (Number(item.roas) || 0), 0) / items.length : 0;
  return <div className={styles.channelCard}>
    <div className={styles.channelCardHeader}>
      <div><h2>{widget.title}</h2><p>Compare performance across channels</p></div>
      <select aria-label="Sort channels" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
        <option value="spend">By Spend</option>
        <option value="roas">By ROAS</option>
      </select>
    </div>
    <div className={styles.channelRows}>{sortedItems.map((item, index) => {
      const color = item.color || CHANNEL_COLORS[index % CHANNEL_COLORS.length];
      const width = Math.max(6, Math.min(100, ((Number(item.share) || 0) / maxShare) * 100));
      return <div className={styles.channelRow} key={item.channel || item.label} data-tooltip={`${item.label}\nROAS ${formatValue(item.roas, 'multiplier', currency)}\nSpend ${formatValue(item.spend, 'currency', currency)}`} style={{ '--channel-color': color }}>
        <span className={styles.channelIcon}><ChannelIcon index={index} /></span>
        <div className={styles.channelInfo}><strong>{item.label}</strong><i><em style={{ width: `${width}%` }} /></i></div>
        <div className={styles.channelSpend}><strong>{formatValue(item.spend, 'currency', currency)}</strong><span>Total Spend</span></div>
        <div className={styles.channelRoasPill}><strong>{formatValue(item.roas, 'multiplier', currency)}</strong><span>ROAS</span></div>
      </div>;
    })}</div>
    <div className={styles.channelSummaryStrip}>
      <div><span>♙</span><strong>{formatValue(avgRoas, 'multiplier', currency)}</strong><small>Avg. ROAS</small></div>
      <div><span>▣</span><strong>{formatValue(totalSpend, 'currency', currency)}</strong><small>Total Spend</small></div>
      <div><span>↗</span><strong>+18.6%</strong><small>vs prev 30 days</small></div>
    </div>
  </div>;
}

function BudgetUtilizationWidget({ widget, currency }) {
  const details = widget.details || [];
  const detailByLabel = (needle) => details.find((detail) => `${detail.label || ''}`.toLowerCase().includes(needle));
  const rawValue = Number(widget.value);
  const rawMax = Number(widget.max) || 100;
  const pct = widget.empty || !Number.isFinite(rawValue) ? 0 : Math.max(0, Math.min(100, (rawValue / rawMax) * 100));
  const displayPct = Math.round(pct);
  const utilizationText = Number.isFinite(rawValue) ? formatValue(rawValue, widget.format || 'percent', currency) : `${displayPct}%`;
  const centerUtilizationText = Number.isFinite(rawValue) && (widget.format || 'percent') === 'percent' ? formatCompactPercent(rawValue) : utilizationText;
  const statusLabel = widget.label || widget.status?.label || (widget.empty ? 'No data' : 'On pace');
  const totalBudget = detailByLabel('total budget');
  const spent = detailByLabel('spent');
  const remaining = detailByLabel('remaining');
  const radius = 82;
  const center = 120;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * pct / 100;

  if (widget.empty) {
    return <div className={styles.budgetCard}>
      <div className={styles.channelCardHeader}>
        <div><h2>{widget.title}</h2><p>{widget.subtitle || 'Track delivery against allocated budget'}</p></div>
        <select aria-label="Budget metric"><option>Pacing</option></select>
      </div>
      <p className={styles.empty}>No budget data for this period.</p>
    </div>;
  }

  return <div className={styles.budgetCard}>
    <div className={styles.channelCardHeader}>
      <div><h2>{widget.title}</h2><p>{widget.subtitle || 'Track delivery against allocated budget'}</p></div>
      <select aria-label="Budget metric"><option>Pacing</option></select>
    </div>
    <div className={styles.budgetDonutWrap} data-tooltip={`Utilization ${utilizationText}
Status ${statusLabel}${remaining ? `
Remaining ${formatValue(remaining.value, remaining.format, currency)}` : ''}`}>
      <svg viewBox="0 0 240 240" aria-hidden="true">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#e9e0ff" strokeWidth="40" />
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#6d4cf2" strokeWidth="40" strokeDasharray={`${dash} ${circumference - dash}`} transform={`rotate(-90 ${center} ${center})`} />
      </svg>
      <div><strong title={utilizationText}>{centerUtilizationText}</strong><span>{statusLabel}</span>{remaining ? <small>{formatValue(remaining.value, remaining.format, currency)} <em>remaining</em></small> : null}</div>
    </div>
    <div className={styles.budgetSummaryStrip}>
      <div><span>$</span><strong>{totalBudget ? formatValue(totalBudget.value, totalBudget.format, currency) : '—'}</strong><small>Total Budget</small></div>
      <div><span>◷</span><strong>{spent ? formatValue(spent.value, spent.format, currency) : '—'}</strong><small>Spent</small></div>
      <div className={styles.budgetUtilizationMetric}><span>∑</span><strong title={utilizationText}>{utilizationText}</strong><small>Utilization</small></div>
      <div><span>⌁</span><strong>{statusLabel}</strong><small>Delivery status</small></div>
    </div>
  </div>;
}

function ChannelBottomPanel({ insight, recommendations }) {
  return <article className={`${styles.widget} ${styles.span2} ${styles.channelBottomPanel}`}>
    <div className={styles.channelInsightBlock}>
      <span className={styles.channelInsightIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 18V9" /><path d="M12 18V5" /><path d="M18 18v-8" /></svg></span>
      <div><h2>{insight?.title || 'Channel performance insights'}</h2>{(insight?.items || []).map((item) => <p key={item}>{item}</p>)}</div>
    </div>
    <div className={styles.channelRecommendationsBlock}>
      <h2>{recommendations?.title || 'Recommendations'}</h2>
      <div>{(recommendations?.items || []).map((item) => <p key={item}><span><InsightIcon tone="good" /></span>{item}</p>)}</div>

    </div>
  </article>;
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
  const [hoverPoint, setHoverPoint] = useState(null);

  const leftSeries = activeSeries.filter((series) => series.axis !== 'right');
  const rightSeries = activeSeries.filter((series) => series.axis === 'right');
  const leftAxisLabel = leftSeries[0]?.label || activeSeries[0]?.label || '';
  const rightAxisLabel = rightSeries[0]?.label || activeSeries.find((series) => series.axis === 'right')?.label || '';
  const allPoints = activeSeries[0]?.points || [];
  const chartWidth = 560;
  const chartHeight = 230;
  const pad = { left: 48, right: 46, top: 24, bottom: 36 };
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
        <div className={styles.chartAxisHeader}>
          <strong>{leftAxisLabel}</strong>
          <div className={styles.chartLegend}>
            {activeSeries.map((series, index) => <span key={series.key}><i style={{ background: seriesColor(series, index) }} />{series.label}</span>)}
          </div>
          <strong>{rightAxisLabel}</strong>
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
              {(series.points || []).map((point, pointIndex) => {
                if (point.y === null || point.y === undefined || !Number.isFinite(Number(point.y))) return null;
                const cx = xFor(pointIndex);
                const cy = yFor(point.y, domain);
                return (
                  <circle
                    key={`${series.key}-${point.x || pointIndex}`}
                    cx={cx}
                    cy={cy}
                    r="4.4"
                    fill="#fff"
                    stroke={seriesColor(series, index)}
                    strokeWidth="2.2"
                    onMouseEnter={() => setHoverPoint({
                      left: `${(cx / chartWidth) * 100}%`,
                      top: `${(cy / chartHeight) * 100}%`,
                      label: series.label,
                      date: point.x || `Point ${pointIndex + 1}`,
                      value: formatValue(point.y, series.format, currency),
                    })}
                    onMouseLeave={() => setHoverPoint(null)}
                  />
                );
              })}
            </g>;
          })}
        </svg>
        {hoverPoint ? (
          <div className={styles.chartTooltip} style={{ left: hoverPoint.left, top: hoverPoint.top }}>
            <strong>{hoverPoint.label}</strong>
            <span>{hoverPoint.date}</span>
            <b>{hoverPoint.value}</b>
          </div>
        ) : null}
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
      return <div className={styles.list}>{(widget.items || []).map((item) => <p key={displayText(item.label)}><span>{displayText(item.label)}</span><strong>{formatValue(item.value, item.format, currency)}</strong></p>)}</div>;
    case 'bar_chart':
    case 'progress_list':
      if (widget.code === 'age_distribution') return <AgeDistributionWidget widget={widget} currency={currency} />;
      return <ProgressListWidget widget={normalizeAudienceProgressWidget(widget)} currency={currency} />;
    case 'channel_list':
      if (isChannelRoas(widget)) return <ChannelRoasWidget widget={widget} currency={currency} />;
      return <BarList items={(widget.items || []).map((item) => ({ ...item, key: item.channel, value: item.spend, format: 'currency', color: metadata?.theme?.channel_colors?.[item.channel] }))} currency={currency} />;
    case 'donut':
      if (widget.code === 'demographic_gender_split') return <GenderSplitWidget widget={widget} currency={currency} />;
      return <Donut widget={widget} currency={currency} onChannel={setChannel} metadata={metadata} range={range} setRange={setRange} />;
    case 'gauge':
      return <Gauge widget={widget} currency={currency} />;
    case 'metric_table':
      if (isDetailedMetricTable(widget)) return <MetricTableWidget widget={widget} currency={currency} metadata={metadata} range={range} setRange={setRange} />;
      return <div className={styles.list}>{(widget.rows || []).map((row) => <p key={row.metric || displayText(row.label)}><span>{displayText(row.label)}<small>{displayText(row.details)}</small></span><strong>{formatValue(row.value, row.format, currency)}</strong><StatusChip status={row.status} /></p>)}</div>;
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

function renderWidgets(widgets, metadata, setChannel, range, setRange, activeTab) {
  const supported = widgets.filter((widget) => SUPPORTED_WIDGET_TYPES.has(widget.type));
  if (activeTab === 'mmm') return <MmmLayout widgets={supported} metadata={metadata} />;
  if (activeTab === 'audience_profile') return <AudienceProfileLayout widgets={supported} metadata={metadata} />;
  if (activeTab === 'geographic_insights') return <GeographicInsightsLayout widgets={supported} metadata={metadata} />;
  if (activeTab === 'behaviour') return <BehaviourLayout widgets={supported} metadata={metadata} />;
  if (activeTab === 'media_brand') return <MediaBrandLayout widgets={supported} metadata={metadata} />;
  if (activeTab === 'insights_comparison') return <InsightLayout widgets={supported} metadata={metadata} />;
  const output = [];
  for (let index = 0; index < supported.length; index += 1) {
    const widget = supported[index];
    if (isChannelInsight(widget) && isChannelRecommendation(supported[index + 1])) {
      output.push(<ChannelBottomPanel key="channel-bottom-panel" insight={widget} recommendations={supported[index + 1]} />);
      index += 1;
      continue;
    }
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
        const initial = selectionFromUrl(next.sections || []) || firstTab(next.sections || []);
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
    return renderWidgets(widgets, metadata, undefined, range, setRange, activeTab);
  }, [activeTab, metadata, range, tabData, tabError, tabStatus]);

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
    syncSelectionToUrl(section, tab);
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





























