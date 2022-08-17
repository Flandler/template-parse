export function log() {
  console.log.call(null, ...arguments)
}

export function isAlpha(char) {
  return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
}

export function isNumber(char) {
  return '0123456789'.includes(char)
}

export function isTagSymbol(char) {
  const symbols = '="\':;/.0123456789#()'
  return isAlpha(char) || symbols.includes(char)
}

export function isTag(input, pos) {
  let ch = input[pos++]
  if (ch !== '<') {
    return false
  }
  while (pos < input.length) {
    let ch = input[pos++]
    if (ch === '<') {
      return false
    } else if (ch === '>') {
      return true
    }
  }
}

function isAttr(char) {
  return char != '"' && char != ' ' && char != '"' && char != '='
}

export function next(input, pos, op) {
  let temp = []
  while (pos < input.length) {
    let ch = input[pos]
    if (ch != ' ') {
      temp.push(ch)
    }
    if (ch == op) {
      break
    }
    pos++
  }
  return temp[0] == op
}

export function getAttrToken(chars) {
  let attrs = []
  let words = []
  let pos = 0
  function clean(type, val) {
    if (words.length > 0) {
      attrs.push({ type, val })
      words.length = 0
    }
  }
  function setOp(type, val) {
    attrs.push({ type, val })
    words.length = 0
  }
  while (pos < chars.length) {
    let ch = chars[pos]
    if (isAttr(ch)) {
      words.push(ch)
    }
    if (ch === '=') {
      clean('attr', words.join(''))
      setOp('equal', '=')
    } else if (ch === '"') {
      clean('attr', words.join(''))
      setOp('dbQuote', '"')
    } else if (ch === "'") {
      clean('attr', words.join(''))
      setOp('quote', "'")
    } else if (ch == ' ' || pos == chars.length - 1) {
      clean('attr', words.join(''))
    }
    pos++
  }
  return attrs
}

export function parseAttr(chars, type = 'startTag') {
  let tokens = getAttrToken(chars)
  let tagName = tokens.shift()
  let stack = []
  let pos = 0
  while (pos < tokens.length) {
    let item = tokens[pos++]
    let elem = stack[stack.length - 1]
    switch (item.type) {
      case 'attr':
        if (elem && elem.type === 'start') {
          let val = elem.val === true ? '' + item.val : elem.val + item.val
          elem.val = val
        } else {
          stack.push({ key: item.val, val: true, type: 'attr' })
        }
        break
      case 'equal':
        if (elem && elem.type === 'attr') {
          elem.type = 'equal'
        }
        break
      case 'dbQuote':
        if (elem) {
          if (elem.type === 'equal') {
            elem.type = 'start'
          } else if (elem.type === 'start') {
            elem.type = 'end'
          }
        }
        break
      case 'quote':
        if (elem) {
          if (elem.type === 'equal') {
            elem.type = 'start'
          } else if (elem.type === 'start') {
            elem.type = 'end'
          }
        }
        break
    }
  }
  return {
    type: type,
    tag: tagName.val,
    attr: stack,
  }
}
