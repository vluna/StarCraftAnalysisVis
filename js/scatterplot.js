// Declare arrays for colour, dimeninsions and league
var league = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "GrandMaster"],
	scDimensions = ["Age", "HoursPerWeek", "TotalHours", "APM", "WorkersMade"],
	colour = ["#996633", "#7A7A7A", "#FFCC00", "#669999", "#666699", "#0000CC", "#FF6600"];

// Declare width and height of the screen
var	width = 650 - 30 - 100,
	height = 500 - 30 - 80;

// Will store the data for the dataset
var data;

var x = d3.scale.ordinal().domain(scDimensions).rangePoints([0, width]);
var y = {};

var line = d3.svg.line();
var axis = d3.svg.axis().orient("left");

// Creates the scatterplot and parrallel coordinates
var parallelCoordinate,
	scatterplot;

// Holds the dimensions used for tooltips
var a = 0,
	b = 1,
	c = 2,
	e = 3,
	f = 4;

// Container for scatterplot
var svg = d3.select("#scatterplot")
			.append("svg:svg")
			.attr("height", height)
			.attr("width", width)
			.append("svg:g")

// Container for parallel coordinate
var svg2 = d3.select("#parallelCoordinate")
			.append("svg:svg")
			.attr("height", height + 30 + 80)
			.attr("width", width + 30 + 100)
			.append("svg:g")
			.attr("transform", "translate(" +100 + ")");

// Adds the tooltip for each one of the points 
var tooltip = d3.select("body")
				.append("div")
                .attr("class", "tooltip");

// Loads the csv file for the data
d3.csv("StarCraft2ReplayAnalysis.csv", function(scData){
    scDimensions.forEach(function(d){
    	// Convert dimensions to numbers
    	scData.forEach(function(p){p[d] = +p[d]; }); 

    	// y range 
    	y[d] = d3.scale.linear()
    			.domain(d3.extent(scData, function(p){return p[d]; }))
    			.range([height, 0]);

    	// Brush
    	y[d].brush = d3.svg.brush()
    		.y(y[d])
    		.on("brush", brush);
    })
	
	// Will store the data for the dataset
	data = scData;
	visualize(); // Call function
});

