const MIN_PRODUCER_COST = 0.1;

// PRODUCERS.JS - Producer Management and Purchase Functions

// Generic producer update system
function updateProducers(type) {
    const configs = {
        glitter: {
            container: 'glitter-producers',
            producers: gameState.glitterProducers,
            templates: PRODUCER_TEMPLATES.glitterProducers,
            bulkMode: gameState.bulkMode,
            currency: gameState.fairies.amount,
            currencyName: 'Fairies'
        },
        stardust: {
            container: 'stardust-producers',
            producers: gameState.stardustProducers,
            templates: PRODUCER_TEMPLATES.stardustProducers,
            bulkMode: gameState.stardustBulkMode,
            currency: gameState.unicorns.amount,
            currencyName: 'Unicorns'
        },
        cloud: {
            container: 'cloud-producers',
            producers: gameState.cloudProducers,
            templates: PRODUCER_TEMPLATES.cloudProducers,
            bulkMode: gameState.cloudBulkMode,
            currencyName: null
        }
    };

    const config = configs[type];
    if (!config) return;

    const container = document.getElementById(config.container);
    if (!container) return;

    if (container.children.length !== config.producers.length) {
        container.innerHTML = '';
        createProducerCards(type, container, config);
    } else {
        updateProducerCards(type, config);
    }
}

function createProducerCards(type, container, config) {
    config.producers.forEach((producerState, index) => {
        const template = config.templates[index];
        const producer = { ...template, ...producerState }; // Combine static and dynamic data

        const currency = config.currencyName ? config.currency :
            (producer.currency === 'glitter' ? gameState.glitter : gameState.stardust);
        const buyAmount = config.bulkMode === -1 ?
            calculateMaxAffordable(producer.cost, producer.costMult, currency) : config.bulkMode;
        const displayBuyAmount = (config.bulkMode === -1 && buyAmount === 0) ? 1 : buyAmount;
        // FIXED: When buyAmount is 0, calculate cost for 1 instead of 0
        const costCalcAmount = buyAmount === 0 ? 1 : buyAmount;
        let totalCost = calculateBulkCost(producer.cost, producer.costMult, costCalcAmount);
        if (type === 'glitter' || type === 'stardust') {
            totalCost = Math.floor(totalCost);
        }
        const canAfford = currency >= totalCost && buyAmount > 0;

        const card = document.createElement('div');
        card.className = 'producer-card';
        card.id = `${type}-producer-${index}`;

        const imageContent = producer.image ? 
            `<img src="${producer.image}" alt="${producer.name}" onerror="this.style.display='none'; this.parentElement.textContent='${producer.icon}';">` : 
            producer.icon;

        const currencyText = config.currencyName || (producer.currency === 'glitter' ? 'Glitter ✨' : 'Stardust ⭐');
        const productionText = type === 'cloud' ? 'Rainbow parts/sec' : type === 'glitter' ? 'Glitter/sec' : 'Stardust/sec';

        // Display cost properly whether fractional or not
        const formattedCost = formatNumber(totalCost);

        let effectiveProduction = producer.production;
        if (type === 'glitter') {
            effectiveProduction *= getPrestigeGlitterProductionMultiplier();
        } else if (type === 'stardust') {
            effectiveProduction *= getPrestigeStardustProductionMultiplier();
        }

        card.innerHTML = `
            <div class="producer-icon ${producer.class || ''}">${imageContent}</div>
            <div class="producer-name" id="${type[0]}p-name-${index}">${producer.name}: ${formatQuantity(producer.amount)}</div>
            <div class="producer-production" id="${type[0]}p-production-${index}">${productionText}: ${formatNumber(producer.amount * effectiveProduction)} (${formatNumber(effectiveProduction)} each)</div>
            <button class="buy-button" id="${type[0]}p-button-${index}" ${!canAfford ? 'disabled' : ''}>${displayBuyAmount > 1 ? `Buy ${displayBuyAmount}` : 'Buy'} for ${formattedCost} ${currencyText.replace(/[^\w\s]/gi, '')}</button>
        `;

        card.querySelector('button').addEventListener('click', () => buyProducerBulk(type, index));
        container.appendChild(card);
    });
}

