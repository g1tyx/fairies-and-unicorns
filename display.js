// DISPLAY.JS - UI Management and Display Functions

// DOM Cache for performance
const domCache = {};

function initializeDOMCache() {
    // Use exact property names to avoid confusion
    domCache.fairycount = document.getElementById('fairy-count');
    domCache.unicorncount = document.getElementById('unicorn-count');
    domCache.fairynext = document.getElementById('fairy-next');
    domCache.unicornnext = document.getElementById('unicorn-next');
    domCache.fairyprogress = document.getElementById('fairy-progress');
    domCache.unicornprogress = document.getElementById('unicorn-progress');
    domCache.fairyproduction = document.getElementById('fairy-production');
    domCache.unicornproduction = document.getElementById('unicorn-production');
    domCache.fairyprodpower = document.getElementById('fairy-prod-power');
    domCache.unicornprodpower = document.getElementById('unicorn-prod-power');
    domCache.fairyrainbowboost = document.getElementById('fairy-rainbow-boost');
    domCache.unicornrainbowboost = document.getElementById('unicorn-rainbow-boost');
    domCache.glittercount = document.getElementById('glitter-count');
    domCache.stardustcount = document.getElementById('stardust-count');
    domCache.glitterpersec = document.getElementById('glitter-per-sec');
    domCache.stardustpersec = document.getElementById('stardust-per-sec');
    domCache.goldcount = document.getElementById('gold-count');
    domCache.goldpersec = document.getElementById('gold-per-sec');
    domCache.leprechaungoldcount = document.getElementById('leprechaun-gold-count');
    domCache.leprechaungoldpersec = document.getElementById('leprechaun-gold-per-sec');
    domCache.queendistance = document.getElementById('queen-distance');
    domCache.queendistancetraveled = document.getElementById('queen-distance-traveled');
    domCache.queenspeed = document.getElementById('queen-speed');
    domCache.queentime = document.getElementById('queen-time');
    domCache.queenproductivityboost = document.getElementById('queen-productivity-boost');
    domCache.rainbowcount = document.getElementById('rainbow-count');
    domCache.rainbowprogressfill = document.getElementById('rainbow-progress-fill');
    domCache.rainbowprogresstext = document.getElementById('rainbow-progress-text');
    domCache.rainbowtoggletext = document.getElementById('rainbow-toggle-text');
    domCache.rainbowproductiontext = document.getElementById('rainbow-production-text');
    domCache.golddisplay = document.getElementById('gold-display');
    
    // FIXED: New rainbow status elements
    domCache.rainbowbooststatus = document.getElementById('rainbow-boost-status');
    
    // Fix hint elements with correct property names
    domCache.fairyHint = document.getElementById('fairy-click-hint');
    domCache.unicornHint = document.getElementById('unicorn-click-hint');
    
    domCache.fairyProductionInfo = document.querySelector('.resource:first-child .production-info');
    domCache.unicornProductionInfo = document.querySelector('.resource:last-child .production-info');
    
    // Royal Chamber cache elements
    domCache.royalessencecount = document.getElementById('royal-essence-count');
    domCache.ascensionbutton = document.getElementById('ascension-button');
}

function createFloatingText(element, text = '+1') {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-text';
    floatingText.textContent = text;
    
    const rect = element.getBoundingClientRect();
    const parentRect = element.offsetParent ? element.offsetParent.getBoundingClientRect() : {left: 0, top: 0};
    
    floatingText.style.left = (rect.left - parentRect.left + rect.width / 2 - 10) + 'px';
    floatingText.style.top = (rect.top - parentRect.top + rect.height / 2 - 10) + 'px';
    
    element.offsetParent.appendChild(floatingText);
    setTimeout(() => floatingText.parentNode?.removeChild(floatingText), 1000);
}

function updateDisplay() {
    const productivityBoost = calculateProductivityBoost();
    const rainbowBoostPerCreature = gameState.rainbows.amount * gameState.rainbows.production;
    
    updateCreatureCounts();
    const productionData = updateProductionDisplay(productivityBoost, rainbowBoostPerCreature);
    updateProgressBars(productionData);
    updateResourceDisplays();
    updateQueenDisplay(productivityBoost);
    updateRainbowDisplay();
    updateRoyalChamberDisplay(); // FIXED: Updated function name
    updateHints();
    updateTabUnlocks();
    updateButtonStates();
}

