import { resolve as resolveBHFans } from './bhfans'
import { resolve as resolveForum } from './forum'

export function resolve (variables: Map<string, string>): Promise<void[]> {
  return Promise.all([
    resolveBHFans,
    resolveForum
  ].map(resolver => resolver(variables)))
}