function updateProducerCards(type, config) {
    config.producers.forEach((producerState, index) => {
        const template = config.templates[index];
        const producer = { ...template, ...producerState };

        const currency = config.currencyName ? config.currency :
            (producer.currency === 'glitter' ? gameState.glitter : gameState.stardust);
        const buyAmount = config.bulkMode === -1 ?
            calculateMaxAffordable(producer.cost, producer.costMult, currency) : config.bulkMode;
        const displayBuyAmount = (config.bulkMode === -1 && buyAmount === 0) ? 1 : buyAmount;
        // FIXED: When buyAmount is 0, calculate cost for 1 instead of 0
        const costCalcAmount = buyAmount === 0 ? 1 : buyAmount;
        let totalCost = calculateBulkCost(producer.cost, producer.costMult, costCalcAmount);
        if (type === 'glitter' || type === 'stardust') {
            totalCost = Math.floor(totalCost);
        }
        const canAfford = currency >= totalCost && buyAmount > 0;

        const elements = {
            name: document.getElementById(`${type[0]}p-name-${index}`),
            production: document.getElementById(`${type[0]}p-production-${index}`),
            button: document.getElementById(`${type[0]}p-button-${index}`)
        };

        const currencyText = config.currencyName || (producer.currency === 'glitter' ? 'Glitter ✨' : 'Stardust ⭐');
        const productionText = type === 'cloud' ? 'Rainbow parts/sec' : type === 'glitter' ? 'Glitter/sec' : 'Stardust/sec';

        // Display cost properly whether fractional or not
        const formattedCost = formatNumber(totalCost);

        let effectiveProduction = producer.production;
        if (type === 'glitter') {
            effectiveProduction *= getPrestigeGlitterProductionMultiplier();
        } else if (type === 'stardust') {
            effectiveProduction *= getPrestigeStardustProductionMultiplier();
        }

        if (elements.name) elements.name.innerHTML = `${producer.name}: ${formatQuantity(producer.amount)}`;
        if (elements.production) elements.production.textContent = `${productionText}: ${formatNumber(producer.amount * effectiveProduction)} (${formatNumber(effectiveProduction)} each)`;
        if (elements.button) {
            elements.button.textContent = `${displayBuyAmount > 1 ? `Buy ${displayBuyAmount}` : 'Buy'} for ${formattedCost} ${currencyText.replace(/[^\w\s]/gi, '')}`;
            elements.button.disabled = !canAfford;
        }
    });
}

function buyProducerBulk(type, index) {
    const configs = {
        glitter: { producers: gameState.glitterProducers, templates: PRODUCER_TEMPLATES.glitterProducers, updateCost: updateFairyCost, spendFrom: 'fairies' },
        stardust: { producers: gameState.stardustProducers, templates: PRODUCER_TEMPLATES.stardustProducers, updateCost: updateUnicornCost, spendFrom: 'unicorns' },
        cloud: { producers: gameState.cloudProducers, templates: PRODUCER_TEMPLATES.cloudProducers, updateCost: null, spendFrom: null }
    };

    const config = configs[type];
    const producerState = config.producers[index];
    const template = config.templates[index];
    const producer = { ...template, ...producerState };

    let currency, bulkMode;
    if (type === 'cloud') {
        currency = producer.currency === 'glitter' ? gameState.glitter : gameState.stardust;
        bulkMode = gameState.cloudBulkMode;
    } else {
        currency = type === 'glitter' ? gameState.fairies.amount : gameState.unicorns.amount;
        bulkMode = type === 'glitter' ? gameState.bulkMode : gameState.stardustBulkMode;
    }

    const buyAmount = bulkMode === -1 ? calculateMaxAffordable(producer.cost, producer.costMult, currency) : bulkMode;
    let totalCost = calculateBulkCost(producer.cost, producer.costMult, buyAmount);

    if (type === 'glitter' || type === 'stardust') {
        totalCost = Math.floor(totalCost);
    }

    if (currency >= totalCost && buyAmount > 0) {
        if (type === 'cloud') {
            if (producer.currency === 'glitter') gameState.glitter -= totalCost;
            else gameState.stardust -= totalCost;
        } else {
            gameState[config.spendFrom].amount -= totalCost;
            config.updateCost();
        }

        producerState.amount += buyAmount;
        
        const theoreticalCost = producerState.baseCost * Math.pow(producer.costMult, producerState.amount);
        producerState.cost = Math.floor(Math.max(1, theoreticalCost));
        
        updateProducers(type);
        updateDisplay();
    }
}

// Public interface functions
function updateGlitterProducers() { updateProducers('glitter'); }
function updateStardustProducers() { updateProducers('stardust'); }
function updateCloudProducers() { updateProducers('cloud'); }

// LEPRECHAUN PRODUCERS
function updateLeprechaunProducers() {
    const container = document.getElementById('leprechaun-producers');
    if (!container) return;

    if (container.children.length !== gameState.leprechaunProducers.length || gameState.ascension.justAscended) {
        container.innerHTML = '';
        createLeprechaunCards(container);
        if(gameState.ascension.justAscended) {
            delete gameState.ascension.justAscended;
        }
    } else {
        updateLeprechaunCards();
    }
}

