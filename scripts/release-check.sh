#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"
PKG_NAME="luci-theme-neovpn"
VERSION="1.0.0-rc3"
ARCH="all"
APK="$DIST/${PKG_NAME}_${VERSION}_${ARCH}.apk"
STABLE="$DIST/${PKG_NAME}_${ARCH}.apk"
SDK_VERSION="25.12.4"
SDK_TARGET="x86/64"
SDK_ARCHIVE="openwrt-sdk-25.12.4-x86-64_gcc-14.3.0_musl.Linux-x86_64.tar.zst"
SDK_URL="https://downloads.openwrt.org/releases/${SDK_VERSION}/targets/${SDK_TARGET}/${SDK_ARCHIVE}"
SDK_SHA256="28e004c1be4d215d19c1f12a6aa4c8d8f80689549eb707d0ff5a71f16fa8d05f"

fail() {
	printf 'release-check: %s\n' "$*" >&2
	exit 1
}

download() {
	local url="$1"
	local out="$2"

	if command -v curl >/dev/null 2>&1; then
		curl -fsSL "$url" -o "$out"
	elif command -v wget >/dev/null 2>&1; then
		wget -q -O "$out" "$url"
	else
		fail "curl or wget is required"
	fi
}

verify_sha256() {
	local file="$1"
	local expected="$2"
	local actual

	if command -v sha256sum >/dev/null 2>&1; then
		actual="$(sha256sum "$file" | awk '{print $1}')"
	else
		actual="$(shasum -a 256 "$file" | awk '{print $1}')"
	fi

	[ "$actual" = "$expected" ] || fail "SDK SHA256 mismatch"
}

tmp="$(mktemp -d "${TMPDIR:-/tmp}/neovpn-apk-check.XXXXXX")"
trap 'rm -rf "$tmp"' EXIT

apk_tool="${OPENWRT_APK:-}"
if [ -z "$apk_tool" ]; then
	if command -v apk >/dev/null 2>&1; then
		apk_tool="$(command -v apk)"
	else
		[ "$(uname -s)" = "Linux" ] || fail "apk tool is required. Set OPENWRT_APK to the SDK apk binary."
		command -v tar >/dev/null 2>&1 || fail "tar is required"
		command -v zstd >/dev/null 2>&1 || fail "zstd is required"
		archive="$tmp/$SDK_ARCHIVE"
		download "$SDK_URL" "$archive"
		verify_sha256 "$archive" "$SDK_SHA256"
		tar --zstd -xf "$archive" -C "$tmp"
		sdk_dir="$(find "$tmp" -maxdepth 1 -type d -name 'openwrt-sdk-*' -print -quit)"
		[ -n "$sdk_dir" ] || fail "SDK directory was not extracted"
		apk_tool="$sdk_dir/staging_dir/host/bin/apk"
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

"$apk_tool" adbdump "$APK" > "$tmp/adbdump.txt" || fail "APK metadata is not readable"

grep -Eq "(^|[[:space:]])name:[[:space:]]*${PKG_NAME}($|[[:space:]])" "$tmp/adbdump.txt" || fail "invalid package name"
grep -Eq '(^|[[:space:]])version:[[:space:]]*1\.0\.0_rc3-r1($|[[:space:]])' "$tmp/adbdump.txt" || fail "invalid package version"
grep -Eq '(^|[[:space:]])arch:[[:space:]]*(all|noarch)($|[[:space:]])' "$tmp/adbdump.txt" || fail "APK architecture is not architecture-independent"
grep -Eq '(^|[[:space:]])luci-base($|[[:space:]<>=~])' "$tmp/adbdump.txt" || fail "luci-base dependency missing"
grep -Eq '/?usr/share/ucode/luci/template/themes/neovpn/header\.ut($|[[:space:]])' "$tmp/adbdump.txt" || fail "theme header missing"
grep -Eq '/?www/luci-static/neovpn/css/pages\.css($|[[:space:]])' "$tmp/adbdump.txt" || fail "theme CSS missing"
grep -Eq '/?etc/uci-defaults/30_luci-theme-neovpn($|[[:space:]])' "$tmp/adbdump.txt" || fail "uci-defaults missing"

if grep -E '(^|/)(\.DS_Store|validation|stage|staging)(/|$)' "$tmp/adbdump.txt" >/dev/null; then
	fail "development artifact found in APK"
fi

if grep -E '/(Users|home|private/var)/' "$tmp/adbdump.txt" >/dev/null; then
	fail "absolute local workstation path found in APK"
fi

printf '%s\n' "release-check: OK"
