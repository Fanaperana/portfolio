<!--
  Subtle animated backdrop for the hero. Intentionally lightweight:
    · A drifting dotted grid (CSS background)
    · Two aurora blobs (filter blur + slow translate)
    · An SVG circuit with a dashed "flowing" trace
    · A single scan line sweeping down

  All of it is purely decorative — `aria-hidden`, `pointer-events: none`,
  and fully disabled under `prefers-reduced-motion: reduce`.
-->
<div
  class="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
  aria-hidden="true"
>
  <!-- Aurora blobs -->
  <div
    class="animate-aurora absolute -top-32 -left-24 h-[32rem] w-[32rem] rounded-full opacity-40 blur-3xl"
    style="background: radial-gradient(closest-side, var(--color-accent-soft), transparent 70%);"
  ></div>
  <div
    class="animate-aurora absolute -right-32 top-24 h-[28rem] w-[28rem] rounded-full opacity-30 blur-3xl"
    style="background: radial-gradient(closest-side, #7e14ff33, transparent 70%); animation-delay: -6s;"
  ></div>

  <!-- Drifting dotted grid -->
  <div
    class="animate-grid-drift absolute inset-0 opacity-[0.18]"
    style="
      background-image:
        radial-gradient(var(--color-border) 1px, transparent 1px),
        radial-gradient(var(--color-border) 1px, transparent 1px);
      background-size: 24px 24px, 24px 24px;
      background-position: 0 0, 12px 12px;
      mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
    "
  ></div>

  <!-- Circuit SVG with dashed flowing trace + quiet nodes -->
  <svg
    class="absolute inset-0 h-full w-full opacity-[0.35]"
    viewBox="0 0 1200 600"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="wire" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="var(--color-accent)" stop-opacity="0" />
        <stop
          offset="50%"
          stop-color="var(--color-accent)"
          stop-opacity="0.9"
        />
        <stop offset="100%" stop-color="var(--color-link)" stop-opacity="0" />
      </linearGradient>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.6" />
      </filter>
    </defs>

    <!-- Base static trace: an L-shaped pipe that feels like it's routing signal. -->
    <path
      d="M0,120 L260,120 L300,160 L620,160 L660,120 L1200,120"
      fill="none"
      stroke="var(--color-border)"
      stroke-width="1"
      opacity="0.8"
    />
    <path
      d="M0,480 L180,480 L220,440 L520,440 L560,480 L940,480 L980,440 L1200,440"
      fill="none"
      stroke="var(--color-border)"
      stroke-width="1"
      opacity="0.8"
    />

    <!-- Flowing dashed trace overlaid on the top pipe. -->
    <path
      class="animate-dash"
      d="M0,120 L260,120 L300,160 L620,160 L660,120 L1200,120"
      fill="none"
      stroke="url(#wire)"
      stroke-width="1.25"
      stroke-dasharray="6 14"
      filter="url(#soft)"
    />
    <path
      class="animate-dash"
      style="animation-duration: 18s; animation-direction: reverse;"
      d="M0,480 L180,480 L220,440 L520,440 L560,480 L940,480 L980,440 L1200,440"
      fill="none"
      stroke="url(#wire)"
      stroke-width="1.25"
      stroke-dasharray="4 18"
      filter="url(#soft)"
    />

    <!-- Quiet "nodes" along the traces. -->
    {#each [{ x: 260, y: 120 }, { x: 620, y: 160 }, { x: 1000, y: 120 }, { x: 220, y: 440 }, { x: 560, y: 480 }, { x: 940, y: 480 }] as p, i (i)}
      <circle
        cx={p.x}
        cy={p.y}
        r="2.5"
        fill="var(--color-accent)"
        class="animate-twinkle"
        style={`animation-delay: ${(i * 0.4).toFixed(2)}s;`}
      />
    {/each}
  </svg>

  <!-- Single slow scan line. -->
  <div
    class="animate-scan absolute left-0 right-0 h-px"
    style="background: linear-gradient(90deg, transparent, var(--color-accent-soft), transparent);"
  ></div>
</div>
