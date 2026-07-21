/**
 * Notification center (mocked): localStorage-backed store + toast/badge/panel rendering.
 * Store logic runs everywhere it's included (also on pre-app pages like add-vci.njk/install.njk,
 * which have no sidebar) so issues raised during setup still land in the panel once the user
 * reaches the app shell. UI rendering (bell badge, toast, slide-out panel) only activates when
 * those elements exist in the DOM, i.e. inside launchpad-2-app.njk.
 *
 * Public API: window.AutocomNotifications.push(type, title, message, opts)
 *   type: 'connection' | 'voltage' | 'update'
 *   opts.dedupeKey: skip if a notification with this key already exists (avoids re-firing
 *     the same scripted trigger on every page revisit within a session).
 *
 * push() is a no-op when localStorage['launchpad-notifications-suppressed'] === '1' (Settings'
 * "Notifications" card) — a demo-mode kill switch so sales demos aren't interrupted by toasts.
 */
(function () {
  var STORE_KEY = 'air-notifications';

  var TYPE_META = {
    connection: {
      icon: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
      textClass: 'text-warning',
      dotClass: 'bg-warning',
      alertClass: 'alert-warning'
    },
    voltage: {
      icon: '<rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/><path d="M6 10v4M9 10v4" stroke-opacity="0.4"/>',
      textClass: 'text-warning',
      dotClass: 'bg-warning',
      alertClass: 'alert-warning'
    },
    update: {
      icon: '<path d="M23 4.00008V10.0001M23 10.0001H17M23 10.0001L18.36 5.64008C17.2853 4.56479 15.9556 3.77928 14.4952 3.35685C13.0348 2.93442 11.4911 2.88883 10.0083 3.22433C8.52547 3.55984 7.1518 4.26551 6.01547 5.27549C4.87913 6.28548 4.01717 7.56686 3.51 9.00008M1 20.0001V14.0001M1 14.0001H7M1 14.0001L5.64 18.3601C6.71475 19.4354 8.04437 20.2209 9.50481 20.6433C10.9652 21.0657 12.5089 21.1113 13.9917 20.7758C15.4745 20.4403 16.8482 19.7346 17.9845 18.7247C19.1209 17.7147 19.9828 16.4333 20.49 15.0001"/>',
      textClass: 'text-info',
      dotClass: 'bg-info',
      alertClass: 'alert-info'
    }
  };

  function readAll() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function writeAll(list) {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  }

  function unreadCount() {
    return readAll().filter(function (n) { return !n.read; }).length;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function relativeTime(ts) {
    var diff = Math.max(0, Date.now() - ts);
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }

  function iconSvg(type, extraClass) {
    var meta = TYPE_META[type] || TYPE_META.update;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' + (extraClass || 'w-5 h-5') + '" aria-hidden="true">' + meta.icon + '</svg>';
  }

  function push(type, title, message, opts) {
    if (localStorage.getItem('launchpad-notifications-suppressed') === '1') return null;
    opts = opts || {};
    var list = readAll();
    if (opts.dedupeKey && list.some(function (n) { return n.dedupeKey === opts.dedupeKey; })) {
      return null;
    }
    var notification = {
      id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      type: type,
      title: title,
      message: message,
      time: Date.now(),
      read: false,
      dedupeKey: opts.dedupeKey || null
    };
    list.unshift(notification);
    writeAll(list);
    renderBadge();
    renderPanelList();
    showToast(notification);
    return notification;
  }

  function markAllRead() {
    var list = readAll();
    list.forEach(function (n) { n.read = true; });
    writeAll(list);
    renderBadge();
    renderPanelList();
  }

  function clearAll() {
    writeAll([]);
    renderBadge();
    renderPanelList();
  }

  // ----- UI (only active when the notification center markup is present, i.e. app shell) -----

  // Multiple bell/badge instances can exist at once (full "Notifications" row in the desktop
  // sidebar, compact icon-only bell in the mobile top bar) — both stay in sync since they all
  // render from the same store and are looked up by class, not a single unique id.
  var badgeEls = document.querySelectorAll('.notifications-badge');
  var bellTriggers = document.querySelectorAll('.notifications-bell-trigger');
  var panelEl = document.getElementById('notification-panel');
  var panelBackdrop = document.getElementById('notification-panel-backdrop');
  var panelListEl = document.getElementById('notification-panel-list');
  var toastContainer = document.getElementById('notification-toast-container');
  var clearAllBtn = document.getElementById('notification-panel-clear-all');

  function renderBadge() {
    if (!badgeEls.length) return;
    var count = unreadCount();
    var text = count > 9 ? '9+' : String(count);
    badgeEls.forEach(function (el) {
      el.textContent = text;
      el.classList.toggle('hidden', count === 0);
    });
  }

  function renderPanelList() {
    if (clearAllBtn) clearAllBtn.classList.toggle('hidden', readAll().length === 0);
    if (!panelListEl) return;
    var list = readAll();
    if (!list.length) {
      panelListEl.innerHTML = '<p class="text-sm text-base-content/60 text-center py-8">No notifications yet.</p>';
      return;
    }
    panelListEl.innerHTML = list.map(function (n) {
      var meta = TYPE_META[n.type] || TYPE_META.update;
      return '' +
        '<div class="flex gap-3 p-3 rounded-box border border-base-300 bg-base-100">' +
          '<span class="' + meta.textClass + ' shrink-0 mt-0.5">' + iconSvg(n.type) + '</span>' +
          '<div class="min-w-0 flex-1">' +
            '<div class="flex items-center justify-between gap-2">' +
              '<h4 class="text-sm font-semibold text-base-content leading-tight">' + escapeHtml(n.title) + '</h4>' +
              (n.read ? '' : '<span class="w-2 h-2 rounded-full ' + meta.dotClass + ' shrink-0"></span>') +
            '</div>' +
            '<p class="text-sm text-base-content/70 mt-0.5">' + escapeHtml(n.message) + '</p>' +
            '<p class="text-xs text-base-content/50 mt-1">' + relativeTime(n.time) + '</p>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  function showToast(n) {
    if (!toastContainer) return;
    var meta = TYPE_META[n.type] || TYPE_META.update;
    var el = document.createElement('div');
    el.setAttribute('role', 'alert');
    el.className = 'alert ' + meta.alertClass + ' shadow-lg max-w-xs cursor-pointer items-start';
    el.innerHTML = '<span class="shrink-0 mt-0.5">' + iconSvg(n.type) + '</span>' +
      '<div class="min-w-0"><p class="font-semibold text-sm">' + escapeHtml(n.title) + '</p><p class="text-xs opacity-80">' + escapeHtml(n.message) + '</p></div>';
    el.addEventListener('click', function () {
      openPanel();
      el.remove();
    });
    toastContainer.appendChild(el);
    setTimeout(function () { el.remove(); }, 6000);
  }

  function openPanel() {
    if (!panelEl) return;
    panelEl.classList.remove('translate-x-full');
    panelEl.setAttribute('aria-hidden', 'false');
    if (panelBackdrop) {
      panelBackdrop.classList.remove('pointer-events-none', 'opacity-0');
    }
    markAllRead();
  }

  function closePanel() {
    if (!panelEl) return;
    panelEl.classList.add('translate-x-full');
    panelEl.setAttribute('aria-hidden', 'true');
    if (panelBackdrop) {
      panelBackdrop.classList.add('pointer-events-none', 'opacity-0');
    }
  }

  bellTriggers.forEach(function (btn) {
    btn.addEventListener('click', openPanel);
  });
  var closeBtn = document.getElementById('notification-panel-close');
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (panelBackdrop) panelBackdrop.addEventListener('click', closePanel);
  if (clearAllBtn) clearAllBtn.addEventListener('click', clearAll);

  renderBadge();
  renderPanelList();

  window.AutocomNotifications = {
    push: push,
    markAllRead: markAllRead,
    clearAll: clearAll,
    getAll: readAll
  };
})();
