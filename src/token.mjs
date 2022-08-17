import { isAlpha, isTag, parseAttr, next, log } from './utils.mjs'

const STATUS = {
  INITIAL: 0,
  TAG_OPEN: 1,
  TAG_START_NAME: 2,
  TAG_END_NAME: 3,
  TAG_CLOSE_SELF: 4,
  TEXT: 5,
}

export function tokenizer(input) {
  const tokens = []
  const chars = []
  let pos = 0
  let status = STATUS.INITIAL
  while (pos < input.length) {
    let ch = input[pos]
    switch (status) {
      case STATUS.INITIAL:
        if (ch === '<') {
          if (isTag(input, pos)) {
            status = STATUS.TAG_OPEN
          } else {
            status = STATUS.TEXT
            chars.push(ch)
          }
        } else {
          status = STATUS.TEXT
          chars.push(ch)
        }
        break
      case STATUS.TAG_OPEN:
        if (ch === '/') {
          status = STATUS.TAG_END_NAME
        } else if (isAlpha(ch)) {
          status = STATUS.TAG_START_NAME
          chars.push(ch)
        } else if (ch !== ' ') {
          status = STATUS.TEXT
        }
        break
      case STATUS.TAG_START_NAME:
        if (ch === '/' && next(input, pos + 1, '>')) {
          status = STATUS.TAG_CLOSE_SELF
        } else if (ch === '>') {
          status = STATUS.INITIAL
          const elem = parseAttr(chars)
          tokens.push(elem)
          chars.length = 0
        } else {
          chars.push(ch)
        }
        break
      case STATUS.TAG_END_NAME:
        if (ch === '>') {
          status = STATUS.INITIAL
          tokens.push({
            type: 'endTag',
            tag: chars.join(''),
          })
          chars.length = 0
        } else if (isAlpha(ch)) {
          chars.push(ch)
        }
        break
      case STATUS.TAG_CLOSE_SELF:
        if (ch === '>') {
          status = STATUS.INITIAL
          const elem = parseAttr(chars, 'selfClose')
          tokens.push(elem)
          chars.length = 0
        }
        break
      case STATUS.TEXT:
        if (ch === '<') {
          if (isTag(input, pos)) {
            status = STATUS.TAG_OPEN
            tokens.push({
              type: 'text',
              content: chars.join(''),
            })
            chars.length = 0
          } else {
            chars.push(ch)
          }
        } else {
          chars.push(ch)
        }
        break
    }
    pos++
  }
  return tokens
}
