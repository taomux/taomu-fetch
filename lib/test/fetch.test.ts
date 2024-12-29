import { expect, test } from 'vitest'

import { request, setRequestHooks, requestHooks } from '../main'

test('Set global hooks', async () => {
  setRequestHooks({
    beforeRequest: () => {
      return {
        closeLoading: () => 'ok',
      }
    },
    afterRequest: (before: any) => {
      expect(before.closeLoading()).toEqual('ok')
    },
  })
  expect(requestHooks.beforeRequest).toBeInstanceOf(Function)
})

test('request iconfont json', async () => {
  const res = await request('https://jsonplaceholder.typicode.com/todos/1', {}, { method: 'GET', handleErrors: false })
  expect(res).toBeInstanceOf(Object)
})
