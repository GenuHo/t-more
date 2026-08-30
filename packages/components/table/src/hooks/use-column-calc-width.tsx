import type { PrimaryTableCol } from 'tdesign-vue-next'
import { computed, ref } from 'vue'

// 操作列的最小宽度
const MIN_WIDTH = 80

export const useColumnCalcWidth = (column: PrimaryTableCol) => {
  // 生成一个随机字符串，用于标记表头与单元格
  const random = Math.random().toString(36).substring(2, 10)
  const thClass = `th-class-${random}`
  const tdClass = `td-class-${random}`

  const width = ref<number>(MIN_WIDTH)

  // 统计同一类节点中的最大内容宽度（含 padding），表头与单元格共用
  const getMaxContentWidth = (className: string) => {
    let maxWidth = 0
    Array.from(document.getElementsByClassName(className)).forEach((node) => {
      // 使用 range 计算子节点的总宽度
      const range = document.createRange()
      range.setStart(node, 0)
      range.setEnd(node, node.childNodes.length)
      const style = window.getComputedStyle(node)
      const paddingLeft =
        parseFloat(style.getPropertyValue('padding-left')) || 0
      const paddingRight =
        parseFloat(style.getPropertyValue('padding-right')) || 0
      const contentWidth =
        range.getBoundingClientRect().width + paddingLeft + paddingRight
      maxWidth = Math.max(maxWidth, contentWidth)
    })
    return maxWidth
  }

  const calcWidth = () => {
    const maxWidth = Math.max(
      getMaxContentWidth(thClass),
      getMaxContentWidth(tdClass),
    )
    // 直接取当前内容宽度，数据变化后宽度可以回缩
    width.value = Math.max(maxWidth, MIN_WIDTH)
  }

  const c = computed(() => {
    const className: PrimaryTableCol['className'] = [
      ({ type }) => {
        if (type === 'th') {
          return thClass
        } else if (type === 'td') {
          return tdClass
        }
      },
    ]
    if (column.className) {
      className.push(column.className)
    }
    const c: PrimaryTableCol = {
      ...column,
      cell: (h, p) => {
        const r = () => {
          if (typeof column.cell === 'string') {
            return column.cell
          } else if (typeof column.cell === 'function') {
            return column.cell(h, p)
          }
        }
        return <div style="display: inline-flex">{r()}</div>
      },
      width: width.value,
      className,
    }
    return c
  })
  return {
    column: c,
    calcWidth,
  }
}