function createLeprechaunCards(container) {
    const templates = PRODUCER_TEMPLATES.leprechaunProducers;
    gameState.leprechaunProducers.forEach((producerState, index) => {
        const template = templates[index];
        const producer = { ...template, ...producerState };

        const isSpaceShrink = index === 1;
        const spaceShrinkReduction = (index === 1) ? producer.amount * producer.effect * getPrestigeLeprechaunEffectsMultiplier() : 0;
        const isSpaceShrinkMaxed = isSpaceShrink && spaceShrinkReduction >= 0.9;
        
        const isAvarice = index === 3;
        const avariceState = gameState.leprechaunProducers[3];
        const avariceTemplate = PRODUCER_TEMPLATES.leprechaunProducers[3];
        const avariceReduction = avariceState.amount * avariceState.effect * getPrestigeLeprechaunEffectsMultiplier();
        const isAvariceMaxed = isAvarice && avariceReduction >= 0.99;
        
        // FIXED: Use producer.cost directly since it already includes the Avarice reduction
        let adjustedCost = producer.cost;
        let buyAmount = 0, displayBuyAmount = 1, totalCost = 0, canAfford = false, buttonText = "";
        let isDisabled = false;
        
        if (isSpaceShrinkMaxed || isAvariceMaxed) {
            buttonText = "Costs infinite gold!";
            isDisabled = true; // FIXED: Explicitly disable the button
        } else {
            buyAmount = gameState.leprechaunBulkMode === -1 ? 
                         calculateMaxAffordable(adjustedCost, producer.costMult, gameState.gold) : gameState.leprechaunBulkMode;
            displayBuyAmount = (gameState.leprechaunBulkMode === -1 && buyAmount === 0) ? 1 : buyAmount;
            // FIXED: When buyAmount is 0, calculate cost for 1 instead of 0
            const costCalcAmount = buyAmount === 0 ? 1 : buyAmount;
            totalCost = calculateBulkCost(adjustedCost, producer.costMult, costCalcAmount);
            canAfford = gameState.gold >= totalCost && buyAmount > 0;
            
            // Display cost properly whether fractional or not
            const formattedCost = formatNumber(totalCost);
            buttonText = `${displayBuyAmount > 1 ? `Buy ${displayBuyAmount}` : 'Buy'} for ${formattedCost} Gold 🍀`;
        }

        const card = document.createElement('div');
        card.className = 'producer-card';
        card.id = `leprechaun-producer-${index}`;

        const imageContent = producer.image ? 
            `<img src="${producer.image}" alt="${producer.name}" onerror="this.style.display='none'; this.parentElement.textContent='${producer.icon}';">` : 
            producer.icon;

        card.innerHTML = `
            <div class="producer-icon ${producer.class}">${imageContent}</div>
            <div class="producer-name" id="lp-name-${index}">${producer.name}: ${formatQuantity(producer.amount)}</div>
            <div class="producer-production" id="lp-production-${index}">${getLeprechaunProducerDescription(producer, index)}</div>
            <button class="buy-button" id="lp-button-${index}" ${(isDisabled || !canAfford) ? 'disabled' : ''}>${buttonText}</button>
        `;

        if (!isDisabled) {
            card.querySelector('button').addEventListener('click', () => buyLeprechaunProducer(index));
        }
        container.appendChild(card);
    });
}

function updateLeprechaunCards() {
    const templates = PRODUCER_TEMPLATES.leprechaunProducers;
    const spaceShrinkState = gameState.leprechaunProducers[1];
    const spaceShrinkReduction = spaceShrinkState.amount * spaceShrinkState.effect * getPrestigeLeprechaunEffectsMultiplier();
    const isSpaceShrinkMaxed = spaceShrinkReduction >= 0.9;

    const avariceState = gameState.leprechaunProducers[3];
    const avariceReduction = avariceState.amount * avariceState.effect * getPrestigeLeprechaunEffectsMultiplier();
    const isAvariceMaxed = avariceReduction >= 0.99;

    gameState.leprechaunProducers.forEach((producerState, index) => {
        const template = templates[index];
        const producer = { ...template, ...producerState };

        const isSpaceShrink = index === 1;
        const isAvarice = index === 3;
        
        let buyAmount = 0, displayBuyAmount = 1, totalCost = 0, canAfford = false, buttonText = "";
        let isDisabled = (isSpaceShrink && isSpaceShrinkMaxed) || (isAvarice && isAvariceMaxed);
        
        if (isDisabled) {
            buttonText = "Maxed out!";
        } else {
            buyAmount = gameState.leprechaunBulkMode === -1 ? 
                         calculateMaxAffordable(producer.cost, producer.costMult, gameState.gold) : gameState.leprechaunBulkMode;
            displayBuyAmount = (gameState.leprechaunBulkMode === -1 && buyAmount === 0) ? 1 : buyAmount;
            const costCalcAmount = buyAmount === 0 ? 1 : buyAmount;
            totalCost = calculateBulkCost(producer.cost, producer.costMult, costCalcAmount);
            canAfford = gameState.gold >= totalCost && buyAmount > 0;
            
            const formattedCost = formatNumber(totalCost);
            buttonText = `${displayBuyAmount > 1 ? `Buy ${displayBuyAmount}` : 'Buy'} for ${formattedCost} Gold 🍀`;
        }

        const nameEl = document.getElementById(`lp-name-${index}`);
        const productionEl = document.getElementById(`lp-production-${index}`);
        const buttonEl = document.getElementById(`lp-button-${index}`);

        if (nameEl) nameEl.innerHTML = `${producer.name}: ${formatQuantity(producer.amount)}`;
        if (productionEl) productionEl.innerHTML = getLeprechaunProducerDescription(producer, index);
        if (buttonEl) {
            buttonEl.textContent = buttonText;
            buttonEl.disabled = isDisabled || !canAfford;
        }
    });
}

