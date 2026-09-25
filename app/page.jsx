'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { authApi } from '../lib/api';
import { validatePassword, userFriendlyFieldErrors } from '../lib/validation';
import { useAuth } from './AuthProvider';
const roasIcon1 = '/assets/ig-1.svg';
const roasIcon2 = '/assets/ig-2.svg';
const roasIcon3 = '/assets/ig-3.svg';

const publicAsset = (assetPath) => `/${assetPath}`;

const WORKSPACES = {
  'Vibrant Reach Media': {
    accent: '#8b5cf6',
    subtitle: 'Client workspace - multicultural campaign insights',
    currency: 'CAD',
    timezone: 'America/Toronto',
    summary:
      'Meta is leading on efficiency, audience mix is strong on bilingual reach, and digital direct and audio placements need pacing attention.',
    overview: {
      roas: '3.2x',
      spend: '$284.6K',
      impressions: '42.8M',
      conversions: '6,214',
      ctr: '1.44%',
      cpa: '$45.75'
    },
    ranges: {
      'Last 30 days': {
        summary:
          'Meta is leading on efficiency, audience mix is strong on bilingual reach, and digital direct and audio placements need pacing attention.',
        overview: {
          roas: '3.2x',
          spend: '$284.6K',
          impressions: '42.8M',
          conversions: '6,214',
          ctr: '1.44%',
          cpa: '$45.75'
        },
        kpis: [
          ['Total Spend', '$31.2K', '+12.4%'],
          ['Impressions', '4.8M', '+8.1%'],
          ['Avg. CTR', '1.44%', '+0.3pt'],
          ['Conversions', '682', '-2.1%'],
          ['Blended CPA', '$45.75', '-4.6%']
        ]
      },
      'Last 90 days': {
        summary:
          'Quarterly performance is stronger overall, with conversion volume rising as seasonal cultural moments brought cheaper traffic.',
        overview: {
          roas: '3.5x',
          spend: '$801.2K',
          impressions: '121.5M',
          conversions: '16,732',
          ctr: '1.52%',
          cpa: '$42.10'
        },
        kpis: [
          ['Total Spend', '$82.9K', '+18.2%'],
          ['Impressions', '14.2M', '+14.4%'],
          ['Avg. CTR', '1.52%', '+0.4pt'],
          ['Conversions', '2,041', '+6.5%'],
          ['Blended CPA', '$42.10', '-6.1%']
        ]
      },
      'This quarter': {
        summary:
          'Quarter-to-date ROAS is trending up, but digital direct and audio are still below target and should be rebalanced into Meta and Programmatic.',
        overview: {
          roas: '3.8x',
          spend: '$1.12M',
          impressions: '168.2M',
          conversions: '22,410',
          ctr: '1.61%',
          cpa: '$39.70'
        },
        kpis: [
          ['Total Spend', '$112.4K', '+24.8%'],
          ['Impressions', '18.7M', '+19.2%'],
          ['Avg. CTR', '1.61%', '+0.5pt'],
          ['Conversions', '2,988', '+9.8%'],
          ['Blended CPA', '$39.70', '-7.2%']
        ]
      }
    },
    kpis: [
      ['Total Spend', '$31.2K', '+12.4%'],
      ['Impressions', '4.8M', '+8.1%'],
      ['Avg. CTR', '1.44%', '+0.3pt'],
      ['Conversions', '682', '-2.1%'],
      ['Blended CPA', '$45.75', '-4.6%']
    ],
    channels: [
      { name: 'Meta Ads', value: 2.18, spend: '$127.9K', color: '#4f8df7' },
      { name: 'Programmatic', value: 1.72, spend: '$99.6K', color: '#a78bfa' },
      { name: 'YouTube', value: 1.54, spend: '$61.4K', color: '#facc60' },
      { name: 'Digital Direct', value: 1.39, spend: '$48.7K', color: '#ff8e3c' },
      { name: 'Digital Audio', value: 1.26, spend: '$41.2K', color: '#26c6c5' }
    ],
    audience: [
      { name: 'Hispanic/Latino', value: 32, color: '#ff6b72' },
      { name: 'Black/African American', value: 24, color: '#26c6c5' },
      { name: 'South Asian', value: 19, color: '#ffd166' },
      { name: 'East Asian', value: 15, color: '#a78bfa' },
      { name: 'Other multicultural', value: 10, color: '#5ca0ff' }
    ],
    languages: [
      ['Spanish', 14],
      ['English', 12],
      ['Mandarin', 6.4],
      ['Hindi/Urdu', 5.1],
      ['Vietnamese', 3.1],
      ['Tagalog', 2.1]
    ],
    provinces: [
      ['ON', 38], ['BC', 14], ['AB', 13], ['QC', 11], ['MB', 8], ['SK', 6], ['NS', 5], ['Other', 5]
    ],
    clients: [
      ['Northstar Foods', 'Healthy', '3 campaigns'],
      ['Aster Beauty', 'At Risk', '2 campaigns'],
      ['Kite Retail', 'Stable', '4 campaigns'],
      ['Union Telecom', 'Healthy', '5 campaigns']
    ],
    campaigns: [
      ['Community Feature', 'YouTube', 'Paused', '$31,200', '4.8M', '1.44%', '682'],
      ['Diwali Momentum', 'Meta Ads', 'Live', '$18,450', '2.1M', '2.18%', '421'],
      ['Chinese New Year', 'Programmatic', 'Live', '$12,870', '1.4M', '1.72%', '258']
    ]
  },
  'Northstar Agency': {
    accent: '#ef4444',
    subtitle: 'Agency rollup - executive overview',
    currency: 'CAD',
    timezone: 'America/Vancouver',
    summary:
      'Northstar is ahead on blended efficiency, with English-first inventory taking a larger share than desired.',
    overview: {
      roas: '4.1x',
      spend: '$412.4K',
      impressions: '67.1M',
      conversions: '9,182',
      ctr: '1.86%',
      cpa: '$39.40'
    },
    ranges: {
      'Last 30 days': {
        summary:
          'Northstar is ahead on blended efficiency, with English-first inventory taking a larger share than desired.',
        overview: {
          roas: '4.1x',
          spend: '$412.4K',
          impressions: '67.1M',
          conversions: '9,182',
          ctr: '1.86%',
          cpa: '$39.40'
        },
        kpis: [
          ['Total Spend', '$58.4K', '+9.8%'],
          ['Impressions', '7.1M', '+13.6%'],
          ['Avg. CTR', '1.86%', '+0.2pt'],
          ['Conversions', '918', '+5.7%'],
          ['Blended CPA', '$39.40', '-6.2%']
        ]
      },
      'Last 90 days': {
        summary:
          'Longer-range results show stronger stability, but there is still room to rebalance spend toward top-performing channels.',
        overview: {
          roas: '4.3x',
          spend: '$1.05M',
          impressions: '143.8M',
          conversions: '18,304',
          ctr: '1.94%',
          cpa: '$36.80'
        },
        kpis: [
          ['Total Spend', '$119.7K', '+15.3%'],
          ['Impressions', '15.8M', '+11.9%'],
          ['Avg. CTR', '1.94%', '+0.2pt'],
          ['Conversions', '1,964', '+8.4%'],
          ['Blended CPA', '$36.80', '-5.8%']
        ]
      },
      'This quarter': {
        summary:
          'Quarter-to-date performance remains strong, with Search and Social doing the heavy lifting across the agency portfolio.',
        overview: {
          roas: '4.5x',
          spend: '$1.46M',
          impressions: '202.5M',
          conversions: '24,615',
          ctr: '2.01%',
          cpa: '$34.10'
        },
        kpis: [
          ['Total Spend', '$168.3K', '+20.8%'],
          ['Impressions', '21.4M', '+14.8%'],
          ['Avg. CTR', '2.01%', '+0.3pt'],
          ['Conversions', '2,742', '+9.6%'],
          ['Blended CPA', '$34.10', '-7.9%']
        ]
      }
    },
    kpis: [
      ['Total Spend', '$58.4K', '+9.8%'],
      ['Impressions', '7.1M', '+13.6%'],
      ['Avg. CTR', '1.86%', '+0.2pt'],
      ['Conversions', '918', '+5.7%'],
      ['Blended CPA', '$39.40', '-6.2%']
    ],
    channels: [
      { name: 'Search', value: 2.42, spend: '$143.2K', color: '#4f8df7' },
      { name: 'Social', value: 1.98, spend: '$121.1K', color: '#a78bfa' },
      { name: 'YouTube', value: 1.66, spend: '$42.8K', color: '#facc60' },
      { name: 'Digital Direct', value: 1.43, spend: '$38.1K', color: '#ff8e3c' },
      { name: 'Digital Audio', value: 1.22, spend: '$29.4K', color: '#26c6c5' }
    ],
    audience: [
      { name: 'South Asian', value: 28, color: '#ff6b72' },
      { name: 'English-first', value: 26, color: '#26c6c5' },
      { name: 'East Asian', value: 18, color: '#ffd166' },
      { name: 'Hispanic/Latino', value: 16, color: '#a78bfa' },
      { name: 'Other multicultural', value: 12, color: '#5ca0ff' }
    ],
    languages: [
      ['English', 15],
      ['French', 10],
      ['Spanish', 8.4],
      ['Punjabi', 7.1],
      ['Arabic', 4.4],
      ['Korean', 3.8]
    ],
    provinces: [
      ['BC', 34], ['ON', 30], ['QC', 12], ['AB', 10], ['MB', 6], ['SK', 4], ['NS', 2], ['Other', 2]
    ],
    clients: [
      ['Apex Auto', 'Healthy', '6 campaigns'],
      ['Greenline Bank', 'Healthy', '5 campaigns'],
      ['Fieldstone Travel', 'Stable', '3 campaigns'],
      ['Aurora Telecom', 'At Risk', '4 campaigns']
    ],
    campaigns: [
      ['Q3 Retail Push', 'Search', 'Live', '$82,100', '11.2M', '2.42%', '1,420'],
      ['Holiday Awareness', 'Social', 'Live', '$63,400', '9.1M', '1.98%', '1,028'],
      ['Digital Audio Takeover', 'Digital Audio', 'Review', '$40,100', '6.6M', '1.22%', '558']
    ]
  }
};

const DEFAULT_WORKSPACE = 'Vibrant Reach Media';
const REPORTING_TABS = ['Executive Summary', 'Detailed Metrics', 'Channels', 'Audience', 'Creative', 'Reports'];
const INTELLIGENCE_TABS = [
  'Audience Profile',
  'Demographic Profile',
  'Geographic Insights',
  'Behaviour',
  'Media & Brand Intelligence',
  'Insights & Comparison'
];
const TAB_ICON_MAP = {
  Reporting: 'reporting',
  'Marketing Intelligence': 'intelligence',
  'Executive Summary': 'summary',
  'Detailed Metrics': 'metrics',
  'Media Mix Model': 'metrics',
  Channels: 'channels',
  Audience: 'audience',
  Creative: 'creative',
  Reports: 'reports',
  'Audience Profile': 'audience-research',
  'Demographic Profile': 'audience',
  'Geographic Insights': 'channels',
  Behaviour: 'metrics',
  'Media & Brand Intelligence': 'channels',
  'Insights & Comparison': 'opportunity'
};
const PAGES = [
  'Login',
  'Onboarding',
  ...REPORTING_TABS,
  ...INTELLIGENCE_TABS,
  'Media Mix Model',
  'Agency',
  'Clients',
  'Campaigns',
  'Performance',
  'Media',
  'Financial',
  'Forecast',
  'Insights',
  'Operations',
  'Settings',
  'Assistant',
  'Admin'
];

const TREND_RANGE_OPTIONS = ['Last 30 days', 'Last 90 days', 'This quarter'];
const TREND_METRIC_OPTIONS = [
  {
    value: 'conversions',
    label: 'Conversions',
    dropdownLabel: 'Spend vs Conversions',
    color: '#8b5cf6',
    formatValue: (value) => `${Math.round(value)}`,
    formatTick: (value) => `${value}`
  },
  {
    value: 'impressions',
    label: 'Impressions',
    dropdownLabel: 'Spend vs Impressions',
    color: '#f97316',
    formatValue: (value) => `${value.toFixed(1)}M`,
    formatTick: (value) => `${value}M`
  },
  {
    value: 'clicks',
    label: 'Clicks',
    dropdownLabel: 'Spend vs Clicks',
    color: '#12b76a',
    formatValue: (value) => `${Math.round(value)}`,
    formatTick: (value) => `${value}`
  }
];

function getTrendMetric(metric) {
  return TREND_METRIC_OPTIONS.find((option) => option.value === metric) || TREND_METRIC_OPTIONS[0];
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
    'aria-hidden': 'true'
  };

  switch (name) {
    case 'reporting':
      return (
        <svg {...common}>
          <path d="M4 6h16v12H4z" />
          <path d="M8 10h8" />
          <path d="M8 14h5" />
        </svg>
      );
    case 'intelligence':
      return (
        <svg {...common}>
          <path d="M12 3l4 4 5 1-1 5 1 5-5 1-4 4-4-4-5-1 1-5-1-5 5-1z" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
    case 'summary':
      return (
        <svg {...common}>
          <path d="M4 5h16v14H4z" />
          <path d="M8 9h8" />
          <path d="M8 13h4" />
        </svg>
      );
    case 'metrics':
      return (
        <svg {...common}>
          <path d="M5 19V5" />
          <path d="M5 19h14" />
          <path d="M8 15l3-4 3 2 5-7" />
        </svg>
      );
    case 'channels':
      return (
        <svg {...common}>
          <path d="M5 7h14" />
          <path d="M5 12h14" />
          <path d="M5 17h14" />
          <circle cx="9" cy="7" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="11" cy="17" r="1.5" />
        </svg>
      );
    case 'audience':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 19c1.5-3.5 4.4-5 7-5s5.5 1.5 7 5" />
        </svg>
      );
    case 'creative':
      return (
        <svg {...common}>
          <path d="M4 7h16v10H4z" />
          <path d="M7 14l3-3 3 2 3-4 2 3" />
        </svg>
      );
    case 'reports':
      return (
        <svg {...common}>
          <path d="M6 4h9l3 3v13H6z" />
          <path d="M9 11h6" />
          <path d="M9 15h6" />
        </svg>
      );
    case 'research':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 3" />
        </svg>
      );
    case 'signals':
      return (
        <svg {...common}>
          <path d="M4 14c2-4 4-4 6 0s4 4 6 0 4-4 4-4" />
          <path d="M4 10c2-4 4-4 6 0s4 4 6 0 4-4 4-4" />
        </svg>
      );
    case 'competitor':
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="2" />
          <circle cx="17" cy="7" r="2" />
          <circle cx="12" cy="17" r="2" />
          <path d="M8.5 8.5l2.2 5M15.5 8.5l-2.2 5M9 7h6" />
        </svg>
      );
    case 'audience-research':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="6" />
          <path d="M12 6v3" />
          <path d="M18 12h-3" />
          <path d="M12 18v-3" />
          <path d="M6 12h3" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="4" y="6" width="16" height="14" rx="2" />
          <path d="M8 4v4M16 4v4M4 10h16" />
        </svg>
      );
    case 'opportunity':
      return (
        <svg {...common}>
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3M18 12h3" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    default:
      return null;
  }
}

function MetricIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.9',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  };

  switch (name) {
    case 'spend':
      return (
        <svg {...common}>
          <path d="M7 7h10v10H7z" />
          <path d="M9 11h6" />
          <path d="M9 15h4" />
          <path d="M11 5V3" />
        </svg>
      );
    case 'impressions':
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case 'ctr':
      return (
        <svg {...common}>
          <path d="M4 18l6-6 4 4 6-8" />
          <path d="M14 8h6v6" />
        </svg>
      );
    case 'conversions':
      return (
        <svg {...common}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case 'cpa':
      return (
        <svg {...common}>
          <path d="M7 5h10v14H7z" />
          <path d="M9 9h6" />
          <path d="M9 13h6" />
        </svg>
      );
    case 'roas':
      return (
        <svg {...common}>
          <path d="M12 4v16" />
          <path d="M6 8h9a3 3 0 1 1 0 6H8a3 3 0 1 0 0 6h10" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

function ChannelGlyph({ name }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.9',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  };

  switch (name) {
    case 'Meta Ads':
      return (
        <svg {...common}>
          <path d="M5.5 15.5c1.4-6.1 3.8-9.2 6.5-9.2 1.9 0 3.1 1.3 4.2 3.6 1.1 2.4 2.3 3.9 3.8 3.9 1.5 0 2.3-1.2 2.5-3.5" />
          <path d="M5.5 15.5c1.4 2.1 2.9 3.2 4.5 3.2 2 0 3.5-1.3 5-4.1 1.2-2.2 2.5-3.3 4.1-3.3" />
        </svg>
      );
    case 'Programmatic':
      return (
        <svg {...common}>
          <path d="M6 17V9" />
          <path d="M12 17V5" />
          <path d="M18 17v-6" />
          <path d="M5 19h14" />
          <path d="M7 7l4-3 4 4 4-4" />
        </svg>
      );
    case 'YouTube':
      return (
        <svg {...common}>
          <rect x="4.5" y="5" width="15" height="14" rx="4" />
          <path d="M10 10l5 2.5-5 2.5z" />
        </svg>
      );
    case 'Digital Direct':
      return (
        <svg {...common}>
          <path d="M5 12h9" />
          <path d="M11 8l4 4-4 4" />
          <circle cx="17" cy="12" r="2" />
        </svg>
      );
    case 'Digital Audio':
      return (
        <svg {...common}>
          <path d="M7 14V10" />
          <path d="M11 17V7" />
          <path d="M15 15V9" />
          <path d="M19 13v-2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

function ControlGlyph({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.9',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  };

  switch (name) {
    case 'performance':
      return (
        <svg {...common}>
          <path d="M4 18V6" />
          <path d="M8 18v-8" />
          <path d="M12 18v-5" />
          <path d="M16 18v-11" />
          <path d="M20 18v-3" />
        </svg>
      );
    case 'pacing':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    default:
      return null;
  }
}

function BudgetGlyph({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.9',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  };

  switch (name) {
    case 'budget':
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M16.5 8.25c0-1.8-1.9-3.25-4.5-3.25S7.5 6.45 7.5 8.25 9.4 11.5 12 11.5s4.5 1.45 4.5 3.25S14.6 18 12 18s-4.5-1.45-4.5-3.25" />
        </svg>
      );
    case 'spent':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case 'utilization':
      return (
        <svg {...common}>
          <path d="M7 17h10" />
          <path d="M8 15l8-8" />
          <path d="M12 7h4v4" />
        </svg>
      );
    case 'status':
      return (
        <svg {...common}>
          <path d="M5 16l5-5 3 3 6-6" />
          <path d="M19 8v6h-6" />
        </svg>
      );
    default:
      return null;
  }
}

function CheckBadgeGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.3 10.9 14.7 15.8 9.8" />
    </svg>
  );
}

function CrossBadgeGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6" />
      <path d="M15 9l-6 6" />
    </svg>
  );
}

function InsightGlyph() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="18" cy="18" r="18" fill="url(#insight-glyph-gradient)" />
      <rect x="11" y="18" width="4" height="9" rx="2" fill="white" />
      <rect x="16" y="14" width="4" height="13" rx="2" fill="white" />
      <rect x="21" y="9" width="4" height="18" rx="2" fill="white" />
      <defs>
        <linearGradient id="insight-glyph-gradient" x1="6" y1="5" x2="31.5" y2="31.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C5CFF" />
          <stop offset="1" stopColor="#5B46EA" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function AudienceGlyph({ className = '' }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3" />
      <path d="M5 19c1.5-3.5 4.4-5 7-5s5.5 1.5 7 5" />
    </svg>
  );
}

function LanguageGlyph({ className = '' }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4c2.5 2.2 4 5.2 4 8s-1.5 5.8-4 8c-2.5-2.2-4-5.2-4-8s1.5-5.8 4-8Z" />
    </svg>
  );
}

function ProvinceGlyph({ className = '' }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 384 384"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M355.6,350.2s-16.1-42.4-48.3-127.2c-.4-1.2-1.3-2.1-2.4-2.7l-50.5-28.4c-.2-.1-.3-.4-.2-.6l15.7-24.8c16.7-27.4,17.3-62.1,2.2-90.3-14.9-27.9-44.4-46.9-76-47.7-.3,0-.3-.3,0-.5h-7.8l-.2.3c-32.6,1.4-62.6,20.8-77.2,50.1-13.9,27.8-12.9,60.7,3,87.4l16,25.4c.2.3,0,.5-.1.7l-50.8,28.6c-.9.5-1.6,1.4-2,2.3-16.2,42.5-32.4,84.9-48.4,127.4-.1,0-.2,0-.4,0v1.8c.4,1.9,1.8,3.3,3.8,3.7h0c0,.1,1.9.1,1.9.1.2-.2.6-.2.9-.3l3.5-1.9,35.1-19.8,39.2-22.1,47.8,26.9,24.2,13.7,5.4,3,1.5.4h1.3c.2-.3.9-.1,1.6-.5l10.9-6.1,20.9-11.8,45.6-25.7,9.7,5.4,25.3,14.3,37.5,21.2,5.2,2.9c.3.2.8,0,.9.3h1.9c2.1-.7,3.3-1.7,3.8-3.8v-1.9c-.1,0-.3,0-.4,0ZM174.4,335.8l-42.5-24-14-7.8,1.6-7.7,7.7-36.4c.5-2.6-1.7-4.9-3.9-5.3-2.5-.4-4.9,1.1-5.5,3.7l-4.3,20.3-5.2,24.7-15.8,8.8-36.7,20.6-13.6,7.6,34.4-90.6,4.8-12.5,3.5-9.3,44.7-25.2-7.7,36.3c-.4,1.9-.2,3.6,1.3,5,1.2,1.2,3.1,1.6,4.8,1,1.8-.6,2.9-2.1,3.3-3.9l3.6-17.2,3.7-17.6c0-.3.4-.2.3.2l20.6,32.6,20.5,32.4c1.7,2.7,4.2,4.6,7.3,5.7v66s-12.8-7.3-12.8-7.3ZM191.8,268.2c-2,0-3.3-1.3-4.4-3l-9.6-15.3-25.4-40.4-23.6-37.5-6.3-9.9c-7.8-12.4-12-27.7-12.1-42.3,0-5.9.7-11.6,1.9-17.3,2-9.6,5.7-18.6,10.9-26.9,10.6-16.7,27.4-29.4,46.4-34.9,15.7-4.6,32.6-4.3,48.1,1,11,3.8,21,9.7,29.5,17.5,9.8,9,17.7,20.9,21.9,33.5,6.2,18.7,6.1,37.4-.8,55.9-2.2,5.8-5.2,11.2-8.5,16.5l-24.6,38.9-38.8,61.5c-1.1,1.7-2.6,2.8-4.6,2.7ZM222.8,328.4l-26,14.7v-66c3-1.1,5.7-3,7.4-5.9l21.3-33.7,19.6-31c0-.3.2-.3.3-.1l12.6,59.3,7.2,33.8.8,4.6-43.3,24.4ZM334.3,336.2l-25.9-14.6-32.6-18.2-9.6-45.5-10.1-47.4-1.6-7.7,44.7,25.1,4.9,13,5.8,15.3,7.4,19.5,24.5,64.6-7.6-4.2Z" />
      <path d="M28.4,350.4c16-42.5,32.1-85,48.4-127.4.4-1,1.1-1.8,2-2.3l50.8-28.6c.2-.2.3-.4.1-.7l-16-25.4c-15.9-26.7-16.8-59.6-3-87.4,14.6-29.3,44.6-48.7,77.2-50.1l.2-.3-2.8.3c-9.7.7-19.2,2.9-28.2,6.6-19.3,8.1-35.3,22.4-45.2,40.8-2.3,4.3-4.3,8.7-5.9,13.3-6.1,17.1-6.9,35.7-2.3,53.3,2.4,8.7,5.8,17.2,10.6,24.8l15.3,24.4-46.3,26.1-4.5,2.5c-1.1.6-1.9,1.6-2.4,2.7l-1.3,3.2-17.4,45.9-22.1,58.2-7.4,19.5c0,.2,0,.4-.2.5.1,0,.3,0,.4,0Z" />
      <path d="M355.8,349.9l-6.2-16.4-9.5-25.1-19.6-51.5-9.1-24-3.8-9.9c-.6-1.4-1.6-2.4-3-3.1l-27-15.2-23.1-13,14.9-23.6c8.5-13.5,13.2-29,13.9-44.9.4-12-1.4-23.8-5.6-35.1-9-24.7-28-44-52.4-53.8-8.5-3.4-17.3-5.4-26.4-5.9h-2.7c0,0-.2-.2-.2-.3-.2.2-.2.4,0,.5,31.6.9,61.1,19.9,76,47.7,15.1,28.3,14.5,62.9-2.2,90.3l-15.7,24.8c0,.3,0,.5.2.6l50.5,28.4c1.1.6,1.9,1.5,2.4,2.7,32.2,84.8,48.3,127.2,48.3,127.2.1,0,.3,0,.4,0-.1,0-.1-.2-.2-.3Z" />
      <path d="M344.1,352.8l-37.5-21.2-25.3-14.3-9.7-5.4-45.6,25.7-20.9,11.8-10.9,6.1c-.6.4-1.4.2-1.6.5l1.9-.3c25.6-14.3,51.3-28.8,77.1-43.4,25.6,14.5,51.3,28.9,77,43.4l1.6.3c-.2-.2-.6-.2-.9-.3l-5.2-2.9Z" />
      <path d="M184.5,352.6l-24.2-13.7-47.8-26.9-39.2,22.1-35.1,19.8-3.5,1.9c-.3.2-.7.1-.9.3l1.5-.3,3.1-1.6,74.1-41.7c25.8,14.6,51.5,29,77,43.4l1.9.3-1.5-.4-5.4-3Z" />
      <path d="M192,66.5c-29.2,0-52.9,23.7-52.9,52.9s23.7,52.9,52.9,52.9,52.9-23.7,52.9-52.9-23.7-52.9-52.9-52.9ZM192,162.6c-23.9,0-43.2-19.4-43.2-43.2s19.4-43.2,43.2-43.2,43.2,19.4,43.2,43.2-19.4,43.2-43.2,43.2Z" />
      <path d="M192,85.7c-18.6,0-33.7,15.1-33.7,33.7s15.1,33.7,33.7,33.7,33.7-15.1,33.7-33.7-15.1-33.7-33.7-33.7ZM192,143.4c-13.3,0-24.1-10.8-24.1-24.1s10.8-24.1,24.1-24.1,24.1,10.8,24.1,24.1-10.8,24.1-24.1,24.1Z" />
    </svg>
  );
}

