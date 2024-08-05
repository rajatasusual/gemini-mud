let SVG = null;
let SVGWidth = window.innerWidth / 2;
let SVGHeight = window.innerHeight;
const gridSize = 20; // Size of each grid cell


let mouse_x = 0, mouse_y = 0;
let zoom_level = 0.5;

let SIMULATION = null;
let force = true;
let NODE, LINK;

let zoom = null;

//STATE HANDLERS
let tooltip = null;

//Handling all left click events
var DELAY = 400, clicks = 0, timer = null;

// Event handling for creating links
let creatingLink = false;
let sourceNode = null;
let tempLink = null;

const GRAPH = {

  clear: () => {
    SVG && SVG.selectAll("*")
      .transition() // Add transition
      .duration(1000) // Set duration to 1 second
      .attr("transform", "scale(0)") // Scale down the elements
      .remove(); // Remove elements after transition

    tooltip && tooltip.style("display", "none");
  },

  init: (nodes, links) => {

    // Initialize tooltip
    GRAPH.resetState();

    GRAPH.initialiseSVG();

    GRAPH.initSimulation(nodes, links);

    GRAPH.updateVisualization(nodes, links);

    window.addEventListener('resize', GRAPH.updateSVGSize);
  },

  updateSVGSize: () => {
    SVGWidth = (window.innerWidth / 2) - 50;
    SVGHeight = window.innerHeight;
    SVG.attr("width", SVGWidth)
      .attr("height", SVGHeight);

    GRAPH.addLegend();

    SIMULATION.force("center", d3.forceCenter(SVGWidth / 2, SVGHeight / 2));
    SIMULATION.alphaTarget(0.3).restart();
  },

  initialiseSVG: () => {

    SVG = d3.select("#graph")
      .attr("width", SVGWidth)
      .attr("height", SVGHeight);

    GRAPH.addGridlines();
    GRAPH.addLegend();

    SVG.on("contextmenu", function (event) { // Disable right-click
      event.preventDefault();
    });

    // Create groups for links and nodes
    const linkGroup = SVG.append("g").attr("class", "links");
    const nodeGroup = SVG.append("g").attr("class", "nodes");

    GRAPH.initZoom(linkGroup, nodeGroup);

    LINK = linkGroup.selectAll(".link");
    NODE = nodeGroup.selectAll(".node");
  },

  addLegend: () => {

    SVG.selectAll(".legend").remove();

    const legendDetails = [
      ["node", "Rooms"],
      ["link", "Paths"]
    ];

    const rect = SVG.append("g")
      .attr("class", "legend");

    let y = 60; // Initial y position for legend entries

    legendDetails.forEach(legendEntry => {
      rect.append("circle")
        .attr("cx", SVGWidth - 150 + 20) // Adjust x position relative to rect
        .attr("cy", y)
        .attr("r", 5)
        .attr("class", `${legendEntry[0]}`)
        .attr("pointer-events", "none");
      rect.append("text")
        .attr("x", SVGWidth - 150 + 40) // Adjust x position relative to rect
        .attr("y", y)
        .text(legendEntry[1])
        .style("font-size", "10px")
        .attr("alignment-baseline", "middle")
        .attr("class", `legend-text`)
        .attr("pointer-events", "none");

      y += 30; // Increment y position for next legend entry
    });

    const text = rect.append("text")
      .attr("x", 10)
      .attr("y", SVGHeight - 20)
      .attr("font-size", "12px")
      .attr("class", "legend-text")

    // Mousemove event handler to update coordinates
    document.addEventListener("mousemove", function (event) {
      [mouse_x, mouse_y] = [event.clientX, event.clientY - 70];
      text.text(`Mouse Coordinates: (${mouse_x}, ${mouse_y}) | Zoom Level: ${Math.round(zoom_level * 100)}%`);
    });
  },

  addGridlines: () => {

    const numCellsX = Math.floor(SVGWidth / (gridSize * zoom_level));
    const numCellsY = Math.floor(SVGHeight / (gridSize * zoom_level));

    SVG.selectAll(".gridlines").remove();

    const gridlines = SVG.append("g").attr("class", "gridlines");

    // Add horizontal gridlines
    gridlines.selectAll(".hline")
      .data(d3.range(numCellsY))
      .enter()
      .append("line")
      .attr("class", "hline")
      .attr("x1", 0)
      .attr("y1", d => d * gridSize * zoom_level)
      .attr("x2", SVGWidth)
      .attr("y2", d => d * gridSize * zoom_level);

    // Add vertical gridlines
    gridlines.selectAll(".vline")
      .data(d3.range(numCellsX))
      .enter()
      .append("line")
      .attr("class", "vline")
      .attr("x1", d => d * gridSize * zoom_level)
      .attr("y1", 0)
      .attr("x2", d => d * gridSize * zoom_level)
      .attr("y2", SVGHeight);

  },

  initZoom: (linkGroup, nodeGroup) => {
    zoom = d3.zoom()
      .scaleExtent([0.1, 1])
      .on("zoom", zoomed);

    // call the zoom:
    SVG.call(zoom)

    // trigger tha initial zoom with an initial transform.
    SVG.call(zoom.transform, d3.zoomIdentity.scale(0.5).translate(SVGWidth / 2, SVGHeight / 2));

    SVG.on("dblclick.zoom", null); // Disable zoom on double click

    function zoomed({ transform }) {
      zoom_level = transform.k;
      nodeGroup.attr("transform", transform);
      linkGroup.attr("transform", transform);

      GRAPH.addGridlines();
    }
  },

  initSimulation: (nodes, links) => {
    SIMULATION = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id).distance(150)) // Increase or decrease this value as needed
      .force("charge", d3.forceManyBody().strength(force ? -100 : 0)) // Negative value indicates repulsion
      .force("collide", d3.forceCollide().radius(force ? 20 : 0))
      .alphaDecay(force ? 0.01 : 0.1);

    SIMULATION.nodes(nodes);
    SIMULATION.force("link").links(links);
    SIMULATION.force("center", d3.forceCenter(SVGWidth / 2, SVGHeight / 2));

    SIMULATION.on("tick", () => {
      LINK
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      NODE
        .attr("transform", function (d) {
          return "translate(" + d.x + ", " + d.y + ")";
        });
    });
  },

  // UI FUNCTIONS
  updateVisualization: (nodes, links) => {

    LINK = LINK.data(links);
    LINK.exit().remove();
    LINK = LINK.enter().append("line")
      .attr("class", "link")
      .merge(LINK);

    NODE = NODE.data(nodes);
    NODE.exit().remove();
    NODE = NODE.enter().append("g")
      //add a class startNode for the start node
      .attr("class", "node")
      .call(d3.drag()
        .on("start", GRAPH.dragEvents.dragstarted)
        .on("drag", GRAPH.dragEvents.dragged)
        .on("end", GRAPH.dragEvents.dragended))
      .merge(NODE);

    NODE.selectAll("circle").remove();
    NODE.append("circle")
      .attr("r", 20) // Increase circle radius to 20
      .on("mouseover", GRAPH.mouseEvents.handleMouseOver)
      .on("mouseout", GRAPH.mouseEvents.handleMouseOut)

    SIMULATION.nodes(nodes);
    SIMULATION.force("link").links(links);

    SIMULATION.alphaTarget(0.3).restart();
  },

  resetState: function () {
    tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip');

    DELAY = 400, clicks = 0, timer = null;

    creatingLink = false;
    sourceNode = null;
    tempLink && tempLink.remove();
  },

  mouseEvents: {
    handleMouseOver: function (event, d) {
      d3.select(this)
        .style("opacity", "0.5")
        .style("cursor", "pointer");

      tooltip.style("display", "block") // Show tooltip
        .html(`Room: ${d.label}`) // Set tooltip text
        .style("left", (event.pageX + 10) + "px") // Position tooltip
        .style("top", (event.pageY - 20) + "px");
    },

    handleMouseOut: function (_event, d) {
      d3.select(this)
        .style("opacity", "1");
      tooltip.style("display", "none");
    }
  },

  dragEvents: {
    dragstarted: function (event, d) {
      if (!event.active)
        SIMULATION.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    },

    dragged: function (event, d) {
      d.fx = event.x;
      d.fy = event.y;
    },

    dragended: function (event, d) {
      if (!event.active)
        SIMULATION.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }

}