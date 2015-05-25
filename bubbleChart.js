<SCRIPT LANGUAGE="JavaScript">

var diameter = 550,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);


var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

var realcolor = d3.scale.linear()
    .domain([-50, 0, 10])
    .range(["red", "white", "green"]);

var node = svg.selectAll(".node")
    .data(bubble.nodes(classes(budget))
    .filter(function (d) {
    return !d.children;
}))
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
    return "translate(" + d.x + "," + d.y + ")";
});

node.append("circle")
    .attr("r", function (d) {
    return d.r;
})
    .attr("class","default_circle")
    .style("fill", function (d) {
    return realcolor(d.cambio);
});

node.append("text")
    .attr("class","titlos")
    .attr("dy", ".3em")
    .style("text-anchor", "middle")
    .text(function (d) {
    return d.className.substring(0, d.r / 3);
});

node.on("mousemove", function (d) {
    var nodeSelection = d3.select(this);


    //change the class of the selected circle object
    nodeSelection.select("circle")
        .attr("class","selected_circle");

    //Get this bar's x/y values, then augment for the tooltip
    var xPosition = d3.event.pageX - 160;
    var yPosition = d3.event.pageY - 60;

    var title = d.className;
    var content = "Προϋπολογισμός (2014): " + format(d.value) + "€";
    var percent = "Μεταβολή (με 2013): " + d.cambio+"%";


    d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select(".title")
        .text(title)

    d3.select("#tooltip")
        .select(".value")
        .text(content)

    d3.select("#tooltip")
        .select(".percent")
        .text(percent)

    //Show the tooltip
    d3.select("#tooltip").classed("hidden", false);
});

node.on("mouseout", function (d) {
    var nodeSelection = d3.select(this);


    //reset the class of the de-selected circle object
    nodeSelection.select("circle")
        .attr("class","default_circle");

    nodeSelection.attr("stroke-width", "0px");

    //Hide the tooltip
    d3.select("#tooltip").classed("hidden", true);
});


// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
    var classes = [];

    function recurse(name, node) {
        if (node.children) node.children.forEach(function (child) {
            recurse(node.name, child);
        });
        else classes.push({
            packageName: name,
            className: node.name,
            value: node.size,
            cambio: node.change
        });
    }

    recurse(null, root);
    return {
        children: classes
    };
}

d3.select(self.frameElement).style("height", diameter + "px");

</script>
