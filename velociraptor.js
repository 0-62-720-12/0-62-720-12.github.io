// fossil_velociraptor.js
// Adds a Velociraptor mob with spawn egg

// === ENTITY DEFINITION ===
registerEntity("velociraptor", {
    type: "monster",           // hostile mob
    health: 24,                // 12 hearts
    attackDamage: 5,           // 2.5 hearts
    movementSpeed: 0.35,       // fast
    followRange: 24,
    width: 0.9,
    height: 1.2,

    // Appearance (replace with whichever variant PNG you want)
    texture: "fossil:textures/mob/Velociraptor/Velociraptor_Brown_Adult.png",

    ai: [
        { type: "wander" },
        { type: "look_at_player", radius: 8 },
        { type: "attack_players", speed: 1.3 },
        { type: "avoid_entity", entity: "minecraft:wolf", radius: 6 }
    ],

    // Drops when killed
    drops: [
        { id: "minecraft:bone", count: [0,2] },
        { id: "minecraft:leather", count: [0,1] }
    ]
});

// === SPAWN EGG ===
registerItem("velociraptor_spawn_egg", {
    name: "Velociraptor Spawn Egg",
    texture: "minecraft:spawn_egg",
    onRightClick: function(player, world, x, y, z) {
        spawnEntity("velociraptor", x, y + 1, z);
    }
});

// === NATURAL SPAWNING ===
onEvent("world_load", function(event) {
    addSpawn({
        entity: "velociraptor",
        weight: 10,              // spawn weight
        groupMin: 1,
        groupMax: 3,
        biomes: [
            "minecraft:plains",
            "minecraft:forest",
            "minecraft:taiga"
        ]
    });
});