function updateCreatureCounts() {
    const updates = [
        [domCache.fairycount, gameState.fairies.amount, true],  // quantity
        [domCache.unicorncount, gameState.unicorns.amount, true], // quantity
        [domCache.fairynext, gameState.fairies.cost, false],   // cost
        [domCache.unicornnext, gameState.unicorns.cost, false] // cost
    ];
    updates.forEach(([el, val, isQuantity]) => {
        if (el) el.textContent = isQuantity ? formatQuantity(val) : formatNumber(val);
    });
}

function updateProductionDisplay(productivityBoost, rainbowBoostPerCreature) {
    // FIXED: Calculate production rates correctly - MAKE THEM INTEGERS
    let fairyIndividualPower = Math.floor((gameState.fairies.prodPower + getPrestigeFairyMasteryBonus()) * productivityBoost);
    let unicornIndividualPower = Math.floor((gameState.unicorns.prodPower + getPrestigeUnicornMasteryBonus()) * productivityBoost);
    
    // FIXED: Apply rainbow boost correctly - fairies produce unicorn molecules, unicorns produce fairy molecules
    const rainbowBoostPerCreatureInt = Math.floor(rainbowBoostPerCreature + getPrestigeRainbowMoleculeBonus());
    if (gameState.rainbows.makingFairies) {
        fairyIndividualPower += rainbowBoostPerCreatureInt;  // Boost fairies -> more unicorn molecules
    } else {
        unicornIndividualPower += rainbowBoostPerCreatureInt; // Boost unicorns -> more fairy molecules
    }
    
    // Normal creature production: Fairies make Unicorn molecules, Unicorns make Fairy molecules
    let fairyTotalProduction = gameState.fairies.amount * fairyIndividualPower;
    let unicornTotalProduction = gameState.unicorns.amount * unicornIndividualPower;
    
    // FIXED: Add zombie production with correct zombie prodPower - MAKE THEM INTEGERS
    if (gameState.rainbows.amount >= 1) {
        // FIXED: Use zombie prodPower, not normal creature prodPower
        let zombieFairyRate = Math.floor(gameState.zombies.fairies.prodPower * getPrestigeZombieFairiesMultiplier() * productivityBoost);
        let zombieUnicornRate = Math.floor(gameState.zombies.unicorns.prodPower * getPrestigeZombieUnicornsMultiplier() * productivityBoost);
        
        // FIXED: Apply rainbow boost correctly to zombies
        if (gameState.rainbows.makingFairies) {
            zombieFairyRate += rainbowBoostPerCreatureInt;  // Boost zombie fairies -> more unicorn molecules
        } else {
            zombieUnicornRate += rainbowBoostPerCreatureInt; // Boost zombie unicorns -> more fairy molecules
        }
        
        // FIXED: Zombie Fairies make Unicorn molecules, Zombie Unicorns make Fairy molecules
        fairyTotalProduction += gameState.zombies.fairies.amount * zombieFairyRate;  // This was WRONG before
        unicornTotalProduction += gameState.zombies.unicorns.amount * zombieUnicornRate; // This was WRONG before
    }
    
    // Update display elements (production rates, not quantities)
    const updates = [
        [domCache.fairyproduction, fairyTotalProduction],
        [domCache.unicornproduction, unicornTotalProduction],
        [domCache.fairyprodpower, fairyIndividualPower],
        [domCache.unicornprodpower, unicornIndividualPower]
    ];
    updates.forEach(([el, val]) => el && (el.textContent = formatNumber(val)));
    
    // Update production info
    if (domCache.fairyProductionInfo) {
        const fairyText = gameState.zombies.fairies.amount > 0 ? 'Fairies and Zombie Fairies' : 'Fairies';
        domCache.fairyProductionInfo.innerHTML = `
            ${fairyText} make <span id="fairy-production">${formatNumber(fairyTotalProduction)}</span> Unicorn Molecules/sec<br>
            (<span id="fairy-prod-power">${formatNumber(fairyIndividualPower)}</span> each<span id="fairy-rainbow-boost">${domCache.fairyrainbowboost?.textContent || ''}</span>)
        `;
    }
    
    if (domCache.unicornProductionInfo) {
        const unicornText = gameState.zombies.unicorns.amount > 0 ? 'Unicorns and Zombie Unicorns' : 'Unicorns';
        domCache.unicornProductionInfo.innerHTML = `
            ${unicornText} make <span id="unicorn-production">${formatNumber(unicornTotalProduction)}</span> Fairy Molecules/sec<br>
            (<span id="unicorn-prod-power">${formatNumber(unicornIndividualPower)}</span> each<span id="unicorn-rainbow-boost">${domCache.unicornrainbowboost?.textContent || ''}</span>)
        `;
    }
    
    // Rainbow boost indication
    const fairyBoost = gameState.rainbows.makingFairies && rainbowBoostPerCreatureInt > 0 ? ', plus Rainbows' : '';
    const unicornBoost = !gameState.rainbows.makingFairies && rainbowBoostPerCreatureInt > 0 ? ', plus Rainbows' : '';
    
    if (domCache.fairyrainbowboost) domCache.fairyrainbowboost.textContent = fairyBoost;
    if (domCache.unicornrainbowboost) domCache.unicornrainbowboost.textContent = unicornBoost;
    
    return { fairyTotalProduction, unicornTotalProduction };
}

