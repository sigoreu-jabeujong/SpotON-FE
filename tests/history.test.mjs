import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/history.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { sortHistory } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
)

test('unknown opening dates stay last in both table and report order', () => {
  const rows = [
    { open_date: null, source: 'general_restaurant', license_no: 'unknown' },
    { open_date: '2020-01-01', source: 'general_restaurant', license_no: 'old' },
    { open_date: '2026-01-01', source: 'rest_cafe', license_no: 'new' },
  ]
  assert.deepEqual(
    sortHistory(rows).map((row) => row.license_no),
    ['new', 'old', 'unknown'],
  )
})

test('same license number in two sources remains two distinct entries', () => {
  const cafe = { open_date: '2020-01-01', source: 'rest_cafe', license_no: 'same' }
  const restaurant = { open_date: '2020-01-01', source: 'general_restaurant', license_no: 'same' }
  const result = sortHistory([cafe, restaurant])
  assert.deepEqual(result, [restaurant, cafe])
  assert.equal(new Set(result.map((row) => `${row.source}:${row.license_no}`)).size, 2)
})

test('sorting never mutates the cached API result', () => {
  const rows = Object.freeze([
    Object.freeze({ open_date: null, source: 'rest_cafe', license_no: '2' }),
    Object.freeze({ open_date: '2026-01-01', source: 'rest_cafe', license_no: '1' }),
  ])
  assert.notEqual(sortHistory(rows), rows)
  assert.equal(rows[0].open_date, null)
  assert.deepEqual(sortHistory([]), [])
})
