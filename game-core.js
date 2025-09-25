// GAME-CORE.JS - Core Game Logic, Save/Load, and Game Loop

// NEW: Pause system variables
let gamePaused = false;

// SAVE/LOAD SYSTEM
function createSaveData() {
    const properties = [
        'gameWon', 'hasClickedFairy', 'hasClickedUnicorn', 'glitterUnlocked', 'stardustUnlocked', 'rainbowUnlocked', 'zombiesUnlocked', 'leprechaunUnlocked', 'royalChamberUnlocked',
        'lastSaveTime', 'fairies', 'unicorns', 'glitter', 'stardust', 'gold', 'rainbows', 'queen', 'upgradeBaseCosts',
        'upgradePurchaseCounts', 'upgradeSlots', 'upgradeCosts', 'rerollCosts', 'autoclickers', 'zombies',
        'leprechaunProducers', 'queenAccelerators', 'glitterProducers', 'stardustProducers', 'cloudProducers',
        'bulkMode', 'stardustBulkMode', 'cloudBulkMode', 'zombieBulkMode', 'queenBulkMode', 'leprechaunBulkMode',
        'upgradesSeed', 'upgrades', 'ascension', 'stats', 'oneTimeUpgradesPurchased'
    ];
    
    const saveData = {};
    properties.forEach(prop => { saveData[prop] = gameState[prop]; });
    return saveData;
}

function showSaveMessage(button, message, duration = 2000) {
    if (button) {
        const originalText = button.textContent;
        button.textContent = message;
        setTimeout(() => { button.textContent = originalText; }, duration);
    }
}

function saveGame() {
    try {
        gameState.stats.saveCount++;
        gameState.lastSaveTime = Date.now();
        const saveData = JSON.stringify(createSaveData());
        const encodedSave = btoa(unescape(encodeURIComponent(saveData)));
        localStorage.setItem('fairiesAndUnicornsSave', encodedSave);
        showSaveMessage(document.querySelector('.save-button'), '✅ Saved!');
    } catch (error) {
        console.error('Error saving game:', error);
        alert('Error saving game: ' + error.message);
    }
}

function autoSave() {
    try {
        gameState.lastSaveTime = Date.now();
        const saveData = JSON.stringify(createSaveData());
        const encodedSave = btoa(unescape(encodeURIComponent(saveData)));
        localStorage.setItem('fairiesAndUnicornsSave', encodedSave);
        const saveButton = document.querySelector('.save-button');
        if (saveButton) {
            const originalBg = saveButton.style.background;
            saveButton.textContent = '💾 Auto';
            saveButton.style.background = 'linear-gradient(45deg, #2E8B57, #32CD32)';
            setTimeout(() => {
                saveButton.textContent = '💾 Save';
                saveButton.style.background = originalBg;
            }, 1500);
        }
    } catch (error) {
        console.error('Error auto-saving game:', error);
    }
}