function updateProgressBars({ fairyTotalProduction, unicornTotalProduction }) {
    const updateBar = (element, production, progress, cost) => {
        if (!element) return;
        
        // FIXED: Always show normal progress, no special fast mode
        const progressPercent = Math.min((progress / cost) * 100, 100);
        element.style.width = progressPercent + '%';
        element.style.background = 'linear-gradient(90deg, #FFD700, #FFA500, #FF8C00)';
        element.style.animation = 'none';
    };
    
    updateBar(domCache.fairyprogress, fairyTotalProduction, gameState.fairies.progress, gameState.fairies.cost);
    updateBar(domCache.unicornprogress, unicornTotalProduction, gameState.unicorns.progress, gameState.unicorns.cost);
}

function updateResourceDisplays() {
    const goldProduction = calculateGoldProduction();
    const glitterPerSec = gameState.glitterProducers.reduce((sum, p) => sum + (p.amount * p.production), 0);
    const stardustPerSec = gameState.stardustProducers.reduce((sum, p) => sum + (p.amount * p.production), 0);
    
    // FIXED: Use formatQuantity for resource amounts, formatNumber for rates
    const updates = [
        [domCache.glittercount, gameState.glitter, true],       // quantity
        [domCache.stardustcount, gameState.stardust, true],     // quantity
        [domCache.glitterpersec, glitterPerSec, false],         // rate
        [domCache.stardustpersec, stardustPerSec, false]        // rate
    ];
    
    if (isLeprechaunUnlocked()) {
        updates.push(
            [domCache.goldcount, gameState.gold, true],             // quantity
            [domCache.goldpersec, goldProduction, false],           // rate
            [domCache.leprechaungoldcount, gameState.gold, true],   // quantity
            [domCache.leprechaungoldpersec, goldProduction, false]  // rate
        );
    }
    
    updates.forEach(([el, val, isQuantity]) => {
        if (el) el.textContent = isQuantity ? formatQuantity(val) : formatNumber(val);
    });
}

function updateQueenDisplay(productivityBoost) {
    // FIXED: Show effective distance left with Space Shrink applied
    const effectiveMaxDistance = calculateEffectiveMaxDistance();
    const distanceTraveled = gameState.queen.maxDistance - gameState.queen.distance;
    const effectiveDistanceLeft = Math.max(0, effectiveMaxDistance - distanceTraveled);
    
    // FIXED: For calculating time, use effective distance for accuracy
    const effectiveDistanceForTime = calculateEffectiveQueenDistance();
    
    // Show the effective distance left (with Space Shrink applied)
    const updates = [
        [domCache.queendistance, effectiveDistanceLeft],  // FIXED: Show effective distance left
        [domCache.queendistancetraveled, distanceTraveled]
    ];
    updates.forEach(([el, val]) => el && (el.textContent = formatQuantity(val)));

    if (domCache.queenspeed) {
        domCache.queenspeed.textContent = formatNumber(gameState.queen.speed);
    }
    
    // FIXED: Calculate time based on effective distance for accuracy
    const timeInHours = effectiveDistanceForTime / gameState.queen.speed;
    const timeInYears = timeInHours / (24 * 365);
    const timeInDays = timeInHours / 24;
    
    let timeText;
    if (timeInYears >= 1) {
        const years = Math.floor(timeInYears);
        const remainingDays = Math.floor((timeInYears - years) * 365);
        const months = Math.floor(remainingDays / 30);
        const days = remainingDays % 30;
        timeText = months > 0 ? `${years} years, ${months} months, ${days} days` : `${years} years, ${days} days`;
    } else if (timeInDays >= 1) {
        const days = Math.floor(timeInDays);
        const remainingHours = timeInHours - (days * 24);
        const hours = Math.floor(remainingHours);
        const minutes = Math.floor((remainingHours - hours) * 60);
        timeText = `${days} days, ${hours} hours, ${minutes} minutes`;
    } else {
        const hours = Math.floor(timeInHours);
        const minutes = Math.floor((timeInHours - hours) * 60);
        const seconds = Math.floor(((timeInHours - hours) * 60 - minutes) * 60);
        timeText = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    }
    
    if (domCache.queentime) domCache.queentime.textContent = timeText;
    if (domCache.queenproductivityboost) {
        domCache.queenproductivityboost.textContent = `The Fairy Queen is increasing Fairies, Unicorns and Zombies productivity by ${formatNumber(productivityBoost)}x`;
    }
}

