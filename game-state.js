// GAME-STATE.JS - Game State Definition and Ascension System

function createInitialProducerState(producerType) {
    if (!window.PRODUCER_TEMPLATES || !window.PRODUCER_TEMPLATES[producerType]) {
        console.error(`PRODUCER_TEMPLATES for ${producerType} not found.`);
        return [];
    }
    return PRODUCER_TEMPLATES[producerType].map(template => {
        const dynamicState = {
            amount: 0,
            cost: template.initialCost,
            baseCost: template.initialCost,
        };
        if (template.hasOwnProperty('initialProduction')) {
            dynamicState.production = template.initialProduction;
        }
        if (template.hasOwnProperty('initialEffect')) {
            dynamicState.effect = template.initialEffect;
        }
        if (template.hasOwnProperty('initialSpeedBoost')) {
            dynamicState.speedBoost = template.initialSpeedBoost;
            dynamicState.productivityMult = 1;
        }
        return dynamicState;
    });
}

// Game state
var gameState = {
    gameWon: false,
    hasClickedFairy: false, hasClickedUnicorn: false,
    glitterUnlocked: false, stardustUnlocked: false, rainbowUnlocked: false, zombiesUnlocked: false, leprechaunUnlocked: false, royalChamberUnlocked: false, // NEW: persistent royal chamber unlock
    lastSaveTime: Date.now(),
    fairies: { amount: 0, progress: 0, cost: 10, prodPower: 1, costIncreaser: 1 },
    unicorns: { amount: 0, progress: 0, cost: 100, prodPower: 1, costIncreaser: 1 },
    glitter: 0, stardust: 0, gold: 0,
    rainbows: { amount: 0, progress: 0, cost: 1000, production: 1, makingFairies: true },
    queen: { distance: 100000000, speed: 1, maxDistance: 100000000 },
    upgradeBaseCosts: { glitter: 500, stardust: 500 },
    upgradePurchaseCounts: { glitter: 0, stardust: 0 },
    upgradeSlots: { current: 3, max: 8, glitterSlotCost: 1000, stardustSlotCost: 1000 },
    // FIXED: Initialize ALL upgrade costs to prevent undefined costs
    upgradeCosts: {
        fairies: 5, unicorns: 5, glitter: 500, stardust: 500, rainbows: 10,
        comets: 5, 'shooting-stars': 5, rockets: 5, 'string-theories': 5,
        'fairy-autoclickers': 5, 'unicorn-autoclickers': 5,
        'zombie-fairies': 100, 'zombie-unicorns': 100, leprechaun: 5
    },
    rerollCosts: { fairies: 5, unicorns: 5, rainbows: 5 },
    autoclickers: {
        fairies: { amount: 0, cost: 1, realCost: 1, baseCost: 1, costMult: 1.1, clicksPerSecond: 1 },
        unicorns: { amount: 0, cost: 1, realCost: 1, baseCost: 1, costMult: 1.1, clicksPerSecond: 1 }
    },
    zombies: {
        fairies: { amount: 0, cost: 2, baseCost: 2, prodPower: 1, costMult: 1.0, costIncreaser: 1, autobuyer: { enabled: false, rate: 1, progress: 0, keepMinimum: 10 } },
        unicorns: { amount: 0, cost: 2, baseCost: 2, prodPower: 1, costMult: 1.0, costIncreaser: 1, autobuyer: { enabled: false, rate: 1, progress: 0, keepMinimum: 10 } }
    },
    leprechaunProducers: createInitialProducerState('leprechaunProducers'),
    queenAccelerators: createInitialProducerState('queenAccelerators'),
    glitterProducers: createInitialProducerState('glitterProducers'),
    stardustProducers: createInitialProducerState('stardustProducers'),
    cloudProducers: createInitialProducerState('cloudProducers'),
    bulkMode: 1, stardustBulkMode: 1, cloudBulkMode: 1, zombieBulkMode: 1, queenBulkMode: 1, leprechaunBulkMode: 1, autoclickerBulkMode: 1, // FIXED: Added autoclicker bulk mode
    upgrades: [], upgradesSeed: Math.random(),
    // NEW: Ascension/Prestige System
    ascension: {
        royalEssence: 0,
        totalGoldGenerated: 0,
        runStartTime: Date.now(),
        totalAscensions: 0,
        // Prestige upgrades purchased
        prestigeUpgrades: {},
        // Milestones achieved
        milestones: {}
    },
    stats: {
        gameStartTime: Date.now(), timePlayed: 0, totalTimePlayed: 0, fairyClicks: 0, unicornClicks: 0,
        fairyRerolls: 0, unicornRerolls: 0, rainbowRerolls: 0, totalFairies: 0, totalUnicorns: 0,
        totalZombies: 0, totalAutoclickers: 0, totalGlitter: 0, totalStardust: 0, totalRainbows: 0,
        totalAccelerators: 0, totalGold: 0, glitterProducersBuilt: 0, stardustProducersBuilt: 0,
        cloudProducersBuilt: 0, leprechaunProducersBuilt: 0, productionUpgrades: 0, costUpgrades: 0,
        specialUpgrades: 0, totalUpgrades: 0, saveCount: 0, maxQueenSpeed: 1, totalDistanceTraveled: 0
    },
    oneTimeUpgradesPurchased: {}
};

