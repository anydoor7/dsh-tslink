# TSLink for DeepSeek Harness

Give a running local app or dev server a private HTTPS address on your tailnet, so
you can open it on your phone or share it with a named colleague. This bundle adds:

- **TSLink MCP tools** (`mcp__tslink__*`): the locally installed `tslink mcp` stdio
  server, launched by dsh's MCP client. Read tools include `status`, `list`, `url`
  and `doctor`; write tools include `share`, `unshare` and the people/invite tools.
- **The `tslink-preview` skill**: a short procedure the agent follows before sharing
  (check the app responds, agree on who gets access and the app name, share only
  that port, report the exact URL, clean up only on request).

## Requirements

- The [TSLink CLI](https://github.com/anydoor7/tslink#installation) on the `PATH`
  dsh starts with. The bundle does not install or bundle the CLI.
- Recipients need Tailscale and permission to reach the app. A fresh node can need
  browser sign-in and device approval by the tailnet owner.

## What runs and connects

dsh launches `tslink mcp` as a child process and sends it tool arguments. TSLink
talks to Tailscale for coordination, transport and HTTPS certificates; app names
appear in public certificate transparency logs; sharing may install a persistent
local TSLink background service. The skill never enables Funnel or creates browser
guest links. Privacy policy:
https://github.com/anydoor7/tslink/blob/main/README.md#privacy-policy

TSLink is an independent project and is not made or endorsed by Tailscale or DeepSeek.
