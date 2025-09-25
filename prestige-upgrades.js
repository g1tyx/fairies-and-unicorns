// PRESTIGE-UPGRADES.JS - Prestige Upgrade Definitions and System

function getPrestigeUpgrades() {
    return [
        {
            name: "🧚‍♀️ Production Mastery",
            upgrades: [
                {
                    id: 'fairy-mastery',
                    name: 'Fairy Mastery',
                    icon: '🧚‍♀️',
                    image: 'images/Fairy.png',
                    description: 'Fairies start producing +1 more Unicorn Molecule per second each',
                    maxLevel: 25,
                    cost: (level) => 100 + (level * 100),
                    effect: (level) => {
                        // Effect is applied in applyPrestigeBonuses()
                    }
                },
                {
                    id: 'unicorn-mastery',
                    name: 'Unicorn Mastery',
                    icon: '🦄',
                    image: 'images/Unicorn.png',
                    description: 'Unicorns start producing +1 more Fairy Molecule per second each',
                    maxLevel: 25,
                    cost: (level) => 100 + (level * 100),
                    effect: (level) => {
                        // Effect is applied in applyPrestigeBonuses()
                    }
                },
                {
                    id: 'glitter-production',
                    name: 'Glitter Production',
                    icon: '✨',
                    image: 'images/Glitter.png',
                    description: 'Each Glitter producer starts producing +25% more (cumulative)',
                    maxLevel: 10,
                    cost: (level) => 100 + (level * 100),
                    effect: (level) => {
                        // Effect is applied in applyPrestigeBonuses()
                    }
                },
                {
                    id: 'stardust-production',
                    name: 'Stardust Production',
                    icon: '⭐',
                    image: 'images/Stardust.png',
                    description: 'Each Stardust producer starts producing +25% more (cumulative)',
                    maxLevel: 10,
                    cost: (level) => 100 + (level * 100),
                    effect: (level) => {
                        // Effect is applied in applyPrestigeBonuses()
                    }
                },
                {
                    id: 'rainbows-molecule-production',
                    name: 'Rainbows Molecule Production',
                    icon: '🌈',
                    image: 'images/Rainbow.png',
                    description: 'Each Rainbow boosts each Fairy/Unicorn by +1 more Molecule per second',
                    maxLevel: 10,
                    cost: (level) => 100 + (level * 100),
                    effect: (level) => {
                        // Effect is applied in applyPrestigeBonuses()
                    }
                },
                {
                    id: 'clouds-production',
                    name: 'Clouds Production',
                    icon: '☁️',
                    image: 'images/SunnyCloud.png',
                    description: 'Each Cloud produces +25% more Rainbow parts (cumulative)',
                    maxLevel: 10,
                    cost: (level) => 200 + (level * 200),
                    effect: (level) => {
                        // Effect is applied in applyPrestigeBonuses()
                    }
                },
                {
                    id: 'more-zombie-fairies',
                    name: 'More Zombie Fairies',
                    icon: '🧚‍♀️💀',
                    image: 'images/ZombieFairy.png',
                    description: 'Autobuyers start buying 2 more Zombie Fairies per second, per level.',
                    maxLevel: 5,
                    cost: (level) => 200 + (level * 200),
                    effect: (level) => {
                        // Effect is applied in game-core.js autobuyer logic
                    }
                },
                {
                    id: 'more-zombie-unicorns',
                    name: 'More Zombie Unicorns',
                    icon: '🦄💀',
                    image: 'images/ZombieUnicorn.png',
                    description: 'Autobuyers start buying 2 more Zombie Unicorns per second, per level.',
                    maxLevel: 5,
                    cost: (level) => 200 + (level * 200),
                    effect: (level) => {
                        // Effect is applied in game-core.js autobuyer logic
                    }
                },
            ]
        },
        {
            name: "🎁 Starting Resources",
            upgrades: [
                {
                    id: 'rainbow-genesis',
                    name: 'Rainbow Genesis',
                    icon: '🌈',
                    image: 'images/Rainbow.png',
                    description: 'Start each run with +1 Rainbow per level',
                    maxLevel: 3,
                    cost: (level) => 500 + (level * 500),
                    effect: (level) => {
                        gameState.rainbows.amount += 1;
                    }
                },
                {
                    id: 'fairies-favor',
                    name: "Fairies' Favor",
                    icon: '🧚‍♀️',
                    image: 'images/Fairy.png',
                    description: 'Start each run with +10 Fairies per level',
                    maxLevel: 5,
                    cost: (level) => 200 + (level * 200),
                    effect: (level) => {
                        gameState.fairies.amount += 10;
                    }
                },
                {
                    id: 'unicorns-favor',
                    name: "Unicorns' Favor",
                    icon: '🦄',
                    image: 'images/Unicorn.png',
                    description: 'Start each run with +10 Unicorns per level',
                    maxLevel: 5,
                    cost: (level) => 200 + (level * 200),
                    effect: (level) => {
                        gameState.unicorns.amount += 10;
                    }
                },
                {
                    id: 'glitter-galore',
                    name: 'Glitter Galore',
                    icon: '✨',
                    image: 'images/Glitter.png',
                    description: 'Start each run with +1,000 Glitter per level',
                    maxLevel: 3,
                    cost: (level) => 500 + (level * 500),
                    effect: (level) => {
                        gameState.glitter += 1000;
                    }
                },
                {
                    id: 'stardust-galore',
                    name: 'Stardust Galore',
                    icon: '⭐',
                    image: 'images/Stardust.png',
                    description: 'Start each run with +1,000 Stardust per level',
                    maxLevel: 3,
                    cost: (level) => 500 + (level * 500),
                    effect: (level) => {
                        gameState.stardust += 1000;
                    }
                },
                {
                    id: 'auto-autoclickers',
                    name: 'Auto-Autoclickers',
                    icon: '🖱️',
                    description: 'Start each run with 10 Fairy and Unicorn Autoclickers per level',
                    maxLevel: 2,
                    cost: (level) => 200 + (level * 200),
                    effect: (level) => {
                        gameState.autoclickers.fairies.amount += 10;
                        gameState.autoclickers.unicorns.amount += 10;
                    }
                }
            ]
        },
        {
            name: "👑 Queen and Gold",
            upgrades: [
                {
                    id: 'royal-speed',
                    name: 'Royal Speed',
                    icon: '👑',
                    image: 'images/QueenCrown.png',
                    description: 'Queen starts with double base speed per level',
                    maxLevel: 5,
                    cost: (level) => {
                        // 100, 200, 400, 800, 1600
                        if (level === 0) return 1000;
                        return 1000 * Math.pow(2, level);
                    },
                    effect: (level) => {
                        // Effect is applied in applyPrestigeBonuses()
                    }
                },
                {
                    id: 'queen-accelerators-power',
                    name: 'Queen Accelerators Power',
                    icon: '⚡',
                    image: 'images/Rocket.png',
                    description: 'Queen Accelerators add 50% more speed (cumulative)',
                    maxLevel: 10,
                    cost: (level) => 1000 + (level * 1000),
                    effect: (level) => {
                        // Effect is applied in calculateQueenSpeed()
                    }
                },
                {
                    id: 'rainbows-gold-production',
                    name: 'Rainbows Gold Production',
                    icon: '🍀',
                    image: 'images/Rainbow.png',
                    description: 'Each Rainbow produces +25% more Gold per second (cumulative)',
                    maxLevel: 10,
                    cost: (level) => 2000 + (level * 2000),
                    effect: (level) => {
                        // Effect is applied in calculateGoldProduction()
                    }
                },
                {
                    id: 'new-shoes-power',
                    name: 'New Shoes Power',
                    icon: '🥾',
                    image: 'images/NewShoes.png',
                    description: 'New Shoes add 50% more speed',
                    maxLevel: 5,
                    cost: (level) => 5000 + (level * 5000),
                    effect: (level) => {
                        // Effect is applied in calculateQueenSpeed()
                    }
                },
                {
                    id: 'space-shrink-power',
                    name: 'Space Shrink Power',
                    icon: '🌌',
                    image: 'images/SpaceShrink.png',
                    description: 'Space Shrink adds 50% more distance reduction',
                    maxLevel: 3,
                    cost: (level) => 5000 + (level * 5000),
                    effect: (level) => {
                        // Effect is applied in calculateEffectiveMaxDistance()
                    }
                },
                {
                    id: 'trickery-power',
                    name: 'Trickery Power',
                    icon: '🎩',
                    image: 'images/Trickery.png',
                    description: 'Trickery adds 50% more gold production to Rainbows (cumulative)',
                    maxLevel: 5,
                    cost: (level) => 5000 + (level * 5000),
                    effect: (level) => {
                        // Effect is applied in calculateGoldProduction()
                    }
                },
                {
                    id: 'avarice-power',
                    name: 'Avarice Power',
                    icon: '💰',
                    image: 'images/Avarice.png',
                    description: 'Avarice adds 50% more cost reduction to other Leprechaun producers',
                    maxLevel: 3,
                    cost: (level) => 5000 + (level * 5000),
                    effect: (level) => {
                        // Effect is applied in calculateAvariceCostReduction()
                    }
                }
            ]
        },
        {
            name: "🔮 Meta Progression",
            upgrades: [
                {
                    id: 'royal-gathering',
                    name: 'Royal Gathering',
                    icon: '👑',
                    image: 'images/RoyalChamber.png',
                    description: '+25% more Royal Essence gained per level',
                    maxLevel: 20,
                    cost: (level) => 1000 + (level * 1000),
                    effect: (level) => {
                        // Effect is applied in calculateRoyalEssence()
                    }
                },
                {
                    id: 'offline-mastery',
                    name: 'Offline Mastery',
                    icon: '😴',
                    description: 'Improve offline efficiency by 10% per level (max 90%)',
                    maxLevel: 4,
                    cost: (level) => {
                        // 100, 200, 400, 800
                        if (level === 0) return 1000;
                        return 1000 * Math.pow(2, level);
                    },
                    effect: (level) => {
                        // Effect is applied in calculateOfflineProgress()
                    }
                }
            ]
        }
    ];
}

