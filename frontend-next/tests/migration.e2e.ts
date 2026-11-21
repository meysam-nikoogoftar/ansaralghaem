import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../', import.meta.url))
const result = spawnSync(process.env.SECURITY_TEST_PYTHON || `${root}backend/.venv/bin/python`, ['scripts/test-session-security.py'], { cwd: root, stdio: 'inherit' })
if (result.error) throw result.error
process.exitCode = result.status ?? 1
