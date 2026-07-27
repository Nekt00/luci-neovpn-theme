#!/bin/sh
set -eu

REPO="${NEOVPN_REPO:-Nekt00/luci-neovpn-theme}"
BASE_URL="${NEOVPN_RELEASE_URL:-https://github.com/$REPO/releases/latest/download}"
PACKAGE="luci-theme-neovpn"
IPK_ASSET="${PACKAGE}_all.ipk"
SHA_ASSET="SHA256SUMS"
THEME_NAME="NeoVPN"
THEME_PATH="/luci-static/neovpn"
BOOTSTRAP_PATH="/luci-static/bootstrap"

log() {
	printf '%s\n' "$*"
}

fail() {
	printf 'NeoVPN install failed: %s\n' "$*" >&2
	exit 1
}

download() {
	url="$1"
	out="$2"

	if command -v wget >/dev/null 2>&1; then
		wget -q -O "$out" "$url"
	elif command -v curl >/dev/null 2>&1; then
		curl -fsSL "$url" -o "$out"
	else
		fail "wget or curl is required"
	fi
}

sha256_file() {
	file="$1"

	if command -v sha256sum >/dev/null 2>&1; then
		sha256sum "$file" | awk '{print $1}'
	elif command -v openssl >/dev/null 2>&1; then
		openssl dgst -sha256 "$file" | awk '{print $2}'
	else
		fail "sha256sum or openssl is required"
	fi
}

clear_luci_cache() {
	rm -rf /tmp/luci-indexcache /tmp/luci-modulecache/* 2>/dev/null || true
}

restart_uhttpd() {
	if [ -x /etc/init.d/uhttpd ]; then
		/etc/init.d/uhttpd restart >/dev/null 2>&1 || true
	fi
}

[ "$(id -u)" = 0 ] || fail "run this script as root"
[ -r /etc/openwrt_release ] || fail "this does not look like OpenWrt"
command -v uci >/dev/null 2>&1 || fail "uci is required"
command -v opkg >/dev/null 2>&1 || fail "opkg is required for IPK installation"

. /etc/openwrt_release
release="${DISTRIB_RELEASE:-unknown}"
case "$release" in
	25.*|SNAPSHOT) ;;
	*)
		if [ "${NEOVPN_ALLOW_UNSUPPORTED:-0}" != 1 ]; then
			fail "OpenWrt $release is not in the supported 25.x target range. Set NEOVPN_ALLOW_UNSUPPORTED=1 to override."
		fi
		;;
esac

if ! opkg status luci-base >/dev/null 2>&1 && [ ! -d /usr/share/ucode/luci ]; then
	fail "LuCI/luci-base was not found"
fi

tmp="${TMPDIR:-/tmp}/neovpn-install.$$"
mkdir -p "$tmp"
trap 'rm -rf "$tmp"' EXIT

old_theme="$(uci -q get luci.main.mediaurlbase || printf '%s' "$BOOTSTRAP_PATH")"
installed=0

rollback() {
	if [ "$installed" != 1 ]; then
		log "Rolling back theme selection..."
		uci set "luci.main.mediaurlbase=$old_theme" >/dev/null 2>&1 || true
		uci commit luci >/dev/null 2>&1 || true
		opkg remove "$PACKAGE" >/dev/null 2>&1 || true
		clear_luci_cache
		restart_uhttpd
	fi
}

trap 'rollback; rm -rf "$tmp"' EXIT

log "Downloading NeoVPN release assets..."
download "$BASE_URL/$IPK_ASSET" "$tmp/$IPK_ASSET"
download "$BASE_URL/$SHA_ASSET" "$tmp/$SHA_ASSET"

expected="$(awk -v asset="$IPK_ASSET" '$2 == asset {print $1}' "$tmp/$SHA_ASSET" | head -n 1)"
[ -n "$expected" ] || fail "$IPK_ASSET checksum not found in $SHA_ASSET"
actual="$(sha256_file "$tmp/$IPK_ASSET")"
[ "$expected" = "$actual" ] || fail "SHA256 mismatch"

log "Installing $PACKAGE..."
opkg install "$tmp/$IPK_ASSET" || fail "opkg install failed"

uci set "luci.themes.$THEME_NAME=$THEME_PATH"
uci set "luci.main.mediaurlbase=$THEME_PATH"
uci commit luci

clear_luci_cache
restart_uhttpd

opkg status "$PACKAGE" >/dev/null 2>&1 || fail "package verification failed after install"

installed=1
trap 'rm -rf "$tmp"' EXIT
log "NeoVPN theme installed and activated."
