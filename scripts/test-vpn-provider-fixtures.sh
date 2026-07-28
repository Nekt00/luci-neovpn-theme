#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="$ROOT/products/luci-theme-neovpn/root/usr/libexec/rpcd/neovpn.vpn"

fail() {
	printf 'vpn-fixtures: %s\n' "$*" >&2
	exit 1
}

write_mock() {
	local path="$1"
	local body="$2"

	printf '%s\n' "$body" > "$path"
	chmod 0755 "$path"
}

tmp="$(mktemp -d "${TMPDIR:-/tmp}/neovpn-vpn-fixtures.XXXXXX")"
trap 'rm -rf "$tmp"' EXIT

mockbin="$tmp/bin"
rootfs="$tmp/root"
mkdir -p "$mockbin" "$rootfs/etc/config" "$rootfs/etc/init.d"

# shellcheck disable=SC2016
sed \
	-e 's#\[ -e "$1" \]#[ -e "$NEOVPN_FIXTURE_ROOT$1" ]#' \
	-e 's#\[ -x "/etc/init.d/$name" \]#[ -x "$NEOVPN_FIXTURE_ROOT/etc/init.d/$name" ]#' \
	-e 's#\[ -s "/etc/config/$config" \]#[ -s "$NEOVPN_FIXTURE_ROOT/etc/config/$config" ]#' \
	"$SOURCE" > "$tmp/neovpn.vpn"
chmod 0755 "$tmp/neovpn.vpn"

# shellcheck disable=SC2016
write_mock "$mockbin/apk" '#!/usr/bin/env sh
case "$1:$2:$3" in
  info:-e:podkop|info:-e:luci-app-podkop) exit 0 ;;
  info:-v:podkop) printf "%s\n" "podkop-1.0.0"; exit 0 ;;
esac
exit 1'

# shellcheck disable=SC2016
write_mock "$mockbin/ubus" '#!/usr/bin/env sh
case "$*" in
  *podkop*) [ "${PODKOP_CONTROLLER:-0}" = "1" ] && printf "%s\n" "{\"podkop\":{\"instances\":{\"instance1\":{\"running\":true}}}}" || printf "%s\n" "{\"podkop\":{\"instances\":{}}}" ;;
  *sing-box*) [ "${PODKOP_BACKEND:-0}" = "1" ] && printf "%s\n" "{\"sing-box\":{\"instances\":{\"instance1\":{\"running\":true}}}}" || printf "%s\n" "{\"sing-box\":{\"instances\":{}}}" ;;
esac'

# shellcheck disable=SC2016
write_mock "$mockbin/pidof" '#!/usr/bin/env sh
[ "$1" = "sing-box" ] && [ "${PODKOP_BACKEND:-0}" = "1" ] && printf "%s\n" "1234" && exit 0
exit 1'

# shellcheck disable=SC2016
write_mock "$mockbin/nft" '#!/usr/bin/env sh
[ "$*" = "list table inet PodkopTable" ] && [ "${PODKOP_ROUTE:-0}" = "1" ] && exit 0
exit 1'

# shellcheck disable=SC2016
write_mock "$mockbin/uci" '#!/usr/bin/env sh
[ "$1" = "-q" ] && [ "$2" = "show" ] && [ "$3" = "podkop" ] || exit 1
[ "${PODKOP_CONFIGURED:-0}" = "1" ] || exit 1
printf "%s\n" "podkop.main=main" "podkop.main.proxy_string=socks://127.0.0.1:1080" "podkop.main.community_lists=ru_inside"'

run_case() {
	local name="$1"
	local controller="$2"
	local backend="$3"
	local route="$4"
	local configured="$5"
	local expected="$6"
	local output

	if [ "$configured" = "1" ]; then
		printf '%s\n' 'config podkop main' > "$rootfs/etc/config/podkop"
	else
		rm -f "$rootfs/etc/config/podkop"
	fi

	printf '%s\n' '#!/bin/sh' 'exit 0' > "$rootfs/etc/init.d/podkop"
	chmod 0755 "$rootfs/etc/init.d/podkop"

	output="$(
		PATH="$mockbin:$PATH" \
		NEOVPN_FIXTURE_ROOT="$rootfs" \
		PODKOP_CONTROLLER="$controller" \
		PODKOP_BACKEND="$backend" \
		PODKOP_ROUTE="$route" \
		PODKOP_CONFIGURED="$configured" \
		"$tmp/neovpn.vpn" call status
	)"

	printf '%s' "$output" | grep -q "$expected" || fail "$name failed: expected $expected in $output"
	printf 'vpn-fixtures: %s OK\n' "$name"
}

run_case "one-shot-controller-stopped" 0 1 1 1 '"service_state":"running".*"traffic_state":"active".*"health":"ok"'
run_case "backend-active-routing-absent" 0 1 0 1 '"service_state":"running".*"traffic_state":"unknown".*"health":"degraded"'
run_case "controller-active-backend-absent" 1 0 0 1 '"service_state":"running".*"traffic_state":"inactive".*"traffic_reason":"backend_stopped"'
run_case "everything-stopped" 0 0 0 1 '"service_state":"stopped".*"traffic_state":"inactive".*"health":"stopped"'
run_case "configuration-missing" 0 1 1 0 '"configuration_state":"missing".*"health":"degraded"'
