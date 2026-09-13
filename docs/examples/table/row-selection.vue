<template>
  <div class="example-row-selection">
    <tm-table
      :columns="columns"
      :request="fetchData"
      :top-left-button-dropdown="topLeftButtonDropdown"
      row-key="id"
    ></tm-table>
  </div>
</template>

<script setup lang="tsx">
import type { TmTableCol, TmTableProps } from '@tailor-more/t-more'

const allUsers = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  department: ['Design', 'Frontend', 'Backend'][index % 3],
}))

const columns: TmTableCol[] = [
  // 选中列：colKey 固定为 row-select，type 为 multiple 可多选
  { colKey: 'row-select', type: 'multiple', width: 46 },
  { colKey: 'name', title: 'Name' },
  { colKey: 'department', title: 'Department' },
]

const fetchData = async ({
  current,
  pageSize,
}: {
  current: number
  pageSize: number
}) => {
  const start = (current - 1) * pageSize
  return {
    results: allUsers.slice(start, start + pageSize),
    total: allUsers.length,
  }
}

const topLeftButtonDropdown: TmTableProps['topLeftButtonDropdown'] = {
  buttons: [
    {
      content: '批量删除',
      theme: 'danger',
      // TmTable 注入了当前选中数据，无需自己维护
      onClick: (selection) => {
        const names = selection.selectedRowData.map((row) => row.name)
        MessagePlugin.info(
          `keys: [${selection.selectedRowKeys.join(', ')}]，` +
            `行数据: [${names.join(', ')}]`,
        )
      },
    },
  ],
}
</script>
