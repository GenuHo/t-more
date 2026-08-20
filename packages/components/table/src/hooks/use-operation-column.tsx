import type {
  ButtonProps,
  PrimaryTableCellParams,
  PrimaryTableCol,
  TableRowData,
} from 'tdesign-vue-next'
import { useLocale, useNamespace } from '@tailor-more/t-more-hooks'
import type {
  TmButtonDropdownItem,
  TmButtonDropdownItemWithCustomOnClick,
  TmButtonDropdownProps,
  TmButtonDropdownPropsWithCustomOnClick,
  TmTableCol,
} from '@tailor-more/t-more-components'
import { TmButtonDropdown } from '@tailor-more/t-more-components'

export const TM_OPERATION_COL_KEY = 'TM_OPERATION_COL_KEY'

export const useOperationColumn = <
  T extends TableRowData = TableRowData,
>(config: {
  column?: Omit<TmTableCol, 'cell'>
  buttonDropdown: TmButtonDropdownPropsWithCustomOnClick<
    (data: PrimaryTableCellParams<T>, e: MouseEvent) => void
  >
}) => {
  const { t } = useLocale()
  const ns = useNamespace('table')
  const operationButtonProps: ButtonProps = {
    variant: 'text',
    theme: 'primary',
  }
  const operationColumn: PrimaryTableCol = {
    title: t('tm.table.operation'),
    colKey: TM_OPERATION_COL_KEY,
    cell: (h, params) => {
      const wrapper = (): TmButtonDropdownProps => {
        const buttons = config.buttonDropdown.buttons
        const dfsWrapper = (
          buttons: TmButtonDropdownItemWithCustomOnClick<
            (data: PrimaryTableCellParams<T>, e: MouseEvent) => void
          >[],
        ): TmButtonDropdownItem[] => {
          const result: TmButtonDropdownItem[] = []
          buttons.forEach((item) => {
            result.push({
              ...item,
              onClick: (e: MouseEvent) => {
                item.onClick?.(
                  params as unknown as PrimaryTableCellParams<T>,
                  e,
                )
              },
              children: item.children ? dfsWrapper(item.children) : undefined,
            })
          })
          return result
        }
        return {
          ...config.buttonDropdown,
          buttons: buttons ? dfsWrapper(buttons) : undefined,
        }
      }
      return (
        <div class={ns.e('operation-cell')}>
          <TmButtonDropdown
            {...wrapper()}
            buttonProps={
              config.buttonDropdown?.buttonProps || operationButtonProps
            }
          ></TmButtonDropdown>
        </div>
      )
    },
    fixed: 'right',
    ...config?.column,
  }
  return {
    operationColumn,
  }
}