// NEW: Ascension system functions
function isAscensionUnlocked() {
    // FIXED: Royal Chamber unlocks when you can ascend (have royal essence gain > 0) OR already unlocked permanently
    return gameState.royalChamberUnlocked || calculateRoyalEssence() > 0;
}

function calculateRoyalEssence() {
    if (!isLeprechaunUnlocked()) return 0;
    
    // FIXED: New formula components
    const distanceTraveled = gameState.queen.maxDistance - gameState.queen.distance;
    const currentGold = gameState.gold;
    const timeInRun = (Date.now() - gameState.ascension.runStartTime) / 1000; // seconds
    const timeInMinutes = timeInRun / 60; // convert to minutes
    
    // FIXED: New formula: √(distance traveled) + √(gold) + √(time in minutes)
    const distanceComponent = Math.sqrt(distanceTraveled);
    const goldComponent = Math.sqrt(currentGold);
    const timeComponent = Math.sqrt(timeInMinutes);
    
    const rawEssence = distanceComponent + goldComponent + timeComponent;
    
    // Apply prestige bonuses if any
    let essenceMultiplier = 1;
    if (gameState.ascension.prestigeUpgrades['royal-gathering']) {
        essenceMultiplier *= (1 + gameState.ascension.prestigeUpgrades['royal-gathering'] * 0.25);
    }
    
    // FIXED: Apply Math.floor() to ensure integer result
    return Math.floor(rawEssence * essenceMultiplier);
}

