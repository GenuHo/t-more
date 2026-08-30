import type { OptionData } from 'tdesign-vue-next'

/**
 * 输入框类型的搜索字段配置
 */
export interface TmCompositeSearchInputFieldItem {
  /** 字段类型，固定值 'input' */
  type: 'input'
  /** 字段显示名称 */
  name: string | (() => string)
  /** 对应数据字段名 */
  field: string
  /** 占位符文本（可选） */
  placeholder?: string
}

/**
 * 单选类型的搜索字段配置
 */
export interface TmCompositeSearchSingleFieldItem {
  /** 字段类型，固定值 'single' */
  type: 'single'
  /** 字段显示名称 */
  name: string | (() => string)
  /** 对应数据字段名 */
  field: string
  /** 占位符文本（可选） */
  placeholder?: string
  /** 选项数据数组 */
  list: OptionData[]
}

/**
 * 多选类型的搜索字段配置
 */
export interface TmCompositeSearchMultipleFieldItem {
  /** 字段类型，固定值 'multiple' */
  type: 'multiple'
  /** 字段显示名称 */
  name: string | (() => string)
  /** 对应数据字段名 */
  field: string
  /** 占位符文本（可选） */
  placeholder?: string
  /** 选项数据数组 */
  list: OptionData[]
}

/**
 * 搜索字段项的联合类型，可为输入框、单选或多选类型
 */
export type TmCompositeSearchFieldItem =
  | TmCompositeSearchInputFieldItem
  | TmCompositeSearchSingleFieldItem
  | TmCompositeSearchMultipleFieldItem

/**
 * 复合搜索组件的属性接口
 */
export interface TmCompositeSearchProps {
  /** 搜索字段配置项数组 */
  searchFields: TmCompositeSearchFieldItem[]
  /**
   * 搜索结果数据模型
   */
  value: TmCompositeSearchPayload[]
  /**
   * 搜索事件回调函数
   * @param payload 搜索结果载荷
   */
  onSearch?: (payload: TmCompositeSearchPayload) => void
  /**
   * 重置搜索事件回调函数
   * @param payload 搜索结果载荷
   */
  onReset?: (payload: TmCompositeSearchPayload) => void
}

/**
 * 输入框搜索结果载荷
 */
export interface TmCompositeSearchInputPayload {
  /** 搜索值 */
  value: string
  /** 字段 */
  field: string
  /** 字段显示名称 */
  name: string
}

/**
 * 单选搜索结果载荷
 */
export interface TmCompositeSearchSinglePayload {
  /** 选中的值 */
  value?: OptionData['value']
  /** 字段 */
  field: string
  /** 字段显示名称 */
  name: string
}

/**
 * 多选搜索结果载荷
 */
export interface TmCompositeSearchMultiplePayload {
  /** 选中的值 */
  value?: OptionData['value'][]
  /** 字段 */
  field: string
  /** 字段显示名称 */
  name: string
}

/**
 * 搜索结果载荷的联合类型，可为输入框、单选或多选载荷类型
 */
export type TmCompositeSearchPayload =
  | TmCompositeSearchInputPayload
  | TmCompositeSearchSinglePayload
  | TmCompositeSearchMultiplePayload

/**
 * 提取搜索载荷中的值类型
 */
export type TmCompositeSearchPayloadValue = TmCompositeSearchPayload['value']
