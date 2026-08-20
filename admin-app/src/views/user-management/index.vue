<template>
  <t-card :bordered="false">
    <tm-table
      row-key="id"
      :columns="columns"
      :request="fetchData"
      :top-left-button-dropdown="topLeftButtonDropdown"
    ></tm-table>
  </t-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  TmTable,
  type TmTableCol,
  useOperationColumn,
} from '@tailor-more/t-more-components'
import type { PrimaryTableCellParams } from 'tdesign-vue-next'
const buttonDropdownPropObj = {
  buttons: [
    {
      content: '新建',
      onClick: () => {
        console.log('新建')
      },
      children: [
        {
          content: '新建1',
          onClick: () => {
            console.log('新建1')
          },
          tooltipProps: {
            content: '新建1提示',
          },
          children: [
            {
              content: '新建1-1',
              tooltipProps: {
                content: '新建1-1提示',
              },
              disabled: true,
              onClick: () => {
                console.log('新建1-1')
              },
            },
          ],
        },
        {
          content: '新建2',
        },
      ],
    },
    {
      content: '删除',
    },
    {
      content: '你好',
    },
    {
      content: '操作你',
      disabled: true,
    },
  ],
}
const topLeftButtonDropdown = ref(buttonDropdownPropObj)

const { operationColumn } = useOperationColumn({
  buttonDropdown: {
    buttons: [
      {
        content: '新建',
        onClick: (
          data: PrimaryTableCellParams<MockDataItem>,
          e: MouseEvent,
        ) => {
          console.log('新建', data, e)
        },
        children: [
          {
            content: '新建1',
            onClick: () => {
              console.log('新建1')
            },
            tooltipProps: {
              content: '新建1提示',
            },
            children: [
              {
                content: '新建1-1',
                tooltipProps: {
                  content: '新建1-1提示',
                },
                disabled: true,
                onClick: () => {
                  console.log('新建1-1')
                },
              },
            ],
          },
          {
            content: '新建2',
          },
        ],
      },
      {
        content: '删除',
      },
      {
        content: '你好',
      },
      {
        content: '操作你',
        disabled: true,
      },
    ],
  },
})
const columns: TmTableCol[] = [
  {
    title: 'Name',
    colKey: 'name',
    searchConfig: {
      type: 'input',
      field: 'searchName',
      name: '名称',
      placeholder: '请输入名称',
    },
  },
  {
    title: 'Salary',
    colKey: 'salary',
    searchConfig: {
      type: 'input',
    },
  },
  {
    title: 'Address',
    colKey: 'address',
    searchConfig: {
      type: 'input',
    },
  },
  {
    title: 'Email',
    colKey: 'email',
    searchConfig: {
      type: 'input',
    },
  },
  operationColumn,
]
interface MockDataItem {
  key: string
  name: string
  salary: number
  address: string
  email: string
}

interface MockResponse {
  results: MockDataItem[]
  total: number
  current: number
  pageSize: number
}

const fetchData = ({
  current,
  pageSize,
}: {
  current: number
  pageSize: number
}): Promise<MockResponse> => {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      const allData: MockDataItem[] = [
        {
          key: '1',
          name: 'Jane Doe',
          salary: 23000,
          address: '32 Park Road, London',
          email: 'jane.doe@example.com',
        },
        {
          key: '2',
          name: 'Alisa Ross',
          salary: 25000,
          address: '35 Park Road, London',
          email: 'alisa.ross@example.com',
        },
        {
          key: '3',
          name: 'Kevin Sandra',
          salary: 22000,
          address: '31 Park Road, London',
          email: 'kevin.sandra@example.com',
        },
        {
          key: '4',
          name: 'Ed Hellen',
          salary: 17000,
          address: '42 Park Road, London',
          email: 'ed.hellen@example.com',
        },
        {
          key: '5',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '6',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '7',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '8',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '9',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '10',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '11',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '12',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '5',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '13',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '14',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '15',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '16',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '17',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '18',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '19',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '20',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '21',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '22',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
        {
          key: '23',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
      ]

      const total = allData.length
      const start = (current - 1) * pageSize
      const end = start + pageSize
      const pageData = allData.slice(start, end)

      resolve({
        results: pageData,
        total,
        current,
        pageSize,
      })
    }, 500) // 模拟300ms的网络延迟
  })
}
</script>
