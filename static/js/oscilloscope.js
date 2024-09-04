// ... (previous code remains unchanged)

// Export as GIF functionality
function exportAsGif() {
    console.log("Starting GIF export");
    const exportButton = d3.select("#export-gif");
    exportButton.text("Generating GIF...");
    exportButton.attr("disabled", true);

    console.log("Creating GIF object");
    const gif = new GIF({
        workers: 2,
        quality: 5,
        width: width,
        height: height,
        workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
    });

    let frames = 0;
    const totalFrames = 100; // Adjust this value to change the length of the GIF

    function captureFrame() {
        console.log(`Capturing frame ${frames + 1} of ${totalFrames}`);
        const svgData = new XMLSerializer().serializeToString(svg.node());
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));

        img.onload = function() {
            console.log(`Processing frame ${frames + 1}`);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            gif.addFrame(canvas, {delay: 50, copy: true});
            frames++;

            if (frames < totalFrames) {
                updateGenerators();
                drawDots();
                requestAnimationFrame(captureFrame);
            } else {
                console.log("All frames captured, rendering GIF");
                gif.render();
            }
        };
    }

    gif.on('progress', function(p) {
        console.log(`GIF rendering progress: ${Math.round(p * 100)}%`);
    });

    gif.on('finished', function(blob) {
        console.log("GIF rendering finished");
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'oscilloscope.gif';
        link.click();
        exportButton.text("Export as GIF");
        exportButton.attr("disabled", null);
        console.log("GIF download initiated");
    });

    console.log("Starting frame capture");
    captureFrame();
}

// Add event listener for the export button
d3.select("#export-gif").on("click", exportAsGif);
