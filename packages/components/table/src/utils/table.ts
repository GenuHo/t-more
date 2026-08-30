import type { SetupContext } from 'vue'
import { h } from 'vue'
import { isString, isFunction } from 'lodash-es'

import type { TableRowData, BaseTableColumns } from 'tdesign-vue-next'
import type { TmTableCol } from '../table-type'

export const createTableColWithColKey = <T extends TableRowData>(
  config: TmTableCol<T>,
  colKey: keyof T & string,
): TmTableCol<T> => {
  return {
    ...config,
    colKey,
  }
}

// 渲染表头的通用方法
// https://github.com/Tencent/tdesign-vue-next/blob/develop/packages/components/table/hooks/useTableHeader.tsx
export function renderTitle(
  slots: SetupContext['slots'],
  col: BaseTableColumns[0],
  index: number,
) {
  const params = { col, colIndex: index }
  if (isFunction(col.title)) {
    return col.title(h, params)
  }
  if (isString(col.title)) {
    const slot = slots[col.title]
    if (slot) return slot(params)
  }
  if (isFunction(col.render)) {
    return (
      col.render(h, {
        ...params,
        type: 'title',
        row: {},
        rowIndex: -1,
      }) || col.title
    )
  }
  return col.title
}
