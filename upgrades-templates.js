// UPGRADES-TEMPLATES.JS - Upgrade Templates and Definitions

function getUpgradeTemplates() {
    return [
        { 
            name: "Fairy Production Boost", 
            description: "Fairies produce +1 more Unicorn molecules per second", 
            cost: () => {
                
                return gameState.upgradeCosts.fairies;
            }, 
            currency: "fairies", 
            effect: () => {
                gameState.fairies.prodPower += 1;
            },
            condition: () => true
        },
        { 
            name: "Unicorn Production Boost", 
            description: "Unicorns produce +1 more Fairy molecules per second", 
            cost: () => {
                
                return gameState.upgradeCosts.unicorns;
            }, 
            currency: "unicorns", 
            effect: () => {
                gameState.unicorns.prodPower += 1;
            },
            condition: () => true
        },
        {
            name: "Fairy Cost Reduction",
            description: "Fairy costs increase 5% slower",
            cost: () => {
                
                return gameState.upgradeCosts.glitter;
            },
            currency: "glitter",
            effect: () => { 
                gameState.fairies.costIncreaser *= 0.95; 
                updateFairyCost();
            },
            condition: () => true
        },
        {
            name: "Unicorn Cost Reduction",
            description: "Unicorn costs increase 5% slower", 
            cost: () => {
                
                return gameState.upgradeCosts.stardust;
            },
            currency: "stardust",
            effect: () => { 
                gameState.unicorns.costIncreaser *= 0.95; 
                updateUnicornCost();
            },
            condition: () => true
        },
        {
            name: "Rainbow Boost",
            description: "Each Rainbow boost molecule production by 1 more",
            cost: () => {
                
                return gameState.upgradeCosts.rainbows;
            },
            currency: "rainbows",
            effect: () => { 
                gameState.rainbows.production *= 1.25;
                gameState.rainbows.production += 1;
            },
            condition: () => isRainbowUnlocked()
        },
        {
            name: "Clouds Production Boost",
            description: "Clouds produce +25% more Rainbow parts per second",
            cost: () => gameState.upgradeCosts.rainbows,
            currency: "rainbows",
            effect: () => { 
                gameState.cloudProducers.forEach(producer => {
                    producer.production *= 1.25;
                });
            },
            condition: () => isRainbowUnlocked()
        },
        {
            name: "Clouds Cost Reduction",
            description: "Clouds costs reduce by 5%",
            cost: () => gameState.upgradeCosts.rainbows,
            currency: "rainbows",
            effect: () => { 
                gameState.cloudProducers.forEach(producer => {
                    // FIXED: Remove Math.floor to preserve fractional costs
                    producer.cost = Math.max(0.01, producer.cost * 0.95);
                    producer.baseCost = Math.max(0.01, producer.baseCost * 0.95);
                });
                updateCloudProducersCosts();
            },
            condition: () => isRainbowUnlocked()
        },
        {
            name: "Glitter Producers Boost",
            description: "Glitter producers create +25% more glitter",
            cost: () => gameState.upgradeCosts.fairies,
            currency: "fairies",
            effect: () => { 
                gameState.glitterProducers.forEach(producer => {
                    producer.production *= 1.25;
                });
            },
            condition: () => gameState.fairies.amount >= 10
        },
        {
            name: "Glitter Producers Cost Reduction",
            description: "Glitter producers costs reduce by 5%",
            cost: () => gameState.upgradeCosts.fairies,
            currency: "fairies",
            effect: () => { 
                gameState.glitterProducers.forEach(producer => {
                    // FIXED: Remove Math.floor to preserve fractional costs
                    producer.cost = Math.max(0.01, producer.cost * 0.95);
                    producer.baseCost = Math.max(0.01, producer.baseCost * 0.95);
                });
                updateGlitterProducersCosts();
            },
            condition: () => gameState.fairies.amount >= 10
        },
        {
            name: "Stardust Producers Boost",
            description: "Stardust producers create +25% more stardust",
            cost: () => gameState.upgradeCosts.unicorns,
            currency: "unicorns",
            effect: () => { 
                gameState.stardustProducers.forEach(producer => {
                    producer.production *= 1.25;
                });
            },
            condition: () => gameState.unicorns.amount >= 10
        },
        {
            name: "Stardust Producers Cost Reduction",
            description: "Stardust producers costs reduce by 5%",
            cost: () => gameState.upgradeCosts.unicorns,
            currency: "unicorns",
            effect: () => { 
                gameState.stardustProducers.forEach(producer => {
                    // FIXED: Remove Math.floor to preserve fractional costs
                    producer.cost = Math.max(0.01, producer.cost * 0.95);
                    producer.baseCost = Math.max(0.01, producer.baseCost * 0.95);
                });
                updateStardustProducersCosts();
            },
            condition: () => gameState.unicorns.amount >= 10
        },
        {
            name: "Extra Upgrade Card (Glitter)",
            description: "Add one more upgrade card to choose from",
            cost: () => gameState.upgradeSlots.glitterSlotCost,
            currency: "glitter",
            effect: () => { 
                gameState.upgradeSlots.current += 1;
                updateUpgradeSlotCosts();
                generateUpgrades();
            },
            condition: () => gameState.upgradeSlots.current < gameState.upgradeSlots.max
        },
        {
            name: "Extra Upgrade Card (Stardust)",
            description: "Add one more upgrade card to choose from", 
            cost: () => gameState.upgradeSlots.stardustSlotCost,
            currency: "stardust",
            effect: () => { 
                gameState.upgradeSlots.current += 1;
                updateUpgradeSlotCosts();
                generateUpgrades();
            },
            condition: () => gameState.upgradeSlots.current < gameState.upgradeSlots.max
        },
        {
            name: "Queen Accelerators Production Boost (Fairy)",
            description: "All Queen Accelerators are 25% more effective",
            cost: () => gameState.upgradeCosts.fairies,
            currency: "fairies",
            effect: () => { 
                gameState.queenAccelerators.forEach(accelerator => {
                    accelerator.productivityMult *= 1.5;
                });
            },
            condition: () => gameState.queenAccelerators.some(acc => acc.amount >= 1)
        },
        {
            name: "Queen Accelerators Production Boost (Unicorn)",
            description: "All Queen Accelerators are 25% more effective",
            cost: () => gameState.upgradeCosts.unicorns,
            currency: "unicorns",
            effect: () => { 
                gameState.queenAccelerators.forEach(accelerator => {
                    accelerator.productivityMult *= 1.5;
                });
            },
            condition: () => gameState.queenAccelerators.some(acc => acc.amount >= 1)
        },
        {
            name: "Queen Accelerators Cost Reduction (Fairy)",
            description: "All Queen Accelerators cost 10% less",
            cost: () => gameState.upgradeCosts.fairies,
            currency: "fairies",
            effect: () => { 
                gameState.queenAccelerators.forEach(accelerator => {
                    // FIXED: Remove Math.floor to preserve fractional costs
                    accelerator.cost = Math.max(0.01, accelerator.cost * 0.9);
                    accelerator.baseCost = Math.max(0.01, accelerator.baseCost * 0.9);
                });
                for (let i = 0; i < gameState.queenAccelerators.length; i++) {
                    updateQueenAcceleratorCost(i);
                }
            },
            condition: () => gameState.queenAccelerators.some(acc => acc.amount >= 1)
        },
        {
            name: "Queen Accelerators Cost Reduction (Unicorn)",
            description: "All Queen Accelerators cost 10% less",
            cost: () => gameState.upgradeCosts.unicorns,
            currency: "unicorns",
            effect: () => { 
                gameState.queenAccelerators.forEach(accelerator => {
                    // FIXED: Remove Math.floor to preserve fractional costs
                    accelerator.cost = Math.max(0.01, accelerator.cost * 0.9);
                    accelerator.baseCost = Math.max(0.01, accelerator.baseCost * 0.9);
                });
                for (let i = 0; i < gameState.queenAccelerators.length; i++) {
                    updateQueenAcceleratorCost(i);
                }
            },
            condition: () => gameState.queenAccelerators.some(acc => acc.amount >= 1)
        },
        {
            name: "Fairy Builder Upgrade",
            description: "Fairy Builders autoclick +1 more time per second",
            cost: () => {
                
                return gameState.upgradeCosts['fairy-autoclickers'];
            },
            currency: "fairy-autoclickers",
            effect: () => { 
                gameState.autoclickers.fairies.clicksPerSecond += 1;
            },
            condition: () => gameState.autoclickers.fairies.amount >= 5
        },
        {
            name: "Unicorn Builder Upgrade", 
            description: "Unicorn Builders autoclick +1 more time per second",
            cost: () => {
                
                return gameState.upgradeCosts['unicorn-autoclickers'];
            },
            currency: "unicorn-autoclickers",
            effect: () => { 
                gameState.autoclickers.unicorns.clicksPerSecond += 1;
            },
            condition: () => gameState.autoclickers.unicorns.amount >= 5
        },
        {
            name: "Zombie Fairies Autobuyer Upgrade",
            description: "Zombie Fairies Autobuyer buys +1 more per second",
            cost: () => {
                return gameState.upgradeCosts['zombie-fairies'];
            },
            currency: "zombie-fairies",
            costMultiplier: 1.5,
            effect: () => { 
                gameState.zombies.fairies.autobuyer.rate += 1;
                if (typeof setupZombieProducers === 'function') {
                    setupZombieProducers();
                }
            },
            condition: () => gameState.rainbows.amount >= 1 && gameState.zombies.fairies.amount >= 5
        },
        {
            name: "Zombie Unicorns Autobuyer Upgrade",
            description: "Zombie Unicorns Autobuyer buys +1 more per second",
            cost: () => {
                return gameState.upgradeCosts['zombie-unicorns'];
            },
            currency: "zombie-unicorns",
            costMultiplier: 1.5,
            effect: () => { 
                gameState.zombies.unicorns.autobuyer.rate += 1;
                if (typeof setupZombieProducers === 'function') {
                    setupZombieProducers();
                }
            },
            condition: () => gameState.rainbows.amount >= 1 && gameState.zombies.unicorns.amount >= 5
        },
        {
            name: "Leprechaun's Mastery",
            description: "All Leprechaun producers are 25% more effective",
            cost: () => {
                if (!gameState.upgradeCosts.leprechaun) {
                    gameState.upgradeCosts.leprechaun = 5;
                }
                return gameState.upgradeCosts.leprechaun;
            },
            currency: "rainbows",
            effect: () => { 
                gameState.leprechaunProducers.forEach(producer => {
                    producer.effect *= 1.25;
                });
                // FIXED: Force update of leprechaun costs and displays immediately
                if (typeof updateLeprechaunProducersCosts === 'function') {
                    updateLeprechaunProducersCosts();
                }
                if (typeof updateLeprechaunProducers === 'function') {
                    updateLeprechaunProducers();
                }
                updateDisplay();
            },
            condition: () => isLeprechaunUnlocked() && gameState.leprechaunProducers.some(p => p.amount >= 1)
        },
        // FIXED: Unlock upgrades with dual currency support
        {
            name: "Unlock Rainbows!",
            description: "Unlock the Rainbows tab to create powerful Rainbow artifacts",
            cost: () => 1000,
            currency: "glitter",
            // NEW: Dual currency specification
            dualCurrency: {
                currency1: "glitter",
                cost1: 1000,
                currency2: "stardust", 
                cost2: 1000
            },
            effect: () => {
                gameState.rainbowUnlocked = true;
                
                // Mark this upgrade as purchased to prevent it appearing again
                if (!gameState.oneTimeUpgradesPurchased) {
                    gameState.oneTimeUpgradesPurchased = {};
                }
                gameState.oneTimeUpgradesPurchased['unlock-rainbows'] = true;
                
                updateDisplay();
                generateUpgrades(); // Regenerate to remove this upgrade
            },
            condition: () => {
                return gameState.glitterUnlocked && 
                       gameState.stardustUnlocked && 
                       !gameState.rainbowUnlocked &&
                       (!gameState.oneTimeUpgradesPurchased || !gameState.oneTimeUpgradesPurchased['unlock-rainbows']);
            }
        },
        {
            name: "Unlock Zombies!",
            description: "Unlock the Zombies tab to recruit undead armies",
            cost: () => 10,
            currency: "rainbows",
            effect: () => { 
                gameState.zombiesUnlocked = true;
                
                // Mark this upgrade as purchased to prevent it appearing again
                if (!gameState.oneTimeUpgradesPurchased) {
                    gameState.oneTimeUpgradesPurchased = {};
                }
                gameState.oneTimeUpgradesPurchased['unlock-zombies'] = true;
                
                updateDisplay();
                generateUpgrades(); // Regenerate to remove this upgrade
            },
            condition: () => {
                return gameState.rainbowUnlocked && 
                       !gameState.zombiesUnlocked &&
                       (!gameState.oneTimeUpgradesPurchased || !gameState.oneTimeUpgradesPurchased['unlock-zombies']);
            }
        },
        {
            name: "Unlock Leprechaun!",
            description: "Unlock the Leprechaun tab to access magical golden enhancements",
            cost: () => 10000,
            currency: "zombie-fairies",
            // NEW: Dual currency specification
            dualCurrency: {
                currency1: "zombie-fairies",
                cost1: 10000,
                currency2: "zombie-unicorns", 
                cost2: 10000
            },
            effect: () => {
                gameState.leprechaunUnlocked = true;
                
                // Mark this upgrade as purchased to prevent it appearing again
                if (!gameState.oneTimeUpgradesPurchased) {
                    gameState.oneTimeUpgradesPurchased = {};
                }
                gameState.oneTimeUpgradesPurchased['unlock-leprechaun'] = true;
                
                updateDisplay();
                generateUpgrades(); // Regenerate to remove this upgrade
            },
            condition: () => {
                return gameState.zombiesUnlocked && 
                       !gameState.leprechaunUnlocked &&
                       (!gameState.oneTimeUpgradesPurchased || !gameState.oneTimeUpgradesPurchased['unlock-leprechaun']);
            }
        },
        {
            name: "Unlock the Royal Chamber!",
            description: "Unlock the Royal Chamber tab to access ascension and prestige upgrades",
            cost: () => 100,
            currency: "fairies",
            // NEW: Dual currency specification
            dualCurrency: {
                currency1: "fairies",
                cost1: 100,
                currency2: "unicorns", 
                cost2: 100
            },
            effect: () => {
                gameState.royalChamberUnlocked = true;
                
                // Mark this upgrade as purchased to prevent it appearing again
                if (!gameState.oneTimeUpgradesPurchased) {
                    gameState.oneTimeUpgradesPurchased = {};
                }
                gameState.oneTimeUpgradesPurchased['unlock-royal-chamber'] = true;
                
                updateDisplay();
                generateUpgrades(); // Regenerate to remove this upgrade
            },
            condition: () => {
                return gameState.leprechaunUnlocked && 
                       !gameState.royalChamberUnlocked &&
                       (!gameState.oneTimeUpgradesPurchased || !gameState.oneTimeUpgradesPurchased['unlock-royal-chamber']);
            }
        }
    ];
}