function getLeprechaunProducerDescription(producer, index) {
    const effectValue = producer.effect * 100;
    switch(index) {
        case 0:
            {
                const finalEffectValue = effectValue * getPrestigeLeprechaunEffectsMultiplier() * getPrestigeNewShoesPowerMultiplier();
                const finalTotalBonus = producer.amount * finalEffectValue;
                return `+${finalEffectValue.toFixed(2)}% Queen speed per level (${finalTotalBonus.toFixed(2)}% total)`;
            }
        case 1:
            return `-${(effectValue * getPrestigeLeprechaunEffectsMultiplier()).toFixed(2)}% Queen distance per level (max 90%)`;
        case 2:
            {
                const finalEffectValue = effectValue * getPrestigeLeprechaunEffectsMultiplier() * getPrestigeTrickeryPowerMultiplier();
                const finalTotalBonus = producer.amount * finalEffectValue;
                return `+${finalEffectValue.toFixed(2)}% gold production per level (${finalTotalBonus.toFixed(2)}% total)`;
            }
        case 3:
            return `-${(effectValue * getPrestigeLeprechaunEffectsMultiplier()).toFixed(2)}% cost for other Leprechaun producers per level (max 99%)`;
        default:
            return producer.description;
    }
}

function buyLeprechaunProducer(index) {
    const producerState = gameState.leprechaunProducers[index];
    const template = PRODUCER_TEMPLATES.leprechaunProducers[index];
    const producer = { ...template, ...producerState };
    
    const isSpaceShrink = index === 1;
    const spaceShrinkReduction = (index === 1) ? producer.amount * producer.effect * getPrestigeLeprechaunEffectsMultiplier() : 0;
    
    const isAvarice = index === 3;
    const avariceReduction = (index === 3) ? producer.amount * producer.effect * getPrestigeLeprechaunEffectsMultiplier() : 0;
    
    if ((isSpaceShrink && spaceShrinkReduction >= 0.9) || (isAvarice && avariceReduction >= 0.99)) return;
    
    const buyAmount = gameState.leprechaunBulkMode === -1 ? 
                     calculateMaxAffordable(producer.cost, producer.costMult, gameState.gold) : gameState.leprechaunBulkMode;
    if (buyAmount === 0) return;

    const totalCost = calculateBulkCost(producer.cost, producer.costMult, buyAmount);
    
    if (gameState.gold >= totalCost) {
        gameState.gold -= totalCost;
        producerState.amount += buyAmount;
        
        const theoreticalCost = producerState.baseCost * Math.pow(producer.costMult, producerState.amount);
        producerState.cost = Math.max(0.01, theoreticalCost);
        
        updateLeprechaunProducersCosts();
        updateLeprechaunProducers();
        updateDisplay();
    }
}

// BUILDERS (formerly AUTOCLICKERS) - FIXED: Updated to support bulk buying
function updateAutoclickers() {
    const container = document.getElementById('autoclicker-producers');
    if (!container) return;

    if (container.children.length !== 2) {
        container.innerHTML = '';
        createAutoclickerCards(container);
    } else {
        updateAutoclickerCards();
    }
}

