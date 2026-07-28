#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"
PKG_NAME="luci-theme-neovpn"
VERSION="1.0.0-rc3"
ARCH="all"
APK="$DIST/${PKG_NAME}_${VERSION}_${ARCH}.apk"
STABLE="$DIST/${PKG_NAME}_${ARCH}.apk"

fail() {
	printf 'release-check: %s\n' "$*" >&2
	exit 1
}

apk_tool="${OPENWRT_APK:-}"
if [ -z "$apk_tool" ]; then
	if [ -x "$DIST/openwrt-apk" ]; then
		apk_tool="$DIST/openwrt-apk"
	elif command -v apk >/dev/null 2>&1; then
		apk_tool="$(command -v apk)"
	else
		fail "apk tool is required. Set OPENWRT_APK to the SDK apk binary."
	fi
fi

[ -x "$apk_tool" ] || fail "apk tool is not executable: $apk_tool"
[ -f "$APK" ] || fail "versioned APK is missing"
[ -f "$STABLE" ] || fail "stable APK is missing"
[ -f "$DIST/SHA256SUMS" ] || fail "SHA256SUMS is missing"

if command -v sha256sum >/dev/null 2>&1; then
	(cd "$DIST" && sha256sum -c SHA256SUMS)
else
	(cd "$DIST" && shasum -a 256 -c SHA256SUMS)
fi

tmp="$(mktemp -d "${TMPDIR:-/tmp}/neovpn-apk-check.XXXXXX")"
trap 'rm -rf "$tmp"' EXIT
rootfs="$tmp/root"
mkdir -p "$rootfs"

"$apk_tool" add --root "$rootfs" --initdb --allow-untrusted --no-scripts --force-broken-world "$APK" >/dev/null
"$apk_tool" info --root "$rootfs" "$PKG_NAME" >/dev/null || fail "package is not registered in apk database"

"$apk_tool" info --root "$rootfs" -e "$PKG_NAME" >/dev/null || fail "package existence check failed"
"$apk_tool" info --root "$rootfs" -L "$PKG_NAME" > "$tmp/files.txt"
"$apk_tool" info --root "$rootfs" -d "$PKG_NAME" > "$tmp/deps.txt"
"$apk_tool" info --root "$rootfs" -v "$PKG_NAME" > "$tmp/version.txt"

grep -Eq "^${PKG_NAME}-1\\.0\\.0~rc3-r1$" "$tmp/version.txt" || fail "invalid package version"
grep -qx 'usr/share/ucode/luci/template/themes/neovpn/header.ut' "$tmp/files.txt" || fail "theme header missing"
grep -qx 'www/luci-static/neovpn/css/pages.css' "$tmp/files.txt" || fail "theme CSS missing"
grep -qx 'etc/uci-defaults/30_luci-theme-neovpn' "$tmp/files.txt" || fail "uci-defaults missing"
grep -Eq '^luci-base($|[<>=~])' "$tmp/deps.txt" || fail "luci-base dependency missing"

if grep -E '(^|/)(\.DS_Store|validation|stage|staging)(/|$)' "$tmp/files.txt" >/dev/null; then
	fail "development artifact found in APK"
fi

if grep -E '/(Users|home|private/var)/' "$tmp/files.txt" >/dev/null; then
	fail "absolute local workstation path found in APK"
fi

if ! "$apk_tool" manifest "$APK" > "$tmp/manifest.txt" 2>/dev/null; then
	"$apk_tool" info --contents --allow-untrusted "$APK" > "$tmp/manifest.txt" 2>/dev/null || true
fi
if grep -E 'arch[=: ][[:space:]]*[^[:space:]]+' "$tmp/manifest.txt" > "$tmp/manifest-arch.txt"; then
	if grep -Ev '(all|noarch)' "$tmp/manifest-arch.txt" >/dev/null; then
		fail "APK architecture is not architecture-independent"
	fi
fi

printf '%s\n' "release-check: OK"
