// UPGRADES.JS - Upgrade System Management

// Flag to prevent multiple upgrade purchases
let upgradeBeingPurchased = false;

function generateUpgrades() {
    // DEBUG: Log upgrade costs al inicio de generateUpgrades

    
    Math.seedrandom = Math.seedrandom || function(seed) {
        const m = 0x80000000, a = 1103515245, c = 12345;
        let state = seed ? seed : Math.floor(Math.random() * (m - 1));
        return function() {
            state = (a * state + c) % m;
            return state / (m - 1);
        };
    };
    
    const rng = Math.seedrandom(gameState.upgradesSeed);
    const templates = getUpgradeTemplates();
    const availableTemplates = templates.filter(template => template.condition());
    
    gameState.upgrades = [];
    // FIXED: Track only unlock upgrades to prevent duplicates
    const usedUnlockUpgrades = new Set();
    
    for (let i = 0; i < gameState.upgradeSlots.current; i++) {
        if (availableTemplates.length === 0) break;
        
        // FIXED: Filter out unlock upgrades that have already been used
        const validTemplates = availableTemplates.filter(template => {
            // Check if this is an unlock upgrade
            const isUnlockUpgrade = template.name.startsWith('Unlock ') && template.name.endsWith('!');
            
            // If it's an unlock upgrade and already used, exclude it
            if (isUnlockUpgrade && usedUnlockUpgrades.has(template.name)) {
                return false;
            }
            
            // Otherwise, it's valid
            return true;
        });
        
        if (validTemplates.length === 0) break;
        
        const template = validTemplates[Math.floor(rng() * validTemplates.length)];
        
        const freshUpgrade = {
            name: template.name,
            description: template.description,
            cost: typeof template.cost === 'function' ? template.cost() : template.cost,
            currency: typeof template.currency === 'function' ? template.currency() : template.currency,
            effect: template.effect,
            // NEW: Copy dual currency info if present
            dualCurrency: template.dualCurrency || null
        };
        
        if (!freshUpgrade.currency || isNaN(freshUpgrade.cost) || typeof freshUpgrade.effect !== 'function') {

            continue;
        }
        
        gameState.upgrades.push(freshUpgrade);
        
        // FIXED: Track unlock upgrades to prevent duplicates (but allow other duplicates)
        const isUnlockUpgrade = template.name.startsWith('Unlock ') && template.name.endsWith('!');
        if (isUnlockUpgrade) {
            usedUnlockUpgrades.add(template.name);
        }
    }
    
    // DEBUG: Log upgrade costs al final de generateUpgrades

    
    updateUpgrades();
}

// NEW: Helper function to get current amount of any currency
function getCurrencyAmount(currencyType) {
    const currencyMap = {
        'fairies': gameState.fairies.amount,
        'unicorns': gameState.unicorns.amount,
        'glitter': gameState.glitter,
        'stardust': gameState.stardust,
        'rainbows': gameState.rainbows.amount,
        'comets': gameState.queenAccelerators[0].amount,
        'shooting-stars': gameState.queenAccelerators[1].amount,
        'rockets': gameState.queenAccelerators[2].amount,
        'string-theories': gameState.queenAccelerators[3].amount,
        'fairy-autoclickers': gameState.autoclickers.fairies.amount,
        'unicorn-autoclickers': gameState.autoclickers.unicorns.amount,
        'zombie-fairies': gameState.zombies.fairies.amount,
        'zombie-unicorns': gameState.zombies.unicorns.amount
    };
    return currencyMap[currencyType] || 0;
}

// NEW: Helper function to get currency display name
function getCurrencyDisplayName(currencyType) {
    const displayMap = {
        'fairies': 'Fairies', 'unicorns': 'Unicorns', 'glitter': 'Glitter', 'stardust': 'Stardust',
        'rainbows': 'Rainbows', 'comets': 'Comets', 'shooting-stars': 'Shooting Stars', 'rockets': 'Rockets',
        'string-theories': 'String Theories', 'fairy-autoclickers': 'Fairy Autoclickers', 'unicorn-autoclickers': 'Unicorn Autoclickers',
        'zombie-fairies': 'Zombie Fairies', 'zombie-unicorns': 'Zombie Unicorns'
    };
    return displayMap[currencyType] || 'Unknown Currency';
}