// Helper function to get total cost for maxing an upgrade
function getTotalCostToMax(upgrade) {
    let totalCost = 0;
    for (let level = 0; level < upgrade.maxLevel; level++) {
        totalCost += upgrade.cost(level);
    }
    return totalCost;
}

// Helper function to check if player can afford next level
function canAffordUpgrade(upgradeId) {
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
    
    if (!targetUpgrade) return false;
    
    const currentLevel = gameState.ascension.prestigeUpgrades[upgradeId] || 0;
    const maxLevel = targetUpgrade.maxLevel || 1;
    
    if (currentLevel >= maxLevel) return false;
    
    const cost = targetUpgrade.cost(currentLevel);
    return gameState.ascension.royalEssence >= cost;
}

// Helper function to get upgrade progress text
function getUpgradeProgressText(upgradeId) {
    const currentLevel = gameState.ascension.prestigeUpgrades[upgradeId] || 0;
    const prestigeUpgrades = getPrestigeUpgrades();
    
    for (const category of prestigeUpgrades) {
        for (const upgrade of category.upgrades) {
            if (upgrade.id === upgradeId) {
                const maxLevel = upgrade.maxLevel || 1;
                if (maxLevel > 1) {
                    return `${currentLevel}/${maxLevel}`;
                } else {
                    return currentLevel > 0 ? '✓' : '';
                }
            }
        }
    }
    return '';
}

