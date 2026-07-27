#!/bin/sh
set -eu

PACKAGE="luci-theme-neovpn"
THEME_NAME="NeoVPN"
THEME_PATH="/luci-static/neovpn"
BOOTSTRAP_PATH="/luci-static/bootstrap"

fail() {
	printf 'NeoVPN uninstall failed: %s\n' "$*" >&2
	exit 1
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
command -v apk >/dev/null 2>&1 || fail "apk is required; NeoVPN supports OpenWrt 25.x apk systems only"

current_theme="$(uci -q get luci.main.mediaurlbase || true)"
if [ "$current_theme" = "$THEME_PATH" ]; then
	if [ ! -d "/www${BOOTSTRAP_PATH}" ]; then
		fail "bootstrap theme was not found at /www${BOOTSTRAP_PATH}"
	fi
	uci set "luci.main.mediaurlbase=$BOOTSTRAP_PATH"
fi

uci -q delete "luci.themes.$THEME_NAME" || true
uci commit luci

if apk info -e "$PACKAGE" >/dev/null 2>&1; then
	apk del "$PACKAGE" || fail "apk del failed"
fi

if apk info -e "$PACKAGE" >/dev/null 2>&1; then
	fail "$PACKAGE is still installed"
fi

clear_luci_cache
restart_uhttpd

printf '%s\n' "NeoVPN theme removed. LuCI theme restored to bootstrap when it was active."
