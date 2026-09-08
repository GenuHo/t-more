<template>
  <div class="example-sort-single">
    <tm-table
      :columns="columns"
      :request="fetchData"
      :default-sort="defaultSort"
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

// 单字段排序（默认不开启 multiple-sort）：同一时间只按一个字段排序
// defaultSort 传单个对象，首次加载即按 created 降序请求
const defaultSort = { sortBy: 'createdAt', descending: true }

// --- Mock data ---

const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']
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
    amount: Math.floor(Math.random() * 9800) + 200,
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
  // 打印实际发送给接口的查询参数，便于观察排序参数的变化
  console.log(params)
  const { current, pageSize, sortBy = '', descending = '' } = params

  // 排序参数解析：单字段下 sortBy / descending 各只有一个值
  const sortKeys = sortBy
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean)
  const directions = descending.split(',').map((item) => item.trim())
  const orders = sortKeys.map((key, index) => ({
    key,
    descending: String(directions[index]).toLowerCase() === 'true',
  }))

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
