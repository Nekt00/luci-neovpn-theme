# NeoVPN LuCI Theme

NeoVPN is a production-ready LuCI theme for OpenWrt. It provides a modern dark application shell, refined status pages, compact configuration objects, polished modals, and a focused VPN status block while preserving standard LuCI behavior.

The production package is located in `products/luci-theme-neovpn`.

## Project Status

Current release: `v1.0.0-rc2`.

This is the second release candidate. The visual implementation is feature complete, while package installation should be validated on additional OpenWrt 25.x targets before a final `v1.0.0`.

## Supported OpenWrt Versions

- Tested: OpenWrt 25.x with LuCI ucode themes on the development router used during theme validation.
- Expected: other OpenWrt 25.x targets with `luci-base`.
- Not claimed: older Lua-only LuCI theme stacks.

Prerequisites:

- root shell access on the router
- `opkg`
- `wget` or `curl`
- installed LuCI

Architecture: `all`.

## Installation

Install the latest GitHub Release directly on the router:

```sh
sh -c "$(wget -O- https://raw.githubusercontent.com/Nekt00/luci-neovpn-theme/main/install.sh)"
```

If `wget` is unavailable but `curl` is installed:

```sh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/Nekt00/luci-neovpn-theme/main/install.sh)"
```

The installer verifies OpenWrt, LuCI, root permissions, the release checksum, installs the IPK, activates NeoVPN, clears LuCI cache, and restarts `uhttpd`.

## Manual Installation

Download these assets from the latest release:

- `luci-theme-neovpn_all.ipk`
- `SHA256SUMS`

Then run:

```sh
sha256sum -c SHA256SUMS
opkg install ./luci-theme-neovpn_all.ipk
uci set luci.themes.NeoVPN='/luci-static/neovpn'
uci set luci.main.mediaurlbase='/luci-static/neovpn'
uci commit luci
rm -rf /tmp/luci-indexcache /tmp/luci-modulecache/*
/etc/init.d/uhttpd restart
```

## Update

Run the installer again:

```sh
sh -c "$(wget -O- https://raw.githubusercontent.com/Nekt00/luci-neovpn-theme/main/install.sh)"
```

## Uninstall

```sh
sh -c "$(wget -O- https://raw.githubusercontent.com/Nekt00/luci-neovpn-theme/main/uninstall.sh)"
```

Manual uninstall:

```sh
uci set luci.main.mediaurlbase='/luci-static/bootstrap'
uci -q delete luci.themes.NeoVPN
uci commit luci
opkg remove luci-theme-neovpn
rm -rf /tmp/luci-indexcache /tmp/luci-modulecache/*
/etc/init.d/uhttpd restart
```

## Build

Build release assets locally on macOS or Linux:

```sh
make build
```

Generated assets are written to `dist/`.

Run the complete release checks:

```sh
make release-check
```

## Troubleshooting And Rollback

If installation fails, the installer restores the previously selected LuCI theme and restarts `uhttpd`.

If LuCI does not reload immediately, clear browser cache or restart the web server:

```sh
rm -rf /tmp/luci-indexcache /tmp/luci-modulecache/*
/etc/init.d/uhttpd restart
```

To manually roll back to bootstrap:

```sh
uci set luci.main.mediaurlbase='/luci-static/bootstrap'
uci commit luci
/etc/init.d/uhttpd restart
```

## Release Process

1. Run `make release-check`.
2. Commit the source tree.
3. Push `main`.
4. Create and push tag `v1.0.0-rc2`.
5. GitHub Actions builds the IPK and publishes release assets.

## Screenshots

Screenshots are intentionally not stored in the source repository. Release notes may include external preview images when needed.

## License

Apache License 2.0. See `LICENSE`.
