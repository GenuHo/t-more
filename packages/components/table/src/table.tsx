import type { PropType, ComputedRef } from 'vue'
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue'

import type { TmTableCol, TmTableProps, TmTableSelection } from './table-type'
import { TM_TABLE_OWN_KEYS } from './constants'
import { defaultTableTopRightButtons } from './table-default'
import {
  deriveColumnFilter,
  filterValueToPayloads,
  payloadsToFilterValue,
  renderTitle,
} from './utils'

import type {
  TmButtonDropdownItem,
  TmButtonDropdownItemWithCustomOnClick,
  TmButtonDropdownProps,
  TmCompositeSearchFieldItem,
  TmCompositeSearchTagsInstance,
} from '@tailor-more/t-more-components'
import {
  TmCompositeSearchTags,
  TmCompositeSearch,
  TmButtonDropdown,
  TM_OPERATION_COL_KEY,
  useColumnCalcWidth,
  useCompositeSearch,
} from '@tailor-more/t-more-components'
import { SCREEN_WIDTH } from '@tailor-more/t-more-constants'
import { useNamespace } from '@tailor-more/t-more-hooks'
import { debugWarn, deleteObjectKeys } from '@tailor-more/t-more-utils'

import type {
  EnhancedTableProps,
  FilterValue,
  PageInfo,
  PrimaryTableCol,
  SortOptions,
  TableFilterChangeContext,
  TableRowData,
  TableSort,
} from 'tdesign-vue-next'
import { EnhancedTable } from 'tdesign-vue-next'
import baseTableProps from 'tdesign-vue-next/es/table/base-table-props'
import primaryTableProps from 'tdesign-vue-next/es/table/primary-table-props'
import enhancedTableProps from 'tdesign-vue-next/es/table/enhanced-table-props'

import { useElementSize, useWindowSize } from '@vueuse/core'
import { isNumber, isString } from 'lodash-unified'