// FIXED: Update Royal Chamber display
function updateRoyalChamberDisplay() {
    // Update Royal Essence count
    if (domCache.royalessencecount) {
        domCache.royalessencecount.textContent = formatQuantity(gameState.ascension.royalEssence);
    }
    
    // Update/create Ascension button
    if (isAscensionUnlocked()) {
        const essenceGain = calculateRoyalEssence();
        const button = domCache.ascensionbutton || document.getElementById('ascension-button');
        
        if (button) {
            if (essenceGain > 0) {
                // FIXED: Changed button text format
                button.textContent = `Ascend to get ${formatNumber(essenceGain)} Royal Essence`;
                button.disabled = false;
                button.className = 'btn-primary large ascension-button';
            } else {
                button.textContent = 'Not ready to Ascend (need more progress)';
                button.disabled = true;
                button.className = 'btn-primary large ascension-button disabled';
            }
            button.style.display = 'block';
        } else {
            // Create the button if it doesn't exist
            createAscensionButton();
        }
    } else {
        // Hide button if not unlocked
        const button = document.getElementById('ascension-button');
        if (button) {
            button.style.display = 'none';
        }
    }
}

function createAscensionButton() {
    // FIXED: Place button in Royal Chamber header instead of Queen panel
    const royalChamberHeader = document.querySelector('.royal-chamber-header > div:first-child');
    if (!royalChamberHeader) return;
    
    const essenceGain = calculateRoyalEssence();
    
    const button = document.createElement('button');
    button.id = 'ascension-button';
    button.className = 'btn-primary large ascension-button';
    button.style.cssText = 'margin-left: 20px;';
    button.onclick = showAscensionConfirmation;
    
    if (essenceGain > 0) {
        // FIXED: Changed button text format
        button.textContent = `Ascend to get ${formatNumber(essenceGain)} Royal Essence`;
        button.disabled = false;
    } else {
        button.textContent = 'Not ready to Ascend (need more progress)';
        button.disabled = true;
        button.classList.add('disabled');
    }
    
    royalChamberHeader.appendChild(button);
}

function updateHints() {
    if (domCache.fairyHint) {
        domCache.fairyHint.classList.toggle('hidden', gameState.hasClickedFairy);
    }
    if (domCache.unicornHint) {
        domCache.unicornHint.classList.toggle('hidden', gameState.hasClickedUnicorn);
    }
}

function updateTabUnlocks() {
    if (gameState.fairies.amount >= 10) gameState.glitterUnlocked = true;
    if (gameState.unicorns.amount >= 10) gameState.stardustUnlocked = true;
    
    // FIXED: Updated tab names and conditions
    const tabs = ['glitter', 'stardust', 'rainbow', 'zombies', 'leprechaun', 'royal-chamber']; 
    const conditions = [
        gameState.glitterUnlocked,
        gameState.stardustUnlocked,
        gameState.rainbowUnlocked,
        gameState.zombiesUnlocked,
        gameState.leprechaunUnlocked,
        gameState.royalChamberUnlocked
    ];
    
    tabs.forEach((tab, i) => {
        const el = document.getElementById(tab + '-tab');
        if (el) {
            el.classList.toggle('locked', !conditions[i]);
        }
    });
    
    // FIXED: Setup tooltips after updating lock states
    setupTooltips();
}

