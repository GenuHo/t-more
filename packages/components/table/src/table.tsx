import type { PropType, ComputedRef } from 'vue'
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue'

import type { TmTableProps } from './table-type'
import { TM_TABLE_OWN_KEYS } from './constants'
import { defaultTableTopRightButtons } from './table-default'

import type {
  TmCompositeSearchFieldItem,
  TmCompositeSearchTagsInstance,
} from '@tdesign-vue-next-more/components'
import {
  TmCompositeSearchTags,
  TmCompositeSearch,
  TmButtonDropdown,
  TM_OPERATION_COL_KEY,
  useColumnCalcWidth,
  useCompositeSearch,
} from '@tdesign-vue-next-more/components'
import { SCREEN_WIDTH } from '@tdesign-vue-next-more/constants'
import { useNamespace } from '@tdesign-vue-next-more/hooks'
import { deleteObjectKeys } from '@tdesign-vue-next-more/utils'

import type { PageInfo, PrimaryTableCol, TableRowData } from 'tdesign-vue-next'
import { EnhancedTable } from 'tdesign-vue-next'
import baseTableProps from 'tdesign-vue-next/es/table/base-table-props'
import primaryTableProps from 'tdesign-vue-next/es/table/primary-table-props'
import enhancedTableProps from 'tdesign-vue-next/es/table/enhanced-table-props'

import { useElementSize, useWindowSize } from '@vueuse/core'
import { isNumber } from 'lodash-unified'

import '@tdesign-vue-next-more/theme-chalk/table.less'

