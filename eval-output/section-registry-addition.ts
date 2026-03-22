/**
 * eval-output/section-registry-addition.ts
 *
 * Paste this entry into the `pricingVariants` array in:
 *   apps/web/src/lib/section-registry.ts
 *
 * It adds a 9th pricing variant: Spotlight Glass Toggle.
 * Distinct from the existing `pricing-toggle` (variant 2) in that it uses:
 *   - Glassmorphism cards (backdrop-filter: blur)
 *   - Segmented-control toggle (not a pill slider)
 *   - Per-card annual savings badge (computed from annualPrice)
 *   - Spotlight radial glow behind the popular plan
 *   - Counter-flip price animation
 */

// NOTE: This file uses the same helpers available in section-registry.ts.
// When integrating, remove this comment block and the `base`/`prop` re-declarations
// below — they already exist in section-registry.ts.

import type {
  SectionVariant,
  AnimationLevel,
  SectionTheme,
  BackgroundType,
  DividerStyle,
  SectionPropDef,
} from '@ubuilder/types'

// Helpers already available in section-registry.ts (shown here for context only):
// const base = (...) => { ... }
// const prop = (...) => { ... }
// const TECH_INDUSTRIES = ['tech', 'saas', 'startup']
// const pricingProps = [...]

// ---------------------------------------------------------------------------
// New variant entry — add this object to the `pricingVariants` array
// ---------------------------------------------------------------------------

const newPricingVariant = base({
  id: 'pricing-spotlight-toggle',
  category: 'pricing',
  name: 'Spotlight Glass Toggle',
  description:
    'Glassmorphism pricing cards with segmented monthly/annual toggle, per-plan savings callout, and radial spotlight glow on the recommended plan.',
  tags: ['glass', 'spotlight', 'toggle', 'savings-badge', 'annual', 'modern'],
  industries: [...TECH_INDUSTRIES, 'startup', 'agency'],
  features: [
    'billing-toggle',
    'glassmorphism',
    'spotlight-glow',
    'savings-callout',
    'counter-flip-animation',
    'segmented-control',
  ],
  animationLevel: 'moderate' as AnimationLevel,
  theme: 'dark' as SectionTheme,
  backgroundType: 'gradient' as BackgroundType,
  dividerTop: 'none' as DividerStyle,
  dividerBottom: 'none' as DividerStyle,
  props: [
    ...pricingProps,
    prop('savingsPercent', 'Annual Savings %', 'number', 20),
    prop('currency', 'Currency Symbol', 'text', '$'),
    prop('annualLabel', 'Annual Toggle Label', 'text', 'Annual'),
    prop('monthlyLabel', 'Monthly Toggle Label', 'text', 'Monthly'),
  ],
  minHeight: '600px',
  maxContentWidth: 'lg',
})

export { newPricingVariant }