function createAutoclickerCards(container) {
    const types = [
        { name: 'Fairy', type: 'fairies', icon: 'images/Fairy.png', currency: 'Fairies' },
        { name: 'Unicorn', type: 'unicorns', icon: 'images/Unicorn.png', currency: 'Unicorns' }
    ];

    types.forEach(({ name, type, icon, currency }) => {
        const ac = gameState.autoclickers[type];
        const currencyAmount = gameState[type].amount;
        
        // FIXED: Calculate bulk buying for autoclickers
        const buyAmount = gameState.autoclickerBulkMode === -1 ? 
                         calculateMaxAffordable(ac.cost, ac.costMult, currencyAmount) : gameState.autoclickerBulkMode;
        const displayBuyAmount = (gameState.autoclickerBulkMode === -1 && buyAmount === 0) ? 1 : buyAmount;
        const costCalcAmount = buyAmount === 0 ? 1 : buyAmount;
        const totalCost = calculateBulkCost(ac.cost, ac.costMult, costCalcAmount);
        const canAfford = currencyAmount >= totalCost && buyAmount > 0;
        
        const card = document.createElement('div');
        card.className = 'producer-card';
        card.id = `${type}-autoclicker-card`;
        
        const imageContent = `<img src="${icon}" alt="${name} Builder" style="width: 100%; height: 100%; border-radius: 15px; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='🧚‍♀️🖱️';">`;
        
        // FIXED: Include prestige multiplier in display
        const effectiveClicksPerSec = ac.clicksPerSecond * getPrestigeAutoclickersSpeedMultiplier();
        
        card.innerHTML = `
            <div class="producer-icon">${imageContent}</div>
            <div class="producer-name" id="${type}-ac-name">${name} Builder: ${formatQuantity(ac.amount)}</div>
            <div class="producer-production" id="${type}-ac-production">+${formatNumber(effectiveClicksPerSec * ac.amount)} autoclicks/sec total (${formatNumber(effectiveClicksPerSec)} each)</div>
            <button class="buy-button" id="${type}-ac-button">${displayBuyAmount > 1 ? `Buy ${displayBuyAmount}` : 'Buy'} for ${formatNumber(totalCost)} ${currency}</button>
        `;
        
        // FIXED: Use bulk buying function
        card.querySelector('button').addEventListener('click', () => buyAutoclickerBulk(type));
        container.appendChild(card);
    });
}

function updateAutoclickerCards() {
    const types = ['fairies', 'unicorns'];
    const currencies = ['Fairies', 'Unicorns'];

    types.forEach((type, i) => {
        const ac = gameState.autoclickers[type];
        const currencyAmount = gameState[type].amount;
        
        // FIXED: Calculate bulk buying for autoclickers
        const buyAmount = gameState.autoclickerBulkMode === -1 ? 
                         calculateMaxAffordable(ac.cost, ac.costMult, currencyAmount) : gameState.autoclickerBulkMode;
        const displayBuyAmount = (gameState.autoclickerBulkMode === -1 && buyAmount === 0) ? 1 : buyAmount;
        const costCalcAmount = buyAmount === 0 ? 1 : buyAmount;
        const totalCost = calculateBulkCost(ac.cost, ac.costMult, costCalcAmount);
        const canAfford = currencyAmount >= totalCost && buyAmount > 0;

        const elements = {
            name: document.getElementById(`${type}-ac-name`),
            production: document.getElementById(`${type}-ac-production`),
            button: document.getElementById(`${type}-ac-button`)
        };

        // FIXED: Include prestige multiplier in display
        const effectiveClicksPerSec = ac.clicksPerSecond * getPrestigeAutoclickersSpeedMultiplier();

        if (elements.name) elements.name.innerHTML = `${type === 'fairies' ? 'Fairy' : 'Unicorn'} Builder: ${formatQuantity(ac.amount)}`;
        if (elements.production) elements.production.textContent = `+${formatNumber(effectiveClicksPerSec * ac.amount)} autoclicks/sec total (${formatNumber(effectiveClicksPerSec)} each)`;
        if (elements.button) {
            elements.button.textContent = `${displayBuyAmount > 1 ? `Buy ${displayBuyAmount}` : 'Buy'} for ${formatNumber(totalCost)} ${currencies[i]}`;
            elements.button.disabled = !canAfford;
        }
    });
}

// FIXED: New bulk buying function for autoclickers
function buyAutoclickerBulk(type) {
    const ac = gameState.autoclickers[type];
    const currencyAmount = gameState[type].amount;
    
    const buyAmount = gameState.autoclickerBulkMode === -1 ? 
                     calculateMaxAffordable(ac.cost, ac.costMult, currencyAmount) : gameState.autoclickerBulkMode;
    const totalCost = calculateBulkCost(ac.cost, ac.costMult, buyAmount);
    
    if (currencyAmount >= totalCost && buyAmount > 0) {
        gameState[type].amount -= totalCost;
        if (type === 'fairies') updateFairyCost();
        else updateUnicornCost();
        
        ac.amount += buyAmount;
        
        // Update costs
        ac.realCost = ac.baseCost * Math.pow(ac.costMult, ac.amount);
        ac.cost = Math.max(1, Math.floor(ac.realCost));
        
        updateAutoclickers();
        updateDisplay();
    }
}