// FIXED: Clean tooltip system using CSS classes and dynamic content
function setupTooltips() {
    // Remove any existing dynamic tooltips first
    document.querySelectorAll('.dynamic-tooltip').forEach(tt => tt.remove());
    
    // Tooltip text mapping for locked tabs
    const tooltipTexts = {
        'glitter-tab': 'Unlock by reaching 10 Fairies',
        'stardust-tab': 'Unlock by reaching 10 Unicorns', 
        'rainbow-tab': 'Unlock by buying the "Unlock Rainbows!" upgrade',
        'zombies-tab': 'Unlock by buying the "Unlock Zombies!" upgrade',
        'leprechaun-tab': 'Unlock by buying the "Unlock Leprechaun!" upgrade',
        'royal-chamber-tab': 'Unlock by buying the "Unlock the Royal Chamber!" upgrade'
    };
    
    document.querySelectorAll('.tab.locked').forEach(tab => {
        const tooltipText = tooltipTexts[tab.id];
        if (!tooltipText) return;
        
        // Preserve original onclick
        const existingOnclick = tab.onclick;
        
        // Remove any existing event listeners by cloning
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
        
        // Restore onclick to the new tab
        newTab.onclick = existingOnclick;
        
        let isHovering = false;
        let currentTooltip = null;
        
        function showTooltip() {
            if (currentTooltip) return; // Don't create multiple
            
            isHovering = true;
            
            // Create tooltip dynamically with CSS class
            const dynamicTooltip = document.createElement('div');
            dynamicTooltip.className = 'dynamic-tooltip';
            dynamicTooltip.textContent = tooltipText;
            
            // Add to body first to get accurate dimensions
            document.body.appendChild(dynamicTooltip);
            
            // Position the tooltip after adding to DOM so we can get real dimensions
            const rect = newTab.getBoundingClientRect();
            const tooltipRect = dynamicTooltip.getBoundingClientRect();
            
            let left = rect.right + 10;
            let top = rect.top + rect.height / 2;
            
            // If would go off right edge, show on left instead
            if (left + tooltipRect.width > window.innerWidth) {
                left = rect.left - tooltipRect.width - 10;
            }
            
            // If would go off top/bottom edge, adjust
            if (top - tooltipRect.height / 2 < 10) {
                top = 10 + tooltipRect.height / 2;
            }
            if (top + tooltipRect.height / 2 > window.innerHeight - 10) {
                top = window.innerHeight - tooltipRect.height / 2 - 10;
            }
            
            dynamicTooltip.style.left = left + 'px';
            dynamicTooltip.style.top = top + 'px';
            dynamicTooltip.style.transform = 'translateY(-50%)';
            
            currentTooltip = dynamicTooltip;
            

        }
        
        function hideTooltip() {
            isHovering = false;
            
            // Wait a bit to make sure we really left
            setTimeout(() => {
                if (!isHovering && currentTooltip) {
                    currentTooltip.remove();
                    currentTooltip = null;

                }
            }, 150);
        }
        
        // Use addEventListener for more reliable events
        newTab.addEventListener('mouseenter', showTooltip, false);
        newTab.addEventListener('mouseleave', hideTooltip, false);
        
        // Keep track of the tooltip reference on the tab
        newTab._currentTooltip = () => currentTooltip;
    });
}

