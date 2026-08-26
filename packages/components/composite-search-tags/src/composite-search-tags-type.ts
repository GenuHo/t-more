import type {
  TmCompositeSearchFieldItem,
  TmCompositeSearchPayload,
} from '@tailor-more/t-more-components'

export interface TmCompositeSearchTagsProps {
  /**
   * 搜索结果数据模型
   */
  value: TmCompositeSearchPayload[]
  /**
   * 搜索字段配置，用于实时解析标签文案
   */
  searchFields?: TmCompositeSearchFieldItem[]
  /**
   * 搜索结果标签关闭事件回调函数
   * @param value 搜索结果载荷
   */
  onClose?: (value: TmCompositeSearchPayload) => void
  /**
   * 搜索结果标签清空事件回调函数
   */
  onClear?: () => void
}