// Legacy functions for compatibility
function buyAutoclicker(type) {
    // FIXED: Redirect to bulk buying with amount 1
    const oldBulkMode = gameState.autoclickerBulkMode;
    gameState.autoclickerBulkMode = 1;
    buyAutoclickerBulk(type);
    gameState.autoclickerBulkMode = oldBulkMode;
}

function buyFairyAutoclicker() { buyAutoclicker('fairies'); }
function buyUnicornAutoclicker() { buyAutoclicker('unicorns'); }

// QUEEN ACCELERATORS
function updateQueenAccelerators() {
    const container = document.getElementById('queen-accelerators');
    if (!container) return;
    
    if (container.children.length !== gameState.queenAccelerators.length) {
        container.innerHTML = '';
        createQueenAcceleratorCards(container);
    } else {
        updateQueenAcceleratorCards();
    }
}

function createQueenAcceleratorCards(container) {
    const templates = PRODUCER_TEMPLATES.queenAccelerators;
    gameState.queenAccelerators.forEach((acceleratorState, index) => {
        const template = templates[index];
        const accelerator = { ...template, ...acceleratorState };

        const currentResource = accelerator.currency === 'glitter' ? gameState.glitter : gameState.stardust;
        const buyAmount = gameState.queenBulkMode === -1 ? 
                         calculateMaxAffordable(accelerator.cost, accelerator.costMult, currentResource) : gameState.queenBulkMode;
        const displayBuyAmount = (gameState.queenBulkMode === -1 && buyAmount === 0) ? 1 : buyAmount;
        const costCalcAmount = buyAmount === 0 ? 1 : buyAmount;
        const totalCost = calculateBulkCost(accelerator.cost, accelerator.costMult, costCalcAmount);
        const canActuallyAfford = currentResource >= totalCost && buyAmount > 0;
        const currencyName = accelerator.currency.charAt(0).toUpperCase() + accelerator.currency.slice(1);
        const effectiveBoost = accelerator.speedBoost * accelerator.productivityMult * getPrestigeQueenAcceleratorsPowerMultiplier();

        const card = document.createElement('div');
        card.className = 'producer-card';
        card.id = `queen-accelerator-${index}`;
        
        const imageContent = accelerator.image ? 
            `<img src="${accelerator.image}" alt="${accelerator.name}" onerror="this.style.display='none'; this.parentElement.textContent='${accelerator.icon}';">` : 
            accelerator.icon;

        const totalBoost = accelerator.amount * effectiveBoost * 100;
        const individualBoost = effectiveBoost * 100;

        card.innerHTML = `
            <div class="producer-icon ${accelerator.class || ''}">${imageContent}</div>
            <div class="producer-name" id="qa-name-${index}">${accelerator.name}: ${formatQuantity(accelerator.amount)}</div>
            <div class="producer-production" id="qa-production-${index}">+${totalBoost.toFixed(1)}% Speed total (+${individualBoost.toFixed(1)}% each)</div>
            <button class="buy-button" id="qa-button-${index}" ${!canActuallyAfford ? 'disabled' : ''}>${displayBuyAmount > 1 ? `Buy ${displayBuyAmount}` : 'Buy'} for ${formatNumber(totalCost)} ${currencyName}</button>
        `;
        card.querySelector('button').onclick = () => buyQueenAccelerator(index);
        container.appendChild(card);
    });
}

function updateQueenAcceleratorCards() {
    const templates = PRODUCER_TEMPLATES.queenAccelerators;
    gameState.queenAccelerators.forEach((acceleratorState, index) => {
        const template = templates[index];
        const accelerator = { ...template, ...acceleratorState };

        const currentResource = accelerator.currency === 'glitter' ? gameState.glitter : gameState.stardust;
        const buyAmount = gameState.queenBulkMode === -1 ? 
                         calculateMaxAffordable(accelerator.cost, accelerator.costMult, currentResource) : gameState.queenBulkMode;
        const displayBuyAmount = (gameState.queenBulkMode === -1 && buyAmount === 0) ? 1 : buyAmount;
        const costCalcAmount = buyAmount === 0 ? 1 : buyAmount;
        const totalCost = calculateBulkCost(accelerator.cost, accelerator.costMult, costCalcAmount);
        const canActuallyAfford = currentResource >= totalCost && buyAmount > 0;
        const currencyName = accelerator.currency.charAt(0).toUpperCase() + accelerator.currency.slice(1);
        const effectiveBoost = accelerator.speedBoost * accelerator.productivityMult * getPrestigeQueenAcceleratorsPowerMultiplier();

        const totalBoost = accelerator.amount * effectiveBoost * 100;
        const individualBoost = effectiveBoost * 100;

        const elements = {
            name: document.getElementById(`qa-name-${index}`),
            production: document.getElementById(`qa-production-${index}`),
            button: document.getElementById(`qa-button-${index}`)
        };

        if (elements.name) elements.name.innerHTML = `${accelerator.name}: ${formatQuantity(accelerator.amount)}`;
        if (elements.production) elements.production.textContent = `+${totalBoost.toFixed(1)}% Speed total (+${individualBoost.toFixed(1)}% each)`;
        if (elements.button) {
            elements.button.textContent = `${displayBuyAmount > 1 ? `Buy ${displayBuyAmount}` : 'Buy'} for ${formatNumber(totalCost)} ${currencyName}`;
            elements.button.disabled = !canActuallyAfford;
        }
    });
}