function updateRainbowDisplay() {
    // FIXED: Rainbow amount is a quantity
    const updates = [
        [domCache.rainbowcount, gameState.rainbows.amount, true] // quantity
    ];
    updates.forEach(([el, val, isQuantity]) => {
        if (el) el.textContent = isQuantity ? formatQuantity(val) : formatNumber(val);
    });
    
    if (domCache.rainbowprogressfill && domCache.rainbowprogresstext) {
        const percent = Math.min((gameState.rainbows.progress / gameState.rainbows.cost) * 100, 100);
        domCache.rainbowprogressfill.style.width = percent + '%';
        domCache.rainbowprogresstext.textContent = Math.floor(gameState.rainbows.progress) + '/' + gameState.rainbows.cost;
    }
    
    // FIXED: Update rainbow boost status and button text
    if (domCache.rainbowbooststatus) {
        // FIXED: Include zombies in the text when zombies are unlocked
        if (gameState.zombiesUnlocked) {
            domCache.rainbowbooststatus.textContent = gameState.rainbows.makingFairies ? 
                'Rainbows are boosting Fairies and Zombie Fairies' : 'Rainbows are boosting Unicorns and Zombie Unicorns';
        } else {
            domCache.rainbowbooststatus.textContent = gameState.rainbows.makingFairies ? 
                'Rainbows are boosting Fairies' : 'Rainbows are boosting Unicorns';
        }
    }
    
    if (domCache.rainbowtoggletext) {
        // FIXED: Include zombies in the toggle text when zombies are unlocked
        if (gameState.zombiesUnlocked) {
            domCache.rainbowtoggletext.textContent = gameState.rainbows.makingFairies ? 
                'Click to boost Unicorns and Zombie Unicorns' : 'Click to boost Fairies and Zombie Fairies';
        } else {
            domCache.rainbowtoggletext.textContent = gameState.rainbows.makingFairies ? 
                'Click to boost Unicorns' : 'Click to boost Fairies';
        }
    }
    
    if (domCache.rainbowproductiontext) {
        const boostAmount = gameState.rainbows.amount * gameState.rainbows.production;
        const targetCreature = gameState.rainbows.makingFairies ? 'Fairy' : 'Unicorn';
        const targetMolecule = gameState.rainbows.makingFairies ? 'Unicorn' : 'Fairy';
        
        // FIXED: Include zombies in the production text when zombies are unlocked
        if (gameState.zombiesUnlocked) {
            const targetCreatureWithZombie = gameState.rainbows.makingFairies ? 'Fairy and Zombie Fairy' : 'Unicorn and Zombie Unicorn';
            domCache.rainbowproductiontext.textContent = `Rainbows boost each ${targetCreatureWithZombie} by +${formatNumber(boostAmount)} ${targetMolecule} Molecules/sec (${formatNumber(gameState.rainbows.production)} each Rainbow)`;
        } else {
            domCache.rainbowproductiontext.textContent = `Rainbows boost each ${targetCreature} by +${formatNumber(boostAmount)} ${targetMolecule} Molecules/sec (${formatNumber(gameState.rainbows.production)} each Rainbow)`;
        }
    }
    
    if (domCache.golddisplay) {
        domCache.golddisplay.style.display = isLeprechaunUnlocked() ? 'block' : 'none';
    }
}

function switchTab(tabName) {
    const unlockConditions = {
        'glitter': gameState.glitterUnlocked,
        'stardust': gameState.stardustUnlocked,
        'rainbow': gameState.rainbowUnlocked,
        'zombies': gameState.zombiesUnlocked,
        'leprechaun': gameState.leprechaunUnlocked,
        'royal-chamber': gameState.royalChamberUnlocked
    };
    
    if (unlockConditions[tabName] === false) return;
    
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    event.target.classList.add('active');
    
    const panels = { 
        'queen': 'queen-panel', 'upgrades': 'upgrades-panel', 'clickers': 'clickers-panel',
        'stats': 'stats-panel', 'glitter': 'glitter-panel', 'stardust': 'stardust-panel', 
        'rainbow': 'rainbow-panel', 'zombies': 'zombies-panel', 'leprechaun': 'leprechaun-panel',
        'royal-chamber': 'royal-chamber-panel'
    };
    document.getElementById(panels[tabName])?.classList.add('active');
    
    if (tabName === 'stats') updateStatsDisplay();
    if (tabName === 'royal-chamber') updateRoyalChamberPanel();
}

// FIXED: Update Royal Chamber panel
function updateRoyalChamberPanel() {
    updatePrestigeUpgradesDisplay();
}

