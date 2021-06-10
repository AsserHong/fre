import { IFiber, ITask, ITaskCallback } from "./type"
import { config } from "./reconciler"

const queue: ITask[] = []
const threshold: number = 1000 / 60
const transitions = []
let deadline: number = 0

export const startTransition = (cb) => {
  transitions.push(cb) === 1 && postMessage()
}

export const scheduleWork = (callback: ITaskCallback): void => {
  const job = {
    callback,
  }
  queue.push(job as any)
  startTransition(flushWork)
}

const postMessage = (() => {
  const cb = () => transitions.splice(0, 1).forEach((c) => c())

  if (typeof MessageChannel !== "undefined") {
    const { port1, port2 } = new MessageChannel()
    port1.onmessage = cb
    return () => port2.postMessage(null)
  }
  return () => setTimeout(cb)
})()

const flushWork = (): void => {
  deadline = getTime() + threshold
  let job = peek(queue)
  while (job && !shouldYield()) {
    const { callback } = job as any
    job.callback = null
    const next = callback()
    if (next) {
      job.callback = next as any
    } else {
      queue.shift()
    }
    job = peek(queue)
  }
  job && startTransition(flushWork)
}

export const shouldYield = (): boolean => {
  if (config && config.sync) return false
  return (
    (navigator as any)?.scheduling?.isInputPending() || getTime() >= deadline
  )
}

export const getTime = () => performance.now()

const peek = (queue: ITask[]) => queue[0]
