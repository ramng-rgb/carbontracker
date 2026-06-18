import { EMISSION_FACTORS } from '../data.js';

export function renderCalculator(container, userState, onUpdate) {
  // Local wizard step state
  let currentStep = 1;
  const maxSteps = 4;

  // Read current or default values from userState
  const calcData = userState.calculatorData?.inputs || {
    carType: 'sedan',
    carMil: 8000,
    transitMil: 1500,
    flightHrs: 12,
    electricKwh: 450,
    gasTherms: 30,
    dietType: 'average',
    shoppingType: 'moderate'
  };

  const calculateScore = () => {
    // 1. Transportation emissions (annual kg CO2)
    const factor = EMISSION_FACTORS.transport[calcData.carType] || 0.25;
    const carCO2 = calcData.carMil * factor;
    const transitCO2 = calcData.transitMil * EMISSION_FACTORS.transport.transit;
    const flightCO2 = calcData.flightHrs * EMISSION_FACTORS.transport.flight;
    const totalTransport = carCO2 + transitCO2 + flightCO2;

    // 2. Energy emissions (annual kg CO2 - utilities are monthly, so multiply by 12)
    const electricCO2 = calcData.electricKwh * EMISSION_FACTORS.energy.electricity * 12;
    const gasCO2 = calcData.gasTherms * EMISSION_FACTORS.energy.gas * 12;
    const totalEnergy = electricCO2 + gasCO2;

    // 3. Diet & Consumption emissions (annual kg CO2)
    const dietCO2 = EMISSION_FACTORS.diet[calcData.dietType] || 2000;
    const shoppingCO2 = EMISSION_FACTORS.consumption[calcData.shoppingType] || 1200;

    const totalCO2Kg = totalTransport + totalEnergy + dietCO2 + shoppingCO2;
    const annualFootprint = totalCO2Kg / 1000.0; // convert to Metric Tonnes

    return {
      annualFootprint,
      inputs: calcData,
      breakdown: {
        transport: totalTransport / 1000.0,
        energy: totalEnergy / 1000.0,
        diet: dietCO2 / 1000.0,
        consumption: shoppingCO2 / 1000.0
      }
    };
  };

  const drawUI = () => {
    const score = calculateScore();
    const annualVal = parseFloat(score.annualFootprint.toFixed(1));

    let stepsHtml = '';
    for (let i = 1; i <= maxSteps; i++) {
      const stepName = i === 1 ? 'Transport' : i === 2 ? 'Energy' : i === 3 ? 'Diet' : 'Consumption';
      const activeClass = i === currentStep ? 'active' : '';
      const completedClass = i < currentStep ? 'completed' : '';
      stepsHtml += `
        <div class="wizard-step ${activeClass} ${completedClass}" data-step="${i}">
          <div class="step-dot">${i < currentStep ? '✓' : i}</div>
          <div class="step-label">${stepName}</div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h1 class="section-title">Footprint Calculator</h1>
          <p class="section-subtitle">Let's calculate your current annual emissions impact step-by-step.</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary);">Current Estimate</div>
          <div style="font-size: 24px; font-weight: 800; color: var(--color-green);">${annualVal} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary);">t CO₂e/yr</span></div>
        </div>
      </div>

      <div class="glass-card calculator-wizard">
        <div class="wizard-steps">
          <div class="wizard-step-line" style="width: ${((currentStep - 1) / (maxSteps - 1)) * 100}%;"></div>
          ${stepsHtml}
        </div>

        <form id="wizard-form" onsubmit="event.preventDefault();">
          <!-- STEP 1: TRANSPORTATION -->
          <div class="wizard-panel ${currentStep === 1 ? 'active' : ''}">
            <div class="panel-title-wrapper">
              <h2 class="panel-title">🚗 Transportation Habits</h2>
              <p class="panel-desc">Vehicles and travel are the main sources of personal carbon emissions.</p>
            </div>

            <div class="form-group">
              <label class="form-label">Primary Vehicle Type</label>
              <div class="options-grid">
                <div class="option-select-card ${calcData.carType === 'sedan' ? 'selected' : ''}" data-val="sedan">
                  <span class="option-emoji">🚗</span>
                  <div class="option-text-wrapper">
                    <span class="option-name">Gas Sedan</span>
                    <span class="option-desc">Average fuel-powered passenger car</span>
                  </div>
                </div>
                <div class="option-select-card ${calcData.carType === 'suv' ? 'selected' : ''}" data-val="suv">
                  <span class="option-emoji">🚙</span>
                  <div class="option-text-wrapper">
                    <span class="option-name">Gas SUV / Truck</span>
                    <span class="option-desc">Larger gasoline utility vehicles</span>
                  </div>
                </div>
                <div class="option-select-card ${calcData.carType === 'hybrid' ? 'selected' : ''}" data-val="hybrid">
                  <span class="option-emoji">🔌</span>
                  <div class="option-text-wrapper">
                    <span class="option-name">Hybrid Vehicle</span>
                    <span class="option-desc">Combines electricity and gasoline power</span>
                  </div>
                </div>
                <div class="option-select-card ${calcData.carType === 'electric' ? 'selected' : ''}" data-val="electric">
                  <span class="option-emoji">⚡</span>
                  <div class="option-text-wrapper">
                    <span class="option-name">Electric Car (EV)</span>
                    <span class="option-desc">Zero tailpipe emissions, grid-charged</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="carMil">
                <span>Annual Vehicle Mileage</span>
                <span class="label-val" id="val-carMil">${calcData.carMil.toLocaleString()} miles</span>
              </label>
              <input type="range" class="range-slider" id="carMil" min="0" max="30000" step="500" value="${calcData.carMil}">
            </div>

            <div class="form-group">
              <label class="form-label" for="transitMil">
                <span>Annual Public Transit (Bus/Train) Mileage</span>
                <span class="label-val" id="val-transitMil">${calcData.transitMil.toLocaleString()} miles</span>
              </label>
              <input type="range" class="range-slider" id="transitMil" min="0" max="15000" step="100" value="${calcData.transitMil}">
            </div>

            <div class="form-group">
              <label class="form-label" for="flightHrs">
                <span>Annual Flight Time</span>
                <span class="label-val" id="val-flightHrs">${calcData.flightHrs} hours</span>
              </label>
              <input type="range" class="range-slider" id="flightHrs" min="0" max="100" step="1" value="${calcData.flightHrs}">
            </div>
          </div>

          <!-- STEP 2: ENERGY -->
          <div class="wizard-panel ${currentStep === 2 ? 'active' : ''}">
            <div class="panel-title-wrapper">
              <h2 class="panel-title">⚡ Home Utility usage</h2>
              <p class="panel-desc">Utility consumption accounts for residential power generation emissions.</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="electricKwh">
                <span>Monthly Electricity Consumption</span>
                <span class="label-val" id="val-electricKwh">${calcData.electricKwh} kWh</span>
              </label>
              <input type="range" class="range-slider" id="electricKwh" min="0" max="2000" step="20" value="${calcData.electricKwh}">
            </div>

            <div class="form-group">
              <label class="form-label" for="gasTherms">
                <span>Monthly Natural Gas Usage</span>
                <span class="label-val" id="val-gasTherms">${calcData.gasTherms} Therms</span>
              </label>
              <input type="range" class="range-slider" id="gasTherms" min="0" max="250" step="5" value="${calcData.gasTherms}">
            </div>
          </div>

          <!-- STEP 3: DIET -->
          <div class="wizard-panel ${currentStep === 3 ? 'active' : ''}">
            <div class="panel-title-wrapper">
              <h2 class="panel-title">🥦 Dietary Footprint</h2>
              <p class="panel-desc">Agriculture, especially livestock rearing, has high greenhouse gas emissions.</p>
            </div>

            <div class="form-group">
              <label class="form-label">Select Your Diet Profile</label>
              <div class="options-grid" style="grid-template-columns: 1fr;">
                <div class="option-select-card ${calcData.dietType === 'meatHeavy' ? 'selected' : ''}" data-diet="meatHeavy">
                  <span class="option-emoji">🥩</span>
                  <div class="option-text-wrapper">
                    <span class="option-name">Meat-Lover</span>
                    <span class="option-desc">Frequent beef, pork, or poultry meals (~2.9 tonnes CO₂e/yr)</span>
                  </div>
                </div>
                <div class="option-select-card ${calcData.dietType === 'average' ? 'selected' : ''}" data-diet="average">
                  <span class="option-emoji">🍗</span>
                  <div class="option-text-wrapper">
                    <span class="option-name">Balanced / Flexitarian</span>
                    <span class="option-desc">Moderate meat/poultry, some plant meals (~2.0 tonnes CO₂e/yr)</span>
                  </div>
                </div>
                <div class="option-select-card ${calcData.dietType === 'vegetarian' ? 'selected' : ''}" data-diet="vegetarian">
                  <span class="option-emoji">🧀</span>
                  <div class="option-text-wrapper">
                    <span class="option-name">Vegetarian</span>
                    <span class="option-desc">No meat, includes dairy products and eggs (~1.3 tonnes CO₂e/yr)</span>
                  </div>
                </div>
                <div class="option-select-card ${calcData.dietType === 'vegan' ? 'selected' : ''}" data-diet="vegan">
                  <span class="option-emoji">🥗</span>
                  <div class="option-text-wrapper">
                    <span class="option-name">Vegan</span>
                    <span class="option-desc">100% plant-based diet, no animal products (~0.9 tonnes CO₂e/yr)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 4: CONSUMPTION & SHOPPING -->
          <div class="wizard-panel ${currentStep === 4 ? 'active' : ''}">
            <div class="panel-title-wrapper">
              <h2 class="panel-title">🛍️ Consumption & Waste</h2>
              <p class="panel-desc">Shopping habits represent emissions tied to product manufacturing and logistics.</p>
            </div>

            <div class="form-group">
              <label class="form-label">Select Your Shopping Frequency</label>
              <div class="options-grid" style="grid-template-columns: 1fr;">
                <div class="option-select-card ${calcData.shoppingType === 'heavy' ? 'selected' : ''}" data-shop="heavy">
                  <span class="option-emoji">📦</span>
                  <div class="option-text-wrapper">
                    <span class="option-name">High Consumer</span>
                    <span class="option-desc">Frequent online purchases, latest electronics, fast fashion (~2.4 tonnes CO₂e/yr)</span>
                  </div>
                </div>
                <div class="option-select-card ${calcData.shoppingType === 'moderate' ? 'selected' : ''}" data-shop="moderate">
                  <span class="option-emoji">🛒</span>
                  <div class="option-text-wrapper">
                    <span class="option-name">Average Consumer</span>
                    <span class="option-desc">Moderate shopping habits, replacing goods only when required (~1.2 tonnes CO₂e/yr)</span>
                  </div>
                </div>
                <div class="option-select-card ${calcData.shoppingType === 'light' ? 'selected' : ''}" data-shop="light">
                  <span class="option-emoji">🎒</span>
                  <div class="option-text-wrapper">
                    <span class="option-name">Minimalist</span>
                    <span class="option-desc">Rarely buy new items, focus on recycling and secondhand products (~0.5 tonnes CO₂e/yr)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div class="wizard-footer">
          <button class="btn btn-secondary" id="btn-back" ${currentStep === 1 ? 'disabled style="opacity:0.3; cursor:default;"' : ''}>Back</button>
          <button class="btn btn-primary" id="btn-next">${currentStep === maxSteps ? 'Finish & Save' : 'Next'}</button>
        </div>
      </div>
    `;

    bindEvents();
  };

  const bindEvents = () => {
    // Range Sliders
    const sliders = ['carMil', 'transitMil', 'flightHrs', 'electricKwh', 'gasTherms'];
    sliders.forEach(id => {
      const slider = container.querySelector(`#${id}`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          calcData[id] = val;
          
          // Update visual bubble
          const bubble = container.querySelector(`#val-${id}`);
          if (bubble) {
            bubble.textContent = id === 'flightHrs' ? `${val} hours` : 
                                 id === 'electricKwh' ? `${val} kWh` :
                                 id === 'gasTherms' ? `${val} Therms` :
                                 `${val.toLocaleString()} miles`;
          }
          
          // Re-estimate on slider drag (subtle live feedback)
          onUpdate(calculateScore(), false); // false means don't save to storage yet
        });
      }
    });

    // Step 1: Vehicle Option Selection Cards
    container.querySelectorAll('.option-select-card[data-val]').forEach(card => {
      card.addEventListener('click', () => {
        calcData.carType = card.getAttribute('data-val');
        drawUI();
        onUpdate(calculateScore(), false);
      });
    });

    // Step 3: Diet Option Selection Cards
    container.querySelectorAll('.option-select-card[data-diet]').forEach(card => {
      card.addEventListener('click', () => {
        calcData.dietType = card.getAttribute('data-diet');
        drawUI();
        onUpdate(calculateScore(), false);
      });
    });

    // Step 4: Shopping Option Selection Cards
    container.querySelectorAll('.option-select-card[data-shop]').forEach(card => {
      card.addEventListener('click', () => {
        calcData.shoppingType = card.getAttribute('data-shop');
        drawUI();
        onUpdate(calculateScore(), false);
      });
    });

    // Wizard Navigation Buttons
    const btnNext = container.querySelector('#btn-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (currentStep < maxSteps) {
          currentStep++;
          drawUI();
        } else {
          // Final save & exit to dashboard
          const finalScore = calculateScore();
          onUpdate(finalScore, true); // true = save to localStorage
          
          // Reroute back to dashboard
          window.location.hash = '#dashboard';
        }
      });
    }

    const btnBack = container.querySelector('#btn-back');
    if (btnBack && currentStep > 1) {
      btnBack.addEventListener('click', () => {
        currentStep--;
        drawUI();
      });
    }

    // Direct header step selection
    container.querySelectorAll('.wizard-step').forEach(stepNode => {
      stepNode.addEventListener('click', () => {
        const selectedStep = parseInt(stepNode.getAttribute('data-step'));
        if (selectedStep < currentStep || userState.calculatorData?.annualFootprint) {
          currentStep = selectedStep;
          drawUI();
        }
      });
    });
  };

  // Initial draw
  drawUI();
}
