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
mkdir -p "$mockbin" "$rootfs/etc/init.d" "$rootfs/etc/config" "$rootfs/usr/bin" "$rootfs/opt"

# shellcheck disable=SC2016
sed \
	-e 's#\[ -e "$1" \]#[ -e "$NEOVPN_FIXTURE_ROOT$1" ]#' \
	-e 's#\[ -x "$item" \]#[ -x "$NEOVPN_FIXTURE_ROOT$item" ]#' \
	-e 's#\[ -x "/etc/init.d/$name" \]#[ -x "$NEOVPN_FIXTURE_ROOT/etc/init.d/$name" ]#' \
	-e 's#\[ -s /opt/clash/config.yaml \]#[ -s "$NEOVPN_FIXTURE_ROOT/opt/clash/config.yaml" ]#' \
	-e 's#\[ -s /opt/clash/config.yml \]#[ -s "$NEOVPN_FIXTURE_ROOT/opt/clash/config.yml" ]#' \
	"$SOURCE" > "$tmp/neovpn.vpn"
chmod 0755 "$tmp/neovpn.vpn"

# shellcheck disable=SC2016
write_mock "$mockbin/apk" '#!/usr/bin/env sh
case "$1" in
  info)
    if [ "${2:-}" = "-v" ]; then
      printf "%s\n" ${NEOVPN_PACKAGES:-} | sed "s/$/-1.0.0/"
    else
      printf "%s\n" ${NEOVPN_PACKAGES:-}
    fi
    ;;
esac'

# shellcheck disable=SC2016
write_mock "$mockbin/ubus" '#!/usr/bin/env sh
if [ "$1:$2:$3" = "call:service:list" ]; then
  printf "{\n"
  printf "\"podkop\":{\"instances\":{\"instance1\":{\"running\":%s}}},\n" "$([ "${PODKOP_CONTROLLER:-0}" = "1" ] && printf true || printf false)"
  printf "\"netshift\":{\"instances\":{\"instance1\":{\"running\":%s}}},\n" "$([ "${NETSHIFT_CONTROLLER:-0}" = "1" ] && printf true || printf false)"
  printf "\"sing-box\":{\"instances\":{\"main\":{\"running\":%s}}},\n" "$([ "${SINGBOX_RUNNING:-0}" = "1" ] && printf true || printf false)"
  printf "\"ssclash\":{\"instances\":{\"instance1\":{\"running\":%s}}},\n" "$([ "${SSCLASH_CONTROLLER:-0}" = "1" ] && printf true || printf false)"
  printf "\"clash\":{\"instances\":{\"instance1\":{\"running\":%s}}}\n" "$([ "${CLASH_CONTROLLER:-0}" = "1" ] && printf true || printf false)"
  printf "}\n"
else
  printf "{}\n"
fi'

# shellcheck disable=SC2016
write_mock "$mockbin/ps" '#!/usr/bin/env sh
printf "PID USER COMMAND\n"
[ "${SINGBOX_RUNNING:-0}" = "1" ] && printf "101 root /usr/bin/sing-box run -c /etc/sing-box/config.json\n"
[ "${NETSHIFT_PROCESS:-0}" = "1" ] && printf "102 root /usr/bin/netshift watch\n"
[ "${MIHOMO_RUNNING:-0}" = "1" ] && printf "103 root /opt/clash/bin/mihomo -d /opt/clash\n"'

# shellcheck disable=SC2016
write_mock "$mockbin/nft" '#!/usr/bin/env sh
[ "$*" = "list table inet PodkopTable" ] && [ "${PODKOP_ROUTE:-0}" = "1" ] && exit 0
[ "$*" = "list table inet NetShiftTable" ] && [ "${NETSHIFT_ROUTE:-0}" = "1" ] && exit 0
[ "$*" = "list table inet netshift" ] && [ "${NETSHIFT_ROUTE:-0}" = "1" ] && exit 0
exit 1'

# shellcheck disable=SC2016
write_mock "$mockbin/ip" '#!/usr/bin/env sh
case "$*" in
  "-o link show")
    [ "${SSCLASH_ROUTE:-0}" = "1" ] && printf "9: utun: <POINTOPOINT,UP> mtu 9000\n"
    ;;
  "rule show")
    [ "${NETSHIFT_ROUTE:-0}" = "1" ] && printf "100: from all fwmark 0x1 lookup netshift\n"
    [ "${SSCLASH_ROUTE:-0}" = "1" ] && printf "101: from all fwmark 0x2 lookup clash\n"
    ;;
  "route show table all")
    [ "${NETSHIFT_ROUTE:-0}" = "1" ] && printf "default dev tun0 table netshift\n"
    [ "${SSCLASH_ROUTE:-0}" = "1" ] && printf "default dev utun table clash\n"
    ;;
esac'

