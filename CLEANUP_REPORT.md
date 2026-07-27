# NeoVPN Cleanup Report

This report identifies development artifacts that should not be included in the production package. Nothing has been deleted automatically.

## Production Files

Production theme files now live in `products/luci-theme-neovpn`:

- `htdocs/luci-static/neovpn/css/`
- `htdocs/luci-static/neovpn/js/`
- `htdocs/luci-static/neovpn/img/`
- `ucode/template/themes/neovpn/`
- `root/etc/uci-defaults/30_luci-theme-neovpn`
- `root/usr/libexec/rpcd/neovpn.vpn`
- `root/usr/share/neovpn/vpn-providers/`
- `root/usr/share/rpcd/acl.d/luci-theme-neovpn-vpn.json`
- `Makefile`

## Temporary Or Staging Folders

Keep these out of releases:

- `.stage51-work/`
- `.stage42c/`
- `.stage42d/`
- `.stage42r4/`
- `.stage42r5/`
- `.stage43/`
- `.stage44a/`
- `.stage44ar2/`
- `.stage44b/`
- `.stage44c/`
- `.login-logo-fix/`

## Screenshots And Validation Artifacts

The old validation archive remains in `.stage51-work/validation/` and should not be shipped in the IPK. Curated production screenshots were copied to `screenshots/`.

## Local Junk Files

The current working tree contains accidental local files that should remain ignored or be manually removed before publishing:

- `.cbi-map`
- `.cbi-map); const section=document.querySelector(#view`
- `.td,`
- `.DS_Store`

## Duplicate Or Obsolete Package Paths

`.stage51-work/usr/` appears to duplicate files that now belong under `products/luci-theme-neovpn/root/usr/`. The production product uses `root/usr/` only.

## Files To Ignore

The repository `.gitignore` now excludes:

- build output in `dist/`
- staging workspaces `.stage*/`
- local validation scratch folders
- `.DS_Store`
- editor metadata
- accidental local scratch files

## Deletion Recommendation

Before the first public push, manually review and remove unneeded staging folders if they are not valuable as history. Do not remove them blindly, because they contain validation screenshots and previous stage evidence.