// Helper function to calculate total prestige bonuses
function calculatePrestigeBonusesInfo() {
    const p = gameState.ascension.prestigeUpgrades;
    const bonuses = {};
    
    // Production bonuses
    if (p['fairy-mastery']) {
        bonuses.fairyProduction = `+${p['fairy-mastery']} molecules/sec each`;
    }
    if (p['unicorn-mastery']) {
        bonuses.unicornProduction = `+${p['unicorn-mastery']} molecules/sec each`;
    }
    if (p['autoclickers-speed']) {
        const multiplier = Math.pow(2, p['autoclickers-speed']);
        bonuses.autoclickersSpeed = `${multiplier}x clicks/sec`;
    }
    if (p['glitter-production']) {
        bonuses.glitterProduction = `+${(p['glitter-production'] * 25)}%`;
    }
    if (p['stardust-production']) {
        bonuses.stardustProduction = `+${(p['stardust-production'] * 25)}%`;
    }
    if (p['rainbows-molecule-production']) {
        bonuses.rainbowMoleculeBoost = `+${p['rainbows-molecule-production']} per Rainbow`;
    }
    if (p['clouds-production']) {
        bonuses.cloudsProduction = `+${(p['clouds-production'] * 25)}%`;
    }
    if (p['zombie-fairies-production']) {
        const multiplier = Math.pow(2, p['zombie-fairies-production']);
        bonuses.zombieFairiesProduction = `${multiplier}x molecules/sec`;
    }
    if (p['zombie-unicorns-production']) {
        const multiplier = Math.pow(2, p['zombie-unicorns-production']);
        bonuses.zombieUnicornsProduction = `${multiplier}x molecules/sec`;
    }
    if (p['leprechaun-effects']) {
        bonuses.leprechaunEffects = `+${(p['leprechaun-effects'] * 25)}%`;
    }
    
    // Queen and Gold bonuses
    if (p['royal-speed']) {
        bonuses.queenSpeed = `${Math.pow(2, p['royal-speed'])}x base speed`;
    }
    if (p['queen-accelerators-power']) {
        bonuses.queenAcceleratorsBoost = `+${(p['queen-accelerators-power'] * 50)}% effectiveness`;
    }
    if (p['rainbows-gold-production']) {
        bonuses.rainbowGoldBoost = `+${(p['rainbows-gold-production'] * 25)}%`;
    }
    if (p['new-shoes-power']) {
        bonuses.newShoesBoost = `+${(p['new-shoes-power'] * 50)}% effectiveness`;
    }
    if (p['trickery-power']) {
        bonuses.trickeryBoost = `+${(p['trickery-power'] * 50)}% effectiveness`;
    }
    
    // Starting resources
    if (p['rainbow-genesis']) {
        bonuses.startingRainbows = p['rainbow-genesis'];
    }
    if (p['fairies-favor']) {
        bonuses.startingFairies = p['fairies-favor'] * 10;
    }
    if (p['unicorns-favor']) {
        bonuses.startingUnicorns = p['unicorns-favor'] * 10;
    }
    if (p['glitter-galore']) {
        bonuses.startingGlitter = p['glitter-galore'] * 1000;
    }
    if (p['stardust-galore']) {
        bonuses.startingStardust = p['stardust-galore'] * 1000;
    }
    if (p['auto-autoclickers']) {
        bonuses.startingAutoclickers = p['auto-autoclickers'] * 10;
    }
    
    // Meta progression
    if (p['royal-gathering']) {
        bonuses.essenceBonus = `+${(p['royal-gathering'] * 25)}%`;
    }
    if (p['offline-mastery']) {
        const improvement = p['offline-mastery'] * 10;
        bonuses.offlineEfficiency = `+${improvement}% (total: ${50 + improvement}%)`;
    }
    
    return bonuses;
}

// Function to reset a specific prestige upgrade (for debugging/testing)
function resetPrestigeUpgrade(upgradeId) {
    if (gameState.ascension.prestigeUpgrades[upgradeId]) {
        delete gameState.ascension.prestigeUpgrades[upgradeId];
        updateRoyalChamberPanel();
        updateDisplay();
    }
}

// Function to reset all prestige upgrades (for debugging/testing)
function resetAllPrestigeUpgrades() {
    gameState.ascension.prestigeUpgrades = {};
    updateRoyalChamberPanel();
    updateDisplay();
}

// Testing function to give Royal Essence
function giveRoyalEssence(amount = 100) {
    gameState.ascension.royalEssence += amount;
    updateDisplay();

}