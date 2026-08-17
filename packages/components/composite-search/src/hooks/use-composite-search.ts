// TODO 待优化性能
import { cloneDeep } from 'lodash-unified'
import type {
  TmCompositeSearchFieldItem,
  TmCompositeSearchPayload,
  TmCompositeSearchPayloadValue,
  TmCompositeSearchProps,
} from '../composite-search-type'
import type { MaybeRef } from 'vue'
import { computed, ref, unref } from 'vue'
import type { TmCompositeSearchTagsProps } from '@tdesign-vue-next-more/components'

/**
 * 组合搜索组件的绑定属性（由 compositeSearchProps 返回）
 * 所有属性均为必填，可直接 `v-bind` 到 `<tm-composite-search>`
 */
type TmCompositeSearchBindProps = Required<TmCompositeSearchProps>

/**
 * 组合搜索标签组件的绑定属性（由 compositeSearchTagsProps 返回）
 * 所有属性均为必填，可直接 `v-bind` 到 `<tm-composite-search-tags>`
 */
type TmCompositeSearchTagsBindProps = Required<TmCompositeSearchTagsProps>

interface UseCompositeSearchOptions {
  /** 搜索参数变化时的回调 */
  onSearchChange?: (
    params: Record<string, TmCompositeSearchPayloadValue>,
  ) => void
  /**
   * 搜索字段配置（必填）
   * 可直接传入数组，也可传入 Ref 或 ComputedRef，用于组装返回的 `compositeSearchProps`
   */
  searchFields: MaybeRef<TmCompositeSearchFieldItem[]>
}

/**
 * 组合搜索 Hook，用于管理多个搜索条件的组合查询
 * 提供搜索条件的增删改查功能，并维护搜索负载的状态
 *
 * @param {UseCompositeSearchOptions} - 配置选项，其中 searchFields 必填
 *
 * @returns {Object} 返回组合搜索相关的状态和方法
 * @returns {ComputedRef<TmCompositeSearchPayload[]>} return.searchPayloads - 当前所有搜索负载的计算属性
 * @returns {Function} return.addSearchPayload - 添加或更新搜索负载
 * @returns {Function} return.removeSearchPayload - 移除指定搜索负载
 * @returns {Function} return.clearSearchPayloads - 清空所有搜索负载
 * @returns {Function} return.getSearchParams - 获取深拷贝后的搜索参数对象
 * @returns {ComputedRef<TmCompositeSearchBindProps>} return.compositeSearchProps - 可直接 `v-bind` 到 `<tm-composite-search>` 的属性集合
 * @returns {ComputedRef<TmCompositeSearchTagsBindProps>} return.compositeSearchTagsProps - 可直接 `v-bind` 到 `<tm-composite-search-tags>` 的属性集合
 *
 * @example
 * const {
 *   compositeSearchProps,
 *   compositeSearchTagsProps,
 *   getSearchParams
 * } = useCompositeSearch({
 *   searchFields,
 *   onSearchChange: (params) => {
 *     console.log('搜索参数变化:', params);
 *     // 执行搜索逻辑
 *   }
 * })
 * // 模板中直接一行绑定
 * // <tm-composite-search v-bind="compositeSearchProps"></tm-composite-search>
 * // <tm-composite-search-tags v-bind="compositeSearchTagsProps"></tm-composite-search-tags>
 */
export const useCompositeSearch = (options: UseCompositeSearchOptions) => {
  const { onSearchChange, searchFields } = options

  /**
   * 存储搜索负载的响应式数组
   * @type {Ref<TmCompositeSearchPayload[]>}
   */
  const searchPayloads = ref<TmCompositeSearchPayload[]>([])

  /**
   * 基于 searchPayloads 的计算属性，提供只读访问
   * @type {ComputedRef<TmCompositeSearchPayload[]>}
   */
  const computedSearchPayloads = computed(() => {
    return searchPayloads.value
  })

  /**
   * 内部辅助函数：更新搜索负载并触发回调
   * @param {TmCompositeSearchPayload[]} newPayloads - 新的搜索负载数组
   */
  const updateSearchPayloads = (newPayloads: TmCompositeSearchPayload[]) => {
    searchPayloads.value = newPayloads
    // 在搜索负载发生变更时触发回调
    onSearchChange?.(getSearchParams())
  }

  /**
   * 添加或更新搜索负载
   * 如果已存在相同 field 的负载，则更新该位置的数据；
   * 否则在数组末尾追加新的负载
   * @param {TmCompositeSearchPayload} searchPayload - 要添加或更新的搜索负载对象
   */
  const addSearchPayload = (searchPayload: TmCompositeSearchPayload) => {
    const index = searchPayloads.value.findIndex(
      (item) => item.field === searchPayload.field,
    )
    if (index > -1) {
      // 更新已存在的搜索条件
      updateSearchPayloads([
        ...searchPayloads.value.slice(0, index),
        searchPayload,
        ...searchPayloads.value.slice(index + 1),
      ])
    } else {
      // 添加新的搜索条件
      updateSearchPayloads([...searchPayloads.value, searchPayload])
    }
  }

  /**
   * 移除指定 field 的搜索负载
   * @param {TmCompositeSearchPayload} searchPayload - 要移除的搜索负载对象，根据其 field 属性进行匹配
   */
  const removeSearchPayload = (searchPayload: TmCompositeSearchPayload) => {
    updateSearchPayloads(
      searchPayloads.value.filter((item) => item.field !== searchPayload.field),
    )
  }

  /**
   * 清空所有搜索负载，重置为空数组
   */
  const clearSearchPayloads = () => {
    updateSearchPayloads([])
  }

  /**
   * 获取当前所有搜索负载的深拷贝对象
   * 返回以 field 为键、value 为值的普通对象
   * @returns {Record<string, TmCompositeSearchPayloadValue>} 以搜索字段名为键的搜索参数对象
   */
  const getSearchParams = (): Record<string, TmCompositeSearchPayloadValue> => {
    const searchParams: Record<string, TmCompositeSearchPayloadValue> = {}
    searchPayloads.value.forEach((searchPayload) => {
      searchParams[searchPayload.field] = cloneDeep(searchPayload.value)
    })
    return searchParams
  }

  /**
   * 可直接通过 `v-bind` 绑定到 `<tm-composite-search>` 的属性集合
   * 将 searchFields、value、onSearch、onReset 打包为一个对象，免去手动逐个绑定的繁琐
   * @type {ComputedRef<TmCompositeSearchBindProps>}
   */
  const compositeSearchProps = computed<TmCompositeSearchBindProps>(() => ({
    searchFields: unref(searchFields),
    value: computedSearchPayloads.value,
    onSearch: addSearchPayload,
    onReset: removeSearchPayload,
  }))

  /**
   * 可直接通过 `v-bind` 绑定到 `<tm-composite-search-tags>` 的属性集合
   * 将 value、onClose、onClear 打包为一个对象，免去手动逐个绑定的繁琐
   * @type {ComputedRef<TmCompositeSearchTagsBindProps>}
   */
  const compositeSearchTagsProps = computed<TmCompositeSearchTagsBindProps>(
    () => ({
      value: computedSearchPayloads.value,
      onClose: removeSearchPayload,
      onClear: clearSearchPayloads,
    }),
  )

  return {
    searchPayloads: computedSearchPayloads,
    addSearchPayload,
    removeSearchPayload,
    clearSearchPayloads,
    getSearchParams,
    compositeSearchProps,
    compositeSearchTagsProps,
  }
}