/*
	This function will draw scatterplot and parallel coordinates and update it
*/
function visualize() {

	// MApping the values of data
	var mapData = d3.keys(data[0]).filter(function(d){return d != "LeagueIndex"});

	// Draw the intial parallel coordinates
	parallelCoordinate = svg2.append("svg:g")
		.attr("class", "parallelCoordinate")
		.selectAll("path")
		.data(data)
		.enter().append("svg:path")
		.attr("d", path)
		.attr("class", function(d){return d["LeagueIndex"] + " line"; })
		.style("stroke", function(d){
			if(d["LeagueIndex"] == league[0])
				return colour[0];
			else if (d["LeagueIndex"] == league[1])
				return colour[1];
			else if (d["LeagueIndex"] == league[2])
				return colour[2];
			else if (d["LeagueIndex"] == league[3])
				return colour[3];
			else if (d["LeagueIndex"] == league[4])
				return colour[4];
			else if (d["LeagueIndex"] == league[5])
				return colour[5];
			else if (d["LeagueIndex"] == league[6])
				return colour[6];
		})
		
		// When mouse is over a point the information will appear
		.on("mouseover", function(d)
		{
    		tooltip.style("display", 'block');
      		tooltip.html(d["LeagueIndex"] + "<br>" + mapData[a] + ": " + d[mapData[a]] 
	      								  + "<br>" + mapData[b] + ": " + d[mapData[b]]
	      								  + "<br>" + mapData[c] + ": " + d[mapData[c]]
	      								  + "<br>" + mapData[e] + ": " + d[mapData[e]]
      									  + "<br>" + mapData[f] + ": " + d[mapData[f]])
              		.style("left", (d3.event.pageX) + "px")
              		.style("top", (d3.event.pageY) + "px");

    	})
    	// When mouse is not over the point do not show the information
    	.on("mouseout", function(d)
    	{
      		tooltip.style("display", 'none');
    	});
	
	// A group element for each line
	var g = svg2.selectAll(".trait")
		.data(scDimensions)
		.enter()
		.append("svg:g")
		.attr("class", "trait")
		.attr("transform", function(d) {return "translate(" + x(d) + ")"; })
		.call(d3.behavior.drag()
		.origin(function(d){return {x: x(d)}; })
		.on("dragstart", dragstart)
		.on("drag", drag)
		.on("dragend", dragend));
	
	// Add axis and text
	g.append("svg:g")
		.attr("class", "axis")
		.each(function(d){d3.select(this).call(axis.scale(y[d])); })
		.append("svg:text")
		.attr("text-anchor", "middle")
		.attr("y", 410)
		.text(String);
	
	// Brush for each axis
	g.append("svg:g")
		.attr("class", "brush")
		.each(function(d){d3.select(this).call(y[d].brush); })
		.selectAll("rect")
		.attr("x", -8)
		.attr("width", 16);

	/*
		This function gets the index of the axis being brushed
	*/
	function dragstart(d) {
		i = scDimensions.indexOf(d);
	}

	/*
		This function drags the x axis of the parallel coordinates
	*/
	function drag(d) {
		x.range()[i] = d3.event.x;
		scDimensions.sort(function(a,b){return x(a) - x(b);});
		g.attr("transform", function(d){return "translate(" + x(d) + ")"});
		parallelCoordinate.attr("d", path);
	}

	function dragend(d) {
		x.domain(scDimensions).rangePoints([0, width]);
		var t = d3.transition().duration(500);
		t.selectAll(".trait")
		.attr("transform", function(d){return "translate(" + x(d) + ")"; });
		t.selectAll(".parallelCoordinate path").attr("d", path);
	}


	// Update the x axis from the graph using the dropdown
	d3.select("#xAxis")
		.on("change", function(){
			a = this.selectedIndex; // Assign the index with x
			drawCircles(); // Draw circles
		})
		.selectAll("option")
		.data(mapData)
		.enter()
		.append("option")
		.attr("value", function(d){ return d})
		.text(function(d){return d;});
	
	// Update the y axis from the graph using the dropdown
	d3.select("#yAxis")
		.on("change", function(){
			b = this.selectedIndex; // Assign the index with y
			drawCircles(); // Draw circles
		})
		.selectAll("option")
		.data(mapData)
		.enter()
		.append("option")
		.attr("value", function(d){return d})
		.text(function(d){return d;});
	

	// Checkboxes for the legue clasification
	d3.select("#leagueOptions")
		.selectAll("input")
		.data(league)
		.enter()
		.append("label")
		.attr("style", function(d){
			if(d == "Bronze")
				return "color: " + colour[0];
			else if(d == "Silver")
				return "color: " + colour[1]; 
			else if(d=="Gold")
				return "color: " + colour[2];
			else if(d == "Platinum")
				return "color: " + colour[3]; 
			else if(d=="Diamond")
				return "color: " + colour[4];
			else if(d == "Master")
				return "color: " + colour[5]; 
			else if(d=="GrandMaster")
				return "color: " + colour[6];
		})
		.text(function (d) {return " " + d; })
		.append("input")
		.attr("type", "checkbox")
		.attr("checked", true)
		.attr("id", function(d){return "check-"+d;})
		.on("change", function(d){
			// If the checkbox is not marked, change opacity to none for scatterplot and parallel coordinates
			if (checkBoxState("check-"+d) == false) {
				console.log(d);
				svg.selectAll(".circle."+d)
					.transition()
					.duration(300)
					.style("opacity", 0);
				svg2.selectAll("path."+d+".line")
					.transition()
					.duration(300)
					.style("opacity", 0);
			}
			// If it is marked change opacity to full for scatterplot and parallel coordinates
			else {
				svg.selectAll("circle.circle."+d)
					.transition()
					.duration(300)
					.style("opacity", 1);
				svg2.selectAll("path."+d+".line")
					.transition()
					.duration(300)
					.style("opacity", 1);
			}
		});

	//set default values for dropdown menu
	$("#yAxis").val(mapData[b]);

	// Draw inital scatterplot
	scatterplot = svg.selectAll("point")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", function(d){return "circle "+d["LeagueIndex"]})
		.attr("r", 5)
		.attr("cx", 0)
		.attr("cy", height)
		.style("fill", function(d){
			if(d["LeagueIndex"] == "Bronze")
				return colour[0];
			else if (d["LeagueIndex"] == "Silver")
				return colour[1];
			else if (d["LeagueIndex"] == "Gold")
				return colour[2];
			else if (d["LeagueIndex"] == "Platinum")
				return colour[3];
			else if (d["LeagueIndex"] == "Diamond")
				return colour[4];
			else if (d["LeagueIndex"] == "Master")
				return colour[5];
			else if (d["LeagueIndex"] == "GrandMaster")
				return colour[6];
		})

		// When mouse is over a point the information will appear
		.on("mouseover", function(d)
		{
    		tooltip.style("display", 'block');
      		tooltip.html(d["LeagueIndex"] + "<br>" + mapData[a] + ": " + d[mapData[a]] 
	      								  + "<br>" + mapData[b] + ": " + d[mapData[b]]
	      								  + "<br>" + mapData[c] + ": " + d[mapData[c]]
	      								  + "<br>" + mapData[e] + ": " + d[mapData[e]]
      									  + "<br>" + mapData[f] + ": " + d[mapData[f]])
              		.style("left", (d3.event.pageX) + "px")
              		.style("top", (d3.event.pageY) + "px");

    	})
    	// When mouse is not over the point do not show the information
    	.on("mouseout", function(d)
    	{
      		tooltip.style("display", 'none');
    	})

	drawCircles(); // Call function
}

