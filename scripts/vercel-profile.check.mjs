import assert from 'node:assert/strict'
import test from 'node:test'
import { analysisVersionForVercel } from './vercel-profile.mjs'

test('production enables the verified v2 API', () => {
  assert.equal(analysisVersionForVercel('production'), 'v2')
})
test('preview retains the v1 mock contract', () => {
  assert.equal(analysisVersionForVercel('preview'), 'v1')
})
test('Vercel development retains v1', () => {
  assert.equal(analysisVersionForVercel('development'), 'v1')
})
test('missing and unrecognized Vercel environments fail before building', () => {
  for (const environment of [undefined, '', 'Production', 'staging']) {
    assert.throws(() => analysisVersionForVercel(environment), /VERCEL_ENV/)
  }
})
