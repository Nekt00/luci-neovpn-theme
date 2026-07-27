#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"
IPK="$DIST/luci-theme-neovpn_1.0.0-rc1_all.ipk"
STABLE="$DIST/luci-theme-neovpn_all.ipk"

fail() {
	printf 'release-check: %s\n' "$*" >&2
	exit 1
}

[ -f "$IPK" ] || fail "versioned IPK is missing"
[ -f "$STABLE" ] || fail "stable IPK is missing"
[ -f "$DIST/SHA256SUMS" ] || fail "SHA256SUMS is missing"

if command -v sha256sum >/dev/null 2>&1; then
	(cd "$DIST" && sha256sum -c SHA256SUMS)
else
	(cd "$DIST" && shasum -a 256 -c SHA256SUMS)
fi

members="$(ar -t "$IPK")"
printf '%s\n' "$members" | grep -qx 'debian-binary' || fail "missing debian-binary"
printf '%s\n' "$members" | grep -qx 'control.tar.gz' || fail "missing control.tar.gz"
printf '%s\n' "$members" | grep -qx 'data.tar.gz' || fail "missing data.tar.gz"

tmp="$(mktemp -d "${TMPDIR:-/tmp}/neovpn-release-check.XXXXXX")"
trap 'rm -rf "$tmp"' EXIT

cp "$IPK" "$tmp/"
(cd "$tmp" && ar -x "$(basename "$IPK")")

control="$(tar -xOzf "$tmp/control.tar.gz" ./control)"
printf '%s\n' "$control" | grep -q '^Package: luci-theme-neovpn$' || fail "invalid package name"
printf '%s\n' "$control" | grep -q '^Version: 1.0.0-rc1$' || fail "invalid package version"
printf '%s\n' "$control" | grep -q '^Architecture: all$' || fail "invalid package architecture"
printf '%s\n' "$control" | grep -q '^Depends: luci-base$' || fail "invalid dependencies"

tar -tzf "$tmp/data.tar.gz" | grep -q '^./www/luci-static/neovpn/css/pages.css$' || fail "theme CSS missing"
tar -tzf "$tmp/data.tar.gz" | grep -q '^./usr/share/ucode/luci/template/themes/neovpn/header.ut$' || fail "theme header missing"
tar -tzf "$tmp/data.tar.gz" | grep -q '^./etc/uci-defaults/30_luci-theme-neovpn$' || fail "uci-defaults missing"

if tar -tzf "$tmp/data.tar.gz" | grep -E '(^|/)(\\.DS_Store|validation|stage|staging)(/|$)' >/dev/null; then
	fail "development artifact found in IPK"
fi

if tar -tzf "$tmp/data.tar.gz" | grep -E '/(Users|home|private/var)/' >/dev/null; then
	fail "absolute local workstation path found in IPK"
fi

printf '%s\n' "release-check: OK"
