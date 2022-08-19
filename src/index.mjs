import { parse } from '../lib/parser.mjs'
import { tokenizer } from '../lib/token.mjs'
import { transform } from '../lib/transform.mjs'
import { log } from '../lib/utils.mjs'

const html = document.querySelector('body').innerHTML
const tokens = tokenizer(html)
const root = parse(tokens)
const result = transform(tokens)
log(result)
log(root)