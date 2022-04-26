import http from 'k6/http'
import { sleep } from 'k6'
import { check } from 'k6'

export const options = {
  scenarios: {
    normal: {
      executor: 'per-vu-iterations',
      env: {
        port: '8080'
      },
      vus: 10,
      maxDuration: '10s'
    },
    slow: {
      executor: 'per-vu-iterations',
      env: {
        port: '8081'
      },
      vus: 10,
      maxDuration: '10s'
    }
  }
}

function runTest() {
  const hostname = __ENV.hostname || 'nginx'
  const port = __ENV.port
  const res = http.get(`http://${hostname}:${port}`);

  check(res, {
    'is status 200': (r) => r.status === 200,
    'responds in less than 2seconds': r => r.timings.duration < 2000
  })
}


export default function () {
  runTest()
  sleep(1)
}