// Set up the SVG canvas
const svg = d3.select("#oscilloscope");
const width = svg.node().parentNode.clientWidth;
const height = svg.node().parentNode.clientHeight;
svg.attr("width", width).attr("height", height);

// Initialize variables
let numGenerators = 1;
let frequency = 1;
let amplitude = 50;
let phase = 0;
let fadeDuration = 5;
let generators = [];
let time = 0;

// Create generators
function createGenerators() {
    generators = [];
    for (let i = 0; i < numGenerators; i++) {
        generators.push({
            id: i,
            color: d3.interpolateRainbow(i / numGenerators)
        });
    }
}

// Update generator positions
function updateGenerators() {
    time += 0.01;
    generators.forEach((gen, i) => {
        const x = width / 2 + amplitude * Math.sin(2 * Math.PI * frequency * time + i * phase);
        const y = height / 2 + amplitude * Math.cos(2 * Math.PI * frequency * time + i * phase);
        gen.x = x;
        gen.y = y;
    });
}

// Draw dots
function drawDots() {
    const dots = svg.selectAll(".dot")
        .data(generators, d => d.id);

    dots.enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 3)
        .attr("fill", d => d.color)
        .attr("opacity", 1)
    .merge(dots)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    dots.exit().remove();

    // Create fading dots
    generators.forEach(gen => {
        svg.append("circle")
            .attr("class", "fading-dot")
            .attr("r", 3)
            .attr("cx", gen.x)
            .attr("cy", gen.y)
            .attr("fill", gen.color)
            .attr("opacity", 1)
            .transition()
            .duration(fadeDuration * 1000)
            .attr("opacity", 0)
            .remove();
    });
}

// Animation loop
function animate() {
    updateGenerators();
    drawDots();
    requestAnimationFrame(animate);
}

// Initialize the simulation
createGenerators();
animate();

// Event listeners for controls
d3.select("#num-generators").on("input", function() {
    numGenerators = +this.value;
    d3.select("#num-generators-value").text(numGenerators);
    createGenerators();
});

d3.select("#frequency").on("input", function() {
    frequency = +this.value;
    d3.select("#frequency-value").text(frequency.toFixed(1));
});

d3.select("#amplitude").on("input", function() {
    amplitude = +this.value;
    d3.select("#amplitude-value").text(amplitude);
});

d3.select("#phase").on("input", function() {
    phase = +this.value;
    d3.select("#phase-value").text(phase.toFixed(2));
});

d3.select("#fade-duration").on("input", function() {
    fadeDuration = +this.value;
    d3.select("#fade-duration-value").text(fadeDuration.toFixed(1));
});

// Resize handler
function resizeHandler() {
    const newWidth = svg.node().parentNode.clientWidth;
    const newHeight = svg.node().parentNode.clientHeight;
    svg.attr("width", newWidth).attr("height", newHeight);
    width = newWidth;
    height = newHeight;
}

window.addEventListener("resize", resizeHandler);
