import { withInstall } from '@tailor-more/t-more-utils'
import type { SFCWithInstall } from '@tailor-more/t-more-utils'
import _TmButtonDropdown from './src/button-dropdown.tsx'

export const TmButtonDropdown: SFCWithInstall<typeof _TmButtonDropdown> =
  withInstall(_TmButtonDropdown)
export default TmButtonDropdown

export * from './src/button-dropdown-type'

export * from './src/instance'
