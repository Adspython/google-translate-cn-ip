import https from 'node:https'

const r = /^[0-9.]+$/

const hostOptions = {
  headers: {
    Host: 'translate.googleapis.com',
  },
  servername: 'translate.googleapis.com',
}

export function checkIP(ipOrMirror: string, timeout = 10 * 1000) {
  const isIP = r.test(ipOrMirror)
  return new Promise<
    | { valid: true; time: number }
    | {
        valid: false
        timeout: true
      }
    | {
        valid: false
        error: unknown
      }
    | {
        valid: false
        statusCode: number
      }
  >((resolve) => {
    const now = Date.now()
    const req = https.get(
      `https://${ipOrMirror}/translate_a/element.js`,
      {
        timeout,
        ...(isIP ? hostOptions : {}),
      },
      (res) => {
        const time = Date.now() - now
        const valid = res.statusCode === 200
        if (valid) {
          resolve({
            time,
            valid: true,
          })
        } else {
          resolve({ valid: false, statusCode: res.statusCode! })
        }
        // Consume response data to free up memory
        // @see https://nodejs.org/docs/latest-v18.x/api/http.html#class-httpclientrequest
        res.resume()
      }
    )

    req.on('timeout', () => {
      resolve({ valid: false, timeout: true })
      req.destroy()
    })

    req.on('error', (err) => {
      resolve({
        valid: false,
        error: err,
      })
    })
  })
}

// checkIP('translate.amz.wang').then(console.log)
// checkIP('108.177.97.100').then(console.log)
// checkIP('142.250.4.90').then(console.log)
