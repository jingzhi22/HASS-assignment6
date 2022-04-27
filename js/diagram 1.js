let width_d1 = 800, height_d1 = 300;

let svg1 = d3.select("#svg1")
.attr("viewBox", "0 0 " + width_d1 + " " + height_d1)

svg1.append("text")
    .attr("x", "50%")
    .attr("y", "50%")
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "middle")
    .text("diagram 1")