import random
from . import config

#Create organism object to move across board
class Organism:
    #Initiate the organism
    def __init__(self, x, y, speed, energy,  efficiency):
        self.x = x
        self.y = y
        self.speed = speed
        self.energy = energy
        self.efficiency = efficiency
    
    #Allow the organism to move around the board
    def move(self, world):
        #Clear old position
        world.clear(self.x, self.y)

        # Calculate energy cost per step (higher efficiency = lower cost)
        step_cost = 1 / max(self.efficiency, 0.01)

        #Set steps taken
        steps_taken = 0

        #Loop until speed is taken up
        while steps_taken < self.speed and self.energy >= step_cost:
            #Possible directions to try 
            directions = [(-1, -1), (-1, 0), (-1, 1),
                            (0, -1),          (0, 1),
                           (1, -1),  (1, 0),  (1, 1)]
            #Pick direction at random
            random.shuffle(directions)

            #Pick first valid spot, move into it
            moved = False
            for dx, dy in directions:
                new_x = max(0, min(self.x + dx, world.width - 1))
                new_y = max(0, min(self.y + dy, world.height - 1))

                if world.is_empty(new_x, new_y):
                    self.x = new_x
                    self.y = new_y
                    moved = True
                    
                    #Eat the energy at food source
                    self.eat(world)
                    break
            
            #Increment steps taken
            steps_taken += 1

            #If no possible move, break
            if not moved:
                break

        #Use energy for having moved
        print(f"Energy before: {self.energy}")
        self.energy -= step_cost
        print(f"Step cost: {step_cost}, efficiency={self.efficiency}")
        print(f"Energy before: {self.energy}")


    #Eat energy at food source, reduce food source to 0
    def eat(self, world):
        x,y = self.x, self.y
        if world.food[y][x] > 0:
            food_eaten = world.food[y][x]
            self.energy += food_eaten
            world.food[y][x] = 0
            print(f"Organism at ({x}, {y}) ate {food_eaten} food, energy now: {self.energy}")

    #Asexually reproduce if certain conditions are met
    def reproduce(self, world):
        offspring = None

        #Reproduce if energy is at upper threshold
        guaranteed = self.energy >= config.REPRODUCTION_ENERGY_THRESHOLD

        #Chance reproduction if energy is at lower threshold
        conditional = (config.CHANCE_REPRODUCTION_THRESHOLD <= self.energy < config.REPRODUCTION_ENERGY_THRESHOLD and random.random() < config.REPRO_CHANCE)

        #Pick new spot for new organism
        if guaranteed or conditional:
            directions = [(-1, -1), (-1, 0), (-1, 1),
                          (0, -1),          (0, 1),
                          (1, -1),  (1, 0),  (1, 1)]
            random.shuffle(directions)

            for dx, dy in directions:
                new_x = self.x + dx
                new_y = self.y + dy

            # Check bounds and whether space is empty
                if 0 <= new_x < world.width and 0 <= new_y < world.height and world.is_empty(new_x, new_y):
                # Split energy
                    offspring_energy = max(1, self.energy // 2)
                    self.energy -= offspring_energy

                #Mutate if chance conditions are met
                    trait_name = config.TRAIT_NAME
                    mutation_settings = config.MUTATION_CONFIG[trait_name]

                    # Get the current trait value
                    current_value = getattr(self, trait_name)
                    mutated_value = current_value

                    if random.random() < config.MUTATION_CHANCE:
                        if isinstance(current_value, int):
                            mutated_value = min(current_value + 1, mutation_settings["max"])
                        elif isinstance(current_value, float):
                            mutated_value = min(current_value + mutation_settings["step"], mutation_settings["max"])
                        print(f"MUTATION! Parent speed: {current_value}, Offspring speed: {mutated_value}")

                #Create offspring with potentially mutated trait
                    # Use current values
                    new_speed = self.speed
                    new_efficiency = self.efficiency
                    # Overwrite only the mutated trait
                    if trait_name == "speed":
                        new_speed = mutated_value
                    elif trait_name == "efficiency":
                        new_efficiency = mutated_value
                    # Create offspring with updated trait
                    offspring = Organism(
                        new_x,
                        new_y,
                        speed=new_speed,
                        energy=offspring_energy,
                        efficiency=new_efficiency
                    )

                    break

        return offspring  # only one offspring per turn

    #Check if the organism has enough energy to survive         
    def check_survival(self, world):
        step_cost = 1 / max(self.efficiency, 0.01)
        #Organism dies if out of energy
        if self.energy <= step_cost:
            world.clear(self.x, self.y) #Remove
            return False
        return True    