// FIXED: New function to setup event listeners properly
function setupUpgradeEventListeners() {

    document.querySelectorAll('.upgrade-buy-btn').forEach(button => {
        const index = parseInt(button.dataset.index);
        
        // Remove any existing event listeners
        if (button._clickHandler) {
            button.removeEventListener('click', button._clickHandler);
        }
        
        // Create new event handler
        button._clickHandler = function(event) { 
            event.preventDefault();
            event.stopPropagation();

            buyUpgrade(index); 
        };
        
        // Add the new event listener
        button.addEventListener('click', button._clickHandler);
        

    });
}

function updateUpgrades() {
    const container = document.getElementById('upgrades-container');
    container.innerHTML = '';
    
    const headerContainer = document.createElement('div');
    headerContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';
    
    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><img src="images/Upgrades.png" alt="Upgrades" style="width: 32px; height: 32px;" onerror="this.style.display=\'none\';"><h2 style="margin: 0;">Upgrades</h2></div>';
    
    const rerollContainer = document.createElement('div');
    rerollContainer.style.cssText = 'display: flex; gap: 5px;';
    rerollContainer.id = 'reroll-buttons';
    
    // Create reroll buttons with dynamic content
    const fairyRerollBtn = document.createElement('button');
    fairyRerollBtn.className = 'buy-button reroll-btn';
    fairyRerollBtn.style.cssText = 'width: 150px; font-size: 0.8em; padding: 6px 8px;';
    fairyRerollBtn.id = 'reroll-fairies';
    fairyRerollBtn.onclick = rerollWithFairies;
    
    const unicornRerollBtn = document.createElement('button');
    unicornRerollBtn.className = 'buy-button reroll-btn';
    unicornRerollBtn.style.cssText = 'width: 150px; font-size: 0.8em; padding: 6px 8px;';
    unicornRerollBtn.id = 'reroll-unicorns';
    unicornRerollBtn.onclick = rerollWithUnicorns;
    
    const rainbowRerollBtn = document.createElement('button');
    rainbowRerollBtn.className = 'buy-button reroll-btn';
    rainbowRerollBtn.style.cssText = 'width: 150px; font-size: 0.8em; padding: 6px 8px;';
    rainbowRerollBtn.id = 'reroll-rainbows';
    rainbowRerollBtn.onclick = rerollWithRainbows;
    
    rerollContainer.appendChild(fairyRerollBtn);
    rerollContainer.appendChild(unicornRerollBtn);
    rerollContainer.appendChild(rainbowRerollBtn);
    
    headerContainer.appendChild(titleDiv);
    headerContainer.appendChild(rerollContainer);
    container.appendChild(headerContainer);
    
    const upgradesGrid = document.createElement('div');
    upgradesGrid.className = 'upgrades-grid';
    upgradesGrid.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; justify-items: center; justify-content: center; max-width: 800px; margin: 0 auto;';
    
    gameState.upgrades.forEach((upgrade, index) => {
        // FIXED: Handle dual currency display and affordability
        let canAfford = false;
        let buttonText = '';
        
        if (upgrade.dualCurrency) {
            // Dual currency upgrade
            const amount1 = getCurrencyAmount(upgrade.dualCurrency.currency1);
            const amount2 = getCurrencyAmount(upgrade.dualCurrency.currency2);
            const name1 = getCurrencyDisplayName(upgrade.dualCurrency.currency1);
            const name2 = getCurrencyDisplayName(upgrade.dualCurrency.currency2);
            
            canAfford = (amount1 >= upgrade.dualCurrency.cost1) && (amount2 >= upgrade.dualCurrency.cost2);
            
            // FIXED: Round up costs for Fairies and Unicorns in dual currency
            const cost1 = (upgrade.dualCurrency.currency1 === 'fairies' || upgrade.dualCurrency.currency1 === 'unicorns') 
                ? Math.ceil(upgrade.dualCurrency.cost1) : upgrade.dualCurrency.cost1;
            const cost2 = (upgrade.dualCurrency.currency2 === 'fairies' || upgrade.dualCurrency.currency2 === 'unicorns') 
                ? Math.ceil(upgrade.dualCurrency.cost2) : upgrade.dualCurrency.cost2;
            
            buttonText = `Buy for ${formatNumber(cost1)} ${name1} + ${formatNumber(cost2)} ${name2}`;
        } else {
            // Single currency upgrade
            const currentAmount = getCurrencyAmount(upgrade.currency);
            const currencyDisplayName = getCurrencyDisplayName(upgrade.currency);
            
            canAfford = currentAmount >= upgrade.cost;
            
            // FIXED: Round up costs for Fairies and Unicorns in single currency
            const displayCost = (upgrade.currency === 'fairies' || upgrade.currency === 'unicorns') 
                ? Math.ceil(upgrade.cost) : upgrade.cost;
            
            buttonText = `Buy for ${formatNumber(displayCost)} ${currencyDisplayName}`;
        }
        
        const currencyIcons = {
            'fairies': 'images/Fairy.png', 'unicorns': 'images/Unicorn.png', 'glitter': 'images/Glitter.png', 'stardust': 'images/Stardust.png',
            'rainbows': 'images/Rainbow.png', 'comets': '☄️', 'shooting-stars': '⭐', 'rockets': '🚀',
            'string-theories': '🌌', 'fairy-autoclickers': 'images/Fairy.png', 'unicorn-autoclickers': 'images/Unicorn.png',
            'zombie-fairies': 'images/ZombieFairy.png', 'zombie-unicorns': 'images/ZombieUnicorn.png'
        };
        
        const getUpgradeIcon = (upgrade, currencyIcon) => {
            // Special images for specific upgrades
            if (upgrade.name === 'Clouds Production Boost' || upgrade.name === 'Clouds Cost Reduction') {
                return `<img src="images/WingedCloud.png" alt="Cloud" style="width: 100%; height: 100%; border-radius: 15px; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='☁️';">`;
            }
            
            // FIXED: Special images for unlock upgrades
            if (upgrade.name === 'Unlock Rainbows!') {
                return `<img src="images/Rainbow.png" alt="Rainbow" style="width: 100%; height: 100%; border-radius: 15px; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='🌈';">`;
            }
            if (upgrade.name === 'Unlock Zombies!') {
                return `<img src="images/ZombieChimera.png" alt="Zombie" style="width: 100%; height: 100%; border-radius: 15px; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='🧟';">`;
            }
            if (upgrade.name === 'Unlock Leprechaun!') {
                return `<img src="images/LeprechaunMain.png" alt="Leprechaun" style="width: 100%; height: 100%; border-radius: 15px; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='🍀';">`;
            }
            if (upgrade.name === 'Unlock the Royal Chamber!') {
                return `<img src="images/QueenCrown.png" alt="Royal Chamber" style="width: 100%; height: 100%; border-radius: 15px; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='👑';">`;
            }
            
            // If currencyIcon is an image path, use it
            if (currencyIcon.startsWith('images/')) {
                return `<img src="${currencyIcon}" alt="Upgrade" style="width: 100%; height: 100%; border-radius: 15px; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='💰';">`;
            }
            
            // Otherwise use the emoji
            return currencyIcon;
        };
        
        const currencyIcon = currencyIcons[upgrade.currency] || '💰';
        const iconContent = getUpgradeIcon(upgrade, currencyIcon);
        
        const card = document.createElement('div');
        card.className = 'producer-card';
        card.style.cssText = 'min-height: 160px; display: flex; flex-direction: column; justify-content: space-between;';
        
        card.innerHTML = `
            <div class="producer-icon" style="font-size: 1.8em; margin-bottom: 6px;">${iconContent}</div>
            <div class="producer-name" style="font-size: 0.85em; margin-bottom: 6px;"><strong>${upgrade.name}</strong></div>
            <div class="producer-production" style="font-size: 0.75em; margin-bottom: 8px; line-height: 1.1;">${upgrade.description}</div>
            <button class="buy-button upgrade-buy-btn" data-index="${index}" ${!canAfford ? 'disabled' : ''} style="margin-top: auto; font-size: 0.75em; padding: 4px;">
                ${buttonText}
            </button>
        `;
        
        upgradesGrid.appendChild(card);
    });
    
    container.appendChild(upgradesGrid);
    
    // Set up event listeners and update button states
    setupUpgradeEventListeners();
    updateUpgradeButtonStates();
    updateRerollButtonStates();
}

