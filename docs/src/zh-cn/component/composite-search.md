---
title: CompositeSearch
---

# CompositeSearch

## 基础使用

组合搜索可快速配置出来搜索功能。需要配合 `useCompositeSearch` 的hook进行使用。

:::warning 字段说明
需要注意，`search` 事件中 `TmCompositeSearchPayload` 中 `label` 字段，在input搜索时和 `value` 字段值相同，在single和multiple筛选的时候就是对应 `OptionData` 的 `label` 值
:::

:::warning 为什么需要配合 `useCompositeSearch` 使用？
`useCompositeSearch` 中已经封装了各种操作搜索的逻辑，使用起来更加方便。同时，CompositeSearch 通常也会搭配其他组件（例如[CompositeSearchTags](/zh-cn/component/composite-search.html#配合compositesearchtags使用)）进行使用，该hook将参数统一暴露到上层管理，将相关的方法直接传给组件即可，这样用户可以只用关心组合搜索相关组件的布局即可。
:::

### 简化绑定

`useCompositeSearch` 返回的 `compositeSearchProps` 和 `compositeSearchTagsProps` 已分别将两个组件所需的参数打包，通过 `v-bind` 一行即可完成绑定，无需手动逐个传参。

**传统写法**

```vue
<template>
  <tm-composite-search
    :search-fields="searchFields"
    :value="searchPayloads"
    @search="addSearchPayload"
    @reset="removeSearchPayload"
  />
  <tm-composite-search-tags
    :value="searchPayloads"
    @close="removeSearchPayload"
    @clear="clearSearchPayloads"
  />
</template>
```

**使用 `compositeSearchProps` / `compositeSearchTagsProps` 后**

```vue
<template>
  <tm-composite-search v-bind="compositeSearchProps" />
  <tm-composite-search-tags v-bind="compositeSearchTagsProps" />
</template>
```

如果默认的清空逻辑不满足需求，可以在 `v-bind` 之后覆盖对应属性，例如 `v-bind="compositeSearchTagsProps" :on-clear="handleClear"`。

:::demo
composite-search/basic
:::

## 支持单选和多选

支持单选配置（`single`）和多选配置（`multiple`）。

:::demo
composite-search/single-multiple
:::

## 配合CompositeSearchTags使用

可以把两个组合搜索组件进行联动。

拆分组件的目的主要是为了方便不同的布局进行使用。

:::demo
composite-search/search-tags
:::

## useCompositeSearch API

组合搜索的状态管理 Hook，用于维护搜索条件的状态并提供增删改查能力。

### 参数 (options)

| 参数           | 类型                                                                                                             | 默认值 | 说明                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| onSearchChange | `(params: Record<string, TmCompositeSearchPayloadValue>) => void`                                                | -      | 搜索条件变化时的回调，参数为深拷贝后的 `{ field: value }` 对象                    |
| searchFields   | `TmCompositeSearchFieldItem[] \| Ref<TmCompositeSearchFieldItem[]> \| ComputedRef<TmCompositeSearchFieldItem[]>` | -      | 搜索字段配置（必填），可传数组或响应式引用，用于组装返回的 `compositeSearchProps` |

### 返回值

| 参数                     | 类型                                                  | 说明                                                                         |
| ------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| searchPayloads           | `ComputedRef<TmCompositeSearchPayload[]>`             | 当前所有搜索负载                                                             |
| addSearchPayload         | `(payload: TmCompositeSearchPayload) => void`         | 添加或更新搜索负载（按 `field` 去重，存在则更新）                            |
| removeSearchPayload      | `(payload: TmCompositeSearchPayload) => void`         | 移除指定 `field` 的搜索负载                                                  |
| clearSearchPayloads      | `() => void`                                          | 清空所有搜索负载                                                             |
| getSearchParams          | `() => Record<string, TmCompositeSearchPayloadValue>` | 获取深拷贝后的 `{ field: value }` 搜索参数对象                               |
| compositeSearchProps     | `ComputedRef<Required<TmCompositeSearchProps>>`       | 可直接 `v-bind` 到 `<tm-composite-search>` 的属性集合，所有属性均为必填      |
| compositeSearchTagsProps | `ComputedRef<Required<TmCompositeSearchTagsProps>>`   | 可直接 `v-bind` 到 `<tm-composite-search-tags>` 的属性集合，所有属性均为必填 |

## CompositeSearch API

### TmCompositeSearchProps

| 参数         | 类型                                        | 默认值 | 说明                 |
| ------------ | ------------------------------------------- | ------ | -------------------- |
| searchFields | TmCompositeSearchFieldItem[]                | []     | 搜索字段配置项数组   |
| value        | TmCompositeSearchPayload[]                  | -      | 搜索结果数据模型     |
| onSearch     | (payload: TmCompositeSearchPayload) => void | -      | 搜索事件回调函数     |
| onReset      | (payload: TmCompositeSearchPayload) => void | -      | 重置搜索事件回调函数 |

### TmCompositeSearchFieldItem

搜索字段项的联合类型，可为以下三种类型之一：

**TmCompositeSearchInputFieldItem (输入框类型)**

| 参数        | 类型    | 默认值 | 是否必填 | 说明                     |
| ----------- | ------- | ------ | -------- | ------------------------ |
| type        | 'input' | -      | 是       | 字段类型，固定值 'input' |
| name        | string  | -      | 是       | 字段显示名称             |
| field       | string  | -      | 是       | 对应数据字段名           |
| placeholder | string  | -      | 否       | 占位符文本               |

**TmCompositeSearchSingleFieldItem (单选类型)**

| 参数        | 类型         | 默认值 | 是否必填 | 说明                      |
| ----------- | ------------ | ------ | -------- | ------------------------- |
| type        | 'single'     | -      | 是       | 字段类型，固定值 'single' |
| name        | string       | -      | 是       | 字段显示名称              |
| field       | string       | -      | 是       | 对应数据字段名            |
| placeholder | string       | -      | 否       | 占位符文本                |
| list        | OptionData[] | -      | 是       | 选项数据数组              |

**TmCompositeSearchMultipleFieldItem (多选类型)**

| 参数        | 类型         | 默认值 | 是否必填 | 说明                        |
| ----------- | ------------ | ------ | -------- | --------------------------- |
| type        | 'multiple'   | -      | 是       | 字段类型，固定值 'multiple' |
| name        | string       | -      | 是       | 字段显示名称                |
| field       | string       | -      | 是       | 对应数据字段名              |
| placeholder | string       | -      | 否       | 占位符文本                  |
| list        | OptionData[] | -      | 是       | 选项数据数组                |

### 事件

| 事件名 | 参数                                        | 描述                 |
| ------ | ------------------------------------------- | -------------------- |
| search | (payload: TmCompositeSearchPayload) => void | 搜索触发时的回调函数 |
| reset  | (payload: TmCompositeSearchPayload) => void | 重置搜索时的回调函数 |

## CompositeSearchTags API

### TmCompositeSearchTagsProps

| 参数    | 类型                                      | 默认值 | 说明                         |
| ------- | ----------------------------------------- | ------ | ---------------------------- |
| value   | TmCompositeSearchPayload[]                | -      | 搜索结果数据模型             |
| onClose | (value: TmCompositeSearchPayload) => void | -      | 搜索结果标签关闭事件回调函数 |
| onClear | () => void                                | -      | 搜索结果标签清空事件回调函数 |

### 事件

| 事件名 | 参数                                      | 描述                         |
| ------ | ----------------------------------------- | ---------------------------- |
| close  | (value: TmCompositeSearchPayload) => void | 搜索结果标签关闭时的回调函数 |
| clear  | () => void                                | 搜索结果标签清空时的回调函数 |