function buyQueenAccelerator(index) {
    const acceleratorState = gameState.queenAccelerators[index];
    const template = PRODUCER_TEMPLATES.queenAccelerators[index];
    const accelerator = { ...template, ...acceleratorState };

    const currentResource = accelerator.currency === 'glitter' ? gameState.glitter : gameState.stardust;
    const buyAmount = gameState.queenBulkMode === -1 ? 
                     calculateMaxAffordable(accelerator.cost, accelerator.costMult, currentResource) : gameState.queenBulkMode;
    if(buyAmount === 0) return;

    const totalCost = calculateBulkCost(accelerator.cost, accelerator.costMult, buyAmount);

    if (currentResource >= totalCost) {
        if (accelerator.currency === 'glitter') gameState.glitter -= totalCost;
        else gameState.stardust -= totalCost;

        acceleratorState.amount += buyAmount;
        acceleratorState.cost = Math.max(0.01, acceleratorState.baseCost * Math.pow(accelerator.costMult, acceleratorState.amount));
        updateQueenAccelerators();
        updateDisplay();
    }
}

// ZOMBIE PRODUCERS - MODIFIED: ONLY AUTOBUYERS, NO MANUAL PURCHASE
function setupZombieProducers() {
    const container = document.getElementById('zombie-producers');
    if (!container) return;

    const productivityBoost = calculateProductivityBoost();
    container.innerHTML = '';
    createZombieCards(container, productivityBoost);
}

function updateZombieProducerStats() {
    const productivityBoost = calculateProductivityBoost();
    updateZombieCardContent(productivityBoost);
}

function createZombieCards(container, productivityBoost) {
    const zombieTypes = [
        { type: 'fairies', name: 'Zombie Fairies', icon: 'images/ZombieFairy.png', currency: 'Fairies', moleculeType: 'Unicorn' },
        { type: 'unicorns', name: 'Zombie Unicorns', icon: 'images/ZombieUnicorn.png', currency: 'Unicorns', moleculeType: 'Fairy' }
    ];

    zombieTypes.forEach(({ type, name, icon, currency, moleculeType }) => {
        const zombie = gameState.zombies[type];

        // FIXED: Include prestige multiplier in base rate calculation
        const prestigeMultiplier = type === 'fairies' ? getPrestigeZombieFairiesMultiplier() : getPrestigeZombieUnicornsMultiplier();
        const baseRate = zombie.prodPower * prestigeMultiplier * productivityBoost;
        const totalProduction = zombie.amount * baseRate;
        const rainbowBoost = (gameState.rainbows.amount > 0 && 
                             ((type === 'fairies' && gameState.rainbows.makingFairies) || 
                              (type === 'unicorns' && !gameState.rainbows.makingFairies))) ? ', plus Rainbows' : '';

        const card = document.createElement('div');
        card.className = 'producer-card';
        card.id = `zombie-${type.slice(0, -1)}-card`;
        
        const imageContent = `<img src="${icon}" alt="${name}" style="width: 100%; height: 100%; border-radius: 15px; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='${type === 'fairies' ? '🧚‍♀️💀' : '🦄💀'}';">`;
        
        card.innerHTML = `
            <div class="producer-icon">${imageContent}</div>
            <div class="producer-name" id="z${type[0]}-name">${name}: ${formatQuantity(zombie.amount)}</div>
            <div class="producer-production" id="z${type[0]}-production">${formatNumber(totalProduction)} ${moleculeType} Mol/sec (${formatNumber(baseRate)} each)${rainbowBoost}</div>
        `;

        const autobuyerDiv = document.createElement('div');
        autobuyerDiv.className = 'autobuyer-container';
        autobuyerDiv.style.cssText = 'margin-top: 10px; font-size: 0.9em; color: #333; display: flex; flex-direction: column; align-items: center; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 6px;';
        
        const prestigeUpgradeLevel = gameState.ascension.prestigeUpgrades[`more-zombie-${type}`] || 0;
        const effectiveRate = zombie.autobuyer.rate + (prestigeUpgradeLevel * 2);

        autobuyerDiv.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
                <input type="checkbox" id="autobuy-z${type[0]}-check" ${zombie.autobuyer.enabled ? 'checked' : ''} style="margin-right: 6px; cursor: pointer; transform: scale(1.1);">
                <label id="autobuy-z${type[0]}-label" for="autobuy-z${type[0]}-check" style="cursor: pointer;">Autobuy ${effectiveRate}/sec unless there are </label>
                <input type="text" id="z${type[0]}-keep-min" value="${zombie.autobuyer.keepMinimum}" style="width: 50px; text-align: center; border: 1px solid #ccc; border-radius: 3px; padding: 2px; margin: 0 5px;">
                <label for="z${type[0]}-keep-min">${currency} or less</label>
            </div>
            <div style="font-size: 0.9em; color: #666; text-align: center;">
                Cost: ${zombie.baseCost} ${currency} each
            </div>
        `;

        autobuyerDiv.querySelector(`#autobuy-z${type[0]}-check`).addEventListener('change', function() {
            zombie.autobuyer.enabled = this.checked;
        });
        
        // FIXED: Setup the minimum input to work correctly and not update constantly
        const keepMinInput = autobuyerDiv.querySelector(`#z${type[0]}-keep-min`);
        keepMinInput.addEventListener('input', function() {
            const newValue = Math.max(0, parseInt(this.value) || 10);
            zombie.autobuyer.keepMinimum = newValue;
        });
        keepMinInput.addEventListener('blur', function() {
            this.value = zombie.autobuyer.keepMinimum;
        });

        card.appendChild(autobuyerDiv);
        container.appendChild(card);
    });
}