/*
	Checks if the box are marked or not
*/
function checkBoxState(checkboxID) {
	return document.getElementById(checkboxID).checked;
}

/*
	This function draws the circles
*/
function drawCircles() {

	// Remove previous graph
	svg.selectAll("g").remove();
	svg.selectAll("text").remove();

	// Mapping the values of data
	var mapData = d3.keys(data[0]).filter(function(d){return d != "LeagueIndex"});

	// Getting the scale for x and y
	var xScale = d3.scale.linear().domain([d3.min(data, function(d){return d[mapData[a]];}), d3.max(data, function(d){return d[mapData[a]];})]).range([55, width-40]);
	var yScale = d3.scale.linear().domain([d3.min(data, function(d){return d[mapData[b]];}), d3.max(data, function(d){return d[mapData[b]];})]).range([height-40, 10]);

	// Set the orientation for the x axis to be at the bottom 
	var xAxis = d3.svg.axis();
	xAxis.scale(xScale)
		.orient("bottom");

	// Set the orientation for the y axis to be at the left
	var yAxis = d3.svg.axis();
	yAxis.scale(yScale)
		.orient("left");

	// Adds the text for the x axis
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(10," + (height - 30) + ")")
		.call(xAxis);
	svg.append("text")
       .attr("class", "x label")
       .attr("text-anchor", "end")
       .attr("x", width-10)
       .attr("y", height-2)
       .style("text-anchor", "end")
       .text(mapData[a]);

    // Adds the text for the y axis
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + 50 + ",0)")
		.call(yAxis);
	svg.append("text")
       .attr("class", "y label")
       .attr("transform", "rotate(-90)")
       .attr("text-anchor", "end")
       .attr("y", 20)
       .attr("x", -10)
       .style("text-anchor", "end")
       .text(mapData[b]);

    // Draw circles with in the correct location and size 
	svg.selectAll("circle")
		.transition()
		.ease("linear")
		.duration(300)
		.attr("cx", function(d) {return xScale(d[mapData[a]]);})
		.attr("cy", function(d) {return yScale(d[mapData[b]]);});

}

/*
	This funciton draws the lines for the graph
*/
function path(d) {
	return line(scDimensions.map(function(p){ return [x(p), y[p](d[p])]; }));
}

/*
	This funciton will filter the data according to the brush
*/
function brush() {
	var showData = scDimensions.filter(function(p){return !y[p].brush.empty(); });
	var extents = showData.map(function(p) {return y[p].brush.extent(); });
	parallelCoordinate.classed("fade", function(d) {
		return !showData.every(function(p, i){
			return extents[i][0] <= d[p] && d[p] <= extents[i][1];
		});
	});
	scatterplot.classed("fade", function(d){
		return !showData.every(function(p, i){
			return extents[i][0] <= d[p] && d[p] <= extents[i][1];
		});
	});	
}