function updateRerollButtonStates() {
    const fairyBtn = document.getElementById('reroll-fairies');
    const unicornBtn = document.getElementById('reroll-unicorns');
    const rainbowBtn = document.getElementById('reroll-rainbows');
    
    if (fairyBtn) {
        // FIXED: Round up fairy reroll costs to integers
        const fairyCost = Math.ceil(gameState.rerollCosts.fairies);
        fairyBtn.textContent = `Reroll for ${formatNumber(fairyCost)} Fairies`;
        fairyBtn.disabled = gameState.fairies.amount < fairyCost;
    }
    
    if (unicornBtn) {
        // FIXED: Round up unicorn reroll costs to integers
        const unicornCost = Math.ceil(gameState.rerollCosts.unicorns);
        unicornBtn.textContent = `Reroll for ${formatNumber(unicornCost)} Unicorns`;
        unicornBtn.disabled = gameState.unicorns.amount < unicornCost;
    }
    
    if (rainbowBtn) {
        // FIXED: Round up rainbow reroll costs to integers
        const rainbowCost = Math.ceil(gameState.rerollCosts.rainbows);
        rainbowBtn.textContent = `Reroll for ${formatNumber(rainbowCost)} Rainbows`;
        rainbowBtn.disabled = gameState.rainbows.amount < rainbowCost;
    }
}

