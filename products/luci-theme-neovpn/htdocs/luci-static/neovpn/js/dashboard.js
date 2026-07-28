(function () {
  "use strict";

  var PAGE_ID = "admin-status-overview";
  var PAGE_PATH = "/cgi-bin/luci/admin/status/overview";
  var PAGE_PATH_ALIASES = [
    PAGE_PATH,
    "/cgi-bin/luci/admin/status",
    "/cgi-bin/luci/"
  ];
  var REFRESH_INTERVAL = 20000;
  var WAIT_INTERVAL = 120;
  var WAIT_LIMIT = 60;
  var ROOT_SELECTOR = '[data-neovpn-dashboard="true"]';
  var STANDARD_PROTOCOLS = {
    none: true,
    static: true,
    dhcp: true,
    dhcpv6: true
  };
  var UPLINK_PROTOCOLS = {
    dhcp: true,
    dhcpv6: true,
    pppoe: true,
    qmi: true,
    ncm: true,
    modemmanager: true,
    "3g": true,
    "6in4": true,
    "6to4": true,
    l2tp: true,
    pptp: true
  };
  var RESOURCE_STATUS = {
    normal: "normal",
    elevated: "elevated",
    critical: "critical",
    informational: "informational",
    unknown: "unknown"
  };
  var WARNING_SEVERITY_WEIGHT = {
    critical: 1,
    warning: 2,
    informational: 3
  };
  var WARNING_SOURCE_WEIGHT = {
    internet: 1,
    system: 2,
    memory: 3,
    storage: 4,
    temperature: 5,
    interfaces: 6,
    freshness: 7
  };
  var DUPLICATE_STOCK_SECTION_KEYS = {
    system: true,
    memory: true,
    storage: true
  };
  var OPTIONAL_STOCK_SECTION_KEYS = {
    upgrades: true,
    dsl: true,
    wireless: true
  };
  var STRINGS = {
    dashboardTitle: "Overview",
    dashboardSubtitle: "System and network summary",
    lastUpdated: "Last updated",
    refresh: "Refresh",
    refreshing: "Refreshing…",
    system: "System",
    internet: "Internet",
    vpn: "VPN",
    clients: "Clients",
    client: "client",
    load: "Load",
    memory: "Memory",
    storage: "Storage",
    temperature: "Temperature",
    networkInterfaces: "Network Interfaces",
    configuredNetworksSummary: "Configured networks and wireless access points",
    manageInterfaces: "Manage interfaces",
    manageWireless: "Open wireless",
    openInterfaces: "Open interfaces",
    up: "Up",
    down: "Down",
    pending: "Pending",
    disabled: "Disabled",
    error: "Error",
    address: "Address",
    device: "Device",
    traffic: "Traffic",
    networkAttachment: "Network",
    clientsCount: "Clients",
    channel: "Channel",
    band: "Band",
    encryption: "Encryption",
    bitrate: "Bitrate",
    signal: "Signal",
    wirelessNetwork: "Wireless",
    guest: "Guest",
    cellular: "Cellular",
    networkRole: "Network",
    lanRole: "LAN",
    internetRole: "Internet",
    ipv6UpstreamRole: "IPv6 upstream",
    tunnelRole: "Tunnel",
    noAddress: "No address",
    noInterfacesAvailable: "No configured interfaces available",
    localNetworks: "Local networks",
    internetGroup: "Internet",
    vpnGroup: "VPN",
    wifiGroup: "Wi-Fi",
    otherGroup: "Other",
    online: "Online",
    warning: "Warning",
    unknown: "Unknown",
    connected: "Connected",
    disconnected: "Disconnected",
    noUpstreamDetected: "No upstream detected",
    active: "Active",
    inactive: "Inactive",
    notDetected: "Not detected",
    informational: "Informational",
    normal: "Normal",
    elevated: "Elevated",
    critical: "Critical",
    loading: "Loading…",
    unavailable: "Unavailable",
    lastKnown: "Last known",
    model: "Model",
    uptime: "Uptime",
    localTime: "Local time",
    interface: "Interface",
    protocol: "Protocol",
    ipv4: "IPv4",
    ipv6: "IPv6",
    dhcpLeases: "DHCP leases",
    dhcpLease: "DHCP lease",
    dhcpLeasesCapitalized: "DHCP Leases",
    dhcpv4: "DHCPv4",
    dhcpv6: "DHCPv6",
    wifi: "Wi-Fi",
    viewDetails: "View details",
    noActiveTunnel: "No active tunnel interface",
    vpnTrafficRouting: "VPN and traffic routing",
    vpnApplicationsNotInstalled: "VPN applications not detected",
    vpnApplicationsEmptyDetail: "Supported applications: Podkop, SSClash and NetShift.",
    vpnIntegrationsUnavailable: "VPN provider status is unavailable",
    vpnIntegrationsUnavailableDetail: "Status will appear after the next successful refresh.",
    service: "Service",
    backend: "Backend",
    backendStatus: "Backend status",
    errors: "Errors",
    routingMode: "Routing mode",
    configuration: "Configuration",
    lastChecked: "Last checked",
    activeSections: "Active sections",
    autostart: "Autostart",
    packageVersion: "Package version",
    configured: "Configured",
    vpnTraffic: "VPN traffic",
    enabled: "Enabled",
    stopped: "Stopped",
    running: "Running",
    connectionError: "Connection error",
    unableToVerify: "Unable to verify",
    checkSucceeded: "success",
    checkWarning: "with warning",
    checkError: "error",
    checkUnavailable: "Check unavailable",
    noErrors: "No errors",
    notDetermined: "Not determined",
    errorRoutingNotActive: "VPN routing is not active",
    errorTrafficUnverified: "VPN traffic could not be verified",
    errorBackendStopped: "Backend is not running",
    errorServiceStopped: "Application is not active",
    errorConfigMissing: "Configuration is missing",
    errorCoreMissing: "Mihomo core is missing",
    degraded: "Degraded",
    conflict: "Conflict",
    configurationRequired: "Configuration required",
    routingActive: "Routing active",
    trafficRoutingActive: "Traffic routing active",
    selectiveRouting: "Selective",
    globalRouting: "All traffic",
    rulesRouting: "Rules",
    directRouting: "Direct",
    unknownRoutingMode: "Unable to determine",
    configurationReady: "Ready",
    configurationMissing: "Not configured",
    configurationInvalid: "Configuration error",
    configurationUnknown: "Unable to verify",
    serviceStopped: "Service stopped",
    conflictDetected: "Conflict detected",
    bothPodkopNetShiftInstalled: "Both Podkop and NetShift are installed.",
    multipleTrafficRoutingRunning: "Multiple routing services are running",
    multipleTrafficRoutingConflictDetail: "Their DNS, firewall or routing rules may conflict.",
    openProviderPrefix: "Open",
    noActiveLeases: "No active leases",
    router: "Router",
    unsupported: "Unsupported",
    oneMinute: "1 min",
    fiveMinutes: "5 min",
    fifteenMinutes: "15 min",
    used: "Used",
    available: "Available",
    free: "Free",
    root: "Root",
    overlay: "Overlay",
    sensor: "Sensor",
    memoryUsed: "Memory used",
    storageUsed: "Storage used",
    loadAverage: "Load average",
    firmware: "Firmware",
    systemNotices: "System notices",
    noActiveWarnings: "No active warnings",
    noActiveInternetConnection: "No active Internet connection",
    wanConfiguredCurrentlyDown: "WAN is configured but currently down.",
    memoryUsageElevated: "Memory usage is elevated",
    memoryUsageCritical: "Memory usage is critical",
    storageUsageElevated: "Storage usage is elevated",
    storageUsageCritical: "Storage usage is critical",
    temperatureElevated: "Device temperature is elevated",
    temperatureCritical: "Device temperature is critical",
    lanInterfaceDown: "LAN interface is down",
    interfaceReportsError: "Interface reports an error",
    someDashboardDataIsStale: "Some dashboard data is stale",
    dashboardDataMayBeOutdated: "Last known values are shown until refresh succeeds.",
    item: "item",
    items: "items"
  };
  var RU_STRINGS = {
    "VPN and traffic routing": "VPN и маршрутизация трафика",
    "VPN traffic": "Трафик через VPN",
    "Protocol": "Протокол",
    "Errors": "Ошибки",
    "Routing mode": "Режим",
    "Configuration": "Конфигурация",
    "Last checked": "Последняя проверка",
    "Running": "Работает",
    "Stopped": "Остановлен",
    "Active": "Активен",
    "Inactive": "Неактивен",
    "Connection error": "Ошибка подключения",
    "Unable to verify": "Не удалось проверить",
    "success": "успешно",
    "with warning": "с предупреждением",
    "error": "ошибка",
    "Check unavailable": "Проверка недоступна",
    "No errors": "Ошибок нет",
    "Not determined": "Не определён",
    "VPN routing is not active": "Маршрутизация через VPN не активна",
    "VPN traffic could not be verified": "Трафик через VPN не удалось проверить",
    "Backend is not running": "Backend не запущен",
    "Application is not active": "Приложение не активно",
    "Configuration is missing": "Конфигурация отсутствует",
    "Mihomo core is missing": "Ядро Mihomo отсутствует",
    "Selective": "Выборочный",
    "All traffic": "Весь трафик",
    "Rules": "По правилам",
    "Direct": "Напрямую",
    "Unable to determine": "Не определен",
    "Ready": "Готова",
    "Not configured": "Не настроена",
    "Configuration error": "Ошибка конфигурации",
    "Open": "Открыть"
  };

  var controller = {
    body: null,
    root: null,
    view: null,
    refreshButton: null,
    updatedNode: null,
    statusStripNode: null,
    networkActivityNode: null,
    systemMetricsNode: null,
    primaryGridNode: null,
    resourceGridNode: null,
    noticeSectionNode: null,
    noticeCountNode: null,
    noticeListNode: null,
    interfaceSectionNode: null,
    interfaceGridNode: null,
    interfaceTableBodyNode: null,
    interfaceEmptyNode: null,
    interfaceManageLinkNode: null,
    initialized: false,
    bootAttempts: 0,
    mountObserver: null,
    stockObserver: null,
    timer: null,
    inFlight: null,
    destroyed: false,
    runtimeErrorLogged: false,
    portEnhancementRunning: false,
    stockSyncFrame: 0,
    modules: null,
    wifiSupportKnown: false,
    wifiSupported: false,
    state: createInitialState(),
    cards: {
      system: null,
      wan: null,
      vpn: null,
      clients: null,
      load: null,
      memory: null,
      storage: null,
      temperature: null
    }
  };

  function translate(label) {
    if (document.body && document.body.classList.contains("lang_ru") && RU_STRINGS[label]) {
      return RU_STRINGS[label];
    }

    if (typeof _ === "function") {
      try {
        return _(label);
      } catch (error) {}
    }

    return label;
  }

  function createInitialState() {
    return {
      timestamp: 0,
      vpnLastCheckedAt: 0,
      stale: false,
      system: createCardState(),
      wan: createCardState(),
      vpn: createCardState(),
      clients: createCardState(),
      load: createCardState(),
      memory: createCardState(),
      storage: createCardState(),
      temperature: createCardState({ render: false }),
      resources: {
        load: {
          available: false,
          one: null,
          five: null,
          fifteen: null,
          cores: null
        },
        memory: {
          available: false,
          total: null,
          used: null,
          free: null,
          availableBytes: null,
          cached: null,
          percent: null
        },
        storage: {
          available: false,
          label: null,
          total: null,
          used: null,
          free: null,
          percent: null
        },
      temperature: {
        available: false,
        supported: false,
        value: null,
        unit: "C",
        sensor: null,
        statusKnown: false
      },
      vpnStatus: null
      },
      interfaces: {
        available: false,
        stale: false,
        logical: [],
        wireless: []
      },
      warnings: []
    };
  }

  function createCardState(overrides) {
    return Object.assign({
      available: false,
      render: true,
      stale: false,
      status: "unknown",
      statusText: translate(STRINGS.loading),
      primary: translate(STRINGS.loading),
      note: translate(STRINGS.loading),
      facts: [],
      href: null,
      progress: null
    }, overrides || {});
  }

  function getDetailUrl() {
    if (typeof L !== "undefined" && typeof L.url === "function") {
      return {
        system: L.url("admin", "system", "system"),
        network: L.url("admin", "network", "network"),
        dhcp: L.url("admin", "network", "dhcp"),
        wireless: L.url("admin", "network", "wireless"),
        overview: L.url("admin", "status", "overview"),
        realtimeLoad: L.url("admin", "status", "realtime", "load")
      };
    }

    return {
      system: "/cgi-bin/luci/admin/system/system",
      network: "/cgi-bin/luci/admin/network/network",
      dhcp: "/cgi-bin/luci/admin/network/dhcp",
      wireless: "/cgi-bin/luci/admin/network/wireless",
      overview: "/cgi-bin/luci/admin/status/overview",
      realtimeLoad: "/cgi-bin/luci/admin/status/realtime/load"
    };
  }

  function getUnavailableValue(value) {
    return value == null || value === "" ? "—" : String(value);
  }

  function safeNumber(value) {
    var number = Number(value);

    return isFinite(number) ? number : null;
  }

  function safePositiveNumber(value) {
    var number = safeNumber(value);

    return number != null && number >= 0 ? number : null;
  }

  function clampNumber(value, min, max) {
    if (value == null) {
      return null;
    }

    return Math.min(max, Math.max(min, value));
  }

  function normalizePercent(used, total) {
    var usedNumber = safePositiveNumber(used);
    var totalNumber = safePositiveNumber(total);

    if (usedNumber == null || totalNumber == null || totalNumber <= 0 || usedNumber > totalNumber) {
      return null;
    }

    return clampNumber((usedNumber / totalNumber) * 100, 0, 100);
  }

  function formatPercent(value, decimals) {
    var number = safeNumber(value);

    if (number == null) {
      return "—";
    }

    return number.toFixed(decimals == null ? 0 : decimals) + "%";
  }

  function formatCompactDuration(seconds) {
    var total = Math.max(0, Number(seconds) || 0);
    var days = Math.floor(total / 86400);
    var hours = Math.floor((total % 86400) / 3600);
    var minutes = Math.floor((total % 3600) / 60);

    if (total < 60) {
      return total + "s";
    }

    if (days > 0) {
      return days + "d" + (hours > 0 ? " " + hours + "h" : "");
    }

    if (hours > 0) {
      return hours + "h" + (minutes > 0 ? " " + minutes + "m" : "");
    }

    return minutes + "m";
  }

  function normalizeLoadValue(entry) {
    var value = safePositiveNumber(entry);

    if (value == null) {
      return null;
    }

    if (value > 8) {
      return value / 65535;
    }

    return value;
  }

  function formatLoadValue(value) {
    var number = safeNumber(value);

    if (number == null) {
      return "—";
    }

    if (number > 0 && number < 0.01) {
      return "< 0.01";
    }

    return number.toFixed(2);
  }

  function pluralizeItems(count) {
    var total = Math.max(0, parseInt(count, 10) || 0);

    return total + " " + translate(total === 1 ? STRINGS.item : STRINGS.items);
  }

  function normalizeSectionText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\u00a0/g, " ")
      .trim()
      .toLowerCase();
  }

  function getExpectedStockSectionTitles() {
    return {
      system: [translate(STRINGS.system), "System"],
      memory: [translate(STRINGS.memory), "Memory"],
      storage: [translate(STRINGS.storage), "Storage"],
      "port-status": [translate("Port status"), "Port status"],
      network: [translate("Network"), "Network"],
      "dhcp-leases": [translate(STRINGS.dhcpLeasesCapitalized), "DHCP Leases"],
      upgrades: [translate("Upgrades"), "Upgrades"],
      dsl: [translate("DSL"), "DSL"],
      wireless: [translate(STRINGS.wifi), "Wireless"]
    };
  }

  function getStockSectionTitle(section) {
    var wrap = null;
    var heading = null;
    var clone = null;

    if (!section) {
      return "";
    }

    wrap = section.querySelector(":scope > .cbi-title");
    heading = wrap ? (wrap.querySelector("h1, h2, h3, h4, h5, h6, legend") || wrap) : null;

    if (!heading) {
      return "";
    }

    clone = heading.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll(".label, [data-indicator], [data-clickable]"), function (node) {
      node.remove();
    });

    return String(clone.textContent || "").replace(/\s+/g, " ").trim();
  }

  function getStockSectionBody(section) {
    var titleWrap = section ? section.querySelector(":scope > .cbi-title") : null;

    return titleWrap ? titleWrap.nextElementSibling : null;
  }

  function getStockSectionKey(section) {
    var title = normalizeSectionText(getStockSectionTitle(section));
    var expectedTitles = getExpectedStockSectionTitles();
    var matchedKey = null;

    Object.keys(expectedTitles).some(function (key) {
      var variants = expectedTitles[key];
      var matched = variants.some(function (label) {
        return normalizeSectionText(label) === title;
      });

      if (matched) {
        matchedKey = key;
      }

      return matched;
    });

    if (matchedKey) {
      return matchedKey;
    }

    if (section && section.querySelector(".ifacebox")) {
      return "port-status";
    }

    if (section && section.querySelector(".network-status-table")) {
      return "network";
    }

    return null;
  }

  function hasMeaningfulSectionContent(body) {
    if (!body) {
      return false;
    }

    return !!body.querySelector(
      ".ifacebox, .network-status-table, .cbi-progressbar, table tbody tr, .table tbody tr, .ifacebadge, .zonebadge, .cbi-section-table-row, .cbi-value-field, ul li, ol li"
    );
  }

  function isOptionalSectionEmpty(section, key) {
    var body = getStockSectionBody(section);
    var text = normalizeSectionText(body ? body.textContent : "");

    if (!OPTIONAL_STOCK_SECTION_KEYS[key]) {
      return false;
    }

    if (section && section.style && section.style.display === "none") {
      return true;
    }

    if (section && typeof window !== "undefined" && window.getComputedStyle(section).display === "none") {
      return true;
    }

    if (!body) {
      return true;
    }

    if (body.querySelector(".spinning, .loading, [data-indicator='poll-status']")) {
      return false;
    }

    if (hasMeaningfulSectionContent(body)) {
      return false;
    }

    return text === "" || text === "-" || text === "—";
  }

  function normalizeInlineText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\s*·\s*/g, " · ")
      .trim();
  }

  function formatPortSpeed(value) {
    var text = normalizeInlineText(value)
      .replace(/\bM\b/i, "Mbit/s")
      .replace(/\bG\b/i, "Gbit/s")
      .replace(/\bK\b/i, "Kbit/s");

    if (!text) {
      return "";
    }

    if (/^(?:no link|down)$/i.test(text)) {
      return translate("No link");
    }

    if (/(?:bit\/s|bps)$/i.test(text)) {
      return text;
    }

    return text;
  }

  function formatPortTraffic(value) {
    var text = normalizeInlineText(value);
    var match = text.match(/▲\s*([^▼]+?)\s*▼\s*(.+)$/);

    if (!match) {
      return "";
    }

    return "RX " + normalizeInlineText(match[1]) + " · TX " + normalizeInlineText(match[2]);
  }

  function setNodeText(node, text) {
    if (!node) {
      return;
    }

    node.textContent = text || "";
  }

  function getPortCustomSelectors() {
    return [
      "[data-neovpn-port-name]",
      "[data-neovpn-port-state]",
      "[data-neovpn-port-speed]",
      "[data-neovpn-port-stats-line]",
      "[data-neovpn-port-headline]",
      "[data-neovpn-port-title]",
      "[data-neovpn-port-status]",
      "[data-neovpn-port-status-dot]",
      "[data-neovpn-port-detail]",
      "[data-neovpn-port-traffic]",
      "[data-neovpn-port-assignment]",
      "[data-neovpn-port-rendered]"
    ].join(", ");
  }

  function resetInlineProperties(node, properties) {
    if (!node || !node.style) {
      return;
    }

    properties.forEach(function (property) {
      node.style.removeProperty(property);
    });
  }

  function resetPortStatusDecoration(section, grid) {
    var customSelector = getPortCustomSelectors();

    if (section) {
      delete section.dataset.neovpnPortStatus;
    }

    if (grid) {
      delete grid.dataset.neovpnPortGrid;
      resetInlineProperties(grid, [
        "display",
        "grid-template-columns",
        "gap",
        "margin-bottom",
        "justify-content",
        "align-items"
      ]);
    }

    Array.prototype.forEach.call((grid || section || document).querySelectorAll(customSelector), function (node) {
      node.remove();
    });

    Array.prototype.forEach.call((grid || section || document).querySelectorAll("[data-neovpn-port-enhanced]"), function (tile) {
      delete tile.dataset.neovpnPortEnhanced;
      delete tile.dataset.neovpnPortTile;
    });

    Array.prototype.forEach.call((grid || section || document).querySelectorAll(".ifacebox"), function (tile) {
      var head = tile.children[0] || null;
      var main = tile.children[1] || null;
      var membership = tile.children[2] || null;
      var stats = tile.children[3] || null;

      resetInlineProperties(tile, [
        "display",
        "flex-direction",
        "justify-content",
        "gap",
        "margin",
        "min-width",
        "max-width",
        "min-height",
        "padding",
        "box-sizing",
        "align-self"
      ]);

      [head, main, membership, stats].forEach(function (node) {
        if (!node) {
          return;
        }

        resetInlineProperties(node, [
          "display",
          "align-items",
          "justify-content",
          "width",
          "min-height",
          "height",
          "padding",
          "font-size",
          "line-height",
          "margin",
          "margin-top",
          "margin-bottom",
          "gap"
        ]);
      });

      Array.prototype.forEach.call(tile.querySelectorAll("img, svg"), function (icon) {
        resetInlineProperties(icon, [
          "display",
          "width",
          "height",
          "max-width",
          "max-height"
        ]);
        delete icon.dataset.neovpnPortIcon;
      });

      [head, main, membership, stats].forEach(function (node) {
        if (!node) {
          return;
        }

        delete node.dataset.neovpnPortHead;
        delete node.dataset.neovpnPortBody;
        delete node.dataset.neovpnPortMembership;
        delete node.dataset.neovpnPortStats;
        delete node.dataset.neovpnPortSource;
      });
    });
  }

  function getVisibleStockPortText(node) {
    var parts = [];

    if (!node) {
      return "";
    }

    Array.prototype.forEach.call(node.childNodes, function (child) {
      if (child.nodeType === 3) {
        parts.push(child.textContent || "");
        return;
      }

      if (child.nodeType !== 1) {
        return;
      }

      if (child.matches(".cbi-tooltip, [data-neovpn-port-rendered], [data-neovpn-port-title], [data-neovpn-port-status], [data-neovpn-port-detail], [data-neovpn-port-traffic]")) {
        return;
      }

      if (child.tagName === "BR") {
        parts.push(" ");
        return;
      }

      if (child.matches("img, svg")) {
        return;
      }

      parts.push(getVisibleStockPortText(child));
    });

    return normalizeInlineText(parts.join(" "));
  }

  function createPortRenderedNode(type) {
    var node = document.createElement("div");

    node.setAttribute("data-neovpn-port-" + type, "true");
    return node;
  }

  function getPortAssignmentText(membership) {
    var tooltip = membership ? membership.querySelector(".cbi-tooltip") : null;
    var text = normalizeInlineText(tooltip ? tooltip.textContent : getVisibleStockPortText(membership));

    text = text
      .replace(/^part of networks?:/i, "")
      .replace(/:+$/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return text;
  }

  function getPortSpeedText(main) {
    var speedNode = main ? main.querySelector("[title*='Speed'], [title*='Duplex']") : null;
    var title = speedNode ? speedNode.getAttribute("title") : "";
    var text = formatPortSpeed(getVisibleStockPortText(main));

    if (title) {
      var speed = /Speed:\s*([^,]+)/i.exec(title);
      var duplex = /Duplex:\s*([^,]+)/i.exec(title);
      var parts = [];

      if (speed && speed[1]) {
        parts.push(normalizeInlineText(speed[1]));
      }

      if (duplex && duplex[1]) {
        parts.push(normalizeInlineText(duplex[1]).replace(/^([a-z])/, function (match) {
          return match.toUpperCase();
        }) + " duplex");
      }

      if (parts.length) {
        return parts.join(" · ");
      }
    }

    return text;
  }

  function getPortLinkState(main) {
    var iconSource = main ? main.querySelector("img, svg") : null;
    var source = iconSource ? String(iconSource.getAttribute("src") || iconSource.getAttribute("href") || "") : "";
    var text = normalizeInlineText(getVisibleStockPortText(main)).toLowerCase();

    if (/port_down|down|no link/.test(source) || /(?:^|\s)(?:no link|disabled|disconnected|down)(?:\s|$)/.test(text)) {
      return {
        up: false,
        label: "DOWN",
        reason: translate("Cable disconnected")
      };
    }

    if (/port_up|up/.test(source) || /\b(?:[0-9.]+\s*[kmgt]?(?:bit\/s|bps|m|g))\b/i.test(text)) {
      return {
        up: true,
        label: "UP",
        reason: ""
      };
    }

    return {
      up: false,
      label: "DOWN",
      reason: translate("Cable disconnected")
    };
  }

  function markPortStatusElements(section) {
    var body = getStockSectionBody(section);
    var grid = body ? body.firstElementChild : null;

    if (!grid || !grid.querySelector(".ifacebox")) {
      return;
    }

    if (controller.portEnhancementRunning) {
      return;
    }

    controller.portEnhancementRunning = true;

    if (controller.stockObserver) {
      controller.stockObserver.disconnect();
    }

    try {
      resetPortStatusDecoration(section, grid);

      section.dataset.neovpnPortStatus = "true";
      grid.dataset.neovpnPortGrid = "true";

      Array.prototype.forEach.call(grid.querySelectorAll(":scope > .ifacebox"), function (tile) {
        var head = tile.children[0] || null;
        var main = tile.children[1] || null;
        var membership = tile.children[2] || null;
        var stats = tile.children[3] || null;
        var headlineNode = createPortRenderedNode("headline");
        var titleNode = createPortRenderedNode("title");
        var statusNode = createPortRenderedNode("status");
        var statusDot = document.createElement("span");
        var detailNode = createPortRenderedNode("detail");
        var assignmentNode = createPortRenderedNode("assignment");
        var rendered = document.createElement("div");
        var portName = getVisibleStockPortText(head);
        var speedText = getPortSpeedText(main);
        var assignmentText = getPortAssignmentText(membership);
        var linkState = getPortLinkState(main);
        var detailText = linkState.up ? speedText : linkState.reason;

        rendered.setAttribute("data-neovpn-port-rendered", "true");
        tile.dataset.neovpnPortEnhanced = "true";
        tile.dataset.neovpnPortTile = "true";
        tile.dataset.neovpnPortLinkState = linkState.up ? "up" : "down";

        statusNode.dataset.neovpnPortState = linkState.up ? "up" : "down";
        statusDot.setAttribute("data-neovpn-port-status-dot", "true");

        setNodeText(titleNode, portName);
        setNodeText(statusNode, linkState.label);
        setNodeText(detailNode, detailText || assignmentText || "—");
        setNodeText(assignmentNode, linkState.up ? assignmentText : "");

        statusNode.insertBefore(statusDot, statusNode.firstChild);
        headlineNode.appendChild(titleNode);
        headlineNode.appendChild(statusNode);
        rendered.appendChild(headlineNode);
        rendered.appendChild(detailNode);
        rendered.appendChild(assignmentNode);

        if (head) {
          head.dataset.neovpnPortSource = "head";
        }

        if (main) {
          main.dataset.neovpnPortSource = "main";
        }

        if (membership) {
          membership.dataset.neovpnPortSource = "membership";
        }

        if (stats) {
          stats.dataset.neovpnPortSource = "stats";
        }

        tile.appendChild(rendered);
      });
    } finally {
      controller.portEnhancementRunning = false;

      if (controller.view && controller.stockObserver) {
        controller.stockObserver.observe(controller.view, {
          childList: true,
          subtree: true
        });
      }
    }
  }

  function setOverviewReadyState(ready) {
    if (!document.body) {
      return;
    }

    document.body.dataset.neovpnOverviewReady = ready ? "true" : "false";

    if (ready && window.__neovpnOverviewFallbackTimer) {
      window.clearTimeout(window.__neovpnOverviewFallbackTimer);
      window.__neovpnOverviewFallbackTimer = 0;
    }
  }

  function classifyStockSections() {
    var sections = [];
    var matched = {};

    if (!controller.view) {
      return matched;
    }

    sections = Array.prototype.filter.call(controller.view.children, function (node) {
      return node &&
        node.nodeType === 1 &&
        node.matches(".cbi-section") &&
        !node.matches(ROOT_SELECTOR);
    });

    sections.forEach(function (section) {
      var key = getStockSectionKey(section);
      var hidden = false;

      if (!key) {
        return;
      }

      matched[key] = section;
      section.dataset.neovpnStockSection = key;

      if (key === "port-status") {
        markPortStatusElements(section);
      }

      if (DUPLICATE_STOCK_SECTION_KEYS[key]) {
        hidden = true;
      } else if (OPTIONAL_STOCK_SECTION_KEYS[key]) {
        hidden = isOptionalSectionEmpty(section, key);
      }

      section.hidden = hidden;
      section.dataset.neovpnStockHidden = hidden ? "true" : "false";
    });

    return matched;
  }

  function syncOverviewStockSections() {
    var matched = classifyStockSections();
    var ready = !!(
      controller.root &&
      matched.system &&
      matched.memory &&
      matched.storage &&
      matched["port-status"] &&
      matched.network &&
      matched["dhcp-leases"] &&
      matched.system.hidden &&
      matched.memory.hidden &&
      matched.storage.hidden
    );

    setOverviewReadyState(ready);
  }

  function queueOverviewStockSectionSync() {
    if (controller.stockSyncFrame || controller.destroyed) {
      return;
    }

    controller.stockSyncFrame = window.requestAnimationFrame(function () {
      controller.stockSyncFrame = 0;
      syncOverviewStockSections();
    });
  }

  function startOverviewStockObserver() {
    if (!controller.view || controller.stockObserver) {
      return;
    }

    controller.stockObserver = new MutationObserver(function (mutations) {
      var relevant = mutations.some(function (mutation) {
        return mutation.type === "childList";
      });

      if (relevant) {
        queueOverviewStockSectionSync();
      }
    });

    controller.stockObserver.observe(controller.view, {
      childList: true,
      subtree: true
    });
  }

  function getStatusTone(status) {
    switch (status) {
    case "online":
    case "connected":
    case "active":
    case "normal":
      return "positive";
    case "warning":
    case "elevated":
    case "disconnected":
    case "pending":
      return "warning";
    case "critical":
    case "error":
      return "critical";
    case "stale":
    case "last-known":
      return "stale";
    default:
      return "neutral";
    }
  }

  function formatLoad(load) {
    if (!Array.isArray(load) || !load.length) {
      return "—";
    }

    return load.slice(0, 3).map(function (entry) {
      return formatLoadValue(normalizeLoadValue(entry));
    }).join(" / ");
  }

  function formatLocalTime(epochSeconds) {
    if (!epochSeconds) {
      return "—";
    }

    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(epochSeconds * 1000));
    } catch (error) {
      return new Date(epochSeconds * 1000).toLocaleString();
    }
  }

  function formatUpdatedTime(epochMs) {
    if (!epochMs) {
      return "—";
    }

    try {
      return new Intl.DateTimeFormat(undefined, {
        timeStyle: "medium"
      }).format(new Date(epochMs));
    } catch (error) {
      return new Date(epochMs).toLocaleTimeString();
    }
  }

  function formatVpnCheckedTime(epochMs) {
    if (!epochMs) {
      return "—";
    }

    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(epochMs));
    } catch (error) {
      return new Date(epochMs).toLocaleTimeString().slice(0, 5);
    }
  }

  function formatVpnProviderLastCheck(provider, fallbackEpochMs) {
    var lastCheck = provider && provider.last_check ? provider.last_check : null;
    var timestamp = lastCheck && lastCheck.timestamp ? Number(lastCheck.timestamp) * 1000 : fallbackEpochMs;
    var result = lastCheck && lastCheck.result ? lastCheck.result : "unknown";
    var time = formatVpnCheckedTime(timestamp);
    var resultText = translate(STRINGS.checkUnavailable);

    switch (result) {
    case "success":
      resultText = translate(STRINGS.checkSucceeded);
      break;
    case "warning":
      resultText = translate(STRINGS.checkWarning);
      break;
    case "error":
      resultText = translate(STRINGS.checkError);
      break;
    }

    if (!timestamp || result === "unknown") {
      return resultText;
    }

    return time + " · " + resultText;
  }

  function formatBytes(bytes) {
    var value = safePositiveNumber(bytes);
    var units = ["B", "KB", "MB", "GB", "TB"];
    var unitIndex = 0;

    if (value == null) {
      return "—";
    }

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }

    if (unitIndex === 0) {
      return Math.round(value) + " " + units[unitIndex];
    }

    return value.toFixed(value >= 10 ? 0 : 1) + " " + units[unitIndex];
  }

  function formatResourcePair(used, total) {
    var usedNumber = safePositiveNumber(used);
    var totalNumber = safePositiveNumber(total);

    if (usedNumber == null || totalNumber == null) {
      return "—";
    }

    return formatBytes(usedNumber) + " / " + formatBytes(totalNumber);
  }

  function formatTemperature(value, unit) {
    var number = safeNumber(value);

    if (number == null) {
      return "—";
    }

    return number.toFixed(number >= 100 ? 0 : 1).replace(/\.0$/, "") + "°" + (unit || "C");
  }

  function formatBitRate(valueKbps) {
    var value = safePositiveNumber(valueKbps);

    if (value == null) {
      return "—";
    }

    if (value >= 1000) {
      return (value / 1000).toFixed((value / 1000) >= 10 ? 0 : 1).replace(/\.0$/, "") + " Mbit/s";
    }

    return Math.round(value) + " Kbit/s";
  }

  function normalizeAddress(list) {
    if (!Array.isArray(list) || !list.length) {
      return null;
    }

    return String(list[0]).replace(/\/\d+$/, "");
  }

  function pluralizeDhcpLeases(count) {
    var total = Math.max(0, parseInt(count, 10) || 0);
    var singular = translate(STRINGS.dhcpLease);
    var plural = translate(STRINGS.dhcpLeases);

    return total + " " + (total === 1 ? singular : plural);
  }

  function getResourceStatusText(status) {
    if (status === RESOURCE_STATUS.normal) {
      return translate(STRINGS.normal);
    }

    if (status === RESOURCE_STATUS.elevated) {
      return translate(STRINGS.elevated);
    }

    if (status === RESOURCE_STATUS.critical) {
      return translate(STRINGS.critical);
    }

    if (status === RESOURCE_STATUS.informational) {
      return translate(STRINGS.informational);
    }

    return translate(STRINGS.unknown);
  }

  function getUsageStatus(percent) {
    var value = safeNumber(percent);

    if (value == null) {
      return RESOURCE_STATUS.unknown;
    }

    if (value >= 90) {
      return RESOURCE_STATUS.critical;
    }

    if (value >= 75) {
      return RESOURCE_STATUS.elevated;
    }

    return RESOURCE_STATUS.normal;
  }

  function getTemperatureStatus(value, statusKnown) {
    var number = safeNumber(value);

    if (number == null) {
      return RESOURCE_STATUS.unknown;
    }

    if (!statusKnown) {
      return RESOURCE_STATUS.informational;
    }

    if (number >= 85) {
      return RESOURCE_STATUS.critical;
    }

    if (number >= 70) {
      return RESOURCE_STATUS.elevated;
    }

    return RESOURCE_STATUS.normal;
  }

  function createFact(label, value, unavailable) {
    var wrapper = document.createElement("div");
    var term = document.createElement("dt");
    var detail = document.createElement("dd");

    wrapper.className = "neovpn-summary-card__fact";
    term.className = "neovpn-summary-card__fact-label";
    detail.className = "neovpn-summary-card__fact-value";

    if (unavailable) {
      detail.classList.add("is-unavailable");
    }

    term.textContent = label;
    detail.textContent = value;
    wrapper.appendChild(term);
    wrapper.appendChild(detail);

    return wrapper;
  }

  function createCardShell(cardName, title, options) {
    var card = document.createElement("article");
    var header = document.createElement("header");
    var heading = document.createElement("h3");
    var status = document.createElement("span");
    var primary = document.createElement("div");
    var value = document.createElement("div");
    var note = document.createElement("div");
    var progress = null;
    var progressFill = null;
    var facts = document.createElement("dl");
    var link = document.createElement("a");
    var settings = options || {};

    card.className = "neovpn-summary-card";
    card.dataset.card = cardName;

    if (settings.resource) {
      card.classList.add("neovpn-summary-card--resource");
    }

    header.className = "neovpn-summary-card__header";
    heading.className = "neovpn-summary-card__title";
    heading.textContent = title;

    status.className = "neovpn-status";
    status.dataset.status = "unknown";
    status.textContent = translate(STRINGS.loading);

    primary.className = "neovpn-summary-card__primary";
    value.className = "neovpn-summary-card__value";
    value.textContent = translate(STRINGS.loading);
    note.className = "neovpn-summary-card__note";
    note.textContent = translate(STRINGS.loading);

    if (settings.resource) {
      progress = document.createElement("div");
      progressFill = document.createElement("span");
      progress.className = "neovpn-progress";
      progress.hidden = true;
      progress.setAttribute("role", "progressbar");
      progress.setAttribute("aria-valuemin", "0");
      progress.setAttribute("aria-valuemax", "100");
      progress.setAttribute("aria-valuenow", "0");
      progressFill.className = "neovpn-progress__fill";
      progressFill.style.width = "0%";
      progress.appendChild(progressFill);
    }

    facts.className = "neovpn-summary-card__facts";
    link.className = "neovpn-summary-card__link";
    link.textContent = translate(STRINGS.viewDetails);
    link.href = "#";

    header.appendChild(heading);
    header.appendChild(status);
    primary.appendChild(value);
    primary.appendChild(note);
    card.appendChild(header);
    card.appendChild(primary);

    if (progress) {
      card.appendChild(progress);
    }

    card.appendChild(facts);
    card.appendChild(link);

    return {
      root: card,
      title: heading,
      status: status,
      value: value,
      note: note,
      progress: progress,
      progressFill: progressFill,
      facts: facts,
      link: link
    };
  }

  function createDashboardRoot() {
    var section = document.createElement("section");
    var header = document.createElement("header");
    var copy = document.createElement("div");
    var heading = document.createElement("h2");
    var subtitle = document.createElement("p");
    var meta = document.createElement("div");
    var updated = document.createElement("span");
    var refresh = document.createElement("button");
    var statusStrip = document.createElement("div");
    var operational = document.createElement("div");
    var trafficSection = document.createElement("section");
    var trafficHeader = document.createElement("header");
    var trafficHeading = document.createElement("h2");
    var trafficBody = document.createElement("div");
    var vpnSection = document.createElement("section");
    var vpnHeader = document.createElement("header");
    var vpnHeaderCopy = document.createElement("div");
    var vpnHeading = document.createElement("h2");
    var vpnBody = document.createElement("div");
    var noticeSection = document.createElement("section");
    var noticeHeader = document.createElement("header");
    var noticeHeading = document.createElement("h2");
    var noticeCount = document.createElement("span");
    var noticeList = document.createElement("div");
    var interfaceSection = document.createElement("section");
    var interfaceHeader = document.createElement("header");
    var interfaceCopy = document.createElement("div");
    var interfaceHeading = document.createElement("h2");
    var interfaceSubtitle = document.createElement("p");
    var interfaceManage = document.createElement("a");
    var interfaceTableWrap = document.createElement("div");
    var interfaceTable = document.createElement("table");
    var interfaceHead = document.createElement("thead");
    var interfaceHeadRow = document.createElement("tr");
    var interfaceBody = document.createElement("tbody");
    var interfaceEmpty = document.createElement("p");
    var interfaceColumns = [
      translate(STRINGS.interface),
      translate(STRINGS.protocol),
      translate(STRINGS.address),
      "RX",
      "TX",
      "State"
    ];
    var urls = getDetailUrl();

    section.className = "neovpn-console";
    section.dataset.neovpnDashboard = "true";
    section.setAttribute("aria-labelledby", "neovpn-dashboard-title");
    section.setAttribute("aria-busy", "true");

    header.className = "neovpn-console__header";
    copy.className = "neovpn-console__header-copy";
    heading.className = "neovpn-console__title";
    heading.id = "neovpn-dashboard-title";
    heading.textContent = "Overview";
    subtitle.className = "neovpn-console__subtitle";
    subtitle.textContent = translate(STRINGS.dashboardSubtitle);

    meta.className = "neovpn-console__meta";
    updated.className = "neovpn-console__updated";
    updated.textContent = translate(STRINGS.lastUpdated) + " —";

    refresh.className = "neovpn-console__refresh";
    refresh.type = "button";
    refresh.textContent = translate(STRINGS.refresh);
    refresh.setAttribute("aria-label", translate(STRINGS.refresh));

    statusStrip.className = "neovpn-console__status-strip";
    statusStrip.setAttribute("aria-label", "Current network status");

    operational.className = "neovpn-console__operational";
    trafficSection.className = "neovpn-console-section neovpn-console-section--traffic";
    trafficHeader.className = "neovpn-console-section__header";
    trafficHeading.textContent = "Network activity";
    trafficBody.className = "neovpn-console-activity";
    trafficHeader.appendChild(trafficHeading);
    trafficSection.appendChild(trafficHeader);
    trafficSection.appendChild(trafficBody);

    vpnSection.className = "neovpn-console-section neovpn-console-section--vpn";
    vpnHeader.className = "neovpn-console-section__header";
    vpnHeaderCopy.className = "neovpn-console-section__copy";
    vpnHeading.textContent = translate(STRINGS.vpnTrafficRouting);
    vpnBody.className = "neovpn-console-vpn";
    vpnHeaderCopy.appendChild(vpnHeading);
    vpnHeader.appendChild(vpnHeaderCopy);
    vpnSection.appendChild(vpnHeader);
    vpnSection.appendChild(vpnBody);
    operational.appendChild(trafficSection);
    operational.appendChild(vpnSection);

    noticeSection.className = "neovpn-console-notices";
    noticeSection.setAttribute("aria-labelledby", "neovpn-dashboard-notices-title");
    noticeHeader.className = "neovpn-console-notices__header";
    noticeHeading.className = "neovpn-console-notices__title";
    noticeHeading.id = "neovpn-dashboard-notices-title";
    noticeHeading.textContent = translate(STRINGS.systemNotices);
    noticeCount.className = "neovpn-console-notices__count";
    noticeList.className = "neovpn-console-notices__list";
    noticeList.setAttribute("role", "list");

    interfaceSection.className = "neovpn-console-section neovpn-console-section--interfaces";
    interfaceSection.setAttribute("aria-labelledby", "neovpn-interfaces-title");
    interfaceHeader.className = "neovpn-console-section__header";
    interfaceCopy.className = "neovpn-console-section__copy";
    interfaceHeading.id = "neovpn-interfaces-title";
    interfaceHeading.textContent = translate(STRINGS.networkInterfaces);
    interfaceSubtitle.textContent = translate(STRINGS.configuredNetworksSummary);
    interfaceManage.className = "neovpn-console-section__link";
    interfaceManage.href = urls.network;
    interfaceManage.textContent = translate(STRINGS.manageInterfaces);
    interfaceTableWrap.className = "neovpn-console-table-wrap";
    interfaceTable.className = "neovpn-console-table";
    interfaceColumns.forEach(function (label) {
      var cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = label;
      interfaceHeadRow.appendChild(cell);
    });
    interfaceHead.appendChild(interfaceHeadRow);
    interfaceTable.appendChild(interfaceHead);
    interfaceTable.appendChild(interfaceBody);
    interfaceTableWrap.appendChild(interfaceTable);
    interfaceEmpty.className = "neovpn-console-empty";
    interfaceEmpty.hidden = true;
    interfaceEmpty.textContent = translate(STRINGS.noInterfacesAvailable);

    copy.appendChild(heading);
    copy.appendChild(subtitle);
    meta.appendChild(updated);
    meta.appendChild(refresh);
    header.appendChild(copy);
    header.appendChild(meta);
    section.appendChild(header);
    section.appendChild(statusStrip);
    noticeHeader.appendChild(noticeHeading);
    noticeHeader.appendChild(noticeCount);
    noticeSection.appendChild(noticeHeader);
    noticeSection.appendChild(noticeList);
    section.appendChild(noticeSection);
    section.appendChild(operational);
    interfaceCopy.appendChild(interfaceHeading);
    interfaceCopy.appendChild(interfaceSubtitle);
    interfaceHeader.appendChild(interfaceCopy);
    interfaceHeader.appendChild(interfaceManage);
    interfaceSection.appendChild(interfaceHeader);
    interfaceSection.appendChild(interfaceTableWrap);
    interfaceSection.appendChild(interfaceEmpty);
    section.appendChild(interfaceSection);

    controller.updatedNode = updated;
    controller.refreshButton = refresh;
    controller.statusStripNode = statusStrip;
    controller.networkActivityNode = trafficBody;
    controller.systemMetricsNode = null;
    controller.vpnNode = vpnBody;
    controller.primaryGridNode = null;
    controller.resourceGridNode = null;
    controller.noticeSectionNode = noticeSection;
    controller.noticeCountNode = noticeCount;
    controller.noticeListNode = noticeList;
    controller.interfaceSectionNode = interfaceSection;
    controller.interfaceGridNode = interfaceTableWrap;
    controller.interfaceTableBodyNode = interfaceBody;
    controller.interfaceEmptyNode = interfaceEmpty;
    controller.interfaceManageLinkNode = interfaceManage;

    return section;
  }

  function getCardConfig(key) {
    var urls = getDetailUrl();

    return {
      system: { title: translate(STRINGS.system), href: urls.system, grid: "primary" },
      wan: { title: translate(STRINGS.internet), href: urls.network, grid: "primary" },
      vpn: { title: translate(STRINGS.vpn), href: urls.network, grid: "primary" },
      clients: { title: translate(STRINGS.clients), href: urls.dhcp, grid: "primary" },
      load: { title: translate(STRINGS.load), href: urls.realtimeLoad, grid: "resources", resource: true },
      memory: { title: translate(STRINGS.memory), href: urls.overview, grid: "resources", resource: true },
      storage: { title: translate(STRINGS.storage), href: urls.overview, grid: "resources", resource: true },
      temperature: { title: translate(STRINGS.temperature), href: null, grid: "resources", resource: true }
    }[key];
  }

  function updateResourceGridCount() {
    if (!controller.resourceGridNode) {
      return;
    }

    controller.resourceGridNode.dataset.cardCount = String(controller.resourceGridNode.children.length);
  }

  function ensureCardShell(key) {
    var config = getCardConfig(key);
    var targetGrid = null;

    if (!config || controller.cards[key]) {
      return;
    }

    targetGrid = config.grid === "resources" ? controller.resourceGridNode : controller.primaryGridNode;

    if (!targetGrid) {
      return;
    }

    controller.cards[key] = createCardShell(key, config.title, {
      resource: !!config.resource
    });
    controller.cards[key].link.href = config.href || "#";
    targetGrid.appendChild(controller.cards[key].root);
    updateResourceGridCount();
  }

  function ensureCardShells() {
    ["system", "wan", "vpn", "clients", "load", "memory", "storage"].forEach(ensureCardShell);
  }

  function removeCardShell(key) {
    if (!controller.cards[key]) {
      return;
    }

    if (controller.cards[key].root.parentNode) {
      controller.cards[key].root.parentNode.removeChild(controller.cards[key].root);
    }

    controller.cards[key] = null;
    updateResourceGridCount();
  }

  function setProgress(card, progressState) {
    var percent = null;
    var valueText = "0%";

    if (!card || !card.progress || !card.progressFill) {
      return;
    }

    if (!progressState || progressState.percent == null) {
      card.progress.hidden = true;
      card.progressFill.style.width = "0%";
      card.progress.setAttribute("aria-valuenow", "0");
      return;
    }

    percent = clampNumber(Math.round(progressState.percent), 0, 100);
    valueText = String(percent) + "%";

    card.progress.hidden = false;
    card.progress.setAttribute("aria-label", progressState.label || card.title.textContent);
    card.progress.setAttribute("aria-valuenow", String(percent));
    card.progressFill.style.width = valueText;
  }

  function updateCard(key, cardState) {
    var card = controller.cards[key];

    if (!card || !cardState || cardState.render === false) {
      return;
    }

    card.root.dataset.cardStatus = cardState.status || "unknown";
    card.root.dataset.statusTone = cardState.statusTone || getStatusTone(cardState.status);
    card.status.dataset.status = cardState.status || "unknown";
    card.status.dataset.statusTone = cardState.statusTone || getStatusTone(cardState.status);
    card.status.textContent = cardState.statusText || translate(STRINGS.unknown);
    card.value.textContent = getUnavailableValue(cardState.primary);
    card.note.textContent = getUnavailableValue(cardState.note);

    while (card.facts.firstChild) {
      card.facts.removeChild(card.facts.firstChild);
    }

    (cardState.facts || []).forEach(function (fact) {
      card.facts.appendChild(createFact(fact.label, getUnavailableValue(fact.value), !!fact.unavailable));
    });

    setProgress(card, cardState.progress || null);

    if (cardState.href) {
      card.link.hidden = false;
      card.link.href = cardState.href;
      card.link.removeAttribute("tabindex");
      card.link.setAttribute("aria-hidden", "false");
    } else {
      card.link.hidden = true;
      card.link.removeAttribute("href");
      card.link.setAttribute("tabindex", "-1");
      card.link.setAttribute("aria-hidden", "true");
    }
  }

  function setBusy(busy) {
    if (!controller.root || !controller.refreshButton) {
      return;
    }

    controller.root.setAttribute("aria-busy", busy ? "true" : "false");
    controller.refreshButton.disabled = !!busy;
    controller.refreshButton.textContent = busy ? translate(STRINGS.refreshing) : translate(STRINGS.refresh);
    controller.refreshButton.setAttribute("aria-label", translate(STRINGS.refresh));
  }

  function updateTimestamp(timestamp, stale) {
    if (!controller.updatedNode) {
      return;
    }

    controller.updatedNode.classList.toggle("is-stale", !!stale);
    controller.updatedNode.textContent = translate(STRINGS.lastUpdated) + " " + formatUpdatedTime(timestamp);
  }

  function setFailureState(error) {
    var fallback = controller.state || createInitialState();
    var staleKeys = ["system", "wan", "vpn", "clients", "load", "memory", "storage", "temperature"];

    if (!controller.runtimeErrorLogged && error) {
      controller.runtimeErrorLogged = true;
      console.error("NeoVPN dashboard refresh failed", error);
    }

    fallback.stale = true;
    fallback.timestamp = Date.now();

    staleKeys.forEach(function (key) {
      if (fallback[key] && fallback[key].available) {
        fallback[key].stale = true;
        fallback[key].status = "stale";
        fallback[key].statusText = translate(STRINGS.lastKnown);
      } else if (fallback[key]) {
        fallback[key].status = "unknown";
        fallback[key].statusText = translate(STRINGS.unknown);
      }
    });

    if (fallback.interfaces) {
      fallback.interfaces.stale = true;
      fallback.interfaces.logical = (fallback.interfaces.logical || []).map(function (item) {
        return Object.assign({}, item, { stale: true });
      });
      fallback.interfaces.wireless = (fallback.interfaces.wireless || []).map(function (item) {
        return Object.assign({}, item, { stale: true });
      });
    }

    fallback.warnings = deriveWarnings(fallback);
    controller.state = fallback;
    renderState(fallback);
  }

  function clearNode(node) {
    if (!node) {
      return;
    }

    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function getFactValue(cardState, label) {
    var facts = cardState && Array.isArray(cardState.facts) ? cardState.facts : [];
    var match = facts.filter(function (fact) {
      return fact && fact.label === label;
    })[0];

    return match ? getUnavailableValue(match.value) : "—";
  }

  function createStatusText(status, label) {
    var wrapper = document.createElement("span");
    var dot = document.createElement("span");
    var text = document.createElement("span");

    wrapper.className = "neovpn-console-status";
    wrapper.dataset.statusTone = getStatusTone(status);
    dot.className = "neovpn-console-status__dot";
    text.textContent = getUnavailableValue(label);
    wrapper.appendChild(dot);
    wrapper.appendChild(text);

    return wrapper;
  }

  function createStripItem(label, state, detail, href, options) {
    var item = href ? document.createElement("a") : document.createElement("div");
    var labelNode = document.createElement("span");
    var valueNode = document.createElement("strong");
    var detailNode = document.createElement("span");
    var status = state && state.status ? state.status : "unknown";
    var settings = options || {};

    item.className = "neovpn-console-strip-item";
    item.dataset.statusTone = state && state.statusTone ? state.statusTone : getStatusTone(status);

    if (href) {
      item.href = href;
    }

    labelNode.className = "neovpn-console-strip-item__label";
    labelNode.textContent = label;
    valueNode.className = "neovpn-console-strip-item__value";
    if (settings.plainValue) {
      valueNode.textContent = getUnavailableValue(state ? state.statusText : translate(STRINGS.unknown));
    } else {
      valueNode.appendChild(createStatusText(status, state ? state.statusText : translate(STRINGS.unknown)));
    }
    detailNode.className = "neovpn-console-strip-item__detail";
    detailNode.textContent = getUnavailableValue(detail || (state && state.note));

    item.appendChild(labelNode);
    item.appendChild(valueNode);
    item.appendChild(detailNode);

    return item;
  }

  function createResourceStripItem() {
    var item = document.createElement("div");
    var labelNode = document.createElement("span");
    var metricsNode = document.createElement("div");

    item.className = "neovpn-console-strip-item neovpn-console-strip-item--resources";
    item.dataset.statusTone = "positive";
    labelNode.className = "neovpn-console-strip-item__label";
    labelNode.textContent = "System resources";
    metricsNode.className = "neovpn-console-metrics neovpn-console-metrics--compact";
    item.appendChild(labelNode);
    item.appendChild(metricsNode);
    controller.systemMetricsNode = metricsNode;

    return item;
  }

  function renderStatusStrip(state) {
    var urls = getDetailUrl();
    var uptime = getFactValue(state.system, translate(STRINGS.uptime));

    clearNode(controller.statusStripNode);

    if (!controller.statusStripNode) {
      return;
    }

    controller.statusStripNode.appendChild(createStripItem(translate(STRINGS.internet), state.wan, state.wan && state.wan.note, urls.network));
    controller.statusStripNode.appendChild(createResourceStripItem());
    controller.statusStripNode.appendChild(createStripItem(translate(STRINGS.clients), state.clients, state.clients && state.clients.primary, urls.dhcp));
    controller.statusStripNode.appendChild(createStripItem(translate(STRINGS.uptime), {
      status: state.system && state.system.available ? "online" : "unknown",
      statusText: uptime,
      statusTone: state.system && state.system.available ? "positive" : "neutral"
    }, state.system && state.system.note, null, { plainValue: true }));
  }

  function createActivityRow(label, value, tone) {
    var row = document.createElement("div");
    var key = document.createElement("span");
    var val = document.createElement("strong");

    row.className = "neovpn-console-activity__row";
    if (tone) {
      row.dataset.tone = tone;
    }

    key.textContent = label;
    val.textContent = getUnavailableValue(value);
    row.appendChild(key);
    row.appendChild(val);

    return row;
  }

  function getWanInterfaceItem(state) {
    var name = state && state.wan ? getFactValue(state.wan, translate(STRINGS.interface)) : "—";
    var items = state && state.interfaces ? (state.interfaces.logical || []).concat(state.interfaces.wireless || []) : [];

    return items.filter(function (item) {
      return item && (item.name === name || item.displayName === name);
    })[0] || null;
  }

  function renderNetworkActivity(state) {
    var wan = state.wan || {};
    var vpn = state.vpn || {};
    var wanItem = getWanInterfaceItem(state);

    clearNode(controller.networkActivityNode);

    if (!controller.networkActivityNode) {
      return;
    }

    controller.networkActivityNode.appendChild(createActivityRow(translate(STRINGS.internet), wan.statusText || translate(STRINGS.unknown), getStatusTone(wan.status)));
    controller.networkActivityNode.appendChild(createActivityRow(translate(STRINGS.interface), getFactValue(wan, translate(STRINGS.interface))));
    controller.networkActivityNode.appendChild(createActivityRow(translate(STRINGS.address), getFactValue(wan, translate(STRINGS.address)), "network"));
    controller.networkActivityNode.appendChild(createActivityRow(translate(STRINGS.protocol), getFactValue(wan, translate(STRINGS.protocol))));
    controller.networkActivityNode.appendChild(createActivityRow(translate(STRINGS.traffic), wanItem && wanItem.traffic ? wanItem.traffic : "—"));
    controller.networkActivityNode.appendChild(createActivityRow(translate(STRINGS.vpn), vpn.note || vpn.statusText || "—", getStatusTone(vpn.status)));
  }

  function getVpnHealthTone(health) {
    switch (health) {
    case "ok":
      return "positive";
    case "degraded":
    case "stopped":
      return "warning";
    case "error":
      return "critical";
    case "conflict":
      return "critical";
    default:
      return "neutral";
    }
  }

  function getVpnOverallLabel(overall) {
    var state = overall && overall.state;

    switch (state) {
    case "running":
      return translate(STRINGS.trafficRoutingActive);
    case "degraded":
      return translate(STRINGS.degraded);
    case "stopped":
      return translate(STRINGS.serviceStopped);
    case "conflict":
      return translate(STRINGS.conflictDetected);
    case "empty":
      return translate(STRINGS.notDetected);
    default:
      return translate(STRINGS.unknown);
    }
  }

  function getVpnServiceState(provider) {
    if (provider && provider.application_state) {
      return provider.application_state === "active" ? "running" : provider.application_state === "inactive" ? "stopped" : "unknown";
    }

    if (provider && provider.service_state) {
      return provider.service_state;
    }

    if (provider && provider.service && provider.service.running) {
      return "running";
    }

    if (provider && provider.service) {
      return "stopped";
    }

    return "unknown";
  }

  function getVpnTrafficState(provider) {
    if (provider && provider.traffic_state) {
      return provider.traffic_state;
    }

    if (!provider || !provider.service || !provider.service.running) {
      return "inactive";
    }

    return provider.health === "ok" ? "unknown" : "inactive";
  }

  function getVpnServiceLabel(state) {
    switch (state) {
    case "active":
      return translate(STRINGS.active);
    case "inactive":
      return translate(STRINGS.inactive);
    case "running":
      return translate(STRINGS.running);
    case "stopped":
      return translate(STRINGS.stopped);
    case "error":
      return translate(STRINGS.error);
    default:
      return translate(STRINGS.unknown);
    }
  }

  function getVpnTrafficLabel(state) {
    switch (state) {
    case "active":
      return translate(STRINGS.active);
    case "inactive":
      return translate(STRINGS.inactive);
    case "error":
      return translate(STRINGS.connectionError);
    default:
      return translate(STRINGS.unableToVerify);
    }
  }

  function getVpnApplicationState(provider) {
    if (provider && provider.application_state) {
      return provider.application_state;
    }

    return getVpnServiceState(provider) === "running" ? "active" : "inactive";
  }

  function getVpnApplicationLabel(state) {
    switch (state) {
    case "active":
      return translate(STRINGS.active);
    case "inactive":
      return translate(STRINGS.inactive);
    default:
      return translate(STRINGS.unknown);
    }
  }

  function getVpnStateTone(state) {
    switch (state) {
    case "running":
    case "active":
      return "positive";
    case "stopped":
    case "inactive":
      return "warning";
    case "error":
      return "critical";
    default:
      return "neutral";
    }
  }

  function formatVpnProtocol(provider) {
    var protocol = provider && provider.protocol ? provider.protocol : null;
    var display = protocol && protocol.display ? protocol.display : "";

    if (!display || display === "Not determined") {
      return translate(STRINGS.notDetermined);
    }

    return display;
  }

  function formatVpnErrors(provider) {
    var errors = provider && Array.isArray(provider.errors) ? provider.errors : [];
    var first = errors[0];
    var extra = errors.length - 1;
    var message = first && first.message ? first.message : "";

    if (!first) {
      return translate(STRINGS.noErrors);
    }

    switch (first.code) {
    case "routing_not_active":
      message = translate(STRINGS.errorRoutingNotActive);
      break;
    case "traffic_unverified":
      message = translate(STRINGS.errorTrafficUnverified);
      break;
    case "backend_stopped":
      message = translate(STRINGS.errorBackendStopped);
      break;
    case "service_stopped":
      message = translate(STRINGS.errorServiceStopped);
      break;
    case "config_missing":
      message = translate(STRINGS.errorConfigMissing);
      break;
    case "core_missing":
      message = translate(STRINGS.errorCoreMissing);
      break;
    }

    if (extra > 0) {
      return message + " · +" + extra;
    }

    return message;
  }

  function createVpnStatusBadge(tone, label) {
    var badge = document.createElement("span");
    var dot = document.createElement("span");
    var text = document.createElement("span");

    badge.className = "neovpn-console-vpn__badge";
    badge.dataset.vpnHealth = tone || "neutral";
    dot.className = "neovpn-console-vpn__badge-dot";
    text.textContent = label || translate(STRINGS.unknown);
    badge.appendChild(dot);
    badge.appendChild(text);

    return badge;
  }

  function createVpnStatusRow(label, state, value) {
    var item = document.createElement("div");
    var key = document.createElement("span");

    item.className = "neovpn-console-vpn__status-row";
    key.className = "neovpn-console-vpn__status-label";
    key.textContent = label;
    item.appendChild(key);
    item.appendChild(createVpnStatusBadge(getVpnStateTone(state), value));

    return item;
  }

  function createVpnValueRow(label, value) {
    var item = document.createElement("div");
    var key = document.createElement("span");
    var text = document.createElement("span");

    item.className = "neovpn-console-vpn__status-row";
    key.className = "neovpn-console-vpn__status-label";
    text.className = "neovpn-console-vpn__status-value";
    key.textContent = label;
    text.textContent = value || "—";
    item.appendChild(key);
    item.appendChild(text);

    return item;
  }

  function formatVpnMode(mode) {
    switch (String(mode || "").toLowerCase()) {
    case "selective":
      return translate(STRINGS.selectiveRouting);
    case "global":
      return translate(STRINGS.globalRouting);
    case "rules":
      return translate(STRINGS.rulesRouting);
    case "direct":
      return translate(STRINGS.directRouting);
    case "":
    case "unknown":
      return translate(STRINGS.unknownRoutingMode);
    default:
      return translate(STRINGS.unknownRoutingMode);
    }
  }

  function formatVpnConfigurationState(state) {
    switch (String(state || "").toLowerCase()) {
    case "ready":
      return translate(STRINGS.configurationReady);
    case "missing":
      return translate(STRINGS.configurationMissing);
    case "invalid":
      return translate(STRINGS.configurationInvalid);
    case "unknown":
    case "":
      return translate(STRINGS.configurationUnknown);
    default:
      return translate(STRINGS.configurationUnknown);
    }
  }

  function createVpnProviderRow(provider, lastCheckedAt) {
    var row = document.createElement("article");
    var header = document.createElement("header");
    var name = document.createElement("strong");
    var statuses = document.createElement("div");
    var footer = document.createElement("div");
    var action = document.createElement("a");
    var applicationState = getVpnApplicationState(provider);
    var trafficState = getVpnTrafficState(provider);

    row.className = "neovpn-console-vpn-provider";
    row.dataset.provider = provider && provider.id ? provider.id : "unknown";
    row.dataset.vpnServiceState = applicationState;
    row.dataset.vpnTrafficState = trafficState;

    header.className = "neovpn-console-vpn-provider__header";
    name.textContent = provider && provider.name ? provider.name : translate(STRINGS.unknown);
    header.appendChild(name);
    header.appendChild(createVpnStatusBadge(getVpnStateTone(applicationState), getVpnApplicationLabel(applicationState)));

    statuses.className = "neovpn-console-vpn__status-list";
    statuses.appendChild(createVpnValueRow(translate(STRINGS.protocol), formatVpnProtocol(provider)));
    statuses.appendChild(createVpnStatusRow(translate(STRINGS.vpnTraffic), trafficState, getVpnTrafficLabel(trafficState)));
    statuses.appendChild(createVpnValueRow(translate(STRINGS.lastChecked), formatVpnProviderLastCheck(provider, lastCheckedAt)));
    statuses.appendChild(createVpnValueRow(translate(STRINGS.errors), formatVpnErrors(provider)));

    footer.className = "neovpn-console-vpn-provider__footer";

    if (provider && provider.manage_url && provider.ui_installed) {
      action.className = "neovpn-console-vpn-provider__action";
      action.href = provider.manage_url;
      action.textContent = translate(STRINGS.openProviderPrefix) + " " + (provider.name || translate(STRINGS.vpn));
      footer.appendChild(action);
    }

    row.appendChild(header);
    row.appendChild(statuses);
    row.appendChild(footer);

    return row;
  }

  function renderVpnSection(state) {
    var shell = controller.vpnNode;
    var vpnStatus = state && state.vpnStatus ? state.vpnStatus : null;
    var overall = vpnStatus && vpnStatus.overall ? vpnStatus.overall : null;
    var providers = vpnStatus && Array.isArray(vpnStatus.providers) ? vpnStatus.providers : [];
    var summary = document.createElement("div");
    var title = document.createElement("strong");
    var detail = document.createElement("p");
    var list = document.createElement("div");

    if (!shell) {
      return;
    }

    clearNode(shell);
    shell.dataset.vpnProviderState = overall && overall.state ? overall.state : "unknown";

    summary.className = "neovpn-console-vpn__summary";
    title.className = "neovpn-console-vpn__title";
    detail.className = "neovpn-console-vpn__detail";
    list.className = "neovpn-console-vpn__providers";

    if (!vpnStatus) {
      title.textContent = translate(STRINGS.vpnIntegrationsUnavailable);
      detail.textContent = translate(STRINGS.vpnIntegrationsUnavailableDetail);
      summary.appendChild(title);
      shell.appendChild(summary);
      shell.appendChild(detail);
      return;
    }

    if (!providers.length) {
      title.textContent = translate(STRINGS.vpnApplicationsNotInstalled);
      detail.textContent = translate(STRINGS.vpnApplicationsEmptyDetail);
      summary.appendChild(title);
      shell.appendChild(summary);
      shell.appendChild(detail);
      return;
    }

    if (overall && overall.conflict) {
      var notice = document.createElement("p");
      notice.className = "neovpn-console-vpn__notice";
      notice.textContent = translate(STRINGS.multipleTrafficRoutingRunning);
      shell.appendChild(notice);
    }

    providers.forEach(function (provider) {
      list.appendChild(createVpnProviderRow(provider, state && state.vpnLastCheckedAt));
    });
    shell.appendChild(list);
  }

  function createMetricRow(label, value, detail, percent) {
    var gauge = document.createElement("div");
    var valueNode = document.createElement("strong");
    var labelNode = document.createElement("span");
    var detailNode = document.createElement("span");
    var normalized = percent == null ? null : clampNumber(Math.round(percent), 0, 100);
    var tone = normalized == null ? "neutral" : (normalized >= 90 ? "critical" : (normalized >= 75 ? "warning" : "normal"));

    gauge.className = "neovpn-console-metric";
    gauge.dataset.usageTone = tone;
    valueNode.className = "neovpn-console-metric__value";
    valueNode.textContent = getUnavailableValue(value);
    labelNode.className = "neovpn-console-metric__label";
    labelNode.textContent = label;
    detailNode.className = "neovpn-console-metric__detail";
    detailNode.textContent = detail ? getUnavailableValue(detail) : "";

    gauge.appendChild(labelNode);
    gauge.appendChild(valueNode);
    gauge.appendChild(detailNode);

    return gauge;
  }

  function renderSystemMetrics(state) {
    var resources = state.resources || {};
    var load = resources.load || {};
    var memory = resources.memory || {};
    var storage = resources.storage || {};

    clearNode(controller.systemMetricsNode);

    if (!controller.systemMetricsNode) {
      return;
    }

    controller.systemMetricsNode.appendChild(createMetricRow(
      translate(STRINGS.load),
      formatLoadValue(load.one),
      "",
      load.cores ? normalizePercent(load.one, load.cores) : null
    ));
    controller.systemMetricsNode.appendChild(createMetricRow(
      translate(STRINGS.memory),
      formatPercent(memory.percent, 0),
      formatResourcePair(memory.used, memory.total),
      memory.percent
    ));
    controller.systemMetricsNode.appendChild(createMetricRow(
      translate(STRINGS.storage),
      formatPercent(storage.percent, 0),
      formatResourcePair(storage.used, storage.total),
      storage.percent
    ));

    if (state.temperature && state.temperature.render !== false && state.temperature.primary && state.temperature.primary !== "—") {
      controller.systemMetricsNode.appendChild(createMetricRow(
        translate(STRINGS.temperature),
        state.temperature.primary,
        state.temperature.note,
        null
      ));
    }
  }

  function splitTraffic(traffic) {
    var text = getUnavailableValue(traffic);
    var rx = /RX\s+([^·]+)/.exec(text);
    var tx = /TX\s+(.+)$/.exec(text);

    return {
      rx: rx ? rx[1].trim() : "—",
      tx: tx ? tx[1].trim() : "—"
    };
  }

  function createInterfaceCell(text, className) {
    var cell = document.createElement("td");

    if (className) {
      cell.className = className;
    }

    cell.textContent = getUnavailableValue(text);
    return cell;
  }

  function createInterfaceIdentityCell(item) {
    var cell = document.createElement("td");
    var name = document.createElement("strong");
    var detail = document.createElement("span");
    var technicalName = item.role === "wireless"
      ? joinCompactInterfaceMeta(["SSID", item.radio, (item.networkNames || []).join(", ") || null])
      : [item.name, item.device].filter(function (entry, index, list) {
        return !!entry && list.indexOf(entry) === index;
      }).join(" · ");

    cell.className = "neovpn-console-table__identity";
    name.textContent = item.displayName || item.ssid || item.name;
    detail.textContent = technicalName || item.role || "—";
    cell.appendChild(name);
    cell.appendChild(detail);

    return cell;
  }

  function createInterfaceStatusCell(item) {
    var cell = document.createElement("td");

    cell.className = "neovpn-console-table__state";
    cell.appendChild(createStatusText(item.status && item.status.key, item.stale ? translate(STRINGS.lastKnown) : (item.status && item.status.text)));

    return cell;
  }

  function renderState(state) {
    if (!controller.root || controller.destroyed) {
      return;
    }

    updateTimestamp(state.timestamp, !!state.stale);
    renderStatusStrip(state);
    renderNetworkActivity(state);
    renderSystemMetrics(state);
    renderVpnSection(state);
    renderWarnings(state);
    renderInterfaceSection(state);
  }

  function buildSystemCard(data) {
    var urls = getDetailUrl();
    var board = data.board;
    var info = data.info;
    var available = !!(board && info);
    var status = "unknown";
    var statusText = translate(STRINGS.unknown);
    var note = translate(STRINGS.loading);

    if (available) {
      status = "online";
      statusText = translate(STRINGS.online);
      note = board.model ? board.model : translate(STRINGS.router);
    }

    return createCardState({
      available: available,
      status: status,
      statusText: statusText,
      primary: available ? (board.hostname || translate(STRINGS.router)) : "—",
      note: note,
      facts: [
        { label: translate(STRINGS.uptime), value: info && info.uptime ? formatCompactDuration(info.uptime) : "—", unavailable: !available },
        { label: translate(STRINGS.localTime), value: info && info.localtime ? formatLocalTime(info.localtime) : "—", unavailable: !available },
        {
          label: translate(STRINGS.firmware),
          value: board && board.release && board.release.description ? board.release.description : (info && Array.isArray(info.load) ? formatLoad(info.load) : "—"),
          unavailable: !(board && board.release && board.release.description) && !(info && Array.isArray(info.load))
        }
      ],
      href: urls.system
    });
  }

  function scoreUpstreamCandidate(networkObj, activeSet) {
    var score = 0;
    var proto = String(networkObj.getProtocol() || "");
    var name = String(networkObj.getName() || "");

    if (activeSet[name]) {
      score += 5;
    }

    if (UPLINK_PROTOCOLS[proto]) {
      score += 2;
    }

    if (/^wan6?$/.test(name)) {
      score += 1;
    }

    if (networkObj.getGatewayAddr()) {
      score += 3;
    }

    if (networkObj.getGateway6Addr()) {
      score += 2;
    }

    return score;
  }

  function buildWanCard(data) {
    var urls = getDetailUrl();
    var available = !!data.available;
    var candidate = data.candidate;
    var status = "unknown";
    var statusText = translate(STRINGS.unknown);
    var primary = "—";
    var note = translate(STRINGS.loading);

    if (available && !candidate) {
      status = "no-upstream-detected";
      statusText = translate(STRINGS.noUpstreamDetected);
      primary = translate(STRINGS.noUpstreamDetected);
      note = "—";
    } else if (available && candidate) {
      var isConnected = !!data.connected;
      status = isConnected ? "connected" : "disconnected";
      statusText = isConnected ? translate(STRINGS.connected) : translate(STRINGS.disconnected);
      primary = statusText;
      note = candidate.getName() || "—";
    }

    return createCardState({
      available: available,
      status: status,
      statusTone: getStatusTone(status),
      statusText: statusText,
      primary: primary,
      note: candidate ? [candidate.getName() || null, candidate.getProtocol ? candidate.getProtocol() : null].filter(Boolean).join(" · ") || note : note,
      facts: [
        { label: translate(STRINGS.interface), value: candidate ? candidate.getName() : "—", unavailable: !candidate },
        { label: translate(STRINGS.address), value: candidate ? choosePrimaryAddress(candidate.getIPAddrs(), candidate.getIP6Addrs()) : "—", unavailable: !candidate },
        { label: translate(STRINGS.protocol), value: candidate ? getUnavailableValue(candidate.getProtocol()) : "—", unavailable: !candidate }
      ],
      href: urls.network
    });
  }

  function isVpnCandidate(networkObj) {
    var proto = String(networkObj.getProtocol() || "");
    var device = null;
    var type = null;

    try {
      device = networkObj.getL3Device() || networkObj.getDevice();
      type = device ? device.getType() : null;
    } catch (error) {}

    if (type === "wireguard" || type === "tunnel") {
      return true;
    }

    if (proto && !STANDARD_PROTOCOLS[proto] && (proto === "wireguard" || proto === "openvpn")) {
      return true;
    }

    return false;
  }

  function getVpnType(networkObj) {
    var proto = String(networkObj.getProtocol() || "");
    var device = null;
    var type = null;

    try {
      device = networkObj.getL3Device() || networkObj.getDevice();
      type = device ? device.getType() : null;
    } catch (error) {}

    if (type === "wireguard" || proto === "wireguard") {
      return "WireGuard";
    }

    if (proto === "openvpn") {
      return "OpenVPN";
    }

    if (type === "tunnel") {
      return "Tunnel";
    }

    return getUnavailableValue(proto);
  }

  function buildVpnCard(data) {
    var urls = getDetailUrl();
    var detected = data.detected;
    var active = data.active;
    var selected = data.selected;
    var status = "unknown";
    var statusText = translate(STRINGS.unknown);
    var primary = "—";
    var note = translate(STRINGS.loading);

    if (data.available && !detected) {
      status = "not-detected";
      statusText = translate(STRINGS.notDetected);
      primary = translate(STRINGS.notDetected);
      note = translate(STRINGS.noActiveTunnel);
    } else if (data.available && detected) {
      status = active ? "active" : "inactive";
      statusText = active ? translate(STRINGS.active) : translate(STRINGS.inactive);
      primary = statusText;
      note = selected ? selected.getName() : translate(STRINGS.noActiveTunnel);
    }

    return createCardState({
      available: data.available,
      status: status,
      statusTone: detected && !active ? "warning" : getStatusTone(status),
      statusText: statusText,
      primary: primary,
      note: note,
      facts: [
        { label: translate(STRINGS.protocol), value: selected ? getVpnType(selected) : "—", unavailable: !selected },
        { label: translate(STRINGS.interface), value: selected ? selected.getName() : "—", unavailable: !selected },
        { label: translate(STRINGS.address), value: selected ? choosePrimaryAddress(selected.getIPAddrs(), selected.getIP6Addrs()) : "—", unavailable: !selected }
      ],
      href: urls.network
    });
  }

  function buildVpnCardFromStatus(vpnStatus) {
    var overall = vpnStatus && vpnStatus.overall ? vpnStatus.overall : null;
    var providers = vpnStatus && Array.isArray(vpnStatus.providers) ? vpnStatus.providers : [];
    var firstProvider = providers[0] || null;
    var trafficState = firstProvider ? getVpnTrafficState(firstProvider) : (overall && overall.state === "empty" ? "inactive" : "unknown");
    var status = trafficState;
    var statusTone = getVpnStateTone(trafficState);
    var statusText = getVpnTrafficLabel(trafficState);
    var note = translate(STRINGS.vpnIntegrationsUnavailableDetail);
    var facts = [];

    if (overall && overall.state === "empty") {
      note = translate(STRINGS.vpnApplicationsEmptyDetail);
    } else if (firstProvider) {
      note = firstProvider.name;
      facts = [
        { label: translate(STRINGS.service), value: getVpnServiceLabel(getVpnServiceState(firstProvider)) },
        { label: translate(STRINGS.vpnTraffic), value: getVpnTrafficLabel(trafficState) }
      ];
    }

    return createCardState({
      available: !!vpnStatus,
      status: status,
      statusTone: statusTone,
      statusText: statusText,
      primary: statusText,
      note: note,
      facts: facts,
      href: firstProvider && firstProvider.manage_url ? firstProvider.manage_url : null
    });
  }

  function buildClientsCard(data) {
    var urls = getDetailUrl();
    var dhcp4 = data.dhcp4;
    var dhcp6 = data.dhcp6;
    var total = (dhcp4 || 0) + (dhcp6 || 0);
    var primary = translate(STRINGS.loading);
    var note = translate(STRINGS.loading);

    if (data.available) {
      primary = total > 0 ? pluralizeDhcpLeases(total) : translate(STRINGS.noActiveLeases);
      note = total > 0 ? translate(STRINGS.dhcpLeasesCapitalized) : "—";
    }

    return createCardState({
      available: data.available,
      status: data.available ? "online" : "unknown",
      statusTone: data.available ? "positive" : "neutral",
      statusText: data.available ? translate(STRINGS.online) : translate(STRINGS.unknown),
      primary: primary,
      note: note,
      facts: [
        { label: translate(STRINGS.dhcpv4), value: data.available ? String(dhcp4) : "—", unavailable: !data.available },
        { label: translate(STRINGS.dhcpv6), value: data.available ? String(dhcp6) : "—", unavailable: !data.available },
        { label: translate(STRINGS.wifi), value: data.wifiAvailable ? String(data.wifi) : translate(STRINGS.unavailable), unavailable: !data.wifiAvailable }
      ],
      href: urls.dhcp
    });
  }

  function getCpuCount(board, info) {
    var candidates = [
      info && info.cpus,
      info && info.cpu_count,
      board && board.cpus,
      board && board.cpu_count
    ];
    var index;
    var numeric;

    for (index = 0; index < candidates.length; index += 1) {
      numeric = parseInt(candidates[index], 10);

      if (isFinite(numeric) && numeric > 0) {
        return numeric;
      }
    }

    return null;
  }

  function normalizeLoadResource(info, board) {
    var load = Array.isArray(info && info.load) ? info.load : [];

    return {
      available: load.length > 0,
      one: normalizeLoadValue(load[0]),
      five: normalizeLoadValue(load[1]),
      fifteen: normalizeLoadValue(load[2]),
      cores: getCpuCount(board, info)
    };
  }

  function normalizeMemoryResource(info) {
    var memory = info && info.memory ? info.memory : {};
    var total = safePositiveNumber(memory.total);
    var free = safePositiveNumber(memory.free);
    var availableBytes = safePositiveNumber(memory.available);
    var buffered = safePositiveNumber(memory.buffered);
    var cached = safePositiveNumber(memory.cached);
    var used = null;
    var percent = null;

    if (total != null && free != null && total >= free) {
      used = total - free;
      percent = normalizePercent(used, total);
    }

    if (availableBytes == null && free != null && buffered != null) {
      availableBytes = free + buffered;
    }

    return {
      available: total != null && used != null && percent != null,
      total: total,
      used: used,
      free: free,
      availableBytes: availableBytes,
      cached: cached,
      percent: percent
    };
  }

  function normalizeStorageResource(info, board) {
    var root = info && info.root ? info.root : {};
    var totalBlocks = safePositiveNumber(root.total);
    var usedBlocks = safePositiveNumber(root.used);
    var freeBlocks = safePositiveNumber(root.avail != null ? root.avail : root.free);
    var label = board && board.rootfs_type === "overlayfs" ? translate(STRINGS.overlay) : translate(STRINGS.root);
    var total = null;
    var used = null;
    var free = null;
    var percent = null;

    if (totalBlocks != null && usedBlocks != null) {
      total = totalBlocks * 1024;
      used = usedBlocks * 1024;
    }

    if (freeBlocks != null) {
      free = freeBlocks * 1024;
    }

    percent = normalizePercent(used, total);

    return {
      available: total != null && used != null && percent != null,
      label: label,
      total: total,
      used: used,
      free: free,
      percent: percent
    };
  }

  function getTemperatureFromValue(rawValue, sensor, statusKnown) {
    var value = safeNumber(rawValue);

    if (value == null) {
      return null;
    }

    if (Math.abs(value) > 1000) {
      value = value / 1000;
    }

    if (value < -20 || value > 150) {
      return null;
    }

    return {
      available: true,
      supported: true,
      value: value,
      unit: "C",
      sensor: sensor || null,
      statusKnown: !!statusKnown
    };
  }

  function normalizeTemperatureResource(info, board) {
    var candidates = [
      { value: info && info.temperature, sensor: "system.info.temperature", statusKnown: false },
      { value: board && board.temperature, sensor: "system.board.temperature", statusKnown: false },
      { value: info && info.thermal && info.thermal.temperature, sensor: "system.info.thermal", statusKnown: false }
    ];
    var index;
    var normalized;

    for (index = 0; index < candidates.length; index += 1) {
      normalized = getTemperatureFromValue(candidates[index].value, candidates[index].sensor, candidates[index].statusKnown);

      if (normalized) {
        return normalized;
      }
    }

    return {
      available: false,
      supported: false,
      value: null,
      unit: "C",
      sensor: null,
      statusKnown: false
    };
  }

  function buildLoadCard(resource) {
    var urls = getDetailUrl();
    var status = RESOURCE_STATUS.unknown;
    var statusText = getResourceStatusText(RESOURCE_STATUS.unknown);
    var facts = [
      { label: translate(STRINGS.fiveMinutes), value: "—", unavailable: true },
      { label: translate(STRINGS.fifteenMinutes), value: "—", unavailable: true }
    ];

    if (resource.available) {
      status = resource.cores ? (resource.one >= resource.cores ? RESOURCE_STATUS.elevated : RESOURCE_STATUS.normal) : RESOURCE_STATUS.informational;
      statusText = getResourceStatusText(status);
      facts = [
        { label: translate(STRINGS.fiveMinutes), value: formatLoadValue(resource.five), unavailable: resource.five == null },
        { label: translate(STRINGS.fifteenMinutes), value: formatLoadValue(resource.fifteen), unavailable: resource.fifteen == null }
      ];

      if (resource.cores) {
        facts.push({ label: "Cores", value: String(resource.cores), unavailable: false });
      }
    }

    return createCardState({
      available: resource.available,
      status: status,
      statusText: statusText,
      statusTone: getStatusTone(status),
      primary: formatLoadValue(resource.one),
      note: translate(STRINGS.loadAverage),
      facts: facts,
      href: urls.realtimeLoad
    });
  }

  function buildMemoryCard(resource) {
    var urls = getDetailUrl();
    var status = getUsageStatus(resource.percent);
    var available = !!resource.available;

    return createCardState({
      available: available,
      status: available ? status : RESOURCE_STATUS.unknown,
      statusTone: available ? getStatusTone(status) : "neutral",
      statusText: available ? getResourceStatusText(status) : translate(STRINGS.unknown),
      primary: formatPercent(resource.percent, 0),
      note: formatResourcePair(resource.used, resource.total),
      facts: [
        { label: translate(STRINGS.used), value: formatResourcePair(resource.used, resource.total), unavailable: !available },
        { label: translate(STRINGS.available), value: formatBytes(resource.availableBytes), unavailable: resource.availableBytes == null }
      ],
      href: urls.overview,
      progress: available ? {
        percent: resource.percent,
        label: translate(STRINGS.memoryUsed)
      } : null
    });
  }

  function buildStorageCard(resource) {
    var urls = getDetailUrl();
    var status = getUsageStatus(resource.percent);
    var available = !!resource.available;

    return createCardState({
      available: available,
      status: available ? status : RESOURCE_STATUS.unknown,
      statusTone: available ? getStatusTone(status) : "neutral",
      statusText: available ? getResourceStatusText(status) : translate(STRINGS.unknown),
      primary: formatPercent(resource.percent, 0),
      note: resource.label || translate(STRINGS.root),
      facts: [
        { label: translate(STRINGS.used), value: formatResourcePair(resource.used, resource.total), unavailable: !available },
        { label: translate(STRINGS.free), value: formatBytes(resource.free), unavailable: resource.free == null }
      ],
      href: urls.overview,
      progress: available ? {
        percent: resource.percent,
        label: translate(STRINGS.storageUsed)
      } : null
    });
  }

  function buildTemperatureCard(resource) {
    var status = getTemperatureStatus(resource.value, resource.statusKnown);

    if (!resource.supported) {
      return createCardState({ render: false, available: false });
    }

    return createCardState({
      available: resource.available,
      render: true,
      status: status,
      statusTone: getStatusTone(status),
      statusText: getResourceStatusText(status),
      primary: formatTemperature(resource.value, resource.unit),
      note: resource.sensor ? resource.sensor : "—",
      facts: resource.sensor ? [
        { label: translate(STRINGS.sensor), value: resource.sensor, unavailable: false }
      ] : [],
      href: null
    });
  }

  function getAddressPriority(address) {
    if (!address) {
      return -1;
    }

    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(address)) {
      return 3;
    }

    if (/^fd/i.test(address) || /^fc/i.test(address)) {
      return 2;
    }

    if (/^[0-9]/.test(address)) {
      return 4;
    }

    if (/^fe80:/i.test(address)) {
      return 0;
    }

    if (/:/.test(address)) {
      return 1;
    }

    return 0;
  }

  function choosePrimaryAddress(ipv4, ipv6) {
    var best = null;

    (ipv4 || []).concat(ipv6 || []).forEach(function (address) {
      var clean = String(address || "");
      var bare = clean.split("/")[0];
      var rank = getAddressPriority(bare);

      if (bare === "0.0.0.0") {
        return;
      }

      if (best == null || rank > best.rank) {
        best = {
          address: clean,
          rank: rank
        };
      }
    });

    return best ? best.address : translate(STRINGS.noAddress);
  }

  function inferLogicalRole(normalized) {
    var name = normalized.name.toLowerCase();

    if (normalized.tunnel) {
      return "tunnel";
    }

    if (normalized.cellular) {
      return "cellular";
    }

    if (normalized.protocol === "dhcpv6" || name === "wan6") {
      return "ipv6-upstream";
    }

    if (normalized.upstream || name === "wan" || /^(dhcp|pppoe|qmi|ncm|modemmanager|3g)$/.test(normalized.protocol)) {
      return "internet";
    }

    if (normalized.bridge || normalized.protocol === "static" || /^(lan|home|internal)$/.test(name)) {
      return "lan";
    }

    if (/guest|iot/.test(name)) {
      return "guest";
    }

    return "network";
  }

  function getLogicalRoleLabel(role) {
    switch (role) {
    case "lan":
      return translate(STRINGS.lanRole);
    case "internet":
      return translate(STRINGS.internetRole);
    case "ipv6-upstream":
      return translate(STRINGS.ipv6UpstreamRole);
    case "guest":
      return translate(STRINGS.guest);
    case "cellular":
      return translate(STRINGS.cellular);
    case "tunnel":
      return translate(STRINGS.tunnelRole);
    default:
      return translate(STRINGS.networkRole);
    }
  }

  function getLogicalRoleWeight(role) {
    switch (role) {
    case "lan":
      return 1;
    case "internet":
      return 2;
    case "ipv6-upstream":
      return 3;
    case "guest":
      return 4;
    case "wireless":
      return 5;
    case "cellular":
      return 6;
    case "tunnel":
      return 7;
    default:
      return 8;
    }
  }

  function getInterfaceStatus(protocolObj, disabled, wireless) {
    var errors = protocolObj && typeof protocolObj.getErrors === "function" ? protocolObj.getErrors() : null;

    if (disabled) {
      return { key: "inactive", text: translate(STRINGS.disabled) };
    }

    if (errors && errors.length) {
      return { key: "critical", text: translate(STRINGS.error) };
    }

    if (protocolObj && typeof protocolObj.isPending === "function" && protocolObj.isPending()) {
      return { key: "warning", text: translate(STRINGS.pending) };
    }

    if (protocolObj && typeof protocolObj.isUp === "function" && protocolObj.isUp()) {
      return { key: wireless ? "active" : "online", text: translate(STRINGS.up) };
    }

    if (protocolObj && protocolObj.available !== false) {
      return { key: "disconnected", text: translate(STRINGS.down) };
    }

    return { key: "unknown", text: translate(STRINGS.unknown) };
  }

  function getProtocolDescription(protocolObj) {
    if (!protocolObj) {
      return "—";
    }

    if (typeof protocolObj.getI18n === "function") {
      return getUnavailableValue(protocolObj.getI18n());
    }

    return getUnavailableValue(protocolObj.getProtocol && protocolObj.getProtocol());
  }

  function getDeviceTraffic(device) {
    if (!device || typeof device.getRXBytes !== "function" || typeof device.getTXBytes !== "function") {
      return null;
    }

    return {
      rxBytes: safePositiveNumber(device.getRXBytes()),
      txBytes: safePositiveNumber(device.getTXBytes())
    };
  }

  function formatTraffic(traffic) {
    if (!traffic || (traffic.rxBytes == null && traffic.txBytes == null)) {
      return "—";
    }

    return "RX " + formatBytes(traffic.rxBytes) + " · TX " + formatBytes(traffic.txBytes);
  }

  function shouldIncludeLogicalInterface(protocolObj) {
    var name = String(protocolObj.getName() || "");
    var proto = String(protocolObj.getProtocol() || "");
    var device = null;
    var hasAddresses = false;

    if (name === "loopback") {
      return false;
    }

    if (typeof protocolObj.isAlias === "function" && protocolObj.isAlias()) {
      return false;
    }

    if (typeof protocolObj.getIPAddrs === "function" && protocolObj.getIPAddrs().length) {
      hasAddresses = true;
    }

    if (!hasAddresses && typeof protocolObj.getIP6Addrs === "function" && protocolObj.getIP6Addrs().length) {
      hasAddresses = true;
    }

    try {
      device = protocolObj.getL3Device() || protocolObj.getDevice();
    } catch (error) {}

    if (proto === "none" && typeof protocolObj.isEmpty === "function" && protocolObj.isEmpty() && !hasAddresses && !device) {
      return false;
    }

    return true;
  }

  function normalizeLogicalInterface(protocolObj, dynamicState) {
    var name = String(protocolObj.getName() || "");
    var device = null;
    var l3Device = null;
    var ipv4 = protocolObj.getIPAddrs ? protocolObj.getIPAddrs() : [];
    var ipv6 = protocolObj.getIP6Addrs ? protocolObj.getIP6Addrs() : [];
    var protocol = String(protocolObj.getProtocol() || "");
    var upstream = false;
    var tunnel = false;
    var traffic = null;
    var logical = null;

    try {
      l3Device = protocolObj.getL3Device ? protocolObj.getL3Device() : null;
      device = l3Device || (protocolObj.getDevice ? protocolObj.getDevice() : null);
    } catch (error) {}

    upstream = !!(dynamicState.activeWanSet[name] || protocolObj.getGatewayAddr && protocolObj.getGatewayAddr() || protocolObj.getGateway6Addr && protocolObj.getGateway6Addr());
    tunnel = isVpnCandidate(protocolObj) || (device && (device.getType() === "tunnel" || device.getType() === "wireguard"));
    traffic = getDeviceTraffic(device);

    logical = {
      key: "logical:" + name,
      name: name,
      displayName: getLogicalRoleLabel("network"),
      role: "network",
      protocol: protocol,
      protocolLabel: getProtocolDescription(protocolObj),
      configured: true,
      up: !!(protocolObj.isUp && protocolObj.isUp()),
      pending: !!(protocolObj.isPending && protocolObj.isPending()),
      available: true,
      uptime: protocolObj.getUptime ? safePositiveNumber(protocolObj.getUptime()) : null,
      device: device && device.getName ? device.getName() : null,
      bridge: !!(device && device.isBridge && device.isBridge()),
      ipv4: ipv4.slice(),
      ipv6: ipv6.slice(),
      gateway4: protocolObj.getGatewayAddr ? protocolObj.getGatewayAddr() : null,
      gateway6: protocolObj.getGateway6Addr ? protocolObj.getGateway6Addr() : null,
      upstream: upstream,
      rxBytes: traffic ? traffic.rxBytes : null,
      txBytes: traffic ? traffic.txBytes : null,
      wireless: !!(device && device.getType && device.getType() === "wifi"),
      tunnel: tunnel,
      cellular: /^(qmi|ncm|modemmanager|3g)$/.test(protocol),
      stale: false,
      status: getInterfaceStatus(protocolObj, false, false)
    };

    logical.role = inferLogicalRole(Object.assign({}, logical, { upstream: upstream }));
    logical.displayName = getLogicalRoleLabel(logical.role);
    logical.primaryAddress = choosePrimaryAddress(logical.ipv4, logical.ipv6);
    logical.traffic = formatTraffic(traffic);
    logical.href = getDetailUrl().network;

    return logical;
  }

  function parseFrequencyToBand(frequency) {
    var value = safeNumber(frequency);

    if (value == null) {
      return null;
    }

    if (value >= 5925 && value <= 7125) {
      return "6 GHz";
    }

    if (value >= 4900 && value <= 5900) {
      return "5 GHz";
    }

    if (value >= 2400 && value <= 2500) {
      return "2.4 GHz";
    }

    if (value >= 5.925 && value <= 7.125) {
      return "6 GHz";
    }

    if (value >= 4.9 && value <= 5.9) {
      return "5 GHz";
    }

    if (value >= 2.4 && value <= 2.5) {
      return "2.4 GHz";
    }

    return null;
  }

  function normalizeWirelessInterface(wifiNet, assocMap) {
    var mode = wifiNet.getMode ? wifiNet.getMode() : null;
    var activeMode = wifiNet.getActiveModeI18n ? wifiNet.getActiveModeI18n() : null;
    var ssid = wifiNet.getActiveSSID ? wifiNet.getActiveSSID() : null;
    var frequency = wifiNet.getFrequency ? wifiNet.getFrequency() : null;
    var band = parseFrequencyToBand(frequency);
    var networks = wifiNet.getNetworkNames ? wifiNet.getNetworkNames() : [];
    var status = getInterfaceStatus(wifiNet, wifiNet.isDisabled && wifiNet.isDisabled(), true);
    var clients = assocMap[wifiNet.getID ? wifiNet.getID() : wifiNet.getName()] ;

    return {
      key: "wifi:" + (wifiNet.getID ? wifiNet.getID() : wifiNet.getName()),
      name: wifiNet.getName ? wifiNet.getName() : "",
      ssid: ssid || (wifiNet.getSSID ? wifiNet.getSSID() : null) || wifiNet.getName(),
      radio: wifiNet.getWifiDeviceName ? wifiNet.getWifiDeviceName() : null,
      role: "wireless",
      mode: mode,
      modeLabel: activeMode || translate(STRINGS.wirelessNetwork),
      band: band,
      channel: wifiNet.getChannel ? wifiNet.getChannel() : null,
      frequency: frequency,
      up: !!(wifiNet.isUp && wifiNet.isUp()),
      disabled: !!(wifiNet.isDisabled && wifiNet.isDisabled()),
      signal: mode === "sta" && wifiNet.getSignal ? safeNumber(wifiNet.getSignal()) : null,
      bitrate: wifiNet.getBitRate ? safeNumber(wifiNet.getBitRate()) : null,
      associations: Array.isArray(clients) ? clients.length : null,
      encryption: wifiNet.getActiveEncryption ? wifiNet.getActiveEncryption() : null,
      networkNames: networks.slice(),
      primaryAddress: "—",
      stale: false,
      status: status,
      href: getDetailUrl().wireless
    };
  }

  function compareInterfaces(a, b) {
    var weightDelta = getLogicalRoleWeight(a.role) - getLogicalRoleWeight(b.role);

    if (weightDelta !== 0) {
      return weightDelta;
    }

    return String(a.displayName || a.ssid || a.name).localeCompare(String(b.displayName || b.ssid || b.name));
  }

  function normalizeInterfaceState(networkData) {
    var allNetworks = networkData.allNetworks || [];
    var wifiNetworks = networkData.wifiNetworks || [];
    var logical = [];
    var wireless = [];

    allNetworks.forEach(function (protocolObj) {
      if (!shouldIncludeLogicalInterface(protocolObj)) {
        return;
      }

      logical.push(normalizeLogicalInterface(protocolObj, networkData));
    });

    wifiNetworks.forEach(function (wifiNet) {
      wireless.push(normalizeWirelessInterface(wifiNet, networkData.assocMap || {}));
    });

    logical.sort(compareInterfaces);
    wireless.sort(compareInterfaces);

    return {
      available: logical.length > 0 || wireless.length > 0,
      stale: false,
      logical: logical,
      wireless: wireless
    };
  }

  function createInterfaceFact(label, value) {
    var row = document.createElement("div");
    var term = document.createElement("dt");
    var detail = document.createElement("dd");

    row.className = "neovpn-interface-card__fact";
    term.textContent = label;
    detail.textContent = getUnavailableValue(value);
    row.appendChild(term);
    row.appendChild(detail);

    return row;
  }

  function joinCompactInterfaceMeta(parts) {
    return parts.filter(function (part) {
      return !!part && part !== "—";
    }).join(" · ") || "—";
  }

  function getInterfaceGroupTitle(key) {
    switch (key) {
    case "local":
      return translate(STRINGS.localNetworks);
    case "internet":
      return translate(STRINGS.internetGroup);
    case "vpn":
      return translate(STRINGS.vpnGroup);
    case "wifi":
      return translate(STRINGS.wifiGroup);
    default:
      return translate(STRINGS.otherGroup);
    }
  }

  function getInterfaceGroupKey(item) {
    if (!item) {
      return "other";
    }

    if (item.role === "wireless") {
      return "wifi";
    }

    if (item.tunnel || item.role === "tunnel") {
      return "vpn";
    }

    if (item.upstream || item.role === "internet" || item.role === "ipv6-upstream" || item.role === "cellular") {
      return "internet";
    }

    if (item.role === "lan" || item.role === "guest" || item.role === "network") {
      return "local";
    }

    return "other";
  }

  function createInterfaceGroup(key, items) {
    var section = document.createElement("section");
    var header = document.createElement("header");
    var title = document.createElement("h3");
    var count = document.createElement("span");
    var grid = document.createElement("div");

    section.className = "neovpn-interface-group";
    section.dataset.interfaceGroup = key;
    header.className = "neovpn-interface-group__header";
    title.className = "neovpn-interface-group__title";
    title.textContent = getInterfaceGroupTitle(key);
    count.className = "neovpn-interface-group__count";
    count.textContent = String(items.length);
    grid.className = "neovpn-interface-group__grid";

    header.appendChild(title);
    header.appendChild(count);
    section.appendChild(header);
    section.appendChild(grid);

    items.forEach(function (item) {
      grid.appendChild(createInterfaceCard(item));
    });

    return section;
  }

  function groupInterfaceItems(items) {
    var buckets = {
      local: [],
      internet: [],
      vpn: [],
      wifi: [],
      other: []
    };

    items.forEach(function (item) {
      buckets[getInterfaceGroupKey(item)].push(item);
    });

    return ["local", "internet", "vpn", "wifi", "other"].filter(function (key) {
      return buckets[key].length > 0;
    }).map(function (key) {
      return {
        key: key,
        items: buckets[key]
      };
    });
  }

  function createInterfaceCard(item) {
    var card = document.createElement("article");
    var header = document.createElement("header");
    var identity = document.createElement("div");
    var title = document.createElement("h3");
    var name = document.createElement("div");
    var status = document.createElement("span");
    var address = document.createElement("div");
    var meta = document.createElement("div");
    var primaryValue = null;
    var technicalName = "";
    var metaValue = "—";

    card.className = "neovpn-interface-card";
    card.dataset.interfaceKey = item.key;
    card.dataset.interfaceRole = item.role;

    if (item.role === "wireless") {
      card.classList.add("neovpn-interface-card--wireless");
    }

    if (item.stale) {
      card.classList.add("neovpn-interface-card--stale");
    }

    header.className = "neovpn-interface-card__header";
    identity.className = "neovpn-interface-card__identity";
    title.textContent = item.displayName || item.ssid || item.name;
    name.className = "neovpn-interface-card__name";
    technicalName = item.role === "wireless"
      ? joinCompactInterfaceMeta([
        "SSID",
        item.radio,
        (item.networkNames || []).join(", ") || null
      ])
      : [item.name, item.device].filter(function (entry, index, list) {
        return !!entry && list.indexOf(entry) === index;
      }).join(" · ");
    card.title = technicalName || String(title.textContent || "");
    status.className = "neovpn-status";
    status.dataset.status = item.status.key;
    status.dataset.statusTone = item.status.tone || getStatusTone(item.status.key);
    status.textContent = item.stale ? translate(STRINGS.lastKnown) : item.status.text;
    address.className = "neovpn-interface-card__address";
    primaryValue = item.primaryAddress || translate(STRINGS.noAddress);
    meta.className = "neovpn-interface-card__meta";

    if (item.role === "wireless") {
      if (item.disabled) {
        primaryValue = translate(STRINGS.disabled);
      } else if (item.associations != null) {
        primaryValue = item.associations + " " + translate(item.associations === 1 ? STRINGS.client : STRINGS.clients);
      } else if (item.channel) {
        primaryValue = translate(STRINGS.channel) + " " + item.channel;
      }

      metaValue = joinCompactInterfaceMeta([
        item.encryption,
        item.band,
        item.mode === "sta" && item.signal != null ? String(item.signal) + " dBm" : null,
        item.mode !== "sta" && item.bitrate != null ? formatBitRate(item.bitrate) : null
      ]);
    } else {
      if (item.tunnel && !technicalName) {
        technicalName = joinCompactInterfaceMeta([item.name, translate(STRINGS.tunnelRole).toLowerCase()]);
      }

      metaValue = joinCompactInterfaceMeta([
        item.protocolLabel || item.protocol || null,
        item.traffic && item.traffic !== "—" ? item.traffic : null
      ]);
    }

    name.textContent = technicalName || (item.role === "wireless" ? translate(STRINGS.wirelessNetwork) : item.name);
    address.textContent = primaryValue;
    meta.textContent = metaValue;

    identity.appendChild(title);
    identity.appendChild(name);
    header.appendChild(identity);
    header.appendChild(status);
    card.appendChild(header);
    card.appendChild(address);
    card.appendChild(meta);

    return card;
  }

  function createWarning(summary) {
    var item = document.createElement("div");
    var strong = document.createElement("strong");
    var detail = document.createElement("span");

    item.className = "neovpn-console-notice";
    item.dataset.severity = summary.severity;
    item.setAttribute("role", "listitem");
    strong.className = "neovpn-console-notice__title";
    strong.textContent = summary.title;
    detail.className = "neovpn-console-notice__detail";
    detail.textContent = summary.detail;
    item.appendChild(strong);
    item.appendChild(detail);

    return item;
  }

  function deriveWarnings(state) {
    var warnings = [];
    var seen = {};
    var lanDown = null;
    var interfaceError = null;

    function pushWarning(entry) {
      if (!entry || seen[entry.key]) {
        return;
      }

      seen[entry.key] = true;
      warnings.push(entry);
    }

    if (state.wan && state.wan.available && state.wan.status === "disconnected") {
      pushWarning({
        key: "internet-disconnected",
        severity: "warning",
        source: "internet",
        title: translate(STRINGS.noActiveInternetConnection),
        detail: translate(STRINGS.wanConfiguredCurrentlyDown)
      });
    }

    if (state.vpn && state.vpn.available && state.vpn.status === "inactive") {
      pushWarning({
        key: "vpn-inactive",
        severity: "warning",
        source: "interfaces",
        title: translate(STRINGS.vpn) + " " + translate(STRINGS.inactive),
        detail: getUnavailableValue(state.vpn.note)
      });
    }

    if (state.memory && state.memory.available) {
      if (state.memory.status === RESOURCE_STATUS.critical) {
        pushWarning({
          key: "memory-critical",
          severity: "critical",
          source: "memory",
          title: translate(STRINGS.memoryUsageCritical),
          detail: getUnavailableValue(state.memory.primary) + " " + translate(STRINGS.used).toLowerCase()
        });
      } else if (state.memory.status === RESOURCE_STATUS.elevated) {
        pushWarning({
          key: "memory-elevated",
          severity: "warning",
          source: "memory",
          title: translate(STRINGS.memoryUsageElevated),
          detail: getUnavailableValue(state.memory.primary) + " " + translate(STRINGS.used).toLowerCase()
        });
      }
    }

    if (state.storage && state.storage.available) {
      if (state.storage.status === RESOURCE_STATUS.critical) {
        pushWarning({
          key: "storage-critical",
          severity: "critical",
          source: "storage",
          title: translate(STRINGS.storageUsageCritical),
          detail: getUnavailableValue(state.storage.primary) + " " + translate(STRINGS.used).toLowerCase()
        });
      } else if (state.storage.status === RESOURCE_STATUS.elevated) {
        pushWarning({
          key: "storage-elevated",
          severity: "warning",
          source: "storage",
          title: translate(STRINGS.storageUsageElevated),
          detail: getUnavailableValue(state.storage.primary) + " " + translate(STRINGS.used).toLowerCase()
        });
      }
    }

    if (state.temperature && state.temperature.available) {
      if (state.temperature.status === RESOURCE_STATUS.critical) {
        pushWarning({
          key: "temperature-critical",
          severity: "critical",
          source: "temperature",
          title: translate(STRINGS.temperatureCritical),
          detail: getUnavailableValue(state.temperature.primary)
        });
      } else if (state.temperature.status === RESOURCE_STATUS.elevated) {
        pushWarning({
          key: "temperature-elevated",
          severity: "warning",
          source: "temperature",
          title: translate(STRINGS.temperatureElevated),
          detail: getUnavailableValue(state.temperature.primary)
        });
      }
    }

    (state.interfaces.logical || []).forEach(function (item) {
      if (!lanDown && item.role === "lan" && item.status && item.status.key === "disconnected") {
        lanDown = item;
      }

      if (!interfaceError && item.status && item.status.key === "critical") {
        interfaceError = item;
      }
    });

    if (interfaceError) {
      pushWarning({
        key: "interface-error:" + interfaceError.key,
        severity: "critical",
        source: "interfaces",
        title: translate(STRINGS.interfaceReportsError),
        detail: interfaceError.displayName || interfaceError.name
      });
    } else if (lanDown) {
      pushWarning({
        key: "lan-down:" + lanDown.key,
        severity: "warning",
        source: "interfaces",
        title: translate(STRINGS.lanInterfaceDown),
        detail: lanDown.name
      });
    }

    if (state.stale || (state.interfaces && state.interfaces.stale)) {
      pushWarning({
        key: "data-stale",
        severity: "informational",
        source: "freshness",
        title: translate(STRINGS.someDashboardDataIsStale),
        detail: translate(STRINGS.dashboardDataMayBeOutdated)
      });
    }

    warnings.sort(function (a, b) {
      var severityDelta = (WARNING_SEVERITY_WEIGHT[a.severity] || 99) - (WARNING_SEVERITY_WEIGHT[b.severity] || 99);

      if (severityDelta !== 0) {
        return severityDelta;
      }

      return (WARNING_SOURCE_WEIGHT[a.source] || 99) - (WARNING_SOURCE_WEIGHT[b.source] || 99);
    });

    return warnings;
  }

  function renderWarnings(state) {
    var warnings = state.warnings || [];

    if (!controller.noticeSectionNode || !controller.noticeCountNode || !controller.noticeListNode) {
      return;
    }

    while (controller.noticeListNode.firstChild) {
      controller.noticeListNode.removeChild(controller.noticeListNode.firstChild);
    }

    if (!warnings.length) {
      controller.noticeSectionNode.hidden = true;
      delete controller.noticeSectionNode.dataset.severity;
      controller.noticeCountNode.textContent = "";
      return;
    }

    controller.noticeSectionNode.hidden = false;
    controller.noticeSectionNode.dataset.severity = warnings[0] && warnings[0].severity ? warnings[0].severity : "informational";
    controller.noticeCountNode.textContent = pluralizeItems(warnings.length);
    warnings.forEach(function (warning) {
      controller.noticeListNode.appendChild(createWarning(warning));
    });
  }

  function renderInterfaceSection(state) {
    var items = [];

    if (!controller.interfaceTableBodyNode || !controller.interfaceEmptyNode || !controller.interfaceSectionNode) {
      return;
    }

    items = (state.interfaces.logical || []).concat(state.interfaces.wireless || []);
    controller.interfaceSectionNode.classList.toggle("is-stale", !!state.interfaces.stale);

    clearNode(controller.interfaceTableBodyNode);

    if (!items.length) {
      controller.interfaceEmptyNode.hidden = false;
      if (controller.interfaceGridNode) {
        controller.interfaceGridNode.hidden = true;
      }
      return;
    }

    if (controller.interfaceGridNode) {
      controller.interfaceGridNode.hidden = false;
    }

    controller.interfaceEmptyNode.hidden = true;
    items.forEach(function (item) {
      var row = document.createElement("tr");
      var traffic = splitTraffic(item.traffic);

      row.dataset.interfaceRole = item.role;
      row.appendChild(createInterfaceIdentityCell(item));
      row.appendChild(createInterfaceCell(item.protocolLabel || item.protocol || item.role, "neovpn-console-table__protocol"));
      row.appendChild(createInterfaceCell(item.primaryAddress || translate(STRINGS.noAddress), "neovpn-console-table__address"));
      row.appendChild(createInterfaceCell(traffic.rx, "neovpn-console-table__traffic"));
      row.appendChild(createInterfaceCell(traffic.tx, "neovpn-console-table__traffic"));
      row.appendChild(createInterfaceStatusCell(item));
      controller.interfaceTableBodyNode.appendChild(row);
    });
  }

  function buildNormalizedState(results) {
    var state = createInitialState();
    var dynamic = {
      available: false,
      candidate: null,
      connected: false,
      vpnDetected: [],
      vpnActive: [],
      wifiAvailable: false,
      wifiCount: 0
    };
    var board = null;
    var info = null;

    if (results.system.status === "fulfilled") {
      board = results.system.value.board;
      info = results.system.value.info;

      state.system = buildSystemCard(results.system.value);
      state.resources.load = normalizeLoadResource(info, board);
      state.resources.memory = normalizeMemoryResource(info);
      state.resources.storage = normalizeStorageResource(info, board);
      state.resources.temperature = normalizeTemperatureResource(info, board);

      state.load = buildLoadCard(state.resources.load);
      state.memory = buildMemoryCard(state.resources.memory);
      state.storage = buildStorageCard(state.resources.storage);
      state.temperature = buildTemperatureCard(state.resources.temperature);
    }

    if (results.network.status === "fulfilled") {
      dynamic = results.network.value;
      state.wan = buildWanCard(dynamic);
      state.vpn = buildVpnCardFromStatus(results.vpn && results.vpn.status === "fulfilled" ? results.vpn.value : null);
      state.vpnStatus = results.vpn && results.vpn.status === "fulfilled" ? results.vpn.value : null;
      state.interfaces = normalizeInterfaceState(dynamic);
    }

    if (results.vpn.status === "fulfilled") {
      state.vpnStatus = results.vpn.value;
      state.vpnLastCheckedAt = Date.now();
    }

    if (results.clients.status === "fulfilled") {
      state.clients = buildClientsCard({
        available: true,
        dhcp4: results.clients.value.dhcp4,
        dhcp6: results.clients.value.dhcp6,
        wifiAvailable: dynamic.wifiAvailable,
        wifi: dynamic.wifiCount
      });
    }

    state.timestamp = Date.now();
    state.stale = false;
    state.warnings = deriveWarnings(state);

    return state;
  }

  function mergeWithPrevious(nextState, results) {
    var previous = controller.state;
    var preserveByTask = {
      system: ["system", "load", "memory", "storage", "temperature"],
      network: ["wan"],
      vpn: ["vpn"],
      clients: ["clients"]
    };

    Object.keys(preserveByTask).forEach(function (taskKey) {
      if (results[taskKey].status === "fulfilled") {
        return;
      }

      preserveByTask[taskKey].forEach(function (key) {
        if (previous[key] && previous[key].available) {
          nextState[key] = Object.assign({}, previous[key], {
            stale: true,
            render: previous[key].render !== false,
            status: "stale",
            statusText: translate(STRINGS.lastKnown),
            facts: (previous[key].facts || []).slice()
          });
        }
      });
    });

    if (results.network.status !== "fulfilled" && previous.interfaces && (previous.interfaces.logical.length || previous.interfaces.wireless.length)) {
      nextState.interfaces = {
        available: previous.interfaces.available,
        stale: true,
        logical: previous.interfaces.logical.map(function (item) {
          return Object.assign({}, item, { stale: true });
        }),
        wireless: previous.interfaces.wireless.map(function (item) {
          return Object.assign({}, item, { stale: true });
        })
      };
    }

    if (results.vpn.status !== "fulfilled" && previous.vpnStatus) {
      nextState.vpnStatus = previous.vpnStatus;
      nextState.vpnLastCheckedAt = previous.vpnLastCheckedAt || 0;
      nextState.vpn = Object.assign({}, previous.vpn, {
        stale: true,
        status: "stale",
        statusText: translate(STRINGS.lastKnown)
      });
    }

    nextState.warnings = deriveWarnings(nextState);

    return nextState;
  }

  function loadModules() {
    if (controller.modules) {
      return Promise.resolve(controller.modules);
    }

    if (typeof L === "undefined" || typeof L.require !== "function") {
      return Promise.reject(new Error("LuCI runtime is not ready"));
    }

    return Promise.all([
      L.require("rpc"),
      L.require("network")
    ]).then(function (modules) {
      var rpc = modules[0];
      var network = modules[1];

      controller.modules = {
        rpc: rpc,
        network: network,
        callSystemBoard: rpc.declare({
          object: "system",
          method: "board"
        }),
        callSystemInfo: rpc.declare({
          object: "system",
          method: "info"
        }),
        callDhcpLeases: rpc.declare({
          object: "luci-rpc",
          method: "getDHCPLeases",
          expect: { "": {} }
        }),
        callVpnStatus: rpc.declare({
          object: "neovpn.vpn",
          method: "status",
          expect: { "": {} }
        })
      };

      return controller.modules;
    });
  }

  function refreshData() {
    return loadModules().then(function (modules) {
      var network = modules.network;
      var tasks = {
        system: Promise.allSettled([
          L.resolveDefault(modules.callSystemBoard(), {}),
          L.resolveDefault(modules.callSystemInfo(), {})
        ]).then(function (results) {
          return {
            board: results[0].status === "fulfilled" ? results[0].value : null,
            info: results[1].status === "fulfilled" ? results[1].value : null
          };
        }),
        network: Promise.resolve(network.flushCache()).then(function () {
          return Promise.all([
            network.getNetworks(),
            L.resolveDefault(network.getWANNetworks(), []),
            L.resolveDefault(network.getWAN6Networks(), [])
          ]).then(function (values) {
            var allNetworks = values[0] || [];
            var wanNetworks = (values[1] || []).concat(values[2] || []);
            var activeSet = {};
            var candidate = null;
            var bestScore = -1;
            var vpnDetected = [];
            var vpnActive = [];
            var wifiCount = 0;
            var assocMap = {};

            wanNetworks.forEach(function (net) {
              activeSet[net.getName()] = true;
            });

            allNetworks.forEach(function (net) {
              var score = scoreUpstreamCandidate(net, activeSet);

              if (score > bestScore) {
                bestScore = score;
                candidate = net;
              }

              if (isVpnCandidate(net)) {
                vpnDetected.push(net);

                if (net.isUp()) {
                  vpnActive.push(net);
                }
              }
            });

            return L.resolveDefault(network.getWifiDevices(), []).then(function (wifiDevices) {
              controller.wifiSupportKnown = true;
              controller.wifiSupported = Array.isArray(wifiDevices) && wifiDevices.length > 0;

              if (!controller.wifiSupported) {
                return {
                  available: true,
                  activeWanSet: activeSet,
                  allNetworks: allNetworks,
                  wifiNetworks: [],
                  assocMap: assocMap,
                  candidate: bestScore > 0 ? candidate : null,
                  connected: !!(bestScore > 0 && candidate && candidate.isUp()),
                  vpnDetected: vpnDetected,
                  vpnActive: vpnActive,
                  wifiAvailable: false,
                  wifiCount: 0
                };
              }

              return L.resolveDefault(network.getWifiNetworks(), []).then(function (wifiNetworks) {
                return Promise.allSettled((wifiNetworks || []).map(function (wifiNetwork) {
                  return L.resolveDefault(wifiNetwork.getAssocList(), []);
                })).then(function (assocResults) {
                  assocResults.forEach(function (result, index) {
                    var wifiNetwork = wifiNetworks[index];

                    if (result.status === "fulfilled" && Array.isArray(result.value)) {
                      if (wifiNetwork) {
                        assocMap[wifiNetwork.getID ? wifiNetwork.getID() : wifiNetwork.getName()] = result.value;
                      }

                      wifiCount += result.value.length;
                    }
                  });

                  return {
                    available: true,
                    activeWanSet: activeSet,
                    allNetworks: allNetworks,
                    wifiNetworks: wifiNetworks || [],
                    assocMap: assocMap,
                    candidate: bestScore > 0 ? candidate : null,
                    connected: !!(bestScore > 0 && candidate && candidate.isUp()),
                    vpnDetected: vpnDetected,
                    vpnActive: vpnActive,
                    wifiAvailable: true,
                    wifiCount: wifiCount
                  };
                });
              });
            });
          });
        }),
        clients: Promise.resolve(L.resolveDefault(modules.callDhcpLeases(), {})).then(function (leases) {
          return {
            dhcp4: Array.isArray(leases.dhcp_leases) ? leases.dhcp_leases.length : 0,
            dhcp6: Array.isArray(leases.dhcp6_leases) ? leases.dhcp6_leases.length : 0
          };
        }),
        vpn: getVpnStatus(modules)
      };

      return Promise.allSettled([tasks.system, tasks.network, tasks.clients, tasks.vpn]).then(function (settled) {
        return {
          system: settled[0],
          network: settled[1],
          clients: settled[2],
          vpn: settled[3]
        };
      });
    });
  }

  function getVpnStatus(modules) {
    if (typeof window !== "undefined" && window.__NEOVPN_VPN_STATUS_MOCK) {
      return Promise.resolve(window.__NEOVPN_VPN_STATUS_MOCK);
    }

    return Promise.resolve(L.resolveDefault(modules.callVpnStatus(), {
      overall: {
        state: "unknown",
        installed_count: 0,
        running_count: 0,
        conflict: false
      },
      providers: []
    }));
  }

  function runRefresh(force) {
    if (controller.destroyed || !controller.root || !controller.root.isConnected) {
      cleanup();
      return Promise.resolve();
    }

    if (document.hidden && !force) {
      return Promise.resolve();
    }

    if (controller.inFlight) {
      return controller.inFlight;
    }

    setBusy(true);

    controller.inFlight = refreshData().then(function (results) {
      var nextState = mergeWithPrevious(buildNormalizedState(results), results);

      controller.state = nextState;
      renderState(nextState);
    }).catch(function (error) {
      setFailureState(error);
    }).finally(function () {
      controller.inFlight = null;
      setBusy(false);
    });

    return controller.inFlight;
  }

  function scheduleRefresh() {
    if (controller.timer) {
      window.clearInterval(controller.timer);
    }

    controller.timer = window.setInterval(function () {
      runRefresh(false);
    }, REFRESH_INTERVAL);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (controller.timer) {
        window.clearInterval(controller.timer);
        controller.timer = null;
      }

      return;
    }

    runRefresh(true).finally(scheduleRefresh);
  }

  function cleanup() {
    controller.destroyed = true;

    if (controller.mountObserver) {
      controller.mountObserver.disconnect();
      controller.mountObserver = null;
    }

    if (controller.timer) {
      window.clearInterval(controller.timer);
      controller.timer = null;
    }

    if (controller.stockObserver) {
      controller.stockObserver.disconnect();
      controller.stockObserver = null;
    }

    if (controller.stockSyncFrame) {
      window.cancelAnimationFrame(controller.stockSyncFrame);
      controller.stockSyncFrame = 0;
    }

    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }

  function mountDashboard() {
    var firstSection = controller.view.querySelector(".cbi-section");

    if (!firstSection) {
      return false;
    }

    controller.root = controller.view.querySelector(ROOT_SELECTOR);

    if (!controller.root) {
      controller.root = createDashboardRoot();
      controller.view.insertBefore(controller.root, firstSection);
    }

    ensureCardShells();

    if (!controller.initialized) {
      controller.initialized = true;
      controller.refreshButton.addEventListener("click", function () {
        runRefresh(true);
      });
      document.addEventListener("visibilitychange", handleVisibilityChange);
      runRefresh(true).finally(scheduleRefresh);
    }

    startOverviewStockObserver();
    queueOverviewStockSectionSync();

    if (controller.mountObserver) {
      controller.mountObserver.disconnect();
      controller.mountObserver = null;
    }

    return true;
  }

  function waitForMountTarget() {
    controller.view = document.getElementById("view");

    if (!controller.view) {
      throw new Error("Overview view container not found");
    }

    if (mountDashboard()) {
      return;
    }

    controller.mountObserver = new MutationObserver(function () {
      mountDashboard();
    });

    controller.mountObserver.observe(controller.view, { childList: true });
  }

  function waitForOverviewRuntime() {
    return new Promise(function (resolve, reject) {
      function check() {
        controller.bootAttempts += 1;

        if (!document.body || document.body.dataset.page !== PAGE_ID || document.body.classList.contains("neovpn-auth")) {
          reject(new Error("Dashboard bootstrap conditions not met"));
          return;
        }

        if (PAGE_PATH_ALIASES.indexOf(location.pathname) === -1) {
          reject(new Error("Unexpected overview pathname"));
          return;
        }

        if (typeof L !== "undefined" && typeof L.require === "function") {
          resolve();
          return;
        }

        if (controller.bootAttempts >= WAIT_LIMIT) {
          reject(new Error("LuCI runtime did not become available"));
          return;
        }

        window.setTimeout(check, WAIT_INTERVAL);
      }

      check();
    });
  }

  function isOverviewPage() {
    return !!document.body &&
      document.body.dataset.page === PAGE_ID &&
      !document.body.classList.contains("neovpn-auth");
  }

  function init() {
    if (!isOverviewPage()) {
      return;
    }

    if (controller.destroyed || document.body.dataset.neovpnDashboardInitialized === "1") {
      return;
    }

    controller.body = document.body;

    waitForOverviewRuntime().then(function () {
      document.body.dataset.neovpnDashboardInitialized = "1";
      waitForMountTarget();
    }).catch(function (error) {
      if (!controller.runtimeErrorLogged) {
        controller.runtimeErrorLogged = true;
        console.error("NeoVPN dashboard bootstrap failed", error);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}());
