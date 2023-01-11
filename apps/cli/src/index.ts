#!/usr/bin/env node

import { program } from 'commander'
import fs from 'node:fs/promises'
import https from 'node:https'
import { check } from '@hcfy/check-google-translate-ip'
import HttpsProxyAgent = require('https-proxy-agent')

async function main() {
  program
    .name('ggc')
    .description('Check Google Translate IP.')
    .argument(
      '<ip / host list or file path>',
      'A comma-separated list of IP addresses / host, or when the -f parameter is specified, the file path.'
    )
    .option(
      '-f, --file',
      'If you are providing a file path, you need to declare this parameter.'
    )
    .option(
      '-u, --url',
      'If you are providing URL, you need to declare this parameter.'
    )
    .addHelpText(
      'after',
      `
Example call:
  $ ggc 172.253.114.90 # Check one IP address.
  $ ggc mirror.example.com # Check one host.
  $ ggc 172.253.114.90,mirror.example.com,142.250.9.90 # Check multiple IP addresses or host.
  $ ggc -f ./ips.txt # Check all IP addresses / host in ips.txt. IP addresses / host in ips.txt need to be separated by line breaks.
  $ ggc -u https://example.com/ips.txt # Load the IP address / host from the specified URL.`
    )
    .showHelpAfterError('(add -h for additional information)')
    .parse()

  const opts = program.opts<{ file?: boolean; url?: boolean }>()

  if (opts.file && opts.url) {
    console.log('error: `--file` and `--url` cannot be used at the same time..')
    return
  }

  // console.log(opts)
  // console.log(program.args[0])

  async function getList(
    str: string,
    file: boolean,
    url: boolean,
    agent?: https.Agent
  ) {
    let l: string[]
    if (file || url) {
      l = await readListFormFileOrURL(str, url, agent)
    } else {
      l = str.split(',')
    }
    return l.map((s) => s.trim()).filter((s) => !!s)
  }

  let agent: https.Agent | undefined
  if (opts.url) {
    const proxyEndpoint = process.env.https_proxy || process.env.http_proxy
    if (proxyEndpoint) {
      console.log('This proxy will be used to download file: ' + proxyEndpoint)
      console.log(
        'It will not be used to check if the IP / Host is available.\n'
      )
      agent = HttpsProxyAgent(proxyEndpoint)
    }
  }

  let list: string[]

  try {
    list = await getList(
      program.args[0],
      opts.file || false,
      opts.url || false,
      agent
    )
  } catch (e) {
    console.error('Failed to load the file. Error details:')
    console.error(e)
    return
  }

  console.log(
    'Please wait a moment, this may take a little time (up to 10 seconds)...'
  )

  const results = await Promise.allSettled(
    list.map((ipOrHost) => check(ipOrHost))
  )

  const sorted = results
    .map((r, index) => {
      if (r.status === 'fulfilled') {
        return {
          ipOrHost: list[index],
          ...r.value,
        }
      } else {
        return {
          ipOrHost: list[index],
          valid: false as const,
          error: r.reason as unknown,
        }
      }
    })
    .sort((a, b) => {
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
    })

  // 生成公告里需要的 markdown 形式
  // TODO: 可以加个参数来输出这种格式
  // console.log(
  //   sorted
  //     .map((v) => {
  //       let s = `\`\`\`\n${v.ipOrHost} translate.googleapis.com`
  //       if (!v.valid) {
  //         s += '（可能已失效）'
  //       }
  //       s += '\n```'
  //       return s
  //     })
  //     .join('\n')
  // )

  console.table(
    sorted.map((v) => {
      return {
        'IP / Host': v.ipOrHost,
        Available: v.valid ? 'Yes' : 'No',
        'Status Code': v.valid ? 200 : 'statusCode' in v ? v.statusCode : 'N/A',
        'Response time': v.valid ? v.time + 'ms' : 'N/A',
        'Why not available?': v.valid
          ? 'N/A'
          : 'statusCode' in v
          ? 'The status code is not 200.'
          : 'timeout' in v
          ? 'No response within 10 seconds.'
          : 'An error occurred during the request: ' + getErrorMessage(v.error),
      }
    })
  )
}

async function readFileFromFileSystem(path: string) {
  return fs.readFile(path, { encoding: 'utf-8' })
}

function readFileFromURL(url: string, agent?: https.Agent) {
  return new Promise<string>((resolve, reject) => {
    const req = https.get(url, { agent }, (res) => {
      if (res.statusCode !== 200) {
        reject(
          new Error('Request Failed with status code ' + res.statusCode + '.')
        )
        res.resume()
        return
      }
      let rawData = ''
      res.on('data', (chunk) => {
        rawData += chunk
      })
      res.on('end', () => {
        resolve(rawData)
      })
    })
    req.on('error', (err) => {
      reject(err)
    })
  })
}

async function readListFormFileOrURL(
  pathOrUrl: string,
  url: boolean,
  agent?: https.Agent
) {
  const string = await (url
    ? readFileFromURL(pathOrUrl, agent)
    : readFileFromFileSystem(pathOrUrl))
  return string.split(/\r?\n/)
}

function getErrorMessage(e: unknown) {
  if (e instanceof Error) {
    return e.message
  }
  return 'Unknown error.'
}

main()