import '@tailor-more/t-more-theme-chalk/table.less'

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

    //递归拿到所有的 column
    // https://github.com/Tencent/tdesign-vue-next/blob/develop/packages/components/table/hooks/useFilter.tsx
    function getAllColumns(
      col: Array<PrimaryTableCol>,
      columns: Array<PrimaryTableCol>,
    ) {
      col.forEach((column) => {
        if (column.children) {
          getAllColumns(column.children, columns)
        }
        columns.push(column)
      })
    }

    const searchFields = computed(() => {
      const result: TmCompositeSearchFieldItem[] = []
      props?.columns?.forEach((column) => {
        const searchConfig = column?.searchConfig
        if (searchConfig) {
          result.push({
            ...searchConfig,
            field: searchConfig?.field || column.colKey!,
            name:
              searchConfig?.name ||
              (() => {
                return () => {
                  const columns: Array<PrimaryTableCol> = []
                  getAllColumns(computedColumns.value, columns)
                  const index = columns.findIndex(
                    (col) => col.colKey === column.colKey,
                  )
                  const col = columns[index]
                  if (!col) {
                    debugWarn(
                      'TmTable',
                      `Column "${column.colKey}" was not found, ` +
                        'so its search label falls back to an empty string.',
                    )
                    return ''
                  }
                  const title = renderTitle(slots, col, index)
                  // 列头是渲染函数或插槽时 renderTitle 返回的是 VNode，
                  // 无法作为字符串标签展示，这里只提示，不改变返回值
                  if (!isString(title)) {
                    debugWarn(
                      'TmTable',
                      `The title of column "${column.colKey}" is not a string.`,
                    )
                  }
                  return title as string
                }
              })(),
          })
        }
      })
      return result
    })

    // 参与筛选的列（排除操作列），供派生 filter 注入、filterValue 转换与初始筛选复用
    const filterableColumns = computed<TmTableCol[]>(() => {
      return (
        props.columns?.filter(
          (column) => column.colKey !== TM_OPERATION_COL_KEY,
        ) ?? []
      )
    })

    // defaultFilterValue 仅作为初始筛选条件：与表头筛选共用 filterValueToPayloads 转换，
    // 映射为搜索负载，挂载时通过 setSearchPayloads 注入；之后状态由组件内部管理，重置回到无筛选
    const defaultSearchPayloads = filterValueToPayloads(
      props.defaultFilterValue || {},
      filterableColumns.value,
    )

    const {
      clearSearchPayloads,
      searchPayloads,
      setSearchPayloads,
      getSearchParams,
      compositeSearchProps,
      compositeSearchTagsProps,
    } = useCompositeSearch({
      searchFields,
      onSearchChange: () => {
        // 搜索条件变化（筛选/搜索/标签关闭等）统一重置到第一页再请求
        selfCurrent.value = 1
        search()
      },
    })

    const currentSearchParams = computed(() => {
      return getSearchParams()
    })
    const defaultCurrent = props?.pagination?.defaultCurrent ?? 1
    const defaultPageSize = props?.pagination?.defaultPageSize ?? 10
    const selfCurrent = ref(defaultCurrent)
    const selfPageSize = ref(defaultPageSize)
    const total = ref(0)
    const loading = ref(false)
    // 请求模式的排序状态由组件内部管理：defaultSort 作为初始值
    const selfSort = ref<TableSort | undefined>(props.defaultSort)
    // 排序参数：单选/多选统一平铺为字符串，多字段以逗号拼接；无排序时不带这两个参数
    const sortParams = computed(() => {
      const sort = selfSort.value
      if (!sort) return {}
      const list = Array.isArray(sort) ? sort : [sort]
      if (!list.length) return {}
      return {
        sortBy: list.map((item) => item.sortBy).join(','),
        descending: list.map((item) => String(item.descending)).join(','),
      }
    })
    const search = async () => {
      const allParams = {
        ...currentSearchParams.value,
        ...sortParams.value,
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
          console.error('[TmTable] request failed:', error)
          data.value = []
        } finally {
          loading.value = false
        }
      }
    }
    onMounted(() => {
      // 有初始筛选条件时：整体设置搜索负载，其 onSearchChange 会统一触发首次请求；
      // 无则直接走首次请求。两种路径都只发一次首屏请求
      if (defaultSearchPayloads.length) {
        setSearchPayloads(defaultSearchPayloads)
      } else {
        search()
      }
    })
    // 重置按钮：清空搜索条件与排序（清空搜索会自动触发请求）
    const reset = () => {
      selfSort.value = undefined
      clearSearchPayloads() // 清空搜索条件，会自动触发搜索的
    }
    // 清空全部搜索条件：页码由搜索变化统一重置，保留用户选择的分页大小与排序
    const handleClearSearch = () => {
      clearSearchPayloads() // 清空搜索条件，会自动触发搜索的
    }
    const handleSortChange = (
      sort: TableSort | undefined,
      options: SortOptions<TableRowData>,
    ) => {
      selfSort.value = sort
      selfCurrent.value = 1 // 排序变化重置到第一页
      search()
      props.onSortChange?.(sort as TableSort, options)
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
          return button.render?.(h, button)
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
          const searchConfig = column.searchConfig
          cols.push({
            ...column,
            filter: searchConfig ? deriveColumnFilter(searchConfig) : undefined,
          })
        }
      })
      if (calcWidthOperationColumn?.value) {
        cols.push(calcWidthOperationColumn.value)
      }
      return cols
    })

    const filterValue = computed(() =>
      payloadsToFilterValue(searchPayloads.value, filterableColumns.value),
    )

    const handleFilterChange = (
      filterValue: FilterValue,
      context: TableFilterChangeContext<TableRowData>,
    ) => {
      setSearchPayloads(
        filterValueToPayloads(filterValue, filterableColumns.value),
      )
      props.onFilterChange?.(filterValue, context)
    }

    // 行选择由组件内部完全接管，初始无选中，只能由用户交互产生
    const selfSelectedRowKeys = ref<(string | number)[]>([])
    // selectedRowData 直接用 tdesign 算好的，跨页保留与否由使用方的配置决定
    const selectedRowData = ref<TableRowData[]>([])
    const handleSelectChange: NonNullable<
      EnhancedTableProps['onSelectChange']
    > = (selectedRowKeys, context) => {
      selfSelectedRowKeys.value = selectedRowKeys
      selectedRowData.value = context.selectedRowData
      props.onSelectChange?.(selectedRowKeys, context)
    }
    // 把选中数据注入按钮 onClick，子菜单递归
    const getTopLeftButtonDropdownProps = ():
      | TmButtonDropdownProps
      | undefined => {
      const dropdownProps = props.topLeftButtonDropdown
      if (!dropdownProps) {
        return undefined
      }
      const wrapButtons = (
        buttons: TmButtonDropdownItemWithCustomOnClick<
          (selection: TmTableSelection, e: MouseEvent) => void
        >[],
      ): TmButtonDropdownItem[] => {
        return buttons.map((button) => ({
          ...button,
          onClick: (e: MouseEvent) => {
            button.onClick?.(
              {
                selectedRowKeys: selfSelectedRowKeys.value,
                selectedRowData: selectedRowData.value,
              },
              e,
            )
          },
          children: button.children ? wrapButtons(button.children) : undefined,
        }))
      }
      const { buttons, ...rest } = dropdownProps
      return {
        ...rest,
        buttons: buttons ? wrapButtons(buttons) : undefined,
      }
    }

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
                  {...getTopLeftButtonDropdownProps()}
                ></TmButtonDropdown>
              </div>
              {isTopLeftShowCompositeSearch.value && (
                <TmCompositeSearch
                  {...compositeSearchProps.value}
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
                {...compositeSearchProps.value}
              ></TmCompositeSearch>
            )}
            <TmCompositeSearchTags
              ref={tmCompositeSearchTagsRef}
              {...{
                // 覆盖原来的onClear
                ...compositeSearchTagsProps.value,
                onClear: handleClearSearch,
              }}
            ></TmCompositeSearchTags>
          </div>
          <EnhancedTable
            v-slots={slots}
            {...{
              ...tProps,
              onFilterChange: handleFilterChange,
              onSelectChange: handleSelectChange,
              // 内部受控：始终传数组，tdesign 靠 hasOwnProperty 判定受控并读这个值
              selectedRowKeys: selfSelectedRowKeys.value,
              // 请求模式下接管排序（自管理 sort 状态，defaultSort 作初始值）
              ...(props?.request
                ? { sort: selfSort.value, onSortChange: handleSortChange }
                : {}),
            }}
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
            filterValue={filterValue.value}
          />
        </div>
      )
    }
  },
})
