import https from 'node:https'

export type CheckResult =
  | { host: string; valid: true; time: number }
  | { host: string; valid: false; timeout: true }
  | { host: string; valid: false; error: unknown }
  | { host: string; valid: false; statusCode: number }

const r = /^[0-9.]+$/

// @see https://stackoverflow.com/a/53581777
const hostOptions = {
  headers: {
    Host: 'translate.googleapis.com',
  },
  servername: 'translate.googleapis.com',
}

export function check(host: string, timeout = 10 * 1000) {
  const isIP = r.test(host)
  return new Promise<CheckResult>((resolve) => {
    const now = Date.now()
    const req = https.get(
      `https://${host}/translate_a/element.js`,
      {
        timeout,
        ...(isIP ? hostOptions : {}),
      },
      (res) => {
        const time = Date.now() - now
        const valid = res.statusCode === 200
        if (valid) {
          resolve({
            host,
            time,
            valid: true,
          })
        } else {
          resolve({ host, valid: false, statusCode: res.statusCode! })
        }
        // Consume response data to free up memory
        // @see https://nodejs.org/docs/latest-v18.x/api/http.html#class-httpclientrequest
        res.resume()
      }
    )

    req.on('timeout', () => {
      resolve({ host, valid: false, timeout: true })
      req.destroy()
    })

    req.on('error', (err) => {
      resolve({
        host,
        valid: false,
        error: err,
      })
    })
  })
}
