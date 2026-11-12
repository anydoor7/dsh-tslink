/**
 * dsh-tslink skill provider: registers the bundled `tslink-preview` skill on `ctx.skills`.
 *
 * The skill file is a byte-identical copy of the canonical
 * https://github.com/anydoor7/tslink/blob/main/skills/tslink-preview/SKILL.md, so its YAML
 * frontmatter (name, description) is the single source of the catalog entry. The MCP
 * server itself is a plain `@deepseek-ai/dsh-mcp-client` row in cordis.patch.yml.
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const PROVIDER_NAME = 'dsh-tslink'
// Same value as BUNDLED_SKILL_RANK exported by @deepseek-ai/dsh-skill; restated so this
// package needs no runtime import of a dsh package (and no peer dependency).
const BUNDLED_SKILL_RANK = 600
const SKILL_URL = new URL('./skills/tslink-preview/SKILL.md', import.meta.url)
const SKILL_PATH = fileURLToPath(SKILL_URL)
const RESOURCE_BASE = { kind: 'directory', path: fileURLToPath(new URL('./skills/tslink-preview/', import.meta.url)) }
const INVOCATION = { modelInvocable: true, userInvocable: true }

/**
 * Split a SKILL.md into its frontmatter fields and body.
 * @param {string} text - complete file text.
 * @returns {{ name: string, description: string, body: string }}
 * @throws when the frontmatter is missing or lacks name/description, so a broken copy fails plugin activation.
 */
function parseSkill(text) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text)
  if (match === null) throw new Error(`${SKILL_PATH}: missing YAML frontmatter`)
  const fields = {}
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':')
    if (separator > 0) fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim()
  }
  if (!fields.name || !fields.description) throw new Error(`${SKILL_PATH}: frontmatter needs name and description`)
  return { name: fields.name, description: fields.description, body: text.slice(match[0].length) }
}

async function loadSkill(signal) {
  return parseSkill(await readFile(SKILL_URL, { encoding: 'utf8', signal }))
}

function summary(skill) {
  return {
    path: SKILL_PATH,
    name: skill.name,
    description: skill.description,
    invocation: INVOCATION,
    provider: PROVIDER_NAME,
    source: 'bundled',
    resourceBase: RESOURCE_BASE,
  }
}

const provider = {
  name: PROVIDER_NAME,
  async list(options) {
    const skill = await loadSkill(options?.signal)
    return [{ ...summary(skill), rank: BUNDLED_SKILL_RANK, locator: SKILL_PATH }]
  },
  async get(_candidate, options) {
    const skill = await loadSkill(options?.signal)
    return { ...summary(skill), content: skill.body }
  },
}

/** Cordis plugin name. */
export const name = 'dsh-tslink'
/** The skill registry service. */
export const inject = ['skills']

/** Register the tslink-preview provider; disposal of this plugin withdraws it. */
export function apply(ctx) {
  ctx.skills.registerProvider(() => provider)
}
