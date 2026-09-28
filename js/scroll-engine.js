(() => {
  const section = document.querySelector(".cinema-scroll");
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!section) return;

  const track = document.querySelector(".experiences-track");
  const sliderControls = document.querySelector(".slider-controls");
  const prevBtn = document.querySelector(".slider-prev");
  const nextBtn = document.querySelector(".slider-next");

  const EXPERIENCES = [
    {
      kicker: "Golden Hour",
      title: "Cliff Path Walk",
      body: "A fynbos-lined trail hugging the cliff edge, best walked at sunset.",
      img: "images/exp-cliff-path.jpg",
    },
    {
      kicker: "Low Tide",
      title: "The Tidal Pools",
      body: "Anemones, urchins, and mirror-still rockpools ten minutes from your door.",
      img: "images/exp-tidal-flat.jpg",
    },
    {
      kicker: "Harbour Light",
      title: "Old Harbour",
      body: "The town's original slipway and working boats, still in use today.",
      img: "images/exp-lighthouse.jpg",
    },
    {
      kicker: "Jun – Dec",
      title: "Whale-Watching Deck",
      body: "Southern Right whales breach close enough to hear from our private deck.",
      img: "images/exp-whale-tail.jpg",
    },
    {
      kicker: "Sundowners",
      title: "The Terrace",
      body: "Fynbos gin, ocean light, and the best sunset seat in Hermanus.",
      img: "images/exp-terrace.jpg",
    },
  ];

  let sliderCards = [];
  let originalCount = EXPERIENCES.length;
  let activeSlide = originalCount;

  function buildCard(exp, index) {
    const card = document.createElement("article");
    card.className = "experience-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${exp.title}`);
    card.dataset.slideIndex = String(index);
    card.innerHTML = `
      <img class="card-media" src="${exp.img}" alt="" loading="lazy" />
      <div class="card-scrim"></div>
      <div class="card-body">
        <span class="exp-kicker">${exp.kicker}</span>
        <h3>${exp.title}</h3>
        <p>${exp.body}</p>
      </div>
    `;
    return card;
  }

  function setupSlider() {
    if (!track) return;
    track.replaceChildren();
    const cards = [];
    for (let setIndex = 0; setIndex < 3; setIndex += 1) {
      EXPERIENCES.forEach((exp, cardIndex) => {
        const globalIndex = setIndex * originalCount + cardIndex;
        const card = buildCard(exp, globalIndex);
        card.addEventListener("click", () => selectSlide(card));
        card.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectSlide(card);
          }
        });
        track.appendChild(card);
        cards.push(card);
      });
    }
    sliderCards = cards;
    activeSlide = originalCount;
    track.addEventListener("transitionend", normalizeSlider);
    updateSlider();
  }

  function updateSlider() {
    if (!sliderCards.length) return;
    const cardWidth = sliderCards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    root.style.setProperty("--slider-shift", `${-(cardWidth + gap) * activeSlide}px`);
    sliderCards.forEach((card) => {
      card.classList.toggle("is-active", Number(card.dataset.slideIndex) === activeSlide);
    });
  }

  function moveSlider(direction) {
    activeSlide += direction;
    updateSlider();
  }

  function selectSlide(card) {
    const index = Number(card.dataset.slideIndex);
    if (Number.isFinite(index)) {
      activeSlide = index;
      updateSlider();
    }
  }

  function jumpSlider(index) {
    track.classList.add("is-jumping");
    activeSlide = index;
    updateSlider();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => track.classList.remove("is-jumping"));
    });
  }

  function normalizeSlider() {
    if (activeSlide >= originalCount * 2) {
      jumpSlider(activeSlide - originalCount);
    } else if (activeSlide < originalCount) {
      jumpSlider(activeSlide + originalCount);
    }
  }

  if (prevBtn) prevBtn.addEventListener("click", () => moveSlider(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => moveSlider(1));

  // ---- scroll/pointer engine ----

  function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
  }

  function smoothstep(edge0, edge1, value) {
    const x = clamp((value - edge0) / (edge1 - edge0));
    return x * x * (3 - 2 * x);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function segmentInOut(scroll, a, b, c, d) {
    const enter = smoothstep(a, b, scroll);
    const exit = smoothstep(c, d, scroll);
    return { enter, exit, active: enter * (1 - exit) };
  }

  function getScrollDistance() {
    const rect = section.getBoundingClientRect();
    return clamp(-rect.top, 0, section.offsetHeight - window.innerHeight);
  }

  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let targetScroll = 0;
  let smoothScroll = 0;
  let initialized = false;
  let rafPending = false;

  function requestTick() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(update);
  }

  function update() {
    rafPending = false;

    targetScroll = getScrollDistance();
    if (!initialized || reduceMotion.matches) {
      smoothScroll = targetScroll;
      initialized = true;
    } else {
      smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
    }
    if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

    mouseX = lerp(mouseX, targetMouseX, 0.12);
    mouseY = lerp(mouseY, targetMouseY, 0.12);

    const reveal = segmentInOut(smoothScroll, 560, 1000, 1500, 1800);
    const village = segmentInOut(smoothScroll, 1900, 2300, 2650, 2850);
    const progress = clamp(smoothScroll / 2850);
    const introExit = smoothstep(90, 650, smoothScroll);
    const sliderEnterRaw = smoothstep(2900, 3560, smoothScroll);
    const sliderEnter = Math.pow(sliderEnterRaw, 1.55);
    const sliderControlsEnter = smoothstep(3360, 3660, smoothScroll);

    const blurActive = clamp(reveal.active + village.active);
    const frame2Opacity = reveal.active * (1 - village.enter);
    const splitDrift = Math.pow(reveal.enter, 1.5);
    const panelCliffOpacity = reveal.active * (1 - reveal.exit);
    const panelVillageOpacity = village.active * (1 - village.exit);
    const backScale = 0.78 + progress * 0.2 + reveal.enter * 0.18 + village.enter * 0.14;
    const sharedHeroY = progress * -70;
    const sharedHeroScale = progress * 0.2;

    const mx = reduceMotion.matches ? 0 : mouseX;
    const my = reduceMotion.matches ? 0 : mouseY;

    const style = root.style;
    style.setProperty("--mx", mx.toFixed(4));
    style.setProperty("--my", my.toFixed(4));

    style.setProperty("--back-opacity", (1 - reveal.active * 0.06).toFixed(4));
    style.setProperty("--back-x", `${mx * -12}px`);
    style.setProperty("--back-y", `${my * -4}px`);
    style.setProperty("--back-scale", backScale.toFixed(4));
    style.setProperty("--back-blur", `${blurActive * 12}px`);
    style.setProperty("--back-brightness", (1 - blurActive * 0.22).toFixed(4));

    style.setProperty("--shade-opacity", "1");
    style.setProperty("--shade-z", reveal.active > 0.02 || village.active > 0.02 ? "2" : "0");
    style.setProperty("--shade-top-alpha", (blurActive * 0.4).toFixed(4));
    style.setProperty("--shade-mid-alpha", (blurActive * 0.35).toFixed(4));
    style.setProperty("--shade-bottom-alpha", (blurActive * 0.46).toFixed(4));

    style.setProperty("--title-y", `${introExit * -200}px`);
    style.setProperty("--title-scale", (1 - introExit * 0.08).toFixed(4));
    style.setProperty("--title-opacity", (1 - introExit).toFixed(4));

    style.setProperty("--focal-x", `calc(-50% + ${mx * 16}px)`);
    style.setProperty("--focal-y", `${my * 8 + sharedHeroY - reveal.exit * 680}px`);
    style.setProperty("--focal-bottom", `${6 - reveal.enter * 12}vh`);
    style.setProperty("--focal-width", `${58 + reveal.enter * 28}vw`);
    style.setProperty("--focal-scale", (1.02 + sharedHeroScale + reveal.exit * 0.4).toFixed(4));

    style.setProperty("--split-left-x", `calc(-50% + ${-splitDrift * 42}vw + ${mx * 20}px)`);
    style.setProperty("--split-left-y", `${my * 10 + sharedHeroY - splitDrift * 160}px`);
    style.setProperty("--split-left-scale", (1 + sharedHeroScale + reveal.enter * 0.6).toFixed(4));
    style.setProperty("--split-right-x", `calc(-50% + ${splitDrift * 42}vw + ${mx * 20}px)`);
    style.setProperty("--split-right-y", `${my * 10 + sharedHeroY - splitDrift * 160}px`);
    style.setProperty("--split-right-scale", (1 + sharedHeroScale + reveal.enter * 0.6).toFixed(4));

    style.setProperty("--frame2-opacity", frame2Opacity.toFixed(4));
    style.setProperty("--frame2-x", `calc(-50% + ${mx * 10}px)`);
    style.setProperty("--frame2-y", `calc(-50% + ${my * 8 - reveal.exit * 130}px)`);
    style.setProperty("--frame2-scale", (1.05 + reveal.enter * 0.08 + reveal.exit * 0.08).toFixed(4));

    style.setProperty("--intro-y", `${introExit * 84}px`);
    style.setProperty("--intro-opacity", (1 - introExit).toFixed(4));

    style.setProperty("--panel-cliff-opacity", panelCliffOpacity.toFixed(4));
    style.setProperty("--panel-cliff-y", `calc(-50% + ${-reveal.exit * 80 + (1 - reveal.enter) * 58}px)`);
    style.setProperty("--panel-village-opacity", panelVillageOpacity.toFixed(4));
    style.setProperty("--panel-village-y", `calc(-50% + ${-village.exit * 80 + (1 - village.enter) * 58}px)`);

    style.setProperty("--slider-opacity", sliderEnter.toFixed(4));
    style.setProperty("--slider-controls-opacity", sliderControlsEnter.toFixed(4));
    if (sliderControls) sliderControls.classList.toggle("is-ready", sliderControlsEnter > 0.98);
    style.setProperty("--slider-visibility", sliderEnter > 0.01 ? "visible" : "hidden");
    style.setProperty("--slider-enter-x", `${(1 - sliderEnter) * 420}vw`);
    style.setProperty("--slider-scale", (1 / backScale).toFixed(4));

    const sliderScreenTop = Math.min(220, Math.max(112, window.innerHeight * 0.19)) - 40;
    const sliderParentTop = window.innerHeight - (window.innerHeight - sliderScreenTop) / backScale;
    style.setProperty("--slider-top", `${sliderParentTop}px`);
    style.setProperty("--slider-screen-top", `${sliderScreenTop}px`);

    const scrollDelta = Math.abs(smoothScroll - targetScroll);
    const mouseDelta = Math.abs(mouseX - targetMouseX) + Math.abs(mouseY - targetMouseY);
    if (scrollDelta > 0.08 || mouseDelta > 0.001) requestTick();
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", () => {
    updateSlider();
    requestTick();
  });
  window.addEventListener(
    "pointermove",
    (event) => {
      targetMouseX = event.clientX / window.innerWidth - 0.5;
      targetMouseY = event.clientY / window.innerHeight - 0.5;
      requestTick();
    },
    { passive: true }
  );

  setupSlider();
  requestTick();
})();
