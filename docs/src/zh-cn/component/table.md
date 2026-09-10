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

通过 `columns` 中每列的 `searchConfig` 配置搜索字段，`field` 默认取列的 `colKey`，`name` 默认取列渲染后的表头文本（`title` 为渲染函数时同样生效）。支持三种搜索类型：

- **`input`** — 文本输入搜索
- **`single`** — 单选搜索，需传入 `list` 选项数据
- **`multiple`** — 多选搜索，需传入 `list` 选项数据

搜索条件会通过 `request` 参数传入，已选搜索条件以标签形式展示，支持单独关闭和全部清除。

需要初始筛选条件时，可传 `default-filter-value`（键为可搜索列的 `colKey`），仅首次加载生效；之后的筛选状态由组件内部管理。

### 与表头筛选联动

配置了 `searchConfig` 的列，会自动生成表头筛选图标，并与顶部搜索**双向同步**：

- 在表头筛选（`single` / `multiple` 带 `list` 选项、`input` 为文本输入，均需点击「确定」后生效），会同步更新顶部搜索标签与 `request` 参数；
- 在顶部搜索，也会同步表头筛选图标的高亮状态与弹窗内的已选值。

表头筛选由组件根据 `searchConfig` 自动生成，列配置中不接受 `filter`。`searchConfig.field` 需保证全局唯一。

::: warning 注意
`TmTable` 内部管理表头筛选状态：`filterValue` 不对外暴露（不接受受控），仅开放 `defaultFilterValue` 作初始值（首次加载生效）。`onFilterChange` 仍会在筛选变化时触发。
:::

::: tip `list` 支持响应式
`searchConfig.list` 可以传入以 `reactive` 包裹的响应式对象（如 `reactive<OptionData[]>([])`）：拿到选项后**整体替换它的内容**（如 `splice`），传入的引用保持不变，搜索标签、搜索下拉与表头筛选弹窗都会响应式刷新为最新选项的 `label`。

因此 `list` 来自后端请求（先渲染表格、后拿到选项）的场景同样适用：`defaultFilterValue` 仍会照常参与初始化，首屏 `request` 参数与搜索标签都会带上初始筛选值；选项返回前标签只展示字段名，选项返回后自动回显为 `字段名 : label`。
:::

:::demo
table/search
:::

## 配置排序

给 `columns` 中需要排序的列配 `sorter: true`（布尔值）即可开启表头排序。request 模式下点击表头会**重新触发 `request` 请求并回到第一页**，排序状态由组件内部管理，适用于服务端排序。

默认不开启 `multiple-sort` 时，同一时间只按**一个字段**排序：点击其他排序列会切换排序字段，再次点击可切换方向或清除排序。`default-sort` 传单个对象：

:::demo
table/sort-single
:::

开启 `multiple-sort` 后可**同时**按多列排序，排序字段按点击顺序排列、越靠前优先级越高（先按第一字段，相等时再按后续字段）；清空排序后 `request` 不再携带 `sortBy` / `descending`。`default-sort` 需以数组传入：

:::demo
table/sort-multiple
:::

### 排序参数

`request` 接收的排序参数与分页、搜索条件平铺在同一对象中，字段名沿用 `tdesign` 的 `sortBy` / `descending`，多字段排序以**逗号拼接**并按位置对齐：

```ts
// 单字段排序
{
  sortBy: 'amount',     // 排序列的 colKey
  descending: 'true',   // 'true' 降序 / 'false' 升序
}

// 多字段排序（开启 multiple-sort 后点击多个表头）
{
  sortBy: 'amount,createdAt',
  descending: 'true,false', // 与 sortBy 位置一一对应
}
```

### 行为约定

- `sorter: true`（布尔）仅渲染排序图标并触发排序变化，组件**不会**本地重排 `data`；排序结果统一以 `sortBy` / `descending` 参数并入 `request` 交给接口处理，**不要**为列传 `sorter` 比较函数（那会触发 tdesign 对当前数据的本地排序，与「数据由接口返回」的模型冲突）。
- 排序状态由组件内部管理，初始值取 `default-sort`（仅首次加载生效；开启 `multiple-sort` 时需以数组传入）；request 模式下 `sort` 属性被组件接管（与 `filter-value` 同理），但 `on-sort-change` 仍会触发。
- 切换排序会重置回第一页；顶部「重置」按钮会**清空搜索条件与排序**（回到无排序）；搜索标签区的「清空全部」只清空搜索条件、保留当前排序。

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

`TmTableProps` 继承自 `tdesign-vue-next` 的 [`EnhancedTableProps`](https://tdesign.tencent.com/vue-next/components/table?tab=api#enhancedtable-props)，在此基础上移除了 `filterValue`（表头筛选运行态由组件内部管理，仅开放 `defaultFilterValue` 作初始值），并新增了以下属性：

| 参数                  | 类型                                                    | 默认值                 | 说明                                                                                                                                      |
| --------------------- | ------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| request               | `(params: any) => Promise<any>`                         | -                      | 表格数据请求接口。接收查询参数（包含分页、排序、搜索等），需返回 `{ results: any[], total: number }` 格式的数据                           |
| columns               | `TmTableCol[]`                                          | -                      | 表格列配置数组，扩展了 [PrimaryTableCol](https://tdesign.tencent.com/vue-next/components/table?tab=api#primarytablecol)，额外支持搜索配置 |
| topRightButtons       | `('reset' \| 'refresh' \| TmTableTopRightButtonItem)[]` | `['reset', 'refresh']` | 表格顶部右侧按钮配置。`'reset'` 为重置按钮，`'refresh'` 为刷新按钮，也可传入自定义按钮对象                                                |
| topLeftButtonDropdown | `TmButtonDropdownProps`                                 | -                      | 表格顶部左侧下拉按钮配置，用于配置批量操作等场景。使用 [ButtonDropdown](/zh-cn/component/button-dropdown) 组件的属性                      |

### TmTableCol

扩展自 `tdesign-vue-next` 的 [PrimaryTableCol](https://tdesign.tencent.com/vue-next/components/table?tab=api#primarytablecol)，新增搜索配置项：

| 参数         | 类型                                                           | 默认值 | 说明                                                                                                                                                                                                                                                    |
| ------------ | -------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| searchConfig | `PartialByKeys<TmCompositeSearchFieldItem, 'field' \| 'name'>` | -      | 搜索配置项。`field` 非必传，默认取列的 `colKey`；`name` 非必传，默认取列渲染后的表头文本，也支持传函数 `() => string` 惰性求值。支持 `input`、`single`、`multiple` 三种类型。配置后会为列自动生成表头筛选（列不接受 `filter` 配置），与顶部搜索双向联动 |

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