function updateUpgradeButtonStates() {
    document.querySelectorAll('.upgrade-buy-btn').forEach(button => {
        const index = parseInt(button.dataset.index);
        if (index < gameState.upgrades.length) {
            const upgrade = gameState.upgrades[index];
            let canAfford = false;
            
            if (upgrade.dualCurrency) {
                // FIXED: Check dual currency affordability with rounded costs for Fairies/Unicorns
                const amount1 = getCurrencyAmount(upgrade.dualCurrency.currency1);
                const amount2 = getCurrencyAmount(upgrade.dualCurrency.currency2);
                const cost1 = (upgrade.dualCurrency.currency1 === 'fairies' || upgrade.dualCurrency.currency1 === 'unicorns') 
                    ? Math.ceil(upgrade.dualCurrency.cost1) : upgrade.dualCurrency.cost1;
                const cost2 = (upgrade.dualCurrency.currency2 === 'fairies' || upgrade.dualCurrency.currency2 === 'unicorns') 
                    ? Math.ceil(upgrade.dualCurrency.cost2) : upgrade.dualCurrency.cost2;
                canAfford = (amount1 >= cost1) && (amount2 >= cost2);
            } else {
                // FIXED: Single currency affordability with rounded costs for Fairies/Unicorns
                const currentAmount = getCurrencyAmount(upgrade.currency);
                const cost = (upgrade.currency === 'fairies' || upgrade.currency === 'unicorns') 
                    ? Math.ceil(upgrade.cost) : upgrade.cost;
                canAfford = currentAmount >= cost;
            }
            
            button.disabled = !canAfford;
        }
    });
    
    updateRerollButtonStates();
}

