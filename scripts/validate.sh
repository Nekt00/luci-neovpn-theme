#!/usr/bin/env sh
set -eu

root="$(unset CDPATH && cd -- "$(dirname -- "$0")/.." && pwd)"
product="$root/products/luci-theme-neovpn"

fail() {
	printf 'validate: %s\n' "$*" >&2
	exit 1
}

[ -f "$root/README.md" ] || fail "README.md is missing"
[ -f "$root/LICENSE" ] || fail "LICENSE is missing"
[ -f "$root/CHANGELOG.md" ] || fail "CHANGELOG.md is missing"
[ -f "$root/install.sh" ] || fail "install.sh is missing"
[ -f "$root/uninstall.sh" ] || fail "uninstall.sh is missing"
[ -f "$product/Makefile" ] || fail "product Makefile is missing"
[ -x "$root/install.sh" ] || fail "install.sh must be executable"
[ -x "$root/uninstall.sh" ] || fail "uninstall.sh must be executable"
[ -x "$root/scripts/build-apk.sh" ] || fail "scripts/build-apk.sh must be executable"
[ -x "$root/scripts/release-check.sh" ] || fail "scripts/release-check.sh must be executable"

[ -d "$product/htdocs/luci-static/neovpn/css" ] || fail "theme CSS directory is missing"
[ -d "$product/htdocs/luci-static/neovpn/js" ] || fail "theme JS directory is missing"
[ -d "$product/htdocs/luci-static/neovpn/img" ] || fail "theme image directory is missing"
[ -d "$product/ucode/template/themes/neovpn" ] || fail "ucode theme templates are missing"
[ -f "$product/root/etc/uci-defaults/30_luci-theme-neovpn" ] || fail "uci-defaults script is missing"

if find "$product" -name '.DS_Store' -print -quit | grep -q .; then
	fail ".DS_Store found in production product"
fi

if find "$product" -path '*/validation/*' -print -quit | grep -q .; then
	fail "validation artifacts found in production product"
fi

grep -q 'PKG_NAME:=luci-theme-neovpn' "$product/Makefile" || fail "package name is not luci-theme-neovpn"
grep -q 'PKG_VERSION:=1.0.0_rc4' "$product/Makefile" || fail "package version is not 1.0.0_rc4"
grep -q 'PKG_RELEASE:=1' "$product/Makefile" || fail "package release is not 1"
grep -q 'LUCI_DEPENDS:=+luci-base' "$product/Makefile" || fail "luci-base dependency is missing"
grep -q 'LUCI_PKGARCH:=all' "$product/Makefile" || fail "LUCI_PKGARCH is not all"
grep -q 'feeds/luci/luci.mk' "$product/Makefile" || fail "SDK-compatible luci.mk include is missing"

printf '%s\n' "validate: OK"
