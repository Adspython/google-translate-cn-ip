import { check, CheckResult } from './check'

function defaultSorter(a: CheckResult, b: CheckResult): number {
  // 如果两个都是可用的，则响应时间少的排前面
  if (a.valid && b.valid) {
    return a.time - b.time
  }

  // 如果两个都不可用
  if (!a.valid && !b.valid) {
    if (
      ('statusCode' in a && 'statusCode' in b) ||
      ('error' in a && 'error' in b) ||
      ('timeout' in a && 'timeout' in b)
    ) {
      return 0
    }

    // status code 不为 200 的排在前面
    if ('statusCode' in a || 'statusCode' in b) {
      return 'statusCode' in b ? 1 : -1
    }

    // 其次是 error
    if ('error' in a || 'error' in b) {
      return 'error' in b ? 1 : -1
    }

    // 最后是超时的
    if ('timeout' in b || 'timeout' in b) {
      return 'timeout' in b ? 1 : -1
    }
  }
  if (!a.valid) return 1
  return -1
}

export async function checkAll(
  hostList: string[],
  options?: {
    timeout?: number
    sorter?: null | ((a: CheckResult, b: CheckResult) => number)
  }
) {
  const results = (
    await Promise.allSettled(
      hostList.map((host) => check(host, options?.timeout))
    )
  ).map((r, index) => {
    if (r.status === 'fulfilled') {
      return r.value
    } else {
      return {
        host: hostList[index],
        valid: false as const,
        error: r.reason as unknown,
      }
    }
  })

  if (options?.sorter === null) {
    return results
  }

  return results.sort(options?.sorter || defaultSorter)
}