function performAscension() {
    const royalEssenceGained = calculateRoyalEssence();
    
    if (royalEssenceGained <= 0) {
        alert('You need to make more progress before ascending!');
        return;
    }
    
    // Gain Royal Essence
    gameState.ascension.royalEssence += royalEssenceGained;
    gameState.ascension.totalAscensions++;
    
    // NEW: Unlock Royal Chamber permanently after first ascension
    gameState.royalChamberUnlocked = true;
    
    // FIXED: Preserve Queen distance traveled
    const distanceTraveled = gameState.queen.maxDistance - gameState.queen.distance;
    
    // Reset everything except prestige stuff
    const preservedData = {
        // Prestige data
        royalEssence: gameState.ascension.royalEssence,
        totalAscensions: gameState.ascension.totalAscensions,
        prestigeUpgrades: { ...gameState.ascension.prestigeUpgrades },
        milestones: { ...gameState.ascension.milestones },
        // Upgrade slots purchased
        upgradeSlots: { ...gameState.upgradeSlots },
        // Royal Chamber unlock status
        royalChamberUnlocked: gameState.royalChamberUnlocked,
        // FIXED: Preserve distance traveled
        distanceTraveled: distanceTraveled,
        // Game meta
        stats: { 
            ...gameState.stats,
            totalTimePlayed: (gameState.stats.totalTimePlayed || 0) + (Date.now() - gameState.stats.gameStartTime),
            gameStartTime: Date.now() // Reset run timer
        },
        // Preserve bulk mode settings
        bulkMode: gameState.bulkMode,
        stardustBulkMode: gameState.stardustBulkMode,
        cloudBulkMode: gameState.cloudBulkMode,
        zombieBulkMode: gameState.zombieBulkMode,
        queenBulkMode: gameState.queenBulkMode,
        leprechaunBulkMode: gameState.leprechaunBulkMode,
        autoclickerBulkMode: gameState.autoclickerBulkMode
    };
    
    // Full reset to initial state
    const newGameState = {
        hasClickedFairy: false, hasClickedUnicorn: false,
        glitterUnlocked: false, stardustUnlocked: false, rainbowUnlocked: false, zombiesUnlocked: false, leprechaunUnlocked: false,
        royalChamberUnlocked: preservedData.royalChamberUnlocked, // Preserve unlock status
        lastSaveTime: Date.now(),
        fairies: { amount: 0, progress: 0, cost: 10, prodPower: 1, costIncreaser: 1 },
        unicorns: { amount: 0, progress: 0, cost: 100, prodPower: 1, costIncreaser: 1 },
        glitter: 0, stardust: 0, gold: 0,
        rainbows: { amount: 0, progress: 0, cost: 1000, production: 1, makingFairies: true },
        // FIXED: Set Queen distance to maintain traveled distance
        queen: { 
            distance: 100000000 - preservedData.distanceTraveled, 
            speed: 1, 
            maxDistance: 100000000 
        },
        upgradeBaseCosts: { glitter: 500, stardust: 500 },
        upgradePurchaseCounts: { glitter: 0, stardust: 0 },
        upgradeSlots: preservedData.upgradeSlots,
        upgradeCosts: {
            fairies: 5, unicorns: 5, glitter: 500, stardust: 500, rainbows: 10,
            comets: 5, 'shooting-stars': 5, rockets: 5, 'string-theories': 5,
            'fairy-autoclickers': 5, 'unicorn-autoclickers': 5,
            'zombie-fairies': 100, 'zombie-unicorns': 100, leprechaun: 5
        },
        rerollCosts: { fairies: 5, unicorns: 5, rainbows: 5 },
        autoclickers: {
            fairies: { amount: 0, cost: 1, realCost: 1, baseCost: 1, costMult: 1.1, clicksPerSecond: 1 },
            unicorns: { amount: 0, cost: 1, realCost: 1, baseCost: 1, costMult: 1.1, clicksPerSecond: 1 }
        },
        zombies: {
            fairies: { amount: 0, cost: 2, baseCost: 2, prodPower: 1, costMult: 1.0, costIncreaser: 1, autobuyer: { enabled: false, rate: 1, progress: 0, keepMinimum: 10 } },
            unicorns: { amount: 0, cost: 2, baseCost: 2, prodPower: 1, costMult: 1.0, costIncreaser: 1, autobuyer: { enabled: false, rate: 1, progress: 0, keepMinimum: 10 } }
        },
        leprechaunProducers: createInitialProducerState('leprechaunProducers'),
        queenAccelerators: createInitialProducerState('queenAccelerators'),
        glitterProducers: createInitialProducerState('glitterProducers'),
        stardustProducers: createInitialProducerState('stardustProducers'),
        cloudProducers: createInitialProducerState('cloudProducers'),
        bulkMode: preservedData.bulkMode || 1,
        stardustBulkMode: preservedData.stardustBulkMode || 1,
        cloudBulkMode: preservedData.cloudBulkMode || 1,
        zombieBulkMode: preservedData.zombieBulkMode || 1,
        queenBulkMode: preservedData.queenBulkMode || 1,
        leprechaunBulkMode: preservedData.leprechaunBulkMode || 1,
        autoclickerBulkMode: preservedData.autoclickerBulkMode || 1,
        upgrades: [], upgradesSeed: Math.random(),
        ascension: {
            royalEssence: preservedData.royalEssence,
            totalGoldGenerated: 0,
            runStartTime: Date.now(),
            totalAscensions: preservedData.totalAscensions,
            prestigeUpgrades: preservedData.prestigeUpgrades,
            milestones: preservedData.milestones
        },
        stats: preservedData.stats,
        // FIXED: Reset oneTimeUpgradesPurchased to allow unlock upgrades to appear again
        oneTimeUpgradesPurchased: {}
    };
    
    // Apply prestige bonuses to initial state
    applyPrestigeBonuses(newGameState, true);
    
    // Replace gameState
    Object.assign(gameState, newGameState);
    gameState.ascension.justAscended = true;
    
    // Show ascension results
    showAscensionResults(royalEssenceGained);
    
    // Update everything
    updateDisplay();
    generateUpgrades();
    
    // FIXED: Force immediate update of upgrade button states after ascension
    setTimeout(() => {
        if (typeof updateUpgradeButtonStates === 'function') {
            updateUpgradeButtonStates();
        }
        if (typeof updateRerollButtonStates === 'function') {
            updateRerollButtonStates();
        }
        // FIXED: Also update prestige upgrade buttons
        if (typeof updatePrestigeUpgradesDisplay === 'function') {
            updatePrestigeUpgradesDisplay();
        }
        // Restore bulk mode buttons UI
        if (typeof restoreBulkModeStates === 'function') {
            restoreBulkModeStates();
        }
    }, 100);
    
    // Auto-save after ascension
    setTimeout(autoSave, 1000);
}

