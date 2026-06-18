export function renderIotGrid(container, userState, onToggleEcoThermostat) {
  let temp = userState.iotState?.temperature || 72;
  let ecoMode = userState.iotState?.ecoMode || false;
  let isConnected = userState.iotState?.isConnected || false;

  const drawUI = () => {
    // Generate grid hours data for visual bars
    const hours = [
      { t: '12am', val: 320, pct: 40, status: 'mid' },
      { t: '4am', val: 180, pct: 20, status: 'low' },
      { t: '8am', val: 450, pct: 70, status: 'high' },
      { t: '12pm', val: 110, pct: 10, status: 'low' }, // Peak Solar
      { t: '4pm', val: 240, pct: 30, status: 'low' },
      { t: '8pm', val: 560, pct: 85, status: 'high' }, // Evening peak
    ];

    if (!isConnected) {
      // Unconnected TLS 1.3 tunnel initiation screen
      container.innerHTML = `
        <div class="section-header">
          <div>
            <h1 class="section-title">IoT Smart Grid</h1>
            <p class="section-subtitle">Sync smart home devices to track utilities and schedule energy consumption during clean grid hours.</p>
          </div>
        </div>

        <div class="glass-card" style="max-width: 650px; margin: 40px auto; text-align: center; border-color: rgba(20, 184, 166, 0.2); padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 20px; color: var(--color-teal); text-shadow: 0 0 15px rgba(20, 184, 166, 0.3);">🔐</div>
          <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">IoT Secure Connection Portal</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px; max-width: 450px; margin-left: auto; margin-right: auto;">
            To synchronize your home utilities, establish an encrypted TLS 1.3 tunnel to your Nest Thermostat gateway.
          </p>

          <!-- Terminal TLS simulation console -->
          <div id="tls-console" style="display: none; background: #070a13; border: 1px solid var(--border-glass); border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: left; font-family: monospace; font-size: 11px; height: 180px; overflow-y: auto; color: var(--color-green); line-height: 1.4; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
          </div>

          <button class="btn btn-pro" id="btn-establish-tunnel" style="width: 100%; max-width: 320px; padding: 12px 24px;">
            <i class="fas fa-key"></i> Establish Secure TLS Tunnel
          </button>
        </div>
      `;
      bindTunnelEvents();
      return;
    }

    // Connected Dashboard View
    container.innerHTML = `
      <div class="section-header">
        <div>
          <h1 class="section-title">IoT Smart Grid</h1>
          <p class="section-subtitle">Sync smart home devices to track utilities and schedule energy consumption during clean grid hours.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius:50%; background: var(--color-green); box-shadow: 0 0 8px var(--color-green);"></span>
          <span style="font-size: 11px; font-family: monospace; color: var(--text-secondary);">TLS 1.3 Tunnel Encrypted</span>
        </div>
      </div>

      <div class="iot-split-layout">
        <!-- Thermostat controller -->
        <div class="glass-card thermostat-dial-card">
          <h3 class="glass-card-title"><span class="title-icon">🌡️</span> Smart Thermostat</h3>
          <p style="font-size:12px; color: var(--text-secondary);">Simulating linked smart home climate control devices.</p>
          
          <div class="dial-circle-outer ${ecoMode ? 'eco-mode' : ''}" id="thermostat-dial">
            <span class="eco-indicator-leaf">🌱</span>
            <div class="dial-temp-display">
              <span class="dial-temp-num" id="dial-temp-num">${temp}<span class="dial-temp-unit">°F</span></span>
              <span class="dial-mode-text">${ecoMode ? 'Eco Mode Active' : 'Manual Mode'}</span>
            </div>
          </div>

          <div class="dial-control-btns">
            <button class="dial-adjust-btn" id="btn-temp-down"><i class="fas fa-minus"></i></button>
            <button class="dial-adjust-btn" id="btn-temp-up"><i class="fas fa-plus"></i></button>
          </div>

          <p style="font-size:11px; color: var(--text-muted); margin-top: 20px; max-width: 250px;">
            Setting temperatures to 68°F or below in winter (and 78°F in summer) reduces energy footprints by up to 12% monthly.
          </p>

          <button class="btn ${ecoMode ? 'btn-primary' : 'btn-secondary'}" id="btn-toggle-eco" style="width: 100%; margin-top: 20px;">
            ${ecoMode ? 'Disable Eco Settings' : 'Enable Smart Eco-Sync'}
          </button>
          
          <button class="btn btn-secondary" id="btn-disconnect-iot" style="width: 100%; margin-top: 8px; font-size:11px; padding: 6px;">
            <i class="fas fa-lock-open"></i> Terminate Encrypted Session
          </button>
        </div>

        <!-- Grid Simulator -->
        <div class="glass-card pro-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 class="glass-card-title"><span class="title-icon">⚡</span> Grid Carbon Intensity</h3>
            <p style="font-size:12px; color: var(--text-secondary); margin-bottom: 20px;">
              Live carbon intensity of your electrical grid (gCO₂/kWh). Heavy appliances (dryers, EV chargers) should avoid peak dirty hours.
            </p>

            <!-- Grid Bars visual graph -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 180px; padding: 20px 10px; background: rgba(0,0,0,0.1); border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--border-glass);">
              ${hours.map(h => `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                  <div style="font-size: 9px; color: var(--text-muted);">${h.val}g</div>
                  <div style="width: 20px; height: ${h.pct * 1.2}px; border-radius: 4px; background: ${h.status === 'low' ? 'var(--color-green)' : h.status === 'mid' ? 'var(--color-amber)' : 'var(--color-red)'}; opacity: 0.8; transition: var(--transition-smooth); box-shadow: 0 0 10px ${h.status === 'low' ? 'var(--color-green-glow)' : 'transparent'};"></div>
                  <div style="font-size: 10px; color: var(--text-secondary); font-weight:500;">${h.t}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <h4 style="font-size: 14px; font-weight:700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--color-green);">●</span> Live AI Grid Advice
            </h4>
            <p style="font-size:12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">
              Solar capacity is currently high. The grid emissions factor is at a low of <strong>110 gCO₂/kWh</strong>. 
              <strong>It is highly recommended to run heavy appliances now (12 PM - 3 PM)</strong>. Avoid grid loads during the upcoming 7 PM peak.
            </p>

            <div class="grid-intensity-stats">
              <div class="grid-stat-block">
                <span class="grid-stat-label">Grid Health</span>
                <div class="grid-stat-val low">Optimal (Clean)</div>
              </div>
              <div class="grid-stat-block">
                <span class="grid-stat-label">Renewable Share</span>
                <div class="grid-stat-val" style="color: var(--color-teal);">72% Wind/Solar</div>
              </div>
              <div class="grid-stat-block">
                <span class="grid-stat-label">Offset Avoided</span>
                <div class="grid-stat-val">${ecoMode ? '1.8 kg CO₂/day' : '0.0 kg CO₂/day'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  };

  const bindTunnelEvents = () => {
    const btnConnect = container.querySelector('#btn-establish-tunnel');
    const consoleBox = container.querySelector('#tls-console');

    if (btnConnect && consoleBox) {
      btnConnect.addEventListener('click', () => {
        btnConnect.disabled = true;
        btnConnect.style.opacity = 0.5;
        consoleBox.style.display = 'block';

        const lines = [
          "[INFO] Initializing TLS 1.3 connection to Nest IoT gateway...",
          "[INFO] ClientHello sent. Proposed cipher suites:\n       - TLS_AES_256_GCM_SHA384\n       - TLS_CHACHA20_POLY1305_SHA256",
          "[INFO] ServerHello received. Selected cipher:\n       - TLS_AES_256_GCM_SHA384",
          "[INFO] ECDH Key Exchange initiated: curve X25519 (Elliptic Curve)",
          "[INFO] Exchanging Diffie-Hellman ephemeral keys...",
          "[INFO] Derived shared master key. Verification hash OK.",
          "[INFO] Validating remote Nest server certificate...",
          "[SUCCESS] Nest IoT signature verified (Gold Standard Root CA).",
          "[INFO] TLS 1.3 Encrypted Session Established successfully.",
          "[INFO] Unlocking Smart Climate Control interface..."
        ];

        let index = 0;
        const printLine = () => {
          if (index < lines.length) {
            const lineElem = document.createElement('div');
            lineElem.innerHTML = lines[index].replace(/\n/g, '<br>');
            consoleBox.appendChild(lineElem);
            consoleBox.scrollTop = consoleBox.scrollHeight;
            index++;
            setTimeout(printLine, 280);
          } else {
            // Tunnel complete! Save state and reload UI
            isConnected = true;
            onToggleEcoThermostat({ temperature: temp, ecoMode: ecoMode, isConnected: true });
            drawUI();
          }
        };

        printLine();
      });
    }
  };

  const updateEcoState = (newEco) => {
    ecoMode = newEco;
    if (ecoMode) {
      temp = 68; // Auto adjust temp to eco limit
    }
    // Save to global app state
    onToggleEcoThermostat({ temperature: temp, ecoMode: ecoMode, isConnected: isConnected });
    drawUI();
  };

  const bindEvents = () => {
    const btnDown = container.querySelector('#btn-temp-down');
    const btnUp = container.querySelector('#btn-temp-up');
    const btnEco = container.querySelector('#btn-toggle-eco');
    const btnDisconnect = container.querySelector('#btn-disconnect-iot');

    if (btnDown) {
      btnDown.addEventListener('click', () => {
        temp--;
        if (temp <= 68) {
          ecoMode = true;
        }
        updateEcoState(ecoMode);
      });
    }

    if (btnUp) {
      btnUp.addEventListener('click', () => {
        temp++;
        if (temp > 70) {
          ecoMode = false;
        }
        updateEcoState(ecoMode);
      });
    }

    if (btnEco) {
      btnEco.addEventListener('click', () => {
        updateEcoState(!ecoMode);
      });
    }

    if (btnDisconnect) {
      btnDisconnect.addEventListener('click', () => {
        if (confirm("Are you sure you want to terminate the secure TLS 1.3 tunnel connection to Nest IoT device?")) {
          isConnected = false;
          onToggleEcoThermostat({ temperature: temp, ecoMode: ecoMode, isConnected: false });
          drawUI();
        }
      });
    }
  };

  drawUI();
}
