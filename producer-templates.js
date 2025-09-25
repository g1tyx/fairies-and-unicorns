// PRODUCER-TEMPLATES.JS - Static definitions for all producers

window.PRODUCER_TEMPLATES = {
    leprechaunProducers: [
        { name: 'New Shoes', initialCost: 1000, costMult: 1.1, initialEffect: 0.01, class: 'new-shoes', icon: '🥾', image: 'images/NewShoes.png', description: '+1% Queen speed per level' },
        { name: 'Space Shrink', initialCost: 1000, costMult: 1.1, initialEffect: 0.01, class: 'space-shrinkage', icon: '🌌', image: 'images/SpaceShrink.png', description: '-1% Queen distance per level (max 90%)' },
        { name: 'Trickery', initialCost: 100, costMult: 1.1, initialEffect: 0.05, class: 'trickery', icon: '🎩', image: 'images/Trickery.png', description: '+5% gold production per level' },
        { name: 'Avarice', initialCost: 1000, costMult: 1.1, initialEffect: 0.01, class: 'avarice', icon: '💰', image: 'images/Avarice.png', description: '-1% cost for other Leprechaun producers per level (max 99%)' }
    ],
    queenAccelerators: [
        { name: 'Comet', initialCost: 1000, initialSpeedBoost: 0.01, costMult: 1.1, currency: 'glitter', class: 'comet', icon: '☄️', image: 'images/Comet.png' },
        { name: 'Shooting Star', initialCost: 1000, initialSpeedBoost: 0.01, costMult: 1.1, currency: 'stardust', class: 'shooting-star', icon: '⭐', image: 'images/ShootingStar.png' },
        { name: 'Rocket', initialCost: 100000, initialSpeedBoost: 1, costMult: 1.1, currency: 'glitter', class: 'rocket', icon: '🚀', image: 'images/Rocket.png' },
        { name: 'String Theory', initialCost: 100000, initialSpeedBoost: 1, costMult: 1.1, currency: 'stardust', class: 'string-theory', icon: '🌌', image: 'images/StringTheory.png' }
    ],
    glitterProducers: [
        { name: 'Warrior Fairies', initialCost: 10, initialProduction: 1, costMult: 1.1, class: 'warrior', icon: '🗡️', image: 'images/WarriorFairy.png' },
        { name: 'Bard Fairies', initialCost: 50, initialProduction: 5, costMult: 1.1, class: 'bard', icon: '🎵', image: 'images/Bard Fairy 80x80.png' },
        { name: 'Nature Fairies', initialCost: 150, initialProduction: 15, costMult: 1.1, class: 'nature', icon: '🌿', image: 'images/Nature Fairy.png' },
        { name: 'Pirate Fairies', initialCost: 300, initialProduction: 30, costMult: 1.1, class: 'pirate', icon: '🏴‍☠️', image: 'images/PirateFairy.png' }
    ],
    stardustProducers: [
        { name: 'Nocorns', initialCost: 10, initialProduction: 1, costMult: 1.1, class: 'nocorn', icon: '🌙', image: 'images/Nocorn.png' },
        { name: 'Zebra Unicorns', initialCost: 50, initialProduction: 5, costMult: 1.1, class: 'zebra', icon: '🦓', image: 'images/Zebra Unicorn 80x80.png' },
        { name: 'Chess Unicorns', initialCost: 150, initialProduction: 15, costMult: 1.1, class: 'chess', icon: '♞', image: 'images/ChessUnicorn.png' },
        { name: 'Panda Unicorns', initialCost: 300, initialProduction: 30, costMult: 1.1, class: 'panda', icon: '🐼', image: 'images/PandaUnicorn.png' }
    ],
    cloudProducers: [
        { name: 'Sunny Clouds', initialCost: 1000, initialProduction: 1.0, costMult: 1.1, currency: 'glitter', class: 'sunny', icon: '☀️', image: 'images/SunnyCloud.png' },
        { name: 'Winged Clouds', initialCost: 1000, initialProduction: 1.0, costMult: 1.1, currency: 'stardust', class: 'winged', icon: '🕊️', image: 'images/WingedCloud.png' },
        { name: 'Alien Clouds', initialCost: 100000, initialProduction: 300.0, costMult: 1.1, currency: 'glitter', class: 'alien', icon: '👽', image: 'images/AlienCloud.png' },
        { name: 'Sentient Clouds', initialCost: 100000, initialProduction: 300.0, costMult: 1.1, currency: 'stardust', class: 'sentient', icon: '🧠', image: 'images/SentientCloud.png' }
    ]
};