// NEW: Centralized function to apply a loaded state object
function applyLoadedState(loadedState) {
    // *** SAFE LOADING AND MERGING LOGIC ***

    // 1. Reset the current game state to a clean initial state.
    // This is crucial for imports to prevent data from the old session from "leaking"
    // into the newly imported session if the imported save is from an older version
    // and is missing properties.
    const initialGameState = {
        gameWon: false, hasClickedFairy: false, hasClickedUnicorn: false,
        glitterUnlocked: false, stardustUnlocked: false, rainbowUnlocked: false, zombiesUnlocked: false, leprechaunUnlocked: false, royalChamberUnlocked: false,
        lastSaveTime: Date.now(),
        fairies: { amount: 0, progress: 0, cost: 10, prodPower: 1, costIncreaser: 1 },
        unicorns: { amount: 0, progress: 0, cost: 100, prodPower: 1, costIncreaser: 1 },
        glitter: 0, stardust: 0, gold: 0,
        rainbows: { amount: 0, progress: 0, cost: 1000, production: 1, makingFairies: true },
        queen: { distance: 100000000, speed: 1, maxDistance: 100000000 },
        upgradeBaseCosts: { glitter: 500, stardust: 500 },
        upgradePurchaseCounts: { glitter: 0, stardust: 0 },
        upgradeSlots: { current: 3, max: 8, glitterSlotCost: 1000, stardustSlotCost: 1000 },
        upgradeCosts: { fairies: 5, unicorns: 5, glitter: 500, stardust: 500, rainbows: 10, comets: 5, 'shooting-stars': 5, rockets: 5, 'string-theories': 5, 'fairy-autoclickers': 5, 'unicorn-autoclickers': 5, 'zombie-fairies': 100, 'zombie-unicorns': 100, leprechaun: 5 },
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
        upgrades: [], upgradesSeed: Math.random(),
        ascension: { royalEssence: 0, totalGoldGenerated: 0, runStartTime: Date.now(), totalAscensions: 0, prestigeUpgrades: {}, milestones: {} },
        stats: { gameStartTime: Date.now(), timePlayed: 0, totalTimePlayed: 0, fairyClicks: 0, unicornClicks: 0, fairyRerolls: 0, unicornRerolls: 0, rainbowRerolls: 0, totalFairies: 0, totalUnicorns: 0, totalZombies: 0, totalAutoclickers: 0, totalGlitter: 0, totalStardust: 0, totalRainbows: 0, totalAccelerators: 0, totalGold: 0, glitterProducersBuilt: 0, stardustProducersBuilt: 0, cloudProducersBuilt: 0, leprechaunProducersBuilt: 0, productionUpgrades: 0, costUpgrades: 0, specialUpgrades: 0, totalUpgrades: 0, saveCount: 0, maxQueenSpeed: 1, totalDistanceTraveled: 0 },
        oneTimeUpgradesPurchased: {}
    };
    Object.assign(gameState, initialGameState);

    // 2. Define which properties are safe to load directly (simple values)
    const simpleProperties = [
        'gameWon', 'hasClickedFairy', 'hasClickedUnicorn', 'glitterUnlocked',
        'stardustUnlocked', 'rainbowUnlocked', 'zombiesUnlocked', 'leprechaunUnlocked',
        'royalChamberUnlocked', 'lastSaveTime', 'glitter', 'stardust', 'gold',
        'upgradesSeed', 'oneTimeUpgradesPurchased',
        'bulkMode', 'stardustBulkMode', 'cloudBulkMode', 'zombieBulkMode',
        'queenBulkMode', 'leprechaunBulkMode', 'autoclickerBulkMode'
    ];
    simpleProperties.forEach(prop => {
        if (loadedState[prop] !== undefined) gameState[prop] = loadedState[prop];
    });

    // 3. Handle complex objects individually using Object.assign for a safe, deep-enough merge.
    if (loadedState.fairies) Object.assign(gameState.fairies, loadedState.fairies);
    if (loadedState.unicorns) Object.assign(gameState.unicorns, loadedState.unicorns);
    if (loadedState.rainbows) Object.assign(gameState.rainbows, loadedState.rainbows);
    if (loadedState.queen) Object.assign(gameState.queen, loadedState.queen);
    if (loadedState.upgradeBaseCosts) Object.assign(gameState.upgradeBaseCosts, loadedState.upgradeBaseCosts);
    if (loadedState.upgradePurchaseCounts) Object.assign(gameState.upgradePurchaseCounts, loadedState.upgradePurchaseCounts);
    if (loadedState.upgradeSlots) Object.assign(gameState.upgradeSlots, loadedState.upgradeSlots);
    if (loadedState.upgradeCosts) gameState.upgradeCosts = loadedState.upgradeCosts;
    if (loadedState.rerollCosts) gameState.rerollCosts = loadedState.rerollCosts;
    if (loadedState.autoclickers) {
        if (loadedState.autoclickers.fairies) Object.assign(gameState.autoclickers.fairies, loadedState.autoclickers.fairies);
        if (loadedState.autoclickers.unicorns) Object.assign(gameState.autoclickers.unicorns, loadedState.autoclickers.unicorns);
    }
    // This is the key part for the bug fix: Object.assign merges the loaded 'autobuyer' object
    // into the game state, correctly overwriting the 'keepMinimum' value.
    if (loadedState.zombies) {
        if (loadedState.zombies.fairies) Object.assign(gameState.zombies.fairies, loadedState.zombies.fairies);
        if (loadedState.zombies.unicorns) Object.assign(gameState.zombies.unicorns, loadedState.zombies.unicorns);
    }
    if (loadedState.ascension) Object.assign(gameState.ascension, loadedState.ascension);
    if (loadedState.stats) Object.assign(gameState.stats, loadedState.stats);
    if (loadedState.upgrades) gameState.upgrades = loadedState.upgrades;

    // 4. Handle producer arrays, merging them safely.
    for (const producerType in PRODUCER_TEMPLATES) {
        if (loadedState[producerType] && Array.isArray(loadedState[producerType])) {
            loadedState[producerType].forEach((savedProducer, index) => {
                if (gameState[producerType] && gameState[producerType][index]) {
                    Object.assign(gameState[producerType][index], savedProducer);
                }
            });
        }
    }

    // *** POST-LOAD COMPATIBILITY AND ADJUSTMENTS ***

    // Bugfix: Ensure queen's properties are numbers
    if (gameState.queen) {
        gameState.queen.distance = parseFloat(gameState.queen.distance || 0);
        gameState.queen.speed = parseFloat(gameState.queen.speed || 1);
    }

    // Initialize missing properties for older saves
    if (!gameState.ascension) {
        gameState.ascension = {
            royalEssence: 0, totalGoldGenerated: 0, runStartTime: Date.now(),
            totalAscensions: 0, prestigeUpgrades: {}, milestones: {}
        };
    }

    // Ensure autobuyer objects and their properties exist for compatibility
    ['fairies', 'unicorns'].forEach(type => {
        if (!gameState.zombies[type].autobuyer) {
            gameState.zombies[type].autobuyer = { enabled: false, rate: 1, progress: 0, keepMinimum: 10 };
        }
        if (typeof gameState.zombies[type].autobuyer.keepMinimum === 'undefined') {
            gameState.zombies[type].autobuyer.keepMinimum = 10;
        }
    });

    // Final state adjustments
    gameState.fairies.amount = Math.floor(gameState.fairies.amount || 0);
    gameState.unicorns.amount = Math.floor(gameState.unicorns.amount || 0);
    gameState.lastSaveTime = Date.now(); // Set save time to now for imports

    // Apply prestige bonuses from the loaded state
    if (typeof applyPrestigeBonuses === 'function') {
        applyPrestigeBonuses(gameState, false);
    }

    // Resync dynamic data like upgrade costs and effects
    if (!gameState.upgrades || gameState.upgrades.length === 0) {
        generateUpgrades();
    } else {
        updateUpgrades();
    }

    // Restore UI states to match loaded data
    if (typeof restoreBulkModeStates === 'function') {
        restoreBulkModeStates();
    }

    // Trigger a full UI refresh
    updateDisplay();
}


