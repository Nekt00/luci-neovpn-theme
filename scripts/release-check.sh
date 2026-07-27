#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"
IPK="$DIST/luci-theme-neovpn_1.0.0-rc2_all.ipk"
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
grep -qx 'debian-binary' <<< "$members" || fail "missing debian-binary"
grep -qx 'control.tar.gz' <<< "$members" || fail "missing control.tar.gz"
grep -qx 'data.tar.gz' <<< "$members" || fail "missing data.tar.gz"

tmp="$(mktemp -d "${TMPDIR:-/tmp}/neovpn-release-check.XXXXXX")"
trap 'rm -rf "$tmp"' EXIT

cp "$IPK" "$tmp/"
(cd "$tmp" && ar -x "$(basename "$IPK")")

control="$(tar -xOzf "$tmp/control.tar.gz" ./control)"
grep -qx 'Package: luci-theme-neovpn' <<< "$control" || fail "invalid package name"
grep -qx 'Version: 1.0.0-rc2' <<< "$control" || fail "invalid package version"
grep -qx 'Architecture: all' <<< "$control" || fail "invalid package architecture"
grep -qx 'Depends: luci-base' <<< "$control" || fail "invalid dependencies"

tar -tzf "$tmp/data.tar.gz" > "$tmp/data-members.txt"

grep -qx './www/luci-static/neovpn/css/pages.css' "$tmp/data-members.txt" || fail "theme CSS missing"
grep -qx './usr/share/ucode/luci/template/themes/neovpn/header.ut' "$tmp/data-members.txt" || fail "theme header missing"
grep -qx './etc/uci-defaults/30_luci-theme-neovpn' "$tmp/data-members.txt" || fail "uci-defaults missing"

if grep -E '(^|/)(\.DS_Store|validation|stage|staging)(/|$)' "$tmp/data-members.txt" >/dev/null; then
	fail "development artifact found in IPK"
fi

if grep -E '/(Users|home|private/var)/' "$tmp/data-members.txt" >/dev/null; then
	fail "absolute local workstation path found in IPK"
fi

printf '%s\n' "release-check: OK"