# shellcheck disable=SC2016
write_mock "$mockbin/uci" '#!/usr/bin/env sh
[ "$1" = "-q" ] && [ "$2" = "show" ] || exit 1
case "$3" in
  podkop)
    [ "${PODKOP_CONFIGURED:-0}" = "1" ] || exit 1
    printf "%s\n" "podkop.main=main" "podkop.main.proxy_string=socks://127.0.0.1:1080" "podkop.main.community_lists=ru_inside"
    ;;
  netshift)
    [ "${NETSHIFT_CONFIGURED:-0}" = "1" ] || exit 1
    printf "%s\n" "netshift.main=main" "netshift.main.proxy_string=socks://127.0.0.1:1080" "netshift.main.routes=ru_inside"
    ;;
  ssclash)
    [ "${SSCLASH_CONFIGURED:-0}" = "1" ] || exit 1
    printf "%s\n" "ssclash.config=config" "ssclash.config.mode=rule"
    ;;
  clash)
    exit 1
    ;;
esac'

reset_rootfs() {
	rm -rf "$rootfs"
	mkdir -p "$rootfs/etc/init.d" "$rootfs/etc/config" "$rootfs/usr/bin" "$rootfs/opt"
}

touch_exec() {
	printf '%s\n' '#!/bin/sh' 'exit 0' > "$rootfs$1"
	chmod 0755 "$rootfs$1"
}

run_case() {
	local name="$1"
	local expected="$2"
	local output
	shift 2

	reset_rootfs
	# shellcheck disable=SC2016
	NEOVPN_FIXTURE_ROOT="$rootfs" env "$@" bash -c '
		[ "${PODKOP_PRESENT:-0}" = "1" ] && touch "$NEOVPN_FIXTURE_ROOT/etc/config/podkop" && printf "#!/bin/sh\nexit 0\n" > "$NEOVPN_FIXTURE_ROOT/etc/init.d/podkop" && chmod 755 "$NEOVPN_FIXTURE_ROOT/etc/init.d/podkop"
		[ "${NETSHIFT_PRESENT:-0}" = "1" ] && touch "$NEOVPN_FIXTURE_ROOT/etc/config/netshift" && printf "#!/bin/sh\nexit 0\n" > "$NEOVPN_FIXTURE_ROOT/etc/init.d/netshift" && chmod 755 "$NEOVPN_FIXTURE_ROOT/etc/init.d/netshift" && printf "#!/bin/sh\nexit 0\n" > "$NEOVPN_FIXTURE_ROOT/usr/bin/netshift" && chmod 755 "$NEOVPN_FIXTURE_ROOT/usr/bin/netshift"
		[ "${SSCLASH_PRESENT:-0}" = "1" ] && mkdir -p "$NEOVPN_FIXTURE_ROOT/opt/clash/bin" && touch "$NEOVPN_FIXTURE_ROOT/etc/config/ssclash" && printf "#!/bin/sh\nexit 0\n" > "$NEOVPN_FIXTURE_ROOT/etc/init.d/ssclash" && chmod 755 "$NEOVPN_FIXTURE_ROOT/etc/init.d/ssclash"
		[ "${MIHOMO_PRESENT:-0}" = "1" ] && mkdir -p "$NEOVPN_FIXTURE_ROOT/opt/clash/bin" && printf "#!/bin/sh\nexit 0\n" > "$NEOVPN_FIXTURE_ROOT/opt/clash/bin/mihomo" && chmod 755 "$NEOVPN_FIXTURE_ROOT/opt/clash/bin/mihomo"
		[ "${SSCLASH_CONFIG_FILE:-0}" = "1" ] && touch "$NEOVPN_FIXTURE_ROOT/opt/clash/config.yaml"
		true
	'

	output="$(
		PATH="$mockbin:$PATH" \
		NEOVPN_FIXTURE_ROOT="$rootfs" \
		env "$@" \
		"$tmp/neovpn.vpn" call status
	)"

	printf '%s' "$output" | grep -Eq "$expected" || fail "$name failed: expected $expected in $output"
	printf 'vpn-fixtures: %s OK\n' "$name"
}

run_case "podkop-one-shot-active" '"id":"podkop".*"service_state":"running".*"traffic_state":"active".*"health":"ok"' \
	NEOVPN_PACKAGES="podkop luci-app-podkop" PODKOP_PRESENT=1 PODKOP_CONFIGURED=1 SINGBOX_RUNNING=1 PODKOP_ROUTE=1
run_case "podkop-backend-routing-absent" '"id":"podkop".*"application_state":"active".*"traffic_state":"inactive".*"reason":"routing_not_active"' \
	NEOVPN_PACKAGES="podkop luci-app-podkop" PODKOP_PRESENT=1 PODKOP_CONFIGURED=1 SINGBOX_RUNNING=1
run_case "podkop-stopped" '"id":"podkop".*"service_state":"stopped".*"traffic_state":"inactive"' \
	NEOVPN_PACKAGES="podkop luci-app-podkop" PODKOP_PRESENT=1 PODKOP_CONFIGURED=1
run_case "podkop-not-configured" '"id":"podkop".*"service_state":"not_configured".*"configuration_state":"missing"' \
	NEOVPN_PACKAGES="podkop luci-app-podkop" PODKOP_PRESENT=1