function ReportGlyph({ name, className = '' }) {
  const common = {
    className,
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.9',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  };

  switch (name) {
    case 'document':
      return (
        <svg {...common}>
          <path d="M6 4h8l4 4v12H6z" />
          <path d="M14 4v4h4" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...common}>
          <path d="M13 2 5 13h6l-1 9 9-12h-6z" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...common}>
          <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
          <path d="M19 4l.8 2.2L22 7l-2.2.8L19 10l-.8-2.2L16 7l2.2-.8z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="3" />
          <circle cx="16" cy="10" r="2.5" />
          <path d="M4.5 18c1.1-2.7 3.2-4 5.4-4s4.3 1.3 5.4 4" />
        </svg>
      );
    case 'money':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v10" />
          <path d="M15 9.2c0-1.2-1.3-2.2-3-2.2s-3 1-3 2.2S10.3 11 12 11s3 1 3 2.2S13.7 15.4 12 15.4s-3-1-3-2.2" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M8.5 12.1 11 14.6 15.8 9.8" />
        </svg>
      );
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      );
    case 'download':
      return (
        <svg {...common}>
          <path d="M12 4v9" />
          <path d="M8.5 10.5 12 14l3.5-3.5" />
          <path d="M5 19h14" />
        </svg>
      );
    case 'list':
      return (
        <svg {...common}>
          <path d="M7 7h12" />
          <path d="M7 12h12" />
          <path d="M7 17h12" />
          <circle cx="4" cy="7" r="1" />
          <circle cx="4" cy="12" r="1" />
          <circle cx="4" cy="17" r="1" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1.2" />
          <rect x="14" y="4" width="6" height="6" rx="1.2" />
          <rect x="4" y="14" width="6" height="6" rx="1.2" />
          <rect x="14" y="14" width="6" height="6" rx="1.2" />
        </svg>
      );
    case 'filter':
      return (
        <svg {...common}>
          <path d="M4 5h16l-6.5 7v5l-3 2v-7z" />
        </svg>
      );
    case 'refresh':
      return (
        <svg {...common}>
          <path d="M20 6v5h-5" />
          <path d="M20 11a8 8 0 1 0 2.3 5.6" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case 'more':
      return (
        <svg {...common}>
          <circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

function RoasGlyph({ src }) {
  return <img className="roas-glyph" src={src} alt="" aria-hidden="true" />;
}

const NAV = [
  ['Overview', ['Home', 'Agency', 'Clients']],
  ['Analyze', ['Campaigns', 'Performance', 'Media', 'Audience', 'Creative']],
  ['Plan', ['Financial', 'Forecast']],
  ['AI', ['Insights', 'Assistant']],
  ['Reports', ['Reports', 'Operations', 'Settings']],
  ['Admin', ['Admin']]
];

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [hydrated, key, value]);

  return [value, setValue];
}

function initialsFor(name = '', email = '') {
  const source = String(name || email || 'MOSAIQ user').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase() || 'MU';
}

function roleLabelFor(user) {
  return user?.membership?.role_code?.replaceAll('_', ' ') || user?.platform_role_code?.replaceAll('_', ' ') || 'MOSAIQ user';
}

function normalizeWorkspaceOption(workspace) {
  const id = workspace?.id ?? workspace?.name;
  const name = workspace?.name || (id != null ? `Workspace ${id}` : 'Workspace');
  return { id, name, status: workspace?.status || null };
}

function unwrapProfileResponse(response) {
  return response?.data || response || null;
}


