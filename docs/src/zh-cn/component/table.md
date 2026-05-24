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

::: warning 注意
配置 `columns` 时，`colKey` 不要与内置常量 `TM_OPERATION_COL_KEY`（值为 `'TM_OPERATION_COL_KEY'`）重复，否则该列会被视为操作列处理，导致渲染异常。
:::

:::demo
table/operation-column
:::