run_case "netshift-active" '"id":"netshift".*"service_state":"running".*"traffic_state":"active".*"health":"ok"' \
	NEOVPN_PACKAGES="netshift luci-app-netshift" NETSHIFT_PRESENT=1 NETSHIFT_CONFIGURED=1 SINGBOX_RUNNING=1 NETSHIFT_ROUTE=1
run_case "netshift-controller-absent-effective-active" '"id":"netshift".*"service_state":"running".*"traffic_state":"active"' \
	NEOVPN_PACKAGES="netshift luci-app-netshift" NETSHIFT_PRESENT=1 NETSHIFT_CONFIGURED=1 SINGBOX_RUNNING=1 NETSHIFT_ROUTE=1 NETSHIFT_CONTROLLER=0
run_case "netshift-shared-singbox-unverified" '"id":"netshift".*"application_state":"active".*"traffic_state":"inactive".*"reason":"routing_not_active"' \
	NEOVPN_PACKAGES="netshift luci-app-netshift" NETSHIFT_PRESENT=1 NETSHIFT_CONFIGURED=1 SINGBOX_RUNNING=1
run_case "netshift-migrated-podkop-remnants" '"id":"podkop".*"service_state":"not_configured".*"id":"netshift".*"traffic_state":"active"' \
	NEOVPN_PACKAGES="podkop netshift luci-app-netshift" PODKOP_PRESENT=1 NETSHIFT_PRESENT=1 NETSHIFT_CONFIGURED=1 SINGBOX_RUNNING=1 NETSHIFT_ROUTE=1
run_case "netshift-stopped" '"id":"netshift".*"service_state":"stopped".*"traffic_state":"inactive"' \
	NEOVPN_PACKAGES="netshift luci-app-netshift" NETSHIFT_PRESENT=1 NETSHIFT_CONFIGURED=1

run_case "ssclash-mihomo-missing" '"id":"ssclash".*"service_state":"stopped".*"health":"error".*"reason":"core_missing"' \
	NEOVPN_PACKAGES="luci-app-ssclash" SSCLASH_PRESENT=1 SSCLASH_CONFIGURED=1
run_case "ssclash-mihomo-present-stopped" '"id":"ssclash".*"service_state":"stopped".*"traffic_state":"inactive"' \
	NEOVPN_PACKAGES="luci-app-ssclash" SSCLASH_PRESENT=1 SSCLASH_CONFIGURED=1 MIHOMO_PRESENT=1
run_case "ssclash-mihomo-unverified" '"id":"ssclash".*"application_state":"active".*"traffic_state":"unknown".*"reason":"traffic_unverified"' \
	NEOVPN_PACKAGES="luci-app-ssclash" SSCLASH_PRESENT=1 SSCLASH_CONFIGURED=1 MIHOMO_PRESENT=1 MIHOMO_RUNNING=1
run_case "ssclash-active" '"id":"ssclash".*"service_state":"running".*"traffic_state":"active".*"health":"ok"' \
	NEOVPN_PACKAGES="luci-app-ssclash" SSCLASH_PRESENT=1 SSCLASH_CONFIGURED=1 MIHOMO_PRESENT=1 MIHOMO_RUNNING=1 SSCLASH_ROUTE=1
run_case "ssclash-invalid-config" '"id":"ssclash".*"service_state":"not_configured".*"configuration_state":"missing"' \
	NEOVPN_PACKAGES="luci-app-ssclash" SSCLASH_PRESENT=1 MIHOMO_PRESENT=1

run_case "podkop-and-ssclash" '"installed_count":2.*"id":"podkop".*"traffic_state":"active".*"id":"ssclash".*"traffic_state":"active"' \
	NEOVPN_PACKAGES="podkop luci-app-podkop luci-app-ssclash" PODKOP_PRESENT=1 PODKOP_CONFIGURED=1 SINGBOX_RUNNING=1 PODKOP_ROUTE=1 SSCLASH_PRESENT=1 SSCLASH_CONFIGURED=1 MIHOMO_PRESENT=1 MIHOMO_RUNNING=1 SSCLASH_ROUTE=1
run_case "netshift-and-ssclash" '"installed_count":2.*"id":"ssclash".*"traffic_state":"active".*"id":"netshift".*"traffic_state":"active"' \
	NEOVPN_PACKAGES="netshift luci-app-netshift luci-app-ssclash" NETSHIFT_PRESENT=1 NETSHIFT_CONFIGURED=1 SINGBOX_RUNNING=1 NETSHIFT_ROUTE=1 SSCLASH_PRESENT=1 SSCLASH_CONFIGURED=1 MIHOMO_PRESENT=1 MIHOMO_RUNNING=1 SSCLASH_ROUTE=1
run_case "mihomo-without-ssclash-not-provider" '"installed_count":0' \
	NEOVPN_PACKAGES="mihomo" MIHOMO_PRESENT=1 MIHOMO_RUNNING=1
