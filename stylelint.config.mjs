/** @type {import("stylelint").Config} */
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-less',
    'stylelint-config-recommended-vue',
  ],
  rules: {
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'custom-property-empty-line-before': null,
    'no-duplicate-selectors': null,
  },
  overrides: [
    {
      files: ['**/*.less'],
      customSyntax: 'postcss-less',
      rules: {
        // 该规则只适用于 CSS，Less 变量与字面量混用（如 `1px solid @border`）会被误判
        'declaration-property-value-no-unknown': null,
      },
    },
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
      rules: {
        'media-query-no-invalid': null,
        // 为Vue文件中的Less样式块启用Less语法
        'selector-pseudo-class-no-unknown': [
          true,
          {
            ignorePseudoClasses: ['global', 'deep', 'slotted'],
          },
        ],
      },
    },
    {
      files: ['**/*.html'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
      customSyntax: 'postcss-jsx',
    },
  ],
}
