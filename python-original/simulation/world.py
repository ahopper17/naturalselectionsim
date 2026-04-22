import random
from . import config

#Create the environment for our little organism friends
class World:
    #Initialize grid and food sources
    def __init__(self, width, height, num_food):
        self.width = width
        self.height = height
        self.grid = [[None for col in range(width)] for row in range(height)]
        self.food = [[0 for col in range(width)] for row in range(height)]
        #Need to save spots that have been designated as sources
        self.food_sources = [[False for col in range(width)] for row in range(height)]
        self.generate_food_grid(num_food)

    #Generate food on the grid with random starting locations and values
    def generate_food_grid(self, num_food):
        for _ in range(num_food):
            #Pick random spot for the food (stacking is possible)
            x = random.randint(0, self.width - 1)
            y = random.randint(0, self.height - 1)
            energy = random.randint(1,5)
            self.food[y][x] += energy
            #Update as food source
            self.food_sources[y][x] = True
    
    #Replenish food sources at particular rate
    def replenish_food(self):
        for y in range(len(self.grid)):
            for x in range(len(self.grid[y])):
                #If it's a source and is less than the max, replenish
                if self.food_sources[y][x] and self.food[y][x] < config.FOOD_MAX:
                    self.food[y][x] += config.FOOD_REPLENISH_RATE
                    if self.food[y][x] > config.FOOD_MAX:
                        self.food[y][x] = config.FOOD_MAX

    #Check if a spot has an organism
    def is_empty(self, x, y):
        return self.grid[y][x] is None
    
    #Clear a position of an organism
    def clear(self, x, y):
        self.grid[y][x] = None

    #Place an organism on the grid
    def place_organism(self, x, y):
        self.grid[y][x] = "org"

    #Remove an organism from the grid
    def remove_organism(self, x, y):
        self.grid[y][x] = None
