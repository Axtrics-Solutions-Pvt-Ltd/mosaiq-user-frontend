function emptyIntelligence(workspace) {
  return {
    workspace_id: workspace.id,
    audience_profile: [],
    demographic_profile: [],
    geographic_insights: [],
    behaviour: [],
    media_and_brand: [],
    findings: [],
    data_updated_at: null,
    source_label: null,
  };
}

function completeIntelligence(workspace, range) {
  return {
    workspace_id: workspace.id,
    audience_profile: [
      {
        title: 'Core audience',
        summary: 'Digitally confident households balancing convenience, quality, and value.',
        metrics: [
          { key: 'audience_size', label: 'Addressable audience', value: 5280000, category: 'Scale', source: 'Seeded consumer panel', planning_implication: 'Sufficient scale for separate prospecting and retargeting pools.' },
          { key: 'digital_index', label: 'Digital purchase index', value: 137, category: 'Affinity', source: 'Seeded consumer panel', planning_implication: 'Prioritise shoppable and conversion-led formats.' },
          { key: 'value_orientation', label: 'Value-led shoppers', value: '61%', category: 'Motivation', source: 'Seeded survey', planning_implication: 'Lead with proof of value rather than discount alone.' },
        ],
        insights: ['Mobile research frequently precedes desktop or in-store purchase.', 'Quality signals remain important even among promotion-responsive households.'],
      },
      {
        title: 'Growth audience',
        summary: 'Younger urban households with higher discovery and social-sharing behaviour.',
        metrics: [
          { key: 'growth_size', label: 'Growth segment size', value: 1740000, category: 'Scale', source: 'Seeded consumer panel', planning_implication: 'Use creator and short-form video for incremental reach.' },
          { key: 'social_index', label: 'Social discovery index', value: 153, category: 'Affinity', source: 'Seeded media study', planning_implication: 'Sequence creator content into search and site retargeting.' },
        ],
        insights: ['Peer reviews and creator demonstrations shorten consideration.'],
      },
    ],
    demographic_profile: [
      { dimension: 'Age', segments: [{ label: '18–24', value: 620000, percent: 11.7, index: 116 }, { label: '25–34', value: 1840000, percent: 34.8, index: 142 }, { label: '35–44', value: 1530000, percent: 29, index: 123 }, { label: '45+', value: 1290000, percent: 24.5, index: 78 }] },
      { dimension: 'Household', segments: [{ label: 'Young families', value: 2010000, percent: 38.1, index: 131 }, { label: 'Couples', value: 1680000, percent: 31.8, index: 109 }, { label: 'Single person', value: 1590000, percent: 30.1, index: 91 }] },
    ],
    geographic_insights: [
      { geography: 'New York Metro', geography_type: 'region', value: 1120000, share_percent: 21.2, index: 148, planning_implication: 'Maintain high search coverage and test local inventory messaging.' },
      { geography: 'Los Angeles Metro', geography_type: 'region', value: 840000, share_percent: 15.9, index: 126, planning_implication: 'Use video and creator partnerships to expand consideration.' },
      { geography: 'Chicago Metro', geography_type: 'region', value: 590000, share_percent: 11.2, index: 117, planning_implication: 'Test value-led seasonal bundles.' },
    ],
    behaviour: [
      { category: 'Shopping', behaviour: 'Compares products across two or more retailers', affinity: 1.42, index: 142, source: 'Seeded consumer panel', planning_implication: 'Keep comparison-friendly benefits visible in landing experiences.' },
      { category: 'Media', behaviour: 'Uses short-form video for product discovery', affinity: 1.53, index: 153, source: 'Seeded media study', planning_implication: 'Build vertical-video variants for prospecting.' },
      { category: 'Loyalty', behaviour: 'Responds to points and member-only benefits', affinity: 1.31, index: 131, source: 'Seeded survey', planning_implication: 'Pair acquisition offers with loyalty enrolment.' },
    ],
    media_and_brand: [
      { category: 'Platform', brand_or_platform: 'YouTube', reach_percent: 76, affinity: 1.19, index: 119, source: 'Seeded media study' },
      { category: 'Platform', brand_or_platform: 'Instagram', reach_percent: 68, affinity: 1.34, index: 134, source: 'Seeded media study' },
      { category: 'Media', brand_or_platform: 'Streaming TV', reach_percent: 62, affinity: 1.16, index: 116, source: 'Seeded media study' },
    ],
    findings: [
      { id: 701, type: 'opportunity', title: 'Connect social discovery to high-intent search', description: 'The growth audience over-indexes for both short-form discovery and category search.', implication: 'Use shared creative themes and sequential retargeting across both channels.', priority: 'high' },
      { id: 702, type: 'insight', title: 'Value needs a quality proof point', description: 'Price sensitivity is high, but so is concern about product quality.', implication: 'Show durability, reviews, or service benefits beside offers.', priority: 'high' },
      { id: 703, type: 'risk', title: 'Frequency may concentrate in major metros', description: 'The strongest audience clusters overlap heavily with current delivery.', implication: 'Monitor reach curves by market and reserve budget for incremental regions.', priority: 'medium' },
    ],
    data_updated_at: `${range.end_date}T08:30:00Z`,
    source_label: 'Seeded consumer, media, and campaign signals',
  };
}

function partialIntelligence(workspace, range) {
  return {
    workspace_id: workspace.id,
    audience_profile: [{
      title: 'Early adopter audience',
      summary: 'An initial profile based on limited paid-media and survey signals.',
      metrics: [{ key: 'estimated_size', label: 'Estimated audience', value: 680000, category: 'Scale', source: 'Seeded survey', planning_implication: null }],
      insights: [],
    }],
    demographic_profile: [{ dimension: 'Age', segments: [{ label: '25–34', value: 284000, percent: 41.8, index: null }] }],
    geographic_insights: [],
    behaviour: [],
    media_and_brand: [{ category: 'Platform', brand_or_platform: 'LinkedIn', reach_percent: 54, affinity: null, index: null, source: 'Seeded campaign signals' }],
    findings: [{ id: 711, type: 'risk', title: 'Limited signal coverage', description: 'Current findings rely on one campaign and an early survey wave.', implication: 'Treat audience conclusions as directional until more sources arrive.', priority: 'high' }],
    data_updated_at: `${range.end_date}T07:00:00Z`,
    source_label: 'Partial seeded signals',
  };
}

export function createIntelligenceFixture(workspace, range, profile = workspace.fixture_profile) {
  if (profile === 'empty') return emptyIntelligence(workspace);
  if (profile === 'partial') return partialIntelligence(workspace, range);
  return completeIntelligence(workspace, range);
}
