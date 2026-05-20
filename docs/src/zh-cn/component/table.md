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
