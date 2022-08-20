import { readFile, writeFile } from 'fs'

function tokenizer(input) {
  let pos = 0
  let tokens = []
  let words = []
  function setAttr(chars) {
    if (chars.length == 0 || chars.every(item => item == ' ')) {
      return
    }
    tokens.push({
      type: 'attr',
      val: chars.join('').trim(),
    })
    chars.length = 0
  }
  while (pos < input.length) {
    let ch = input[pos++]
    if (ch == '{') {
      setAttr(words)
      tokens.push({
        type: 'start',
        val: '{',
      })
    } else if (ch == '}') {
      setAttr(words)
      tokens.push({
        type: 'end',
        val: '}',
      })
    } else if (ch == ':') {
      setAttr(words)
      tokens.push({
        type: 'separate',
        val: ':',
      })
    } else if (ch == ';') {
      setAttr(words)
      tokens.push({
        type: 'secmi',
        val: ';',
      })
    } else if (ch != '\n') {
      words.push(ch)
    }
  }
  return tokens
}

function parser(tokens) {
  let root = {
    type: 'root',
    children: [],
  }
  let pos = 0
  let stack = [root]
  let attr = []
  while (pos < tokens.length) {
    let item = stack[stack.length - 1]
    let next = tokens[pos + 1]
    let current = tokens[pos++]
    switch (current.type) {
      case 'attr':
        if (next.type == 'start') {
          let child = {
            type: 'Element',
            element: current.val,
            attr: [],
            children: [],
          }
          item.children.push(child)
          stack.push(child)
        } else if (next.type == 'separate') {
          attr.push(current.val)
        } else if (next.type == 'secmi' || next.type == 'end') {
          attr.push(current.val)
        }
        break
      case 'start':
        break
      case 'separate':
        attr.push(current.val)
        break
      case 'secmi':
        attr.push(current.val)
        item.attr.push(attr.join(''))
        attr.length = 0
        break
      case 'end':
        stack.pop()
        break
    }
  }
  return root
}

function transform(ast, element) {
  let children = ast.children
  let attr = ast.attr
  let tagName = ast.element ? ast.element : ''
  let content = ''
  if (tagName && attr) {
    tagName = element != '' ? `${element} ${tagName}` : tagName
    content = `${tagName} {\n`
    for (let a of attr) {
      content += `  ${a}\n`
    }
    content += '}\n'
  }
  if (children) {
    for (let i of children) {
      content += transform(i, tagName)
    }
  }
  return content
}

function writeCss(path, content) {
  writeFile(path, content, err => {
    if (err) {
      console.log(err)
    }
    console.log('编译完成👌👌👌✅')
  })
}

function handle(inputPath, outputPath) {
  console.log('开始编译 🚀...')
  readFile(inputPath, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      console.log(err)
    }
    if (data) {
      let content = transform(parser(tokenizer(data)), '')
      writeCss(outputPath, content)
    }
    tokenizer(data)
  })
}

export default {
  codegen: handle,
}
