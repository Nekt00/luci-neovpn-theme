# Changelog

## [1.0.0-rc2] - 2026-07-27

- Fixed Linux CI compatibility in `scripts/release-check.sh` by avoiding `tar | grep -q` pipelines under `pipefail`.
- Kept release asset structure unchanged for GitHub Releases.

## [1.0.0-rc1] - 2026-07-27

- Initial release candidate for the NeoVPN LuCI theme.
- Added production package layout under `products/luci-theme-neovpn`.
- Added GitHub Release build pipeline and local IPK builder.
- Added OpenWrt install and uninstall scripts.
- Included production screenshots and release documentation.