function applyPrestigeBonuses(state, isAscension = false) {
    const p = state.ascension.prestigeUpgrades;
    
    // Starting Resources (these are safe to apply directly since they only happen once at start)
    if (isAscension) {
        if (p['rainbow-genesis']) {
            state.rainbows.amount += p['rainbow-genesis'];
        }
        if (p['fairies-favor']) {
            state.fairies.amount += 10 * p['fairies-favor'];
        }
        if (p['unicorns-favor']) {
            state.unicorns.amount += 10 * p['unicorns-favor'];
        }
        if (p['glitter-galore']) {
            state.glitter += 1000 * p['glitter-galore'];
        }
        if (p['stardust-galore']) {
            state.stardust += 1000 * p['stardust-galore'];
        }
        if (p['auto-autoclickers']) {
            state.autoclickers.fairies.amount += 10 * p['auto-autoclickers'];
            state.autoclickers.unicorns.amount += 10 * p['auto-autoclickers'];
        }
    }
    
    // Royal Speed bonus is applied in calculateQueenSpeed()
}

// NEW: Dynamic prestige bonus calculation functions
function getPrestigeFairyMasteryBonus() {
    const level = gameState.ascension.prestigeUpgrades['fairy-mastery'] || 0;
    return level; // +1 per level
}

function getPrestigeUnicornMasteryBonus() {
    const level = gameState.ascension.prestigeUpgrades['unicorn-mastery'] || 0;
    return level; // +1 per level
}

function getPrestigeAutoclickersSpeedMultiplier() {
    const level = gameState.ascension.prestigeUpgrades['autoclickers-speed'] || 0;
    return Math.pow(2, level); // 2^level
}

function getPrestigeGlitterProductionMultiplier() {
    const level = gameState.ascension.prestigeUpgrades['glitter-production'] || 0;
    return 1 + (level * 0.25); // +25% per level
}

function getPrestigeStardustProductionMultiplier() {
    const level = gameState.ascension.prestigeUpgrades['stardust-production'] || 0;
    return 1 + (level * 0.25); // +25% per level
}

function getPrestigeRainbowMoleculeBonus() {
    const level = gameState.ascension.prestigeUpgrades['rainbows-molecule-production'] || 0;
    return level; // +1 per Rainbow per level
}

function getPrestigeRainbowGoldMultiplier() {
    const level = gameState.ascension.prestigeUpgrades['rainbows-gold-production'] || 0;
    return 1 + (level * 0.25); // +25% per level
}

function getPrestigeCloudsProductionMultiplier() {
    const level = gameState.ascension.prestigeUpgrades['clouds-production'] || 0;
    return 1 + (level * 0.25); // +25% per level
}

