import test from 'node:test'
import assert from 'node:assert/strict'
import { render, validate } from './build.mjs'

const base = { name: 'ร้าน <ทดสอบ>', category: 'คาเฟ่', tagline: 't', hero: 'h.jpg', address: 'a', phone: '0812345678', hours: { mon: [['08:00', '17:00']] } }

test('escapes shop text and emits LocalBusiness JSON-LD', () => {
  const html = render(base)
  assert.match(html, /ร้าน &lt;ทดสอบ&gt;/)
  assert.ok(!html.includes('<ทดสอบ>'))
  assert.match(html, /"@type":"LocalBusiness"/)
  assert.match(html, /href="tel:0812345678"/)
})

test('rejects bad input', () => {
  assert.throws(() => validate({ ...base, hero: undefined }), /missing: hero/)
  assert.throws(() => validate({ ...base, phone: undefined }), /phone or line/)
  assert.throws(() => validate({ ...base, hours: { mon: [['18:00', '02:00']] } }), /past-midnight/)
  assert.throws(() => validate({ ...base, hours: { monday: [] } }), /unknown day/)
})

test('demo pages never link real contact actions and are noindex', () => {
  const html = render({ ...base, demo: true })
  assert.ok(!html.includes('href="tel:'))
  assert.match(html, /noindex/)
})
