<template>
  <div class="example-operation-column">
    <tm-table :columns="columns" :request="fetchData"></tm-table>
  </div>
</template>

<script setup lang="tsx">
import type { TmTableCol } from 'tdesign-vue-next-more'
import { useOperationColumn } from 'tdesign-vue-next-more'

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

const { operationColumn } = useOperationColumn({
  buttonDropdown: {
    moreButtonProps: {
      variant: 'text',
      shape: 'square',
      content: () => <MoreIcon />,
      suffix: () => undefined,
    },
    buttons: [
      {
        content: 'Edit',
        onClick(data) {
          MessagePlugin.success(
            `Edit row: ${data.row.name.first} ${data.row.name.last}`,
          )
        },
        theme: 'primary',
      },
      {
        content: 'Delete',
        onClick(data) {
          MessagePlugin.warning(
            `Delete row: ${data.row.name.first} ${data.row.name.last}`,
          )
        },
      },
    ],
  },
})

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
    title: 'Application Status',
    width: 120,
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
    colKey: 'phone',
    title: 'Contact Number',
    render(h, { row: { phone } }) {
      return phone
    },
  },
  {
    colKey: 'email',
    title: 'Email',
    ellipsis: true,
  },
  operationColumn,
]

// --- Mock data ---

const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']
const departments = ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations']
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function generateMockData(count: number) {
  const data = []
  for (let i = 0; i < count; i++) {
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    data.push({
      id: i + 1,
      name: { first: firstName, last: lastName },
      status: (i % 3) as 0 | 1 | 2,
      phone: `1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      department: randomItem(departments),
    })
  }
  return data
}
const allData = generateMockData(120)

const fetchData = async (params: {
  current: number
  pageSize: number
  [key: string]: any
}) => {
  const { current, pageSize, ...searchParams } = params

  let filteredData = allData

  Object.entries(searchParams).forEach(([field, filterValue]) => {
    if (filterValue === undefined || filterValue === null || filterValue === '')
      return
    if (Array.isArray(filterValue) && filterValue.length === 0) return

    if (field === 'name') {
      const keyword = String(filterValue).toLowerCase()
      filteredData = filteredData.filter((item) =>
        `${item.name.first} ${item.name.last}`.toLowerCase().includes(keyword),
      )
    } else if (field === 'status') {
      filteredData = filteredData.filter((item) => item.status === filterValue)
    } else if (field === 'department') {
      const values = Array.isArray(filterValue) ? filterValue : [filterValue]
      filteredData = filteredData.filter((item) =>
        values.includes(item.department),
      )
    }
  })

  const total = filteredData.length
  const start = (current - 1) * pageSize
  const results = filteredData.slice(start, start + pageSize)

  await new Promise((resolve) => setTimeout(resolve, 500))

  return { results, total }
}
</script>