export default defineComponent({
  name: 'TmTable',
  props: {
    ...baseTableProps,
    ...primaryTableProps,
    ...enhancedTableProps,
    request: {
      type: Function as PropType<TmTableProps['request']>,
    },
    columns: {
      type: Array as PropType<TmTableProps['columns']>,
    },
    topRightButtons: {
      type: Array as PropType<TmTableProps['topRightButtons']>,
      default: () => [...defaultTableTopRightButtons],
    },
    topLeftButtonDropdown: {
      type: Object as PropType<TmTableProps['topLeftButtonDropdown']>,
    },
  },
  setup(props: TmTableProps, { attrs, expose, slots }) {
    const enhancedTableRef = useTemplateRef('enhancedTableRef')

    const ns = useNamespace('table')

    const data = ref<TableRowData[] | undefined>()

    const {
      searchPayloads,
      addSearchPayload,
      removeSearchPayload,
      clearSearchPayloads,
      getSearchParams,
    } = useCompositeSearch({
      onSearchChange: () => {
        search()
      },
    })

    const searchFields = computed(() => {
      const result: TmCompositeSearchFieldItem[] = []
      props?.columns?.forEach((column) => {
        const searchConfig = column?.searchConfig
        if (searchConfig) {
          result.push({
            ...searchConfig,
            field: searchConfig?.field || column.colKey!,
            name: searchConfig?.name || (column.title as string),
          })
        }
      })
      return result
    })

    const currentSearchParams = computed(() => {
      return getSearchParams()
    })
    const selfCurrent = ref(props?.pagination?.current ?? 1)
    const selfPageSize = ref(props?.pagination?.pageSize ?? 10)
    const total = ref(0)
    const loading = ref(false)
    const search = async () => {
      const allParams = {
        ...currentSearchParams.value,
        current: selfCurrent.value,
        pageSize: selfPageSize.value,
      }
      if (props?.request) {
        try {
          loading.value = true
          const requestData = await props.request(allParams)
          data.value = requestData?.results || []
          total.value = requestData?.total || 0
        } catch (error) {
          console.error(error)
          data.value = []
        } finally {
          loading.value = false
        }
      }
    }
    onMounted(() => {
      search()
    })
    const reset = () => {
      selfCurrent.value = 1
      clearSearchPayloads() // 清空搜索条件，会自动触发搜索的
    }
    const onPaginationChange = (pageInfo: PageInfo) => {
      selfCurrent.value = pageInfo.current
      selfPageSize.value = pageInfo.pageSize
      search()
      props.pagination?.onChange?.(pageInfo)
    }

    // 转换归一化为对象，方便后续处理
    const computedTableTopRightButtons = computed(() => {
      return props.topRightButtons?.map((button) => {
        if (button === 'refresh') {
          return {
            type: 'refresh',
          }
        } else if (button === 'reset') {
          return {
            type: 'reset',
          }
        } else {
          return button
        }
      })
    })
    // 得到根据topRightButtons渲染出来的节点
    const getTableTopRightNodes = () => {
      const buttonProps = {
        shape: 'square',
        variant: 'text',
      } as const
      return computedTableTopRightButtons.value?.map((button) => {
        if (button.type === 'reset') {
          return (
            <TButton {...buttonProps} onClick={button?.onClick || reset}>
              <ClearIcon />
            </TButton>
          )
        } else if (button.type === 'refresh') {
          return (
            <TButton {...buttonProps} onClick={button?.onClick || search}>
              <RefreshIcon />
            </TButton>
          )
        } else if (button.render) {
          return button.render?.()
        }
      })
    }

    const tmCompositeSearchTagsRef = ref<TmCompositeSearchTagsInstance>()

    const { width } = useWindowSize()
    const topLeftStartRef = ref<HTMLDivElement | null>(null)
    const { width: topLeftStartWidth } = useElementSize(topLeftStartRef)
    const isTopLeftShowCompositeSearch = computed(() => {
      if (isNumber(topLeftStartWidth.value) && topLeftStartWidth.value <= 0) {
        return true
      } else {
        return width.value > SCREEN_WIDTH.lg
      }
    })

    const operationColumn = props.columns?.find(
      (column) => column.colKey === TM_OPERATION_COL_KEY,
    )
    let calcWidthOperationColumn: ComputedRef<PrimaryTableCol> | null = null
    let calcWidthFunc: (() => void) | null = null
    if (operationColumn && operationColumn.colKey === TM_OPERATION_COL_KEY) {
      // 操作列的话需要计算宽度
      const { column, calcWidth } = useColumnCalcWidth(operationColumn)
      calcWidthOperationColumn = column
      calcWidthFunc = calcWidth
    }
    // 表格数据变化就计算宽度
    watch(
      () => [data.value, props.data],
      () => {
        nextTick(() => {
          calcWidthFunc?.()
        })
      },
    )
    const computedColumns = computed(() => {
      const cols: PrimaryTableCol[] = []
      props.columns?.forEach((column) => {
        if (column.colKey !== TM_OPERATION_COL_KEY) {
          cols.push({
            ...column,
          })
        }
      })
      if (calcWidthOperationColumn?.value) {
        cols.push(calcWidthOperationColumn.value)
      }
      return cols
    })

    expose({
      getTableData: search,
    })

    return () => {
      const tProps = {
        ...props,
      }
      // 这里需要删除不是EnhancedTable的属性
      deleteObjectKeys(tProps, TM_TABLE_OWN_KEYS)
      return (
        <div class={ns.b()}>
          <div class={ns.e('top')}>
            <div class={ns.e('top-left')}>
              <div
                ref={topLeftStartRef}
                class={[
                  ns.e('top-left-start'),
                  isNumber(topLeftStartWidth.value) &&
                    topLeftStartWidth.value <= 0 &&
                    ns.is('hidden'),
                ]}
              >
                <TmButtonDropdown
                  {...props?.topLeftButtonDropdown}
                ></TmButtonDropdown>
              </div>
              {isTopLeftShowCompositeSearch.value && (
                <TmCompositeSearch
                  searchFields={searchFields.value}
                  value={searchPayloads.value}
                  onSearch={addSearchPayload}
                  onReset={removeSearchPayload}
                ></TmCompositeSearch>
              )}
            </div>
            <div class={ns.e('top-right')}>
              <TSpace size={2}>{getTableTopRightNodes()}</TSpace>
            </div>
          </div>
          <div class={ns.e('search')}>
            {!isTopLeftShowCompositeSearch.value && (
              <TmCompositeSearch
                searchFields={searchFields.value}
                value={searchPayloads.value}
                onSearch={addSearchPayload}
                onReset={removeSearchPayload}
              ></TmCompositeSearch>
            )}
            <TmCompositeSearchTags
              ref={tmCompositeSearchTagsRef}
              value={searchPayloads.value}
              onClose={removeSearchPayload}
              onClear={clearSearchPayloads}
            ></TmCompositeSearchTags>
          </div>
          <EnhancedTable
            v-slots={slots}
            {...tProps}
            {...attrs}
            ref={enhancedTableRef}
            columns={computedColumns.value}
            data={props?.request ? data.value : props.data}
            loading={props?.request ? loading.value : props.loading}
            disableDataPage={props?.request ? true : props.disableDataPage}
            pagination={
              props?.request
                ? {
                    ...props.pagination,
                    current: selfCurrent.value,
                    pageSize: selfPageSize.value,
                    total: total.value,
                    onChange: onPaginationChange,
                  }
                : {
                    ...props.pagination,
                  }
            }
          />
        </div>
      )
    }
  },
})
