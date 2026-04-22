from flask import Flask, jsonify, request
from flask_cors import CORS
from simulation.simulation import simulate, run, organisms, get_trait_distribution, world, reset_simulation, dead_organisms
from simulation import config


app = Flask(__name__)
# Enable CORS for all routes with explicit configuration
CORS(app, 
     resources={r"/*": {
         "origins": "*",
         "methods": ["GET", "POST", "OPTIONS"],
         "allow_headers": ["Content-Type"]
     }})

@app.route('/')
def index():
    """API root - React frontend handles UI"""
    return jsonify({"message": "Natural Selection Simulator API", "endpoints": ["/state", "/step", "/reset"]})

@app.route('/state')
def state():
    """Get current simulation state without advancing"""
    state = get_simulation_state()
    return jsonify(state)

@app.route('/step')
def step():
    alive = simulate()
    state = get_simulation_state()
    state['alive'] = alive
    return jsonify(state)

def get_simulation_state():
    """Helper function to get current simulation state"""
    # Create blank grids
    grid = [['' for _ in range(config.WIDTH)] for _ in range(config.HEIGHT)]
    # Send actual food amounts (0-5) instead of boolean
    # Round to 1 decimal place to avoid floating point issues
    food_grid = [[round(float(world.food[y][x]), 1) for x in range(config.WIDTH)] for y in range(config.HEIGHT)]

    # Place organisms into the grid by their position and trait
    # Track which cells have organisms to detect collisions
    organism_positions = {}
    speed_counts = {1: 0, 2: 0, 3: 0}
    
    # Track dead organisms for death animation
    dead_cells = {}
    for corpse in dead_organisms:
        x, y = corpse['x'], corpse['y']
        if 0 <= x < config.WIDTH and 0 <= y < config.HEIGHT:
            frames_left = corpse['frames_left']
            progress = 1 - (frames_left / config.DEATH_ANIMATION_FRAMES)  # 0 to 1
            trait = corpse.get('trait', 1)  # Get trait value for death animation
            dead_cells[f"{x},{y}"] = {
                'progress': progress,
                'trait': trait
            }
    
    print(f"get_simulation_state(): Processing {len(organisms)} organisms, {len(dead_organisms)} dead")
    for org in organisms:
        if 0 <= org.x < config.WIDTH and 0 <= org.y < config.HEIGHT:
            trait_value = getattr(org, config.TRAIT_NAME)
            trait_int = int(trait_value)
            pos_key = (org.x, org.y)
            
            # Check for collisions
            if pos_key in organism_positions:
                print(f"COLLISION DETECTED: Multiple organisms at ({org.x}, {org.y})! Speeds: {organism_positions[pos_key]} and {trait_int}")
            
            grid[org.y][org.x] = str(trait_int)
            organism_positions[pos_key] = trait_int
            
            if trait_int in speed_counts:
                speed_counts[trait_int] += 1
            # Debug individual organism speeds
            if trait_int > 1:
                print(f"Placing organism with speed {trait_int} at ({org.x}, {org.y})")
    
    # Debug: print speed distribution
    if len(organisms) > 0:
        print(f"Organisms by speed: {speed_counts}, Total: {len(organisms)}, Unique positions: {len(organism_positions)}")   

    trait_distribution = get_trait_distribution(config.TRAIT_NAME, 
                                                config.TRAIT_POSSIBLE_VALUES[config.TRAIT_NAME])
    
    alive = len(organisms) > 0
    
    # Get trait labels for the current trait
    trait_labels = [config.TRAIT_LABELS[config.TRAIT_NAME].get(val, f"Value {val}") 
                    for val in config.TRAIT_POSSIBLE_VALUES[config.TRAIT_NAME]]
    
    return {
        'grid': grid,
        'food': food_grid,
        'alive': alive,
        'trait_distribution': trait_distribution,
        'trait_name': config.TRAIT_NAME,
        'trait_labels': trait_labels,
        'dead': dead_cells  # Map of (x, y) -> animation progress (0 to 1)
    }

@app.route('/config', methods=['GET'])
def get_config():
    """Get current simulation configuration"""
    return jsonify({
        'trait_name': config.TRAIT_NAME,
        'food_number': config.FOOD_NUMBER,
        'num_organisms': config.NUM_ORGANISMS,
        'starting_energy': config.STARTING_ENERGY,
        'reproduction_energy_threshold': config.REPRODUCTION_ENERGY_THRESHOLD,
        'chance_reproduction_threshold': config.CHANCE_REPRODUCTION_THRESHOLD,
        'repro_chance': config.REPRO_CHANCE,
        'mutation_chance': config.MUTATION_CHANCE
    })

@app.route('/config', methods=['POST'])
def update_config():
    """Update simulation configuration"""
    data = request.get_json()
    
    if 'trait_name' in data:
        config.TRAIT_NAME = data['trait_name']
        config.POSSIBLE_TRAIT_VALUES = config.TRAIT_POSSIBLE_VALUES[config.TRAIT_NAME]
    
    if 'food_number' in data:
        config.FOOD_NUMBER = int(data['food_number'])
    
    if 'num_organisms' in data:
        config.NUM_ORGANISMS = int(data['num_organisms'])
    
    if 'starting_energy' in data:
        config.STARTING_ENERGY = int(data['starting_energy'])
    
    if 'reproduction_energy_threshold' in data:
        config.REPRODUCTION_ENERGY_THRESHOLD = int(data['reproduction_energy_threshold'])
    
    if 'chance_reproduction_threshold' in data:
        config.CHANCE_REPRODUCTION_THRESHOLD = int(data['chance_reproduction_threshold'])
    
    if 'repro_chance' in data:
        config.REPRO_CHANCE = float(data['repro_chance'])
    
    if 'mutation_chance' in data:
        config.MUTATION_CHANCE = float(data['mutation_chance'])
    
    return jsonify({'success': True, 'message': 'Configuration updated'})

@app.route('/reset', methods=['POST'])
def reset():
    reset_simulation()
    state = get_simulation_state()
    return jsonify(state)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)