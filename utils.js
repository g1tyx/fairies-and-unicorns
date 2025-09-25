// UTILS.JS - Utilities and Formatting Functions

function formatNumber(num) {
    if (num < 1) {
        // For fractional numbers less than 1, show more precision
        return num.toFixed(3).replace(/\.?0+$/, '');
    }
    if (num < 1000) {
        // FIXED: For numbers 1-1000, show decimals if they're significant
        if (num === Math.floor(num)) {
            return num.toString();
        } else {
            // Show up to 2 decimal places, removing trailing zeros
            return num.toFixed(2).replace(/\.?0+$/, '');
        }
    }
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    let place = 0;
    while (num >= 1000 && place < suffixes.length - 1) { 
        num /= 1000; 
        place++; 
    }
    return num.toFixed(1) + suffixes[place];
}

// NEW: Format quantities (always show as integers for display)
function formatQuantity(num) {
    // Round to integer for display, but preserve calculation precision internally
    const rounded = Math.floor(num);
    
    if (rounded < 1000) {
        return rounded.toString();
    }
    
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    let place = 0;
    let workingNum = rounded;
    
    while (workingNum >= 1000 && place < suffixes.length - 1) { 
        workingNum /= 1000; 
        place++; 
    }
    return workingNum.toFixed(1) + suffixes[place];
}

// Bulk buying utility functions
function calculateBulkCost(baseCost, costMult, quantity) {
    if (quantity <= 0) return 0;
    if (costMult === 1) return baseCost * quantity;
    // FIXED: Remove Math.floor to preserve fractional costs
    return baseCost * (1 - Math.pow(costMult, quantity)) / (1 - costMult);
}

