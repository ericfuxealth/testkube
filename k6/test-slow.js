import http from 'k6/http'
import { sleep } from 'k6'
import { check } from 'k6'

const slow_url = 'localhost:8081'

function runTest() {
  const hostname = __ENV.hostname || 'nginx'
  const port = 8081
  const res = http.get(`http://${hostname}:${port}`)

  check(res, {
    'is status 200': (r) => r.status === 200,
    'responds in less than 2seconds': r => r.timings.duration < 2000
  })
}

export default function () {
  runTest()
  sleep(1)
}