function loadGame() {
    try {
        const saveData = localStorage.getItem('fairiesAndUnicornsSave');
        if (!saveData) {
            showSaveMessage(document.querySelector('.load-button'), '⚠️ No save found');
            return;
        }

        let decodedSave;
        try {
            decodedSave = decodeURIComponent(escape(atob(saveData)));
        } catch (e) {
            decodedSave = saveData; // Fallback for old saves
        }

        const loadedState = JSON.parse(decodedSave);
        
        // Use the centralized function to apply the state
        applyLoadedState(loadedState);

        // Check for offline progress since last save
        const currentTime = Date.now();
        if (loadedState.lastSaveTime && currentTime > loadedState.lastSaveTime) {
            const offlineTime = currentTime - loadedState.lastSaveTime;
            if (offlineTime / 1000 > 60) { // More than 1 minute
                setTimeout(() => calculateOfflineProgress(offlineTime / 1000), 1000);
            }
        }

        showSaveMessage(document.querySelector('.load-button'), '✅ Loaded!');
    } catch (error) {
        console.error('Error loading game:', error);
        showSaveMessage(document.querySelector('.load-button'), '❌ Load failed');
    }
}

// NEW: Pause system functions
function togglePause() {
    gamePaused = !gamePaused;
    updatePauseUI();
    
    if (gamePaused) {

    } else {

    }
}

function updatePauseUI() {
    const pauseButton = document.getElementById('pause-button');
    
    if (pauseButton) {
        if (gamePaused) {
            pauseButton.textContent = 'PAUSED!';
            pauseButton.classList.add('paused');
        } else {
            pauseButton.textContent = '⸸️ Pause';
            pauseButton.classList.remove('paused');
        }
    }
}

function isPaused() {
    return gamePaused;
}

// IMPORT/EXPORT SYSTEM
function showExportDialog() {
    try {
        const saveData = { ...createSaveData(), exportVersion: 'v0.14', exportDate: new Date().toISOString() };
        const exportString = btoa(unescape(encodeURIComponent(JSON.stringify(saveData))));
        
        const textarea = document.getElementById('export-textarea');
        const dialog = document.getElementById('export-dialog');
        
        if (!textarea || !dialog) return;
        
        textarea.value = exportString;
        dialog.style.display = 'flex';
        setTimeout(() => textarea.select(), 100);
    } catch (error) {
        console.error('Error creating export:', error);
        alert('Error creating export: ' + error.message);
    }
}

function closeExportDialog() { document.getElementById('export-dialog').style.display = 'none'; }

function copyExportData() {
    const textarea = document.getElementById('export-textarea');
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    
    try {
        navigator.clipboard.writeText(textarea.value).then(() => {
            showSaveMessage(document.querySelector('.copy-button'), '✅ Copied!');
        }).catch(() => {
            document.execCommand('copy');
            alert('Save data copied to clipboard!');
        });
    } catch (error) {
        alert('Please manually copy the text from the box');
    }
}

function showImportDialog() {
    document.getElementById('import-textarea').value = '';
    document.getElementById('import-dialog').style.display = 'flex';
    setTimeout(() => document.getElementById('import-textarea').focus(), 100);
}

function closeImportDialog() { document.getElementById('import-dialog').style.display = 'none'; }

function loadImportData() {
    try {
        const importText = document.getElementById('import-textarea').value.trim();
        if (!importText) {
            alert('Please paste save data first!');
            return;
        }

        let decodedText;
        try {
            decodedText = decodeURIComponent(escape(atob(importText)));
        } catch (e) {
            decodedText = importText; // Fallback for non-encoded data
        }

        const loadedState = JSON.parse(decodedText);
        
        // Basic validation before attempting to load
        if (!loadedState || typeof loadedState !== 'object' || !loadedState.fairies || !loadedState.unicorns) {
            alert('Invalid or corrupted save data format!');
            return;
        }

        // Use the centralized function to apply the state
        applyLoadedState(loadedState);
        
        // UI feedback
        closeImportDialog();
        showSaveMessage(document.querySelector('.import-button'), '✅ Imported!');
        alert('Save imported successfully!');

    } catch (error) {
        console.error('Error importing save:', error);
        alert('Error importing save: Invalid format or corrupted data. ' + error.message);
        // Ensure dialog closes even on error
        closeImportDialog();
    }
}

function exportSave() { showExportDialog(); }

