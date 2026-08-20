import type { InjectionKey, MaybeRef, Ref } from 'vue'
import { computed, inject, isRef, provide, ref, unref } from 'vue'
import { get } from 'lodash-unified'
import Chinese from '@tailor-more/t-more-locale/lang/zh-cn'

import type { Language } from '@tailor-more/t-more-locale'

const localeInjectionKey: InjectionKey<Ref<Language> | Language> =
  Symbol('locale')

export const provideLocale = (locale: Ref<Language> | Language) => {
  provide(localeInjectionKey, locale)
}

export type TranslatorOption = Record<string, string | number>
export type Translator = (path: string, option?: TranslatorOption) => string
export type LocaleContext = {
  locale: Ref<Language>
  lang: Ref<string>
  t: Translator
}

export const translate = (
  path: string,
  option: undefined | TranslatorOption,
  locale: Language,
): string =>
  (get(locale, path, path) as string).replace(
    /\{(\w+)\}/g,
    (_, key) => `${option?.[key] ?? `{${key}}`}`,
  )

export const buildTranslator =
  (locale: MaybeRef<Language>): Translator =>
  (path, option) =>
    translate(path, option, unref(locale))

export const buildLocaleContext = (
  locale: MaybeRef<Language>,
): LocaleContext => {
  const lang = computed(() => unref(locale).name)
  const localeRef = isRef(locale) ? locale : ref(locale)
  return {
    lang,
    locale: localeRef,
    t: buildTranslator(locale),
  }
}

export const useLocale = () => {
  const locale = inject(localeInjectionKey) || Chinese
  return buildLocaleContext(locale)
}
