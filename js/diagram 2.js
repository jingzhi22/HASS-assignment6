const width_d2 = 800, height_d2 = 400;

let svg2 = d3.select("body").select("#my_dataviz1")
  .attr("viewBox", "0 0 " + width_d2 + " " + height_d2);

function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(.03).restart();
    d.fx = d.x;
    d.fy = d.y;
}
function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}
function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(.03);
    d.fx = null;
    d.fy = null;
}



// Read data
d3.csv("data/data_space_time.csv").then(function (data) {

  const size_d2 = d3.scaleLinear()
      .domain([0, 2500])
      .range([0, 50])  // circle will be between 5 and 55 px wide

  const color_d2 = d3.scaleOrdinal()
      .domain(["L1", "L2", "L6", "L4", "B1", "L7", "L8", "L9", "B2"]) //ordered this way to have visual harmony with idiom 1, same colour palette
      .range(d3.schemePaired);

  const tooltip_d2 = d3.select("#my_dataviz1").append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .text("poop")
      

  // Initialize the circle: all located at the center of the svg area
  var node = svg2
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("class", "node")
    .attr("r", d => size_d2(d.total))
    .attr("cx", width_d2 *0.5)
    .attr("cy", height_d2 *0.5)
    .style("fill", d => color_d2(d.level))
    .style("fill-opacity", 0.8)
    .style("stroke-width", 0.5)
    .on("mouseover", function(event,d) {
      svg2.append("foreignObject")
                    .attr('id','meta')
                    .attr("width", "100%")
                    .attr("x", "0%")
                    .attr("y", "80%")
                    .attr("height", "50%")
                    .append("xhtml:div")
                    .style("font-size", "20px")
                    .style("opacity", 1)
                    .style("text-align","center")
                    .html('<u>' + "Level " + d.level + " " + d.name + '</u>' + "<br>Time spent during the experiment: " + d.hours + " hours " + d.min + " minutes");
    })
    .on("mouseleave", function(event,d) {
      svg2.select("#meta").remove()
    })
    .call(d3.drag() // call specific function when circle is dragged
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    ;

    const simulation = d3.forceSimulation()
      .force("center", d3.forceCenter().x(width_d2 / 2).y(height_d2 / 2)) // Attraction to the center of the svg area
      .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
      .force("collide", d3.forceCollide().strength(.2).radius(function (d) { return (size_d2(d.total) + 3) }).iterations(1)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
      .nodes(data)
      .on("tick", function (d) {
        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
      })
      
})

  // Legend: select the svg area
  var Svg2 = d3.select("#my_dataviz2")
  .attr("viewBox", "0 0 " + width_d2 + " " + height_d2*0.1);

  // create a list of keys
  var keys = ["L1", "L2", "L6", "L4", "B1", "L7", "L8", "L9", "B2"]

  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemePaired);

  // Add one dot in the legend for each name.
  Svg2.selectAll("mydots")
    .data(keys)
    .enter()
    .append("circle")
    .attr("cy", "50%")
    .attr("cx", function (d, i) {
      var cx = 5 + i*100/10
      return cx + "%"
      }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function (d) { return color(d) })
  

  // Add one dot in the legend for each name.
  Svg2.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("y", "50%")
    .attr("x", function (d, i) {
      var cx = 7 + i*100/10
      return cx + "%"
      }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) { return color(d) })
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .attr("dominant-baseline", "middle")
    .style("font-family", "Open Sans");
