# Changelog

## [1.0.0-rc3] - 2026-07-28

- Switched release packaging from IPK/opkg to APK-only for OpenWrt 25.12.
- Updated GitHub Actions to build with the pinned OpenWrt 25.12.4 SDK.
- Updated installer and uninstaller to use `apk`.

## [1.0.0-rc2] - 2026-07-27

- Fixed Linux CI compatibility in `scripts/release-check.sh` by avoiding `tar | grep -q` pipelines under `pipefail`.
- Kept release asset structure unchanged for GitHub Releases.

## [1.0.0-rc1] - 2026-07-27

- Initial release candidate for the NeoVPN LuCI theme.
- Added production package layout under `products/luci-theme-neovpn`.
- Added GitHub Release build pipeline and local IPK builder.
- Added OpenWrt install and uninstall scripts.
- Included production screenshots and release documentation.
