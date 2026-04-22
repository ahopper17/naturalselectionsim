import matplotlib.pyplot as plt
import matplotlib.animation as animation
import matplotlib.patches as mpatches
import matplotlib.gridspec as gridspec
import numpy as np
import colorsys
from . import simulation
from . import config

fig = plt.figure(figsize=(12, 8))
gs = gridspec.GridSpec(2, 2, height_ratios=[5, 1], width_ratios=[2, 3])

ax_grid = fig.add_subplot(gs[0, 0])
ax_graph = fig.add_subplot(gs[0, 1])
ax_key = fig.add_subplot(gs[1, 0])

ax_grid.set_aspect('equal')
plt.subplots_adjust(wspace=0.4, hspace=0.3)
fig.tight_layout()
ax_graph.set_position([0.5, 0.34, 0.45, 0.54])  # Adjust graph layout

# Initialize history list
trait_history = []

def hsl_to_rgb(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return [r, g, b]

def create_frame():
    height = simulation.world.height
    width = simulation.world.width
    visual = np.ones((height, width, 3))

    # Draw food
    for y in range(height):
        for x in range(width):
            food = simulation.world.food[y][x]
            if food > 0:
                strength = min(1.0, food / config.FOOD_MAX)
                green = np.array([0.0, 1.0, 0.0])
                white = np.array([1.0, 1.0, 1.0])
                color = (1 - strength) * white + strength * green
                visual[y][x] = color

    # Draw organisms
    for org in simulation.organisms:
        energy = max(0, org.energy)
        sat = min(1.0, energy / 20)
        hue = config.HUES.get(getattr(org, config.TRAIT_NAME), 0.5)
        r, g, b = hsl_to_rgb(hue, sat, 0.5)
        visual[org.y][org.x] = [r, g, b]

    # Draw fading dead organisms
    for dead in simulation.dead_organisms:
        x = dead['x']
        y = dead['y']
        frames_left = dead['frames_left']
        alpha = (1 - (frames_left / config.DEATH_ANIMATION_FRAMES)) ** 2
        visual[y][x] = [1, alpha, alpha]

    return visual

def draw_key(ax_key):
    ax_key.clear()
    ax_key.axis('off')

    box_width = 0.2
    box_height = 0.1
    y_start = 0.85
    y_gap = 0.12

    # Food
    y = y_start
    ax_key.add_patch(mpatches.Rectangle((0, y), box_width, box_height, color=hsl_to_rgb(1/3, 1, 0.75)))
    ax_key.text(0.35, y + box_height / 2, 'Food', va='center', fontsize=10)

    # Trait values
    labels_dict = config.TRAIT_LABELS.get(config.TRAIT_NAME, {})
    for value in config.POSSIBLE_TRAIT_VALUES:
        y -= y_gap
        label = labels_dict.get(value, str(value))
        color = hsl_to_rgb(config.HUES.get(value, 0.5), 1, 0.5)
        ax_key.add_patch(mpatches.Rectangle((0, y), box_width, box_height, color=color))
        ax_key.text(0.35, y + box_height / 2, f'{label}', va='center', fontsize=10)

    # Dead organism
    y -= y_gap
    ax_key.add_patch(mpatches.Rectangle((0, y), box_width, box_height, color=(1, 0.1, 0.5)))
    ax_key.text(0.35, y + box_height / 2, 'Dead', va='center', fontsize=10)

def draw_trait_graph(ax_graph, history, trait_values):
    ax_graph.clear()
    ax_graph.set_title(f"{config.TRAIT_NAME.capitalize()} Distribution Over Time")
    ax_graph.set_xlabel("Step", fontsize=10)
    ax_graph.set_ylabel("Percent of Population", fontsize=10)

    history_array = np.array(history)
    x = range(len(history_array))

    labels_dict = config.TRAIT_LABELS.get(config.TRAIT_NAME, {})
    colors = [hsl_to_rgb(config.HUES.get(v, 0.5), 1, 0.5) for v in trait_values]
    labels = [labels_dict.get(v, str(v)) for v in trait_values]

    ax_graph.stackplot(x, *[history_array[:, i] for i in range(len(trait_values))], labels=labels, colors=colors)
    ax_graph.set_ylim(0, 1)
    ax_graph.legend(loc="upper right")

def update(frame):
    simulation.simulate()
    ax_grid.clear()
    ax_grid.imshow(create_frame())
    ax_grid.set_xticks([])
    ax_grid.set_yticks([])

    draw_key(ax_key)
    trait_history.append(simulation.get_trait_distribution(config.TRAIT_NAME, config.POSSIBLE_TRAIT_VALUES))
    draw_trait_graph(ax_graph, trait_history, config.POSSIBLE_TRAIT_VALUES)

# Start animation
anim = animation.FuncAnimation(fig, update, frames=400, interval=250)

# Optionally save:
# anim.save('NSsim.mp4', writer='ffmpeg', fps=10)

plt.show()

