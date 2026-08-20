import { withInstall } from '@tailor-more/t-more-utils'
import type { SFCWithInstall } from '@tailor-more/t-more-utils'
import _TmCompositeSearch from './src/composite-search.vue'

export const TmCompositeSearch: SFCWithInstall<typeof _TmCompositeSearch> =
  withInstall(_TmCompositeSearch)
export default TmCompositeSearch

export * from './src/hooks'

export * from './src/composite-search-type'

export * from './src/instance'
