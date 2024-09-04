// Set up the SVG
const svg = d3.select("#oscilloscope");
let width, height;

function updateSVGDimensions() {
    const container = document.getElementById("canvas-container");
    width = container.clientWidth;
    height = container.clientHeight;
    svg.attr("width", width).attr("height", height);
}

// Call updateSVGDimensions initially and on window resize
updateSVGDimensions();
window.addEventListener("resize", updateSVGDimensions);

// Initialize generators array
let generators = [];

// Define color scale for interpolation
const colorScale = d3.scaleLinear()
    .domain([0, width])
    .range(["#00ff00", "#ff00ff"]);

// Function to create a new generator
function createGenerator() {
    return {
        x: 0,
        y: 0,
        frequency: parseFloat(d3.select("#frequency").property("value")),
        amplitude: parseFloat(d3.select("#amplitude").property("value")),
        phase: parseFloat(d3.select("#phase").property("value")),
    };
}

// Function to update generators
function updateGenerators() {
    const numGenerators = parseInt(d3.select("#num-generators").property("value"));
    while (generators.length < numGenerators) {
        generators.push(createGenerator());
    }
    while (generators.length > numGenerators) {
        generators.pop();
    }

    generators.forEach((gen, i) => {
        gen.frequency = parseFloat(d3.select("#frequency").property("value"));
        gen.amplitude = parseFloat(d3.select("#amplitude").property("value"));
        gen.phase = parseFloat(d3.select("#phase").property("value")) + (i * Math.PI / generators.length);
    });
}

// Function to calculate varying amplitude
function calculateVaryingAmplitude(baseAmplitude, time, variationFrequency = 10.0, variationAmplitude = 0.2) {
    return baseAmplitude * (1 + variationAmplitude * Math.sin(variationFrequency * time));
}

// Function to calculate new positions
function calculatePositions(t) {
    const maxDimension = Math.min(width, height);
    generators.forEach(gen => {
        const waveformType = d3.select("#waveform-type").property("value");
        const varyingAmplitude = calculateVaryingAmplitude(gen.amplitude, t);
        const scaledAmplitude = (varyingAmplitude / 200) * (maxDimension / 2); // Scale amplitude to fit the screen
        
        switch (waveformType) {
            case "lissajous":
                gen.x = width / 2 + scaledAmplitude * Math.sin(gen.frequency * t + gen.phase);
                gen.y = height / 2 + scaledAmplitude * Math.sin(2 * gen.frequency * t);
                break;
            case "spiral":
                const r = scaledAmplitude * (1 - Math.exp(-0.1 * t));
                gen.x = width / 2 + r * Math.cos(gen.frequency * t + gen.phase);
                gen.y = height / 2 + r * Math.sin(gen.frequency * t + gen.phase);
                break;
            case "rose":
                const k = 2;
                const r_rose = scaledAmplitude * Math.sin(k * (gen.frequency * t + gen.phase));
                gen.x = width / 2 + r_rose * Math.cos(gen.frequency * t + gen.phase);
                gen.y = height / 2 + r_rose * Math.sin(gen.frequency * t + gen.phase);
                break;
            case "butterfly":
                const exp_t = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5);
                gen.x = width / 2 + scaledAmplitude * Math.sin(t + gen.phase) * exp_t;
                gen.y = height / 2 + scaledAmplitude * Math.cos(t + gen.phase) * exp_t;
                break;
        }
    });
}

// Function to create new dots
function createDots() {
    const fadeDuration = parseFloat(d3.select("#fade-duration").property("value")) * 1000;
    
    generators.forEach(gen => {
        svg.append("circle")
            .attr("r", 2)
            .attr("cx", gen.x)
            .attr("cy", gen.y)
            .attr("fill", colorScale(gen.x))
            .transition()
            .duration(fadeDuration)
            .style("opacity", 0)
            .remove();
    });
}

// Animation loop
let lastTime = 0;
let dotCreationTime = 0;
const dotCreationInterval = 1000 / 60; // 60 times per second

function animate(time) {
    const deltaTime = time - lastTime;
    lastTime = time;

    updateGenerators();
    calculatePositions(time / 1000);

    // Create new dots 60 times per second
    if (time - dotCreationTime >= dotCreationInterval) {
        createDots();
        dotCreationTime = time;
    }

    requestAnimationFrame(animate);
}

// Start animation
requestAnimationFrame(animate);

// Add event listeners for controls
d3.selectAll("input, select").on("input", updateGenerators);

// Update fade duration value display
d3.select("#fade-duration").on("input", function() {
    d3.select("#fade-duration-value").text(this.value);
});

// Update number of generators value display
d3.select("#num-generators").on("input", function() {
    d3.select("#num-generators-value").text(this.value);
});

// Update amplitude value display
d3.select("#amplitude").on("input", function() {
    d3.select("#amplitude-value").text(this.value);
});

// ... (keep the existing exportAsGif function and event listener)
