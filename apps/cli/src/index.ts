#!/usr/bin/env node

import { program } from 'commander'
import fs from 'node:fs/promises'
import https from 'node:https'
import { checkAll } from '@hcfy/check-google-translate-ip'
import HttpsProxyAgent = require('https-proxy-agent')

function getErrorMessage(e: unknown) {
  if (e instanceof Error) {
    return e.message
  }
  return 'Unknown error.'
}

function readFileFromFileSystem(path: string) {
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

type IPSource =
  | { type: 'list'; value: string }
  | { type: 'file'; value: string }
  | { type: 'url'; value: string }

async function getList(source: IPSource, agent?: https.Agent) {
  let l: string[]
  if (source.type === 'file') {
    console.log('Loading file...')
    l = (await readFileFromFileSystem(source.value)).split(/\r?\n/)
    console.log('Done.\n')
  } else if (source.type === 'url') {
    console.log('Downloading the file from ' + source.value)
    l = (await readFileFromURL(source.value, agent)).split(/\r?\n/)
    console.log('Done.\n')
  } else {
    l = source.value.split(',')
  }
  return l.map((s) => s.trim()).filter((s) => !!s)
}

async function main() {
  program
    .name('ggc')
    .description('Check Google Translate IP.')
    .argument(
      '[IP / host list]',
      'A comma-separated list of IP addresses / host.'
    )
    .option(
      '-f, --file <file path>',
      'If you are providing a file path, you need to declare this parameter.'
    )
    .option(
      '-u, --url <URL>',
      'If you are providing URL, you need to declare this parameter.'
    )
    .addHelpText(
      'after',
      `
Example call:
  $ ggc # Check the list of IPs from this URL: https://unpkg.com/@hcfy/google-translate-ip/ips.txt
  $ ggc 172.253.114.90 # Check one IP address.
  $ ggc mirror.example.com # Check one host.
  $ ggc 172.253.114.90,mirror.example.com,142.250.9.90 # Check multiple IP addresses or host.
  $ ggc -f ./ips.txt # Check all IP addresses / host in ips.txt. IP addresses / host in ips.txt need to be separated by line breaks.
  $ ggc -u https://example.com/ips.txt # Load the IP address / host from the specified URL.`
    )
    .showHelpAfterError('(add -h for additional information)')
    .parse()

  const opts = program.opts<{ file?: string; url?: string }>()
  const ipList = program.args[0]

  let source: IPSource

  if (ipList) {
    source = { type: 'list', value: ipList }
  } else if (opts.file) {
    source = { type: 'file', value: opts.file }
  } else if (opts.url) {
    source = {
      type: 'url',
      value: opts.url,
    }
  } else {
    source = {
      type: 'url',
      value: 'https://unpkg.com/@hcfy/google-translate-ip/ips.txt',
    }
  }

  // console.log(source)

  let agent: https.Agent | undefined
  if (source.type === 'url') {
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
    list = await getList(source, agent)
  } catch (e) {
    console.error('Failed to load host. Error details:')
    console.error(e)
    return
  }

  console.log('Start detecting. This takes a little time, up to 10 seconds.')

  const sorted = await checkAll(list)

  // let f = true
  // 生成公告里需要的 markdown 形式
  // TODO: 可以加个参数来输出这种格式
  // const txtResult = sorted
  //   .map((v) => {
  //     let s = ''
  //
  //     if (!v.valid) {
  //       if (f) {
  //         f = false
  //         s += '\n--------------以下是失效的 IP -----------------\n'
  //       }
  //     }
  //     s += `\`\`\`\n${v.host} translate.googleapis.com`
  //     s += '\n```'
  //     return s
  //   })
  //   .join('\n')
  //
  // fs.writeFile('./result.txt',txtResult,'utf-8')

  console.table(
    sorted.map((v) => {
      return {
        'IP / Host': v.host,
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

main()
