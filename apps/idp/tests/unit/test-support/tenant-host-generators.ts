import fc from 'fast-check'

const alphaNumericCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
const labelMiddleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')
const ipv4LiteralPattern = /^\d{1,3}(?:\.\d{1,3}){3}$/

const singleCharacterLabel = fc.constantFrom(...alphaNumericCharacters)

export const validDnsLabelArbitrary = fc.oneof(
  singleCharacterLabel,
  fc
    .tuple(
      fc.constantFrom(...alphaNumericCharacters),
      fc.array(fc.constantFrom(...labelMiddleCharacters), { maxLength: 10 }),
      fc.constantFrom(...alphaNumericCharacters),
    )
    .map(([first, middle, last]) => `${first}${middle.join('')}${last}`),
)

export const validTenantHostArbitrary = fc
  .array(validDnsLabelArbitrary, { minLength: 2, maxLength: 4 })
  .map((labels) => labels.join('.'))
  .filter((host) => !ipv4LiteralPattern.test(host))

export const validTenantHostVariantArbitrary = validTenantHostArbitrary.chain((host) =>
  fc.record({
    host: fc.constant(host),
    variant: fc.constantFrom(host, host.toUpperCase(), `${host}.`, `${host}:443`),
  }),
)

export const invalidTenantHostArbitrary = fc.oneof(
  fc.constant(''),
  fc.constant('localhost'),
  fc.constant('127.0.0.1'),
  fc.constant('https://example.test'),
  fc.constant('example.test/path'),
  fc.constant('example.test?token=value'),
  fc.constant('example.test#fragment'),
  fc.constant('user@example.test'),
  fc.constant('*.example.test'),
  fc.constant('example..test'),
  fc.constant('-example.test'),
  fc.constant('example-.test'),
  fc.constant('example_test.com'),
  fc.constant('example.test:0'),
  fc.constant('example.test:65536'),
  fc.constant('example.test:not-a-port'),
  fc
    .array(fc.constantFrom(...alphaNumericCharacters), { minLength: 64, maxLength: 80 })
    .map((label) => `${label.join('')}.example.test`),
)
