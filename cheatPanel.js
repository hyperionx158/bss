// ====================================================
// BSS CHEAT PANEL  —  press ` to toggle
// Paste into the browser console, OR add as a <script>
// tag at the bottom of index.html (before </body>)
// ====================================================

(function () {

    // ── Items to fill when "Give All Resources" is clicked ──────────────
    const RESOURCE_ITEMS = [
        'treat','strawberry','blueberry','pineapple','sunflowerSeed',
        'royalJelly','stinger','microConverter','honeysuckle','whirligig',
        'jellyBeans','glitter','cloudVial','antPass','roboPass',
        'softWax','causticWax','swirledWax','smoothWax',
        'basicEgg','rareEgg','epicEgg','legendaryEgg','mythicEgg',
        'oil','enzymes','superSmoothie','starJelly','gummyBlob',
        'ticket','glue','tropical Drink',
    ]

    const GIVE_AMOUNT = 9999

    // ── Build the panel DOM ──────────────────────────────────────────────
    const panel = document.createElement('div')
    panel.id = 'bssCheatPanel'
    panel.style.cssText = `
        position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        z-index:99999;background:rgba(20,12,0,0.93);border:2px solid #f5a623;
        border-radius:12px;padding:18px 22px;min-width:320px;
        font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#fff;
        box-shadow:0 8px 40px #0008;display:none;user-select:none;
    `

    panel.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <span style="font-size:16px;font-weight:700;color:#f5a623">🍯 BSS Cheat Panel</span>
            <span id="bssClose" style="cursor:pointer;font-size:18px;color:#aaa;line-height:1">✕</span>
        </div>

        <!-- Honey section -->
        <div style="margin-bottom:10px">
            <div style="color:#f5a623;font-weight:600;margin-bottom:6px">Honey</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="bssBtn" id="bssHoney1M">+1M</button>
                <button class="bssBtn" id="bssHoney1B">+1B</button>
                <button class="bssBtn" id="bssHoneyInf">Set 999T</button>
                <button class="bssBtn" id="bssHoneyZero" style="background:#5a1a1a">Zero</button>
            </div>
        </div>

        <!-- Honey/Pollen conversion rate -->
        <div style="margin-bottom:10px">
            <div style="color:#f5a623;font-weight:600;margin-bottom:6px">
                Honey/Pollen Rate
                <span id="bssHppDisplay" style="color:#ffd;font-weight:400;font-size:12px;margin-left:8px"></span>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
                <button class="bssBtn" id="bssHpp2x">×2</button>
                <button class="bssBtn" id="bssHpp10x">×10</button>
                <button class="bssBtn" id="bssHpp100x">×100</button>
                <button class="bssBtn" id="bssHppSet">Set value</button>
                <button class="bssBtn" id="bssHppReset" style="background:#5a1a1a">Reset ×1</button>
            </div>
        </div>

        <!-- Pollen -->
        <div style="margin-bottom:10px">
            <div style="color:#f5a623;font-weight:600;margin-bottom:6px">Pollen</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="bssBtn" id="bssPollenFill">Fill to cap</button>
                <button class="bssBtn" id="bssPollenConvert">Convert all → Honey</button>
            </div>
        </div>

        <!-- Capacity -->
        <div style="margin-bottom:10px">
            <div style="color:#f5a623;font-weight:600;margin-bottom:6px">Pollen Capacity
                <span id="bssCapDisplay" style="color:#ffd;font-weight:400;font-size:12px;margin-left:8px"></span>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="bssBtn" id="bssCap10x">×10</button>
                <button class="bssBtn" id="bssCapMax">Set 999B</button>
            </div>
        </div>

        <!-- Resources -->
        <div style="margin-bottom:10px">
            <div style="color:#f5a623;font-weight:600;margin-bottom:6px">Items / Resources</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="bssBtn" id="bssGiveAll">Give all (×${GIVE_AMOUNT})</button>
                <button class="bssBtn" id="bssGiveCustom">Give custom item…</button>
            </div>
        </div>

        <!-- Auto honey toggle -->
        <div style="margin-bottom:4px">
            <div style="color:#f5a623;font-weight:600;margin-bottom:6px">Auto Honey Ticker</div>
            <div style="display:flex;gap:6px;align-items:center">
                <button class="bssBtn" id="bssAutoToggle">▶ Start (+1B/sec)</button>
                <input id="bssAutoAmt" type="number" value="1000000000" step="1000000"
                    style="width:120px;background:#2a1a00;border:1px solid #f5a623;border-radius:6px;
                           color:#fff;padding:4px 6px;font-size:12px">
            </div>
        </div>

        <div style="margin-top:12px;font-size:10px;color:#888;text-align:center">
            Press <kbd style="background:#333;padding:1px 5px;border-radius:3px">` + '`' + `</kbd> to toggle this panel
        </div>
    `

    // ── Shared button styles ─────────────────────────────────────────────
    const style = document.createElement('style')
    style.textContent = `
        .bssBtn {
            background:#7a4a00;border:none;border-radius:7px;
            color:#fff;padding:5px 11px;cursor:pointer;font-size:12px;
            transition:background 0.15s;
        }
        .bssBtn:hover { background:#f5a623;color:#111; }
    `
    document.head.appendChild(style)
    document.body.appendChild(panel)

    // ── Helpers ──────────────────────────────────────────────────────────
    function getPlayer () { return window.player }

    function updateDisplays () {
        const p = getPlayer()
        if (!p) return
        const hpp = document.getElementById('bssHppDisplay')
        const cap = document.getElementById('bssCapDisplay')
        if (hpp) hpp.textContent = '(current: ' + (p.honeyPerPollen||0).toFixed(2) + ')'
        if (cap) cap.textContent = '(current: ' + Math.round(p.capacity||0).toLocaleString() + ')'
    }

    function giveItem (name, amount) {
        if (window.items && window.items[name] !== undefined) {
            window.items[name].amount = (window.items[name].amount || 0) + amount
            if (getPlayer() && getPlayer().updateInventory) getPlayer().updateInventory()
            return true
        }
        return false
    }

    // ── Wire buttons ─────────────────────────────────────────────────────
    document.getElementById('bssClose').onclick = () => panel.style.display = 'none'

    // Honey
    document.getElementById('bssHoney1M').onclick = () => {
        if (getPlayer()) { getPlayer().honey += 1e6; updateDisplays() }
    }
    document.getElementById('bssHoney1B').onclick = () => {
        if (getPlayer()) { getPlayer().honey += 1e9; updateDisplays() }
    }
    document.getElementById('bssHoneyInf').onclick = () => {
        if (getPlayer()) { getPlayer().honey = 999e12; updateDisplays() }
    }
    document.getElementById('bssHoneyZero').onclick = () => {
        if (getPlayer()) { getPlayer().honey = 0; updateDisplays() }
    }

    // Honey per pollen
    document.getElementById('bssHpp2x').onclick = () => {
        if (getPlayer()) { getPlayer().honeyPerPollen *= 2; updateDisplays() }
    }
    document.getElementById('bssHpp10x').onclick = () => {
        if (getPlayer()) { getPlayer().honeyPerPollen *= 10; updateDisplays() }
    }
    document.getElementById('bssHpp100x').onclick = () => {
        if (getPlayer()) { getPlayer().honeyPerPollen *= 100; updateDisplays() }
    }
    document.getElementById('bssHppSet').onclick = () => {
        const v = parseFloat(prompt('Set honeyPerPollen to:', getPlayer() ? getPlayer().honeyPerPollen : 1))
        if (!isNaN(v) && getPlayer()) { getPlayer().honeyPerPollen = v; updateDisplays() }
    }
    document.getElementById('bssHppReset').onclick = () => {
        if (getPlayer()) { getPlayer().honeyPerPollen = 1; updateDisplays() }
    }

    // Pollen
    document.getElementById('bssPollenFill').onclick = () => {
        const p = getPlayer()
        if (p) { p.pollen = p.capacity || 1e6; updateDisplays() }
    }
    document.getElementById('bssPollenConvert').onclick = () => {
        const p = getPlayer()
        if (p && p.pollen > 0) {
            p.honey += Math.ceil(p.pollen * p.honeyPerPollen)
            p.pollen = 0
        }
    }

    // Capacity
    document.getElementById('bssCap10x').onclick = () => {
        if (getPlayer()) { getPlayer().capacity *= 10; updateDisplays() }
    }
    document.getElementById('bssCapMax').onclick = () => {
        if (getPlayer()) { getPlayer().capacity = 999e9; updateDisplays() }
    }

    // Give all resources
    document.getElementById('bssGiveAll').onclick = () => {
        let hit = 0, miss = []
        RESOURCE_ITEMS.forEach(name => {
            if (giveItem(name, GIVE_AMOUNT)) hit++
            else miss.push(name)
        })
        alert('Gave ' + GIVE_AMOUNT + 'x to ' + hit + ' items.\n' +
              (miss.length ? 'Not found (may not be unlocked yet): ' + miss.join(', ') : ''))
    }

    // Give custom item
    document.getElementById('bssGiveCustom').onclick = () => {
        const name = prompt('Item internal name (e.g. royalJelly, glitter, ticket):')
        if (!name) return
        const amt = parseInt(prompt('How many?', '999')) || 999
        if (giveItem(name.trim(), amt))
            alert('Gave ' + amt + 'x ' + name)
        else
            alert('Item "' + name + '" not found in items[].\nCheck the exact internal name.')
    }

    // Auto honey ticker
    let autoInterval = null
    document.getElementById('bssAutoToggle').onclick = function () {
        if (autoInterval) {
            clearInterval(autoInterval)
            autoInterval = null
            this.textContent = '▶ Start (+1B/sec)'
        } else {
            autoInterval = setInterval(() => {
                const p = getPlayer()
                const amt = parseFloat(document.getElementById('bssAutoAmt').value) || 1e9
                if (p) p.honey += amt
            }, 1000)
            this.textContent = '⏹ Stop'
        }
    }

    // ── Keyboard toggle ──────────────────────────────────────────────────
    document.addEventListener('keydown', function (e) {
        if (e.key === '`' || e.key === '~') {
            const visible = panel.style.display !== 'none'
            panel.style.display = visible ? 'none' : 'block'
            if (!visible) updateDisplays()
        }
    })

    console.log('%c[BSS Cheat Panel] Loaded! Press ` to open.', 'color:#f5a623;font-weight:bold')

})()
