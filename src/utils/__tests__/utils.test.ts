import { describe, expect, it } from 'vitest'
import { formatCommitMessage } from '../utils'

describe('formatCommitMessage', () => {
  it('移除 type 并替换 scope 括号', () => {
    expect(formatCommitMessage('feat(ui): add button')).toBe('【ui】add button')
  })

  it('只有 type 时移除 type', () => {
    expect(formatCommitMessage('fix: bug fix')).toBe('bug fix')
  })

  it('支持带 scope 的其他类型', () => {
    expect(formatCommitMessage('docs(readme): update')).toBe('【readme】update')
  })

  it('支持破坏性变更标记 !', () => {
    expect(formatCommitMessage('refactor(core)!: change api')).toBe('【core】change api')
  })

  it('不匹配时返回原消息', () => {
    expect(formatCommitMessage('merge branch develop')).toBe('merge branch develop')
  })
})