// NEW: Hard Reset functions
function showHardResetConfirmation() {
    const modal = document.getElementById('hard-reset-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeHardResetModal() {
    const modal = document.getElementById('hard-reset-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function performHardReset() {
    // Clear all localStorage
    localStorage.removeItem('fairiesAndUnicornsSave');
    
    // Reset to initial game state
    gameState = {
        gameWon: false,
        hasClickedFairy: false, hasClickedUnicorn: false,
        glitterUnlocked: false, stardustUnlocked: false, rainbowUnlocked: false, zombiesUnlocked: false, leprechaunUnlocked: false, royalChamberUnlocked: false,
        lastSaveTime: Date.now(),
        fairies: { amount: 0, progress: 0, cost: 10, prodPower: 1, costIncreaser: 1 },
        unicorns: { amount: 0, progress: 0, cost: 100, prodPower: 1, costIncreaser: 1 },
        glitter: 0, stardust: 0, gold: 0,
        rainbows: { amount: 0, progress: 0, cost: 1000, production: 1, makingFairies: true },
        queen: { distance: 100000000, speed: 1, maxDistance: 100000000 },
        upgradeBaseCosts: { glitter: 500, stardust: 500 },
        upgradePurchaseCounts: { glitter: 0, stardust: 0 },
        upgradeSlots: { current: 3, max: 8, glitterSlotCost: 1000, stardustSlotCost: 1000 },
        upgradeCosts: {
            fairies: 5, unicorns: 5, glitter: 500, stardust: 500, rainbows: 10,
            comets: 5, 'shooting-stars': 5, rockets: 5, 'string-theories': 5,
            'fairy-autoclickers': 5, 'unicorn-autoclickers': 5,
            'zombie-fairies': 5, 'zombie-unicorns': 5, leprechaun: 5
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
        bulkMode: 1, stardustBulkMode: 1, cloudBulkMode: 1, zombieBulkMode: 1, queenBulkMode: 1, leprechaunBulkMode: 1, autoclickerBulkMode: 1,
        upgrades: [], upgradesSeed: Math.random(),
        ascension: {
            royalEssence: 0,
            totalGoldGenerated: 0,
            runStartTime: Date.now(),
            totalAscensions: 0,
            prestigeUpgrades: {},
            milestones: {}
        },
        stats: {
            gameStartTime: Date.now(), timePlayed: 0, fairyClicks: 0, unicornClicks: 0,
            fairyRerolls: 0, unicornRerolls: 0, rainbowRerolls: 0, totalFairies: 0, totalUnicorns: 0,
            totalZombies: 0, totalAutoclickers: 0, totalGlitter: 0, totalStardust: 0, totalRainbows: 0,
            totalAccelerators: 0, totalGold: 0, glitterProducersBuilt: 0, stardustProducersBuilt: 0,
            cloudProducersBuilt: 0, leprechaunProducersBuilt: 0, productionUpgrades: 0, costUpgrades: 0,
            specialUpgrades: 0, totalUpgrades: 0, saveCount: 0, maxQueenSpeed: 1, totalDistanceTraveled: 0
        },
        oneTimeUpgradesPurchased: {}
    };
    
    // Regenerate upgrades
    generateUpgrades();
    
    // Update display
    updateDisplay();
    
    // Close modal
    closeHardResetModal();
    
    // Auto-save the reset state
    setTimeout(autoSave, 1000);
    

}

function continuePlaying() {
    togglePause();
    closeCongratulationsModal();
}

function performHardResetAndCloseModal() {
    performHardReset();
    closeCongratulationsModal();
}

// OFFLINE PROGRESS SYSTEM
function calculateOfflineProgress(offlineSeconds) {
    const maxOfflineTime = 24 * 60 * 60; // 24 hours
    const effectiveTime = Math.min(offlineSeconds, maxOfflineTime);

    const baseEfficiency = 0.5; // 50%
    const bonusEfficiency = getPrestigeOfflineMasteryBonus();
    const totalEfficiency = Math.min(0.9, baseEfficiency + bonusEfficiency); // Max 90%

    const effectiveSeconds = effectiveTime * totalEfficiency;
    
    // Take snapshot of initial state
    const initialState = {
        fairies: gameState.fairies.amount,
        unicorns: gameState.unicorns.amount,
        glitter: gameState.glitter,
        stardust: gameState.stardust,
        gold: gameState.gold,
        rainbows: gameState.rainbows.amount,
        queenDistance: gameState.queen.distance
    };
    
    // Simulate production in 60-second chunks for performance
    const chunkSize = 60;
    const chunks = Math.floor(effectiveSeconds / chunkSize);
    
    for (let i = 0; i < chunks; i++) {
        simulateOfflineChunk(60);
    }
    
    // Simulate remaining seconds
    const remainingSeconds = effectiveSeconds % chunkSize;
    if (remainingSeconds > 0) {
        simulateOfflineChunk(remainingSeconds);
    }
    
    // Calculate gains
    const gains = {
        fairies: gameState.fairies.amount - initialState.fairies,
        unicorns: gameState.unicorns.amount - initialState.unicorns,
        glitter: gameState.glitter - initialState.glitter,
        stardust: gameState.stardust - initialState.stardust,
        gold: gameState.gold - initialState.gold,
        rainbows: gameState.rainbows.amount - initialState.rainbows,
        queenDistance: initialState.queenDistance - gameState.queen.distance,
        duration: formatOfflineTime(offlineSeconds)
    };
    
    showOfflineProgressDialog(gains);
}

function simulateOfflineChunk(seconds) {
    const iterations = seconds * 4; // Match game loop frequency (250ms intervals)
    
    for (let i = 0; i < iterations; i++) {
        // Calculate current rates
        gameState.queen.speed = calculateQueenSpeed();
        const productivityBoost = calculateProductivityBoost();
        const rainbowBoost = gameState.rainbows.amount * gameState.rainbows.production;
        
        // FIXED: Correct production rates (including prestige bonuses) - MAKE THEM INTEGERS
        var fairyRate = Math.floor((gameState.fairies.prodPower + getPrestigeFairyMasteryBonus()) * productivityBoost);
        var unicornRate = Math.floor((gameState.unicorns.prodPower + getPrestigeUnicornMasteryBonus()) * productivityBoost);
        
        // FIXED: Apply rainbow boost correctly
        const rainbowBoostPerCreature = Math.floor(rainbowBoost + getPrestigeRainbowMoleculeBonus());
        if (gameState.rainbows.makingFairies) {
            fairyRate += rainbowBoostPerCreature;  // Boost fairies -> more unicorn molecules
        } else {
            unicornRate += rainbowBoostPerCreature; // Boost unicorns -> more fairy molecules
        }
        
        // Creature production: Fairies make Unicorn molecules, Unicorns make Fairy molecules
        gameState.unicorns.progress += (gameState.fairies.amount * fairyRate) / 4;
        gameState.fairies.progress += (gameState.unicorns.amount * unicornRate) / 4;
        
        // Autoclicker production (always active offline, including prestige bonuses)
        const fairyAutoclickerRate = Math.floor(gameState.autoclickers.fairies.clicksPerSecond * getPrestigeAutoclickersSpeedMultiplier());
        const unicornAutoclickerRate = Math.floor(gameState.autoclickers.unicorns.clicksPerSecond * getPrestigeAutoclickersSpeedMultiplier());
        gameState.fairies.progress += (gameState.autoclickers.fairies.amount * fairyAutoclickerRate) / 4;
        gameState.unicorns.progress += (gameState.autoclickers.unicorns.amount * unicornAutoclickerRate) / 4;
        
        // FIXED: Zombie production with correct prodPower (including prestige bonuses) - MAKE THEM INTEGERS
        if (gameState.rainbows.amount >= 1) {
            // FIXED: Use zombie prodPower with prestige multipliers
            let zombieFairyRate = Math.floor(gameState.zombies.fairies.prodPower * getPrestigeZombieFairiesMultiplier() * productivityBoost);
            let zombieUnicornRate = Math.floor(gameState.zombies.unicorns.prodPower * getPrestigeZombieUnicornsMultiplier() * productivityBoost);
            
            // FIXED: Apply rainbow boost correctly to zombies
            if (gameState.rainbows.makingFairies) {
                zombieFairyRate += rainbowBoostPerCreature;  // Boost zombie fairies -> more unicorn molecules
            } else {
                zombieUnicornRate += rainbowBoostPerCreature; // Boost zombie unicorns -> more fairy molecules
            }
            
            // Zombie production: Zombie Fairies make Unicorn molecules, Zombie Unicorns make Fairy molecules
            gameState.unicorns.progress += (gameState.zombies.fairies.amount * zombieFairyRate) / 4;
            gameState.fairies.progress += (gameState.zombies.unicorns.amount * zombieUnicornRate) / 4;
        }
        
        // Generate creatures from progress - MAKE AMOUNTS INTEGERS
        while (gameState.fairies.progress >= gameState.fairies.cost) {
            gameState.fairies.amount += 1;
            gameState.fairies.progress -= gameState.fairies.cost;
            updateFairyCost();
        }
        while (gameState.unicorns.progress >= gameState.unicorns.cost) {
            gameState.unicorns.amount += 1;
            gameState.unicorns.progress -= gameState.unicorns.cost;
            updateUnicornCost();
        }
        
        // Resource production
        const glitterProd = gameState.glitterProducers.reduce((sum, p) => sum + (p.amount * p.production), 0);
        const stardustProd = gameState.stardustProducers.reduce((sum, p) => sum + (p.amount * p.production), 0);
        gameState.glitter += glitterProd / 4;
        gameState.stardust += stardustProd / 4;
        
        if (isLeprechaunUnlocked()) {
            const goldProd = calculateGoldProduction() / 4;
            gameState.gold += goldProd;
            gameState.ascension.totalGoldGenerated += goldProd;
        }
        
        // Rainbow production
        const cloudProd = gameState.cloudProducers.reduce((sum, p) => sum + (p.amount * p.production), 0);
        gameState.rainbows.progress += cloudProd / 4;
        
        while (gameState.rainbows.progress >= gameState.rainbows.cost) {
            gameState.rainbows.amount += 1;
            gameState.rainbows.progress -= gameState.rainbows.cost;
            updateRainbowCost();
        }
        
        // Queen movement
        gameState.queen.distance -= gameState.queen.speed / 14400;
        if (gameState.queen.distance <= 0) {
            gameState.queen.distance = 0;
            break; // Stop simulation if queen arrives
        }
        
        // Autobuyer logic (simplified - assume they always have enough to buy)
        ['fairies', 'unicorns'].forEach(type => {
            const autobuyer = gameState.zombies[type].autobuyer;
            if (autobuyer.enabled && gameState.rainbows.amount >= 1) {
                let currentRate = autobuyer.rate;
                const prestigeUpgradeLevel = gameState.ascension.prestigeUpgrades[`more-zombie-${type}`] || 0;
                currentRate += prestigeUpgradeLevel * 2; // Each level adds 2 to the rate

                autobuyer.progress += currentRate * 0.25;
                if (autobuyer.progress >= 1) {
                    const numToBuy = Math.floor(autobuyer.progress);
                    const totalCost = numToBuy * gameState.zombies[type].baseCost;
                    const currencyAmount = gameState[type].amount;
                    
                    if (currencyAmount >= totalCost && (currencyAmount - totalCost) > autobuyer.keepMinimum) {
                        gameState[type].amount -= totalCost;
                        if (type === 'fairies') updateFairyCost();
                        else updateUnicornCost();
                        gameState.zombies[type].amount += numToBuy;
                        autobuyer.progress -= numToBuy;
                    } else {
                        autobuyer.progress = 0;
                    }
                }
            }
        });
    }
}

function formatOfflineTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

function showOfflineProgressDialog(gains) {
    const modal = document.getElementById('offline-progress-modal');
    if (!modal) return;
    
    document.getElementById('offline-duration').textContent = gains.duration;
    
    const gainsContainer = document.getElementById('offline-gains');
    gainsContainer.innerHTML = '';
    
    if (gains.fairies > 0) {
        gainsContainer.innerHTML += `<div class="gain-item">🧚‍♀️ Fairies: +${formatNumber(gains.fairies)}</div>`;
    }
    if (gains.unicorns > 0) {
        gainsContainer.innerHTML += `<div class="gain-item">🦄 Unicorns: +${formatNumber(gains.unicorns)}</div>`;
    }
    if (gains.glitter > 0) {
        gainsContainer.innerHTML += `<div class="gain-item">✨ Glitter: +${formatNumber(gains.glitter)}</div>`;
    }
    if (gains.stardust > 0) {
        gainsContainer.innerHTML += `<div class="gain-item">⭐ Stardust: +${formatNumber(gains.stardust)}</div>`;
    }
    if (gains.gold > 0) {
        gainsContainer.innerHTML += `<div class="gain-item">🍀 Gold: +${formatNumber(gains.gold)}</div>`;
    }
    if (gains.rainbows > 0) {
        gainsContainer.innerHTML += `<div class="gain-item">🌈 Rainbows: +${formatNumber(gains.rainbows)}</div>`;
    }
    if (gains.queenDistance > 0) {
        gainsContainer.innerHTML += `<div class="gain-item">👑 Queen Distance: -${formatNumber(gains.queenDistance)} leagues</div>`;
    }
    
    gainsContainer.innerHTML += `<div class="efficiency-notice">⚠️ Offline efficiency: 50% (can be improved with future upgrades)</div>`;
    
    modal.style.display = 'flex';
}

function closeOfflineModal() {
    document.getElementById('offline-progress-modal').style.display = 'none';
    updateDisplay();
}

// CORE GAMEPLAY FUNCTIONS
function clickFairy() {
    if (!gameState.hasClickedFairy) gameState.hasClickedFairy = true;
    
    const clickPower = calculateManualClickPower();
    gameState.fairies.progress += clickPower.fairy;
    gameState.stats.fairyClicks++;
    
    const fairyIcon = document.querySelector('.fairy-icon');
    if (fairyIcon && typeof createFloatingText === 'function') {
        const displayText = clickPower.fairy > 1 ? `+${clickPower.fairy}` : '+1';
        createFloatingText(fairyIcon, displayText);
    }
    
    checkProgressAndGenerate();
    updateDisplay();
}

function clickUnicorn() {
    if (!gameState.hasClickedUnicorn) gameState.hasClickedUnicorn = true;
    
    const clickPower = calculateManualClickPower();
    gameState.unicorns.progress += clickPower.unicorn;
    gameState.stats.unicornClicks++;
    
    const unicornIcon = document.querySelector('.unicorn-icon');
    if (unicornIcon && typeof createFloatingText === 'function') {
        const displayText = clickPower.unicorn > 1 ? `+${clickPower.unicorn}` : '+1';
        createFloatingText(unicornIcon, displayText);
    }
    
    checkProgressAndGenerate();
    updateDisplay();
}

function checkProgressAndGenerate() {
    while (gameState.fairies.progress >= gameState.fairies.cost) {
        gameState.fairies.amount += 1;
        gameState.fairies.progress -= gameState.fairies.cost;
        updateFairyCost();
    }
    while (gameState.unicorns.progress >= gameState.unicorns.cost) {
        gameState.unicorns.amount += 1;
        gameState.unicorns.progress -= gameState.unicorns.cost;
        updateUnicornCost();
    }
    
    // FIXED: Ensure amounts are always integers
    gameState.fairies.amount = Math.floor(gameState.fairies.amount);
    gameState.unicorns.amount = Math.floor(gameState.unicorns.amount);
}

// MAIN GAME LOOP
function gameLoop() {
    // NEW: Check if game is paused - if so, skip all processing
    if (isPaused()) {
        return;
    }
    
    gameState.queen.speed = calculateQueenSpeed();
    const productivityBoost = calculateProductivityBoost();
    const rainbowBoost = gameState.rainbows.amount * gameState.rainbows.production;
    
    // FIXED: Correct production rates for normal creatures (including prestige bonuses) - MAKE THEM INTEGERS
    var fairyRate = Math.floor((gameState.fairies.prodPower + getPrestigeFairyMasteryBonus()) * productivityBoost);
    var unicornRate = Math.floor((gameState.unicorns.prodPower + getPrestigeUnicornMasteryBonus()) * productivityBoost);
    
    // FIXED: Apply rainbow boost correctly - fairies produce unicorn molecules, unicorns produce fairy molecules
    const rainbowBoostPerCreature = Math.floor(rainbowBoost + getPrestigeRainbowMoleculeBonus());
    if (gameState.rainbows.makingFairies) {
        fairyRate += rainbowBoostPerCreature;  // Boost fairies -> more unicorn molecules
    } else {
        unicornRate += rainbowBoostPerCreature; // Boost unicorns -> more fairy molecules
    }
    
    // Normal creature production: Fairies make Unicorn molecules, Unicorns make Fairy molecules
    gameState.unicorns.progress += (gameState.fairies.amount * fairyRate) / 4;
    gameState.fairies.progress += (gameState.unicorns.amount * unicornRate) / 4;
    
    // Autoclicker production (including prestige bonuses)
    const fairyAutoclickerRate = Math.floor(gameState.autoclickers.fairies.clicksPerSecond * getPrestigeAutoclickersSpeedMultiplier());
    const unicornAutoclickerRate = Math.floor(gameState.autoclickers.unicorns.clicksPerSecond * getPrestigeAutoclickersSpeedMultiplier());
    gameState.fairies.progress += (gameState.autoclickers.fairies.amount * fairyAutoclickerRate) / 4;
    gameState.unicorns.progress += (gameState.autoclickers.unicorns.amount * unicornAutoclickerRate) / 4;
    
    // FIXED: Zombie production with correct prodPower values (including prestige bonuses) - MAKE THEM INTEGERS
    if (gameState.rainbows.amount >= 1) {
        // FIXED: Use zombie prodPower with prestige multipliers
        let zombieFairyRate = Math.floor(gameState.zombies.fairies.prodPower * getPrestigeZombieFairiesMultiplier() * productivityBoost);
        let zombieUnicornRate = Math.floor(gameState.zombies.unicorns.prodPower * getPrestigeZombieUnicornsMultiplier() * productivityBoost);
        
        // FIXED: Apply rainbow boost correctly to zombies
        if (gameState.rainbows.makingFairies) {
            zombieFairyRate += rainbowBoostPerCreature;  // Boost zombie fairies -> more unicorn molecules
        } else {
            zombieUnicornRate += rainbowBoostPerCreature; // Boost zombie unicorns -> more fairy molecules
        }
        
        // Zombie production: Zombie Fairies make Unicorn molecules, Zombie Unicorns make Fairy molecules
        gameState.unicorns.progress += (gameState.zombies.fairies.amount * zombieFairyRate) / 4;
        gameState.fairies.progress += (gameState.zombies.unicorns.amount * zombieUnicornRate) / 4;
        
        // DEBUG: Log production calculations
        if (Math.random() < 0.01) { // Log occasionally to avoid spam

        }
    }
    
    checkProgressAndGenerate();
    
    // Resource production (including prestige bonuses)
    const glitterProd = gameState.glitterProducers.reduce((sum, p) => sum + (p.amount * p.production * getPrestigeGlitterProductionMultiplier()), 0);
    const stardustProd = gameState.stardustProducers.reduce((sum, p) => sum + (p.amount * p.production * getPrestigeStardustProductionMultiplier()), 0);
    gameState.glitter += glitterProd / 4;
    gameState.stardust += stardustProd / 4;
    
    if (isLeprechaunUnlocked()) {
        const goldProd = calculateGoldProduction() / 4;
        gameState.gold += goldProd;
        gameState.ascension.totalGoldGenerated += goldProd;
    }
    
    const cloudProd = gameState.cloudProducers.reduce((sum, p) => sum + (p.amount * p.production * getPrestigeCloudsProductionMultiplier()), 0);
    gameState.rainbows.progress += cloudProd / 4;
    
    while (gameState.rainbows.progress >= gameState.rainbows.cost) {
        gameState.rainbows.amount += 1;
        gameState.rainbows.progress -= gameState.rainbows.cost;
        updateRainbowCost();
    }
    
    if (!gameState.gameWon) {
        gameState.queen.distance -= gameState.queen.speed / 14400;

        // Calculate effective distance left, mirroring the logic in display.js
        const effectiveMaxDistance = calculateEffectiveMaxDistance();
        const distanceTraveled = gameState.queen.maxDistance - gameState.queen.distance;
        const effectiveDistanceLeft = Math.max(0, effectiveMaxDistance - distanceTraveled);

        if (effectiveDistanceLeft <= 0) {
            gameState.queen.distance = 0;
            gameState.gameWon = true;
            togglePause();
            showCongratulationsModal();
        }
    }
    
    // Update producers conditionally
    const updateFunctions = [
        [gameState.fairies.amount >= 10, updateGlitterProducers],
        [gameState.unicorns.amount >= 10, updateStardustProducers],
        [gameState.glitter >= 1000 || gameState.stardust >= 1000, updateCloudProducers],
        [gameState.rainbows.amount >= 1, updateZombieProducerStats],
        [isLeprechaunUnlocked(), updateLeprechaunProducers],
        [true, updateQueenAccelerators],
        [true, updateAutoclickers]
    ];
    
    updateFunctions.forEach(([condition, func]) => {
        if (condition && typeof func === 'function') func();
    });
    
    // Autobuyer Logic
    ['fairies', 'unicorns'].forEach(type => {
        const autobuyer = gameState.zombies[type].autobuyer;
        if (autobuyer.enabled) {
            let currentRate = autobuyer.rate;
            const prestigeUpgradeLevel = gameState.ascension.prestigeUpgrades[`more-zombie-${type}`] || 0;
            currentRate += prestigeUpgradeLevel * 2; // Each level adds 2 to the rate

            autobuyer.progress += currentRate * 0.25;
            if (autobuyer.progress >= 1) {
                const numToBuy = Math.floor(autobuyer.progress);
                const totalCost = numToBuy * gameState.zombies[type].baseCost;
                const currencyAmount = gameState[type].amount;
                
                if (currencyAmount >= totalCost && (currencyAmount - totalCost) > autobuyer.keepMinimum) {
                    gameState[type].amount -= totalCost;
                    if (type === 'fairies') updateFairyCost();
                    else updateUnicornCost();
                    gameState.zombies[type].amount += numToBuy;
                    autobuyer.progress -= numToBuy;
                } else {
                    autobuyer.progress = 0;
                }
            }
        }
    });

    updateDisplay();
}

// INITIALIZATION
function initGame() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';

    if (typeof initializeDOMCache === 'function') {
        initializeDOMCache();
    }

    loadGame();

    // Ensure lastSaveTime is set
    if (!gameState.lastSaveTime) {
        gameState.lastSaveTime = Date.now();
    }

    // Recalculate costs
    const costFunctions = [
        updateFairyCost, updateUnicornCost, updateZombieFairyCost, updateZombieUnicornCost,
        updateGlitterProducersCosts, updateStardustProducersCosts, updateCloudProducersCosts, updateLeprechaunProducersCosts
    ];
    costFunctions.forEach(fn => fn());
    
    ['fairies', 'unicorns'].forEach(type => updateAutoclickerCost(type));

    const initFunctions = [updateGlitterProducers, updateStardustProducers, updateAutoclickers, updateQueenAccelerators, updateCloudProducers, setupZombieProducers, updateLeprechaunProducers];
    initFunctions.forEach(fn => { if (typeof fn === 'function') fn(); });
    
    if (!gameState.upgrades || gameState.upgrades.length === 0) {
        generateUpgrades();
    } else {
        updateUpgrades();
    }
    
    
    if (typeof restoreBulkModeStates === 'function') {
        restoreBulkModeStates();
    }
    
    // FIXED: Apply prestige bonuses after loading game
    if (typeof applyPrestigeBonuses === 'function') {
        applyPrestigeBonuses(gameState, false);

    }
    
    // NEW: Initialize pause UI
    updatePauseUI();
    
    updateDisplay();

    // Start game loops
    if (window.gameInterval) clearInterval(window.gameInterval);
    window.gameInterval = setInterval(gameLoop, 250);

    if (window.autoSaveInterval) clearInterval(window.autoSaveInterval);
    window.autoSaveInterval = setInterval(autoSave, 30000);

    setupModalEventListeners();
}

function setupModalEventListeners() {
    ['export-dialog', 'import-dialog', 'offline-progress-modal', 'ascension-confirm-modal', 'ascension-results-modal', 'hard-reset-modal', 'congratulations-modal', 'about-modal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', function(event) {
                if (event.target === this) {
                    if (id === 'export-dialog') closeExportDialog();
                    else if (id === 'import-dialog') closeImportDialog();
                    else if (id === 'offline-progress-modal') closeOfflineModal();
                    else if (id === 'ascension-confirm-modal') closeAscensionConfirm();
                    else if (id === 'ascension-results-modal') closeAscensionResults();
                    else if (id === 'hard-reset-modal') closeHardResetModal();
                    else if (id === 'congratulations-modal') closeCongratulationsModal();
                    else if (id === 'about-modal') closeAboutModal();
                }
            });
        }
    });
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (document.getElementById('export-dialog').style.display === 'flex') closeExportDialog();
            if (document.getElementById('import-dialog').style.display === 'flex') closeImportDialog();
            if (document.getElementById('offline-progress-modal').style.display === 'flex') closeOfflineModal();
            if (document.getElementById('ascension-confirm-modal').style.display === 'flex') closeAscensionConfirm();
            if (document.getElementById('ascension-results-modal').style.display === 'flex') closeAscensionResults();
            if (document.getElementById('hard-reset-modal').style.display === 'flex') closeHardResetModal();
            // FIXED: Cambiar verificación para usar style.display como otros modales
            if (document.getElementById('congratulations-modal').style.display === 'flex') closeCongratulationsModal();
            if (document.getElementById('about-modal').style.display === 'flex') closeAboutModal();
        }
        
        // NEW: Space bar toggles pause
        if (event.code === 'Space' && event.target === document.body) {
            event.preventDefault();
            togglePause();
        }
    });
}

function testWinCondition() {
    gameState.queen.distance = 1;  // Establecer distancia muy baja
    gameState.queen.speed = 100;    // Alta velocidad para que llegue rápido
}

window.addEventListener('load', initGame);