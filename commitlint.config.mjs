import { execSync } from 'node:child_process'
import { readdirSync } from 'node:fs'

// 目录名即 scope，随实际结构自动更新，不用手写列表
const dirNames = (path) => {
  try {
    return readdirSync(new URL(path, import.meta.url), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
  } catch {
    // 目录还没建起来时不贡献 scope，而不是让所有提交都挂掉
    return []
  }
}

const scopes = [
  ...dirNames('./packages'),
  ...dirNames('./internal'),
  'docs',
  'admin-app',
  'style',
  'ci',
  'dev',
  'deploy',
  'other',
  'typography',
  'color',
  'border',
  'var',
  // 'ssr',
  'types',
  'deps',
]

const gitStatus = execSync('git status --porcelain || true')
  .toString()
  .trim()
  .split('\n')

// 从暂存的改动里推断交互式提交的默认值：
// scope 只到 packages 下的一级目录，组件名作为 subject 前缀（feat(components): [table] ...）
const scopeComplete = gitStatus
  .find((line) => line.includes('M  packages'))
  ?.replace(/\//g, '%%')
  .match(/packages%%((\w|-)*)/)?.[1]

const subjectComplete = gitStatus
  .find((line) => line.includes('M  packages/components'))
  ?.replace(/\//g, '%%')
  .match(/packages%%components%%((\w|-)*)/)?.[1]

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        // prompt 只预填、拦不住 git commit -m，这里补上校验
        'subject-component-prefix': (parsed) => {
          if (parsed.scope !== 'components') return [true]
          return [
            /^(\[[\w-]+\])+\s/.test(parsed.subject || ''),
            'subject must start with [component] when scope is "components"',
          ]
        },
      },
    },
  ],
  rules: {
    // scope 可省略，写了就必须是上面的包名或工程目录名
    'scope-enum': [2, 'always', scopes],
    'subject-component-prefix': [2, 'always'],
  },
  prompt: {
    defaultScope: scopeComplete,
    customScopesAlign: !scopeComplete ? 'top' : 'bottom',
    defaultSubject: subjectComplete && `[${subjectComplete}] `,
    allowCustomIssuePrefix: false,
    allowEmptyIssuePrefix: false,
  },
}
