// Set up the SVG canvas
const svg = d3.select("#oscilloscope");
let width = svg.node().parentNode.clientWidth;
let height = svg.node().parentNode.clientHeight;
svg.attr("width", width).attr("height", height);

// Initialize variables
let numGenerators = 1;
let frequency = 1;
let amplitude = 50;
let phase = 0;
let fadeDuration = 5;
let generators = [];
let time = 0;
let waveformType = "lissajous";

// Create generators
function createGenerators() {
    generators = [];
    for (let i = 0; i < numGenerators; i++) {
        generators.push({
            id: i,
            x: width / 2,
            y: height / 2
        });
    }
}

// Update generator positions
function updateGenerators() {
    time += 0.01;
    generators.forEach((gen, i) => {
        let x, y;
        switch (waveformType) {
            case "lissajous":
                x = width / 2 + amplitude * Math.sin(2 * Math.PI * frequency * time + i * phase);
                y = height / 2 + amplitude * Math.cos(2 * Math.PI * frequency * time + i * phase);
                break;
            case "spiral":
                const radius = amplitude * time / 10;
                x = width / 2 + radius * Math.cos(2 * Math.PI * frequency * time + i * phase);
                y = height / 2 + radius * Math.sin(2 * Math.PI * frequency * time + i * phase);
                break;
            case "rose":
                const k = 2 + i;
                const r = amplitude * Math.cos(k * 2 * Math.PI * frequency * time);
                x = width / 2 + r * Math.cos(2 * Math.PI * frequency * time);
                y = height / 2 + r * Math.sin(2 * Math.PI * frequency * time);
                break;
            case "butterfly":
                const t = 2 * Math.PI * frequency * time;
                x = width / 2 + amplitude * (Math.sin(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5)));
                y = height / 2 + amplitude * (Math.cos(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5)));
                break;
        }
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
        .merge(dots)
        .attr("fill", "#00ff00")
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
            .attr("fill", "#00ff00")
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

d3.select("#waveform-type").on("change", function() {
    waveformType = this.value;
    time = 0; // Reset time to start the new waveform from the beginning
});

// Resize handler
function resizeHandler() {
    width = svg.node().parentNode.clientWidth;
    height = svg.node().parentNode.clientHeight;
    svg.attr("width", width).attr("height", height);
}

window.addEventListener("resize", resizeHandler);