function calculateMaxAffordable(baseCost, costMult, currentCurrency) {
    if (currentCurrency < baseCost) return 0;
    if (costMult === 1) return Math.floor(currentCurrency / baseCost);
    
    let low = 1, high = 100, result = 0;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const cost = calculateBulkCost(baseCost, costMult, mid);
        if (cost <= currentCurrency) {
            result = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return result;
}

// Cost update functions
function updateFairyCost() {
    // FIXED: Costs in Fairies must be integers (round up)
    gameState.fairies.cost = Math.max(1, Math.ceil(10 * Math.pow(1.1, gameState.fairies.amount) * gameState.fairies.costIncreaser));
}

function updateUnicornCost() {
    // FIXED: Costs in Unicorns must be integers (round up)
    gameState.unicorns.cost = Math.max(1, Math.ceil(100 * Math.pow(1.1, gameState.unicorns.amount) * gameState.unicorns.costIncreaser));
}

function updateZombieFairyCost() {
    gameState.zombies.fairies.cost = gameState.zombies.fairies.baseCost;
}

function updateZombieUnicornCost() {
    gameState.zombies.unicorns.cost = gameState.zombies.unicorns.baseCost;
}

function updateRainbowCost() {
    gameState.rainbows.cost = Math.max(1, Math.floor(1000 * Math.pow(1.1, gameState.rainbows.amount)));
}

function updateQueenAcceleratorCost(index) {
    const accelerator = gameState.queenAccelerators[index];
    const template = PRODUCER_TEMPLATES.queenAccelerators[index];
    // FIXED: Preserve fractional costs - only round for display
    const theoreticalCost = accelerator.baseCost * Math.pow(template.costMult, accelerator.amount);
    accelerator.cost = Math.max(0.01, theoreticalCost);
}

function updateUpgradeSlotCosts() {
    const slotsPurchased = gameState.upgradeSlots.current - 3;
    // FIXED: Remove Math.floor to preserve fractional costs for upgrade slots
    const newCost = Math.max(1, 1000 * Math.pow(10, slotsPurchased));
    gameState.upgradeSlots.glitterSlotCost = newCost;
    gameState.upgradeSlots.stardustSlotCost = newCost;
}

function updateAutoclickerCost(type) {
    const ac = gameState.autoclickers[type];
    ac.realCost = ac.baseCost * Math.pow(ac.costMult, ac.amount);
    // FIXED: Costs in Fairies/Unicorns must be integers (round up)
    ac.cost = Math.max(1, Math.ceil(ac.realCost));
}

// Producer cost updates - FIXED to preserve fractional costs properly
function updateProducersCosts(producers) {
    producers.forEach(producer => {
        // Calculate the theoretical cost without rounding
        const theoreticalCost = producer.baseCost * Math.pow(producer.costMult, producer.amount);
        
        // FIXED: Always preserve fractional costs, only enforce minimum of 0.01
        producer.cost = Math.max(0.01, theoreticalCost);
    });
}

function updateGlitterProducersCosts() { 
    // FIXED: Glitter producers cost Fairies, so make costs integers (round up)
    gameState.glitterProducers.forEach((producer, index) => {
        const template = PRODUCER_TEMPLATES.glitterProducers[index];
        const theoreticalCost = producer.baseCost * Math.pow(template.costMult, producer.amount);
        producer.cost = Math.max(1, Math.ceil(theoreticalCost));
    });
}

function updateStardustProducersCosts() { 
    // FIXED: Stardust producers cost Unicorns, so make costs integers (round up)
    gameState.stardustProducers.forEach((producer, index) => {
        const template = PRODUCER_TEMPLATES.stardustProducers[index];
        const theoreticalCost = producer.baseCost * Math.pow(template.costMult, producer.amount);
        producer.cost = Math.max(1, Math.ceil(theoreticalCost));
    });
}

function updateCloudProducersCosts() {
    gameState.cloudProducers.forEach((producer, index) => {
        const template = PRODUCER_TEMPLATES.cloudProducers[index];
        const theoreticalCost = producer.baseCost * Math.pow(template.costMult, producer.amount);
        producer.cost = Math.max(0.01, theoreticalCost);
    });
}

function updateLeprechaunProducersCosts() {
    const costReduction = calculateAvariceCostReduction();
    gameState.leprechaunProducers.forEach((producer, index) => {
        const template = PRODUCER_TEMPLATES.leprechaunProducers[index];
        const theoreticalCost = producer.baseCost * Math.pow(template.costMult, producer.amount);
        
        if (index === 3) {
            // Avarice doesn't get its own cost reduction
            producer.cost = Math.max(0.01, theoreticalCost);
        } else {
            // Apply cost reduction to other producers
            const reducedCost = theoreticalCost * costReduction;
            
            // FIXED: Always preserve fractional costs, only enforce minimum of 0.01
            producer.cost = Math.max(0.01, reducedCost);
        }
    });
}

// Game state calculations
function isRainbowUnlocked() {
    return gameState.rainbowUnlocked;
}

function calculateQueenSpeed() {
    let totalSpeedMultiplier = 1;
    const doLog = Math.random() < 0.01;

    // Queen Accelerators with prestige bonus
    const queenAcceleratorsPowerMultiplier = getPrestigeQueenAcceleratorsPowerMultiplier();

    gameState.queenAccelerators.forEach(accelerator => {
        const effectiveSpeedBoost = accelerator.speedBoost * accelerator.productivityMult * queenAcceleratorsPowerMultiplier;
        totalSpeedMultiplier += accelerator.amount * effectiveSpeedBoost;
    });

    // New Shoes with prestige bonus
    if (isLeprechaunUnlocked()) {
        const newShoesEffect = gameState.leprechaunProducers[0].amount * gameState.leprechaunProducers[0].effect;
        const leprechaunEffectsMultiplier = getPrestigeLeprechaunEffectsMultiplier();
        const newShoesPowerMultiplier = getPrestigeNewShoesPowerMultiplier();
        const newShoesBonus = newShoesEffect * leprechaunEffectsMultiplier * newShoesPowerMultiplier;
        totalSpeedMultiplier += newShoesBonus;
    }

    // Royal Speed prestige bonus
    if (gameState.ascension.prestigeUpgrades['royal-speed']) {
        const prestigeBonus = Math.pow(2, gameState.ascension.prestigeUpgrades['royal-speed']);
        totalSpeedMultiplier *= prestigeBonus;
    }

    return totalSpeedMultiplier;
}

function calculateProductivityBoost() {
    // FIXED: Productivity boost is now equal to queen speed (was logarithmic before)
    return calculateQueenSpeed();
}

function calculateQueenDistanceReduction() {
    if (!isLeprechaunUnlocked()) return 0;
    const spaceShrinkageLevel = gameState.leprechaunProducers[1].amount;
    const reduction = spaceShrinkageLevel * gameState.leprechaunProducers[1].effect * getPrestigeLeprechaunEffectsMultiplier();
    // FIXED: Space Shrink max effect is 90%
    return Math.min(0.9, reduction);
}

// FIXED: Add the missing calculateEffectiveMaxDistance function
function calculateEffectiveMaxDistance() {
    const reduction = calculateQueenDistanceReduction();
    return gameState.queen.maxDistance * (1 - reduction);
}

// FIXED: This function calculates effective distance for time calculation purposes
// It's used internally for estimating arrival time, considering Space Shrink effects
function calculateEffectiveQueenDistance() {
    // Space Shrink reduces the total distance to travel, not a continuous factor
    const reduction = calculateQueenDistanceReduction();
    const totalEffectiveDistance = gameState.queen.maxDistance * (1 - reduction);
    const distanceTraveled = gameState.queen.maxDistance - gameState.queen.distance;
    const remainingEffectiveDistance = Math.max(0, totalEffectiveDistance - distanceTraveled);
    return remainingEffectiveDistance;
}

// NOTE: For UI display purposes, we show the real distance left (gameState.queen.distance)
// rather than the effective distance. This makes it clear to players how much actual
// distance the queen still needs to travel, regardless of Space Shrink effects.

// Bulk mode setters with visual updates
function updateBulkButtons(panelSelector, mode) {
    document.querySelectorAll(`${panelSelector} .bulk-btn`).forEach((btn, index) => {
        const modes = [1, 10, -1];
        btn.classList.toggle('active', modes[index] === mode);
    });
}

function setBulkMode(mode) {
    gameState.bulkMode = mode;
    updateBulkButtons('#glitter-panel', mode);
    updateGlitterProducers();
}

function setStardustBulkMode(mode) {
    gameState.stardustBulkMode = mode;
    updateBulkButtons('#stardust-panel', mode);
    updateStardustProducers();
}

function setCloudBulkMode(mode) {
    gameState.cloudBulkMode = mode;
    updateBulkButtons('#rainbow-panel', mode);
    updateCloudProducers();
}

function setZombieBulkMode(mode) {
    gameState.zombieBulkMode = mode;
    updateBulkButtons('#zombies-panel', mode);
    if (typeof setupZombieProducers === 'function') {
        setupZombieProducers();
    }
}

function setQueenBulkMode(mode) {
    gameState.queenBulkMode = mode;
    updateBulkButtons('#queen-panel', mode);
    updateQueenAccelerators();
}

function setLeprechaunBulkMode(mode) {
    gameState.leprechaunBulkMode = mode;
    updateBulkButtons('#leprechaun-panel', mode);
    updateLeprechaunProducers();
}

// FIXED: Added autoclicker bulk mode function
function setAutoclickerBulkMode(mode) {
    gameState.autoclickerBulkMode = mode;
    updateBulkButtons('#clickers-panel', mode);
    updateAutoclickers();
}

function restoreBulkModeStates() {
    const modes = [
        [setBulkMode, gameState.bulkMode || 1],
        [setStardustBulkMode, gameState.stardustBulkMode || 1],
        [setCloudBulkMode, gameState.cloudBulkMode || 1],
        [setZombieBulkMode, gameState.zombieBulkMode || 1],
        [setQueenBulkMode, gameState.queenBulkMode || 1],
        [setLeprechaunBulkMode, gameState.leprechaunBulkMode || 1],
        [setAutoclickerBulkMode, gameState.autoclickerBulkMode || 1] // FIXED: Added autoclicker bulk mode restoration
    ];
    modes.forEach(([func, mode]) => func(mode));
}

function getAllCostReductionMultipliers(producerId) {
    return game.upgrades
        .filter(u => u.purchased && u.effect && u.effect.costReduction && u.effect.targetId === producerId)
        .map(u => 1 - u.effect.costReduction);
}

function getProducerCost(producer, amount = 1) {
    let baseCost = producer.baseCost;
    let multiplier = producer.costMultiplier;
    let total = 0;

    const reductions = getAllCostReductionMultipliers(producer.id);
    const totalReduction = reductions.reduce((acc, r) => acc * r, 1);

    for (let i = 0; i < amount; i++) {
        let unitCost = baseCost * Math.pow(multiplier, producer.amount + i);
        unitCost *= totalReduction;
        unitCost = Math.max(unitCost, 0.01);  // Minimum cost is now 0.01 instead of 0.1
        total += unitCost;
    }

    return total;
}