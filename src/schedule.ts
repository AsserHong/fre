import { ITask } from './type'

const queue: ITask[] = []
const threshold: number = 5 // time slicing
const transitions = []
let deadline: number = 0

export const startTransition = cb => {
  transitions.push(cb) && translate()
}

export const schedule = (callback: any): void => {
  queue.push({ callback } as any)
  startTransition(flush)
}

const task = (pending: boolean) => {
  // array.splice(0, 1)  means get the first element and remove it
  const cb = () => transitions.splice(0, 1).forEach(c => c())
  if (!pending && typeof queueMicrotask !== 'undefined') {
    return () => queueMicrotask(cb)
  }
  if (typeof MessageChannel !== 'undefined') {
    const { port1, port2 } = new MessageChannel()
    port1.onmessage = cb
    return () => port2.postMessage(null)
  }
  return () => setTimeout(cb)
}

let translate = task(false)

const flush = (): void => {
  deadline = getTime() + threshold
  let job = peek(queue) // 获取schedule队列中的第一个任务
  while (job && !shouldYield()) {
    const { callback } = job as any
    job.callback = null
    const next = callback() // callBack() 会返回一个新的reconcile / null
    if (next) {
      job.callback = next as any
    } else {
      queue.shift()
    }
    job = peek(queue)
  }
  job && (translate = task(shouldYield())) && startTransition(flush)
}

export const shouldYield = (): boolean => {
  return getTime() >= deadline
}

// 以毫秒为单位，最高精度可以精确到微秒
// 为什么不使用Date.now() 因为它会受到系统时间的影响
export const getTime = () => performance.now()

const peek = (queue: ITask[]) => queue[0]