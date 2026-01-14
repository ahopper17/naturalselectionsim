# GRID
HEIGHT = 25
WIDTH = 25

# FOOD
FOOD_NUMBER = 300
FOOD_MAX = 5
FOOD_REPLENISH_RATE = 0.2

# ORGANISMS
NUM_ORGANISMS = 20
STARTING_ENERGY = 20
STARTING_MUTABLE_VALUE = 1

# REPRODUCTION
REPRODUCTION_ENERGY_THRESHOLD = 25
CHANCE_REPRODUCTION_THRESHOLD = 15
REPRO_CHANCE = 0.25
MUTATION_CHANCE = 0.05

# SELECT TRAIT FOR SIMULATION
TRAIT_NAME = "speed"  # Options: "speed", "efficiency", "vision", "strength"

# TRAIT-SPECIFIC SETTINGS
TRAIT_POSSIBLE_VALUES = {
    "speed": [1, 2, 3],
    "efficiency": [1, 2, 3, 4],
    "vision": [1, 2],
    "strength": [1, 2, 3, 4, 5]
}

HUES = {
    1: 0.67,  # blue
    2: 0.77,  # violet
    3: 0.83,  # magenta
    4: 0.1,   # red-orange
    5: 0.05   # deep red
}

TRAIT_LABELS = {
    "speed": {
        1: "Slow",
        2: "Medium",
        3: "Fast"
    },
    "efficiency": {
        1: "Wasteful",
        2: "Normal",
        3: "Efficient",
        4: "Optimal"
    },
    "vision": {
        1: "Nearsighted",
        2: "Keen"
    },
    "strength": {
        1: "Weak",
        2: "Average",
        3: "Strong",
        4: "Powerful",
        5: "Titanic"
    }
}

MUTATION_CONFIG = {
    "speed": {"max": 3, "step": 1},
    "efficiency": {"max": 4, "step": 1},
    "vision": {"max": 2, "step": 1},
    "strength": {"max": 5, "step": 1}
}

# AUTO-FETCHED BASED ON TRAIT
POSSIBLE_TRAIT_VALUES = TRAIT_POSSIBLE_VALUES[TRAIT_NAME]

# DEV SETTINGS
SIMULATION_STEPS = 50
DEATH_ANIMATION_FRAMES = 6  # Quicker death animation
