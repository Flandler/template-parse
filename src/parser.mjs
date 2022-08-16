const closeSelfTags = ['img', 'br', 'hr', 'meta', 'link', 'input']

export function parse(tokens) {
  let pos = 0
  let root = {
    type: 'root',
    children: [],
  }
  let stack = [root]
  while (pos < tokens.length) {
    let token = tokens[pos++]
    let item = stack[stack.length - 1]
    switch (token.type) {
      case 'startTag':
        let element = {
          type: 'Element',
          tag: token.tag,
          attr: token.attr,
          children: [],
        }
        item.children.push(element)
        if (!closeSelfTags.includes(token.tag)) {
          stack.push(element)
        }
        break
      case 'text':
        item.children.push({
          type: 'Text',
          content: token.content,
        })
        break
      case 'selfClose':
        item.children.push({
          type: 'Element',
          tag: token.tag,
          attr: token.attr,
        })
        break
      case 'endTag':
        stack.pop()
        break
    }
  }
  return root
}