function getPrestigeZombieFairiesMultiplier() {
    const level = gameState.ascension.prestigeUpgrades['zombie-fairies-production'] || 0;
    return Math.pow(2, level); // 2^level
}

function getPrestigeZombieUnicornsMultiplier() {
    const level = gameState.ascension.prestigeUpgrades['zombie-unicorns-production'] || 0;
    return Math.pow(2, level); // 2^level
}

function getPrestigeLeprechaunEffectsMultiplier() {
    const level = gameState.ascension.prestigeUpgrades['leprechaun-effects'] || 0;
    return 1 + (level * 0.25); // +25% per level
}

// NEW: Queen and Gold prestige bonuses
function getPrestigeQueenAcceleratorsPowerMultiplier() {
    const level = gameState.ascension.prestigeUpgrades['queen-accelerators-power'] || 0;
    return 1 + (level * 0.5); // +50% per level
}

function getPrestigeNewShoesPowerMultiplier() {
    const level = gameState.ascension.prestigeUpgrades['new-shoes-power'] || 0;
    return 1 + (level * 0.5); // +50% per level
}

function getPrestigeTrickeryPowerMultiplier() {
    const level = gameState.ascension.prestigeUpgrades['trickery-power'] || 0;
    return 1 + (level * 0.5); // +50% per level
}

// NEW: Meta progression bonuses
function getPrestigeOfflineMasteryBonus() {
    const level = gameState.ascension.prestigeUpgrades['offline-mastery'] || 0;
    return level * 0.1; // +10% per level (added to base 50%)
}

function showAscensionResults(essenceGained) {
    const modal = document.getElementById('ascension-results-modal');
    if (!modal) return;
    
    document.getElementById('essence-gained').textContent = formatNumber(essenceGained);
    document.getElementById('total-essence').textContent = formatNumber(gameState.ascension.royalEssence);
    document.getElementById('ascension-count').textContent = formatNumber(gameState.ascension.totalAscensions);
    
    modal.style.display = 'flex';
}

function closeAscensionResults() {
    document.getElementById('ascension-results-modal').style.display = 'none';
}

function showAscensionConfirmation() {
    const essenceGain = calculateRoyalEssence();
    if (essenceGain <= 0) {
        alert('You need to make more progress before ascending!');
        return;
    }
    
    const modal = document.getElementById('ascension-confirm-modal');
    if (!modal) return;
    
    document.getElementById('essence-preview').textContent = formatNumber(essenceGain);
    
    // Show what will be lost
    const lostList = document.getElementById('ascension-lost');
    lostList.innerHTML = `
        <li>All Fairies and Unicorns (${formatNumber(gameState.fairies.amount)} and ${formatNumber(gameState.unicorns.amount)})</li>
        <li>All Resources (${formatNumber(gameState.glitter)} Glitter, ${formatNumber(gameState.stardust)} Stardust, ${formatNumber(gameState.gold)} Gold)</li>
        <li>All Rainbows (${formatNumber(gameState.rainbows.amount)})</li>
        <li>All Producers and their amounts</li>
        <li>All purchased upgrades</li>
    `;
    
    // Show what will be kept - FIXED: Include distance traveled
    const distanceTraveled = gameState.queen.maxDistance - gameState.queen.distance;
    const keptList = document.getElementById('ascension-kept');
    keptList.innerHTML = `
        <li>Royal Essence: ${formatNumber(gameState.ascension.royalEssence)} + ${formatNumber(essenceGain)} = ${formatNumber(gameState.ascension.royalEssence + essenceGain)}</li>
        <li>Upgrade Slots purchased (${gameState.upgradeSlots.current})</li>
        <li>Queen distance traveled (${formatNumber(distanceTraveled)} leagues)</li>
        <li>All Prestige Upgrades and Milestones</li>
        <li>Your game knowledge and experience</li>
    `;
    
    modal.style.display = 'flex';
}

function closeAscensionConfirm() {
    document.getElementById('ascension-confirm-modal').style.display = 'none';
}

function confirmAscension() {
    closeAscensionConfirm();
    performAscension();
}

// Core calculation functions
function isLeprechaunUnlocked() {
    return gameState.leprechaunUnlocked;
}

