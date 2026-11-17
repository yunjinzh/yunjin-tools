export function mountFallback(
  host,
  { onSelect = () => {}, onInteract = () => {} } = {},
) {
  host.classList.add("scene-fallback");
  host.innerHTML = `<svg class="fallback-car" viewBox="0 0 800 420" aria-label="可操作的新能源汽车教学结构图"><defs><linearGradient id="deck" x2="0" y2="1"><stop stop-color="#d5d8d1"/><stop offset="1" stop-color="#aeb5af"/></linearGradient><linearGradient id="module" x2="1" y2="1"><stop stop-color="#9ba9a4"/><stop offset="1" stop-color="#647d76"/></linearGradient><filter id="shadow"><feGaussianBlur stdDeviation="12"/></filter></defs><ellipse cx="420" cy="330" rx="270" ry="35" fill="#45534a" opacity=".12" filter="url(#shadow)"/><g transform="translate(80 20)"><g fill="#303b39" stroke="#62716a" stroke-width="8"><ellipse cx="170" cy="270" rx="30" ry="48" transform="rotate(-20 170 270)"/><ellipse cx="560" cy="175" rx="30" ry="48" transform="rotate(-20 560 175)"/><ellipse cx="355" cy="340" rx="30" ry="48" transform="rotate(-20 355 340)"/><ellipse cx="670" cy="233" rx="30" ry="48" transform="rotate(-20 670 233)"/></g><path d="M130 247 473 125 682 212 345 339Z" fill="url(#deck)" stroke="#808f87" stroke-width="3"/><path d="M150 239 475 125 669 205 342 321Z" fill="none" stroke="#596f64" stroke-width="9"/><g data-component="battery" tabindex="0" role="button" aria-label="选择动力电池包" class="svg-select"><path d="M238 224 460 146 575 197 353 278Z" fill="#384b45"/><g fill="url(#module)" stroke="#e5ece1" stroke-width="2">${Array.from(
    { length: 4 },
    (_, i) =>
      Array.from({ length: 3 }, (_, j) => {
        const x = 256 + i * 48 + j * 31,
          y = 221 - i * 17 + j * 14;
        return `<path d="M${x} ${y} l43 -15 26 12 -43 16Z"/>`;
      }).join(""),
  ).join(
    "",
  )}</g></g><g data-component="motor" tabindex="0" role="button" aria-label="选择驱动电机" class="svg-select"><path d="M548 220 590 205 633 225 593 242Z" fill="#78949a" stroke="#506b6e" stroke-width="2"/><path d="M548 220v28l44 22v-28m0 28 41-16v-29" fill="#57777d"/></g><g data-component="inverter" tabindex="0" role="button" aria-label="选择逆变器" class="svg-select"><path d="M532 195 574 180 618 199 575 216Z" fill="#bcc8bf" stroke="#7c9086" stroke-width="2"/></g><g data-component="bms" tabindex="0" role="button" aria-label="选择电池管理系统" class="svg-select"><path d="M368 171 417 154 447 168 398 186Z" fill="#56887a"/></g><g data-component="charge" tabindex="0" role="button" aria-label="选择充电组件" class="svg-select"><path d="M177 247 215 233 251 249 215 263Z" fill="#8f9d95" stroke="#5e7669" stroke-width="3"/></g><g data-component="interlock" tabindex="0" role="button" aria-label="选择互锁与隔离点" class="svg-select"><path d="M319 285 337 278 350 284 331 292Z" fill="#db8762" stroke="#ac603e" stroke-width="3"/></g><path d="M227 250 260 263 329 283 360 270 552 217" fill="none" stroke="#de8963" stroke-width="7"/><path d="M130 220 175 158 264 127 349 65 475 71 597 122 657 190" fill="none" stroke="#70877a" stroke-width="2" opacity=".3"/><path d="M175 158 388 244 657 157M349 65 388 244M475 71 505 199" fill="none" stroke="#70877a" stroke-width="2" opacity=".15"/></g></svg><div class="scene-fallback-caption">结构图模式 · 仍可选择部件并完成全部实训</div>`;
  let session = null,
    ui = {};
  const click = (e) => {
    const g = e.target.closest("[data-component]");
    if (g) onSelect(g.dataset.component);
  };
  const key = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      click(e);
    }
  };
  host.addEventListener("click", click);
  host.addEventListener("keydown", key);
  return {
    select: () => {},
    focus: () => {},
    explode: () => {},
    shell: () => {},
    thermal: () => {},
    cut: () => {},
    sync: (s, v) => {
      session = s;
      ui = v;
      host.dataset.source = "fallback";
    },
    dispose: () => {
      host.removeEventListener("click", click);
      host.removeEventListener("keydown", key);
      host.innerHTML = "";
    },
  };
}