// FIXED: Completely rewritten to use cards like everything else in the game
function updatePrestigeUpgradesDisplay() {
    const container = document.getElementById('prestige-upgrades-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get prestige upgrade definitions
    const prestigeUpgrades = getPrestigeUpgrades();
    
    prestigeUpgrades.forEach((category, categoryIndex) => {
        // Create category section
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'prestige-category-section';
        categoryDiv.innerHTML = `<h3 style="margin-bottom: 15px; color: #333; border-bottom: 2px solid #FFD700; padding-bottom: 5px;">${category.name}</h3>`;
        
        // Create cards grid for this category (4 cards per row)
        const upgradesGrid = document.createElement('div');
        upgradesGrid.className = 'producers-grid';
        upgradesGrid.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;';
        
        category.upgrades.forEach(upgrade => {
            const currentLevel = gameState.ascension.prestigeUpgrades[upgrade.id] || 0;
            const maxLevel = upgrade.maxLevel || 1;
            const canAfford = gameState.ascension.royalEssence >= upgrade.cost(currentLevel);
            const isMaxed = currentLevel >= maxLevel;
            
            // Create producer-style card
            const card = document.createElement('div');
            card.className = 'producer-card prestige-upgrade-card';
            if (isMaxed) card.classList.add('maxed');
            
            // Level text
            const levelText = maxLevel > 1 ? ` (${currentLevel}/${maxLevel})` : (currentLevel > 0 ? ' ✓' : '');
            
            // Cost text
            const costText = isMaxed ? 'MAXED' : `${formatNumber(upgrade.cost(currentLevel))} Royal Essence`;
            
            // Use image if available, otherwise use icon
            const iconContent = upgrade.image ?
                `<img src="${upgrade.image}" alt="${upgrade.name}" style="width: 100%; height: 100%; border-radius: 15px; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='${upgrade.icon}';">` :
                upgrade.icon;
            
            card.innerHTML = `
                <div class="producer-icon prestige-icon" style="font-size: 2.5em; background: linear-gradient(45deg, #FFD700, #FFA500);">${iconContent}</div>
                <div class="producer-name prestige-name" style="font-size: 0.9em; margin-bottom: 6px;"><strong>${upgrade.name}${levelText}</strong></div>
                <div class="producer-production prestige-description" style="font-size: 0.8em; margin-bottom: 8px; line-height: 1.2; color: #555;">${upgrade.description}</div>
                <button class="buy-button prestige-buy-btn" ${(!canAfford || isMaxed) ? 'disabled' : ''} 
                        onclick="buyPrestigeUpgrade('${upgrade.id}')" style="margin-top: auto; font-size: 0.8em; padding: 6px;">
                    ${costText}
                </button>
            `;
            
            upgradesGrid.appendChild(card);
        });
        
        categoryDiv.appendChild(upgradesGrid);
        container.appendChild(categoryDiv);
    });
}

function buyPrestigeUpgrade(upgradeId) {
    const prestigeUpgrades = getPrestigeUpgrades();
    let targetUpgrade = null;
    
    for (const category of prestigeUpgrades) {
        for (const upgrade of category.upgrades) {
            if (upgrade.id === upgradeId) {
                targetUpgrade = upgrade;
                break;
            }
        }
        if (targetUpgrade) break;
    }
    
    if (!targetUpgrade) return;
    
    const currentLevel = gameState.ascension.prestigeUpgrades[upgradeId] || 0;
    const maxLevel = targetUpgrade.maxLevel || 1;
    const cost = targetUpgrade.cost(currentLevel);
    
    if (currentLevel >= maxLevel) return;
    if (gameState.ascension.royalEssence < cost) return;
    
    // Purchase the upgrade
    gameState.ascension.royalEssence -= cost;
    gameState.ascension.prestigeUpgrades[upgradeId] = currentLevel + 1;
    
    // Apply the effect if it has one
    if (targetUpgrade.effect) {
        targetUpgrade.effect(currentLevel + 1);
    }
    
    // Update displays
    updateRoyalChamberPanel();
    updateDisplay();
    
    // Auto-save after prestige purchase
    setTimeout(autoSave, 500);
}

function toggleRainbowTarget() {
    gameState.rainbows.makingFairies = !gameState.rainbows.makingFairies;
    updateRainbowDisplay();
}

function formatTime(ms) {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else {
        return `${minutes}m ${seconds}s`;
    }
}

function updateStatsDisplay() {
    if (!gameState.stats) return;
    
    const timeInCurrentRun = Date.now() - gameState.stats.gameStartTime;
    const totalTimePlayed = (gameState.stats.totalTimePlayed || 0) + timeInCurrentRun;

    const timeText = formatTime(timeInCurrentRun);
    const totalTimeText = formatTime(totalTimePlayed);
    
    // Update max values
    const maxUpdates = [
        ['totalFairies', gameState.fairies.amount],
        ['totalUnicorns', gameState.unicorns.amount],
        ['totalGlitter', gameState.glitter],
        ['totalStardust', gameState.stardust],
        ['totalRainbows', gameState.rainbows.amount],
        ['totalGold', gameState.gold],
        ['maxQueenSpeed', gameState.queen.speed]
    ];
    maxUpdates.forEach(([key, val]) => {
        gameState.stats[key] = Math.max(gameState.stats[key], val);
    });
    
    gameState.stats.totalDistanceTraveled = gameState.queen.maxDistance - gameState.queen.distance;
    gameState.stats.glitterProducersBuilt = gameState.glitterProducers.reduce((sum, p) => sum + p.amount, 0);
    gameState.stats.stardustProducersBuilt = gameState.stardustProducers.reduce((sum, p) => sum + p.amount, 0);
    gameState.stats.cloudProducersBuilt = gameState.cloudProducers.reduce((sum, p) => sum + p.amount, 0);
    gameState.stats.leprechaunProducersBuilt = gameState.leprechaunProducers.reduce((sum, p) => sum + p.amount, 0);
    gameState.stats.totalZombies = gameState.zombies.fairies.amount + gameState.zombies.unicorns.amount;
    gameState.stats.totalAutoclickers = gameState.autoclickers.fairies.amount + gameState.autoclickers.unicorns.amount;
    gameState.stats.totalAccelerators = gameState.queenAccelerators.reduce((sum, acc) => sum + acc.amount, 0);
    
    // FIXED: Use formatQuantity for all stats since they represent quantities
    const updates = [
        ['stat-time-played', timeText],
        ['stat-total-time-played', totalTimeText],
        ['stat-distance-traveled', formatQuantity(gameState.stats.totalDistanceTraveled)],
        ['stat-max-speed', formatQuantity(gameState.stats.maxQueenSpeed)],
        ['stat-saves-count', gameState.stats.saveCount],
        ['stat-fairy-clicks', formatQuantity(gameState.stats.fairyClicks)],
        ['stat-unicorn-clicks', formatQuantity(gameState.stats.unicornClicks)],
        ['stat-fairy-rerolls', gameState.stats.fairyRerolls],
        ['stat-unicorn-rerolls', gameState.stats.unicornRerolls],
        ['stat-rainbow-rerolls', gameState.stats.rainbowRerolls],
        ['stat-total-fairies', formatQuantity(gameState.stats.totalFairies)],
        ['stat-total-unicorns', formatQuantity(gameState.stats.totalUnicorns)],
        ['stat-total-zombies', formatQuantity(gameState.stats.totalZombies)],
        ['stat-total-autoclickers', formatQuantity(gameState.stats.totalAutoclickers)],
        ['stat-total-glitter', formatQuantity(gameState.stats.totalGlitter)],
        ['stat-total-stardust', formatQuantity(gameState.stats.totalStardust)],
        ['stat-total-rainbows', formatQuantity(gameState.stats.totalRainbows)],
        ['stat-total-gold', formatQuantity(gameState.stats.totalGold)],
        ['stat-total-accelerators', formatQuantity(gameState.stats.totalAccelerators)],
        ['stat-glitter-producers', formatQuantity(gameState.stats.glitterProducersBuilt)],
        ['stat-stardust-producers', formatQuantity(gameState.stats.stardustProducersBuilt)],
        ['stat-cloud-producers', formatQuantity(gameState.stats.cloudProducersBuilt)],
        ['stat-leprechaun-producers', formatQuantity(gameState.stats.leprechaunProducersBuilt)],
        ['stat-production-upgrades', gameState.stats.productionUpgrades],
        ['stat-cost-upgrades', gameState.stats.costUpgrades],
        ['stat-special-upgrades', gameState.stats.specialUpgrades],
        ['stat-total-upgrades', gameState.stats.totalUpgrades],
        // Royal Chamber stats
        ['stat-total-ascensions', formatQuantity(gameState.ascension.totalAscensions)],
        ['stat-royal-essence', formatQuantity(gameState.ascension.royalEssence)]
    ];
    
    updates.forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
}

function updateButtonStates() {
    // Update builder buttons (formerly autoclicker buttons)
    ['fairies', 'unicorns'].forEach(type => {
        const ac = gameState.autoclickers[type];
        const buttonEl = document.getElementById(`${type}-ac-button`);
        if (buttonEl) {
            buttonEl.disabled = gameState[type].amount < ac.cost;
        }
    });
    
    // Update other button states
    
    // ZOMBIES: No manual buy buttons - only autobuyers (no button state updates needed)
    
    
    // Update upgrade button states AND reroll button states
    if (typeof updateUpgradeButtonStates === 'function') {
        updateUpgradeButtonStates();
    }
    
    // ADDED: Update reroll button states when display updates
    if (typeof updateRerollButtonStates === 'function') {
        updateRerollButtonStates();
    }
    
    // FIXED: Update Royal Chamber display
    updateRoyalChamberDisplay();
}


// FIXED: Cambiar para usar style.display en lugar de classList
function showCongratulationsModal() {
    const modal = document.getElementById('congratulations-modal');
    if (modal) {
        modal.classList.add('visible');
    }
}

// FIXED: Cambiar para usar style.display en lugar de classList
function closeCongratulationsModal() {
    const modal = document.getElementById('congratulations-modal');
    if (modal) {
        modal.classList.remove('visible');
    }
}

// About Modal Functions
function showAboutModal() {
    const modal = document.getElementById('about-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAboutModal() {
    const modal = document.getElementById('about-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}