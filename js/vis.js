(function() {
    var BubbleChart, root,
        __bind = function(fn, me) {
            return function() {
                return fn.apply(me, arguments);
            };
        };

    BubbleChart = (function() {
        function BubbleChart(data) {
            this.hide_details = __bind(this.hide_details, this);
            this.show_details = __bind(this.show_details, this);
            this.hide_years = __bind(this.hide_years, this);
            this.display_years = __bind(this.display_years, this);
            this.move_towards_year = __bind(this.move_towards_year, this);
            this.display_by_year = __bind(this.display_by_year, this);
            this.move_towards_center = __bind(this.move_towards_center, this);
            this.display_group_all = __bind(this.display_group_all, this);
            this.start = __bind(this.start, this);
            this.create_vis = __bind(this.create_vis, this);
            this.create_nodes = __bind(this.create_nodes, this);
            var max_amount;
            this.data = data;
            this.width = 1440;
            this.height = 720;
            this.tooltip = CustomTooltip("gates_tooltip", 240);
            this.center = {
                x: this.width / 2,
                y: this.height / 2
            };
            // this.year_centers = {
            //     "1932": {
            //         x: this.width / 3,
            //         y: this.height / 2
            //     },
            //     "1911": {
            //         x: this.width / 2,
            //         y: this.height / 2
            //     },
            //     "1943": {
            //         x: 2 * this.width / 3,
            //         y: this.height / 2
            //     }
            // };
            this.years_x = {}
            this.year_centers = {};
            this.layout_gravity = -0.01;
            this.damper = 0.07;
            this.vis = null;
            this.nodes = [];
            this.force = null;
            this.circles = null;
            this.fill_color = d3.scale.ordinal().domain(["low", "medium", "high"]).range(["#F38630", "#A7DBD8", "#69D2E7"]);
            max_amount = d3.max(this.data, function(d) {
                return parseInt(d.pagerank);
            });
            this.radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 85]);
            this.create_nodes();
            this.create_vis();
            createYears(this.year_centers, this.width, this.height);
            createYearLabels(this.years_x, this.width);

        }

        BubbleChart.prototype.create_nodes = function() {
            this.data.forEach((function(_this) {
                return function(d) {
                    var node;
                    node = {
                        id: d.id,
                        radius: _this.radius_scale(parseInt(d.pagerank)),
                        value: d.pagerank,
                        name: d.title,
                        year: d.year,
                        group: d.group,
                        x: Math.random() * 900,
                        y: Math.random() * 800
                    };
                    return _this.nodes.push(node);
                };
            })(this));
            return this.nodes.sort(function(a, b) {
                return b.value - a.value;
            });
        };

        BubbleChart.prototype.create_vis = function() {
            var that;
            this.vis = d3.select("#vis").append("svg").attr("width", this.width).attr("height", this.height).attr("id", "svg_vis");

            // Draws the circles from the nodes
            this.circles = this.vis.selectAll("g").data(this.nodes, function(d) {
                return d.id;
            });
            that = this;

            // var node = this.circles.attr("class", "node");
            this.circles.enter().append("g").append("circle").attr("r", 0).attr("fill", (function(_this) {
                return function(d) {
                    return _this.fill_color(d.group);
                };
            })(this)).attr("stroke-width", 2).attr("stroke", (function(_this) {
                return function(d) {
                    return d3.rgb(_this.fill_color(d.group)).darker();
                };
            })(this)).attr("id", function(d) {
                return "bubble_" + d.id;
            }).on("mouseover", function(d, i) {
                return that.show_details(d, i, this);
            }).on("click", function(d) {
                window.open("https://en.wikipedia.org/wiki/" + d.name);
            }).on("mouseout", function(d, i) {
                return that.hide_details(d, i, this);
            });


            this.vis.selectAll("g").append("text")
            .attr("font-size", function(d) {
                if (d.group.localeCompare("high") == 0) {
                    return "18px"
                }
                else if (d.group.localeCompare("medium") == 0){
                    return "12px";
                }
                else {
                    return "0px"
                }
            })
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                if (d.group.localeCompare("high") == 0 || d.group.localeCompare("medium") == 0) {
                    return d.name.split('_')[0]  + " " + d.name.split('_')[1]
                }
                else {
                    return "";
                }
            });

            return this.vis.selectAll("circle").transition().duration(2000).attr("r", function(d) {
                return d.radius;
            });
        };

        BubbleChart.prototype.charge = function(d) {
            return -Math.pow(d.radius, 2.0) / 8;
        };

        BubbleChart.prototype.start = function() {
            return this.force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
        };

        BubbleChart.prototype.display_group_all = function() {
            this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", (function(_this) {
                return function(e) {
                    return _this.vis.selectAll("g").each(_this.move_towards_center(e.alpha)).attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
                };
            })(this));
            this.force.start();
            return this.hide_years();
        };

        BubbleChart.prototype.move_towards_center = function(alpha) {
            return (function(_this) {
                return function(d) {
                    d.x = d.x + (_this.center.x - d.x) * (_this.damper + 0.02) * alpha;
                    return d.y = d.y + (_this.center.y - d.y) * (_this.damper + 0.02) * alpha;
                };
            })(this);
        };

        BubbleChart.prototype.display_by_year = function() {
            this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", (function(_this) {
                return function(e) {
                    return _this.vis.selectAll("g").each(_this.move_towards_year(e.alpha)).attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
                };
            })(this));
            this.force.start();
            return this.display_years();
        };

        BubbleChart.prototype.move_towards_year = function(alpha) {
            return (function(_this) {
                return function(d) {
                    var target;
                    target = _this.year_centers[d.year];
                    d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
                    return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
                };
            })(this);
        };

        BubbleChart.prototype.display_years = function() {
            var years, years_data, years_x;
            // years_x = {
            //     "1932": 160,
            //     "1943": this.width / 2,
            //     "1911": this.width - 160
            // };
            years_x = this.years_x;
            years_data = d3.keys(years_x);
            years = this.vis.selectAll(".years").data(years_data);
            return years.enter().append("text").attr("class", "years").attr("x", (function(_this) {
                return function(d) {
                    return years_x[d];
                };
            })(this)).attr("y", 40).attr("text-anchor", "middle").text(function(d) {
                return d;
            });
        };

        BubbleChart.prototype.hide_years = function() {
            var years;
            return years = this.vis.selectAll(".years").remove();
        };

        BubbleChart.prototype.show_details = function(data, i, element) {
            var content;
            d3.select(element).attr("stroke", "black");
            content = "<span class=\"name\">Name:</span><span class=\"value\"> " + data.name.split('_')[0] + " " + data.name.split('_')[1] + "</span><br/>";
            content += "<span class=\"name\">PageRank:</span><span class=\"value\"> " + parseFloat(data.value).toFixed(2) + "</span><br/>";
            content += "<span class=\"name\">Year:</span><span class=\"value\"> " + data.year + "</span>";
            return this.tooltip.showTooltip(content, d3.event);
        };

        BubbleChart.prototype.hide_details = function(data, i, element) {
            d3.select(element).attr("stroke", (function(_this) {
                return function(d) {
                    return d3.rgb(_this.fill_color(d.group)).darker();
                };
            })(this));
            return this.tooltip.hideTooltip();
        };

        return BubbleChart;

    })();

    root = typeof exports !== "undefined" && exports !== null ? exports : this;

    // Dynamically creates the years
    function createYears(year_centers, width, height) {
        var years = new Array();
        var csv = d3.csv("data/pageRanks.csv", function(d) {
            for (var i = 0; i < d3.keys(d).length; i++) {
                years.push(d3.values(d)[i].year);
            }
            years = _.uniq(years);
            years = years.sort();
            for (var i = 0; i < years.length; i++) {
                if (i == 0) {
                    year_centers[years[i]] = {
                        x: (i+0.5) * width / years.length ,
                        y: height / 2
                    };
                }
                else if (i == years.length - 1) {
                    year_centers[years[i]] = {
                        x: (i-0.5) * width / years.length ,
                        y: height / 2
                    };
                }
                else {
                    year_centers[years[i]] = {
                        x: width / 6 + 0.70 * i * width / years.length,
                        y: height / 2
                    };
                }
            }
        });
    }

    function createYearLabels(years_x, width) {
        var years = new Array();
        var csv = d3.csv("data/pageRanks.csv", function(d) {
            for (var i = 0; i < d3.keys(d).length; i++) {
                years.push(d3.values(d)[i].year);
            }
            years = _.uniq(years);
            years = years.sort();
            for (var i = 0; i < years.length; i=i+7) {
                if (i == 0) {
                    years_x[years[i]] = width/years.length
                }
                else if (i == years.length - 1) {
                    years_x[years[i]] = (i-0.5)*width/years.length;
                }
                else {
                    years_x[years[i]] = i*width/years.length;
                }
            }
        });
    }

    $(function() {

        var chart, render_vis;
        chart = null;
        render_vis = function(csv) {
            chart = new BubbleChart(csv);
            chart.start();
            return root.display_all();
        };
        root.display_all = (function(_this) {
            return function() {
                return chart.display_group_all();
            };
        })(this);
        root.display_year = (function(_this) {
            return function() {
                return chart.display_by_year();
            };
        })(this);
        root.toggle_view = (function(_this) {
            return function(view_type) {
                if (view_type === 'year') {
                    return root.display_year();
                } else {
                    return root.display_all();
                }
            };
        })(this);
        return d3.csv("data/pageRanks.csv", render_vis);
    });

}).call(this);
