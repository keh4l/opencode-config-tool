import fs from 'node:fs'
import path from 'node:path'

const DOCS_LOG_PATH = path.join('docs', 'vnext-uiux-upgrade-log.md')
const PLACEHOLDER_SENTINEL = '升级日志唯一正确位置：`aidocs/vnext-uiux-upgrade-log.md`'

function main() {
  if (!fs.existsSync(DOCS_LOG_PATH)) return

  const content = fs.readFileSync(DOCS_LOG_PATH, 'utf8')
  if (content.includes(PLACEHOLDER_SENTINEL)) return

  // If docs log exists and is not a redirect placeholder, fail fast.
  // This prevents accidental divergence between docs/ and aidocs/.
  // eslint-disable-next-line no-console
  console.error(
    [
      '[ERROR] 升级日志路径不一致：检测到 `docs/vnext-uiux-upgrade-log.md` 存在且不是重定向占位文件。',
      '正确位置：`aidocs/vnext-uiux-upgrade-log.md`（唯一真相）。',
      '请将 docs/ 下的日志替换为占位重定向文件，或删除该文件。',
    ].join('\n')
  )
  process.exit(1)
}

main()
