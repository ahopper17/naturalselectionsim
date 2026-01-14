from . import config
import random
from .organism import Organism
from .world import World

#Initialize organism lists
organisms = []
dead_organisms = []

#Create world
world = World(config.WIDTH, config.HEIGHT, config.FOOD_NUMBER)

#Save occupied positions
occupied_positions = set()

def build_organism(x, y, energy):
    trait_name = config.TRAIT_NAME
    mutable_val = config.STARTING_MUTABLE_VALUE
    speed = mutable_val if trait_name == "speed" else 1
    efficiency = mutable_val if trait_name == "efficiency" else 1.0
    return Organism(x, y, speed=speed, energy=energy, efficiency=efficiency)

def initialize_organisms():
    """Initialize organisms on the grid in random locations"""
    global organisms, dead_organisms, occupied_positions, world
    organisms.clear()
    dead_organisms.clear()
    occupied_positions.clear()
    
    for _ in range(config.NUM_ORGANISMS):
        while True:
            x = random.randint(0, config.WIDTH - 1)
            y = random.randint(0, config.HEIGHT - 1)
            #Check if position occupied, if not place organism
            if (x, y) not in occupied_positions:
                organisms.append(build_organism(x, y, config.STARTING_ENERGY))
                world.place_organism(x, y)
                occupied_positions.add((x, y))
                break

def reset_simulation():
    """Reset the simulation to initial state"""
    global world, organisms, dead_organisms, occupied_positions
    world = World(config.WIDTH, config.HEIGHT, config.FOOD_NUMBER)
    initialize_organisms()

#Initialize organisms on the grid in random locations
initialize_organisms()

#Get the distribution of the tested trait
def get_trait_distribution(trait_name, possible_values):
    counts = {val: 0 for val in possible_values}
    total = len(organisms)

    for org in organisms:
        value = getattr(org, trait_name)
        if value in counts:
            counts[value] += 1

    return [counts[val] / total if total > 0 else 0 for val in possible_values]


#Run it!
def simulate():
    global organisms, dead_organisms, world

    #End if all organisms die
    if not organisms:
        return False

    # Clear the world grid before processing organisms
    for y in range(world.height):
        for x in range(world.width):
            world.grid[y][x] = None

    live_organisms = []
    new_offspring = []  # Collect offspring separately to avoid modifying list while iterating

    #All organisms will...
    for org in organisms:
        
        #Move and eat
        print(f"Org at ({org.x}, {org.y}) Before move: energy={org.energy}, speed={org.speed}, efficiency={org.efficiency}")
        org.move(world)
        print(f"Org at ({org.x}, {org.y}) After move: energy={org.energy}")

        #Or die.
        if org.check_survival(world):
            # Check if position is empty before placing (should be after move)
            if world.is_empty(org.x, org.y):
                world.place_organism(org.x, org.y)
            else:
                print(f"WARNING: Organism at ({org.x}, {org.y}) tried to occupy non-empty cell!")

            # Handle reproduction
            offspring = org.reproduce(world)
            if offspring:
                new_offspring.append(offspring)
                if world.is_empty(offspring.x, offspring.y):
                    world.place_organism(offspring.x, offspring.y)
                    print(f"New offspring born at ({offspring.x}, {offspring.y}) with speed {offspring.speed}")
                else:
                    print(f"WARNING: Offspring at ({offspring.x}, {offspring.y}) tried to occupy non-empty cell!")

            live_organisms.append(org)
        else:
            # Organism died - clear its position but keep it for death animation
            trait_value = getattr(org, config.TRAIT_NAME)
            world.clear(org.x, org.y)
            dead_organisms.append({
                'x': org.x, 
                'y': org.y, 
                'frames_left': config.DEATH_ANIMATION_FRAMES,
                'trait': int(trait_value)  # Store trait for death animation
            })
            print(f"Organism died at ({org.x}, {org.y})")

    # Add new offspring to the organisms list (modify in-place to update global)
    organisms.clear()
    organisms.extend(live_organisms)
    organisms.extend(new_offspring)
    
    # Debug: verify speed distribution after adding offspring
    if new_offspring:
        print(f"Added {len(new_offspring)} new offspring. Total organisms now: {len(organisms)}")
        for off in new_offspring:
            print(f"  - Offspring at ({off.x}, {off.y}) with speed {off.speed}")
    
    # Debug: final speed distribution
    final_speeds = {}
    for org in organisms:
        speed = getattr(org, config.TRAIT_NAME)
        final_speeds[speed] = final_speeds.get(speed, 0) + 1
    print(f"Final organisms by speed in simulate(): {final_speeds}")

    #Update dead organism animations
    for corpse in dead_organisms:
        corpse['frames_left'] -= 1
    dead_organisms[:] = [corpse for corpse in dead_organisms if corpse['frames_left'] > 0]

    #Replenish the food sources
    world.replenish_food()

    #Keep going if we have some live organisms
    return True

#Driver when running simulation file
def run():
    for step in range(config.SIMULATION_STEPS):
        if not simulate():
            print(f"Simulation has ended at step {step}.")
            break
        print(f"Step {step}: ")
        for row in world.grid:
            print(row)

if __name__ == "__main__":
    run()