function buyUpgrade(index) {
    // Prevent multiple rapid clicks
    if (upgradeBeingPurchased) {

        return;
    }
    
    if (index >= gameState.upgrades.length) {

        return;
    }
    
    const upgrade = gameState.upgrades[index];
    if (!upgrade || typeof upgrade.effect !== 'function') {

        return;
    }
    
    upgradeBeingPurchased = true;
    
    try {

        
        // FIXED: Handle dual currency upgrades properly with rounded costs
        if (upgrade.dualCurrency) {
            // Dual currency upgrade
            const amount1 = getCurrencyAmount(upgrade.dualCurrency.currency1);
            const amount2 = getCurrencyAmount(upgrade.dualCurrency.currency2);
            const cost1 = (upgrade.dualCurrency.currency1 === 'fairies' || upgrade.dualCurrency.currency1 === 'unicorns') 
                ? Math.ceil(upgrade.dualCurrency.cost1) : upgrade.dualCurrency.cost1;
            const cost2 = (upgrade.dualCurrency.currency2 === 'fairies' || upgrade.dualCurrency.currency2 === 'unicorns') 
                ? Math.ceil(upgrade.dualCurrency.cost2) : upgrade.dualCurrency.cost2;
            
            // Check if we can afford both currencies
            if (amount1 < cost1 || amount2 < cost2) {

                return;
            }
            
            // Spend both currencies
            spendCurrency(upgrade.dualCurrency.currency1, cost1);
            spendCurrency(upgrade.dualCurrency.currency2, cost2);
            
        } else {
            // Single currency upgrade
            const currentAmount = getCurrencyAmount(upgrade.currency);
            const cost = (upgrade.currency === 'fairies' || upgrade.currency === 'unicorns') 
                ? Math.ceil(upgrade.cost) : upgrade.cost;
            
            if (currentAmount < cost) {

                return;
            }
            
            // Spend single currency
            spendCurrency(upgrade.currency, cost);
        }
        
        // Apply the upgrade effect
        try {
            upgrade.effect();

        } catch (error) {

            return;
        }
        
        // FIXED: Keep fractional value internally, only floor for display in templates
        if (!gameState.upgradeCosts[upgrade.currency]) {
            const defaultCosts = {
                'fairies': 5, 'unicorns': 5, 'glitter': 500, 'stardust': 500, 'rainbows': 10,
                'comets': 5, 'shooting-stars': 5, 'rockets': 5, 'string-theories': 5,
                'fairy-autoclickers': 5, 'unicorn-autoclickers': 5,
                'zombie-fairies': 5, 'zombie-unicorns': 5, 'leprechaun': 5
            };
            gameState.upgradeCosts[upgrade.currency] = defaultCosts[upgrade.currency] || 5;
        }
        
        // DEBUG: Log antes de cambiar el costo

        
        // Ensure we're working with actual numbers
        let currentCost = gameState.upgradeCosts[upgrade.currency];
        if (typeof currentCost === 'string') {
            currentCost = parseFloat(currentCost) || 5;
        }
        if (typeof currentCost !== 'number' || isNaN(currentCost)) {
            currentCost = 5;
        }
        
        // FIXED: Keep fractional value internally, only round up for display
        // BUGFIX: Exclude Leprechaun's Mastery from general cost increase, as it has its own
        if (upgrade.name !== "Leprechaun's Mastery") {
            let costMultiplier = upgrade.costMultiplier || 1.1;
            gameState.upgradeCosts[upgrade.currency] = currentCost * costMultiplier;
        }
        
        // DEBUG: Log después de cambiar el costo  

        
        // Special handling for leprechaun upgrades - keep fractional value
        if (upgrade.currency === 'rainbows' && upgrade.name === "Leprechaun's Mastery") {
            if (!gameState.upgradeCosts.leprechaun) gameState.upgradeCosts.leprechaun = 5;
            
            let currentLeprechaunCost = gameState.upgradeCosts.leprechaun;
            if (typeof currentLeprechaunCost === 'string') {
                currentLeprechaunCost = parseFloat(currentLeprechaunCost) || 5;
            }
            if (typeof currentLeprechaunCost !== 'number' || isNaN(currentLeprechaunCost)) {
                currentLeprechaunCost = 5;
            }
            
            // FIXED: Keep fractional value internally
            gameState.upgradeCosts.leprechaun = currentLeprechaunCost * 1.1;
        }
        
        // Debug log to verify cost increases

        
        gameState.stats.totalUpgrades++;
        if (upgrade.name.includes('Boost') || upgrade.name.includes('Production')) {
            gameState.stats.productionUpgrades++;
        } else if (upgrade.name.includes('Cost') || upgrade.name.includes('Reduction')) {
            gameState.stats.costUpgrades++;
        } else {
            gameState.stats.specialUpgrades++;
        }
        
        generateSingleUpgrade(index);
        
        const updateFunctions = [
            updateFairyCost, updateUnicornCost, updateZombieFairyCost, updateZombieUnicornCost,
            updateUpgradeSlotCosts, updateGlitterProducersCosts, updateStardustProducersCosts,
            updateCloudProducersCosts, updateLeprechaunProducersCosts,
            updateGlitterProducers, updateStardustProducers, updateCloudProducers,
            setupZombieProducers, updateQueenAccelerators, updateLeprechaunProducers
        ];
        
        updateFunctions.forEach(func => { if (typeof func === 'function') func(); });
        
        ['fairies', 'unicorns'].forEach(type => updateAutoclickerCost(type));
        
        if (typeof updateAutoclickers === 'function') updateAutoclickers();
        updateDisplay();
        

        
    } finally {
        // Always reset the flag, even if there was an error
        upgradeBeingPurchased = false;
    }
}

