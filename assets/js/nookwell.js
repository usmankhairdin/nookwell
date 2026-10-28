/* Nookwell. Shared accessible mechanics adapted from Taskline Lite; see licenses/Taskline-MIT.txt. */
(() => {
  "use strict";
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const desktopInput = matchMedia("(hover: hover) and (pointer: fine)");
  const menuBreakpoint = matchMedia("(min-width: 900px)");
  const main = document.getElementById("main");
  const footer = document.getElementById("site-footer");
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("mobile-menu");
  const menuScroll = document.getElementById("menu-scroll");
  let dialogSmooth, dialogBar;
  let pageSmooth,
    menuSmooth,
    menuOpen = false,
    menuClosing = false;
  let menuTimer,
    menuRevision = 0,
    lockY = 0,
    locked = false,
    savedOverflow = "";
  let pageBar, menuBar;

  // All active Lenis regions share this one millisecond animation clock.
  const scrollers = new Set();
  let clock = 0;
  function tick(time) {
    for (const scroller of scrollers) scroller.raf(time);
    clock = scrollers.size ? requestAnimationFrame(tick) : 0;
  }
  function register(scroller) {
    scrollers.add(scroller);
    if (!clock) clock = requestAnimationFrame(tick);
    return scroller;
  }
  function destroy(scroller) {
    if (!scroller) return;
    scrollers.delete(scroller);
    scroller.destroy();
    if (!scrollers.size && clock) {
      cancelAnimationFrame(clock);
      clock = 0;
    }
  }
  function smoothFor(wrapper) {
    if (
      reduced.matches ||
      !desktopInput.matches ||
      typeof window.Lenis !== "function"
    )
      return;
    try {
      return register(
        new window.Lenis({
          ...(wrapper ? { wrapper, content: wrapper.firstElementChild } : {}),
          autoRaf: false,
          smoothWheel: true,
          syncTouch: false,
          lerp: 0.12,
          anchors: false,
          prevent: (node) =>
            node.closest?.(".scroll-rail") ||
            node.closest?.("textarea,input,[contenteditable=true]") ||
            (!wrapper && node.closest?.("#mobile-menu, #property-dialog")),
        }),
      );
    } catch {
      return undefined;
    }
  }
  function configureMotion() {
    destroy(pageSmooth);
    destroy(menuSmooth);
    destroy(dialogSmooth);
    dialogSmooth = document.getElementById("property-dialog")?.open
      ? smoothFor(document.getElementById("dialog-scroll"))
      : undefined;
    pageSmooth = smoothFor();
    menuSmooth = menuOpen ? smoothFor(menuScroll) : undefined;
    if (locked) pageSmooth?.stop();
  }
  configureMotion();
  reduced.addEventListener("change", configureMotion);
  desktopInput.addEventListener("change", configureMotion);

  function focusTarget(target) {
    if (target && !target.matches("a,button,input,textarea,summary,[tabindex]"))
      target.tabIndex = -1;
    target?.focus({ preventScroll: true });
  }
  function goTo(hash, focusAfter) {
    let target;
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return;
    }
    if (!target) return;
    if (location.hash !== hash) history.pushState(null, "", hash);
    if (pageSmooth && !reduced.matches) {
      pageSmooth.scrollTo(target, {
        duration: 0.8,
        onComplete: () => focusTarget(focusAfter || target),
      });
    } else {
      target.scrollIntoView({
        block: "start",
        behavior: reduced.matches ? "instant" : "smooth",
      });
      focusTarget(focusAfter || target);
    }
  }

  // A replacement is installed only after its geometry and handlers exist.
  function installScrollbar(region, label, host) {
    const page = region === window;
    const rail = document.createElement("div");
    rail.className = "scroll-rail" + (page ? "" : " scroll-rail--local");
    const thumb = document.createElement("div");
    thumb.className = "scroll-thumb";
    thumb.setAttribute("role", "scrollbar");
    thumb.setAttribute("aria-label", label);
    thumb.setAttribute("aria-orientation", "vertical");
    thumb.setAttribute("aria-controls", page ? "page-scroll" : region.id);
    thumb.setAttribute("aria-valuemin", "0");
    thumb.tabIndex = 0;
    rail.append(thumb);
    host.append(rail);
    let idle,
      max = 0,
      travel = 0,
      grab = 0,
      dragging = false;
    const current = () => (page ? window.scrollY : region.scrollTop);
    function activity() {
      rail.classList.add("is-active");
      clearTimeout(idle);
      idle = setTimeout(() => rail.classList.remove("is-active"), 1000);
    }
    function update() {
      const viewport = page ? innerHeight : region.clientHeight;
      const total = page
        ? Math.max(root.scrollHeight, document.body.scrollHeight)
        : region.scrollHeight;
      max = Math.max(0, total - viewport);
      rail.hidden =
        max <= 1 ||
        (page && locked) ||
        (!page &&
          (!!region.closest("[hidden]") ||
            (!!region.closest("dialog") && !region.closest("dialog").open)));
      if (rail.hidden) {
        thumb.tabIndex = -1;
        return;
      }
      thumb.tabIndex = 0;
      const track = rail.clientHeight;
      const size = Math.min(track, Math.max(28, (track * viewport) / total));
      travel = Math.max(0, track - size);
      thumb.style.height = size + "px";
      thumb.style.transform = `translateY(${max ? Math.min(1, current() / max) * travel : 0}px)`;
      thumb.setAttribute("aria-valuemax", String(Math.round(max)));
      thumb.setAttribute(
        "aria-valuenow",
        String(Math.round(Math.min(max, Math.max(0, current())))),
      );
      thumb.setAttribute(
        "aria-valuetext",
        `${max ? Math.round((current() / max) * 100) : 0}%`,
      );
    }
    function setScroll(value) {
      const next = Math.max(0, Math.min(max, value));
      const smooth = page
        ? pageSmooth
        : region.id === "menu-scroll"
          ? menuSmooth
          : dialogSmooth;
      if (smooth) smooth.scrollTo(next, { immediate: true, force: true });
      else if (page) window.scrollTo({ top: next, behavior: "instant" });
      else region.scrollTop = next;
      update();
      activity();
    }
    thumb.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      focusTarget(thumb);
      update();
      grab = event.clientY - thumb.getBoundingClientRect().top;
      dragging = true;
      rail.classList.add("is-dragging");
      thumb.setPointerCapture(event.pointerId);
      activity();
    });
    thumb.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const y = event.clientY - rail.getBoundingClientRect().top - grab;
      setScroll(travel ? (y / travel) * max : 0);
    });
    const endDrag = () => {
      dragging = false;
      rail.classList.remove("is-dragging");
      activity();
    };
    thumb.addEventListener("pointerup", endDrag);
    thumb.addEventListener("pointercancel", endDrag);
    thumb.addEventListener("lostpointercapture", endDrag);
    thumb.addEventListener("keydown", (event) => {
      const viewport = page ? innerHeight : region.clientHeight;
      const delta = {
        ArrowUp: -40,
        ArrowDown: 40,
        PageUp: -viewport * 0.85,
        PageDown: viewport * 0.85,
      };
      if (event.key in delta || event.key === "Home" || event.key === "End") {
        event.preventDefault();
        setScroll(
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? max
              : current() + delta[event.key],
        );
      }
    });
    region.addEventListener(
      "scroll",
      () => {
        update();
        activity();
      },
      { passive: true },
    );
    window.addEventListener("resize", update, { passive: true });
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(update);
      observer.observe(page ? document.body : region.firstElementChild);
    }
    update();
    (page ? root : region).classList.add(
      page ? "has-page-scrollbar" : "has-local-scrollbar",
    );
    return { update };
  }
  try {
    pageBar = installScrollbar(window, "Page scroll", document.body);
  } catch {
    root.classList.remove("has-page-scrollbar");
  }
  try {
    menuBar = installScrollbar(menuScroll, "Navigation scroll", panel);
  } catch {
    menuScroll.classList.remove("has-local-scrollbar");
  }

  function lockBackground() {
    if (locked) return;
    locked = true;
    lockY = window.scrollY;
    savedOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    pageSmooth?.stop();
    main.inert = true;
    footer.inert = true;
    pageBar?.update();
  }
  function unlockBackground() {
    root.style.overflow = savedOverflow;
    main.inert = false;
    footer.inert = false;
    locked = false;
    // No fixed-body layout substitution: native scroll position stays intact.
    if (Math.abs(window.scrollY - lockY) > 1)
      window.scrollTo({ top: lockY, behavior: "instant" });
    pageSmooth?.start();
    pageBar?.update();
  }
  function openMenu() {
    clearTimeout(menuTimer);
    ++menuRevision;
    menuOpen = true;
    menuClosing = false;
    panel.hidden = false;
    panel.inert = false;
    panel.classList.remove("is-closing");
    lockBackground();
    // Commit the offscreen start state before the reversible CSS transition.
    panel.getBoundingClientRect();
    root.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation");
    destroy(menuSmooth);
    menuSmooth = smoothFor(menuScroll);
    menuBar?.update();
    focusTarget(panel.querySelector("nav a"));
  }
  function closeMenu(after, immediate = false) {
    if (!menuOpen && !menuClosing) {
      after?.();
      return;
    }
    clearTimeout(menuTimer);
    const revision = ++menuRevision;
    menuOpen = false;
    menuClosing = true;
    panel.classList.add("is-closing");
    panel.inert = true;
    root.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    const finish = () => {
      if (revision !== menuRevision) return;
      menuClosing = false;
      panel.hidden = true;
      panel.classList.remove("is-closing");
      destroy(menuSmooth);
      menuSmooth = undefined;
      unlockBackground();
      menuBar?.update();
      if (after) after();
      else
        focusTarget(
          toggle.offsetParent
            ? toggle
            : document.querySelector(".primary-nav a"),
        );
    };
    if (immediate || reduced.matches) finish();
    else menuTimer = setTimeout(finish, 280);
  }
  toggle.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
  document.addEventListener("keydown", (event) => {
    if (!menuOpen && !menuClosing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key === "Tab") {
      const controls = [
        toggle,
        ...panel.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex="0"]',
        ),
      ];
      const at = controls.indexOf(document.activeElement);
      if (event.shiftKey && at <= 0) {
        event.preventDefault();
        focusTarget(controls.at(-1));
      } else if (!event.shiftKey && (at === controls.length - 1 || at < 0)) {
        event.preventDefault();
        focusTarget(toggle);
      }
    }
  });
  menuBreakpoint.addEventListener("change", () => {
    if (menuBreakpoint.matches) closeMenu(null, true);
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (
      !link ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    event.preventDefault();
    if (panel.contains(link)) closeMenu(() => goTo(hash));
    else goTo(hash);
  });
  // Native keyboard/drag input interrupts any in-flight eased page travel.
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        locked ||
        ![
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
        ].includes(event.key) ||
        event.target.closest("input,textarea,button,summary,[role=scrollbar]")
      )
        return;
      pageSmooth?.scrollTo(window.scrollY, { immediate: true });
    },
    true,
  );
  toggle.hidden = false;
  root.classList.add("enhanced");

  document.querySelectorAll(".faq-item").forEach((details) => {
    const summary = details.querySelector("summary");
    const answer = details.querySelector(".faq-answer");
    if (!details.animate) return;
    let expanded = details.open,
      animation,
      revision = 0;
    function change(next) {
      const version = ++revision;
      const start = details.getBoundingClientRect().height;
      animation?.cancel();
      animation = undefined;
      expanded = next;
      details.open = true;
      details.dataset.expanded = String(next);
      details.style.height = "auto";
      const border =
        parseFloat(getComputedStyle(details).borderBottomWidth) || 0;
      const end = next
        ? details.getBoundingClientRect().height
        : summary.getBoundingClientRect().height + border;
      if (reduced.matches) {
        details.open = next;
        details.style.height = "";
        details.style.overflow = "";
        return;
      }
      details.style.height = start + "px";
      details.style.overflow = "hidden";
      animation = details.animate(
        [{ height: start + "px" }, { height: end + "px" }],
        {
          duration: Math.min(240, 180 + Math.abs(end - start) * 0.15),
          easing: "cubic-bezier(.22,.61,.36,1)",
          fill: "both",
        },
      );
      animation.onfinish = () => {
        if (version !== revision) return;
        details.open = expanded;
        details.style.height = "";
        details.style.overflow = "";
        animation?.cancel();
        animation = undefined;
      };
    }
    summary.addEventListener("click", (event) => {
      event.preventDefault();
      change(!expanded);
    });
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => {
        if (animation) change(expanded);
      });
      observer.observe(answer);
      observer.observe(summary);
    }
    reduced.addEventListener("change", () => {
      if (animation) change(expanded);
    });
  });
  document.fonts?.ready.then(() => {
    pageBar?.update();
    menuBar?.update();
  });
  // Deep links work after fonts/layout settle, without a decorative entrance.
  window.addEventListener("load", () => {
    if (location.hash && location.hash !== "#top") {
      let target;
      try {
        target = document.getElementById(
          decodeURIComponent(location.hash.slice(1)),
        );
      } catch {
        return;
      }
      if (target) {
        if (pageSmooth) pageSmooth.scrollTo(target, { immediate: true });
        else target.scrollIntoView({ block: "start", behavior: "instant" });
      }
    }
  });
  // Listing data stays local. Replace these sample entries with your own homes.
  const homes = {
    courtyard: {
      title: "The courtyard house",
      area: "Brookside",
      address: "18 Willow Lane",
      price: "$685,000",
      type: "For sale",
      image: "assets/img/hero.webp",
      alt: "Modern courtyard home with garden and open glass walls",
      specs: ["3 bedrooms", "2 bathrooms", "1,850 sq ft"],
      description:
        "Big windows, quiet corners and a courtyard that brings the outside in. An open-plan ground floor makes room for slow mornings, dinner with friends and everything in between.",
    },
    garden: {
      title: "The garden home",
      area: "North Quarter",
      address: "42 Maple Avenue",
      price: "$525,000",
      type: "For sale",
      image: "assets/img/garden-home.webp",
      alt: "Detached residential home surrounded by a front lawn and garden",
      specs: ["4 bedrooms", "2 bathrooms", "2,100 sq ft"],
      description:
        "A welcoming place with space to grow. Four comfortable bedrooms, a generous garden and everyday essentials a little closer to home. A fresh start with familiar comforts.",
    },
    riverside: {
      title: "The light-filled retreat",
      area: "Riverside",
      address: "7 River Walk",
      price: "$2,400 / month",
      type: "To rent",
      image: "assets/img/courtyard.webp",
      alt: "Bright contemporary home with glass walls and landscaped outdoor space",
      specs: ["2 bedrooms", "2 bathrooms", "1,240 sq ft"],
      description:
        "Clean lines, soft daylight and a place to pause. This two-bedroom rental pairs easy everyday living with room to breathe. A considered starting point for your next chapter.",
    },
  };
  let type = "all",
    area = "all",
    saved = new Set();
  try {
    const value = JSON.parse(localStorage.getItem("nookwell-saved") || "[]");
    if (Array.isArray(value))
      saved = new Set(value.filter((key) => Object.hasOwn(homes, key)));
  } catch {}
  const cards = [...document.querySelectorAll(".property-card")];
  function filterHomes() {
    let count = 0;
    cards.forEach((card) => {
      const visible =
        (type === "all" || card.dataset.type === type) &&
        (area === "all" || card.dataset.area === area);
      card.hidden = !visible;
      if (visible) count++;
    });
    document
      .querySelectorAll("[data-type][aria-pressed]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.type === type),
        ),
      );
    document
      .querySelectorAll("[data-area][aria-pressed]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.area === area),
        ),
      );
    document.getElementById("result-count").textContent =
      `${count} sample ${count === 1 ? "home" : "homes"} to explore`;
    document.getElementById("empty-state").hidden = count !== 0;
    pageSmooth?.resize();
    pageBar?.update();
  }
  document.getElementById("listing-filters").hidden = false;
  document.querySelectorAll("[data-type][aria-pressed]").forEach((button) =>
    button.addEventListener("click", () => {
      type = button.dataset.type;
      filterHomes();
    }),
  );
  document.querySelectorAll("[data-area][aria-pressed]").forEach((button) =>
    button.addEventListener("click", () => {
      area = button.dataset.area;
      filterHomes();
    }),
  );
  document.getElementById("reset-filters").addEventListener("click", () => {
    type = area = "all";
    filterHomes();
    focusTarget(document.querySelector('[data-type="all"][aria-pressed]'));
  });
  document.querySelectorAll("[data-neighborhood]").forEach((link) =>
    link.addEventListener("click", () => {
      type = "all";
      area = link.dataset.neighborhood;
      filterHomes();
    }),
  );
  function renderSaved() {
    document.querySelectorAll("[data-save]").forEach((button) => {
      const key = button.dataset.save,
        has = saved.has(key);
      button.hidden = false;
      button.setAttribute("aria-pressed", String(has));
      button.setAttribute(
        "aria-label",
        `${has ? "Unsave" : "Save"} ${homes[key].title}`,
      );
    });
  }
  renderSaved();
  document.querySelectorAll("[data-save]").forEach((button) =>
    button.addEventListener("click", () => {
      const key = button.dataset.save;
      if (saved.has(key)) saved.delete(key);
      else saved.add(key);
      try {
        localStorage.setItem("nookwell-saved", JSON.stringify([...saved]));
      } catch {}
      renderSaved();
      document.getElementById("save-status").textContent =
        `${homes[key].title} ${saved.has(key) ? "saved in this browser" : "removed from saved homes"}.`;
    }),
  );
  const dialog = document.getElementById("property-dialog"),
    dialogScroll = document.getElementById("dialog-scroll");
  let activeHome,
    returnFocus,
    afterPropertyClose,
    closingProperty = false;
  function closeProperty(after) {
    if (!dialog.open || closingProperty) return;
    afterPropertyClose = typeof after === "function" ? after : undefined;
    closingProperty = true;
    if (reduced.matches || !dialog.animate) dialog.close();
    else
      dialog
        .animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 160,
          easing: "ease-out",
        })
        .finished.then(() => dialog.close());
  }
  if (typeof dialog.showModal === "function") {
    document.addEventListener(
      "click",
      (event) => {
        const action = event.target.closest("[data-property]");
        if (
          !action ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const home = homes[action.dataset.property];
        if (!home) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        activeHome = home;
        returnFocus = action;
        document.getElementById("dialog-title").textContent = home.title;
        document.getElementById("dialog-area").textContent =
          `${home.area} · ${home.address} · ${home.type}`;
        document.getElementById("dialog-price").textContent = home.price;
        document.getElementById("dialog-description").textContent =
          home.description;
        const image = document.getElementById("dialog-image");
        image.src = home.image;
        image.alt = home.alt;
        const specs = document.getElementById("dialog-specs");
        specs.replaceChildren(
          ...home.specs.map((text) => {
            const li = document.createElement("li");
            li.textContent = text;
            return li;
          }),
        );
        dialog.showModal();
        dialogScroll.scrollTop = 0;
        lockBackground();
        destroy(dialogSmooth);
        dialogSmooth = smoothFor(dialogScroll);
        if (!dialogBar)
          dialogBar = installScrollbar(
            dialogScroll,
            "Property details scroll",
            dialog,
          );
        dialogBar.update();
        focusTarget(dialog.querySelector(".dialog-close"));
      },
      true,
    );
    dialog
      .querySelector(".dialog-close")
      .addEventListener("click", closeProperty);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeProperty();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          closeProperty();
      }
    });
    dialog.addEventListener("close", () => {
      destroy(dialogSmooth);
      dialogSmooth = undefined;
      closingProperty = false;
      unlockBackground();
      dialogBar?.update();
      const after = afterPropertyClose;
      afterPropertyClose = undefined;
      if (after) after();
      else focusTarget(returnFocus);
    });
    document.getElementById("ask-property").addEventListener("click", () => {
      document.getElementById("enquiry-message").value =
        `I'd like to know more about ${activeHome.title} in ${activeHome.area}.\n\n`;
      closeProperty(() => {
        goTo("#contact", document.getElementById("enquiry-message"));
      });
    });
  }
  const form = document.getElementById("enquiry-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form),
      name = String(data.get("name")).trim(),
      email = String(data.get("email")).trim(),
      message = String(data.get("message")).trim();
    if (!name || !message) {
      const field = form.elements[!name ? "name" : "message"];
      field.setCustomValidity("Please add a little more detail.");
      field.reportValidity();
      field.addEventListener("input", () => field.setCustomValidity(""), {
        once: true,
      });
      return;
    }
    const draft = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    document.getElementById("draft-text").value = draft;
    document.getElementById("open-email").href =
      `mailto:hello@nookwell.example?subject=${encodeURIComponent("A new home enquiry from " + name)}&body=${encodeURIComponent(draft)}`;
    document.getElementById("draft-result").hidden = false;
    document.getElementById("copy-status").textContent = "";
    focusTarget(document.getElementById("draft-result"));
    pageBar?.update();
  });
  document.getElementById("copy-draft").addEventListener("click", async () => {
    const field = document.getElementById("draft-text");
    try {
      await navigator.clipboard.writeText(field.value);
      document.getElementById("copy-status").textContent =
        "Draft copied. Nothing has been sent.";
    } catch {
      field.focus();
      field.select();
      document.getElementById("copy-status").textContent =
        "Select and copy the draft above with your keyboard.";
    }
  });
  const header = document.getElementById("site-header");
  function headerState() {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", headerState, { passive: true });
  headerState();
})();
