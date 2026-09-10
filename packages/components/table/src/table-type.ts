import type {
  EnhancedTableProps,
  TableRowData,
  PrimaryTableCol,
  TNode,
} from 'tdesign-vue-next'
import type {
  TmButtonDropdownProps,
  TmCompositeSearchFieldItem,
} from '@tailor-more/t-more-components'
import type { PartialByKeys } from '@tailor-more/t-more-utils'

/**
 * 表格列配置类型
 * 扩展自 TDesign 的 PrimaryTableCol，增加了搜索配置项
 * 表头筛选 filter 由组件内部根据 searchConfig 自动生成，不对外暴露
 */
export type TmTableCol<T extends TableRowData = TableRowData> = Omit<
  PrimaryTableCol<T>,
  'filter'
> & {
  /**
   * 搜索配置项
   * 用于配置表格列的搜索功能
   * field 和 name 非必传，默认和列配置的 colKey 和 title 一致
   */
  searchConfig?: PartialByKeys<TmCompositeSearchFieldItem, 'field' | 'name'>
}

/**
 * 表格顶部右侧按钮项配置
 */
export type TmTableTopRightButtonItem = {
  /**
   * 按钮类型
   * - 'refresh'：刷新按钮
   * - 'reset'：重置按钮
   * - 其他字符串：自定义按钮类型
   */
  type: 'refresh' | 'reset' | string

  /**
   * 自定义渲染函数
   * 用于自定义按钮的渲染内容
   */
  render?: TNode<TmTableTopRightButtonItem>

  /**
   * 按钮点击事件回调
   * @param e - 鼠标事件对象
   */
  onClick?: (e: MouseEvent) => void
}
/**
 * TmTable 组件属性类型
 * 扩展自 TDesign 的 EnhancedTableProps，增加了请求接口、搜索配置、操作按钮等功能
 */
export interface TmTableProps<
  T extends TableRowData = TableRowData,
> extends Omit<EnhancedTableProps<T>, 'columns' | 'filterValue'> {
  /**
   * 表格数据请求接口
   * 接收查询参数，返回 Promise，用于异步获取表格数据
   *
   * @param params - 请求参数，包含分页、排序、筛选等信息
   * @returns Promise 对象，包含表格数据和分页信息
   */
  request?: (params: any) => Promise<any>

  /**
   * 表格列配置数组
   * 扩展了 PrimaryTableCol，额外支持搜索配置
   */
  columns?: Array<TmTableCol<T>>

  /**
   * 表格顶部右侧按钮配置
   * 支持预设按钮类型和自定义按钮项
   *
   * - `'reset'`：重置按钮（预设）
   * - `'refresh'`：刷新按钮（预设）
   * - `TmTableTopRightButtonItem`：自定义按钮项
   */
  topRightButtons?: ('reset' | 'refresh' | TmTableTopRightButtonItem)[]

  /**
   * 表格顶部左侧下拉按钮配置
   * 使用 TmButtonDropdown 组件的属性配置
   */
  topLeftButtonDropdown?: TmButtonDropdownProps
}