function App() {
  const { user, signOut, refresh } = useAuth();
  const [theme, setTheme] = usePersistentState('mosaiq.theme', 'light');
  const [workspace, setWorkspace] = usePersistentState('mosaiq.workspace', DEFAULT_WORKSPACE);
  const [area, setArea] = usePersistentState('mosaiq.area', 'Reporting');
  const [page, setPage] = usePersistentState('mosaiq.page', 'Executive Summary');
  const [range, setRange] = usePersistentState('mosaiq.range', 'Last 30 days');
  const [search, setSearch] = useState('');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('sign in');
  const [workspaceOptions, setWorkspaceOptions] = useState([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState('');
  const [signOutBusy, setSignOutBusy] = useState(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileDetails, setProfileDetails] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const profileWrapRef = useRef(null);
  const availableWorkspaceOptions = workspaceOptions;
  const selectedWorkspaceOption = availableWorkspaceOptions.find((option) => option.name === workspace) || null;
  const workspaceSelectValue = selectedWorkspaceOption ? workspace : '';
  const seededWorkspace = WORKSPACES[workspace] || WORKSPACES[DEFAULT_WORKSPACE];
  const active = selectedWorkspaceOption ? { ...seededWorkspace, ...selectedWorkspaceOption } : seededWorkspace;
  const profileName = user?.name || 'MOSAIQ user';
  const profileRole = roleLabelFor(user);
  const profileInitials = initialsFor(user?.name, user?.email);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.title = `MOSAIQ | ${page}`;
  }, [page]);

  useEffect(() => {
    if (!user) return undefined;
    let live = true;
    setWorkspaceLoading(true);
    setWorkspaceError('');
    authApi.listWorkspacesForUser(user)
      .then((response) => {
        if (!live) return;
        setWorkspaceOptions((response.data || []).map(normalizeWorkspaceOption));
      })
      .catch((error) => {
        if (!live) return;
        setWorkspaceOptions([]);
        setWorkspaceError(error.message || 'Unable to load workspaces.');
      })
      .finally(() => {
        if (live) setWorkspaceLoading(false);
      });
    return () => { live = false; };
  }, [user]);

  useEffect(() => {
    if (!availableWorkspaceOptions.length) return;
    if (!availableWorkspaceOptions.some((option) => option.name === workspace)) {
      setWorkspace(availableWorkspaceOptions[0].name);
    }
  }, [availableWorkspaceOptions, workspace, setWorkspace]);

  useEffect(() => {
    const validAreas = ['Reporting', 'Marketing Intelligence', 'Media Mix Model'];
    if (!validAreas.includes(area)) setArea('Reporting');
  }, [area, setArea]);

  useEffect(() => {
    const validReporting = new Set(REPORTING_TABS);
    const validIntelligence = new Set(INTELLIGENCE_TABS);
    if (area === 'Media Mix Model') {
      if (page !== 'Media Mix Model') setPage('Media Mix Model');
      return;
    }
    const valid = area === 'Marketing Intelligence' ? validIntelligence : validReporting;
    if (!valid.has(page) && page !== 'Login' && page !== 'Onboarding') {
      setPage(area === 'Marketing Intelligence' ? INTELLIGENCE_TABS[0] : REPORTING_TABS[0]);
    }
  }, [area, page, setPage]);

  const activeRange = active.ranges?.[range] || active.ranges?.['Last 30 days'] || active;

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
      if (event.key === 'Escape') {
        setPaletteOpen(false);
        setProfileMenuOpen(false);
        setProfileSettingsOpen(false);
        setChangePasswordOpen(false);
      }
    };

    const onPointerDown = (event) => {
      if (profileWrapRef.current && !profileWrapRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  const pageMeta = useMemo(() => PAGES.map((name) => ({ name, q: name.toLowerCase() })), []);
  const filteredPages = pageMeta.filter((item) => item.q.includes(search.toLowerCase()));

  async function handleProfileSettingsOpen() {
    setProfileMenuOpen(false);
    setProfileSettingsOpen(true);
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const response = await authApi.me();
      setProfileDetails(unwrapProfileResponse(response));
    } catch (error) {
      setProfileError(error.message || 'Unable to load profile details.');
      setProfileDetails(user);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleProfileSave(name) {
    const trimmedName = String(name || '').trim();
    if (!trimmedName) {
      setProfileError('Please enter your name.');
      setProfileSuccess('');
      return;
    }
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      await authApi.updateAgencyUser(user, { name: trimmedName });
      setProfileDetails({ ...(profileDetails || user), name: trimmedName });
      setProfileSuccess('Your profile has been updated successfully.');
    } catch (error) {
      const nameError = Array.isArray(error.fields?.name) ? error.fields.name[0] : '';
      const message = error.code === 'PROFILE_RECORD_NOT_FOUND' ? error.message : (nameError || error.message || 'Unable to update profile.');
      setProfileError(message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleProfileSettingsClose() {
    const shouldRefreshProfile = Boolean(profileSuccess);
    setProfileSettingsOpen(false);
    if (shouldRefreshProfile) await refresh();
  }

  function handleChangePasswordOpen() {
    setProfileMenuOpen(false);
    setChangePasswordOpen(true);
    setPasswordError('');
    setPasswordSuccess('');
  }

  function handleChangePasswordClose() {
    setChangePasswordOpen(false);
    setPasswordError('');
    setPasswordSuccess('');
  }

  async function handleChangePasswordSave(values) {
    const currentPassword = String(values.current_password || '');
    const nextPassword = String(values.password || '');
    const confirmPassword = String(values.password_confirmation || '');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      setPasswordSuccess('');
      return false;
    }
    const passwordErrorMessage = validatePassword(nextPassword);
    if (passwordErrorMessage) {
      setPasswordError(passwordErrorMessage);
      setPasswordSuccess('');
      return false;
    }
    if (nextPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      setPasswordSuccess('');
      return false;
    }

    setPasswordSaving(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        password: nextPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordSuccess('Your password has been changed successfully.');
      return true;
    } catch (error) {
      const fields = userFriendlyFieldErrors(error);
      setPasswordError(fields.current_password || fields.password || fields.password_confirmation || error.message || 'Unable to change password.');
      return false;
    } finally {
      setPasswordSaving(false);
    }
  }
  async function handleHeaderSignOut() {
    setSignOutBusy(true);
    try {
      await signOut();
      window.location.assign('/login');
    } finally {
      setSignOutBusy(false);
    }
  }

  if (page === 'Login') {
    return (
      <AuthScreen
        theme={theme}
        setTheme={setTheme}
        authMode={authMode}
        setAuthMode={setAuthMode}
        onEnter={() => setPage('Home')}
      />
    );
  }

  if (page === 'Onboarding') {
    return <OnboardingScreen onContinue={() => setPage('Executive Summary')} onBack={() => setPage('Login')} />;
  }

  return (
    <div className={`app-shell ${theme}`} style={{ '--accent': active.accent }}>
      <main className="main">
        <header className="topbar">
          <div className="topbar-row">
            <div className="brand brand-inline">
              <div className="brand-mark">M</div>
              <div>
                <div className="brand-name">MOSAIQ</div>
                <div className="brand-sub">Prompt-driven client demo</div>
              </div>
            </div>

            <section className="major-tabs header-tabs">
              <button className={area === 'Reporting' ? 'major-tab active' : 'major-tab'} onClick={() => setArea('Reporting')}>
                <span className="tab-icon"><TabIcon name={TAB_ICON_MAP.Reporting} /></span>
                Reporting Dashboard
                <span className="major-caret">⌄</span>
              </button>
              <button
                className={area === 'Marketing Intelligence' ? 'major-tab active' : 'major-tab'}
                onClick={() => setArea('Marketing Intelligence')}
              >
                <span className="tab-icon"><TabIcon name={TAB_ICON_MAP['Marketing Intelligence']} /></span>
                Marketing Intelligence
                <span className="major-caret">⌄</span>
              </button>
              <button className={area === 'Media Mix Model' ? 'major-tab active' : 'major-tab'} onClick={() => setArea('Media Mix Model')}>
                <span className="tab-icon"><TabIcon name={TAB_ICON_MAP['Media Mix Model']} /></span>
                Media Mix Model
              </button>
            </section>

            <div className="toolbar">
              <select className="select compact" value={range} onChange={(e) => setRange(e.target.value)} aria-label="Select date range">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This quarter</option>
              </select>
            </div>
          </div>
        </header>

        {profileSettingsOpen && (
          <ProfileSettingsModal
            user={user}
            profile={profileDetails}
            workspaces={availableWorkspaceOptions}
            loading={profileLoading}
            error={profileError}
            saving={profileSaving}
            success={profileSuccess}
            onRetry={handleProfileSettingsOpen}
            onSave={handleProfileSave}
            onClose={handleProfileSettingsClose}
          />
        )}

        {changePasswordOpen && (
          <ChangePasswordModal
            saving={passwordSaving}
            error={passwordError}
            success={passwordSuccess}
            onSave={handleChangePasswordSave}
            onClose={handleChangePasswordClose}
          />
        )}

        {area === 'Reporting' && (
          <>
            <section className="tabs dense">
              {REPORTING_TABS.map((item) => (
                <button key={item} className={item === page ? 'tab active' : 'tab'} onClick={() => setPage(item)}>
                  <span className="tab-icon"><TabIcon name={TAB_ICON_MAP[item]} /></span>
                  {item}
                </button>
              ))}
            </section>
            <ReportingArea
              page={page}
              active={active}
              activeRange={activeRange}
              search={search}
              setSearch={setSearch}
              campaignSearch={campaignSearch}
              setCampaignSearch={setCampaignSearch}
              range={range}
              setRange={setRange}
            />
          </>
        )}

        {area === 'Marketing Intelligence' && (
          <>
            <section className="tabs dense">
              {INTELLIGENCE_TABS.map((item) => (
                <button key={item} className={item === page ? 'tab active' : 'tab'} onClick={() => setPage(item)}>
                  <span className="tab-icon"><TabIcon name={TAB_ICON_MAP[item]} /></span>
                  {item}
                </button>
              ))}
            </section>
            <MarketingArea page={page} active={active} />
          </>
        )}

        {area === 'Media Mix Model' && <MediaMixModelPage workspace={active} />}

        {paletteOpen && (
          <CommandPalette
            pages={filteredPages}
            search={search}
            setSearch={setSearch}
            onClose={() => setPaletteOpen(false)}
            onSelect={(name) => {
              setPage(name);
              setPaletteOpen(false);
            }}
          />
        )}
      </main>
    </div>
  );
}

function ReportingArea({ page, active, activeRange, compare, search, setSearch, campaignSearch, setCampaignSearch, range, setRange }) {
  switch (page) {
    case 'Executive Summary':
      return <HomePage workspace={active} view={activeRange} compare={compare} range={range} setRange={setRange} />;
    case 'Detailed Metrics':
      return (
        <DetailedMetricsPage
          workspace={active}
          view={activeRange}
          range={range}
          setRange={setRange}
          campaignSearch={campaignSearch}
          setCampaignSearch={setCampaignSearch}
        />
      );
    case 'Channels':
      return <MediaPage active={active} />;
    case 'Audience':
      return <AudiencePage active={active} />;
    case 'Creative':
      return <CreativePage active={active} search={search} setSearch={setSearch} />;
    case 'Reports':
      return <ReportsPage active={active} search={search} setSearch={setSearch} />;
    default:
      return <HomePage workspace={active} view={activeRange} compare={compare} range={range} setRange={setRange} />;
  }
}

function MarketingArea({ page, active }) {
  switch (page) {
    case 'Audience Profile':
      return <MarketingAudienceProfilePage active={active} />;
    case 'Demographic Profile':
      return <MarketingDemographicsPage />;
    case 'Geographic Insights':
      return <MarketingGeographicInsightsPage />;
    case 'Behaviour':
      return <MarketingBehaviourPage active={active} />;
    case 'Media & Brand Intelligence':
      return <MarketingMediaBrandPage active={active} />;
    case 'Insights & Comparison':
      return <MarketingInsightsComparisonPage active={active} />;
    default:
      return <MarketingAudienceProfilePage active={active} />;
  }
}

function MarketingAudienceProfilePage({ active }) {
  const [audienceTab, setAudienceTab] = useState('Languages');
  const overviewRows = [
    ['Population', '1.8M', 'Size of the core audience'],
    ['% of Canadian population', '5.4%', 'Useful for share-of-market framing'],
    ['Buying power', '$65B+', 'Estimated annual consumer spend'],
    ['Median age', '42', 'Skews slightly older than average'],
    ['Average household size', '3.2', 'Family-oriented structure'],
    ['Income index', '118', 'Above-average spending power'],
    ['Education index', '126', 'Higher information tolerance'],
    ['Economic contribution', '$91B+', 'Signals macro market value']
  ];

  const ageDistribution = [
    { name: '18-24', value: 12, color: '#4f8df7' },
    { name: '25-34', value: 24, color: '#a78bfa' },
    { name: '35-44', value: 26, color: '#26c6c5' },
    { name: '45-54', value: 18, color: '#facc60' },
    { name: '55-64', value: 12, color: '#ff6b72' },
    { name: '65+', value: 8, color: '#5ca0ff' }
  ];

  const genderSplit = [
    { name: 'Male', value: 49, color: '#4f8df7' },
    { name: 'Female', value: 49, color: '#a78bfa' },
    { name: 'Non-binary', value: 2, color: '#26c6c5' }
  ];

  const segments = [
    { name: 'South Asian', value: 30, reach: '2.3M', color: '#ff5b67' },
    { name: 'Chinese', value: 24, reach: '1.9M', color: '#2dc9c7' },
    { name: 'Filipino', value: 18, reach: '1.4M', color: '#ffc53d' },
    { name: 'West Asians', value: 18, reach: '1.3M', color: '#7f5af6' },
    { name: 'Other multicultural', value: 10, reach: '760K', color: '#4f8df7' }
  ];
  const languages = [
    ['HN', 'Hinglish', 14, '#ff5b67', '#fee2e2', '#ef4444'],
    ['TA', 'Tamil', 12, '#2dc9c7', '#e8faf8', '#14b8a6'],
    ['PN', 'Punjabi', 6.4, '#f5b63f', '#fef3c7', '#f59e0b'],
    ['MA', 'Mandarin', 5.1, '#7f5af6', '#ebe5ff', '#6d4df5'],
    ['CN', 'Cantonese', 3.1, '#4f8df7', '#e6efff', '#2563eb'],
    ['TL', 'Tagalog', 2.1, '#ff8e3c', '#ffe9d6', '#f97316']
  ];
  const provincePairs = [
    [['ON', 'Ontario', '38%'], ['NS', 'NS', '5%']],
    [['BC', 'BC', '14%'], ['NB', 'NB', '3%']],
    [['AB', 'AB', '13%'], ['NL', 'NL', '2%']],
    [['QC', 'QC', '11%'], ['PE', 'PE', '1%']],
    [['MB', 'MB', '8%'], ['YT', 'YT', '0.5%']],
    [['SK', 'SK', '6%'], ['Other', 'Other', '2.5%']]
  ];

  const footerLeft = [
    { value: '7.46M', label: 'Total reach', icon: true },
    { value: '100%', label: 'Total share of reach' },
    { value: '+ 12.6%', label: 'vs prev 30 days', tone: 'positive' }
  ];
  const footerRight = [
    { value: '6.82M', label: 'Total audience', icon: true },
    { value: '26', label: 'Languages & regions' },
    { value: '+ 8.9%', label: 'vs prev 30 days', tone: 'positive' }
  ];

  const immigrationRows = [
    ['Generation', 'First + second', 'Strong cultural continuity'],
    ['Years in Canada', '10-20', 'Established but still culturally active'],
    ['Country of origin', 'Varies by community', 'Keep segment-level flexibility'],
    ['Immigration stream', 'Economic + family', 'Language and work often intersect'],
    ['Citizenship', 'Permanent residency + citizens', 'Plan for mixed tenure']
  ];

  const languageRows = [
    ['Primary language', 'English', 'Used as default communication base'],
    ['Languages spoken at home', 'Heritage + English', 'Bilingual needs are common'],
    ['English proficiency', 'High', 'English is broadly usable'],
    ['French proficiency', 'Variable', 'Use market-specific targeting'],
    ['Preferred language for advertising', 'English + heritage language', 'Localized variants improve trust'],
    ['Reading language', 'English', 'Prioritize clarity'],
    ['Speaking language', 'Bilingual', 'Reflect live conversation patterns'],
    ['Writing language', 'English', 'Keep copy simple and accessible'],
    ['Media language preference', 'Mixed', 'Match channel and context']
  ];

  const culturalRows = [
    ['Strength of cultural identity', 'High', 'Identity remains a differentiator'],
    ['Connection to heritage', 'Strong', 'Heritage cues can be powerful'],
    ['Importance of traditions', 'High', 'Use family and event markers'],
    ['Cultural pride', 'High', 'Representation matters'],
    ['Religious identity', 'Meaningful', 'Respect timing and tone'],
    ['Community involvement', 'High', 'Community proof is influential'],
    ['Acculturation score', 'Moderate', 'Balance Canadian and heritage cues'],
    ['Canadian identity vs heritage identity', 'Both', 'Dual identity should be acknowledged'],
    ['Cultural values index', 'Strong', 'Values-led creative is a fit']
  ];

  const religionRows = [
    ['Religion', 'Varies by audience', 'Segment-specific planning needed'],
    ['Importance of religion', 'Medium to high', 'Faith can influence decisions'],
    ['Frequency of worship', 'Regular', 'Event timing matters'],
    ['Major holidays celebrated', 'Multiple', 'Use cultural calendar'],
    ['Religious purchasing influence', 'Moderate', 'Food, gifting, and timing can matter'],
    ['Dietary restrictions', 'Segment-specific', 'Need compliant creative and offers'],
    ['Prayer habits', 'Regular', 'Avoid scheduling conflicts'],
    ['Community engagement', 'High', 'Trusted places and voices matter']
  ];

  const familyRows = [
    ['Importance of family', 'Very high', 'Family is a core decision driver'],
    ['Decision-making style', 'Collective', 'Household voices matter'],
    ['Role of parents', 'Influential', 'Parent-led trust is important'],
    ['Children influence', 'Meaningful', 'Kids shape category choice'],
    ['Caregiving responsibilities', 'Present', 'Needs-based messaging works'],
    ['Respect for elders', 'High', 'Use respect-forward creative'],
    ['Financial support overseas', 'Common', 'Remittance and duty themes matter']
  ];

  const geographyHeatmapRows = ['GTA', 'Vancouver', 'Surrey', 'Abbotsford', 'Calgary'];
  const geographyHeatmapCols = ['Population', 'Buying power', 'Media reach', 'Growth'];
  const geographyHeatmapValues = [
    [9, 9, 9, 8],
    [8, 8, 8, 7],
    [7, 7, 7, 8],
    [6, 6, 6, 7],
    [6, 7, 6, 8]
  ];

  const immigrationSplit = [
    { name: 'First generation', value: 54, color: '#4f8df7' },
    { name: 'Second generation', value: 32, color: '#a78bfa' },
    { name: 'Third generation+', value: 14, color: '#26c6c5' }
  ];

  const languageBars = [
    { name: 'English', value: 38, color: '#4f8df7' },
    { name: 'Heritage language', value: 31, color: '#a78bfa' },
    { name: 'Bilingual blend', value: 21, color: '#26c6c5' },
    { name: 'French', value: 10, color: '#facc60' }
  ];

  const culturalHeatmapRows = ['Heritage', 'Traditions', 'Pride', 'Community', 'Acculturation'];
  const culturalHeatmapCols = ['Low', 'Medium', 'High'];
  const culturalHeatmapValues = [
    [1, 4, 9],
    [1, 5, 8],
    [1, 4, 9],
    [1, 3, 8],
    [3, 5, 7]
  ];

  return (
    <div className="marketing-masonry">
      <Panel title="Audience overview" meta="Snapshot">
        <MetricGrid rows={overviewRows} />
        <Divider />
        <List
          items={[
            'Start here when a planner wants a quick read on the audience.',
            'Keep the same card-and-table rhythm used in the reporting dashboard.',
            'Use the overview to guide deeper drill-downs in the other tabs.'
          ]}
        />
      </Panel>

      <section className="panel audience-panel audience-panel-left">
        <div className="audience-panel-header">
          <div>
            <h2>Audience by cultural segment</h2>
            <p>Distribution of your audience across key cultural segments</p>
          </div>
          <div className="audience-filter-group">
            <div className="audience-select-wrap">
              <select className="select audience-select" defaultValue="Share of reach">
                <option>Share of reach</option>
                <option>Reach</option>
                <option>Growth</option>
              </select>
            </div>
          </div>
        </div>

        <div className="audience-segment-card">
          {segments.map((segment) => (
            <div className="audience-segment-row" key={segment.name}>
              <div className="audience-segment-badge" style={{ background: segment.color }}>
                <AudienceGlyph className="audience-segment-icon" />
              </div>
              <div className="audience-segment-main">
                <div className="audience-segment-head">
                  <div className="">
                    <div className="audience-segment-name">{segment.name}</div>
                    <div className="audience-segment-track">
                      <div className="audience-segment-fill" style={{ width: `${segment.value}%`, background: segment.color }} />
                    </div>
                  </div>
                  <div className="audience-segment-share">
                    <strong>{segment.value}%</strong>
                    <span>Share of reach</span>
                  </div>
                  <div className="audience-segment-reach">
                    <strong>{segment.reach}</strong>
                    <span>Reach</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="audience-footer-strip">
          {footerLeft.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 ? <div className="audience-footer-divider" /> : null}
              <div className={`audience-footer-item ${item.tone ? `audience-footer-${item.tone}` : ''}`}>
                {item.icon ? (
                  <span className="audience-footer-icon"><AudienceGlyph className="audience-footer-glyph" /></span>
                ) : null}
                <div className="audience-footer-copy">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="panel audience-panel">
        <div className="audience-panel-header">
          <div>
            <h2>Language and province mix</h2>
            <p>Understand your audience by language and location</p>
          </div>
          <div className="audience-filter-group">
            <div className="audience-select-wrap">
              <select className="select audience-select" defaultValue="Filterable dimensions">
                <option>Filterable dimensions</option>
                <option>Audience mix</option>
                <option>Location mix</option>
              </select>
            </div>
          </div>
        </div>

        <div className="audience-switcher">
          <button
            className={audienceTab === 'Languages' ? 'audience-switcher-tab active' : 'audience-switcher-tab'}
            type="button"
            onClick={() => setAudienceTab('Languages')}
          >
            <span className="audience-switcher-icon"><LanguageGlyph /></span>
            <span>Languages</span>
          </button>
          <button
            className={audienceTab === 'Provinces' ? 'audience-switcher-tab active' : 'audience-switcher-tab'}
            type="button"
            onClick={() => setAudienceTab('Provinces')}
          >
            <span className="audience-switcher-icon"><ProvinceGlyph /></span>
            <span>Provinces</span>
          </button>
        </div>

        {audienceTab === 'Languages' ? (
          <div className="audience-language-list">
            {languages.map(([code, name, value, barColor, badgeColor, badgeText]) => (
              <div className="audience-language-row" key={name}>
                <span className="audience-language-badge" style={{ background: badgeColor, color: badgeText }}>
                  {code}
                </span>
                <div className="audience-language-name">{name}</div>
                <div className="audience-language-track">
                  <div className="audience-language-fill" style={{ width: `${value}%`, background: barColor }} />
                </div>
                <div className="audience-language-value">{value.toFixed(value % 1 === 0 ? 0 : 1)}%</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="audience-province-list">
            {provincePairs.map(([left, right]) => (
              <div className="audience-province-row" key={`${left[0]}-${right[0]}`}>
                <div className="audience-province-item">
                  <span className="audience-province-badge">{left[0]}</span>
                  <span className="audience-province-name">{left[1]}</span>
                  <strong>{left[2]}</strong>
                </div>
                <div className="audience-province-item">
                  <span className="audience-province-badge">{right[0]}</span>
                  <span className="audience-province-name">{right[1]}</span>
                  <strong>{right[2]}</strong>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="audience-footer-strip">
          {footerRight.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 ? <div className="audience-footer-divider" /> : null}
              <div className={`audience-footer-item ${item.tone ? `audience-footer-${item.tone}` : ''}`}>
                {item.icon ? (
                  <span className="audience-footer-icon"><AudienceGlyph className="audience-footer-glyph" /></span>
                ) : null}
                <div className="audience-footer-copy">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      <Panel title="Immigration profile" meta="Settlement journey">
        <CampaignStyleTable columns={['Field', 'Value', 'Planning implication']} rows={immigrationRows} />
      </Panel>

      <Panel title="Language insights" meta="Communication preferences">
        <CampaignStyleTable columns={['Field', 'Value', 'Why it matters']} rows={languageRows} />
      </Panel>

      <Panel title="Cultural identity" meta="Identity strength">
        <CampaignStyleTable columns={['Field', 'Value', 'Planning implication']} rows={culturalRows} />
      </Panel>

      <Panel title="Religion and faith" meta="Faith markers">
        <CampaignStyleTable columns={['Field', 'Value', 'Why it matters']} rows={religionRows} />
      </Panel>

      <Panel title="Generation split" meta="Immigration mix">
        <MiniDonutChart title="Immigration generation" items={immigrationSplit} centerValue="100%" centerLabel="split" />
      </Panel>

      <Panel title="Language reach" meta="Message mix">
        <MiniHorizontalBarChart title="Preferred language mix" items={languageBars} valueSuffix="%" />
      </Panel>

      <Panel title="Cultural values index" meta="Identity heatmap">
        <Heatmap rows={culturalHeatmapRows} cols={culturalHeatmapCols} values={culturalHeatmapValues} title="Identity and values" />
      </Panel>

      <Panel title="Family values" meta="Household influence">
        <CampaignStyleTable columns={['Field', 'Value', 'Why it matters']} rows={familyRows} />
      </Panel>
    </div>
  );
}

function MarketingDemographicsPage() {
  const demographicRows = [
    ['Household structure', 'Couples and families', 'Reflect household decision-making'],
    ['Marital status', 'Mixed', 'Family life and partnership themes matter'],
    ['Household size', '3-4 people', 'Messaging should consider the whole home'],
    ['Education', 'College / university', 'Higher information tolerance'],
    ['Employment', 'Full-time and self-employed', 'Strong working-age profile'],
    ['Occupation categories', 'Professional, healthcare, retail', 'Broad but skilled workforce'],
    ['Home ownership', 'Mixed, leaning owner-occupied', 'Property and finance content resonates'],
    ['Housing type', 'Condos, apartments, townhomes', 'Urban housing mix']
  ];

  const ageDistribution = [
    { name: '18-24', value: 12, color: '#4f8df7' },
    { name: '25-34', value: 24, color: '#a78bfa' },
    { name: '35-44', value: 26, color: '#26c6c5' },
    { name: '45-54', value: 18, color: '#facc60' },
    { name: '55-64', value: 12, color: '#ff6b72' },
    { name: '65+', value: 8, color: '#5ca0ff' }
  ];

  const genderSplit = [
    { name: 'Male', value: 49, color: '#4f8df7' },
    { name: 'Female', value: 49, color: '#a78bfa' },
    { name: 'Non-binary', value: 2, color: '#26c6c5' }
  ];

  return (
    <div className="marketing-demographics-layout">
      <Panel title="Demographic profile" meta="Core traits">
        <CampaignStyleTable columns={['Dimension', 'Pattern', 'Planning implication']} rows={demographicRows} />
      </Panel>
      <div className="marketing-demographics-right">
        <Panel title="Age distribution" meta="Age bands">
          <MiniHorizontalBarChart title="Population by age" items={ageDistribution} valueSuffix="%" />
        </Panel>
        <Panel title="Gender split" meta="Population balance">
          <MiniDonutChart title="Gender mix" items={genderSplit} centerValue="100%" centerLabel="split" />
        </Panel>
      </div>
    </div>
  );
}

function MarketingGeographicInsightsPage() {
  const geographyRows = [
    ['Ontario', '38%', 'Primary concentration'],
    ['British Columbia', '14%', 'Primary concentration'],
    ['Alberta', '13%', 'Secondary concentration'],
    ['Quebec', '11%', 'Secondary concentration'],
    ['Manitoba', '8%', 'Secondary concentration'],
    ['Saskatchewan', '6%', 'Secondary concentration'],
    ['Nova Scotia', '5%', 'Secondary concentration'],
    ['Other', '5%', 'Secondary concentration']
  ];

  const geographyHeatmapRows = ['GTA', 'Vancouver', 'Surrey', 'Abbotsford', 'Calgary'];
  const geographyHeatmapCols = ['Population', 'Buying power', 'Media reach', 'Growth'];
  const geographyHeatmapValues = [
    [9, 9, 9, 8],
    [8, 8, 8, 7],
    [7, 7, 7, 8],
    [6, 6, 6, 7],
    [6, 7, 6, 8]
  ];

  return (
    <div className="marketing-geography-layout">
      <Panel title="Geographic insights" meta="Market concentration">
        <CampaignStyleTable columns={['Province', 'Share', 'Signal']} rows={geographyRows} />
        <Divider />
        <MiniLineChart
          title="Regional concentration pattern"
          xLabel="Concentration"
          yLabel="Key markets"
          points={[
            { name: 'GTA', value: 9, color: '#4f8df7' },
            { name: 'Vancouver', value: 8, color: '#a78bfa' },
            { name: 'Calgary', value: 6, color: '#26c6c5' },
            { name: 'Montreal', value: 5, color: '#facc60' },
            { name: 'Other', value: 4, color: '#5ca0ff' }
          ]}
        />
      </Panel>
      <div className="marketing-geography-right">
        <Panel title="Top CMA clusters" meta="Census metros">
          <CampaignStyleTable
            columns={['City', 'Signal', 'Note']}
            rows={[
              ['GTA', 'Strong', 'Largest urban concentration for scale'],
              ['Vancouver', 'Strong', 'Strong West Coast reach'],
              ['Surrey', 'Rising', 'Dense family and multicultural base'],
              ['Abbotsford', 'Rising', 'Secondary growth market'],
              ['Calgary', 'Watch', 'Growing secondary market'],
              ['Montreal', 'Review', 'Language-specific execution required']
            ]}
          />
        </Panel>
        <Panel title="Regional density" meta="Heatmap view">
          <Heatmap rows={geographyHeatmapRows} cols={geographyHeatmapCols} values={geographyHeatmapValues} title="Population and reach" />
        </Panel>
      </div>
    </div>
  );
}

function MarketingBehaviourPage() {
  const psychographicRows = [
    ['Core values', 'Security, community, tradition', 'Foundational messaging pillars'],
    ['Motivations', 'Family success, financial stability, health', 'Deeply practical drivers'],
    ['Personality traits', 'Loyal, thoughtful, digitally confident', 'Tone should be credible and warm'],
    ['Lifestyle segments', 'Family-focused, career-driven, community-oriented', 'Create flexible creative variants'],
    ['Risk tolerance', 'Moderate', 'Proof and reassurance help'],
    ['Brand loyalty', 'High', 'Retention and continuity are valuable'],
    ['Innovation adoption', 'Moderate to high', 'New formats can work with trust'],
    ['Price sensitivity', 'Medium', 'Value matters but is not the only factor']
  ];

  const valuesBars = [
    { name: 'Security', value: 92, color: '#4f8df7' },
    { name: 'Community', value: 88, color: '#a78bfa' },
    { name: 'Tradition', value: 84, color: '#26c6c5' },
    { name: 'Innovation', value: 66, color: '#facc60' },
    { name: 'Convenience', value: 79, color: '#ff6b72' }
  ];

  const mindsetRows = [
    ['Authority', 'Respectful', 'Expert voices matter'],
    ['Education', 'High value', 'Information-led content works'],
    ['Money', 'Cautious / aspirational', 'Balance practicality and ambition'],
    ['Luxury', 'Selective', 'Premium needs justification'],
    ['Success', 'Achievement-oriented', 'Status and progress resonate'],
    ['Individualism', 'Moderate', 'Self-expression but within family context'],
    ['Collectivism', 'Strong', 'Family and community influence is high'],
    ['Gender roles', 'Context-specific', 'Avoid stale stereotypes'],
    ['Parenting', 'Hands-on', 'Future and child outcomes matter'],
    ['Savings', 'Strong', 'Long-term planning appeals'],
    ['Debt', 'Cautious', 'Low-friction, transparent offers preferred'],
    ['Entrepreneurship', 'Positive', 'Ambition and self-starting are valued'],
    ['Community', 'Very strong', 'Local relevance is essential']
  ];

  const mindsetHeatmapRows = ['Authority', 'Money', 'Success', 'Collectivism', 'Entrepreneurship'];
  const mindsetHeatmapCols = ['Low', 'Medium', 'High'];
  const mindsetHeatmapValues = [
    [1, 5, 8],
    [2, 6, 7],
    [1, 5, 9],
    [1, 4, 9],
    [2, 5, 7]
  ];

  const shoppingRows = [
    ['Shopping frequency', 'Weekly', 'Routine grocery and household trips'],
    ['Online vs offline', '60/40', 'Digital-first, store-assisted'],
    ['Preferred retailers', 'Mass + specialty mix', 'Price and trust both matter'],
    ['Average basket size', 'Moderate', 'Useful for upsell and bundling'],
    ['Seasonal shopping', 'High', 'Holiday and cultural moments matter'],
    ['Impulse buying', 'Moderate', 'Triggered by promotions and social proof'],
    ['Brand loyalty', 'High', 'Trust matters once established'],
    ['Private label adoption', 'Moderate', 'Value sensitive, but selective'],
    ['Premium willingness', 'Selective', 'Willing to pay when quality is clear'],
    ['Coupon usage', 'Moderate', 'Value still influences conversion'],
    ['Cross-border shopping', 'Common', 'Country-of-origin cues matter']
  ];

  const shoppingBars = [
    { name: 'Groceries', value: 28, color: '#4f8df7' },
    { name: 'Fashion', value: 14, color: '#a78bfa' },
    { name: 'Beauty', value: 11, color: '#26c6c5' },
    { name: 'Travel', value: 16, color: '#facc60' },
    { name: 'Technology', value: 17, color: '#ff6b72' },
    { name: 'Finance', value: 14, color: '#5ca0ff' }
  ];

  const purchaseRows = [
    ['Quality', 'High', 'Trust and durability drive selection'],
    ['Price', 'High', 'Value still matters for basket choice'],
    ['Brand trust', 'Very high', 'Familiar brands convert faster'],
    ['Country of origin', 'High', 'Heritage and authenticity influence choice'],
    ['Recommendations', 'Very high', 'Family and community proof matters'],
    ['Reviews', 'High', 'Social validation affects confidence'],
    ['Family influence', 'Very high', 'Household decision-making is shared'],
    ['Community influence', 'High', 'Local credibility improves uptake'],
    ['Social media', 'Medium', 'Useful for discovery and validation'],
    ['Convenience', 'High', 'Ease of purchase still closes the sale'],
    ['Availability', 'High', 'Stock and access close the sale'],
    ['Health', 'Medium', 'Health cues matter in relevant categories'],
    ['Ethical sourcing', 'Medium', 'Increasingly relevant for premium choices']
  ];

  const consumerRows = [
    ['Groceries', 'High', 'Weekly and high-frequency category'],
    ['Automotive', 'Medium', 'Needs trust and financing clarity'],
    ['Beauty', 'Medium', 'Identity and premium cues matter'],
    ['Luxury', 'Selective', 'High-end items need proof'],
    ['Technology', 'High', 'Innovation and value resonate'],
    ['Telecommunications', 'High', 'Bundle/value offers matter'],
    ['Restaurants', 'High', 'Family and convenience-led'],
    ['Travel', 'High', 'Aspiration and family visits matter'],
    ['Fashion', 'Medium', 'Style and cultural expression matter'],
    ['Financial services', 'High', 'Trust and clarity are key'],
    ['Insurance', 'Medium', 'Family protection angle works'],
    ['Healthcare', 'High', 'Practical and family-oriented'],
    ['Education', 'High', 'Future-facing investment'],
    ['Real estate', 'High', 'Ownership and stability matter'],
    ['Home improvement', 'Medium', 'Household investment signal'],
    ['Entertainment', 'High', 'Streaming and cultural content are central']
  ];

  const financialRows = [
    ['Banking preference', 'Digital-first', 'App and mobile banking are expected'],
    ['Credit card ownership', 'High', 'Credit offers can be highly relevant'],
    ['Mortgage ownership', 'Mixed', 'Home and finance offers need segmenting'],
    ['Savings habit', 'Strong', 'Practical, future-facing planning'],
    ['Insurance ownership', 'Moderate', 'Family protection angle can work'],
    ['Remittance behaviour', 'Frequent', 'Family support overseas is meaningful'],
    ['Retirement planning', 'Emerging', 'Financial education content can help'],
    ['Financial confidence', 'High', 'Good fit for investment and mortgage offers']
  ];

  const financialBars = [
    { name: 'Banking', value: 86, color: '#4f8df7' },
    { name: 'Saving', value: 81, color: '#a78bfa' },
    { name: 'Investing', value: 62, color: '#26c6c5' },
    { name: 'Insurance', value: 58, color: '#facc60' },
    { name: 'Remittance', value: 74, color: '#ff6b72' }
  ];

  const digitalBars = [
    { name: 'Mobile', value: 84, color: '#4f8df7' },
    { name: 'CTV', value: 68, color: '#a78bfa' },
    { name: 'Streaming', value: 73, color: '#26c6c5' },
    { name: 'Gaming', value: 44, color: '#facc60' },
    { name: 'AI', value: 59, color: '#ff6b72' },
    { name: 'Online learning', value: 66, color: '#5ca0ff' }
  ];

  return (
    <div className="marketing-masonry">
      <Panel title="Psychographic profile" meta="Strategic value">
        <CampaignStyleTable columns={['Field', 'Pattern', 'Why it matters']} rows={psychographicRows} />
      </Panel>
      <Panel title="Core values" meta="Values distribution">
        <MiniHorizontalBarChart title="Core values" items={valuesBars} valueSuffix="%" />
      </Panel>

      <Panel title="Cultural mindset" meta="Attitude lens">
        <CampaignStyleTable columns={['Attitude', 'Direction', 'Planning note']} rows={mindsetRows} />
      </Panel>
      <Panel title="Mindset matrix" meta="Planning heatmap">
        <Heatmap rows={mindsetHeatmapRows} cols={mindsetHeatmapCols} values={mindsetHeatmapValues} title="Attitude strength" />
      </Panel>

      <Panel title="Shopping behaviour" meta="Purchase patterns">
        <CampaignStyleTable columns={['Indicator', 'Pattern', 'What it means']} rows={shoppingRows} />
      </Panel>
      <Panel title="Category spending" meta="Spend mix">
        <MiniHorizontalBarChart title="Category spend" items={shoppingBars} valueSuffix="%" />
      </Panel>

      <Panel title="Purchase drivers" meta="Decision triggers">
        <CampaignStyleTable columns={['Driver', 'Importance', 'Why it matters']} rows={purchaseRows} />
      </Panel>
      <Panel title="Consumer categories" meta="Category affinity">
        <CampaignStyleTable columns={['Category', 'Spending', 'Planning note']} rows={consumerRows} />
      </Panel>

      <Panel title="Financial behaviour" meta="Confidence and capacity">
        <CampaignStyleTable columns={['Field', 'Value', 'Planning implication']} rows={financialRows} />
        <Divider />
        <MiniHorizontalBarChart title="Financial activity" items={financialBars} valueSuffix="%" />
      </Panel>
      <Panel title="Digital behaviour" meta="Device and platform adoption">
        <CampaignStyleTable
          columns={['Field', 'Value', 'Why it matters']}
          rows={[
            ['Devices used', 'Mobile + desktop + CTV', 'Coverage should span screens'],
            ['Operating system', 'Mixed', 'Creative should stay compatible'],
            ['Connected TV usage', 'High', 'CTV can be a major reach layer'],
            ['Smart home adoption', 'Moderate', 'New tech is viable'],
            ['Streaming subscriptions', 'High', 'Streaming is a core habit'],
            ['Gaming', 'Moderate', 'Younger segments engage here'],
            ['AI adoption', 'Moderate', 'Personalization and tools can work'],
            ['Online learning', 'High', 'Self-improvement content has potential'],
            ['App usage', 'High', 'App UX matters for conversion'],
            ['Search behaviour', 'High', 'High-intent discovery is important']
          ]}
        />
        <Divider />
        <MiniHorizontalBarChart title="Digital adoption" items={digitalBars} valueSuffix="%" />
      </Panel>
    </div>
  );
}

function MarketingMediaBrandPage({ active }) {
  const mediaMix = [
    { name: 'Linear TV', value: 12, color: '#4f8df7' },
    { name: 'FAST channels', value: 8, color: '#a78bfa' },
    { name: 'CTV', value: 18, color: '#26c6c5' },
    { name: 'Radio', value: 9, color: '#facc60' },
    { name: 'Streaming audio', value: 12, color: '#ff6b72' },
    { name: 'Podcast listening', value: 7, color: '#5ca0ff' },
    { name: 'Print', value: 5, color: '#9aa5b1' },
    { name: 'Digital news', value: 10, color: '#4f8df7' },
    { name: 'Social media', value: 9, color: '#a78bfa' },
    { name: 'YouTube', value: 10, color: '#26c6c5' }
  ];

  const mediaRows = [
    ['TV', 'Linear TV, FAST, CTV', 'Still important for scale and reach'],
    ['Radio', 'Streaming audio + radio', 'Good for local commutes and routines'],
    ['Cinema', 'Selective', 'Good for premium launches'],
    ['Print', 'Niche but present', 'Use in high-trust contexts'],
    ['Digital news', 'Frequent', 'Local and international news matter'],
    ['Social media', 'Very frequent', 'Always-on engagement surface'],
    ['YouTube', 'High', 'Strong video discovery channel'],
    ['Digital Direct', 'Moderate', 'Urban reinforcement layer'],
    ['Digital Audio', 'Moderate', 'Good for neighbourhood density'],
    ['Retail media', 'Growing', 'Useful near purchase moments'],
    ['Email', 'Functional', 'Great for offers and reminders'],
    ['Messaging apps', 'High', 'Useful for direct sharing and community']
  ];

  const socialRows = [
    ['Instagram', 'High penetration', 'Visual inspiration and shopping'],
    ['TikTok', 'High penetration', 'Short-form discovery and entertainment'],
    ['Facebook', 'Broad usage', 'Community and older-family reach'],
    ['YouTube', 'Very high usage', 'Video depth and how-to content'],
    ['LinkedIn', 'Moderate', 'Professional and career segments'],
    ['Pinterest', 'Moderate', 'Planning and inspiration'],
    ['Snapchat', 'Younger segments', 'Fast-moving content'],
    ['Reddit', 'Niche', 'Opinion and information seeking'],
    ['WhatsApp', 'Very high', 'Messaging and sharing'],
    ['WeChat', 'Segment-specific', 'Community and diaspora communication'],
    ['Xiaohongshu', 'Segment-specific', 'Beauty and lifestyle discovery'],
    ['LINE', 'Segment-specific', 'Community communication'],
    ['Threads', 'Emerging', 'Conversation and culture'],
    ['Discord', 'Niche', 'Gaming and interest groups']
  ];

  const socialBars = [
    { name: 'Instagram', value: 88, color: '#4f8df7' },
    { name: 'TikTok', value: 85, color: '#a78bfa' },
    { name: 'Facebook', value: 74, color: '#26c6c5' },
    { name: 'YouTube', value: 91, color: '#facc60' },
    { name: 'WhatsApp', value: 79, color: '#ff6b72' },
    { name: 'WeChat', value: 46, color: '#5ca0ff' }
  ];

  const contentRows = [
    ['Entertainment', 'High', 'Broad attention driver'],
    ['News', 'High', 'Use credible and local angles'],
    ['Sports', 'Medium', 'Community affiliation performs well'],
    ['Finance', 'Medium', 'Frame around trust and security'],
    ['Food', 'High', 'Strong community and family hook'],
    ['Travel', 'Medium', 'Use identity and aspiration cues'],
    ['Fashion', 'Medium', 'Style and identity can connect'],
    ['Gaming', 'Medium', 'Strong younger-segment pull'],
    ['Technology', 'High', 'Innovation cues support premium offers'],
    ['Parenting', 'High', 'Family life and future planning matter'],
    ['Education', 'High', 'Learning and self-improvement'],
    ['DIY', 'Medium', 'Useful for home and family utility'],
    ['Health', 'High', 'Practical wellness themes resonate'],
    ['Faith', 'Medium', 'Respect timing and tone'],
    ['Culture', 'High', 'Representation matters'],
    ['Local news', 'High', 'Community relevance builds trust'],
    ['International news', 'Medium', 'Useful for transnational relevance']
  ];

  const brandRows = [
    ['Brand trust', 'High', 'Lead with credibility'],
    ['Favourite brands', 'Established leaders', 'Familiarity matters'],
    ['Canadian brands', 'Trusted when relevant', 'Local proof helps'],
    ['Heritage-country brands', 'Meaningful', 'Nostalgia and authenticity'],
    ['Luxury brands', 'Selective', 'Use premium cues carefully'],
    ['Emerging brands', 'Open to trial', 'Opportunity for differentiation'],
    ['Switching behaviour', 'Moderate', 'Offer clear reasons to change'],
    ['Loyalty programs', 'Valued', 'Rewards can strengthen retention'],
    ['Word-of-mouth influence', 'Very high', 'Community proof matters most']
  ];

  const adInsightRows = [
    ['Preferred ad language', 'Bilingual / localized', 'Do not rely on English-only as default'],
    ['Preferred spokesperson', 'Community trusted', 'Use credible, relatable faces'],
    ['Humour preference', 'Moderate', 'Keep it culturally aware'],
    ['Emotional vs rational', 'Balanced', 'Mix emotion with proof'],
    ['Family-centric messaging', 'Strong', 'Household storylines resonate'],
    ['Community representation', 'Essential', 'Authenticity matters'],
    ['Representation importance', 'High', 'Reflect lived experience'],
    ['Celebrity influence', 'Moderate', 'Use selectively'],
    ['Music preference', 'Culturally familiar', 'Audio can be a strong hook'],
    ['Ad avoidance', 'Moderate', 'Respect clutter and repetition'],
    ['Trust in advertising', 'Conditional', 'Proof points increase conversion']
  ];

  const calendarRows = [
    ['Chinese New Year', 'High', 'Launch 3-4 weeks in advance'],
    ['Diwali', 'Healthy', 'Family-oriented storytelling performs well'],
    ['Ramadan', 'Watch', 'Adjust timing and offer windows'],
    ['Eid', 'Watch', 'Coordinate offers with celebration windows'],
    ['Nowruz', 'Emerging', 'Use culturally specific creative'],
    ['Navratri', 'Emerging', 'Plan around family and community moments'],
    ['Christmas', 'High', 'Broad family gifting opportunity'],
    ['Vaisakhi', 'Emerging', 'Localized community activation'],
    ['Mid-Autumn Festival', 'Watch', 'Seasonal gift and family lens'],
    ['Lunar New Year', 'High', 'High seasonal impact'],
    ['Pride', 'Review', 'Reflect inclusion appropriately'],
    ['Community Launch', 'Review', 'Refresh creative and partnerships'],
    ['Asian Heritage Month', 'Review', 'Use community-centered storytelling'],
    ['National Indigenous Peoples Day', 'Review', 'Use respectful local partnership']
  ];

  const calendarPoints = [
    { name: 'Jan', value: 4, color: '#4f8df7' },
    { name: 'Feb', value: 5, color: '#a78bfa' },
    { name: 'Mar', value: 3, color: '#26c6c5' },
    { name: 'Apr', value: 6, color: '#facc60' },
    { name: 'May', value: 7, color: '#ff6b72' },
    { name: 'Jun', value: 5, color: '#5ca0ff' }
  ];

  return (
    <div className="marketing-masonry">
      <Panel title="Media consumption" meta="Channel mix">
        <MiniDonutChart title="Channel mix" items={mediaMix} centerValue="100%" centerLabel="reach mix" />
        <Divider />
        <MiniHorizontalBarChart title="Social platform penetration" items={socialBars} valueSuffix="%" />
      </Panel>

      <Panel title="Media mix detail" meta="Platform table">
        <CampaignStyleTable columns={['Channel', 'Mix', 'Why it matters']} rows={mediaRows} />
      </Panel>

      <Panel title="Social media profile" meta="Platform use">
        <CampaignStyleTable columns={['Platform', 'Usage', 'Why it matters']} rows={socialRows} />
      </Panel>

      <Panel title="Content preferences" meta="Interest clusters">
        <CampaignStyleTable columns={['Content', 'Engagement', 'Activation note']} rows={contentRows} />
      </Panel>
      <Panel title="Content emphasis" meta="What holds attention">
        <Heatmap
          rows={['Entertainment', 'News', 'Sports', 'Food', 'Travel', 'Technology']}
          cols={['Engagement', 'Sharing', 'Conversion']}
          values={[
            [9, 8, 6],
            [8, 7, 6],
            [7, 6, 5],
            [8, 7, 6],
            [7, 6, 6],
            [8, 7, 7]
          ]}
          title="Interest heatmap"
        />
      </Panel>

      <Panel title="Brand relationships" meta="Affinity and trust">
        <CampaignStyleTable columns={['Field', 'Pattern', 'Planning note']} rows={brandRows} />
      </Panel>
      <Panel title="Advertising insights" meta="Creative direction">
        <CampaignStyleTable columns={['Topic', 'Direction', 'Use in creative']} rows={adInsightRows} />
      </Panel>

      <Panel title="Seasonal and cultural calendar" meta="Timing cues">
        <CampaignStyleTable columns={['Moment', 'Status', 'Planning cue']} rows={calendarRows} />
      </Panel>
      <Panel title="Seasonality curve" meta="Campaign timing">
        <MiniLineChart
          title="Seasonal intensity"
          xLabel="Campaign window"
          yLabel="Seasonal weight"
          points={calendarPoints}
        />
      </Panel>
    </div>
  );
}

function MarketingInsightsComparisonPage() {
  const opportunityRows = [
    ['Buying power', '92'],
    ['Digital adoption', '88'],
    ['Brand loyalty', '81'],
    ['Media reachability', '90'],
    ['Growth potential', '95'],
    ['Category affinity', '84'],
    ['Cultural influence', '87'],
    ['Premium spending', '79'],
    ['Overall score', '89']
  ];

  const planningRows = [
    ['Best media mix', 'CTV + social video + streaming audio', 'Balances reach and cultural relevance'],
    ['Best channels', 'CTV, YouTube, Meta, audio', 'Combines scale with precision'],
    ['Best languages', 'English plus heritage language', 'Improves trust and completion'],
    ['Best timing', '3-4 weeks before major cultural events', 'Captures seasonal intent'],
    ['Best creative approach', 'Family + achievement + community', 'Matches core motivations'],
    ['Frequency guidance', 'Moderate to high', 'Avoid over-saturation'],
    ['Reach potential', 'High', 'Broad enough for efficient scaling'],
    ['CPM benchmarks', 'Mid to premium', 'Depends on language and context'],
    ['Partnership opportunities', 'Community-led', 'Use local and trusted voices'],
    ['Influencer recommendations', 'Community creators', 'Use trust over celebrity alone'],
    ['White space opportunities', 'Underserved segments', 'Target neglected categories and channels']
  ];

  const comparisonRows = [
    ['Population', 'Largest', 'Strong', 'Mid', 'Mid'],
    ['Median age', '42', '35', '31', '33'],
    ['Household income', '$110K', '$128K', '$98K', '$101K'],
    ['Buying power', 'High', 'Very high', 'Medium', 'Medium'],
    ['Education', 'High', 'Very high', 'High', 'High'],
    ['Home ownership', 'Mixed', 'High', 'Medium', 'Medium'],
    ['Brand loyalty', 'High', 'High', 'Medium', 'High'],
    ['Streaming usage', 'Strong', 'Strong', 'Very strong', 'Strong'],
    ['TikTok usage', 'High', 'Medium', 'Very high', 'High'],
    ['Luxury spending', 'Medium', 'High', 'Medium', 'Medium'],
    ['Grocery spend', 'High', 'High', 'High', 'High'],
    ['Travel spend', 'Medium', 'High', 'Medium', 'Medium']
  ];

  const opportunityBars = [
    { name: 'Buying power', value: 92, color: '#4f8df7' },
    { name: 'Digital adoption', value: 88, color: '#a78bfa' },
    { name: 'Brand loyalty', value: 81, color: '#26c6c5' },
    { name: 'Media reachability', value: 90, color: '#facc60' },
    { name: 'Growth potential', value: 95, color: '#ff6b72' },
    { name: 'Category affinity', value: 84, color: '#5ca0ff' },
    { name: 'Cultural influence', value: 87, color: '#9aa5b1' },
    { name: 'Premium spending', value: 79, color: '#4f8df7' }
  ];

  const sourceRows = [
    ['Statistics Canada', 'Census, income, labour', 'Core demographic and economic anchor'],
    ['Environics Analytics', 'PRIZM, DemoStats', 'Audience segmentation and geodemographics'],
    ['Vividata', 'Media and consumer behaviour', 'Consumption and lifestyle intelligence'],
    ['Numeris', 'TV and radio audiences', 'Broadcast reach and tuning'],
    ['Comscore', 'Digital audiences', 'Cross-device digital reach'],
    ['NielsenIQ', 'Retail and CPG', 'Category spending and shopping signals'],
    ['Kantar', 'Brand equity and effectiveness', 'Creative and brand health context'],
    ['YouGov', 'Brand perception', 'Public opinion and affinity'],
    ['Geospatial datasets', 'Neighbourhood analysis', 'Local concentration and mapping'],
    ['Platform insights', 'Meta, Google, TikTok', 'Where available for channel refinement'],
    ['First-party CRM', 'Client data', 'Custom audience enrichment and validation']
  ];

  const aiRows = [
    ['Audience summary', 'South Asian Canadians are a young, affluent, family-oriented segment with high digital engagement and strong multilingual media consumption.', 'Ideal for client-facing narrative'],
    ['Top growth opportunities', 'Identify categories where spending or adoption is increasing fastest.', 'Useful for planning and investment'],
    ['Messaging recommendations', 'Suggest themes such as achievement, family, community, and innovation.', 'Align creative to values'],
    ['Creative considerations', 'Recommend imagery, language use, and moments to avoid or embrace.', 'Cultural safety and relevance'],
    ['Media mix recommendations', 'Prioritize channels and platforms based on reach and engagement.', 'Media planning output'],
    ['Competitive benchmarks', 'Compare the selected audience to the Canadian average and other segments.', 'Context for performance'],
    ['White space opportunities', 'Highlight underserved audiences, emerging communities, or underutilized media channels.', 'New business and strategy input']
  ];

  const comparisonBars = [
    { name: 'Chinese', value: 86, color: '#4f8df7' },
    { name: 'South Asian', value: 92, color: '#a78bfa' },
    { name: 'Filipino', value: 74, color: '#26c6c5' },
    { name: 'Arab', value: 81, color: '#facc60' }
  ];

  return (
    <div className="marketing-masonry">
      <Panel title="Audience opportunity index" meta="Priority score">
        <Gauge value={89} label="Opportunity score" />
        <Divider />
        <MetricGrid rows={opportunityRows} />
      </Panel>
      <Panel title="Opportunity drivers" meta="Score detail">
        <MiniHorizontalBarChart title="Index components" items={opportunityBars} valueSuffix="%" />
      </Panel>

      <Panel title="Media planning recommendations" meta="Activation guidance">
        <CampaignStyleTable columns={['Recommendation', 'Best fit', 'Reason']} rows={planningRows} />
      </Panel>
      <Panel title="Cross-audience comparison" meta="Side-by-side view">
        <CampaignStyleTable columns={['Metric', 'Chinese', 'South Asian', 'Filipino', 'Arab']} rows={comparisonRows} />
        <Divider />
        <MiniHorizontalBarChart title="Audience comparison score" items={comparisonBars} valueSuffix="%" />
      </Panel>

      <Panel title="AI-generated strategic insights" meta="Narrative output">
        <CampaignStyleTable columns={['Insight type', 'Draft output', 'Use case']} rows={aiRows} />
      </Panel>
      <Panel title="Data sources" meta="Evidence layer">
        <CampaignStyleTable columns={['Source', 'Data type', 'Role']} rows={sourceRows} />
      </Panel>
    </div>
  );
}

function ProfileSettingsModal({ user, profile, workspaces, loading, error, saving, success, onRetry, onSave, onClose }) {
  const account = profile || user || {};
  const [name, setName] = useState(account.name || '');
  const workspaceSummary = workspaces.length ? workspaces.map((item) => item.name).join(', ') : 'No active workspaces returned yet.';

  useEffect(() => {
    setName(account.name || '');
  }, [account.name]);

  return (
    <div className="profile-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-settings-title">
        <div className="profile-modal-header">
          <div>
            <div className="profile-modal-eyebrow">Profile settings</div>
            <h2 id="profile-settings-title">Manage your profile</h2>
            <p>Update the name shown in MOSAIQ. Your email address is managed by your agency admin.</p>
          </div>
          <button className="profile-modal-close" type="button" onClick={onClose} aria-label="Close profile settings">×</button>
        </div>

        {loading && <div className="profile-inline-state">Refreshing profile details...</div>}
        {success && (
          <div className="profile-inline-success" role="status">
            <span>✓</span>
            <p>{success}</p>
          </div>
        )}
        {error && (
          <div className="profile-inline-error" role="alert">
            <span>×</span>
            <p>{error}</p>
            <button type="button" onClick={onRetry}>Retry</button>
          </div>
        )}

        <div className="profile-settings-grid compact-profile-grid">
          <label>
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} disabled={loading || saving} maxLength={255} />
          </label>
          <label>
            <span>Email address</span>
            <input value={account.email || ''} readOnly />
          </label>
        </div>

        <div className="profile-workspaces">
          <span>Assigned workspaces</span>
          <p>{workspaceSummary}</p>
        </div>

        <div className="profile-modal-actions">
          <button className="ghost-btn" type="button" onClick={onClose}>Close</button>
          <button className="primary-btn" type="button" onClick={() => onSave(name)} disabled={loading || saving || !name.trim()}>{saving ? 'Saving...' : 'Save changes'}</button>
        </div>
      </section>
    </div>
  );
}
function ChangePasswordModal({ saving, error, success, onSave, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const passwordError = password ? validatePassword(password) : '';
  const confirmationError = passwordConfirmation && password !== passwordConfirmation ? 'Passwords do not match.' : '';

  async function handleSubmit(event) {
    event.preventDefault();
    const ok = await onSave({
      current_password: currentPassword,
      password,
      password_confirmation: passwordConfirmation,
    });
    if (ok) {
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
    }
  }

  return (
    <div className="profile-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="change-password-title">
        <div className="profile-modal-header">
          <div>
            <div className="profile-modal-eyebrow">Account security</div>
            <h2 id="change-password-title">Change password</h2>
            <p>Enter your current password and choose a new secure password.</p>
          </div>
          <button className="profile-modal-close" type="button" onClick={onClose} aria-label="Close change password">×</button>
        </div>

        {success && (
          <div className="profile-inline-success" role="status">
            <span>✓</span>
            <p>{success}</p>
          </div>
        )}
        {error && (
          <div className="profile-inline-error" role="alert">
            <span>×</span>
            <p>{error}</p>
          </div>
        )}

        <form className="change-password-form" onSubmit={handleSubmit}>
          <label>
            <span>Current password</span>
            <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} disabled={saving} autoComplete="current-password" />
          </label>
          <label>
            <span>New password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={saving} autoComplete="new-password" />
            <small className={passwordError ? 'profile-field-error' : 'profile-field-help'}>{passwordError || 'Use 8+ characters with at least one letter and one number.'}</small>
          </label>
          <label>
            <span>Confirm new password</span>
            <input type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} disabled={saving} autoComplete="new-password" />
            {confirmationError ? <small className="profile-field-error">{confirmationError}</small> : null}
          </label>

          <div className="profile-modal-actions change-password-actions">
            <button className="ghost-btn" type="button" onClick={onClose}>Close</button>
            <button className="primary-btn" type="submit" disabled={saving || !currentPassword || !password || !passwordConfirmation || Boolean(passwordError) || Boolean(confirmationError)}>
              {saving ? 'Changing...' : 'Change password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
function HomePage({ workspace, view, compare, range, setRange }) {
  const [trendMetric, setTrendMetric] = useState('conversions');
  const trendMetricLabel = getTrendMetric(trendMetric).label;
  const effectiveView = view;
  const aiSummary = null;  const whatWorkedItems = aiSummary?.what_worked?.length ? aiSummary.what_worked : [
    'Meta Ads video creative for Lunar New Year drove a 2.34% CTR, well above the 1.9% portfolio average, and delivered the lowest CPA of any campaign this month.',
    'Streaming pre-roll for the Latin Heritage campaign produced the highest conversion volume (2,011) at a strong cost efficiency.',
    'Bilingual (Spanish/English) ad copy variants outperformed English-only versions by 18% on CTR across Meta placements.',
    'Programmatic day-parting around evening streaming hours improved viewability for South Asian audience segments.'
  ];
  const didNotWorkItems = aiSummary?.what_did_not_work?.length ? aiSummary.what_did_not_work : [
    'Community Feature (YouTube) underdelivered — CTR of 1.44% and the highest CPA in the portfolio, driven by weak placement targeting.',
    'Ramadan Community Series generated strong reach (8.9M impressions) but a disproportionately low conversion count (476), suggesting a landing page or offer mismatch.',
    'Static creative formats consistently trailed video and carousel formats on engagement across all channels.',
    'Digital direct and audio spend pacing was inconsistent, with two placements running under-delivered for over a week.'
  ];
  const recommendationItems = aiSummary?.recommendations?.length
    ? aiSummary.recommendations.map((item, index) => [String(index + 1), item, 'Recommended for this report setup.', 'AI SUMMARY'])
    : [
      ['1', 'Reallocate 15% of digital direct budget into Meta Ads', 'Shift underperforming channel spend toward the channel with proven efficiency to lift blended ROAS within 30 days.', 'MEDIA BUYING TEAM'],
      ['2', 'Launch the Chinese New Year creative refresh', 'Build a fresh seasonal concept and test new messaging before the next cultural moment flight goes live.', 'ANALYTICS + CREATIVE'],
      ['3', 'Expand bilingual and video creative testing', 'Scale the bilingual ad copy approach and video formats that outperformed to the remaining live campaigns.', 'CREATIVE TEAM'],
      ['4', 'Renegotiate or replace underdelivering digital audio placements', 'Address pacing inconsistencies with the current partner or shift remaining flight to a better-performing channel mix.', 'ACCOUNT DIRECTOR'],
      ['5', 'Tighten targeting for the follow-up community campaign', 'Apply learnings on placement quality before the next cultural moment flight goes live.', 'MEDIA BUYING TEAM']
    ];

  return (
    <>
      <section className="hero-card executive-hero">
        <div className="hero-copy">
          <div className="hero-kicker">AI Summary</div>
          <div className="hero-title">{effectiveView.summary || workspace.summary}</div>
          <p>The data below is prepared from the current report setup and will be connected to public report APIs in the next phase.</p>
        </div>
        <div className="hero-visual">
          <HeroIllustration />
        </div>
        <div className="hero-stat">
          <div className="hero-value">{effectiveView.overview?.roas || workspace.overview.roas}</div>
          <div className="hero-caption">BLENDED ROAS</div>
          <div className="hero-trend">↗ +28% vs prev 30 days</div>
        </div>
      </section>

      <div className="grid-2">
        <ChartPanel
          title={`Spend vs ${trendMetricLabel}`}
          range={range}
          setRange={setRange}
          metric={trendMetric}
          setMetric={setTrendMetric}
        >
          <TrendChart accent={workspace.accent} compare={compare} range={range} metric={trendMetric} series={effectiveView.performanceSeries} />
        </ChartPanel>
        <ChartPanel title="ROAS by Channel" range={range} setRange={setRange}>
          <DonutChart data={workspace.channels} range={range} />
        </ChartPanel>
      </div>
      <div className="grid-2">
        <SummaryCard
          tone="good"
          icon="✓"
          title="AI Insights - What worked"
          items={whatWorkedItems}
        />
        <SummaryCard
          tone="bad"
          icon="⚠"
          title="AI Analysis - What didn't work"
          items={didNotWorkItems}
        />
      </div>
      <SummaryActionCard
        title="AI Recommendations - How to improve ROAS"
        items={recommendationItems}
      />
    </>
  );
}

function DetailedMetricsPage({ workspace, view, range, setRange, campaignSearch, setCampaignSearch }) {
  const [campaignStatus, setCampaignStatus] = useState('All statuses');
  const [campaignChannel, setCampaignChannel] = useState('All channels');
  const [campaignSort, setCampaignSort] = useState('Spend');
  const [trendMetric, setTrendMetric] = useState('conversions');
  const trendMetricLabel = getTrendMetric(trendMetric).label;
  const campaignQuery = campaignSearch.trim().toLowerCase();
  const campaignChannels = Array.from(new Set(workspace.campaigns.map((row) => row[1])));

  const campaignRows = workspace.campaigns
    .filter((row) => {
      const matchesQuery = !campaignQuery || row.some((cell) => String(cell).toLowerCase().includes(campaignQuery));
      const matchesStatus = campaignStatus === 'All statuses' || row[2] === campaignStatus;
      const matchesChannel = campaignChannel === 'All channels' || row[1] === campaignChannel;
      return matchesQuery && matchesStatus && matchesChannel;
    })
    .sort((a, b) => {
      if (campaignSort === 'Conversions') return (parseInt(b[6].replace(/,/g, ''), 10) || 0) - (parseInt(a[6].replace(/,/g, ''), 10) || 0);
      if (campaignSort === 'CTR') return (parseFloat(b[5]) || 0) - (parseFloat(a[5]) || 0);
      if (campaignSort === 'Spend') return (parseInt(b[3].replace(/[$,]/g, ''), 10) || 0) - (parseInt(a[3].replace(/[$,]/g, ''), 10) || 0);
      return a[0].localeCompare(b[0]);
    });

  return (
    <>
      <section className="kpi-row">
        {(view.kpis || workspace.kpis).map(([label, value, delta]) => (
          <MetricCard key={label} label={label} value={value} delta={delta} />
        ))}
      </section>

      <div className="grid-2">
        <section className="panel detailed-metrics-panel">
          <div className="detailed-panel-header">
            <div>
              <h2>Detailed metrics</h2>
            </div>
            <select className="select detailed-range-select" value={range} onChange={(e) => setRange(e.target.value)}>
              {TREND_RANGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="detailed-metrics-table">
            <div className="detailed-metrics-head">
              <span>Metric</span>
              <span>Value</span>
              <span>Status</span>
              <span>Details</span>
            </div>
            {[
            ['Blended ROAS', view.overview.roas, 'Healthy', 'Performing well above target', 'healthy'],
            ['Blended CPA', view.overview.cpa, 'On watch', 'Slightly above target', 'watch'],
            ['Currency', 'CAD', 'Default', 'Account currency', 'default'],
            ['Timezone', workspace.timezone, 'Workspace setting', 'Local timezone', 'workspace-setting']
          ].map(([metric, value, status, details, tone]) => (
            <div className="detailed-metrics-row" key={metric}>
                <div className="detailed-metrics-cell detailed-metrics-label" data-label="Metric">{metric}</div>
                <div className="detailed-metrics-cell detailed-metrics-value" data-label="Value">{value}</div>
                <div className="detailed-metrics-cell" data-label="Status">
                  <span className={`status detailed-status ${tone}`}>{status}</span>
                </div>
                <div className="detailed-metrics-cell detailed-metrics-details" data-label="Details">{details}</div>
              </div>
            ))}
          </div>
        </section>

        <ChartPanel
          title="Performance trend"
          range={range}
          setRange={setRange}
          metric={trendMetric}
          setMetric={setTrendMetric}
          className="detailed-trend-panel"
        >
          <div className="detailed-trend-meta">
            <span className="trend-badge">{`Spend vs ${trendMetricLabel}`}</span>
          </div>
          <TrendChart accent={workspace.accent} compare range={range} metric={trendMetric} />
        </ChartPanel>
      </div>

      <Panel
        title="Active Campaigns"
        meta={`${campaignRows.length} campaign${campaignRows.length === 1 ? '' : 's'}`}
        className="campaigns-panel"
      >
        <div className="campaign-filter-shell">
          <div className="campaign-filter-row">
            <input
              className="search campaign-search"
              placeholder="Search campaigns..."
              value={campaignSearch}
              onChange={(e) => setCampaignSearch(e.target.value)}
            />
            <select className="select campaign-select" value={campaignStatus} onChange={(e) => setCampaignStatus(e.target.value)}>
              <option>All statuses</option>
              <option>Live</option>
              <option>Paused</option>
              <option>Review</option>
              <option>At Risk</option>
            </select>
            <select className="select campaign-select" value={campaignChannel} onChange={(e) => setCampaignChannel(e.target.value)}>
              <option>All channels</option>
              {campaignChannels.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
            <select className="select campaign-select sort-select" value={campaignSort} onChange={(e) => setCampaignSort(e.target.value)}>
              <option>Spend</option>
              <option>CTR</option>
              <option>Conversions</option>
              <option>A-Z</option>
            </select>
          </div>
        </div>
        <div className="campaigns-table">
          <div className="campaigns-head">
            <span>Campaign</span>
            <span>Channel</span>
            <span>Status</span>
            <span>Spend</span>
            <span>Impressions</span>
            <span>CTR</span>
            <span>Conversions</span>
          </div>
          {campaignRows.map((row) => (
            <div className="campaigns-row" key={row[0]}>
              <div className="campaign-cell campaign-name" data-label="Campaign">
                <span className="campaign-title">{row[0]}</span>
              </div>
              <div className="campaign-cell campaign-channel" data-label="Channel">
                {row[1]}
              </div>
              <div className="campaign-cell" data-label="Status">
                <span className={`status campaign-status ${String(row[2]).toLowerCase().replace(/\s+/g, '-')}`}>{row[2]}</span>
              </div>
              <div className="campaign-cell campaign-value" data-label="Spend">
                {row[3]}
              </div>
              <div className="campaign-cell campaign-value" data-label="Impressions">
                {row[4]}
              </div>
              <div className="campaign-cell campaign-value" data-label="CTR">
                {row[5]}
              </div>
              <div className="campaign-cell campaign-value" data-label="Conversions">
                {row[6]}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

function MediaMixModelPage({ workspace }) {
  const [kpi, setKpi] = useState('Revenue');
  const [period, setPeriod] = useState('Weekly');
  const [geography, setGeography] = useState('National');
  const [objective, setObjective] = useState('Measure media effectiveness');
  const [modelRun, setModelRun] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [curveOpen, setCurveOpen] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [lastUpdated, setLastUpdated] = useState('Ready to run');
  const [outcomeHover, setOutcomeHover] = useState(null);
  const [readinessHover, setReadinessHover] = useState(null);
  const [channelHover, setChannelHover] = useState(null);
  const [mechanicHover, setMechanicHover] = useState(null);
  const [scenario, setScenario] = useState('Optimize');
  const [scenarioHover, setScenarioHover] = useState(null);
  const [budget, setBudget] = useState(5000000);
  const [scenarioSpend, setScenarioSpend] = useState({ Social: 1500000, Search: 1250000, OTT: 1250000, Programmatic: 500000, OOH: 500000 });
  const channels = [
    { name: 'Search', spend: '$1.5M', revenue: '$5.2M', share: '43%', roas: '3.5x', saturation: 38, color: '#4f8df7', status: 'Scale' },
    { name: 'Social', spend: '$2.0M', revenue: '$3.6M', share: '30%', roas: '1.8x', saturation: 82, color: '#a78bfa', status: 'Trim' },
    { name: 'OTT / Video', spend: '$1.5M', revenue: '$2.1M', share: '18%', roas: '1.4x', saturation: 54, color: '#facc60', status: 'Room to grow' },
    { name: 'Programmatic', spend: '$1.0M', revenue: '$1.1M', share: '9%', roas: '1.1x', saturation: 67, color: '#26c6c5', status: 'Hold' }
  ];
  const updateScenarioSpend = (channel, value) => setScenarioSpend((current) => ({ ...current, [channel]: Number(value) }));
  const scenarioTotal = Object.values(scenarioSpend).reduce((sum, value) => sum + value, 0);
  const scenarioLift = Math.max(0, Math.round(((scenarioSpend.OTT * 0.00000035) + (scenarioSpend.Search * 0.00000025) - (scenarioSpend.Social * 0.00000008)) * 10) / 10);
  const scenarioRevenue = (20 + scenarioLift).toFixed(1);
  const recommendedMix = optimized ? [['Social', '28%'], ['Search', '27%'], ['OTT / Video', '23%'], ['Programmatic', '12%'], ['OOH', '10%']] : [['Social', '40%'], ['Search', '20%'], ['OTT / Video', '15%'], ['Programmatic', '15%'], ['OOH', '10%']];
  const runModel = () => { setModelRun(true); setLastUpdated('Just updated'); };

  return (
    <div className="mmm-page mmm-reframed">
      <section className="mmm-intro mmm-reframed-hero">
        <div><div className="mmm-kicker">MEDIA MIX MODEL</div><h1>Turn media history into the next best plan</h1><p>One view of what created demand, where spend is nearing its limit, and how the next budget could perform.</p></div>
        <div className="mmm-intro-actions"><div className="mmm-intro-badge"><span className="mmm-status-dot" />Model ready <small>{lastUpdated}</small></div><button className="mmm-primary-btn" type="button" onClick={runModel}><span>↻</span>{modelRun ? 'Model refreshed' : 'Refresh model'}</button></div>
      </section>

      <div className="mmm-reframed-toolbar"><div className="mmm-toolbar-copy"><strong>Vibrant Reach Media</strong><span>Connected data · 26 weeks · 5 channels</span></div><label><span>Outcome</span><select value={kpi} onChange={(e) => setKpi(e.target.value)}><option>Revenue</option><option>Sales</option><option>Leads</option><option>Conversions</option></select></label><label><span>View</span><select value={period} onChange={(e) => setPeriod(e.target.value)}><option>Weekly</option><option>Monthly</option></select></label><label><span>Market</span><select value={geography} onChange={(e) => setGeography(e.target.value)}><option>National</option><option>Regional</option></select></label></div>

      <div className="mmm-reframed-flow"><div className="active"><span>01</span><strong>Build the model</strong><small>Choose what to measure</small></div><div className="active"><span>02</span><strong>Read the result</strong><small>Separate demand from media</small></div><div className="active"><span>03</span><strong>Plan the next dollar</strong><small>Optimize or test a scenario</small></div></div>

      <div className="mmm-reframed-grid mmm-build-grid">
        <section className="mmm-story-card mmm-data-card"><div className="mmm-card-eyebrow">MODEL INPUT</div><h2>The model starts with the data you already have</h2><p>We match campaign activity to a business outcome and clean the common issues before modelling begins.</p><div className="mmm-data-summary"><div><strong>Media activity</strong><span>Spend, impressions, reach, clicks, conversions, channel, campaign, tactic, audience, geography</span></div><div><strong>Business result</strong><span>{kpi}, sales, leads, policies sold, applications, or conversions</span></div><div><strong>Context signals</strong><span>Promotions, price, seasonality, holidays, competitors, events, economic indicators</span></div></div><div className="mmm-file-pills"><span>Excel</span><span>CSV</span><span>Manual entry</span><em>API connection planned for Phase 2</em></div></section>
        <section className="mmm-story-card mmm-readiness-card"><div className="mmm-card-eyebrow">DATA READINESS</div><div className="mmm-readiness-score"><div><strong>98</strong><span>/100</span></div><p>Ready to model<br /><small>High-quality history for this view</small></p></div><div className="mmm-readiness-bars">{[['Completeness','94%','94%','Coverage of required values'],['Time coverage','90%','90%','26 weeks of historical observations'],['Channel consistency','96%','96%','Standardized channel names']].map(([name, value, width, detail]) => <div className="mmm-readiness-bar" key={name} onMouseEnter={() => setReadinessHover({ name, value, detail })} onMouseLeave={() => setReadinessHover(null)}><span>{name}</span><b>{value}</b><i><em className={name.toLowerCase().replace(' ', '-')} style={{ width }} /></i>{readinessHover?.name === name && <div className="mmm-graph-tooltip mmm-readiness-tooltip"><strong>{name}</strong><span>{detail}</span><b>{value}</b></div>}</div>)}</div><p className="mmm-muted-note">Checks include missing dates or spend, duplicate rows, inconsistent names or dates, negative spend, spikes, zeros, and gaps in the time series.</p><button className="mmm-text-btn" type="button" onClick={() => setMappingOpen((value) => !value)}>{mappingOpen ? 'Hide data mapping ↑' : 'Review data mapping →'}</button>{mappingOpen && <div className="mmm-mapping-preview"><div><span>Week</span><b>Date</b></div><div><span>Facebook</span><b>Channel</b></div><div><span>$125,000</span><b>Spend</b></div><div><span>2.4M</span><b>Impressions</b></div><div><span>14,500</span><b>Conversions</b></div></div>}</section>
      </div>

      <section className="mmm-model-strip"><div><span className="mmm-card-eyebrow">MODEL SETTINGS</span><strong>{objective}</strong><small>{period} · {geography} · automatic carryover and saturation curves</small></div><label><span>Objective</span><select value={objective} onChange={(e) => setObjective(e.target.value)}><option>Measure media effectiveness</option><option>Optimize budget</option><option>Forecast results</option></select></label><button className="mmm-primary-btn" type="button" onClick={runModel}><span>→</span>{modelRun ? 'Updated' : 'Run model'}</button></section>

      <section className="mmm-outcome-story"><div className="mmm-outcome-intro"><div className="mmm-card-eyebrow">THE OUTCOME STORY</div><h2>Marketing created $12M of the $50M result</h2><p>The model separates natural demand from the lift created by media, so the business can see what actually moved the outcome.</p></div><div className="mmm-outcome-kpis"><div><span>Baseline demand</span><strong>$38M</strong><small>Would have happened without paid media</small></div><div className="lift"><span>Incremental media impact</span><strong>+$12M</strong><small>24% of total revenue</small></div><div><span>Total revenue</span><strong>$50M</strong><small>Modelled business outcome</small></div></div><div className="mmm-outcome-spotlight"><div className="mmm-outcome-donut-wrap"><div className="mmm-outcome-donut" onMouseLeave={() => setOutcomeHover(null)}><span className="mmm-donut-baseline" onMouseEnter={() => setOutcomeHover({ title: 'Baseline demand', value: '$38M', detail: '76% of total revenue' })} /><span className="mmm-donut-search" onMouseEnter={() => setOutcomeHover({ title: 'Search', value: '$5.2M', detail: '43% of incremental media impact' })} /><span className="mmm-donut-social" onMouseEnter={() => setOutcomeHover({ title: 'Social', value: '$3.6M', detail: '30% of incremental media impact' })} /><span className="mmm-donut-ott" onMouseEnter={() => setOutcomeHover({ title: 'OTT / Video', value: '$2.1M', detail: '18% of incremental media impact' })} /><span className="mmm-donut-programmatic" onMouseEnter={() => setOutcomeHover({ title: 'Programmatic', value: '$1.1M', detail: '9% of incremental media impact' })} /><div className="mmm-donut-center"><strong>$50M</strong><span>Total revenue</span></div></div>{outcomeHover && <div className="mmm-graph-tooltip mmm-outcome-tooltip"><strong>{outcomeHover.title}</strong><span>{outcomeHover.detail}</span><b>{outcomeHover.value}</b></div>}</div><div className="mmm-outcome-breakdown"><div className="mmm-breakdown-heading"><span>Outcome composition</span><small>Hover a segment for details</small></div>{[['Baseline demand','$38M','76%','baseline'],['Search','$5.2M','10.4%','search'],['Social','$3.6M','7.2%','social'],['OTT / Video','$2.1M','4.2%','ott'],['Programmatic','$1.1M','2.2%','programmatic']].map(([name,value,share,tone]) => <div className="mmm-breakdown-row" key={name} onMouseEnter={() => setOutcomeHover({ title: name, value, detail: `${share} of total revenue` })}><i className={tone} /><span>{name}</span><b>{value}</b><small>{share}</small></div>)}</div></div></section>

      <div className="mmm-reframed-grid mmm-diagnosis-grid"><section className="mmm-story-card"><div className="mmm-card-heading"><div><div className="mmm-card-eyebrow">CHANNEL DIAGNOSIS</div><h2>Search is carrying the mix. Social is past its sweet spot.</h2></div><span className="mmm-confidence-pill">High confidence</span></div><div className="mmm-channel-list">{channels.map((channel) => <div className="mmm-channel-line" key={channel.name} onMouseEnter={() => setChannelHover(channel)} onMouseLeave={() => setChannelHover(null)}><div className="mmm-channel-title"><i style={{ background: channel.color }} /><strong>{channel.name}</strong><span>{channel.status}</span></div><div className="mmm-channel-metric"><span><small>Spend</small>{channel.spend}</span><span><small>Incremental revenue</small>{channel.revenue}</span><span><small>Share</small>{channel.share}</span><span><small>ROAS</small><b>{channel.roas}</b></span><span className="mmm-sat-line"><small>Saturation</small><i><em style={{ width: `${channel.saturation}%` }} /></i></span></div>{channelHover?.name === channel.name && <div className="mmm-graph-tooltip mmm-channel-tooltip"><strong>{channel.name}</strong><span>Incremental revenue</span><b>{channel.revenue}</b><span>ROAS {channel.roas} · Saturation {channel.saturation}%</span></div>}</div>)}</div><div className="mmm-roas-explainer"><span><b>Average ROAS</b>What the channel has delivered overall</span><span><b>Marginal ROAS</b>What the next dollar is expected to deliver</span></div></section><section className="mmm-story-card mmm-mechanics-card"><div className="mmm-card-eyebrow">WHY THIS IS MMM</div><h2>Every channel has a different memory and ceiling</h2><div className="mmm-mechanic"><span className="mmm-mechanic-icon">↗</span><div><strong>Carryover</strong><p>Impact fades after a campaign ends. The model estimates the pattern by channel automatically.</p><div className="mmm-mini-decay">{[['Week 1','100%'],['Week 2','60%'],['Week 3','36%'],['Week 4','22%']].map(([week, value]) => <div className="mmm-decay-column" key={week} onMouseEnter={() => setMechanicHover({ week, value })} onMouseLeave={() => setMechanicHover(null)}><i style={{ height: value }} /><span>{week}</span><b>{value}</b></div>)}</div>{mechanicHover && <div className="mmm-graph-tooltip mmm-mechanic-tooltip"><strong>{mechanicHover.week}</strong><span>Estimated carryover impact</span><b>{mechanicHover.value}</b></div>}</div></div><div className="mmm-mechanic"><span className="mmm-mechanic-icon orange">⌁</span><div><strong>Diminishing returns</strong><p>Additional spend helps less once a channel is saturated. Social falls from 4.0x to 1.0x marginal ROAS across the curve.</p><button className="mmm-text-btn" type="button">View response curve →</button></div></div><button className="mmm-details-toggle" type="button" onClick={() => setDetailsOpen((value) => !value)}><span>{detailsOpen ? 'Hide model details' : 'View model details'}</span><span>{detailsOpen ? '⌃' : '⌄'}</span></button>{detailsOpen && <div className="mmm-details"><div><span>Model fit</span><strong>R² 0.89</strong></div><div><span>Observations</span><strong>26 weeks</strong></div><div><span>Carryover</span><strong>Automatic</strong></div><div><span>Controls</span><strong>Seasonality included</strong></div></div>}</section></div>

      <section className="mmm-planning-hero"><div><div className="mmm-card-eyebrow">PLAN THE NEXT DOLLAR</div><h2>Use the model to move budget before performance moves</h2><p>Recommendations balance historical performance, marginal ROAS, saturation, carryover, and the constraints you set.</p></div><div className="mmm-plan-result"><span>Expected upside vs current plan</span><strong>+$1.2M</strong><small>incremental revenue at the same budget</small></div></section>
      <div className="mmm-reframed-grid mmm-planning-grid"><section className="mmm-story-card"><div className="mmm-card-heading"><div><div className="mmm-card-eyebrow">OPTIMIZER</div><h2>Recommended mix for a $5M budget</h2></div><button className="mmm-primary-btn" type="button" onClick={() => setOptimized(true)}><span>→</span>{optimized ? 'Plan updated' : 'Optimize'}</button></div><label className="mmm-budget-control"><span>Total budget</span><input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value) || 0)} /></label><div className="mmm-plan-table"><div><span>Channel</span><b>Current</b><strong>Recommended</strong></div>{[['Social','40%'],['Search','20%'],['OTT / Video','15%'],['Programmatic','15%'],['OOH','10%']].map(([name,current], index) => <div key={name}><span>{name}</span><b>{current}</b><strong>{recommendedMix[index][1]}</strong></div>)}</div><div className="mmm-constraints"><span>Constraints in play</span><b>Social ≥ $500K</b><b>Search ≤ $1.5M</b><b>OTT ≥ $500K</b></div>{optimized && <div className="mmm-live-result">Plan updated: expected ROAS improves from 3.5x to 4.1x.</div>}</section><section className="mmm-story-card"><div className="mmm-card-eyebrow">WHAT-IF PLANNER</div><h2>Try the idea before you buy it</h2><div className="mmm-scenario-select"><label><span>Preset</span><select value={scenario} onChange={(e) => setScenario(e.target.value)}>{['Current Plan','Optimize','Increase Digital','Increase Video/OTT','Increase Social','Conservative','Custom'].map((item) => <option key={item}>{item}</option>)}</select></label><span className="mmm-budget-total">Total budget <b>${(scenarioTotal / 1000000).toFixed(1)}M</b></span></div><div className="mmm-scenario-sliders">{Object.entries(scenarioSpend).map(([name,value]) => <label className={`mmm-scenario-slider mmm-slider-${name.toLowerCase().replace(/[^a-z]/g, '-')}`} key={name} onMouseEnter={() => setScenarioHover({ name, value })} onMouseLeave={() => setScenarioHover(null)}><span><b>{name}</b><em>${(value / 1000000).toFixed(2)}M</em></span><input type="range" min="250000" max="2500000" step="50000" value={value} style={{ '--slider-progress': `${((value - 250000) / 2250000) * 100}%` }} onChange={(e) => updateScenarioSpend(name, e.target.value)} />{scenarioHover?.name === name && <div className="mmm-graph-tooltip mmm-scenario-tooltip"><strong>{name}</strong><span>Scenario allocation</span><b>${(value / 1000000).toFixed(2)}M</b><small>Projected revenue: ${(20 + scenarioLift).toFixed(1)}M</small></div>}</label>)}</div><div className="mmm-scenario-outcomes"><span>Revenue <b>$20M</b><strong>${scenarioRevenue}M</strong></span><span>Incremental revenue <b>$7M</b><strong>${(7 + scenarioLift).toFixed(1)}M</strong></span><span>ROAS <b>3.5x</b><strong>{(3.5 + scenarioLift / 10).toFixed(1)}x</strong></span><span>Conversions <b>110K</b><strong>{Math.round(110 + scenarioLift * 2)}K</strong></span></div></section></div>

      <div className="mmm-reframed-grid mmm-final-grid"><section className="mmm-story-card mmm-ai-card"><div className="mmm-card-eyebrow">AI READOUT</div><h2>Here is what the model wants you to know</h2><div className="mmm-ai-callout"><span>1</span><p><strong>Protect Search.</strong> It is the most efficient channel at 4.2x ROAS and still below its estimated ceiling.</p><button type="button" onClick={() => setAiExplanation('Search has room to scale because its marginal returns remain above the portfolio average.')}>Explain</button></div><div className="mmm-ai-callout"><span>2</span><p><strong>Trim Social.</strong> It receives 35% of investment but contributes 24% of incremental revenue.</p><button type="button" onClick={() => setAiExplanation('Social is beyond its most efficient spending range, so each additional dollar is producing less lift.')}>Explain</button></div><div className="mmm-ai-callout"><span>3</span><p><strong>Give OTT room.</strong> It can take approximately $400K more before marginal returns decline materially.</p><button type="button" onClick={() => setAiExplanation('OTT is under its estimated ceiling and can absorb more budget before saturation becomes a concern.')}>Explain</button></div>{aiExplanation && <div className="mmm-ai-explanation">{aiExplanation}</div>}<div className="mmm-recommendation"><strong>Suggested move: shift about $300K from Social into OTT and Search.</strong><span>At the same total budget, the model estimates approximately +$650K incremental revenue.</span></div></section><section className="mmm-story-card mmm-journey-card"><div className="mmm-card-eyebrow">HOW A PLANNER USES IT</div><h2>From raw data to a defensible decision</h2><div className="mmm-journey-steps">{[['01','Connect','Bring in media and business data'],['02','Check','Fix or accept data issues'],['03','Measure','See baseline, lift, ROAS, and saturation'],['04','Plan','Optimize the mix or save a scenario'],['05','Act','Use the AI explanation with your team']].map(([number,title,body]) => <div key={number}><span>{number}</span><div><strong>{title}</strong><p>{body}</p></div></div>)}</div></section></div>
    </div>
  );
}

function AgencyPage({ active }) {
  return (
    <div className="grid-2">
      <Panel title="Agency rollup" meta="Cross-client overview">
        <MetricStrip
          items={[
            ['Clients', '12'],
            ['Campaigns', '64'],
            ['Monthly spend', active.overview.spend],
            ['Conversions', active.overview.conversions]
          ]}
        />
        <Divider />
        <BarList items={active.channels.map((item) => [item.name, item.value, item.color, item.spend])} />
      </Panel>
      <Panel title="Client health" meta="Workspace directory">
        <StackedCards rows={active.clients} />
      </Panel>
    </div>
  );
}

function ClientsPage({ active }) {
  return (
    <div className="grid-3">
      {active.clients.map(([name, health, note]) => (
        <InfoCard key={name} title={name} badge={health} body={note} />
      ))}
    </div>
  );
}

function CampaignsPage({ active, search, setSearch }) {
  return (
    <>
      <div className="grid-2">
        <Panel title="Campaign explorer" meta="Search, filter, and compare">
          <div className="filter-row">
            <input className="search" placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="ghost-btn">All statuses</button>
            <button className="ghost-btn">Open in report</button>
          </div>
          <DataTable
            columns={['Campaign', 'Channel', 'Status', 'Spend', 'Impressions', 'CTR', 'Conversions']}
            rows={active.campaigns}
          />
        </Panel>
        <Panel title="Funnel view" meta="Stage conversion">
          <FunnelChart />
        </Panel>
      </div>
    </>
  );
}

function PerformancePage({ active, compare }) {
  return (
    <div className="grid-2">
      <Panel title="Performance trend" meta={compare ? 'Compare line enabled' : 'Single line view'}>
        <TrendChart accent={active.accent} compare={compare} />
      </Panel>
      <Panel title="Pivot explorer" meta="Dimension x metric">
        <Heatmap />
      </Panel>
    </div>
  );
}

function MediaPage({ active }) {
  return (
    <div className="channel-page">
      <div className="grid-2 channel-top-grid">
        <section className="panel channel-panel">
          <div className="channel-panel-header">
            <div>
              <h2>Channel ROAS</h2>
              <p>Compare performance across channels</p>
            </div>
            <div className="channel-filter-group">
              <div className="channel-control">
                <select className="select channel-select" defaultValue="Channel performance">
                  <option>Channel performance</option>
                  <option>By spend</option>
                  <option>By ROAS</option>
                </select>
              </div>
            </div>
          </div>
          <BarList items={active.channels.map((item) => [item.name, item.value, item.color, item.spend])} />
          <div className="channel-summary-strip channel-summary-strip-roas">
            <div className="channel-summary-item">
              <div className="channel-summary-icon blue">
                <RoasGlyph src={roasIcon1} />
              </div>
              <div>
                <div className="channel-summary-value">1.74x</div>
                <div className="channel-summary-label">Avg. ROAS</div>
              </div>
            </div>
            <div className="channel-summary-item">
              <div className="channel-summary-icon purple">
                <RoasGlyph src={roasIcon2} />
              </div>
              <div>
                <div className="channel-summary-value">$284.4K</div>
                <div className="channel-summary-label">Total Spend</div>
              </div>
            </div>
            <div className="channel-summary-item">
              <div className="channel-summary-icon lilac">
                <RoasGlyph src={roasIcon3} />
              </div>
              <div>
                <div className="channel-summary-value">+18.6%</div>
                <div className="channel-summary-label">vs prev 30 days</div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel channel-panel">
          <div className="channel-panel-header">
            <div>
              <h2>Budget utilization</h2>
              <p>Track delivery against allocated budget</p>
            </div>
            <div className="channel-filter-group">
              <div className="channel-control">
                <select className="select channel-select" defaultValue="Pacing">
                  <option>Pacing</option>
                  <option>Allocated</option>
                  <option>Remaining</option>
                </select>
                <span className="channel-control-caret">⌄</span>
              </div>
            </div>
          </div>
          <Gauge value={82} label="On pace" totalBudget="$350.0K" spent="$287.0K" />
          <div className="channel-summary-strip budget-strip">
            <div className="channel-summary-item">
              <div className="channel-summary-icon blue">
                <BudgetGlyph name="budget" />
              </div>
              <div>
                <div className="channel-summary-value">$350.0K</div>
                <div className="channel-summary-label">Total Budget</div>
              </div>
            </div>
            <div className="channel-summary-item">
              <div className="channel-summary-icon lilac">
                <BudgetGlyph name="spent" />
              </div>
              <div>
                <div className="channel-summary-value">$287.0K</div>
                <div className="channel-summary-label">Spent</div>
              </div>
            </div>
            <div className="channel-summary-item">
              <div className="channel-summary-icon green">
                <BudgetGlyph name="utilization" />
              </div>
              <div>
                <div className="channel-summary-value">82%</div>
                <div className="channel-summary-label">Utilization</div>
              </div>
            </div>
            <div className="channel-summary-item">
              <div className="channel-summary-icon blue">
                <BudgetGlyph name="status" />
              </div>
              <div>
                <div className="channel-summary-value">On pace</div>
                <div className="channel-summary-label">Delivery status</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="channel-bottom-grid">
        <section className="panel channel-bottom-panel">
          <div className="channel-bottom-left">
            <div className="channel-insight-visual">
              <InsightGlyph />
            </div>
            <div className="channel-insight-copy">
              <h3>Channel performance insights</h3>
              <p>Meta Ads is delivering the highest ROAS at 2.18x, followed by Programmatic.</p>
              <p>Consider rebalancing budget towards high-performing channels.</p>
            </div>
          </div>
          <div className="channel-bottom-divider" />
          <div className="channel-bottom-right">
            <div className="channel-recommendations-copy">
              <h3>Recommendations</h3>
              <List items={['Increase budget allocation for Meta Ads', 'Optimize underperforming digital audio placements']} />
            </div>
            <button className="channel-report-btn" type="button">
              View full report <span>→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function AudiencePage() {
  const [audienceTab, setAudienceTab] = useState('Languages');
  const segments = [
    { name: 'South Asian', value: 30, reach: '2.3M', color: '#ff5b67' },
    { name: 'Chinese', value: 24, reach: '1.9M', color: '#2dc9c7' },
    { name: 'Filipino', value: 18, reach: '1.4M', color: '#ffc53d' },
    { name: 'West Asians', value: 18, reach: '1.3M', color: '#7f5af6' },
    { name: 'Other multicultural', value: 10, reach: '760K', color: '#4f8df7' }
  ];
  const languages = [
    ['HN', 'Hinglish', 14, '#ff5b67', '#fee2e2', '#ef4444'],
    ['TA', 'Tamil', 12, '#2dc9c7', '#e8faf8', '#14b8a6'],
    ['PN', 'Punjabi', 6.4, '#f5b63f', '#fef3c7', '#f59e0b'],
    ['MA', 'Mandarin', 5.1, '#7f5af6', '#ebe5ff', '#6d4df5'],
    ['CN', 'Cantonese', 3.1, '#4f8df7', '#e6efff', '#2563eb'],
    ['TL', 'Tagalog', 2.1, '#ff8e3c', '#ffe9d6', '#f97316']
  ];
  const provincePairs = [
    [['ON', 'Ontario', '38%'], ['NS', 'NS', '5%']],
    [['BC', 'BC', '14%'], ['NB', 'NB', '3%']],
    [['AB', 'AB', '13%'], ['NL', 'NL', '2%']],
    [['QC', 'QC', '11%'], ['PE', 'PE', '1%']],
    [['MB', 'MB', '8%'], ['YT', 'YT', '0.5%']],
    [['SK', 'SK', '6%'], ['Other', 'Other', '2.5%']]
  ];

  const footerLeft = [
    { value: '7.46M', label: 'Total reach', icon: true },
    { value: '100%', label: 'Total share of reach' },
    { value: '+ 12.6%', label: 'vs prev 30 days', tone: 'positive' }
  ];
  const footerRight = [
    { value: '6.82M', label: 'Total audience', icon: true },
    { value: '26', label: 'Languages & regions' },
    { value: '+ 8.9%', label: 'vs prev 30 days', tone: 'positive' }
  ];

  return (
    <div className="audience-page">
      <div className="grid-2 audience-grid">
        <section className="panel audience-panel audience-panel-left">
          <div className="audience-panel-header">
            <div>
              <h2>Audience by cultural segment</h2>
              <p>Distribution of your audience across key cultural segments</p>
            </div>
            <div className="audience-filter-group">
              <div className="audience-select-wrap">
                <select className="select audience-select" defaultValue="Share of reach">
                  <option>Share of reach</option>
                  <option>Reach</option>
                  <option>Growth</option>
                </select>
                
              </div>
            </div>
          </div>

          <div className="audience-segment-card">
            {segments.map((segment) => (
              <div className="audience-segment-row" key={segment.name}>
                <div className="audience-segment-badge" style={{ background: segment.color }}>
                  <AudienceGlyph className="audience-segment-icon" />
                </div>
                <div className="audience-segment-main">
                  <div className="audience-segment-head">
                    <div class="">
                      <div className="audience-segment-name">{segment.name}</div>
                      <div className="audience-segment-track">
                        <div className="audience-segment-fill" style={{ width: `${segment.value}%`, background: segment.color }} />
                      </div>
                    </div>
                    <div className="audience-segment-share">
                      <strong>{segment.value}%</strong>
                      <span>Share of reach</span>
                    </div>
                    <div className="audience-segment-reach">
                      <strong>{segment.reach}</strong>
                      <span>Reach</span>
                    </div>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>

          <div className="audience-footer-strip">
            {footerLeft.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 ? <div className="audience-footer-divider" /> : null}
                <div className={`audience-footer-item ${item.tone ? `audience-footer-${item.tone}` : ''}`}>
                  {item.icon ? (
                    <span className="audience-footer-icon"><AudienceGlyph className="audience-footer-glyph" /></span>
                  ) : null}
                  <div className="audience-footer-copy">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="panel audience-panel">
          <div className="audience-panel-header">
            <div>
              <h2>Language and province mix</h2>
              <p>Understand your audience by language and location</p>
            </div>
            <div className="audience-filter-group">
              <div className="audience-select-wrap">
                <select className="select audience-select" defaultValue="Filterable dimensions">
                  <option>Filterable dimensions</option>
                  <option>Audience mix</option>
                  <option>Location mix</option>
                </select>
              </div>
            </div>
          </div>

          <div className="audience-switcher">
            <button
              className={audienceTab === 'Languages' ? 'audience-switcher-tab active' : 'audience-switcher-tab'}
              type="button"
              onClick={() => setAudienceTab('Languages')}
            >
              <span className="audience-switcher-icon"><LanguageGlyph /></span>
              <span>Languages</span>
            </button>
            <button
              className={audienceTab === 'Provinces' ? 'audience-switcher-tab active' : 'audience-switcher-tab'}
              type="button"
              onClick={() => setAudienceTab('Provinces')}
            >
              <span className="audience-switcher-icon"><ProvinceGlyph /></span>
              <span>Provinces</span>
            </button>
          </div>

          {audienceTab === 'Languages' ? (
            <div className="audience-language-list">
              {languages.map(([code, name, value, barColor, badgeColor, badgeText]) => (
                <div className="audience-language-row" key={name}>
                  <span className="audience-language-badge" style={{ background: badgeColor, color: badgeText }}>
                    {code}
                  </span>
                  <div className="audience-language-name">{name}</div>
                  <div className="audience-language-track">
                    <div className="audience-language-fill" style={{ width: `${value}%`, background: barColor }} />
                  </div>
                  <div className="audience-language-value">{value.toFixed(value % 1 === 0 ? 0 : 1)}%</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="audience-province-list">
              {provincePairs.map(([left, right]) => (
                <div className="audience-province-row" key={`${left[0]}-${right[0]}`}>
                  <div className="audience-province-item">
                    <span className="audience-province-badge">{left[0]}</span>
                    <span className="audience-province-name">{left[1]}</span>
                    <strong>{left[2]}</strong>
                  </div>
                  <div className="audience-province-item">
                    <span className="audience-province-badge">{right[0]}</span>
                    <span className="audience-province-name">{right[1]}</span>
                    <strong>{right[2]}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="audience-footer-strip">
            {footerRight.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 ? <div className="audience-footer-divider" /> : null}
                <div className={`audience-footer-item ${item.tone ? `audience-footer-${item.tone}` : ''}`}>
                  {item.icon ? (
                    <span className="audience-footer-icon"><AudienceGlyph className="audience-footer-glyph" /></span>
                  ) : null}
                  <div className="audience-footer-copy">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function CreativePage({ active, search, setSearch }) {
  const [creativeType, setCreativeType] = useState('All types');
  const [platform, setPlatform] = useState('All platforms');
  const [status, setStatus] = useState('All statuses');
  const [sortBy, setSortBy] = useState('Performance');
  const [viewMode, setViewMode] = useState('grid');

  const items = [
    {
      title: 'Lunar New Year - Family Table video',
      type: 'Video',
      platform: 'Meta',
      status: 'Active',
      ctr: '2.9%',
      ctrValue: 2.9,
      conversions: '842',
      banner: 'Lunar New Year 2025',
      bannerSub: 'Family Table',
      badge: 'LNY'
    },
    {
      title: 'Diwali - carousel ad',
      type: 'Carousel',
      platform: 'Meta',
      status: 'Active',
      ctr: '2.1%',
      ctrValue: 2.1,
      conversions: '511',
      banner: 'Happy Diwali',
      bannerSub: 'Festival of Lights',
      badge: 'D'
    },
    {
      title: 'Chinese New Year - festive story',
      type: 'Story',
      platform: 'Meta',
      status: 'Active',
      ctr: '2.3%',
      ctrValue: 2.3,
      conversions: '364',
      banner: 'Chinese New Year',
      bannerSub: 'Family, fortune, and celebration',
      badge: 'CNY'
    },
    {
      title: 'Latin Heritage - streaming pre-roll',
      type: 'Video',
      platform: 'Programmatic',
      status: 'Active',
      ctr: '2.4%',
      ctrValue: 2.4,
      conversions: '901',
      banner: 'Streaming Pre-roll',
      bannerSub: 'Reach more. Stream more.',
      badge: 'LH'
    },
    {
      title: 'Ramadan - community story ad',
      type: 'Story',
      platform: 'Meta',
      status: 'Active',
      ctr: '1.7%',
      ctrValue: 1.7,
      conversions: '203',
      banner: 'Ramadan',
      bannerSub: 'Together, we give.',
      badge: 'R'
    },
    {
      title: 'Upload new creative',
      type: 'System',
      platform: 'System',
      status: 'Coming soon',
      ctr: 'Coming soon',
      ctrValue: 0,
      conversions: '',
      banner: '',
      bannerSub: '',
      badge: '+'
    }
  ];

  const getCreativeArtwork = (title) => {
    if (title.includes('Chinese New Year')) return publicAsset('creative/chinese-new-year.png');
    if (title.includes('Lunar New Year')) return publicAsset('creative/lunar-new-year.png');
    if (title.includes('Diwali')) return publicAsset('creative/diwali.png');
    if (title.includes('Latin Heritage')) return publicAsset('creative/streaming-pre-roll.png');
    if (title.includes('Ramadan')) return publicAsset('creative/ramadan.png');
    return null;
  };

  const filtered = items
    .filter((item) => {
      const query = search.toLowerCase();
      const matchesQuery = `${item.title} ${item.type} ${item.platform} ${item.status}`.toLowerCase().includes(query);
      const matchesType = creativeType === 'All types' || item.type === creativeType;
      const matchesPlatform = platform === 'All platforms' || item.platform === platform;
      const matchesStatus = status === 'All statuses' || item.status === status;
      return matchesQuery && matchesType && matchesPlatform && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'Performance') return b.ctrValue - a.ctrValue;
      if (sortBy === 'Conversions') return (parseInt(b.conversions || '0', 10) || 0) - (parseInt(a.conversions || '0', 10) || 0);
      if (sortBy === 'Newest') return b.title.localeCompare(a.title);
      return 0;
    });

  return (
    <Panel title="Top performing creative" meta="">
      <div className="creative-toolbar">
        <input className="search creative-search" placeholder="Filter creatives..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select creative-select" value={creativeType} onChange={(e) => setCreativeType(e.target.value)}>
          <option>All types</option>
          <option>Video</option>
          <option>Carousel</option>
          <option>Static</option>
          <option>Story</option>
        </select>
        <select className="select creative-select" value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option>All platforms</option>
          <option>Meta</option>
          <option>Programmatic</option>
          <option>Display</option>
          <option>System</option>
        </select>
        <select className="select creative-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All statuses</option>
          <option>Active</option>
          <option>Coming soon</option>
        </select>
        <select className="select creative-select sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option>Performance</option>
          <option>Conversions</option>
          <option>Newest</option>
        </select>
        <div className="view-switch" aria-label="View mode">
          <button className={viewMode === 'grid' ? 'view-btn active' : 'view-btn'} onClick={() => setViewMode('grid')} type="button">
            ▦
          </button>
          <button className={viewMode === 'list' ? 'view-btn active' : 'view-btn'} onClick={() => setViewMode('list')} type="button">
            ☰
          </button>
        </div>
      </div>
      <div className={viewMode === 'grid' ? 'creative-grid' : 'creative-grid creative-grid-list'}>
        {filtered.map((item) => (
          (() => {
            const artwork = item.status !== 'Coming soon' ? getCreativeArtwork(item.title) : null;
            const isNewYearCreative = item.title.includes('Lunar New Year') || item.title.includes('Chinese New Year');
            const topStyle = artwork && isNewYearCreative ? { backgroundImage: `url(${artwork})` } : undefined;

            return (
          <div
            className={`creative-card ${item.status === 'Coming soon' ? 'creative-card-upload' : ''}`}
            data-creative={item.title}
            key={item.title}
          >
            <div
              className={isNewYearCreative ? 'creative-top creative-top-image' : 'creative-top'}
              data-creative={item.title}
              style={topStyle}
            >
              {item.status !== 'Coming soon' ? (
                isNewYearCreative ? (
                  <img
                    className="creative-banner-image"
                    src={artwork}
                    alt={item.title.includes('Chinese New Year') ? 'Chinese New Year 2025' : 'Lunar New Year 2025'}
                  />
                ) : (
                  <div className="creative-banner">
                    <div className="creative-banner-kicker">{item.banner}</div>
                    <div className="creative-banner-title">{item.bannerSub}</div>
                  </div>
                )
              ) : (
                <div className="creative-upload-hero">
                    <img className="creative-upload-icon" src={publicAsset('creative/upload-placeholder.png')} alt="Upload new creative" />
                  </div>
                )}            </div>            <div className="creative-body">
              <div className="creative-body-head">
                <div
                  className={`creative-avatar ${item.status === 'Coming soon' ? 'creative-avatar-upload' : ''}`}
                  data-creative={item.title}
                >
                  {item.badge}
                </div>
                <div className="creative-body-copy">
                  <div className="creative-title">{item.title}</div>
                  <div className="creative-subtitle">{item.type}</div>
                </div>
                <button className="creative-menu" type="button" aria-label="Creative actions">⋮</button>
              </div>
              {item.status !== 'Coming soon' ? (
                <div className="creative-stats">
                  <div className="creative-stat">
                    <div className="creative-ctr">
                      <span className="ctr-arrow">↑</span>
                      <span>{item.ctr}</span>
                    </div>
                    <div className="creative-stat-label">CTR</div>
                  </div>
                  <div className="creative-stat creative-stat-conv">
                    <div className="creative-stat-value">{item.conversions}</div>
                    <div className="creative-stat-label">Conversions</div>
                  </div>
                  <div className="creative-status-wrap">
                    <span className="creative-status active">
                      <span className="creative-status-check">✓</span>
                      <span>Active</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="creative-upload-footer">
                  <div>
                    <div className="creative-subtitle">System</div>
                    <div className="creative-upload-note">Add a new creative to start tracking performance.</div>
                  </div>
                  <span className="pill creative-coming">Coming soon</span>
                </div>
              )}
            </div>
          </div>
            );
          })()
        ))}
      </div>
    </Panel>
  );
}

function FinancialPage({ active }) {
  return (
    <div className="grid-2">
      <Panel title="Budget pacing" meta="Current month">
        <Gauge value={74} label="74% of budget used" />
      </Panel>
      <Panel title="Financial summary" meta="Spend and billing">
        <MetricStrip items={[['Spend', active.overview.spend], ['CPA', active.overview.cpa], ['CTR', active.overview.ctr], ['ROAS', active.overview.roas]]} />
        <Divider />
        <DataTable
          columns={['Item', 'Amount', 'Status']}
          rows={[
            ['Media budget', '$48,000', 'On pace'],
            ['Creative production', '$8,500', 'Approved'],
            ['Agency fees', '$12,000', 'Hidden from client'],
            ['Invoices', '$21,400', 'Pending review']
          ]}
        />
      </Panel>
    </div>
  );
}

function ForecastPage() {
  return (
    <div className="grid-2">
      <Panel title="Forecast fan chart" meta="P10 to P90">
        <ForecastChart />
      </Panel>
      <Panel title="Scenario planner" meta="Adjust budget assumptions">
        <List items={[
          'Base case keeps ROAS near 3.2x.',
          'Shifting 15% from digital audio to Meta improves CPA.',
          'Seasonal surge around cultural moments improves forecast confidence.'
        ]} />
      </Panel>
    </div>
  );
}

function InsightsPage() {
  return (
    <div className="grid-2">
      <Panel title="AI insights" meta="Recommendation feed">
        <InsightFeed />
      </Panel>
      <Panel title="Next best actions" meta="Prioritized actions">
        <List items={[
          'Reallocate 15% of digital direct budget into Meta Ads.',
          'Refresh Ramadan landing page offer.',
          'Expand bilingual creative testing.'
        ]} />
      </Panel>
    </div>
  );
}

function ReportsPage({ search, setSearch }) {
  const [reportType, setReportType] = useState('All types');
  const [frequency, setFrequency] = useState('All frequencies');
  const [status, setStatus] = useState('All statuses');
  const [sortBy, setSortBy] = useState('Recently updated');
  const [viewMode, setViewMode] = useState('list');

  const reports = [
    {
      name: 'Monthly Performance Summary',
      description: 'Comprehensive overview of key performance metrics, trends, and insights.',
      type: 'Auto-generated',
      frequency: 'Monthly',
      lastRun: 'Jun 1, 2025',
      icon: 'sparkles',
      color: '#8b5cf6',
      tone: 'purple'
    },
    {
      name: 'Cultural Segment Deep Dive',
      description: 'Detailed analysis of audience segments by culture and demographics.',
      type: 'Scheduled',
      frequency: 'One-time',
      lastRun: 'May 20, 2025',
      icon: 'calendar',
      color: '#2dc9c7',
      tone: 'blue'
    },
    {
      name: 'Channel Spend Reconciliation',
      description: 'Weekly reconciliation of ad spend across all marketing channels.',
      type: 'Recurring',
      frequency: 'Weekly',
      lastRun: 'May 16, 2025',
      icon: 'refresh',
      color: '#f59e0b',
      tone: 'green'
    },
    {
      name: 'Creative Performance Export',
      description: 'Export of creative performance metrics and asset-level insights.',
      type: 'On demand',
      frequency: 'On demand',
      lastRun: 'May 12, 2025',
      icon: 'bolt',
      color: '#a855f7',
      tone: 'purple'
    }
  ];

  const filtered = reports.filter((item) => {
    const query = search.toLowerCase();
    const matchesQuery = `${item.name} ${item.description} ${item.type} ${item.frequency} ${item.status}`.toLowerCase().includes(query);
    const matchesType = reportType === 'All types' || item.type === reportType;
    const matchesFrequency = frequency === 'All frequencies' || item.frequency === frequency;
    const matchesStatus = status === 'All statuses' || item.status === status;
    return matchesQuery && matchesType && matchesFrequency && matchesStatus;
  });

  const stats = [
    { value: '12', label: 'Saved reports', icon: 'document', color: '#7c6bf6', soft: '#ebe8ff' },
    { value: '6', label: 'Scheduled reports', icon: 'clock', color: '#f59e0b', soft: '#fff2da' },
    { value: '4', label: 'On demand reports', icon: 'bolt', color: '#8b5cf6', soft: '#efe6ff' },
    { value: '22', label: 'Total reports', icon: 'check', color: '#16a34a', soft: '#e9f8ec' }
  ];

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Reports</h1>
          <p>Access your saved reports or schedule new ones to stay on top of performance.</p>
        </div>
        <button className="reports-create-btn" type="button">
          <ReportGlyph name="plus" />
          <span>Create new report</span>
        </button>
      </div>

      <div className="reports-stats-grid">
        {stats.map((stat) => (
          <div className="report-stat-card" key={stat.label}>
            <div className="report-stat-icon" style={{ color: stat.color, background: stat.soft }}>
              <ReportGlyph name={stat.icon} />
            </div>
            <div className="report-stat-copy">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="reports-toolbar">
        <div className="reports-search">
          <ReportGlyph name="search" className="reports-search-icon" />
          <input className="reports-search-input" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="reports-filter">          
          <select className="select reports-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option>All types</option>
            <option>Auto-generated</option>
            <option>Scheduled</option>
            <option>Recurring</option>
            <option>On demand</option>
          </select>
        </div>

        <div className="reports-filter">          
          <select className="select reports-select" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option>All frequencies</option>
            <option>Monthly</option>
            <option>Weekly</option>
            <option>One-time</option>
            <option>On demand</option>
          </select>
        </div>

        <div className="reports-filter">
          <select className="select reports-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All statuses</option>
            <option>Active</option>
            <option>Scheduled</option>
            <option>Ready</option>
          </select>
        </div>

        <button className="reports-clear-btn" type="button" onClick={() => { setSearch(''); setReportType('All types'); setFrequency('All frequencies'); setStatus('All statuses'); }}>
          <ReportGlyph name="refresh" />
          <span>Clear filters</span>
        </button>

        <div className="reports-sort-wrap">
          <select className="select reports-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option>Recently updated</option>
            <option>Alphabetical</option>
            <option>Last run</option>
          </select>
        </div>
      </div>

          <div className="reports-table-wrap">
        <div className="reports-table-header">
          <div>Report name</div>
          <div>Type</div>
          <div>Frequency</div>
          <div>Last run</div>
          <div />
        </div>

        <div className="reports-table">
          {filtered.map((item) => (
            <div className="report-row report-row-compact" key={item.name}>
              <div className="report-name-cell">
                <div className={`report-row-icon report-row-icon-${item.tone}`}>
                  <ReportGlyph name={item.icon} />
                </div>
                <div className="report-name-copy">
                  <strong>{item.name}</strong>
                  <span>{item.description}</span>
                </div>
              </div>
              <div className="report-type-cell">
                <span className="report-type-mark">
                  <ReportGlyph name={item.icon === 'bolt' ? 'bolt' : item.icon} />
                </span>
                <span>{item.type}</span>
              </div>
              <div className="report-cell">{item.frequency}</div>
              <div className="report-cell">{item.lastRun}</div>              
              <div className="report-actions">
                <button className="report-icon-btn" type="button" aria-label="Download report">
                  <ReportGlyph name="download" />
                </button>
                <button className="report-icon-btn" type="button" aria-label="More actions">
                  <ReportGlyph name="more" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketingOverviewPage({ active }) {
  return (
    <div className="grid-2">
      <Panel title="Market overview" meta="Research snapshot">
        <MetricStrip
          items={[
            ['Demo agencies', '3'],
            ['Clients', '12'],
            ['Campaigns', '64'],
            ['Cultural moments', '8']
          ]}
        />
        <Divider />
        <List items={[
          'Seeded research data gives the client something realistic to review.',
          'The workspace switcher changes the market view and values.',
          'Use this section to validate the research side of the scope.'
        ]} />
      </Panel>
      <Panel title="Cultural signal mix" meta="Audience reach">
        <StackedPillBar items={active.audience} />
      </Panel>
    </div>
  );
}

function MarketSignalsPage() {
  return (
    <div className="grid-2">
      <Panel title="Market signals" meta="Trend detection">
        <InsightFeed />
      </Panel>
      <Panel title="Opportunity score" meta="A simple working indicator">
        <Gauge value={67} label="Research momentum" />
      </Panel>
    </div>
  );
}

function CompetitorLandscapePage() {
  return (
    <div className="grid-2">
      <Panel title="Competitor landscape" meta="Who is active in the category">
        <DataTable
          columns={['Competitor', 'Share', 'Signal', 'Position']}
          rows={[
            ['Rival One', '28%', 'Strong', 'Leader'],
            ['Rival Two', '21%', 'Rising', 'Challenger'],
            ['Rival Three', '16%', 'Flat', 'Follower'],
            ['Your client', '35%', 'Strong', 'Leader']
          ]}
        />
      </Panel>
      <Panel title="Share of voice" meta="Mock comparison">
        <BarList
          items={[
            ['Your client', 35, '#4f8df7', 'Primary'],
            ['Rival One', 28, '#a78bfa', 'Primary'],
            ['Rival Two', 21, '#facc60', 'Primary'],
            ['Rival Three', 16, '#26c6c5', 'Primary']
          ]}
          suffix="%"
        />
      </Panel>
    </div>
  );
}

function AudienceResearchPage({ active }) {
  return (
    <div className="grid-2">
      <Panel title="Audience research" meta="Segments and language">
        <StackedPillBar items={active.audience} />
      </Panel>
      <Panel title="Language reach" meta="What people respond to">
        <MetricGrid rows={active.languages.map(([name, value]) => [name, `${value.toFixed(1)}%`])} />
      </Panel>
    </div>
  );
}

function CulturalCalendarPage() {
  return (
    <div className="grid-2">
      <Panel title="Cultural calendar" meta="Upcoming moments">
        <StackedCards
          rows={[
            ['Diwali', 'Healthy', 'High seasonal impact'],
            ['Lunar New Year', 'Healthy', 'Strong family-oriented response'],
            ['Ramadan', 'Watch', 'Conversion opportunity'],
            ['Community Launch', 'Review', 'Creative refresh recommended']
          ]}
        />
      </Panel>
      <Panel title="Calendar notes" meta="Planning prompts">
        <List items={[
          'Plan creative 3-4 weeks before major cultural moments.',
          'Adjust language mix by province and client workspace.',
          'Use previous performance to guide budget pacing.'
        ]} />
      </Panel>
    </div>
  );
}

function OpportunityFinderPage() {
  return (
    <div className="grid-2">
      <Panel title="Opportunity finder" meta="What to do next">
        <List items={[
          'Shift spend to the channels already beating target.',
          'Expand bilingual and localized creative testing.',
          'Build a deeper report narrative for senior clients.'
        ]} />
      </Panel>
      <Panel title="Scorecard" meta="Simple prioritization">
        <MetricGrid rows={[
          ['Efficiency', 'High'],
          ['Reach', 'High'],
          ['Creative freshness', 'Medium'],
          ['Budget risk', 'Low']
        ]} />
      </Panel>
    </div>
  );
}

function OperationsPage() {
  return (
    <div className="grid-2">
      <Panel title="Integration health" meta="Mock connectors">
        <StatusList items={[
          ['Google Ads', 'Healthy'],
          ['Meta', 'Healthy'],
          ['DV360', 'Warning'],
          ['GA4', 'Healthy'],
          ['Sheets import', 'Delayed']
        ]} />
      </Panel>
      <Panel title="Alert center" meta="Risk and opportunity">
        <List items={[
          'CTR drop detected on one programmatic segment.',
          'Budget pacing is behind on digital direct and audio.',
          'Landing page mismatch likely reduces conversions.'
        ]} />
      </Panel>
    </div>
  );
}

function SettingsPage({ theme, setTheme }) {
  return (
    <div className="grid-2">
      <Panel title="Branding and preferences" meta="White-label controls">
        <MetricGrid rows={[
          ['Brand color', 'Indigo'],
          ['Timezone', 'Per workspace'],
          ['Currency', 'CAD'],
          ['Theme', theme]
        ]} />
        <button className="ghost-btn full" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          Switch theme
        </button>
      </Panel>
      <Panel title="Permissions matrix" meta="Role-based access">
        <PermissionGrid />
      </Panel>
    </div>
  );
}

function AssistantPage() {
  return (
    <div className="grid-2">
      <Panel title="AI assistant" meta="Full-page chat">
        <ChatMock />
      </Panel>
      <Panel title="Suggested prompts" meta="Ready to ask">
        <List items={[
          'Summarize why CPA improved this month.',
          'Show underperforming channels by workspace.',
          'Generate a report narrative for senior clients.'
        ]} />
      </Panel>
    </div>
  );
}

function AdminPage() {
  return (
    <div className="grid-2">
      <Panel title="Admin panel" meta="Users, agencies, workspaces, flags">
        <MetricGrid rows={[
          ['Agencies', '3'],
          ['Workspaces', '12'],
          ['Roles', '10'],
          ['Feature flags', '8']
        ]} />
        <Divider />
        <StatusList items={[
          ['Owner', 'Active'],
          ['Agency Admin', 'Active'],
          ['Client', 'Read only'],
          ['Analyst', 'Active']
        ]} />
      </Panel>
      <Panel title="Audit log" meta="Recent changes">
        <List items={[
          'Workspace permissions updated for Northstar Agency.',
          'Theme preference changed to light mode.',
          'Report schedule created for monthly summary.'
        ]} />
      </Panel>
    </div>
  );
}

function AuthScreen({ theme, setTheme, authMode, setAuthMode, onEnter }) {
  return (
    <div className={`auth-shell ${theme}`}>
      <div className="auth-card">
        <div className="brand compact-brand">
          <div className="brand-mark">M</div>
          <div>
            <div className="brand-name">MOSAIQ</div>
            <div className="brand-sub">Multicultural marketing intelligence</div>
          </div>
        </div>
        <div className="auth-tabs">
          <button className={authMode === 'sign in' ? 'tab active' : 'tab'} onClick={() => setAuthMode('sign in')}>
            Sign in
          </button>
          <button className={authMode === 'sign up' ? 'tab active' : 'tab'} onClick={() => setAuthMode('sign up')}>
            Sign up
          </button>
        </div>
        <input className="search" placeholder="Email address" />
        <input className="search" placeholder="Password" type="password" />
        <button className="primary-btn" onClick={onEnter}>
          Enter demo
        </button>
        <div className="auth-links">
          <button className="ghost-btn full" onClick={onEnter}>
            Skip to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingScreen({ onContinue, onBack }) {
  return (
    <div className="auth-shell onboarding">
      <div className="auth-card wide">
        <h2>Onboarding checklist</h2>
        <List items={[
          'Connect a source',
          'Invite the team',
          'Create the first report',
          'Set client timezone and currency'
        ]} />
        <div className="row-actions">
          <button className="ghost-btn" onClick={onBack}>Back</button>
          <button className="primary-btn" onClick={onContinue}>Continue to demo</button>
        </div>
      </div>
    </div>
  );
}

function CommandPalette({ pages, search, setSearch, onClose, onSelect }) {
  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type to jump to a page..." autoFocus />
        <div className="palette-list">
          {pages.map((item) => (
            <button key={item.name} className="palette-item" onClick={() => onSelect(item.name)}>
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, meta, className = '', children }) {
  return (
    <section className={`panel ${className}`.trim()}>
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
        </div>
        {meta ? <span className="panel-meta">{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, delta }) {
  const metricThemes = {
    'Total Spend': { accent: '#0f6bff', soft: 'rgba(15, 107, 255, 0.14)', border: 'rgba(15, 107, 255, 0.28)' },
    Impressions: { accent: '#8b5cf6', soft: 'rgba(139, 92, 246, 0.14)', border: 'rgba(139, 92, 246, 0.28)' },
    'Avg. CTR': { accent: '#12b76a', soft: 'rgba(18, 183, 106, 0.14)', border: 'rgba(18, 183, 106, 0.28)' },
    Conversions: { accent: '#f97316', soft: 'rgba(249, 115, 22, 0.14)', border: 'rgba(249, 115, 22, 0.28)' },
    'Blended CPA': { accent: '#06b6d4', soft: 'rgba(6, 182, 212, 0.14)', border: 'rgba(6, 182, 212, 0.28)' },
    ROAS: { accent: '#64748b', soft: 'rgba(100, 116, 139, 0.14)', border: 'rgba(100, 116, 139, 0.28)' }
  };
  const iconKey =
    label === 'Total Spend'
      ? 'spend'
      : label === 'Impressions'
        ? 'impressions'
        : label === 'Avg. CTR'
          ? 'ctr'
          : label === 'Conversions'
            ? 'conversions'
            : label === 'Blended CPA'
              ? 'cpa'
              : 'roas';

  const theme = metricThemes[label] || metricThemes.ROAS;
  const isNegative = String(delta).trim().startsWith('-');
  const deltaClass = isNegative ? 'negative' : 'positive';
  const deltaArrow = isNegative ? '↓' : '↑';
  const sparkSeriesByLabel = {
    'Total Spend': [12, 13, 15, 14, 16, 17, 16, 18, 19, 20],
    Impressions: [22, 24, 27, 26, 28, 30, 29, 31, 30, 32],
    'Avg. CTR': [1.1, 1.2, 1.3, 1.25, 1.4, 1.36, 1.45, 1.42, 1.5, 1.56],
    Conversions: [82, 88, 84, 90, 94, 92, 96, 99, 98, 104],
    'Blended CPA': [44, 45, 46, 47, 48, 49, 50, 51, 52, 53],
    ROAS: [2.9, 3, 3.1, 3, 3.2, 3.3, 3.2, 3.4, 3.3, 3.5]
  };
  const baseSpark = sparkSeriesByLabel[label] || sparkSeriesByLabel.ROAS;
  const sparkValues = isNegative ? [...baseSpark].reverse() : baseSpark;

  return (
    <div
      className="metric-card"
      style={{
        '--metric-accent': theme.accent,
        '--metric-soft': theme.soft,
        '--metric-border': theme.border
      }}
    >
      <div className="metric-card-icon">
        <MetricIcon name={iconKey} />
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className={`metric-delta ${deltaClass}`}>
        <span className="metric-delta-arrow">{deltaArrow}</span>
        <span>{delta} vs prior</span>
      </div>
      <MiniSparkline color={theme.accent} label={label} values={sparkValues} />
    </div>
  );
}

function MiniSparkline({ color, label, values }) {
  const wrapRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const w = 220;
  const h = 42;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i) => pad + (i / (values.length - 1)) * (w - pad * 2);
  const y = (v) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  const formatValue = (v) => {
    if (label === 'Avg. CTR') return `${v.toFixed(2)}%`;
    if (label === 'Blended CPA') return `$${v.toFixed(2)}`;
    if (label === 'Impressions') return `${v.toFixed(1)}M`;
    if (label === 'Total Spend') return `$${v.toFixed(1)}K`;
    if (label === 'Conversions') return `${Math.round(v)}`;
    if (label === 'ROAS') return `${v.toFixed(1)}x`;
    return String(v);
  };

  const handleMove = (index, event) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHovered({
      index,
      value: values[index],
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  return (
    <div className="metric-spark-wrap" ref={wrapRef}>
      <svg className="metric-spark" viewBox={`0 0 ${w} ${h}`} aria-label={`${label} trend`}>
        <path d={path} className="metric-spark-line" style={{ stroke: color }} />
        {values.map((v, i) => (
          <circle
            key={`${label}-${i}`}
            cx={x(i)}
            cy={y(v)}
            r="2.8"
            className="metric-spark-dot"
            style={{ stroke: color }}
            onMouseEnter={(event) => handleMove(i, event)}
            onMouseMove={(event) => handleMove(i, event)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>
      {hovered && (
        <div className="spark-tooltip" style={{ left: hovered.x + 10, top: hovered.y - 44 }}>
          <div className="spark-tooltip-title">{label}</div>
          <strong>{formatValue(hovered.value)}</strong>
        </div>
      )}
    </div>
  );
}

function MetricStrip({ items }) {
  return (
    <div className="metric-strip">
      {items.map(([label, value]) => (
        <div key={label} className="metric-strip-item">
          <div className="metric-label">{label}</div>
          <div className="metric-strip-value">{value}</div>
        </div>
      ))}
    </div>
  );
}

function ActionList({ items }) {
  return (
    <div className="action-list">
      {items.map(([step, title, body, owner]) => (
        <div className="action-row" key={step}>
          <div className="action-step">{step}</div>
          <div className="action-content">
            <div className="action-title">{title}</div>
            <div className="action-body">{body}</div>
          </div>
          <div className="action-owner">OWNER: {owner}</div>          
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ tone, icon, title, items }) {
  return (
    <section className={`summary-card summary-${tone}`}>
      <div className="summary-header">
        <div className="summary-badge">{icon}</div>
        <h3>{title}</h3>
      </div>
      <div className="summary-panel">
        {items.map((item, index) => (
          <div className="summary-item" key={`${tone}-${index}`}>
            <span className={`summary-bullet ${tone === 'good' ? 'summary-bullet-good' : 'summary-bullet-bad'}`}>
              {tone === 'good' ? <CheckBadgeGlyph /> : <CrossBadgeGlyph />}
            </span>
            <span className="summary-text">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryActionCard({ title, items }) {
  return (
    <section className="summary-card summary-action-card">
      <div className="summary-header summary-header-flat">
        <h3>{title}</h3>
      </div>
      <ActionList items={items} />
    </section>
  );
}

function ChartPanel({ title, range, setRange, metric, setMetric, className = '', children }) {
  return (
    <section className={`panel chart-card ${className}`.trim()}>
      <div className="chart-card-header">
        <h2>{title}</h2>
        <div className="chart-card-controls">
          {metric && setMetric ? (
            <select className="select chart-select trend-metric-select" value={metric} onChange={(e) => setMetric(e.target.value)}>
              {TREND_METRIC_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.dropdownLabel}
                </option>
              ))}
            </select>
          ) : null}
          <select className="select chart-select" value={range} onChange={(e) => setRange(e.target.value)}>
            {TREND_RANGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="chart-card-body">{children}</div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <img className="hero-illustration" src={publicAsset('hero/executive-summary.png')} alt="" aria-hidden="true" />
  );
}

function MetricGrid({ rows }) {
  return (
    <div className="metric-grid">
      {rows.map(([label, value]) => (
        <div key={label} className="metric-grid-row">
          <span className="metric-grid-label">{label}</span>
          <strong className="metric-grid-value">{value}</strong>
        </div>
      ))}
    </div>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="table">
      <div className="table-row table-head">
        {columns.map((column) => (
          <div key={column}>{column}</div>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row[0]} className="table-row">
          {row.map((cell, index) => (
            <div key={`${row[0]}-${index}`}>{cell}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function CampaignStyleTable({ columns, rows, className = '' }) {
  const template =
    columns.length === 1
      ? 'minmax(0, 1fr)'
      : columns
          .map((_, index) => {
            if (index === 0) return 'minmax(180px, 1.4fr)';
            if (index === 1) return 'minmax(120px, 1fr)';
            return 'minmax(110px, 0.9fr)';
          })
          .join(' ');

  return (
    <div className={`campaigns-table ${className}`.trim()}>
      <div className="campaigns-head" style={{ gridTemplateColumns: template }}>
        {columns.map((column) => (
          <div key={column}>{column}</div>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row[0]} className="campaigns-row" style={{ gridTemplateColumns: template }}>
          {row.map((cell, index) => (
            <div
              key={`${row[0]}-${index}`}
              className={`campaign-cell ${index === 0 ? 'campaign-name' : ''} ${index === 1 ? 'campaign-channel' : ''} ${index > 1 ? 'campaign-value' : ''}`.trim()}
              data-label={columns[index] || `Column ${index + 1}`}
            >
              {index === 0 ? <span className="campaign-title">{cell}</span> : cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function MiniHorizontalBarChart({ title, items, valueSuffix = '%', className = '' }) {
  const max = Math.max(...items.map((item) => item.value));
  return (
    <div className={`mini-chart mini-horizontal-chart ${className}`.trim()}>
      {title ? <div className="mini-chart-title">{title}</div> : null}
      <div className="mini-horizontal-list">
        {items.map((item) => (
          <div className="mini-horizontal-row" key={item.name}>
            <div className="mini-horizontal-label">{item.name}</div>
            <div className="mini-horizontal-track">
              <div
                className="mini-horizontal-fill"
                style={{ width: `${(item.value / max) * 100}%`, background: item.color || '#4f8df7' }}
              />
            </div>
            <div className="mini-horizontal-value">
              {typeof item.value === 'number' && Number.isInteger(item.value) ? item.value : item.value}
              {valueSuffix}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniDonutChart({ title, items, centerLabel, centerValue }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const size = 220;
  const center = size / 2;
  const radius = 70;
  const stroke = 28;
  let start = 0;

  return (
    <div className="mini-chart mini-donut-chart">
      {title ? <div className="mini-chart-title">{title}</div> : null}
      <div className="mini-donut-layout">
        <svg viewBox={`0 0 ${size} ${size}`} className="mini-donut-svg" aria-label={title || centerLabel || 'Donut chart'}>
          <circle cx={center} cy={center} r={radius} className="mini-donut-track" />
          {items.map((item) => {
            const share = item.value / total;
            const dash = `${share * 2 * Math.PI * radius} ${2 * Math.PI * radius}`;
            const circle = (
              <circle
                key={item.name}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.color || '#4f8df7'}
                strokeWidth={stroke}
                strokeDasharray={dash}
                strokeDashoffset={-start * 2 * Math.PI * radius}
                transform={`rotate(-90 ${center} ${center})`}
                className="mini-donut-segment"
              />
            );
            start += share;
            return circle;
          })}
          <text x={center} y={center - 4} textAnchor="middle" className="mini-donut-value">
            {centerValue}
          </text>
          <text x={center} y={center + 16} textAnchor="middle" className="mini-donut-label">
            {centerLabel}
          </text>
        </svg>
        <div className="mini-donut-legend">
          {items.map((item) => (
            <div className="mini-donut-legend-row" key={item.name}>
              <span className="legend-dot" style={{ background: item.color || '#4f8df7' }} />
              <span>{item.name}</span>
              <strong>{item.value}%</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniLineChart({ title, points, xLabel, yLabel }) {
  const width = 320;
  const height = 180;
  const padding = 24;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (index) => padding + (index / (points.length - 1 || 1)) * (width - padding * 2);
  const y = (value) => padding + (1 - (value - min) / (max - min || 1)) * (height - padding * 2);
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.value)}`).join(' ');

  return (
    <div className="mini-chart mini-line-chart">
      {title ? <div className="mini-chart-title">{title}</div> : null}
      <svg viewBox={`0 0 ${width} ${height}`} className="mini-line-svg" aria-label={title || 'Line chart'}>
        <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} className="mini-axis" />
        <line x1={padding} x2={padding} y1={padding} y2={height - padding} className="mini-axis" />
        <path d={path} className="mini-line-path" />
        {points.map((point, index) => (
          <circle
            key={point.name}
            cx={x(index)}
            cy={y(point.value)}
            r="3.5"
            className="mini-line-dot"
            style={{ fill: point.color || '#4f8df7' }}
          />
        ))}
        {points.map((point, index) => (
          <text key={`${point.name}-x`} x={x(index)} y={height - 8} textAnchor="middle" className="mini-axis-label">
            {point.name}
          </text>
        ))}
        <text x={12} y={18} className="mini-axis-title">
          {yLabel}
        </text>
        <text x={width - padding} y={18} textAnchor="end" className="mini-axis-title">
          {xLabel}
        </text>
      </svg>
    </div>
  );
}

function BarList({ items }) {
  const max = Math.max(...items.map((item) => item[1]));
  const wrapRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const onHover = (item, event) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHovered({
      item,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  return (
    <div className="bar-list channel-roas-list" ref={wrapRef}>
      {items.map(([name, value, color, spend]) => (
        <div key={name} className="channel-roas-row">
          <div className="channel-roas-left">
            <div className="channel-roas-icon" style={{ color }}>
              <ChannelGlyph name={name} />
            </div>
            <div className="channel-roas-body">
              <div className="channel-roas-name">{name}</div>
              <div
                className="channel-roas-track"
                onMouseEnter={(event) => onHover([name, value, color, spend], event)}
                onMouseMove={(event) => onHover([name, value, color, spend], event)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
                </div>
              </div>
            </div>
          </div>
          <div className="channel-roas-spend">
            <div className="channel-roas-spend-value" style={{ color }}>
              {spend}
            </div>
            <div className="channel-roas-spend-label">Total Spend</div>
          </div>
          <div className="channel-roas-pill">
            <div className="channel-roas-pill-value">{value.toFixed(2)}x</div>
            <div className="channel-roas-pill-label">ROAS</div>
          </div>
        </div>
      ))}
      {hovered && (
        <div className="chart-tooltip channel-tooltip" style={{ left: hovered.x + 12, top: hovered.y + 10 }}>
          <div className="chart-tooltip-title">{hovered.item[0]}</div>
          <div className="chart-tooltip-row">
            <span>ROAS</span>
            <strong>{hovered.item[1].toFixed(2)}x</strong>
          </div>
          <div className="chart-tooltip-row">
            <span>Spend</span>
            <strong>{hovered.item[3]}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function StackedCards({ rows }) {
  return (
    <div className="stack-list">
      {rows.map(([title, badge, meta]) => (
        <div className="stack-row" key={title}>
          <div>
            <div className="stack-title">{title}</div>
            <div className="stack-meta">{meta}</div>
          </div>
          <span className={`status ${badge.toLowerCase().replace(/\s+/g, '-')}`}>{badge}</span>
        </div>
      ))}
    </div>
  );
}

function InfoCard({ title, badge, body }) {
  return (
    <div className="info-card">
      <div className="stack-title">{title}</div>
      <div className="stack-meta">{body}</div>
      <div className={`status ${badge.toLowerCase().replace(/\s+/g, '-')}`}>{badge}</div>
    </div>
  );
}

function Divider() {
  return <div className="divider" />;
}

function List({ items }) {
  return (
    <div className="list">
      {items.map((item) => (
        <div className="list-item" key={item}>
          <span className="list-bullet">
            <CheckBadgeGlyph />
          </span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function StatusList({ items }) {
  return (
    <div className="status-list">
      {items.map(([label, status]) => (
        <div className="status-row" key={label}>
          <span>{label}</span>
          <span className={`status ${status.toLowerCase()}`}>{status}</span>
        </div>
      ))}
    </div>
  );
}

function Heatmap({ rows: inputRows, cols: inputCols, values: inputValues, title }) {
  const rows = inputRows || ['Meta', 'Search', 'Social', 'Digital Audio'];
  const cols = inputCols || ['English', 'Spanish', 'Punjabi', 'French'];
  const values = inputValues || [
    [8, 5, 4, 3],
    [7, 4, 6, 2],
    [9, 6, 3, 4],
    [4, 3, 2, 2]
  ];
  return (
    <div className="heatmap">
      {title ? <div className="mini-chart-title">{title}</div> : null}
      <div className="heatmap-grid heatmap-head">
        <div />
        {cols.map((col) => (
          <div key={col}>{col}</div>
        ))}
      </div>
      {rows.map((row, rIndex) => (
        <div className="heatmap-grid" key={row}>
          <div className="heatmap-row-label">{row}</div>
          {values[rIndex].map((value, cIndex) => (
            <div key={`${row}-${cIndex}`} className="heat-cell" style={{ opacity: 0.25 + value / 10 }}>
              {value}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Gauge({ value, label, totalBudget, spent }) {
  const wrapRef = useRef(null);
  const [hovered, setHovered] = useState(null);

  return (
    <div className="gauge gauge-hover-wrap" ref={wrapRef} onMouseEnter={(event) => setHovered({ x: event.clientX, y: event.clientY })} onMouseMove={(event) => setHovered({ x: event.clientX, y: event.clientY })} onMouseLeave={() => setHovered(null)}>
      <div className="gauge-ring" style={{ '--p': value }}>
        <div className="gauge-center">
          <div className="gauge-value">{value}%</div>
          <div className="gauge-label">{label}</div>
          {totalBudget && spent ? (
            <div className="gauge-subvalue">
              <span className="gauge-subvalue-positive">+5%</span> <span>vs prev 30 days</span>
            </div>
          ) : null}
        </div>
      </div>
      {hovered && (
        <div className="chart-tooltip gauge-tooltip" style={{ left: 20, top: 16 }}>
          <div className="chart-tooltip-title">Budget</div>
          {totalBudget && (
            <div className="chart-tooltip-row">
              <span>Total</span>
              <strong>{totalBudget}</strong>
            </div>
          )}
          {spent && (
            <div className="chart-tooltip-row">
              <span>Spent</span>
              <strong>{spent}</strong>
            </div>
          )}
          <div className="chart-tooltip-row">
            <span>Utilization</span>
            <strong>{value}%</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function StackedPillBar({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="stacked-block">
      <div className="stack-bar">
        {items.map((item) => (
          <div key={item.name} className="stack-segment" style={{ width: `${(item.value / total) * 100}%`, background: item.color }} />
        ))}
      </div>
      <div className="legend-list">
        {items.map((item) => (
          <div className="legend-row" key={item.name}>
            <span className="legend-dot" style={{ background: item.color }} />
            <span>{item.name}</span>
            <strong>{item.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data }) {
  const wrapRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let start = 0;
  const size = 240;
  const center = size / 2;
  const radius = 78;
  const stroke = 34;

  const onEnter = (item, index, event) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHovered({
      item,
      index,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  const onMove = (item, index, event) => onEnter(item, index, event);

  return (
    <div className="donut-wrap" ref={wrapRef}>
      <div className="donut-layout">
        <div className="donut-plot">
          <svg viewBox={`0 0 ${size} ${size}`} className="donut" aria-label="ROAS by channel chart">
            <circle cx={center} cy={center} r={radius} className="donut-track" />
            {data.map((item, index) => {
              const part = item.value / total;
              const dash = `${part * 2 * Math.PI * radius} ${2 * Math.PI * radius}`;
              const circle = (
                <circle
                  key={item.name}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={stroke}
                  strokeDasharray={dash}
                  strokeDashoffset={-start * 2 * Math.PI * radius}
                  transform={`rotate(-90 ${center} ${center})`}
                  className="donut-segment"
                  onMouseEnter={(event) => onEnter(item, index, event)}
                  onMouseMove={(event) => onMove(item, index, event)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
              start += part;
              return circle;
            })}
            <text x={center} y={center - 1} textAnchor="middle" className="donut-center-value">
              3.2x
            </text>
            <text x={center} y={center + 18} textAnchor="middle" className="donut-center-label">
              BLENDED ROAS
            </text>
          </svg>
          {hovered && (
            <div className="chart-tooltip" style={{ left: hovered.x + 14, top: hovered.y + 14 }}>
              <div className="chart-tooltip-title">{hovered.item.name}</div>
              <div className="chart-tooltip-row">
                <span>Spend</span>
                <strong>{hovered.item.spend}</strong>
              </div>
              <div className="chart-tooltip-row">
                <span>Share</span>
                <strong>{Math.round((hovered.item.value / total) * 100)}%</strong>
              </div>
            </div>
          )}
        </div>
        <div className="donut-legend">
          {data.map((item) => (
            <div className="legend-row legend-row-strong" key={item.name}>
              <span className="legend-dot" style={{ background: item.color }} />
              <div className="legend-copy">
                <span>{item.name}</span>
                <strong>{item.spend}</strong>
              </div>
              <strong className="legend-share">{Math.round((item.value / total) * 100)}%</strong>
            </div>
          ))}
          <div className="legend-note">Click on chart segments to filter data</div>
        </div>
      </div>
    </div>
  );
}

function TrendChart({ compare, accent, range, metric = 'conversions', series = null }) {
  const wrapRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const w = 760;
  const h = 300;
  const padL = 58;
  const padR = 52;
  const padT = 20;
  const padB = 38;
  const xvals = [0, 1, 2, 3, 4, 5];
  const seriesByRange = {
    'Last 30 days': {
      spend: [16, 22, 24, 30, 33, 35],
      conversions: [500, 650, 720, 900, 1050, 1180],
      impressions: [3.6, 3.9, 4.1, 4.5, 4.8, 5.1],
      clicks: [180, 215, 230, 275, 305, 335]
    },
    'Last 90 days': {
      spend: [20, 24, 28, 32, 35, 37],
      conversions: [580, 720, 820, 980, 1120, 1260],
      impressions: [4.4, 4.8, 5.1, 5.5, 5.8, 6.2],
      clicks: [220, 255, 285, 325, 355, 390]
    },
    'This quarter': {
      spend: [24, 28, 30, 35, 37, 39],
      conversions: [650, 800, 900, 1050, 1180, 1350],
      impressions: [5.2, 5.6, 6.0, 6.5, 6.8, 7.2],
      clicks: [260, 300, 335, 375, 410, 445]
    }
  };
  const trendMetric = getTrendMetric(metric);
  const fallbackSeries = seriesByRange[range] || seriesByRange['Last 30 days'];
  const { spend, conversions, impressions, clicks } = series || fallbackSeries;
  const metricSeriesByKey = {
    conversions,
    impressions,
    clicks
  };
  const rightSeries = metricSeriesByKey[trendMetric.value] || conversions;
  const rightAxisMaxByMetric = {
    conversions: 1500,
    impressions: 8,
    clicks: 500
  };
  const rightAxisTicksByMetric = {
    conversions: [0, 300, 600, 900, 1200, 1500],
    impressions: [0, 2, 4, 6, 8],
    clicks: [0, 100, 200, 300, 400, 500]
  };
  const spendMax = Math.max(40, ...spend.map((value) => Number(value) || 0));
  const rightMax = Math.max(rightAxisMaxByMetric[trendMetric.value] || 1500, ...rightSeries.map((value) => Number(value) || 0));
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const x = (i) => padL + (i / (xvals.length - 1)) * chartW;
  const ySpend = (v) => padT + (1 - v / spendMax) * chartH;
  const yRight = (v) => padT + (1 - v / rightMax) * chartH;
  const path = (values, yfn) => values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${yfn(v)}`).join(' ');
  const spendTicks = [0, 10, 20, 30, 40];
  const rightTicks = rightAxisTicksByMetric[trendMetric.value] || rightAxisTicksByMetric.conversions;
  const gridTicks = spendTicks;
  const formatRightValue = (value) => trendMetric.formatValue(value);
  const tooltipFromEvent = (series, index, event, label) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHovered({
      label,
      value: series[index],
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  return (
    <div className="trend-wrap" ref={wrapRef}>
      <div className="trend-topline" aria-hidden="true">
        <span className="trend-title-label">Spend</span>
        <div className="trend-title-legend">
          <span>
            <span className="legend-dot legend-dot-line spend" style={{ background: '#4f8df7' }} />
            <span>Spend</span>
          </span>
          <span>
            <span className="legend-dot legend-dot-line conv" style={{ background: trendMetric.color }} />
            <span>{trendMetric.label}</span>
          </span>
        </div>
        <span className="trend-title-label trend-title-right">{trendMetric.label}</span>
      </div>
      <svg className="chart trend-chart" viewBox={`0 0 ${w} ${h}`} aria-label="Trend chart">
        {gridTicks.map((tick) => (
          <line key={tick} x1={padL} x2={w - padR} y1={ySpend(tick)} y2={ySpend(tick)} className="grid-line" />
        ))}
        <line x1={padL} x2={padL} y1={padT} y2={h - padB} className="axis-line" />
        <line x1={w - padR} x2={w - padR} y1={padT} y2={h - padB} className="axis-line" />
        {spendTicks.map((tick) => (
          <text key={`s-${tick}`} x={padL - 10} y={ySpend(tick) + 4} textAnchor="end" className="axis-label">
            {tick === 0 ? '$0' : `$${tick}K`}
          </text>
        ))}
        {rightTicks.map((tick) => (
          <text key={`c-${tick}`} x={w - padR + 10} y={yRight(tick) + 4} textAnchor="start" className="axis-label axis-label-right">
            {trendMetric.formatTick(tick)}
          </text>
        ))}
        {xvals.map((item, i) => (
          <text key={item} x={x(i)} y={h - 12} textAnchor="middle" className="axis-label axis-label-x">
            Wk{i + 1}
          </text>
        ))}
        <path d={path(spend, ySpend)} className="chart-line spend" />
        <path d={path(rightSeries, yRight)} className="chart-line conv" style={{ stroke: trendMetric.color }} />
        {compare && <path d={path(spend.map((v) => v - 2), ySpend)} className="chart-line ghost" />}
        {spend.map((v, i) => (
          <circle
            key={`s-${i}`}
            cx={x(i)}
            cy={ySpend(v)}
            r="4"
            className="chart-dot spend"
            onMouseEnter={(event) => tooltipFromEvent(spend, i, event, 'Spend')}
            onMouseMove={(event) => tooltipFromEvent(spend, i, event, 'Spend')}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {rightSeries.map((v, i) => (
          <circle
            key={`m-${i}`}
            cx={x(i)}
            cy={yRight(v)}
            r="4"
            className="chart-dot conv"
            style={{ stroke: trendMetric.color }}
            onMouseEnter={(event) => tooltipFromEvent(rightSeries, i, event, trendMetric.label)}
            onMouseMove={(event) => tooltipFromEvent(rightSeries, i, event, trendMetric.label)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>
      {hovered && (
        <div className="chart-tooltip trend-tooltip" style={{ left: hovered.x + 14, top: hovered.y - 48 }}>
          <div className="chart-tooltip-title">{hovered.label}</div>
          <div className="chart-tooltip-row">
            <span>Value</span>
            <strong>{hovered.label === 'Spend' ? `$${hovered.value}K` : formatRightValue(hovered.value)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function FunnelChart() {
  const stages = [
    ['Impressions', 100],
    ['Clicks', 62],
    ['Leads', 41],
    ['Conversions', 24]
  ];
  return (
    <div className="funnel">
      {stages.map(([label, value], index) => (
        <div key={label} className="funnel-row">
          <div className="funnel-label">{label}</div>
          <div className="funnel-bar" style={{ width: `${100 - index * 18}%` }}>
            <span>{value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ForecastChart() {
  const cols = [
    ['Wk1', 12],
    ['Wk2', 18],
    ['Wk3', 24],
    ['Wk4', 29],
    ['Wk5', 34],
    ['Wk6', 38]
  ];
  return (
    <div className="forecast">
      {cols.map(([label, value]) => (
        <div key={label} className="forecast-col">
          <div className="forecast-band" style={{ height: `${value}%` }} />
          <div className="forecast-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

function InsightFeed() {
  return (
    <div className="insight-feed">
      <InsightCard tone="good" title="What worked" body="Bilingual video creative is outperforming static assets on CTR and conversion volume." />
      <InsightCard tone="warn" title="What needs attention" body="Digital direct and audio are pacing behind and need reallocation or optimization." />
      <InsightCard tone="info" title="Forecast note" body="A budget shift to Meta could lift blended ROAS over the next 30 days." />
    </div>
  );
}

function InsightCard({ tone, title, body }) {
  return (
    <div className={`insight-card ${tone}`}>
      <div className="stack-title">{title}</div>
      <div className="stack-meta">{body}</div>
    </div>
  );
}

function ChatMock() {
  return (
    <div className="chat">
      <div className="chat-bubble bot">How can I help you review this workspace?</div>
      <div className="chat-bubble user">Show me the campaigns that need budget changes.</div>
      <div className="chat-bubble bot">Digital direct and audio are pacing behind, and the community feature is underdelivering versus the rest of the portfolio.</div>
      <div className="chat-input">Ask MOSAIQ AI...</div>
    </div>
  );
}

function PermissionGrid() {
  const roles = ['Owner', 'Agency Admin', 'Strategist', 'Client'];
  return (
    <div className="perm-grid">
      <div className="perm-head" />
      {roles.map((role) => (
        <div className="perm-head" key={role}>{role}</div>
      ))}
      {['Reports', 'Billing', 'Insights', 'Admin'].map((feature) => (
        <React.Fragment key={feature}>
          <div className="perm-row-title">{feature}</div>
          {roles.map((role) => (
            <div className="perm-cell" key={`${feature}-${role}`}>
              {role === 'Client' && (feature === 'Billing' || feature === 'Admin') ? 'No' : 'Yes'}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

export function DashboardPage() {
  return <App />;
}

export default function Page() {
  return <DashboardPage />;
}
