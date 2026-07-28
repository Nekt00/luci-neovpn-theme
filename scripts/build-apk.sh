#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRODUCT="$ROOT/products/luci-theme-neovpn"
DIST="$ROOT/dist"

SDK_VERSION="25.12.4"
SDK_TARGET="x86/64"
SDK_ARCHIVE="openwrt-sdk-25.12.4-x86-64_gcc-14.3.0_musl.Linux-x86_64.tar.zst"
SDK_URL="https://downloads.openwrt.org/releases/${SDK_VERSION}/targets/${SDK_TARGET}/${SDK_ARCHIVE}"
SDK_SHA256="28e004c1be4d215d19c1f12a6aa4c8d8f80689549eb707d0ff5a71f16fa8d05f"

PKG_NAME="luci-theme-neovpn"
VERSION="1.0.0-rc3"
ARCH="all"

fail() {
	printf 'build-apk: %s\n' "$*" >&2
	exit 1
}

sha256_write() {
	local file="$1"
	local out="$2"
	local name
	name="$(basename "$file")"

	if command -v sha256sum >/dev/null 2>&1; then
		(cd "$(dirname "$file")" && sha256sum "$name") > "$out"
	else
		local hash
		hash="$(shasum -a 256 "$file" | awk '{print $1}')"
		printf '%s  %s\n' "$hash" "$name" > "$out"
	fi
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

"$ROOT/scripts/validate.sh"

[ "$(uname -s)" = "Linux" ] || fail "OpenWrt SDK APK build requires Linux"
command -v tar >/dev/null 2>&1 || fail "tar is required"
command -v zstd >/dev/null 2>&1 || fail "zstd is required"
command -v make >/dev/null 2>&1 || fail "make is required"

mkdir -p "$DIST"
workdir="$(mktemp -d "${TMPDIR:-/tmp}/neovpn-sdk.XXXXXX")"
trap 'rm -rf "$workdir"' EXIT

archive="$workdir/$SDK_ARCHIVE"
download "$SDK_URL" "$archive"
verify_sha256 "$archive" "$SDK_SHA256"

tar --zstd -xf "$archive" -C "$workdir"
sdk_dir="$(find "$workdir" -maxdepth 1 -type d -name 'openwrt-sdk-*' -print -quit)"
[ -n "$sdk_dir" ] || fail "SDK directory was not extracted"

mkdir -p "$sdk_dir/package/$PKG_NAME"
cp -R "$PRODUCT/." "$sdk_dir/package/$PKG_NAME/"

(
	cd "$sdk_dir"
	./scripts/feeds update -a
	./scripts/feeds install luci-base
	make defconfig
	make "package/$PKG_NAME/compile" V=s
)

sdk_apk="$sdk_dir/staging_dir/host/bin/apk"
[ -x "$sdk_apk" ] || fail "SDK apk tool was not found"
cp "$sdk_apk" "$DIST/openwrt-apk"
chmod 0755 "$DIST/openwrt-apk"

built_apk="$(find "$sdk_dir/bin" -type f -name "${PKG_NAME}*.apk" -print -quit)"
[ -n "$built_apk" ] || fail "APK was not produced"

stable="$DIST/${PKG_NAME}_${ARCH}.apk"
versioned_dist="$DIST/${PKG_NAME}_${VERSION}_${ARCH}.apk"
sha_sums="$DIST/SHA256SUMS"

rm -f "$DIST"/*.apk "$DIST"/*.apk.sha256 "$sha_sums"
cp "$built_apk" "$versioned_dist"
cp "$built_apk" "$stable"
cp "$ROOT/install.sh" "$DIST/install.sh"
cp "$ROOT/uninstall.sh" "$DIST/uninstall.sh"

sha256_write "$versioned_dist" "$versioned_dist.sha256"
sha256_write "$stable" "$stable.sha256"
sha256_write "$DIST/install.sh" "$DIST/install.sh.sha256"
sha256_write "$DIST/uninstall.sh" "$DIST/uninstall.sh.sha256"

(
	cd "$DIST"
	if command -v sha256sum >/dev/null 2>&1; then
		sha256sum "$(basename "$versioned_dist")" "$(basename "$stable")"
	else
		shasum -a 256 "$(basename "$versioned_dist")" "$(basename "$stable")"
	fi
) > "$sha_sums"

printf 'build-apk: wrote %s\n' "$versioned_dist"
printf 'build-apk: wrote %s\n' "$stable"
