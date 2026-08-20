declare module 'vue' {
  export interface GlobalComponents {
    TmButtonDropdown: (typeof import('@tailor-more/t-more'))['TmButtonDropdown']
    TmCollapseTransition: (typeof import('@tailor-more/t-more'))['TmCollapseTransition']
    TmCompositeSearch: (typeof import('@tailor-more/t-more'))['TmCompositeSearch']
    TmCompositeSearchTags: (typeof import('@tailor-more/t-more'))['TmCompositeSearchTags']
    TmTable: (typeof import('@tailor-more/t-more'))['TmTable']
  }
}

export {}
