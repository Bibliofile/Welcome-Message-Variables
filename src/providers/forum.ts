import { proxy } from './settings'

export async function resolve (variables: Map<string, string>): Promise<void> {
  let id = variables.get('$forum_thread')
  if (!id || !/\d+$/.test(id)) return
  const match = id.match(/\/t\/.*?\/(\d+)(?:$|\/)/)
  if (!match) return
  id = match[1]

  const json = await fetch(`${proxy}https://forums.theblockheads.net/t/${id}.json`).then(r => r.json())

  variables.set('$forum_title', json.title)
  variables.set('$forum_owner', json.details.created_by.username)

  // Magic to make forum posts display somewhat nicely
  const parser = new DOMParser()
  const doc = parser.parseFromString(json.post_stream.posts[0].cooked, 'text/html')
  doc.querySelectorAll('a').forEach(el => {
    const href = el.getAttribute('href') || ''
    if (href.startsWith('/')) {
      el.href = 'https://forums.theblockheads.net' + href
    }
  })
  doc.querySelectorAll('img').forEach(el => {
    const src = el.getAttribute('src') || ''
    if (src.startsWith('/')) {
      el.src = 'https://forums.theblockheads.net' + src
    }
  })
  variables.set('$forum_post', doc.body.innerHTML)
}
