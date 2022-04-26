let width_d3 = 800, height_d3 = 350;
let graphWidth = width_d3*0.7, dataWidth = width_d3*0.3
let xoffset = 0.1
let svg3a = d3.select("#svg3a")
.attr("viewBox", "0 0 " + graphWidth + " " + height_d3)

let svg3b = d3.select("#svg3b")
.attr("viewBox", "0 0 " + dataWidth + " " + height_d3)

// DEFINE TOOLTIP
var Tooltip = d3.select("body").append("div")
    .attr("class", "Tooltip")
    .style("opacity", 0);

// FUNCTION TO INSTANTIATE CURVE
var makeCurve = d3.line().curve(d3.curveCatmullRom.alpha(0.5));
//var makeCurve = d3.line()

// FUNCITONS TO CONVERT INDEX TO COORDINATES
function GetCoordinates(x,y){
    var floorSpaceCount = [6,9,14,4,2,6,2,10,6,7,5,2,2]
    var long = width_d3 * 0.7 * 0.05 + (width_d3 * 0.7 * 0.95 * x) / floorSpaceCount[y];
    var long = graphWidth*xoffset + ((graphWidth * x) / (floorSpaceCount[y]-1))*(1 - xoffset*2);
    var lat = height_d3 * 0.9 - ((height_d3* 0.8 * y) / 12);
    return [long,lat];
}

function createYAxis(){
    var levels = ['B2','B1','L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11']
    for(let i = 0; i < 13; i++){
        svg3a.append("text")
            .attr("x", width_d3 * 0.7 * 0.05)
            .attr("y",  height_d3 * 0.9 - ((height_d3* 0.8 * i) / 12))
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-family","arial")
            .text(levels[i]);    
    } 
}

// FUNCTIONS TO MOVE FRONT AND BACK FOR MOUSEOVER
d3.selection.prototype.moveToFront = function() {  
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };
d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};

// FUNCTION TO CREATE MENU
function createMenu(userData){
    var userGroups = d3.map(userData, function(d){return(d.group)}).keys();
    userGroups.unshift("All Users");
    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(userGroups)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) {
            return d; 
        })
}

// FUNCTION TO FILTER BY USER - FOR MENU
function updateUserGroup(selectedGroup, userData) { 
    // Create new data with the selection
    if (selectedGroup == "All Users"){var filteredUserData = userData;}
    else{var filteredUserData = userData.filter(function(d){return d.group==selectedGroup});}
    return filteredUserData
}

// FUNCTION TO FILTER BY TRIP ID
function updateUserTrip(trip_id, userData){
    return userData.filter(function(d){return d.trip_id==trip_id});
}

// FUNCTION TO GET COORDINATES FROM TRIP
function getTripCoor(tripData, nodeData){
    var tripCoor = []
    for(let k = 0; k < tripData.length; k++)
    {
        fromNode = nodeData.filter(row => row.Label == tripData[k]['location_z'])[0];
        tripCoor.push(GetCoordinates(fromNode.X,fromNode.Y))
    }
    return tripCoor
}

// FUNCTION TO PLOT NODES
function plotNodes(nodeData){
    for(let i = 0; i < nodeData.length; i++){
        let row = nodeData[i];
        let totalCount = row.EmployeeCount + row.ResidentCount + row.VisitorCount;
        svg3a.append("circle")
            .attr("cx", GetCoordinates(row.X,row.Y)[0])
            .attr("cy", GetCoordinates(row.X,row.Y)[1])
            .attr("r", 2 + (5 * Math.log(totalCount+1) / Math.log(100000)))
            .on("mouseover", function (event,d) 
            {
                Tooltip.transition()
                    .style("opacity", .9);
                Tooltip.html(
                    "Node" + "<br/>" +
                    row.level + ' ' + row.space + "<br/><br/>" +
                    "Employee Count: " + row.EmployeeCount + "<br/>" +
                    "Resident Count: " + row.ResidentCount + "<br/>" +
                    "Visitor Count: " + row.VisitorCount
                )
                .style("left", (70) + "%")
                .style("top", (5) + "%");
                d3.select(this).transition()
                    .style("fill", "yellow")
            })
            .on("mouseleave",function (event,d){
                Tooltip.transition().style("opacity", 0)
                d3.select(this).transition()
                    .style("fill", "black")
            });
    }
}

function getCleanEdgeText(data){
    var clean = "Edge" + "<br/>";
    clean += data.values[0].trip_id + "<br/><br/>";
    var currLoc = data.values[0].location_z
    var row_count = 0
    for(let i = 0; i<data.values.length; i++){
        values = data.values[i]
        if(values.location_z != currLoc)
        {
            clean += values.level + " " + values.space + " " + values.duration_min + " min" + "<br/>"
            currLoc = values.location_z
            row_count += 1
        }
        if (row_count > 10){
            clean += "..."
            break
        }
        }
    return clean
}

// FUNCTION TO PLOT EDGES   
function plotEdges(user, userData, nodeData){
    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d.trip_id;})
        .entries(updateUserGroup(user, userData));
    svg3a.append('g')
        .attr("class", "plottedGroup")
        .attr("id", "plottedGroup")
        .selectAll(".line")
        .data(sumstat)
        .enter()
        .append("path")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr('opacity','0.2')
            .attr("d", function(d){
                var tripCoor = getTripCoor(d.values, nodeData);
                return makeCurve(tripCoor)
            })
            .moveToBack()
            .on("mouseover", function (event,d){
                var cleanEdgeText = getCleanEdgeText(sumstat[d])

                d3.select(this).transition()
                    .style("stroke", "yellow")
                    .attr("fill", "none")
                    .style("opacity", 1)

                Tooltip.transition()
                    .style("opacity", .9);

                Tooltip.html(
                    cleanEdgeText
                    )
                    .style("left", (70) + "%")
                    .style("top", (5) + "%");
            })
            .on("mouseleave",function (event,d){
                d3.select(this).transition()
                    .style("stroke", "black")
                    .style("opacity", 0.2)
                    .moveToBack()
                Tooltip.transition().style("opacity", 0)
            })

}

// MAIN DATAFRAME
d3.queue()
.defer(d3.csv, "data/users_1.csv")
.defer(d3.csv, "data/nodes.csv")
.await(function(error, userData, nodeData) {
    
    // Create menu
    createMenu(userData)
    createYAxis()

    // Plt nodes
    plotNodes(nodeData);

    // Initialize graph
    plotEdges("All Users", userData, nodeData)

    // Update Graph
    d3.select("#selectButton").on("change", function(d) {
        svg3a.select("#plottedGroup").remove()
        var selectedUser = d3.select(this).property("value")
        plotEdges(selectedUser, userData, nodeData);
   });

})