let width_d2 = 800, height_d2 = 300;

let svg2 = d3.select("#svg2")
.attr("viewBox", "0 0 " + width_d2 + " " + height_d2)

svg2.append("text")
    .attr("x", "50%")
    .attr("y", "50%")
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "middle")
    .text("diagram 2")