// NEW: Helper function to spend currency
function spendCurrency(currencyType, amount) {
    switch (currencyType) {
        case 'fairies':
            gameState.fairies.amount -= amount; 
            updateFairyCost();
            break;
        case 'unicorns':
            gameState.unicorns.amount -= amount; 
            updateUnicornCost();
            break;
        case 'glitter':
            gameState.glitter -= amount;
            break;
        case 'stardust':
            gameState.stardust -= amount;
            break;
        case 'rainbows':
            gameState.rainbows.amount -= amount; 
            updateRainbowCost();
            break;
        case 'comets':
            gameState.queenAccelerators[0].amount -= amount; 
            updateQueenAcceleratorCost(0);
            break;
        case 'shooting-stars':
            gameState.queenAccelerators[1].amount -= amount; 
            updateQueenAcceleratorCost(1);
            break;
        case 'rockets':
            gameState.queenAccelerators[2].amount -= amount; 
            updateQueenAcceleratorCost(2);
            break;
        case 'string-theories':
            gameState.queenAccelerators[3].amount -= amount; 
            updateQueenAcceleratorCost(3);
            break;
        case 'fairy-autoclickers':
            gameState.autoclickers.fairies.amount -= amount; 
            updateAutoclickerCost('fairies');
            break;
        case 'unicorn-autoclickers':
            gameState.autoclickers.unicorns.amount -= amount; 
            updateAutoclickerCost('unicorns');
            break;
        case 'zombie-fairies':
            gameState.zombies.fairies.amount -= amount;
            break;
        case 'zombie-unicorns':
            gameState.zombies.unicorns.amount -= amount;
            break;
    }
}

function generateSingleUpgrade(slotIndex) {
    // DEBUG: Log upgrade costs al inicio de generateSingleUpgrade

    
    Math.seedrandom = Math.seedrandom || function(seed) {
        const m = 0x80000000, a = 1103515245, c = 12345;
        let state = seed ? seed : Math.floor(Math.random() * (m - 1));
        return function() {
            state = (a * state + c) % m;
            return state / (m - 1);
        };
    };
    
    const slotSeed = gameState.upgradesSeed + slotIndex + Date.now();
    const rng = Math.seedrandom(slotSeed);
    
    const templates = getUpgradeTemplates();
    let availableTemplates = templates.filter(template => template.condition());
    
    // FIXED: Remove templates that are already present in other slots
    const currentUpgradeNames = gameState.upgrades
        .filter((upgrade, index) => index !== slotIndex) // Exclude the slot we're replacing
        .map(upgrade => upgrade.name);
    
    availableTemplates = availableTemplates.filter(template => 
        !currentUpgradeNames.includes(template.name)
    );
    
    if (availableTemplates.length > 0) {
        const template = availableTemplates[Math.floor(rng() * availableTemplates.length)];
        const freshUpgrade = {
            name: template.name,
            description: template.description,
            cost: typeof template.cost === 'function' ? template.cost() : template.cost,
            currency: typeof template.currency === 'function' ? template.currency() : template.currency,
            effect: template.effect,
            // NEW: Copy dual currency info if present
            dualCurrency: template.dualCurrency || null
        };
        
        if (freshUpgrade.currency && typeof freshUpgrade.effect === 'function') {
            gameState.upgrades[slotIndex] = freshUpgrade;
        }
    }
    
    // DEBUG: Log upgrade costs al final de generateSingleUpgrade

    
    updateUpgrades();
}

