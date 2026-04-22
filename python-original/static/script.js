let intervalId = null;

function runSimulation() {
  if (intervalId) return; // already running
  intervalId = setInterval(step, 300); // run step every 300ms
}

function step() {
    fetch('/step')
      .then(response => response.json())
      .then(data => {
        const grid = document.getElementById("grid");
        grid.innerHTML = ""; // clear the previous step
  
        const height = data.grid.length;
        const width = data.grid[0].length;
  
        // Update CSS grid layout to match dynamic width
        grid.style.gridTemplateColumns = `repeat(${width}, 30px)`;
  
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
  
            const food = data.food[y][x];
            const value = data.grid[y][x];
            
            if (value !== "") {
              // Organism cell
              cell.textContent = value;
              cell.style.backgroundColor = "#f70df7";  // Temporary trait color
            } else if (food) {
              // Food cell
              cell.style.backgroundColor = "#b2f2bb";  // Light green
            }
            
  
            grid.appendChild(cell);
          }
        }
  
        // Display trait distribution below the grid
        document.getElementById("trait-output").textContent =
          JSON.stringify(data.trait_distribution, null, 2);

        // Automatically stop if simulation is over
        if (!data.alive && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            console.log("Simulation ended.");
        }
      });
  }
  
  function reset() {
    // Optional: add a /reset route to Flask if you want to restart the sim
    alert("Reset functionality coming soon!");
  }
  