include $(TOPDIR)/rules.mk

PKG_NAME:=luci-theme-neovpn
PKG_VERSION:=1.0.0
PKG_RELEASE:=rc3
PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=Nekt00 <noreply@github.com>
PKGARCH:=all

LUCI_TITLE:=NeoVPN LuCI Theme
LUCI_DESCRIPTION:=NeoVPN production dark LuCI theme for OpenWrt 25.x
LUCI_DEPENDS:=+luci-base
LUCI_PKGARCH:=all

define Package/luci-theme-neovpn/description
NeoVPN is a production dark LuCI theme for OpenWrt with a modern application shell,
dashboard refinements, compact repeated sections, and VPN status integrations.
endef

define Package/luci-theme-neovpn/postrm
#!/bin/sh
if command -v uci >/dev/null 2>&1; then
	uci -q delete luci.themes.NeoVPN
	uci commit luci
fi
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
