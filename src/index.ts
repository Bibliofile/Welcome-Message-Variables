import { resolve } from './providers'

const vars = new Map<string, string>()

const isTruthy = (v?: string) => !/^0$|^false$|^$/i.test(v || '')

const VARIABLE_DEFINITION = /^\$\w+\s*=/

document.querySelectorAll('script[type=variables]').forEach(el => {
  const lines = (el.textContent || '').split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    // Variable definition
    // $abc = q123
    if (VARIABLE_DEFINITION.test(line)) {
      const name = line.substring(0, line.indexOf('=')).trim()
      const value = line.substring(line.indexOf('=') + 1).trim()
      vars.set(name, value)
    }
  }
})

const elementsWithVariables: HTMLElement[] = []

const walker = document.createTreeWalker(document.querySelector('#messageContent')!, NodeFilter.SHOW_TEXT)
let node: Node | null = walker.nextNode()
while (true) {
  if (!node) break
  const parent = node.parentElement
  node = walker.nextNode()
  if (parent && (parent.innerHTML || '').includes('$')) {
    elementsWithVariables.push(parent)
  }
}

resolve(vars).then(() => {
  elementsWithVariables.forEach(node => {
    node.innerHTML = (node.innerHTML || '').replace(/\$\w+/g, variable => vars.get(variable) || '')
  })

  // Debug, show variables above welcome message
  if (isTruthy(vars.get('$debug'))) {
    const wrapper = document.createElement('div')
    wrapper.style.background = '#fff'
    wrapper.innerHTML = '<p>Variables:</p>'
    document.querySelector('#messageContent')!.insertAdjacentElement('beforebegin', wrapper)
    const list = wrapper.appendChild(document.createElement('ul'))
    vars.forEach((val, key) => {
      const li = list.appendChild(document.createElement('li'))
      li.appendChild(document.createElement('strong')).textContent = key
      li.appendChild(document.createTextNode(' = '))
      li.appendChild(document.createElement('span')).textContent = val
    })
  }

}).catch(error => {
  if (isTruthy(vars.get('$debug'))) {
    alert('Error resolving: ' + error.message)
  }
  console.log(error)
})
