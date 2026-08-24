---
title: Table
---

# Table

表格组件在 `tdesign-vue-next` 的 `Table` 组件基础上封装，继承了 `tdesign-vue-next` 的 `Table` 组件的类型，扩展实现了表格的基本布局、搜索、高级搜索、自动请求、操作列宽度自动计算等逻辑。

## 基础使用

直接配置 `request` 就可以自动有请求数据的相关功能

:::demo
table/basic
:::

## 配置操作栏

`topLeftButtonDropdown` 可配置顶部左侧的操作栏。使用 [ButtonDropdown](/zh-cn/component/button-dropdown) 组件的配置。
`topRightButtons` 配置顶部右侧的操作栏。预置了 `reset` 和 `refresh` 按钮，也可以自行配置拓展其他按钮。

:::demo
table/operation-bar
:::

## 配置搜索

通过 `columns` 中每列的 `searchConfig` 配置搜索字段，`field` 和 `name` 默认取列的 `colKey` 和 `title`。支持三种搜索类型：

- **`input`** — 文本输入搜索
- **`single`** — 单选搜索，需传入 `list` 选项数据
- **`multiple`** — 多选搜索，需传入 `list` 选项数据

搜索条件会通过 `request` 参数传入，已选搜索条件以标签形式展示，支持单独关闭和全部清除。

:::demo
table/search
:::

## 配置操作列

使用 `useOperationColumn` 配置表格行操作列，传入 `buttonDropdown` 定义操作按钮，按钮的 `onClick` 回调会接收到当前行数据。组件内部检测到 `colKey` 为 `TM_OPERATION_COL_KEY` 的列时，会自动计算操作列宽度以适应单元格内容。

::: tip 操作列按钮样式
`useOperationColumn` 会在渲染时自动包裹一个 `tm-table__operation-cell` 容器。组件样式通过该容器精确选中内部的按钮，去除波纹动画、hover 背景色和边框，使操作列按钮在紧凑的表格单元格中更加干净。如果不使用 `useOperationColumn` 而是自行手写操作列，则这些样式覆盖不会生效。
:::

::: warning 注意
配置 `columns` 时，`colKey` 不要与内置常量 `TM_OPERATION_COL_KEY`（值为 `'TM_OPERATION_COL_KEY'`）重复，否则该列会被视为操作列处理，导致渲染异常。
:::

:::demo
table/operation-column
:::

## Table API

### TmTableProps

`TmTableProps` 继承自 `tdesign-vue-next` 的 [`EnhancedTableProps`](https://tdesign.tencent.com/vue-next/components/table?tab=api#enhancedtable-props)，在此基础上新增了以下属性：

| 参数                  | 类型                                                    | 默认值                 | 说明                                                                                                                                      |
| --------------------- | ------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| request               | `(params: any) => Promise<any>`                         | -                      | 表格数据请求接口。接收查询参数（包含分页、排序、搜索等），需返回 `{ results: any[], total: number }` 格式的数据                           |
| columns               | `TmTableCol[]`                                          | -                      | 表格列配置数组，扩展了 [PrimaryTableCol](https://tdesign.tencent.com/vue-next/components/table?tab=api#primarytablecol)，额外支持搜索配置 |
| topRightButtons       | `('reset' \| 'refresh' \| TmTableTopRightButtonItem)[]` | `['reset', 'refresh']` | 表格顶部右侧按钮配置。`'reset'` 为重置按钮，`'refresh'` 为刷新按钮，也可传入自定义按钮对象                                                |
| topLeftButtonDropdown | `TmButtonDropdownProps`                                 | -                      | 表格顶部左侧下拉按钮配置，用于配置批量操作等场景。使用 [ButtonDropdown](/zh-cn/component/button-dropdown) 组件的属性                      |

### TmTableCol

扩展自 `tdesign-vue-next` 的 [PrimaryTableCol](https://tdesign.tencent.com/vue-next/components/table?tab=api#primarytablecol)，新增搜索配置项：

| 参数         | 类型                                                           | 默认值 | 说明                                                                                                                 |
| ------------ | -------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| searchConfig | `PartialByKeys<TmCompositeSearchFieldItem, 'field' \| 'name'>` | -      | 搜索配置项。`field` 和 `name` 非必传，默认取列的 `colKey` 和 `title` 值。支持 `input`、`single`、`multiple` 三种类型 |

### TmTableTopRightButtonItem

自定义顶部右侧按钮项配置：

| 参数    | 类型                               | 默认值 | 说明                                                                           |
| ------- | ---------------------------------- | ------ | ------------------------------------------------------------------------------ |
| type    | `'refresh' \| 'reset' \| string`   | -      | 按钮类型。`'refresh'` 为刷新按钮，`'reset'` 为重置按钮，其他字符串为自定义类型 |
| render  | `TNode<TmTableTopRightButtonItem>` | -      | 自定义渲染函数，用于自定义按钮的渲染内容                                       |
| onClick | `(e: MouseEvent) => void`          | -      | 按钮点击事件回调                                                               |

### useOperationColumn

配置表格行操作列的 Hook，返回包含操作列配置的对象。

**参数 (config)**

| 参数           | 类型                                                                                            | 默认值 | 说明                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| column         | `Omit<TmTableCol, 'cell'>`                                                                      | -      | 操作列的基础配置，`cell` 属性会被覆盖                                                       |
| buttonDropdown | `TmButtonDropdownPropsWithCustomOnClick<(data: PrimaryTableCellParams, e: MouseEvent) => void>` | -      | 操作按钮下拉配置。按钮的 `onClick` 回调会接收当前行数据 `PrimaryTableCellParams` 和鼠标事件 |

**返回值**

| 参数            | 类型              | 说明                                              |
| --------------- | ----------------- | ------------------------------------------------- |
| operationColumn | `PrimaryTableCol` | 操作列的完整列配置，可直接放入 `columns` 数组使用 |

### TmTableInstance

组件暴露的实例方法：

| 方法名       | 类型                  | 说明                                              |
| ------------ | --------------------- | ------------------------------------------------- |
| getTableData | `() => Promise<void>` | 手动触发表格数据请求，调用 `request` 重新获取数据 |
