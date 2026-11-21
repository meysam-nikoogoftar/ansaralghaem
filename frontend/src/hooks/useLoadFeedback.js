import { useCallback, useRef, useState } from 'react'

export default function useLoadFeedback() {
  const failures = useRef(new Map())
  const pending = useRef(0)
  const [loadState, setLoadState] = useState({ pending: 0, errors: [], started: false })
  const publish = useCallback(() => setLoadState({ pending: pending.current, errors: [...failures.current.values()].map(item => item.status), started: true }), [])
  const observeLoad = useCallback(async (operation, key = 'page') => {
    pending.current += 1
    failures.current.delete(key)
    publish()
    try {
      return await operation()
    } catch (error) {
      if (error.code !== 'ERR_CANCELED') failures.current.set(key, { operation, status: error.response?.status })
      return undefined
    } finally {
      pending.current -= 1
      publish()
    }
  }, [publish])
  const retryLoad = useCallback(() => {
    for (const [key, { operation }] of [...failures.current]) observeLoad(operation, key)
  }, [observeLoad])
  return { observeLoad, loadState, retryLoad }
}
