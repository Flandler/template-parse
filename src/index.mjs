import { parse } from './parser.mjs'
import { tokenizer } from './token.mjs'
import { transform } from './transform.mjs'
import { log } from './utils.mjs'

const html = document.querySelector('body').innerHTML
const tokens = tokenizer(html)
const root = parse(tokens)
transform(root)
log(root)
