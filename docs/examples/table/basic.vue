<template>
  <div class="example-basic">
    <tm-table :columns="columns" :request="fetchData"></tm-table>
  </div>
</template>

<script setup lang="tsx">
import type { TmTableCol } from '@tailor-more/t-more'

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
    cell: (h, { rowIndex }) => {
      const status = (rowIndex % 3) as keyof typeof statusNameListMap
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
]

const fetchData = async ({
  current,
  pageSize,
}: {
  current: number
  pageSize: number
}) => {
  // Request may have cross-origin issues
  const response = await fetch(
    `https://randomuser.me/api?page=${current}&results=${pageSize}`,
  )
  const responseJson = (await response.json()) as any
  responseJson.total = 120
  return responseJson
}
</script>
