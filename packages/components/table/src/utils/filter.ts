import type {
  FilterValue,
  TableColumnFilter,
  TableRowData,
} from 'tdesign-vue-next'
import type { TmCompositeSearchPayload } from '@tailor-more/t-more-components'
import type { TmTableCol } from '../table-type'

/**
 * 根据列的 searchConfig 自动派生表头筛选配置
 * searchConfig 经 PartialByKeys 处理后会丢失 list，需先按 type 收窄再读取
 */
export const deriveColumnFilter = (
  searchConfig: NonNullable<TmTableCol['searchConfig']>,
): TableColumnFilter => {
  if (searchConfig.type === 'single' || searchConfig.type === 'multiple') {
    return {
      type: searchConfig.type,
      list: searchConfig.list,
      showConfirmAndReset: true,
    }
  }
  return { type: 'input', showConfirmAndReset: true }
}

export const isFilterValueEmpty = (value: unknown): boolean => {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

/**
 * 根据字段查找列，searchConfig.field 优先，未命中再降级用 colKey
 */
const findColumnByField = <T extends TableRowData>(
  columns: TmTableCol<T>[],
  field: string,
): TmTableCol<T> | undefined => {
  return (
    columns.find((col) => col.searchConfig?.field === field) ||
    columns.find((col) => col.colKey === field)
  )
}

/**
 * 表头筛选值（{ [colKey]: value }）转换为搜索负载
 */
export const filterValueToPayloads = <T extends TableRowData>(
  filterValue: FilterValue,
  columns: TmTableCol<T>[],
): TmCompositeSearchPayload[] => {
  const payloads: TmCompositeSearchPayload[] = []
  Object.keys(filterValue).forEach((key) => {
    const value = filterValue[key]
    if (isFilterValueEmpty(value)) return
    const column = findColumnByField(columns, key)
    const searchConfig = column?.searchConfig
    const field = searchConfig?.field || key
    // TODO 未来支持 title 为渲染函数（TNode）或通过列 render 渲染 title 时提取文本，当前仅支持 string
    const name =
      searchConfig?.name ||
      (typeof column?.title === 'string' ? column.title : key)
    payloads.push({ field, name, value } as TmCompositeSearchPayload)
  })
  return payloads
}

/**
 * 搜索负载转换为表头筛选值（{ [colKey]: value }）
 */
export const payloadsToFilterValue = <T extends TableRowData>(
  payloads: TmCompositeSearchPayload[],
  columns: TmTableCol<T>[],
): FilterValue => {
  const filterValue: FilterValue = {}
  payloads.forEach((payload) => {
    const column = findColumnByField(columns, payload.field)
    if (column?.colKey) {
      filterValue[column.colKey] = payload.value
    }
  })
  return filterValue
}