function calculateGoldProduction() {
    if (!isLeprechaunUnlocked()) return 0;

    let baseProduction = gameState.rainbows.amount * 0.1;

    // Apply Trickery bonus with prestige multiplier
    const trickeryAmount = gameState.leprechaunProducers[2].amount;
    const trickeryEffect = gameState.leprechaunProducers[2].effect;
    const leprechaunEffectsMultiplier = getPrestigeLeprechaunEffectsMultiplier();
    const trickeryPowerMultiplier = getPrestigeTrickeryPowerMultiplier();

    // The bonus per level is the base effect, boosted by prestige upgrades.
    // The calculation is now additive for each level of Trickery.
    const bonusPerLevel = trickeryEffect * leprechaunEffectsMultiplier * trickeryPowerMultiplier;
    const totalTrickeryMultiplier = 1 + (trickeryAmount * bonusPerLevel);

    // Apply prestige bonus for Rainbows Gold Production
    let goldMultiplier = getPrestigeRainbowGoldMultiplier();

    return baseProduction * totalTrickeryMultiplier * goldMultiplier;
}

function calculateAvariceCostReduction() {
    const avariceLevel = gameState.leprechaunProducers[3].amount;
    const reduction = avariceLevel * gameState.leprechaunProducers[3].effect * getPrestigeLeprechaunEffectsMultiplier();
    // FIXED: Max reduction is 99%
    const maxReduction = 0.99;
    return Math.max(0.01, 1 - Math.min(reduction, maxReduction));
}

function calculateManualClickPower() {
    const fairyClicksPerSec = gameState.autoclickers.fairies.clicksPerSecond * getPrestigeAutoclickersSpeedMultiplier();
    const unicornClicksPerSec = gameState.autoclickers.unicorns.clicksPerSecond * getPrestigeAutoclickersSpeedMultiplier();
    
    return {
        fairy: 1 + Math.max(0, fairyClicksPerSec - 1),
        unicorn: 1 + Math.max(0, unicornClicksPerSec - 1)
    };
}

// Testing functions
function giveTestingResources() {
    gameState.glitter += 20000; 
    gameState.stardust += 20000; 
    gameState.rainbows.amount = 30;
    gameState.fairies.amount += 100; 
    gameState.unicorns.amount += 100;
    gameState.zombies.fairies.amount += 10000; 
    gameState.zombies.unicorns.amount += 10000;
    gameState.queenAccelerators.forEach(acc => acc.amount += 10);
    gameState.gold += 1000;
    updateDisplay();
}

function megaResources() {
    gameState.glitter = gameState.stardust = 1000000;
    updateDisplay();
}

function debugCosts() {





    
    updateFairyCost(); 
    updateUnicornCost(); 
    updateDisplay();
}

function testUpgradeSlots() {
    gameState.upgradeSlots.current = gameState.upgradeSlots.max = 8;
    generateUpgrades(); 
    updateDisplay();
}

// Testing function for Ascension
function giveAscensionPrereqs() {
    gameState.zombies.fairies.amount = 5000;
    gameState.zombies.unicorns.amount = 5000;
    gameState.queen.distance = 50000000; // Half way
    gameState.gold = 1000;
    gameState.ascension.totalGoldGenerated = 5000;
    updateDisplay();

}

// Testing function to reproduce the exact production bug scenario
function reproduceProductionBug() {
    // Set up the exact scenario from the bug report
    gameState.fairies.amount = 125;
    gameState.unicorns.amount = 101;
    gameState.zombies.fairies.amount = 12400;
    gameState.zombies.unicorns.amount = 13300;
    gameState.rainbows.amount = 482;  // So rainbow boost = 482
    gameState.rainbows.makingFairies = true;  // Boosting fairies
    
    // Estimated values to get close to the reported individual production rates
    gameState.fairies.prodPower = 3;  // Will be boosted by productivity
    gameState.unicorns.prodPower = 6; // Will be boosted by productivity  
    gameState.zombies.fairies.prodPower = 3;
    gameState.zombies.unicorns.prodPower = 3;
    
    updateDisplay();
    







}
