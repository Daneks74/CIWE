/* CIWE · Theodore 4000 — mobile mockup (front-end only) */
(() => {
  "use strict";

  // ---------- Seed data ----------
  const initialDevices = [
    {
      id: "kitchen",
      name: "Kitchen Freezer",
      model: "Theodore 4000",
      status: "defrosting",
      progress: 42,
      currentTemp: 36.2,
      targetTemp: 36.0,
      etaMinutes: 75,
      meatType: "Beef Steak",
      weight: "1.3 lb",
      mode: "Precision Thaw",
      connection: "online",
    },
    {
      id: "garage",
      name: "Garage Freezer",
      model: "Theodore 4000",
      status: "idle",
      progress: 0,
      currentTemp: 2.4,
      targetTemp: 36.0,
      etaMinutes: 0,
      meatType: null,
      weight: null,
      mode: "Standby",
      connection: "online",
    },
    {
      id: "pantry",
      name: "Pantry Unit",
      model: "Theodore 4000",
      status: "holdsafe",
      progress: 100,
      currentTemp: 38.1,
      targetTemp: 38.0,
      etaMinutes: 0,
      meatType: "Chicken Breast",
      weight: "0.9 lb",
      mode: "Hold Safe",
      connection: "online",
    },
    {
      id: "test-bench",
      name: "Test Bench",
      model: "Theodore 4000",
      status: "offline",
      progress: 0,
      currentTemp: null,
      targetTemp: 36.0,
      etaMinutes: 0,
      meatType: null,
      weight: null,
      mode: "Reconnect",
      connection: "offline",
    },
  ];

  const initialActivity = [
    { icon: "flame", text: "Kitchen Freezer started Precision Thaw", time: "2m ago" },
    { icon: "check", text: "Pantry Unit reached safe hold temp", time: "18m ago" },
    { icon: "bell", text: "Firmware 4.2.1 available for Garage Freezer", time: "1h ago" },
  ];

  // ---------- State ----------
  const state = {
    devices: JSON.parse(JSON.stringify(initialDevices)),
    activity: JSON.parse(JSON.stringify(initialActivity)),
    notifications: true,
    activeDetailId: null,
    simTickId: null,
  };

  // ---------- DOM refs ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const els = {
    dashboard: $("#view-dashboard"),
    detail: $("#view-detail"),
    list: $("#devices-list"),
    activity: $("#activity-list"),
    toast: $("#toast"),
    notifDot: $("#notif-dot"),
    notifBtn: $("#btn-toggle-notifications"),
    back: $("#btn-back"),
    ringProgress: $("#ring-progress"),
    ringTicks: $("#ring-ticks"),
    ringStatus: $("#ring-status"),
    ringPct: $("#ring-pct"),
    ringEta: $("#ring-eta"),
    detailName: $("#detail-name"),
    detailModel: $("#detail-model"),
    detailCurrent: $("#detail-current"),
    detailTarget: $("#detail-target"),
    detailMeat: $("#detail-meat"),
    detailWeight: $("#detail-weight"),
    detailMode: $("#detail-mode"),
    detailSignal: $("#detail-signal"),
    hold: $("#btn-hold"),
    primaryAction: $("#btn-primary-action"),
    summaryActive: $("#summary-active"),
    summaryReady: $("#summary-ready"),
    summaryIdle: $("#summary-idle"),
  };

  // ---------- Helpers ----------
  const fmtTemp = (t) => (t == null ? "--°" : `${t.toFixed(1)}°F`);
  const fmtEta = (m) => {
    if (!m || m <= 0) return "--";
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return h ? `${h}h ${mm}m` : `${mm}m`;
  };

  const statusLabel = {
    defrosting: "Defrosting",
    idle: "Idle",
    holdsafe: "Hold Safe",
    offline: "Offline",
  };

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2400);
  }

  function findDevice(id) {
    return state.devices.find((d) => d.id === id);
  }

  function logActivity(icon, text) {
    state.activity.unshift({ icon, text, time: "just now" });
    if (state.activity.length > 5) state.activity.length = 5;
    renderActivity();
  }

  // ---------- Renderers ----------
  function renderSummary() {
    const counts = state.devices.reduce(
      (a, d) => {
        a[d.status] = (a[d.status] || 0) + 1;
        return a;
      },
      {}
    );
    els.summaryActive.textContent = counts.defrosting || 0;
    els.summaryReady.textContent = counts.holdsafe || 0;
    els.summaryIdle.textContent = (counts.idle || 0) + (counts.offline || 0);
  }

  function deviceCardHTML(d) {
    const badgeClass = `badge badge--${d.status}`;
    const ringIcon = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
      </svg>`;
    const offlineIcon = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 1l22 22"/><path d="M16.7 11.8A8 8 0 0 0 4 10"/><path d="M20 8a12 12 0 0 0-3.1-2.4"/><path d="M9 15a4 4 0 0 1 5.4-.4"/><circle cx="12" cy="19" r="1"/>
      </svg>`;
    const chkIcon = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>`;

    let ringEl = "";
    if (d.status === "defrosting") {
      ringEl = `
        <div class="mini-ring" style="--pct:${d.progress}">
          <svg viewBox="0 0 56 56" aria-hidden="true">
            <circle class="mini-ring__track" cx="28" cy="28" r="25"/>
            <circle class="mini-ring__bar" cx="28" cy="28" r="25"/>
          </svg>
          <span class="mini-ring__val">${Math.round(d.progress)}%</span>
        </div>`;
    } else if (d.status === "holdsafe") {
      ringEl = `<div class="mini-ring mini-ring--icon">${chkIcon}</div>`;
    } else if (d.status === "offline") {
      ringEl = `<div class="mini-ring mini-ring--icon">${offlineIcon}</div>`;
    } else {
      ringEl = `<div class="mini-ring mini-ring--icon">${ringIcon}</div>`;
    }

    const stats = (() => {
      if (d.status === "defrosting") {
        return `
          <div><span class="stat__lbl">Current</span><span class="stat__val">${fmtTemp(d.currentTemp)}</span></div>
          <div><span class="stat__lbl">Target</span><span class="stat__val">${fmtTemp(d.targetTemp)}</span></div>
          <div><span class="stat__lbl">ETA</span><span class="stat__val">${fmtEta(d.etaMinutes)}</span></div>
          <div><span class="stat__lbl">Load</span><span class="stat__val">${d.meatType ?? "—"} · ${d.weight ?? "—"}</span></div>
        `;
      }
      if (d.status === "offline") {
        return `
          <div><span class="stat__lbl">Status</span><span class="stat__val">Standby</span></div>
          <div><span class="stat__lbl">Signal</span><span class="stat__val">No link</span></div>
          <div><span class="stat__lbl">Last temp</span><span class="stat__val">—</span></div>
          <div><span class="stat__lbl">Action</span><span class="stat__val">Reconnect</span></div>
        `;
      }
      if (d.status === "holdsafe") {
        return `
          <div><span class="stat__lbl">Holding</span><span class="stat__val">${fmtTemp(d.currentTemp)}</span></div>
          <div><span class="stat__lbl">Target</span><span class="stat__val">${fmtTemp(d.targetTemp)}</span></div>
          <div><span class="stat__lbl">Load</span><span class="stat__val">${d.meatType ?? "—"}</span></div>
          <div><span class="stat__lbl">Weight</span><span class="stat__val">${d.weight ?? "—"}</span></div>
        `;
      }
      return `
        <div><span class="stat__lbl">Temp</span><span class="stat__val">${fmtTemp(d.currentTemp)}</span></div>
        <div><span class="stat__lbl">Target</span><span class="stat__val">${fmtTemp(d.targetTemp)}</span></div>
        <div><span class="stat__lbl">Mode</span><span class="stat__val">${d.mode}</span></div>
        <div><span class="stat__lbl">Signal</span><span class="stat__val">Ready</span></div>
      `;
    })();

    const actions = (() => {
      if (d.status === "defrosting") {
        return `
          <button class="btn btn--ghost" data-act="stop" data-id="${d.id}">Stop</button>
          <button class="btn btn--primary" data-act="open" data-id="${d.id}">Open</button>
        `;
      }
      if (d.status === "idle") {
        return `
          <button class="btn btn--primary" data-act="activate" data-id="${d.id}">Activate</button>
        `;
      }
      if (d.status === "holdsafe") {
        return `
          <button class="btn btn--ghost" data-act="stop" data-id="${d.id}">Stop</button>
          <button class="btn btn--primary" data-act="resume" data-id="${d.id}">Resume</button>
        `;
      }
      return `
        <button class="btn btn--ghost" disabled>Offline</button>
        <button class="btn btn--danger" data-act="reconnect" data-id="${d.id}">Reconnect</button>
      `;
    })();

    return `
      <article class="card" data-id="${d.id}" data-status="${d.status}" tabindex="0" aria-label="${d.name}">
        <div class="card__top">
          <div class="card__title">
            <h3>${d.name}</h3>
            <p>${d.model}</p>
          </div>
          <span class="${badgeClass}">
            <span class="badge__dot"></span>${statusLabel[d.status]}
          </span>
        </div>
        <div class="card__body">
          ${ringEl}
          <div class="stats">${stats}</div>
        </div>
        <div class="card__foot">${actions}</div>
      </article>
    `;
  }

  function renderDevices() {
    els.list.innerHTML = state.devices.map(deviceCardHTML).join("");
  }

  function renderActivity() {
    const icon = (name) => {
      if (name === "flame")
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3 4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 2-4-1 5 2 4 2 0Z"/></svg>`;
      if (name === "check")
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>`;
      if (name === "bell")
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>`;
      return `<svg viewBox="0 0 24 24"/>`;
    };
    els.activity.innerHTML = state.activity
      .map(
        (a) => `
      <li class="activity__item">
        <span class="activity__icon">${icon(a.icon)}</span>
        <div class="activity__body">
          <p>${a.text}</p>
          <small>${a.time}</small>
        </div>
      </li>`
      )
      .join("");
  }

  // ---------- Detail view ----------
  const RING_CIRCUMFERENCE = 2 * Math.PI * 104; // ≈ 653.45

  function renderDetail() {
    const d = findDevice(state.activeDetailId);
    if (!d) return;

    els.detailName.textContent = d.name;
    els.detailModel.textContent = d.model;
    els.detailCurrent.textContent = fmtTemp(d.currentTemp);
    els.detailTarget.textContent = fmtTemp(d.targetTemp);
    els.detailMeat.textContent = d.meatType ?? "—";
    els.detailWeight.textContent = d.weight ?? "—";
    els.detailMode.textContent = d.mode;
    els.detailSignal.textContent = d.connection === "online" ? "Online" : "Offline";
    els.detailSignal.classList.toggle("meta__val--ok", d.connection === "online");

    const pct = Math.max(0, Math.min(100, d.progress || 0));
    const offset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * pct) / 100;
    els.ringProgress.style.strokeDashoffset = offset;

    els.ringPct.innerHTML = `${pct}<span class="ring__pct-sym">%</span>`;

    const statusText = {
      defrosting: "Thawing",
      idle: "Ready",
      holdsafe: "Hold Safe",
      offline: "Offline",
    }[d.status];
    els.ringStatus.textContent = statusText;

    els.ringEta.textContent =
      d.status === "defrosting"
        ? `${fmtEta(d.etaMinutes)} remaining`
        : d.status === "holdsafe"
        ? "Keeping safe hold"
        : d.status === "idle"
        ? "Ready to activate"
        : "Device not reachable";

    // Button configuration
    if (d.status === "defrosting") {
      els.primaryAction.textContent = "Cancel Defrost";
      els.primaryAction.classList.add("btn-primary--danger");
      els.primaryAction.disabled = false;
      els.hold.textContent = "Hold Safe";
      els.hold.disabled = false;
    } else if (d.status === "idle") {
      els.primaryAction.textContent = "Start Thaw";
      els.primaryAction.classList.remove("btn-primary--danger");
      els.primaryAction.disabled = false;
      els.hold.textContent = "Hold Safe";
      els.hold.disabled = true;
    } else if (d.status === "holdsafe") {
      els.primaryAction.textContent = "Resume Thaw";
      els.primaryAction.classList.remove("btn-primary--danger");
      els.primaryAction.disabled = false;
      els.hold.textContent = "Stop";
      els.hold.disabled = false;
    } else {
      els.primaryAction.textContent = "Reconnect";
      els.primaryAction.classList.remove("btn-primary--danger");
      els.primaryAction.disabled = false;
      els.hold.textContent = "Hold Safe";
      els.hold.disabled = true;
    }
  }

  function openDetail(id) {
    state.activeDetailId = id;
    renderDetail();
    els.dashboard.dataset.active = "false";
    els.dashboard.setAttribute("aria-hidden", "true");
    els.detail.dataset.active = "true";
    els.detail.setAttribute("aria-hidden", "false");
    els.detail.scrollTop = 0;
  }

  function closeDetail() {
    state.activeDetailId = null;
    els.detail.dataset.active = "false";
    els.detail.setAttribute("aria-hidden", "true");
    els.dashboard.dataset.active = "true";
    els.dashboard.setAttribute("aria-hidden", "false");
  }

  // ---------- Actions ----------
  function act(id, action) {
    const d = findDevice(id);
    if (!d) return;

    switch (action) {
      case "activate": {
        d.status = "defrosting";
        d.progress = 2;
        d.mode = "Precision Thaw";
        d.currentTemp = 34.5;
        d.targetTemp = 36.0;
        d.etaMinutes = 95;
        d.meatType = d.meatType || "Ground Beef";
        d.weight = d.weight || "1.0 lb";
        showToast(`${d.name} · Thaw started`);
        logActivity("flame", `${d.name} started Precision Thaw`);
        break;
      }
      case "stop": {
        d.status = "idle";
        d.progress = 0;
        d.etaMinutes = 0;
        d.mode = "Standby";
        showToast(`${d.name} · Defrost cancelled`);
        logActivity("check", `${d.name} defrost cancelled`);
        break;
      }
      case "resume": {
        d.status = "defrosting";
        d.progress = Math.max(50, d.progress);
        d.mode = "Precision Thaw";
        d.etaMinutes = 25;
        showToast(`${d.name} · Thaw resumed`);
        logActivity("flame", `${d.name} thaw resumed`);
        break;
      }
      case "holdsafe": {
        d.status = "holdsafe";
        d.progress = 100;
        d.etaMinutes = 0;
        d.mode = "Hold Safe";
        showToast(`${d.name} · Holding safe temperature`);
        logActivity("check", `${d.name} entered Hold Safe`);
        break;
      }
      case "reconnect": {
        d.status = "idle";
        d.connection = "online";
        d.mode = "Standby";
        d.currentTemp = 5.4;
        showToast(`${d.name} · Reconnected`);
        logActivity("check", `${d.name} came back online`);
        break;
      }
      case "open": {
        openDetail(id);
        return;
      }
    }
    renderSummary();
    renderDevices();
    if (state.activeDetailId === id) renderDetail();
  }

  // ---------- Simulation tick ----------
  function startSim() {
    clearInterval(state.simTickId);
    state.simTickId = setInterval(() => {
      let changed = false;
      state.devices.forEach((d) => {
        if (d.status === "defrosting") {
          // advance progress a little
          const bump = Math.random() * 1.6 + 0.2;
          d.progress = Math.min(100, +(d.progress + bump).toFixed(1));
          d.etaMinutes = Math.max(0, d.etaMinutes - 1);
          d.currentTemp = +(d.currentTemp + (Math.random() * 0.12 - 0.04)).toFixed(1);
          if (d.progress >= 100) {
            d.status = "holdsafe";
            d.progress = 100;
            d.mode = "Hold Safe";
            d.etaMinutes = 0;
            if (state.notifications) {
              showToast(`🔔 ${d.model} thaw complete`);
            }
            logActivity("check", `${d.name} thaw complete — holding safe`);
          }
          changed = true;
        } else if (d.status === "holdsafe") {
          d.currentTemp = +(d.currentTemp + (Math.random() * 0.06 - 0.03)).toFixed(1);
          changed = true;
        }
      });
      if (changed) {
        // lightweight: only update progress rings and temps without full rerender
        state.devices.forEach((d) => {
          const card = document.querySelector(`.card[data-id="${d.id}"]`);
          if (!card) return;
          if (d.status === "defrosting") {
            const mini = card.querySelector(".mini-ring");
            if (mini) {
              mini.style.setProperty("--pct", Math.round(d.progress));
              const v = mini.querySelector(".mini-ring__val");
              if (v) v.textContent = `${Math.round(d.progress)}%`;
            }
            const vals = card.querySelectorAll(".stat__val");
            if (vals[0]) vals[0].textContent = fmtTemp(d.currentTemp);
            if (vals[2]) vals[2].textContent = fmtEta(d.etaMinutes);
          }
        });
        if (state.activeDetailId) renderDetail();
        renderSummary();
        // if a device transitioned status, re-render cards to swap buttons/badges
        const transitioned = state.devices.some(
          (d) => d.status === "holdsafe" && d.progress === 100 && d.etaMinutes === 0
        );
        if (transitioned) {
          renderDevices();
        }
      }
    }, 1200);
  }

  // ---------- Event wiring ----------
  function wire() {
    els.list.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (btn) {
        e.stopPropagation();
        act(btn.dataset.id, btn.dataset.act);
        return;
      }
      const card = e.target.closest(".card");
      if (card) openDetail(card.dataset.id);
    });

    els.list.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("card")) {
        e.preventDefault();
        openDetail(e.target.dataset.id);
      }
    });

    els.back.addEventListener("click", closeDetail);

    els.primaryAction.addEventListener("click", () => {
      const d = findDevice(state.activeDetailId);
      if (!d) return;
      if (d.status === "defrosting") act(d.id, "stop");
      else if (d.status === "idle") act(d.id, "activate");
      else if (d.status === "holdsafe") act(d.id, "resume");
      else act(d.id, "reconnect");
    });

    els.hold.addEventListener("click", () => {
      const d = findDevice(state.activeDetailId);
      if (!d) return;
      if (d.status === "holdsafe") act(d.id, "stop");
      else if (d.status === "defrosting") act(d.id, "holdsafe");
    });

    els.notifBtn.addEventListener("click", () => {
      state.notifications = !state.notifications;
      els.notifDot.dataset.on = state.notifications ? "true" : "false";
      showToast(
        state.notifications ? "Notifications on" : "Notifications muted"
      );
    });

    $$(".bottom-nav__btn").forEach((b) => {
      b.addEventListener("click", () => {
        $$(".bottom-nav__btn").forEach((x) => x.classList.remove("is-active"));
        b.classList.add("is-active");
        if (b.dataset.nav !== "home") {
          showToast(
            `${b.dataset.nav.charAt(0).toUpperCase() + b.dataset.nav.slice(1)} coming soon`
          );
        }
      });
    });

    // Escape closes detail
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.detail.dataset.active === "true") {
        closeDetail();
      }
    });
  }

  // ---------- Init ----------
  function init() {
    els.notifDot.dataset.on = "true";
    renderSummary();
    renderDevices();
    renderActivity();
    wire();
    startSim();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
