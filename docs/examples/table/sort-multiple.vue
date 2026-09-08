<template>
  <div class="example-sort">
    <tm-table
      :columns="columns"
      :request="fetchData"
      :default-sort="defaultSort"
      multiple-sort
      row-key="id"
    ></tm-table>
  </div>
</template>

<script setup lang="tsx">
import type { TmTableCol } from '@tailor-more/t-more'

interface ApplicantRow {
  id: number
  name: { first: string; last: string }
  status: 0 | 1 | 2
  amount: number
  createdAt: number
}

const statusNameListMap = {
  0: {
    label: 'Approved',
    theme: 'success',
    icon: <CheckCircleFilledIcon />,
  },
  1: {
    label: 'Rejected',
    theme: 'danger',
    icon: <CloseCircleFilledIcon />,
  },
  2: {
    label: 'Expired',
    theme: 'warning',
    icon: <ErrorCircleFilledIcon />,
  },
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// createdAt 为时间戳数值，以纯数字格式展示（YYYY-MM-DD HH:mm:ss）
const formatDateTime = (timestamp: number) => {
  const d = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const columns: TmTableCol[] = [
  {
    colKey: 'serial-number',
  },
  {
    colKey: 'name',
    title: 'Name',
    render(h, { type, row: { name } }) {
      if (type === 'title') return 'Applicant'
      return name ? `${name.first} ${name.last}` : 'UNKNOWN_USER'
    },
  },
  {
    colKey: 'status',
    title: 'Status',
    width: 140,
    cell: (h, { row }) => {
      const status = row.status as keyof typeof statusNameListMap
      return (
        <t-tag
          shape="round"
          theme={statusNameListMap[status].theme}
          variant="light-outline"
        >
          {statusNameListMap[status].icon}
          {statusNameListMap[status].label}
        </t-tag>
      )
    },
  },
  {
    colKey: 'amount',
    title: 'Amount',
    align: 'right',
    // 布尔 sorter：仅展示排序图标并触发 request，不做本地重排（服务端排序）
    sorter: true,
    cell: (h, { row: { amount } }) => currencyFormatter.format(amount),
  },
  {
    colKey: 'createdAt',
    title: 'Created',
    width: 170,
    sorter: true,
    cell: (h, { row: { createdAt } }) => formatDateTime(createdAt),
  },
]

// 多字段排序演示：参数靠前的字段优先级更高。amount 为第一优先级（存在大量相同档位），
// amount 相等时再按 createdAt 排序，一加载就能看出「主字段分组 + 次级字段打破平局」的效果
// 开启 multiple-sort 时 defaultSort 需用数组形态
const defaultSort = [
  { sortBy: 'amount', descending: false },
  { sortBy: 'createdAt', descending: false },
]

// --- Mock data ---

const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']
// 金额按档位取值产生重复值：单页内既能同时看到多个金额档位，
// 又存在相同金额，便于展示「先按第一个字段排序，相等时再按后续字段」
const amountTiers = Array.from({ length: 20 }, (_, i) => (i + 1) * 250)
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
const allData: ApplicantRow[] = Array.from({ length: 120 }, (_, i) => {
  const first = randomItem(firstNames)
  const last = randomItem(lastNames)
  return {
    id: i + 1,
    name: { first, last },
    status: (i % 3) as 0 | 1 | 2,
    amount: randomItem(amountTiers),
    createdAt: Date.now() - Math.floor(Math.random() * 90 * 24 * 3600 * 1000),
  }
})

// 可排序列均为数值（amount / createdAt），差值即比较结果
const compareBy = (a: ApplicantRow, b: ApplicantRow, key: string) =>
  (a[key as keyof ApplicantRow] as number) -
  (b[key as keyof ApplicantRow] as number)

const fetchData = async (params: {
  current: number
  pageSize: number
  sortBy?: string
  descending?: string
}) => {
  // 打印实际发送给接口的查询参数，便于观察多字段排序参数（sortBy / descending 逗号拼接）
  console.log(params)
  const { current, pageSize, sortBy = '', descending = '' } = params

  // 排序参数解析：sortBy / descending 均为逗号拼接，位置一一对应
  // 例：sortBy=amount,createdAt&descending=true,false → amount 降序、createdAt 升序
  const sortKeys = sortBy
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean)
  const directions = descending.split(',').map((item) => item.trim())
  const orders = sortKeys.map((key, index) => ({
    key,
    descending: String(directions[index]).toLowerCase() === 'true',
  }))

  // 按参数顺序逐字段比较：先按第一个字段排序，相同（diff 为 0）时再按第二个字段……
  // 越靠前的字段优先级越高
  const result = allData.slice()
  if (orders.length) {
    result.sort((a, b) => {
      for (const order of orders) {
        const diff = compareBy(a, b, order.key)
        if (diff !== 0) return order.descending ? -diff : diff
      }
      return 0
    })
  }

  const total = result.length
  const start = (current - 1) * pageSize
  const results = result.slice(start, start + pageSize)

  await new Promise((resolve) => setTimeout(resolve, 300))

  return { results, total }
}
</script>
