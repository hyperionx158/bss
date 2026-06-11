// ====================================================
// BSS CHEAT PANEL  —  press ` to toggle
// Add as a <script src="cheatPanel.js"></script> tag
// at the bottom of index.html, before </body>
// ====================================================

(function () {

    const RESOURCE_ITEMS = [
        'treat','strawberry','blueberry','pineapple','sunflowerSeed',
        'royalJelly','stinger','microConverter','honeysuckle','whirligig',
        'jellyBeans','glitter','cloudVial','antPass','roboPass',
        'softWax','causticWax','swirledWax','smoothWax',
        'basicEgg','rareEgg','epicEgg','legendaryEgg','mythicEgg',
        'oil','enzymes','superSmoothie','starJelly','gummyBlob','ticket','glue',
    ]

    const GIVE_AMOUNT = 9999

    // ── Wait for game to be ready before doing anything ──────────────────
    function ready(cb) {
        if (window.player && window.items) return cb()
        setTimeout(() => ready(cb), 500)
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    // Always grab fresh references — never cache them at startup
    function p()    { return window.player }
    function itm()  { return window.items  }

    function act(fn) {
        // Wraps every button action: checks game is ready, runs fn, then refreshes UI
        ready(() => {
            fn()
            if (p() && p().updateInventory) p().updateInventory()
            updateDisplays()
        })
    }

    function giveItem(name, amount) {
        const items = itm()
        if (items && items[name] !== undefined) {
            items[name].amount = (items[name].amount || 0) + amount
            return true
        }
        return false
    }

    // ── Build panel DOM ───────────────────────────────────────────────────
    const style = document.createElement('style')
    style.textContent = `
        #bssPanel {
            position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
            z-index:99999;background:rgba(20,12,0,0.95);border:2px solid #f5a623;
            border-radius:12px;padding:18px 22px;min-width:330px;
            font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#fff;
            box-shadow:0 8px 40px #0009;display:none;
        }
        #bssPanel h2 {
            margin:0 0 14px;font-size:16px;color:#f5a623;display:flex;
            justify-content:space-between;align-items:center;
        }
        #bssPanel .section { margin-bottom:12px; }
        #bssPanel .label {
            color:#f5a623;font-weight:600;margin-bottom:6px;font-size:12px;
        }
        #bssPanel .sub { color:#ffd;font-weight:400;margin-left:8px; }
        #bssPanel .row { display:flex;gap:6px;flex-wrap:wrap;align-items:center; }
        .bssBtn {
            background:#7a4a00;border:none;border-radius:7px;
            color:#fff;padding:5px 11px;cursor:pointer;font-size:12px;
        }
        .bssBtn:hover { background:#f5a623;color:#111; }
        .bssBtn.red { background:#5a1a1a; }
        .bssBtn.red:hover { background:#c0392b; }
        #bssAutoAmt {
            width:120px;background:#2a1a00;border:1px solid #f5a623;
            border-radius:6px;color:#fff;padding:4px 6px;font-size:12px;
        }
        #bssPanel .hint {
            margin-top:12px;font-size:10px;color:#666;text-align:center;
        }
        #bssStatus {
            background:#1a3a1a;border-radius:6px;padding:5px 8px;
            font-size:11px;color:#7f7;margin-bottom:10px;min-height:20px;
        }
    `
    document.head.appendChild(style)

    const panel = document.createElement('div')
    panel.id = 'bssPanel'
    panel.innerHTML = `
        <h2>🍯 BSS Cheat Panel <span id="bssClose" style="cursor:pointer;color:#aaa;font-size:18px">✕</span></h2>
        <div id="bssStatus">Waiting for game to load…</div>

        <div class="section">
            <div class="label">Honey</div>
            <div class="row">
                <button class="bssBtn" id="bssH1M">+1M</button>
                <button class="bssBtn" id="bssH1B">+1B</button>
                <button class="bssBtn" id="bssH1T">+1T</button>
                <button class="bssBtn" id="bssHMax">Set 999T</button>
                <button class="bssBtn red" id="bssHZero">Zero</button>
            </div>
        </div>

        <div class="section">
            <div class="label">Honey/Pollen Rate <span class="sub" id="bssHppVal"></span></div>
            <div class="row">
                <button class="bssBtn" id="bssHpp2">×2</button>
                <button class="bssBtn" id="bssHpp10">×10</button>
                <button class="bssBtn" id="bssHpp100">×100</button>
                <button class="bssBtn" id="bssHppSet">Set…</button>
                <button class="bssBtn red" id="bssHppReset">Reset</button>
            </div>
        </div>

        <div class="section">
            <div class="label">Pollen <span class="sub" id="bssCapVal"></span></div>
            <div class="row">
                <button class="bssBtn" id="bssPolFill">Fill bag</button>
                <button class="bssBtn" id="bssPolConvert">Convert all → Honey</button>
                <button class="bssBtn" id="bssCap10">Cap ×10</button>
                <button class="bssBtn" id="bssCapMax">Cap 999B</button>
            </div>
        </div>

        <div class="section">
            <div class="label">Items</div>
            <div class="row">
                <button class="bssBtn" id="bssGiveAll">Give all ×${GIVE_AMOUNT}</button>
                <button class="bssBtn" id="bssGiveCustom">Give custom…</button>
            </div>
        </div>

        <div class="section">
            <div class="label">Auto Honey (per second)</div>
            <div class="row">
                <button class="bssBtn" id="bssAutoToggle">▶ Start</button>
                <input id="bssAutoAmt" type="number" value="1000000000" step="1000000">
            </div>
        </div>

        <div class="hint">Press <kbd style="background:#333;padding:1px 5px;border-radius:3px">\`</kbd> to toggle</div>
    `
    document.body.appendChild(panel)

    // ── Status display ────────────────────────────────────────────────────
    function setStatus(msg, color) {
        const el = document.getElementById('bssStatus')
        if (el) { el.textContent = msg; el.style.color = color || '#7f7' }
    }

    function updateDisplays() {
        const pl = p()
        if (!pl) { setStatus('Game not loaded yet…', '#fa0'); return }
        setStatus(
            'Honey: ' + Math.round(pl.honey).toLocaleString() +
            '  |  Pollen: ' + Math.round(pl.pollen||0).toLocaleString(),
            '#7f7'
        )
        const hpp = document.getElementById('bssHppVal')
        const cap = document.getElementById('bssCapVal')
        if (hpp) hpp.textContent = '(' + (pl.honeyPerPollen||0).toFixed(2) + 'x)'
        if (cap) cap.textContent = '(cap: ' + Math.round(pl.capacity||0).toLocaleString() + ')'
    }

    // Poll until game loads, then update the status bar
    function pollReady() {
        if (window.player && window.items) {
            updateDisplays()
        } else {
            setTimeout(pollReady, 500)
        }
    }
    pollReady()

    // ── Button wiring ─────────────────────────────────────────────────────
    document.getElementById('bssClose').onclick = () => panel.style.display = 'none'

    // Honey
    document.getElementById('bssH1M').onclick    = () => act(() => p().honey += 1e6)
    document.getElementById('bssH1B').onclick    = () => act(() => p().honey += 1e9)
    document.getElementById('bssH1T').onclick    = () => act(() => p().honey += 1e12)
    document.getElementById('bssHMax').onclick   = () => act(() => p().honey = 999e12)
    document.getElementById('bssHZero').onclick  = () => act(() => p().honey = 0)

    // Honey per pollen
    document.getElementById('bssHpp2').onclick   = () => act(() => p().honeyPerPollen *= 2)
    document.getElementById('bssHpp10').onclick  = () => act(() => p().honeyPerPollen *= 10)
    document.getElementById('bssHpp100').onclick = () => act(() => p().honeyPerPollen *= 100)
    document.getElementById('bssHppReset').onclick = () => act(() => p().honeyPerPollen = 1)
    document.getElementById('bssHppSet').onclick = () => {
        const v = parseFloat(prompt('Set honeyPerPollen to:', p() ? p().honeyPerPollen : 1))
        if (!isNaN(v)) act(() => p().honeyPerPollen = v)
    }

    // Pollen / capacity
    document.getElementById('bssPolFill').onclick    = () => act(() => p().pollen = p().capacity || 1e6)
    document.getElementById('bssPolConvert').onclick = () => act(() => {
        if (p().pollen > 0) {
            p().honey += Math.ceil(p().pollen * p().honeyPerPollen)
            p().pollen = 0
        }
    })
    document.getElementById('bssCap10').onclick  = () => act(() => p().capacity *= 10)
    document.getElementById('bssCapMax').onclick = () => act(() => p().capacity = 999e9)

    // Give all items
    document.getElementById('bssGiveAll').onclick = () => act(() => {
        let hit = 0, miss = []
        RESOURCE_ITEMS.forEach(name => giveItem(name, GIVE_AMOUNT) ? hit++ : miss.push(name))
        setStatus('Gave ' + GIVE_AMOUNT + 'x to ' + hit + ' items' +
            (miss.length ? ' | Not found: ' + miss.join(', ') : ''), '#7f7')
    })

    // Give custom item
    document.getElementById('bssGiveCustom').onclick = () => {
        const name = prompt('Item internal name (e.g. royalJelly, glitter, ticket):')
        if (!name) return
        const amt = parseInt(prompt('How many?', '999')) || 999
        act(() => {
            if (giveItem(name.trim(), amt))
                setStatus('Gave ' + amt + 'x ' + name, '#7f7')
            else
                setStatus('Item "' + name + '" not found — check spelling', '#f77')
        })
    }

    // Auto honey ticker
    let autoInterval = null
    document.getElementById('bssAutoToggle').onclick = function () {
        if (autoInterval) {
            clearInterval(autoInterval); autoInterval = null
            this.textContent = '▶ Start'
        } else {
            autoInterval = setInterval(() => {
                if (p()) {
                    const amt = parseFloat(document.getElementById('bssAutoAmt').value) || 1e9
                    p().honey += amt
                    if (p().updateInventory) p().updateInventory()
                    updateDisplays()
                }
            }, 1000)
            this.textContent = '⏹ Stop'
        }
    }

    // ── Keyboard toggle ───────────────────────────────────────────────────
    document.addEventListener('keydown', e => {
        if (e.key === '`' || e.key === '~') {
            const showing = panel.style.display !== 'none'
            panel.style.display = showing ? 'none' : 'block'
            if (!showing) updateDisplays()
        }
    })

    console.log('%c[BSS Cheat Panel] Ready — press ` to open', 'color:#f5a623;font-weight:bold')

})()
