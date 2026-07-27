#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRODUCT="$ROOT/products/luci-theme-neovpn"
DIST="$ROOT/dist"
PKG_NAME="luci-theme-neovpn"
VERSION="1.0.0-rc2"
ARCH="all"
MAINTAINER="Nekt00 <noreply@github.com>"
LICENSE="Apache-2.0"
DEPENDS="luci-base"
DESCRIPTION="NeoVPN dark LuCI theme for OpenWrt"

fail() {
	printf 'build-ipk: %s\n' "$*" >&2
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

create_ipk_archive() {
	local archive="$1"
	local workdir="$2"

	if command -v python3 >/dev/null 2>&1; then
		python3 - "$archive" "$workdir/debian-binary" "$workdir/control.tar.gz" "$workdir/data.tar.gz" <<'PY_AR'
import os
import sys

archive = sys.argv[1]
members = sys.argv[2:]

with open(archive, "wb") as out:
    out.write(b"!<arch>\n")
    for member in members:
        name = os.path.basename(member)
        data = open(member, "rb").read()
        header = (
            f"{name:<16}"
            f"{0:<12}"
            f"{0:<6}"
            f"{0:<6}"
            f"{'100644':<8}"
            f"{len(data):<10}"
            "`\n"
        ).encode("ascii")
        if len(header) != 60:
            raise SystemExit(f"invalid ar header for {name}")
        out.write(header)
        out.write(data)
        if len(data) % 2:
            out.write(b"\n")
PY_AR
	else
		command -v ar >/dev/null 2>&1 || fail "python3 or ar is required"
		(cd "$workdir" && ar -rc "$archive" debian-binary control.tar.gz data.tar.gz)
	fi
}

"$ROOT/scripts/validate.sh"

command -v tar >/dev/null 2>&1 || fail "tar is required"

mkdir -p "$DIST"
WORKDIR="$(mktemp -d "${TMPDIR:-/tmp}/neovpn-ipk.XXXXXX")"
trap 'rm -rf "$WORKDIR"' EXIT

mkdir -p "$WORKDIR/control" "$WORKDIR/data/www" "$WORKDIR/data/usr/share/ucode/luci/template/themes" "$WORKDIR/data/etc" "$WORKDIR/data/usr"

cp -R "$PRODUCT/htdocs/luci-static" "$WORKDIR/data/www/"
cp -R "$PRODUCT/ucode/template/themes/neovpn" "$WORKDIR/data/usr/share/ucode/luci/template/themes/"
cp -R "$PRODUCT/root/etc/uci-defaults" "$WORKDIR/data/etc/"
cp -R "$PRODUCT/root/usr/." "$WORKDIR/data/usr/"

chmod 0755 "$WORKDIR/data/etc/uci-defaults/30_luci-theme-neovpn"
if [ -f "$WORKDIR/data/usr/libexec/rpcd/neovpn.vpn" ]; then
	chmod 0755 "$WORKDIR/data/usr/libexec/rpcd/neovpn.vpn"
fi

find "$WORKDIR/data" -type d -empty -exec rmdir {} +

installed_size="$(du -sk "$WORKDIR/data" | awk '{print $1}')"

cat > "$WORKDIR/control/control" <<EOF_CONTROL
Package: $PKG_NAME
Version: $VERSION
Architecture: $ARCH
Maintainer: $MAINTAINER
Installed-Size: $installed_size
Depends: $DEPENDS
Section: luci
Priority: optional
License: $LICENSE
Description: $DESCRIPTION
EOF_CONTROL

cat > "$WORKDIR/control/postinst" <<'EOF_POSTINST'
#!/bin/sh
[ -n "$IPKG_INSTROOT" ] || {
	if [ -x /etc/uci-defaults/30_luci-theme-neovpn ]; then
		/etc/uci-defaults/30_luci-theme-neovpn || true
	fi
}
exit 0
EOF_POSTINST

cat > "$WORKDIR/control/postrm" <<'EOF_POSTRM'
#!/bin/sh
[ -n "$IPKG_INSTROOT" ] || {
	uci -q delete luci.themes.NeoVPN
	uci commit luci
}
exit 0
EOF_POSTRM

chmod 0755 "$WORKDIR/control/postinst" "$WORKDIR/control/postrm"
printf '2.0\n' > "$WORKDIR/debian-binary"

(cd "$WORKDIR/control" && tar -czf "$WORKDIR/control.tar.gz" .)
(cd "$WORKDIR/data" && tar -czf "$WORKDIR/data.tar.gz" .)

versioned="$DIST/${PKG_NAME}_${VERSION}_${ARCH}.ipk"
stable="$DIST/${PKG_NAME}_${ARCH}.ipk"
sha_sums="$DIST/SHA256SUMS"

rm -f "$versioned" "$versioned.sha256" "$stable" "$stable.sha256" "$DIST/${PKG_NAME}.ipk" "$DIST/${PKG_NAME}.ipk.sha256" "$sha_sums"
create_ipk_archive "$versioned" "$WORKDIR"
cp "$versioned" "$stable"

sha256_write "$versioned" "$versioned.sha256"
sha256_write "$stable" "$stable.sha256"
cp "$ROOT/install.sh" "$DIST/install.sh"
cp "$ROOT/uninstall.sh" "$DIST/uninstall.sh"
sha256_write "$DIST/install.sh" "$DIST/install.sh.sha256"
sha256_write "$DIST/uninstall.sh" "$DIST/uninstall.sh.sha256"

(
	cd "$DIST"
	if command -v sha256sum >/dev/null 2>&1; then
		sha256sum "$(basename "$versioned")" "$(basename "$stable")"
	else
		shasum -a 256 "$(basename "$versioned")" "$(basename "$stable")"
	fi
) > "$sha_sums"

printf 'build-ipk: wrote %s\n' "$versioned"
printf 'build-ipk: wrote %s\n' "$stable"
