import basicsIcon from '../assets/education/basics-icon.svg'
import greeksIcon from '../assets/education/greeks-icon.svg'
import ivIcon from '../assets/education/iv-icon.svg'
import pricingIcon from '../assets/education/pricing-icon.svg'
import strategiesIcon from '../assets/education/strategies-icon.svg'

export const CHAPTERS = [
  { id: 'basics', icon: basicsIcon, label: 'Basics' },
  { id: 'pricing', icon: pricingIcon, label: 'Pricing' },
  { id: 'greeks', icon: greeksIcon, label: 'Greeks' },
  { id: 'iv', icon: ivIcon, label: 'IV' },
  { id: 'strategies', icon: strategiesIcon, label: 'Strategies' },
] as const

export type ChapterId = (typeof CHAPTERS)[number]['id']
