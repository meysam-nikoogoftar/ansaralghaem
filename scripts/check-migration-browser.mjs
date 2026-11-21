import assert from 'node:assert/strict'
import fs from 'node:fs'

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3000'
const target = await (await fetch('http://127.0.0.1:9223/json/new?about:blank', { method: 'PUT' })).json()
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
let id = 0
const pending = new Map(), handshakes = [], failures = [], exceptions = []
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const callbacks = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) callbacks.reject(new Error(JSON.stringify(message.error)))
    else callbacks.resolve(message.result)
  }
  if (message.method === 'Network.webSocketHandshakeResponseReceived') handshakes.push(message.params.response.status)
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text)
  if (message.method === 'Network.responseReceived') {
    const { response, type } = message.params
    if (['Script', 'Stylesheet', 'Image', 'Font'].includes(type) && response.status >= 400) failures.push(response.url)
  }
})
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const key = ++id; pending.set(key, { resolve, reject }); socket.send(JSON.stringify({ id: key, method, params }))
})
const evaluate = async expression => {
  const value = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  assert.ok(!value.exceptionDetails, JSON.stringify(value.exceptionDetails))
  return value.result.value
}
try {
  await send('Page.enable'); await send('Network.enable'); await send('Runtime.enable')
  await send('Page.navigate', { url: base })
  const deadline = Date.now() + 30000
  while (!(await evaluate(`document.readyState === 'complete' && Boolean(document.querySelector('#root')?.children.length)`))) {
    assert.ok(Date.now() < deadline, `Legacy page loaded in browser: ${JSON.stringify({ failures, exceptions, state: await evaluate('({url:location.href,text:document.body.innerText.slice(0,500)})') })}`)
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  await evaluate('document.fonts.ready.then(() => true)')
  await new Promise(resolve => setTimeout(resolve, 1500))
  assert.deepEqual(failures, [], 'Static resources load')
  assert.deepEqual(exceptions, [], 'No browser exceptions')
  assert.equal(await evaluate(`document.fonts.check('16px Vazirmatn')`), true)
  if (process.argv.includes('--dev')) assert.ok(handshakes.includes(101), 'Vite HMR websocket connected')
  const report = { base, failures, exceptions, handshakes, font: 'loaded' }
  fs.mkdirSync('frontend/.test-artifacts', { recursive: true })
  fs.writeFileSync(`frontend/.test-artifacts/migration-browser-${process.argv.includes('--dev') ? 'dev' : 'production'}.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} finally {
  await send('Page.close').catch(() => {}); socket.close()
}
