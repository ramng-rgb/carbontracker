import { OFFSET_PROJECTS } from '../data.js';

export function renderMarketplace(container, userState, onPurchaseOffset) {
  const annualCO2 = parseFloat((userState.calculatorData?.annualFootprint || 0).toFixed(1));
  const totalOffsetTons = parseFloat((userState.purchasedOffsets || []).reduce((sum, item) => sum + item.tons, 0).toFixed(1));

  // Current balance to offset (emissions above 0 or targets)
  const netFootprint = Math.max(0, parseFloat((annualCO2 - totalOffsetTons).toFixed(1)));

  let activeProject = null;
  let offsetInputVal = netFootprint > 0 ? netFootprint : 1.0;
  let checkoutStep = 'form'; // 'form', 'loading', 'cert'
  let lastOrder = null;

  const drawUI = () => {
    container.innerHTML = `
      <div class="section-header">
        <div>
          <h1 class="section-title">Offset Marketplace</h1>
          <p class="section-subtitle">Invest in verified Gold Standard carbon offsets to balance out your remaining footprint.</p>
        </div>
      </div>

      <!-- Marketplace Balance Bar -->
      <div class="glass-card offset-balance-box" style="margin-bottom: 32px;">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary);">Your Outstanding Balance</span>
          <div class="offset-value-big" id="net-footprint-val"><span>${netFootprint}</span> Tonnes CO₂</div>
        </div>
        <div style="border-left: 1px solid var(--border-glass); padding-left: 20px;">
          <span style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary);">Total Carbon Offsetted</span>
          <div class="offset-value-big" style="color: var(--color-teal);">${totalOffsetTons} Tonnes</div>
        </div>
      </div>

      <h3 class="glass-card-title" style="margin-bottom: 20px;"><span class="title-icon">🌍</span> Certified Reforestation & Energy Projects</h3>

      <div class="offset-projects-grid">
        ${OFFSET_PROJECTS.map(proj => `
          <div class="project-card">
            <div class="project-img-wrapper">
              <img src="${proj.image}" alt="${proj.name}" class="project-img">
              <span class="project-rating-badge">${proj.rating}</span>
            </div>
            <div class="project-details-body">
              <span class="project-loc"><i class="fas fa-map-marker-alt"></i> ${proj.location}</span>
              <h4 class="project-name">${proj.name}</h4>
              <p class="project-desc">${proj.desc}</p>
            </div>
            <div class="project-buy-bar">
              <div class="project-price">
                <span>$${proj.costPerTon.toFixed(2)}</span> / Tonne
              </div>
              <button class="btn btn-pro btn-open-buy" data-proj-id="${proj.id}">Support</button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Checkout Modal Overlay (Premium checkout simulation) -->
      <div class="modal-overlay" id="checkout-modal-overlay">
        <div class="modal-content" id="checkout-modal-content">
          <button class="modal-close-btn" id="btn-close-checkout">×</button>
          
          <!-- STEP 1: Form & Custom Offset slider -->
          <div id="checkout-step-form" style="display: ${checkoutStep === 'form' ? 'block' : 'none'};">
            <h3 class="glass-card-title" style="margin-bottom: 8px;"><span class="title-icon">💳</span> Support Project</h3>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 20px;" id="checkout-project-sub"></p>
            
            <div class="form-group">
              <div class="checkout-slider-label">
                <span>Offset Amount</span>
                <span style="color: var(--color-green); font-weight: 700;" id="checkout-tons-label">${offsetInputVal} Tonnes</span>
              </div>
              <input type="range" class="range-slider" id="checkout-offset-slider" min="0.5" max="15.0" step="0.5" value="${offsetInputVal}">
            </div>

            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 10px; padding: 12px; margin-bottom: 20px; display: flex; justify-content: space-between;">
              <span style="font-size: 13px;">Total Price:</span>
              <span style="font-size: 18px; font-weight: 800; color: var(--text-primary);" id="checkout-cost-label">$0.00</span>
            </div>

            <div class="checkout-form">
              <input type="text" class="checkout-input" placeholder="Cardholder Name" id="checkout-cardname" value="${userState.userName || ''}">
              <input type="text" class="checkout-input" placeholder="Card Number (4111 2222 3333 4444)" id="checkout-cardnum">
              <div class="checkout-row">
                <input type="text" class="checkout-input" placeholder="MM / YY" id="checkout-cardexp">
                <input type="text" class="checkout-input" placeholder="CVC" id="checkout-cardcvc">
              </div>
              <button class="btn btn-pro" id="btn-submit-pay" style="width: 100%; margin-top: 8px;">Purchase Offset credits</button>
            </div>
          </div>

          <!-- STEP 2: Loading animation -->
          <div class="checkout-loader" id="checkout-step-loader" style="display: ${checkoutStep === 'loading' ? 'flex' : 'none'};">
            <div class="spinner"></div>
            <h4 style="font-size:18px; font-weight:700; margin-bottom:8px;">Securing Smart Contracts...</h4>
            <p style="font-size: 12px; color: var(--text-secondary);">Verifying gold standard offset registers and burning credits.</p>
          </div>

          <!-- STEP 3: Offset Certificate -->
          <div id="checkout-step-cert" style="display: ${checkoutStep === 'cert' ? 'block' : 'none'};">
            <!-- Printable segment wrapper -->
            <div class="certificate-view" id="print-section">
              <div class="cert-stamp"></div>
              <div class="cert-header">Gold Standard Registry</div>
              <h2 class="cert-title">Certificate of Offset</h2>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">This document certifies that</p>
              
              <div class="cert-recipient" id="cert-recip-name">${userState.userName || 'Eco Guardian'}</div>
              
              <p class="cert-body">
                has successfully offset <strong id="cert-tons-val">--</strong> tonnes of carbon dioxide equivalent (tCO₂e) by funding the <strong id="cert-proj-name">--</strong>.
              </p>

              <div class="cert-footer-stats">
                <div class="cert-stat-item">
                  <span class="cert-stat-label">Certification Date</span>
                  <span class="cert-stat-value" id="cert-date-val">--</span>
                </div>
                <div class="cert-stat-item">
                  <span class="cert-stat-label">Registry Serial No.</span>
                  <span class="cert-stat-value" id="cert-serial-val" style="font-family: monospace; font-size:11px;">--</span>
                </div>
              </div>
            </div>

            <div class="cert-buttons-row">
              <button class="btn btn-primary" id="btn-print-cert"><i class="fas fa-print"></i> Print Certificate</button>
              <button class="btn btn-secondary" id="btn-done-cert">Done</button>
            </div>
          </div>

        </div>
      </div>
    `;

    bindEvents();
  };

  const updateCost = () => {
    if (!activeProject) return;
    const slider = container.querySelector('#checkout-offset-slider');
    if (slider) {
      offsetInputVal = parseFloat(slider.value);
    }
    const cost = offsetInputVal * activeProject.costPerTon;
    const costLabel = container.querySelector('#checkout-cost-label');
    const tonsLabel = container.querySelector('#checkout-tons-label');
    if (costLabel) costLabel.textContent = `$${cost.toFixed(2)}`;
    if (tonsLabel) tonsLabel.textContent = `${offsetInputVal.toFixed(1)} Tonnes`;
  };

  const bindEvents = () => {
    const overlay = container.querySelector('#checkout-modal-overlay');
    const btnClose = container.querySelector('#btn-close-checkout');

    // Project card support button
    container.querySelectorAll('.btn-open-buy').forEach(btn => {
      btn.addEventListener('click', () => {
        const projId = btn.getAttribute('data-proj-id');
        activeProject = OFFSET_PROJECTS.find(p => p.id === projId);
        checkoutStep = 'form';
        
        // Reset slider to outstanding deficit if positive, else default 1 Tonne
        offsetInputVal = netFootprint > 0 ? netFootprint : 1.0;

        if (overlay) {
          overlay.classList.add('active');
          drawUI(); // Redraw once with updated state to display project details
          
          // Set slider value
          const slider = container.querySelector('#checkout-offset-slider');
          if (slider) slider.value = offsetInputVal;
          updateCost();
        }
      });
    });

    // Close checkout
    if (btnClose && overlay) {
      btnClose.addEventListener('click', () => {
        overlay.classList.remove('active');
      });
    }

    // Modal elements listeners
    const slider = container.querySelector('#checkout-offset-slider');
    if (slider) {
      slider.addEventListener('input', updateCost);
    }

    // Submit simulated payment
    const btnPay = container.querySelector('#btn-submit-pay');
    if (btnPay) {
      btnPay.addEventListener('click', () => {
        // Collect card inputs (optional validate)
        const name = container.querySelector('#checkout-cardname').value || 'Eco Guardian';
        const projectSub = container.querySelector('#checkout-project-sub');
        
        // Change to loading loader
        checkoutStep = 'loading';
        drawUI();
        
        setTimeout(() => {
          // Complete payment, generate random certification ID
          const serial = 'TS-' + Math.floor(100000 + Math.random() * 900000) + '-' + activeProject.id.toUpperCase().split('_')[1];
          const dateStr = new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });

          lastOrder = {
            projectName: activeProject.name,
            tons: offsetInputVal,
            serial: serial,
            date: dateStr,
            name: name
          };

          // Save transaction to global storage list
          onPurchaseOffset(lastOrder);

          // Change to Certificate layout
          checkoutStep = 'cert';
          drawUI();
          
          // Populate certificate nodes
          container.querySelector('#cert-recip-name').textContent = lastOrder.name;
          container.querySelector('#cert-tons-val').textContent = lastOrder.tons.toFixed(1);
          container.querySelector('#cert-proj-name').textContent = lastOrder.projectName;
          container.querySelector('#cert-date-val').textContent = lastOrder.date;
          container.querySelector('#cert-serial-val').textContent = lastOrder.serial;

        }, 2200); // 2.2 seconds simulated processing
      });
    }

    // Print certificate handler
    const btnPrint = container.querySelector('#btn-print-cert');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // Close certificate view
    const btnDone = container.querySelector('#btn-done-cert');
    if (btnDone && overlay) {
      btnDone.addEventListener('click', () => {
        overlay.classList.remove('active');
        // Reroute back to dashboard
        window.location.hash = '#dashboard';
      });
    }
  };

  drawUI();
}