function rerollUpgrades(currency, cost) {
    // FIXED: For fairies, unicorns, and rainbows, use rounded cost
    const actualCost = (currency === 'fairies' || currency === 'unicorns' || currency === 'rainbows') 
        ? Math.ceil(cost) : cost;
    
    const affordabilityMap = {
        'fairies': gameState.fairies.amount >= actualCost,
        'unicorns': gameState.unicorns.amount >= actualCost,
        'rainbows': gameState.rainbows.amount >= actualCost
    };
    
    if (affordabilityMap[currency]) {
        const gameStateHash = hashGameState();
        gameState.upgradesSeed = gameStateHash;
        
        // Handle spending and reroll cost increase
        if (currency === 'fairies') {
            gameState.fairies.amount -= actualCost;
            updateFairyCost();
            

            
            let currentCost = gameState.rerollCosts.fairies;
            if (typeof currentCost === 'string') {
                currentCost = parseFloat(currentCost) || 5;
            }
            if (typeof currentCost !== 'number' || isNaN(currentCost)) {
                currentCost = 5;
            }
            
            gameState.rerollCosts.fairies = currentCost * 1.1;
            gameState.stats.fairyRerolls++;
            


        } else if (currency === 'unicorns') {
            gameState.unicorns.amount -= actualCost;
            updateUnicornCost();
            

            
            let currentCost = gameState.rerollCosts.unicorns;
            if (typeof currentCost === 'string') {
                currentCost = parseFloat(currentCost) || 5;
            }
            if (typeof currentCost !== 'number' || isNaN(currentCost)) {
                currentCost = 5;
            }
            
            gameState.rerollCosts.unicorns = currentCost * 1.1;
            gameState.stats.unicornRerolls++;
            


        } else if (currency === 'rainbows') {
            gameState.rainbows.amount -= actualCost;
            updateRainbowCost();
            

            
            let currentCost = gameState.rerollCosts.rainbows;
            if (typeof currentCost === 'string') {
                currentCost = parseFloat(currentCost) || 5;
            }
            if (typeof currentCost !== 'number' || isNaN(currentCost)) {
                currentCost = 5;
            }
            
            gameState.rerollCosts.rainbows = currentCost * 1.1;
            gameState.stats.rainbowRerolls++;
            


        }
        
        generateUpgrades();
        updateDisplay();
    }
}

function hashGameState() {
    const stateString = JSON.stringify({
        fairies: gameState.fairies.amount,
        unicorns: gameState.unicorns.amount,
        glitter: Math.floor(gameState.glitter),
        stardust: Math.floor(gameState.stardust),
        rainbows: gameState.rainbows.amount,
        queenDistance: Math.floor(gameState.queen.distance),
        totalUpgradesPurchased: gameState.upgradePurchaseCounts.glitter + gameState.upgradePurchaseCounts.stardust
    });
    
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
        const char = stateString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return Math.abs(hash) / 2147483647;
}

function rerollWithFairies() { rerollUpgrades('fairies', gameState.rerollCosts.fairies); }
function rerollWithUnicorns() { rerollUpgrades('unicorns', gameState.rerollCosts.unicorns); }
function rerollWithRainbows() { rerollUpgrades('rainbows', gameState.rerollCosts.rainbows); }