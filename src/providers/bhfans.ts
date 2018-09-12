import { proxy } from './settings'

export async function resolve (variables: Map<string, string>): Promise<void> {
  const id = variables.get('$bhfans_id')
  if (!id || !/^\d+$/.test(id)) return

  const html = await fetch(`${proxy}http://blockheadsfans.com/servers/server.php?id=${id}`).then(r => r.text())
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const getText = (selector: string) => {
    const el = doc.querySelector(selector)
    return el && el.textContent || ''
  }

  variables.set('$bhfans_owner', getText('a[href^="profile.php"]'))
  variables.set('$bhfans_votes', getText('#votes'))
  variables.set('$bhfans_description', getText('#info table:last-child tr:last-child td'))
  variables.set('$bhfans_server', getText('#info td:last-child'))
}
