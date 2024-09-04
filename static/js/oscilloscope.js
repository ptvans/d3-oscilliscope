// Set up the SVG
const svg = d3.select("#oscilloscope");
const width = svg.node().getBoundingClientRect().width;
const height = svg.node().getBoundingClientRect().height;

// Initialize generators array
let generators = [];

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

// Function to calculate new positions
function calculatePositions(t) {
    generators.forEach(gen => {
        const waveformType = d3.select("#waveform-type").property("value");
        switch (waveformType) {
            case "lissajous":
                gen.x = width / 2 + gen.amplitude * Math.sin(gen.frequency * t + gen.phase);
                gen.y = height / 2 + gen.amplitude * Math.sin(2 * gen.frequency * t);
                break;
            case "spiral":
                const r = gen.amplitude * (1 - Math.exp(-0.1 * t));
                gen.x = width / 2 + r * Math.cos(gen.frequency * t + gen.phase);
                gen.y = height / 2 + r * Math.sin(gen.frequency * t + gen.phase);
                break;
            case "rose":
                const k = 2;
                const r_rose = gen.amplitude * Math.sin(k * (gen.frequency * t + gen.phase));
                gen.x = width / 2 + r_rose * Math.cos(gen.frequency * t + gen.phase);
                gen.y = height / 2 + r_rose * Math.sin(gen.frequency * t + gen.phase);
                break;
            case "butterfly":
                const exp_t = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5);
                gen.x = width / 2 + gen.amplitude * Math.sin(t + gen.phase) * exp_t;
                gen.y = height / 2 + gen.amplitude * Math.cos(t + gen.phase) * exp_t;
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
            .attr("fill", "#00ff00")
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

// ... (keep the existing exportAsGif function and event listener)