function updateZombieCardContent(productivityBoost) {
    const zombieTypes = [
        { type: 'fairies', prefix: 'zf', currency: 'Fairies', moleculeType: 'Unicorn' },
        { type: 'unicorns', prefix: 'zu', currency: 'Unicorns', moleculeType: 'Fairy' }
    ];

    zombieTypes.forEach(({ type, prefix, currency, moleculeType }) => {
        const zombie = gameState.zombies[type];

        // FIXED: Include prestige multiplier in base rate calculation
        const prestigeMultiplier = type === 'fairies' ? getPrestigeZombieFairiesMultiplier() : getPrestigeZombieUnicornsMultiplier();
        const baseRate = zombie.prodPower * prestigeMultiplier * productivityBoost;
        const totalProduction = zombie.amount * baseRate;
        const rainbowBoost = (gameState.rainbows.amount > 0 && 
                             ((type === 'fairies' && gameState.rainbows.makingFairies) || 
                              (type === 'unicorns' && !gameState.rainbows.makingFairies))) ? ', plus Rainbows' : '';

        const elements = {
            name: document.getElementById(`${prefix}-name`),
            production: document.getElementById(`${prefix}-production`),
            checkbox: document.getElementById(`autobuy-${prefix}-check`),
            input: document.getElementById(`${prefix}-keep-min`),
            label: document.getElementById(`autobuy-${prefix}-label`)
        };

        if (elements.name) elements.name.innerHTML = `Zombie ${currency}: ${formatQuantity(zombie.amount)}`;
        if (elements.production) elements.production.textContent = `${formatNumber(totalProduction)} ${moleculeType} Mol/sec (${formatNumber(baseRate)} each)${rainbowBoost}`;

        if (elements.label) {
            const prestigeUpgradeLevel = gameState.ascension.prestigeUpgrades[`more-zombie-${type}`] || 0;
            const effectiveRate = zombie.autobuyer.rate + (prestigeUpgradeLevel * 2);
            elements.label.innerHTML = `Autobuy ${effectiveRate}/sec unless there are `;
        }

        // Conditionally update controls to prevent UI interference
        if (elements.checkbox && elements.checkbox.checked !== zombie.autobuyer.enabled) {
            elements.checkbox.checked = zombie.autobuyer.enabled;
        }
        
        if (elements.input && document.activeElement !== elements.input) {
            if (parseInt(elements.input.value) !== zombie.autobuyer.keepMinimum) {
                elements.input.value = zombie.autobuyer.keepMinimum;
            }
        }
    });
}

// REMOVED: All manual zombie buying functions - zombies are now autobuy only

// Legacy compatibility - these functions are now empty
function buyZombieFairy() { 
    // Zombies can only be bought through autobuyers now
}
function buyZombieUnicorn() { 
    // Zombies can only be bought through autobuyers now
}