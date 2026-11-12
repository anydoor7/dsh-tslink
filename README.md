# dsh-tslink: TSLink for DeepSeek Harness

Open a running local app on your phone or share a private HTTPS preview with a
colleague, from inside [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
(dsh). This dsh bundle adds two things to a profile:

| Row | What it is |
|---|---|
| `tslink-mcp` | dsh's generic MCP client (`@deepseek-ai/dsh-mcp-client`) launching your locally installed `tslink mcp` stdio server. The model sees its tools as `mcp__tslink__<tool>` (for example `mcp__tslink__status`, `mcp__tslink__url`, `mcp__tslink__share`). |
| `tslink-skill` | This package's plugin, which registers the `tslink-preview` skill: check the app responds, agree on access and name, share only that port, report the exact URL, clean up only when asked. |

The skill file is a byte-identical copy of the canonical
[`skills/tslink-preview/SKILL.md`](https://github.com/anydoor7/tslink/blob/main/skills/tslink-preview/SKILL.md).

## Requirements

- dsh 0.2.x (`engines.dsh`: `>=0.2.0-rc.1 <0.3.0-0`; tested on 0.2.2-rc.1).
- The [TSLink CLI](https://github.com/anydoor7/tslink#installation) installed and on
  the `PATH` that dsh starts with (`tslink --version` should work in that shell).
  This bundle does not install or bundle the CLI.
- Recipients need Tailscale and permission to reach the app.

## Install

Pick the profile you use (`web`, `headless`, `tui`, or your own). From npm (once published):

```sh
dsh plugin --profile web add dsh-tslink
```

From GitHub (plain JavaScript, no build step, so no `allowBuilds` approval is needed):

```sh
dsh plugin --profile web add github:anydoor7/dsh-tslink
```

From a release tarball:

```sh
dsh plugin --profile web add ./dsh-tslink-0.1.0.tgz
```

`dsh plugin` forwards to pnpm in `$DSH_HOME/profiles/<profile>` and appends
`dsh-tslink` to that profile's `dsh.profile.bundles`. Check the layer without booting,
then restart dsh:

```sh
dsh --profile web --dump-config | grep -A8 'dsh-tslink'
```

In the Web UI the bundle appears under **Plugins**; you can disable or remove it there.
Then ask, for example: "Open my dev server on port 3000 on my phone."

Remove it with `dsh plugin --profile web remove dsh-tslink` (removes the dependency
and the layer, so the TSLink tools and skill disappear).

## Read-only sessions

`tslink mcp` runs with the owner role by default, so the model can also call write
tools (`share`, `unshare`, `invite_*`, `people_*`, ...). dsh does not ask before MCP
tool calls. To expose only TSLink's 12 read-only tools, override the row in your
profile's own patch layer, `$DSH_HOME/profiles/<profile>/cordis.patch.yml` (a patch
replaces the row's whole `config`, so restate every key):

```yaml
- id: tslink-mcp
  config:
    serverName: tslink
    transport: stdio
    command: tslink
    args: ['mcp', '--scope', 'viewer', '--inventory']
    startupTimeoutMs: 30000
```

Other TSLink roles (`app-operator`, `people-manager` with `--apps`) are described in
[docs/mcp-scopes.md](https://github.com/anydoor7/tslink/blob/main/docs/mcp-scopes.md).
If `tslink` is not on dsh's `PATH`, set `command` to its absolute path the same way.

## What runs and connects

dsh launches `tslink mcp` as a child process (dsh drops ambient environment variables
whose names contain KEY, PASSWORD, SECRET or TOKEN, and all `DSH_*` variables) and
sends it tool arguments; results can include app configuration, identities, URLs and
requested logs. TSLink talks to Tailscale for coordination, enrollment, transport and
HTTPS certificates; app names appear in public certificate transparency logs;
sharing may install a persistent local TSLink background service. The skill asks
about access and that service before sharing and never enables Funnel or creates
browser guest links. Your model provider receives tool arguments and results under
its own retention policy.

Privacy policy: <https://github.com/anydoor7/tslink/blob/main/README.md#privacy-policy>.
Support: <https://github.com/anydoor7/tslink/issues> (do not post credentials, private
links or logs).

## Package layout

```
dsh-tslink/
├── package.json        # dsh.bundle.patch -> ./cordis.patch.yml, engines.dsh
├── cordis.patch.yml    # inserts tslink-mcp (dsh-mcp-client row) and tslink-skill
├── index.js            # skill provider plugin (no dependencies, no build)
├── skills/tslink-preview/SKILL.md
├── locale/en.json, locale/zh.json   # title/description shown on the Plugins page
├── docs/DETAIL.md      # plugin detail page
└── icon.png
```

Licensed under Apache 2.0. TSLink is an independent project and is not made or
endorsed by Tailscale or DeepSeek.
