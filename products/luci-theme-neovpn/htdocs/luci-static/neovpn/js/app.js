(function () {
  "use strict";

  function text(value) {
    return document.createTextNode(value);
  }

  function pathStartsWith(path, prefix) {
    if (path.length < prefix.length) {
      return false;
    }

    for (var i = 0; i < prefix.length; i += 1) {
      if (path[i] !== prefix[i]) {
        return false;
      }
    }

    return true;
  }

  function buildUrl(segments) {
    return L.url.apply(L, segments);
  }

  function getDefaultSegments(ui, node, segments) {
    var children = ui.menu.getChildren(node).filter(function (child) {
      return child.name !== "logout";
    });

    if (!children.length) {
      return segments;
    }

    return getDefaultSegments(ui, children[0], segments.concat(children[0].name));
  }

  function createLink(url, label, className) {
    var link = document.createElement("a");

    link.href = url;
    link.className = className;
    link.appendChild(text(label));

    return link;
  }

  function setToggleState(toggle, submenu, open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? _("Collapse section") : _("Expand section"));
    toggle.dataset.state = open ? "open" : "closed";
    submenu.hidden = !open;
  }

  function renderMenuLevel(ui, tree, segments, level) {
    var children = ui.menu.getChildren(tree);
    var dispatchpath = Array.isArray(L.env.dispatchpath) ? L.env.dispatchpath : [];

    if (!children.length) {
      return null;
    }

    var list = document.createElement("ul");
    list.className = level === 0 ? "neovpn-menu" : "neovpn-menu__list";
    list.dataset.depth = String(level);

    children.forEach(function (child) {
      var childSegments = segments.concat(child.name);
      var childChildren = ui.menu.getChildren(child);
      var hasChildren = childChildren.length > 0;
      var isBranch = pathStartsWith(dispatchpath, childSegments);
      var isActive = dispatchpath.length === childSegments.length && isBranch;
      var item = document.createElement("li");
      var row = document.createElement("div");
      var link = createLink(buildUrl(childSegments), _(child.title), "neovpn-menu__link");

      item.className = "neovpn-menu__item";
      row.className = "neovpn-menu__row";

      if (hasChildren) {
        item.classList.add("neovpn-menu__item--parent");
      }

      if (isBranch) {
        item.classList.add("is-branch");
      }

      if (isActive) {
        item.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }

      if (/\/logout(?:$|\?)/.test(link.pathname + link.search)) {
        item.classList.add("neovpn-menu__item--logout");
      }

      row.appendChild(link);

      if (hasChildren) {
        var submenu = renderMenuLevel(ui, child, childSegments, level + 1);
        var toggle = document.createElement("button");
        var open = isBranch;

        toggle.type = "button";
        toggle.className = "neovpn-menu__toggle";
        setToggleState(toggle, submenu, open);

        if (open) {
          item.classList.add("is-open");
        }

        toggle.addEventListener("click", function () {
          var nextOpen = toggle.getAttribute("aria-expanded") !== "true";

          item.classList.toggle("is-open", nextOpen);
          setToggleState(toggle, submenu, nextOpen);
        });

        row.appendChild(toggle);
        item.appendChild(row);
        item.appendChild(submenu);
      } else {
        item.appendChild(row);
      }

      list.appendChild(item);
    });

    return list;
  }

  function renderSidebarMenu(ui, tree, segments) {
    var container = document.getElementById("topmenu");
    var label = document.getElementById("contextmenu-label");
    var menu = renderMenuLevel(ui, tree, segments, 0);
    var children = ui.menu.getChildren(tree);
    var dispatchpath = Array.isArray(L.env.dispatchpath) ? L.env.dispatchpath : [];
    var activeChild = children.filter(function (child) {
      return pathStartsWith(dispatchpath, segments.concat(child.name));
    })[0] || children[0] || null;

    if (!container || !menu) {
      return;
    }

    if (label) {
      label.textContent = activeChild ? _(activeChild.title) : _("Navigation");
    }

    container.className = menu.className;
    container.dataset.depth = menu.dataset.depth || "0";
    container.replaceChildren();

    while (menu.firstChild) {
      container.appendChild(menu.firstChild);
    }
  }

  function renderTopNavigation(ui, tree, segments) {
    var container = document.getElementById("rootmenu");
    var children = ui.menu.getChildren(tree);
    var dispatchpath = Array.isArray(L.env.dispatchpath) ? L.env.dispatchpath : [];

    if (!container || !children.length) {
      return;
    }

    container.replaceChildren();
    container.className = "neovpn-root-menu";

    children.forEach(function (child) {
      var childSegments = segments.concat(child.name);
      var hrefSegments = getDefaultSegments(ui, child, childSegments);
      var isBranch = pathStartsWith(dispatchpath, childSegments);
      var item = document.createElement("li");
      var link = createLink(buildUrl(hrefSegments), _(child.title), "neovpn-root-menu__link");

      item.className = "neovpn-root-menu__item";

      if (/\/logout(?:$|\?)/.test(link.pathname + link.search)) {
        item.classList.add("neovpn-root-menu__item--logout");
        return;
      }

      if (isBranch) {
        item.classList.add("is-active");
        link.setAttribute("aria-current", "true");
      }

      item.appendChild(link);
      container.appendChild(item);
    });
  }

  function renderTabMenu(ui, tree, segments, level) {
    var container = document.getElementById("tabmenu");
    var children = ui.menu.getChildren(tree);
    var dispatchpath = Array.isArray(L.env.dispatchpath) ? L.env.dispatchpath : [];

    if (!container || !children.length) {
      return;
    }

    var list = document.createElement("ul");
    var activeNode = null;

    list.className = "tabs";

    children.forEach(function (child) {
      var item = document.createElement("li");
      var childSegments = segments.concat(child.name);
      var isActive = pathStartsWith(dispatchpath, childSegments);
      var link = createLink(buildUrl(childSegments), _(child.title), "neovpn-tabmenu__link");

      item.className = "neovpn-tabmenu__item";

      if (isActive) {
        item.classList.add("active");
        activeNode = child;
      }

      item.appendChild(link);
      list.appendChild(item);
    });

    container.appendChild(list);

    if (activeNode) {
      renderTabMenu(ui, activeNode, segments.concat(activeNode.name), level + 1);
    }
  }

  function renderModeMenu(ui, tree) {
    var list = document.getElementById("modemenu");
    var children = ui.menu.getChildren(tree);
    var requestpath = Array.isArray(L.env.requestpath) ? L.env.requestpath : [];
    var activeRoot = null;

    if (!list || !children.length) {
      return null;
    }

    children.forEach(function (child, index) {
      var item = document.createElement("li");
      var isActive = requestpath.length ? child.name === requestpath[0] : index === 0;
      var link = createLink(buildUrl([child.name]), _(child.title), "neovpn-mode-menu__link");

      item.className = "neovpn-mode-menu__item";

      if (isActive) {
        item.classList.add("active");
        activeRoot = child;
      }

      item.appendChild(link);
      list.appendChild(item);
    });

    return activeRoot;
  }

  function initMenu() {
    var topMenu = document.getElementById("topmenu");
    var rootMenu = document.getElementById("rootmenu");
    var modeMenu = document.getElementById("modemenu");
    var tabMenu = document.getElementById("tabmenu");

    if (typeof L === "undefined" || typeof L.require !== "function") {
      return;
    }

    if (topMenu) {
      topMenu.replaceChildren();
    }

    if (rootMenu) {
      rootMenu.replaceChildren();
    }

    if (modeMenu) {
      modeMenu.replaceChildren();
    }

    if (tabMenu) {
      tabMenu.replaceChildren();
    }

    L.require("ui").then(function (ui) {
      return ui.menu.load().then(function (tree) {
        var activeRoot = renderModeMenu(ui, tree);
        var node = tree;
        var segments = [];

        if (activeRoot) {
          renderTopNavigation(ui, activeRoot, [activeRoot.name]);
          renderSidebarMenu(ui, activeRoot, [activeRoot.name]);
        }

        if (Array.isArray(L.env.dispatchpath) && L.env.dispatchpath.length >= 3) {
          for (var i = 0; i < 3 && node; i += 1) {
            node = node.children[L.env.dispatchpath[i]];

            if (node) {
              segments.push(L.env.dispatchpath[i]);
            }
          }

          if (node) {
            renderTabMenu(ui, node, segments, 0);
          }
        }
      });
    }).catch(function () {});
  }

  function init() {
    if (document.body && document.body.dataset.neovpnAppInitialized === "1") {
      return;
    }

    if (document.body) {
      document.body.dataset.neovpnAppInitialized = "1";
    }

    document.documentElement.classList.add("neovpn-runtime");
    initMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}());
