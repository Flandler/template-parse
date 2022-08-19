const map = {
  div: 'view',
  section: 'view',
  footer: 'view',
  header: 'view',
  br: 'view',
  p: 'view',
  span: 'text',
  a: 'text',
  img: 'image',
}

function makeTag(target) {
  let tag = ['<']
  if (target.type == 'startTag') {
    tag.push(map[target.tag])
    for (let i of target.attr) {
      tag.push(` ${i.key}="${i.val}"`)
    }
    if (target.tag == 'img') {
      tag.push('</image')
    }
  } else if (target.type == 'endTag') {
    tag.push('/')
    tag.push(map[target.tag])
  }
  tag.push('>')
  return tag.join('')
}

export function transform(tokens) {
  let root = []
  let pos = 0
  while (pos < tokens.length) {
    let token = tokens[pos++]
    if (token.type == 'text') {
      root.push(token.content)
    } else if (token.tag != 'br' && token.tag != 'script') {
      root.push(makeTag(token))
    }
  }
  return root.join('')
}
