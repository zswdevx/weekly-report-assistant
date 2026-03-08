export function formatCommitMessage(message: string): string {
  // 匹配 Conventional Commits 格式: type(scope)!: message
  const match = message.match(/^(?:\w+)(?:\(([^)]+)\))?(?:!)?:\s*(.*)$/)
  if (match) {
    const scope = match[1]
    const msg = match[2]
    if (scope) {
      return `【${scope}】${msg}`
    }
    return msg
  }
  return message
}
