// set the dimensions and margins of the graph
var margin = { top: 20, right: 30, bottom: 40, left: 75 },
  width = 450 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg_global = d3
  .select("#heatmap_global")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var svg_us = d3
  .select("#heatmap_us")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var agg_svg_us = d3
  .select("#aggregated_us")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom + 75)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var agg_svg_global = d3
  .select("#aggregated_global")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom + 75)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// read data
d3.csv("sof_22_5000sample.csv").then((data) => {
  d3.json("sof_22_aggregated.json").then((agg_data) => {
    agg_data_global = agg_data.all_regions;
    agg_data_usa = agg_data.usa;
    agg_data_nonusa = agg_data.non_usa;

    var global = true;
    var overview = true;
    data_to_use = data;
    data_us = [];
    data.forEach((d) => {
      if (d.Country == "United States of America") data_us.push(d);
    });

    // Get max and min of data
    var xLim = [0, 50];
    var yLim = [0, 1112000];

    // some people only fill out workexp, while others only fill out yearscodepro
    var xAccessor = (d) => +Math.max(+d.WorkExp, +d.YearsCodePro);
    var yAccessor = (d) => +d.ConvertedCompYearly;

    // Add X axis
    var x = d3.scaleLinear().nice().domain(xLim).range([0, width]);
    svg_global
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    svg_us
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear().nice().domain(yLim).range([height, 0]);
    svg_global.append("g").call(d3.axisLeft(y));
    svg_us.append("g").call(d3.axisLeft(y));

    // Reformat the data: d3.rectbin() needs a specific format
    var ySize = 30000;
    var xSize = 1;
    var inputForRectBinning = [];
    var inputForRectBinning_us = [];
    data_to_use.forEach(function (d) {
      inputForRectBinning.push([
        +Math.max(+d.WorkExp, +d.YearsCodePro),
        +(Math.floor(+d.ConvertedCompYearly / ySize) * ySize),
      ]); // Note that we had the transform value of X and Y !
    });
    data_us.forEach(function (d) {
      inputForRectBinning_us.push([
        +Math.max(+d.WorkExp, +d.YearsCodePro),
        +(Math.floor(+d.ConvertedCompYearly / ySize) * ySize),
      ]); // Note that we had the transform value of X and Y !
    });

    // Compute the rectbin
    var rectbinData = d3.rectbin().dx(xSize).dy(ySize)(inputForRectBinning);
    var rectbinData_us = d3.rectbin().dx(xSize).dy(ySize)(
      inputForRectBinning_us
    );
    // Prepare a color palette
    var color = d3
      .scaleLinear()
      .domain([0, 12]) // Number of points in the bin?
      .range(["white", "#69a3b2"]);

    var color_barplot = d3
      .scaleOrdinal()
      .domain([
        "Remote",
        "Hybrid",
        "In-Person",
        "Men",
        " Women",
        "Other",
        "Independent Contributors",
        "People Managers",
      ])
      .range([
        "#D2B4DE",
        "#D2B4DE",
        "#D2B4DE",
        "#82E0AA",
        "#82E0AA",
        "#82E0AA",
        "#F8C471",
        "#F8C471",
      ]);
    var color_scatterplot = d3
      .scaleOrdinal()
      .domain(["Man", "Woman", ""])
      .range(["#0436D3", "#0436D3", "#0436D3"]);

    // What is the height of a square in px?
    heightInPx = y(yLim[1] - ySize);

    // What is the width of a square in px?
    //   var widthInPx = x(xLim[0] + size);
    var widthInPx = 1000;

    var currently_clicked_global = [];
    var currently_clicked_us = [];

    var click_barplot_global = function (e, i) {
      var clickedBar = e.target.__data__.attribute;
      // if the value is already selected, unselect it
      // if there is already a bar from the same "group" selected, unselect it
      var index = 0;
      switch (clickedBar) {
        case "Remote":
          index = currently_clicked_global.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_global.splice(index, 1);
          } else {
            currently_clicked_global.push(clickedBar);
          }

          if (currently_clicked_global.includes("Hybrid")) {
            index = currently_clicked_global.indexOf("Hybrid");
            currently_clicked_global.splice(index, 1);
          }
          if (currently_clicked_global.includes("In-Person")) {
            index = currently_clicked_global.indexOf("In-Person");
            currently_clicked_global.splice(index, 1);
          }
          break;
        case "Hybrid":
          index = currently_clicked_global.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_global.splice(index, 1);
          } else {
            currently_clicked_global.push(clickedBar);
          }

          if (currently_clicked_global.includes("Remote")) {
            index = currently_clicked_global.indexOf("Remote");
            currently_clicked_global.splice(index, 1);
          }
          if (currently_clicked_global.includes("In-Person")) {
            index = currently_clicked_global.indexOf("In-Person");
            currently_clicked_global.splice(index, 1);
          }
          break;
        case "In-Person":
          index = currently_clicked_global.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_global.splice(index, 1);
          } else {
            currently_clicked_global.push(clickedBar);
          }

          if (currently_clicked_global.includes("Remote")) {
            index = currently_clicked_global.indexOf("Remote");
            currently_clicked_global.splice(index, 1);
          }
          if (currently_clicked_global.includes("Hybrid")) {
            index = currently_clicked_global.indexOf("Hybrid");
            currently_clicked_global.splice(index, 1);
          }
          break;
        case "Men":
          index = currently_clicked_global.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_global.splice(index, 1);
          } else {
            currently_clicked_global.push(clickedBar);
          }

          if (currently_clicked_global.includes(" Women")) {
            index = currently_clicked_global.indexOf(" Women");
            currently_clicked_global.splice(index, 1);
          }
          if (currently_clicked_global.includes("Other")) {
            index = currently_clicked_global.indexOf("Other");
            currently_clicked_global.splice(index, 1);
          }
          break;
        case " Women":
          index = currently_clicked_global.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_global.splice(index, 1);
          } else {
            currently_clicked_global.push(clickedBar);
          }

          if (currently_clicked_global.includes("Men")) {
            index = currently_clicked_global.indexOf("Men");
            currently_clicked_global.splice(index, 1);
          }
          if (currently_clicked_global.includes("Other")) {
            index = currently_clicked_global.indexOf("Other");
            currently_clicked_global.splice(index, 1);
          }
          break;
        case "Other":
          index = currently_clicked_global.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_global.splice(index, 1);
          } else {
            currently_clicked_global.push(clickedBar);
          }

          if (currently_clicked_global.includes("Men")) {
            index = currently_clicked_global.indexOf("Men");
            currently_clicked_global.splice(index, 1);
          }
          if (currently_clicked_global.includes(" Women")) {
            index = currently_clicked_global.indexOf(" Women");
            currently_clicked_global.splice(index, 1);
          }
          break;
        case "Independent Contributors":
          index = currently_clicked_global.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_global.splice(index, 1);
          } else {
            currently_clicked_global.push(clickedBar);
          }

          if (currently_clicked_global.includes("People Managers")) {
            index = currently_clicked_global.indexOf("People Managers");
            currently_clicked_global.splice(index, 1);
          }
          break;
        case "People Managers":
          index = currently_clicked_global.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_global.splice(index, 1);
          } else {
            currently_clicked_global.push(clickedBar);
          }

          if (currently_clicked_global.includes("Independent Contributors")) {
            index = currently_clicked_global.indexOf(
              "Independent Contributors"
            );
            currently_clicked_global.splice(index, 1);
          }
          break;
      }

      svg_global.selectAll("circle").attr("r", function (d) {
        var satisfies_all = true;
        if (currently_clicked_global.length == 0) {
          return 3;
        }
        for (const cl of currently_clicked_global) {
          switch (cl) {
            case "Remote":
              if (d.RemoteWork !== "Fully remote") satisfies_all = false;
              break;
            case "Hybrid":
              if (d.RemoteWork !== "Hybrid (some remote, some in-person)")
                satisfies_all = false;
              break;
            case "In-Person":
              if (d.RemoteWork !== "Full in-person") satisfies_all = false;
              break;
            case "Men":
              if (d.Gender !== "Man") satisfies_all = false;
              break;
            case " Women":
              if (d.Gender !== "Woman") satisfies_all = false;
              break;
            case "Other":
              if (d.Gender == "Woman" || d.Gender == "Man")
                satisfies_all = false;
              break;
            case "Independent Contributors":
              if (d.ICorPM !== "Independent contributor") satisfies_all = false;
              break;
            case "People Managers":
              if (d.ICorPM !== "People manager") satisfies_all = false;
              break;
          }
          if (!satisfies_all) break;
        }
        if (satisfies_all) return 3;
        return 0;
      });
      // get the proper data
      var agg_data_to_use = [];
      if (global) {
        agg_data_to_use = agg_data_global;
      } else {
        agg_data_to_use = agg_data_nonusa;
      }

      // reset the barplot
      line_global.style("opacity", 0);
      agg_global_yaxis.transition().call(d3.axisLeft(y_agg));
      agg_svg_global
        .selectAll("rect")
        .data(agg_data_to_use)
        .transition() // .transition()
        .attr("x", function (d) {
          return x_agg(d.attribute);
        })
        .attr("y", function (d) {
          return y_agg(d.median);
        })
        .attr("width", x_agg.bandwidth())
        .attr("height", function (d) {
          return height - y_agg(d.median);
        })
        .attr("stroke", "black")
        .attr("stroke-width", function (d) {
          if (currently_clicked_global.includes(d.attribute)) return 1;
          return 0;
        })
        .attr("fill", function (d) {
          switch (d.attribute) {
            case "Remote":
              if (
                currently_clicked_global.includes("Hybrid") ||
                currently_clicked_global.includes("In-Person")
              ) {
                return "#F4ECF7";
              }
              return "#D2B4DE";
              break;
            case "Hybrid":
              if (
                currently_clicked_global.includes("Remote") ||
                currently_clicked_global.includes("In-Person")
              ) {
                return "#F4ECF7";
              }
              return "#D2B4DE";
              break;
            case "In-Person":
              if (
                currently_clicked_global.includes("Hybrid") ||
                currently_clicked_global.includes("Remote")
              ) {
                return "#F4ECF7";
              }
              return "#D2B4DE";
              break;
            case "Men":
              if (
                currently_clicked_global.includes(" Women") ||
                currently_clicked_global.includes("Other")
              ) {
                return "#EAFAF1";
              }
              return "#82E0AA";
              break;
            case " Women":
              if (
                currently_clicked_global.includes("Men") ||
                currently_clicked_global.includes("Other")
              ) {
                return "#EAFAF1";
              }
              return "#82E0AA";
              break;
            case "Other":
              if (
                currently_clicked_global.includes("Men") ||
                currently_clicked_global.includes(" Women")
              ) {
                return "#EAFAF1";
              }
              return "#82E0AA";
              break;
            case "Independent Contributors":
              if (currently_clicked_global.includes("People Managers")) {
                return "#FDEBD0";
              }
              return "#F8C471";
              break;
            case "People Managers":
              if (
                currently_clicked_global.includes("Independent Contributors")
              ) {
                return "#FDEBD0";
              }
              return "#F8C471";
              break;
          }
        });
    };

    var click_barplot_us = function (e, i) {
      var clickedBar = e.target.__data__.attribute;
      // if the value is already selected, unselect it
      // if there is already a bar from the same "group" selected, unselect it
      var index = 0;
      switch (clickedBar) {
        case "Remote":
          index = currently_clicked_us.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_us.splice(index, 1);
          } else {
            currently_clicked_us.push(clickedBar);
          }

          if (currently_clicked_us.includes("Hybrid")) {
            index = currently_clicked_us.indexOf("Hybrid");
            currently_clicked_us.splice(index, 1);
          }
          if (currently_clicked_us.includes("In-Person")) {
            index = currently_clicked_us.indexOf("In-Person");
            currently_clicked_us.splice(index, 1);
          }
          break;
        case "Hybrid":
          index = currently_clicked_us.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_us.splice(index, 1);
          } else {
            currently_clicked_us.push(clickedBar);
          }

          if (currently_clicked_us.includes("Remote")) {
            index = currently_clicked_us.indexOf("Remote");
            currently_clicked_us.splice(index, 1);
          }
          if (currently_clicked_us.includes("In-Person")) {
            index = currently_clicked_us.indexOf("In-Person");
            currently_clicked_us.splice(index, 1);
          }
          break;
        case "In-Person":
          index = currently_clicked_us.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_us.splice(index, 1);
          } else {
            currently_clicked_us.push(clickedBar);
          }

          if (currently_clicked_us.includes("Remote")) {
            index = currently_clicked_us.indexOf("Remote");
            currently_clicked_us.splice(index, 1);
          }
          if (currently_clicked_us.includes("Hybrid")) {
            index = currently_clicked_us.indexOf("Hybrid");
            currently_clicked_us.splice(index, 1);
          }
          break;
        case "Men":
          index = currently_clicked_us.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_us.splice(index, 1);
          } else {
            currently_clicked_us.push(clickedBar);
          }

          if (currently_clicked_us.includes(" Women")) {
            index = currently_clicked_us.indexOf(" Women");
            currently_clicked_us.splice(index, 1);
          }
          if (currently_clicked_us.includes("Other")) {
            index = currently_clicked_us.indexOf("Other");
            currently_clicked_us.splice(index, 1);
          }
          break;
        case " Women":
          index = currently_clicked_us.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_us.splice(index, 1);
          } else {
            currently_clicked_us.push(clickedBar);
          }

          if (currently_clicked_us.includes("Men")) {
            index = currently_clicked_us.indexOf("Men");
            currently_clicked_us.splice(index, 1);
          }
          if (currently_clicked_us.includes("Other")) {
            index = currently_clicked_us.indexOf("Other");
            currently_clicked_us.splice(index, 1);
          }
          break;
        case "Other":
          index = currently_clicked_us.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_us.splice(index, 1);
          } else {
            currently_clicked_us.push(clickedBar);
          }

          if (currently_clicked_us.includes("Men")) {
            index = currently_clicked_us.indexOf("Men");
            currently_clicked_us.splice(index, 1);
          }
          if (currently_clicked_us.includes(" Women")) {
            index = currently_clicked_us.indexOf(" Women");
            currently_clicked_us.splice(index, 1);
          }
          break;
        case "Independent Contributors":
          index = currently_clicked_us.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_us.splice(index, 1);
          } else {
            currently_clicked_us.push(clickedBar);
          }

          if (currently_clicked_us.includes("People Managers")) {
            index = currently_clicked_us.indexOf("People Managers");
            currently_clicked_us.splice(index, 1);
          }
          break;
        case "People Managers":
          index = currently_clicked_us.indexOf(clickedBar);
          if (index > -1) {
            currently_clicked_us.splice(index, 1);
          } else {
            currently_clicked_us.push(clickedBar);
          }

          if (currently_clicked_us.includes("Independent Contributors")) {
            index = currently_clicked_us.indexOf("Independent Contributors");
            currently_clicked_us.splice(index, 1);
          }
          break;
      }

      svg_us.selectAll("circle").attr("r", function (d) {
        var satisfies_all = true;
        if (currently_clicked_us.length == 0) {
          return 3;
        }
        for (const cl of currently_clicked_us) {
          switch (cl) {
            case "Remote":
              if (d.RemoteWork !== "Fully remote") satisfies_all = false;
              break;
            case "Hybrid":
              if (d.RemoteWork !== "Hybrid (some remote, some in-person)")
                satisfies_all = false;
              break;
            case "In-Person":
              if (d.RemoteWork !== "Full in-person") satisfies_all = false;
              break;
            case "Men":
              if (d.Gender !== "Man") satisfies_all = false;
              break;
            case " Women":
              if (d.Gender !== "Woman") satisfies_all = false;
              break;
            case "Other":
              if (d.Gender == "Woman" || d.Gender == "Man")
                satisfies_all = false;
              break;
            case "Independent Contributors":
              if (d.ICorPM !== "Independent contributor") satisfies_all = false;
              break;
            case "People Managers":
              if (d.ICorPM !== "People manager") satisfies_all = false;
              break;
          }
          if (!satisfies_all) break;
        }
        if (satisfies_all) return 3;
        return 0;
      });

      // reset the barplot
      line_usa.style("opacity", 0);
      agg_us_yaxis.transition().call(d3.axisLeft(y_agg));
      agg_svg_us
        .selectAll("rect")
        .data(agg_data_usa)
        .transition() // .transition()
        .attr("x", function (d) {
          return x_agg(d.attribute);
        })
        .attr("y", function (d) {
          return y_agg(d.median);
        })
        .attr("width", x_agg.bandwidth())
        .attr("height", function (d) {
          return height - y_agg(d.median);
        })
        .attr("stroke", "black")
        .attr("stroke-width", function (d) {
          if (currently_clicked_us.includes(d.attribute)) return 1;
          return 0;
        })
        .attr("fill", function (d) {
          switch (d.attribute) {
            case "Remote":
              if (
                currently_clicked_us.includes("Hybrid") ||
                currently_clicked_us.includes("In-Person")
              ) {
                return "#F4ECF7";
              }
              return "#D2B4DE";
              break;
            case "Hybrid":
              if (
                currently_clicked_us.includes("Remote") ||
                currently_clicked_us.includes("In-Person")
              ) {
                return "#F4ECF7";
              }
              return "#D2B4DE";
              break;
            case "In-Person":
              if (
                currently_clicked_us.includes("Hybrid") ||
                currently_clicked_us.includes("Remote")
              ) {
                return "#F4ECF7";
              }
              return "#D2B4DE";
              break;
            case "Men":
              if (
                currently_clicked_us.includes(" Women") ||
                currently_clicked_us.includes("Other")
              ) {
                return "#EAFAF1";
              }
              return "#82E0AA";
              break;
            case " Women":
              if (
                currently_clicked_us.includes("Men") ||
                currently_clicked_us.includes("Other")
              ) {
                return "#EAFAF1";
              }
              return "#82E0AA";
              break;
            case "Other":
              if (
                currently_clicked_us.includes("Men") ||
                currently_clicked_us.includes(" Women")
              ) {
                return "#EAFAF1";
              }
              return "#82E0AA";
              break;
            case "Independent Contributors":
              if (currently_clicked_us.includes("People Managers")) {
                return "#FDEBD0";
              }
              return "#F8C471";
              break;
            case "People Managers":
              if (currently_clicked_us.includes("Independent Contributors")) {
                return "#FDEBD0";
              }
              return "#F8C471";
              break;
          }
        });
    };

    var click_heatmap_global = function (e, i) {
      var y_agg_new = d3
        .scaleLinear()
        .domain([0, Math.max(+i.y + 10000, 160000)])
        .range([height, 0]);

      var yAxis_new = d3.axisLeft(y_agg_new);
      agg_global_yaxis.transition().call(yAxis_new);

      rect_global
        .style("opacity", 0.5)
        .attr("x", 0)
        .attr("y", y_agg_new(+i.y))
        .attr("width", width)
        // .attr("height", y_agg_new(Math.max(+i.y - 30000, 0)));
        .attr(
          "height",
          +i.y == 0 ? 5 : y_agg_new(i.y - 30000) - y_agg_new(i.y)
        );

      if (global) {
        agg_svg_global
          .selectAll("rect")
          .data(agg_data_global)
          .transition() // .transition()
          .attr("x", function (d) {
            return x_agg(d.attribute);
          })
          .attr("y", function (d) {
            return y_agg_new(d.median);
          })
          .attr("width", x_agg.bandwidth())
          .attr("height", function (d) {
            return height - y_agg_new(d.median);
          })
          .attr("fill", function (d) {
            return color_barplot(d.attribute);
          });
      } else {
        agg_svg_global
          .selectAll("rect")
          .data(agg_data_nonusa)
          .transition() // .transition()
          .attr("x", function (d) {
            return x_agg(d.attribute);
          })
          .attr("y", function (d) {
            return y_agg_new(d.median);
          })
          .attr("width", x_agg.bandwidth())
          .attr("height", function (d) {
            return height - y_agg_new(d.median);
          })
          .attr("fill", function (d) {
            return color_barplot(d.attribute);
          });
      }
    };
    var click_heatmap_usa = function (e, i) {
      var y_agg_new = d3
        .scaleLinear()
        .domain([0, Math.max(+i.y + 10000, 160000)])
        .range([height, 0]);

      var yAxis_new = d3.axisLeft(y_agg_new);
      agg_us_yaxis.transition().call(yAxis_new);

      rect_usa
        .style("opacity", 0.5)
        .attr("x", 0)
        .attr("y", y_agg_new(+i.y))
        .attr("width", width)
        // .attr("height", y_agg_new(Math.max(+i.y - 30000, 0)));
        .attr(
          "height",
          +i.y == 0 ? 5 : y_agg_new(i.y - 30000) - y_agg_new(i.y)
        );

      agg_svg_us
        .selectAll("rect")
        .data(agg_data_usa)
        .transition() // .transition()
        .attr("x", function (d) {
          return x_agg(d.attribute);
        })
        .attr("y", function (d) {
          return y_agg_new(d.median);
        })
        .attr("width", x_agg.bandwidth())
        .attr("height", function (d) {
          return height - y_agg_new(d.median);
        })
        .attr("fill", function (d) {
          return color_barplot(d.attribute);
        });
    };

    var clicky_global = function (e, i) {
      var y_agg_new = d3
        .scaleLinear()
        .domain([0, Math.max(+i.ConvertedCompYearly + 10000, 160000)])
        .range([height, 0]);

      var yAxis_new = d3.axisLeft(y_agg_new);
      agg_global_yaxis.transition().call(yAxis_new);

      line_global
        .style("opacity", 1)
        .attr("x1", 0)
        .attr("y1", y_agg_new(+i.ConvertedCompYearly))
        .attr("x2", width)
        .attr("y2", y_agg_new(+i.ConvertedCompYearly));

      if (global) {
        agg_svg_global
          .selectAll("rect")
          .data(agg_data_global)
          .transition() // .transition()
          .attr("x", function (d) {
            return x_agg(d.attribute);
          })
          .attr("y", function (d) {
            return y_agg_new(d.median);
          })
          .attr("width", x_agg.bandwidth())
          .attr("height", function (d) {
            return height - y_agg_new(d.median);
          })
          .attr("stroke", "black")
          .attr("stroke-width", function (d) {
            switch (d.attribute) {
              case "Remote":
                if (i.RemoteWork == "Fully remote") return 1;
                else return 0;
                break;
              case "Hybrid":
                if (i.RemoteWork == "Hybrid (some remote, some in-person)")
                  return 1;
                else return 0;
                break;
              case "In-Person":
                if (i.RemoteWork == "Full in-person") return 1;
                else return 0;
                break;
              case "Men":
                if (i.Gender == "Man") return 1;
                else return 0;
                break;
              case " Women":
                if (i.Gender == "Woman") return 1;
                else return 0;
                break;
              case "Other":
                if (i.Gender !== "Woman" && i.Gender !== "Man") return 1;
                else return 0;
                break;
              case "Independent Contributors":
                if (i.ICorPM == "Independent contributor") return 1;
                else return 0;
                break;
              case "People Managers":
                if (i.ICorPM == "People manager") return 1;
                else return 0;
                break;
            }
          })
          .attr("fill", function (d) {
            switch (d.attribute) {
              case "Remote":
                if (i.RemoteWork == "Fully remote") return "#D2B4DE";
                else return "#E8DAEF";
                break;
              case "Hybrid":
                if (i.RemoteWork == "Hybrid (some remote, some in-person)")
                  return "#D2B4DE";
                else return "#E8DAEF";
                break;
              case "In-Person":
                if (i.RemoteWork == "Full in-person") return "#D2B4DE";
                else return "#E8DAEF";
                break;
              case "Men":
                if (i.Gender == "Man") return "#82E0AA";
                else return "#D5F5E3";
                break;
              case " Women":
                if (i.Gender == "Woman") return "#82E0AA";
                else return "#D5F5E3";
                break;
              case "Other":
                if (i.Gender !== "Woman" && i.Gender !== "Man")
                  return "#82E0AA";
                else return "#D5F5E3";
                break;
              case "Independent Contributors":
                if (i.ICorPM == "Independent contributor") return "#F8C471";
                else return "#FAD7A0";
                break;
              case "People Managers":
                if (i.ICorPM == "People manager") return "#F8C471";
                else return "#FAD7A0";
                break;
            }
          });
        agg_svg_global.on("click", click_barplot_global);
      } else {
        agg_svg_global
          .selectAll("rect")
          .data(agg_data_nonusa)
          .transition() // .transition()
          .attr("x", function (d) {
            return x_agg(d.attribute);
          })
          .attr("y", function (d) {
            return y_agg_new(d.median);
          })
          .attr("width", x_agg.bandwidth())
          .attr("height", function (d) {
            return height - y_agg_new(d.median);
          })
          .attr("stroke", "black")
          .attr("stroke-width", function (d) {
            switch (d.attribute) {
              case "Remote":
                if (i.RemoteWork == "Fully remote") return 1;
                else return 0;
                break;
              case "Hybrid":
                if (i.RemoteWork == "Hybrid (some remote, some in-person)")
                  return 1;
                else return 0;
                break;
              case "In-Person":
                if (i.RemoteWork == "Full in-person") return 1;
                else return 0;
                break;
              case "Men":
                if (i.Gender == "Man") return 1;
                else return 0;
                break;
              case " Women":
                if (i.Gender == "Woman") return 1;
                else return 0;
                break;
              case "Other":
                if (i.Gender !== "Woman" && i.Gender !== "Man") return 1;
                else return 0;
                break;
              case "Independent Contributors":
                if (i.ICorPM == "Independent contributor") return 1;
                else return 0;
                break;
              case "People Managers":
                if (i.ICorPM == "People manager") return 1;
                else return 0;
                break;
            }
          })
          .attr("fill", function (d) {
            switch (d.attribute) {
              case "Remote":
                if (i.RemoteWork == "Fully remote") return "#D2B4DE";
                else return "#E8DAEF";
                break;
              case "Hybrid":
                if (i.RemoteWork == "Hybrid (some remote, some in-person)")
                  return "#D2B4DE";
                else return "#E8DAEF";
                break;
              case "In-Person":
                if (i.RemoteWork == "Full in-person") return "#D2B4DE";
                else return "#E8DAEF";
                break;
              case "Men":
                if (i.Gender == "Man") return "#82E0AA";
                else return "#D5F5E3";
                break;
              case " Women":
                if (i.Gender == "Woman") return "#82E0AA";
                else return "#D5F5E3";
                break;
              case "Other":
                if (i.Gender !== "Woman" && i.Gender !== "Man")
                  return "#82E0AA";
                else return "#D5F5E3";
                break;
              case "Independent Contributors":
                if (i.ICorPM == "Independent contributor") return "#F8C471";
                else return "#FAD7A0";
                break;
              case "People Managers":
                if (i.ICorPM == "People manager") return "#F8C471";
                else return "#FAD7A0";
                break;
            }
          });
        agg_svg_global.on("click", click_barplot_global);
      }
    };

    var clicky_usa = function (e, i) {
      var y_agg_new = d3
        .scaleLinear()
        .domain([0, Math.max(+i.ConvertedCompYearly + 10000, 160000)])
        .range([height, 0]);

      var yAxis_new = d3.axisLeft(y_agg_new);
      agg_us_yaxis.transition().call(yAxis_new);

      line_usa
        .style("opacity", 1)
        .attr("x1", 0)
        .attr("y1", y_agg_new(+i.ConvertedCompYearly))
        .attr("x2", width)
        .attr("y2", y_agg_new(+i.ConvertedCompYearly));

      agg_svg_us
        .selectAll("rect")
        .data(agg_data_usa)
        .transition() // .transition()
        .attr("x", function (d) {
          return x_agg(d.attribute);
        })
        .attr("y", function (d) {
          return y_agg_new(d.median);
        })
        .attr("width", x_agg.bandwidth())
        .attr("height", function (d) {
          return height - y_agg_new(d.median);
        })
        .attr("stroke", "black")
        .attr("stroke-width", function (d) {
          switch (d.attribute) {
            case "Remote":
              if (i.RemoteWork == "Fully remote") return 1;
              else return 0;
              break;
            case "Hybrid":
              if (i.RemoteWork == "Hybrid (some remote, some in-person)")
                return 1;
              else return 0;
              break;
            case "In-Person":
              if (i.RemoteWork == "Full in-person") return 1;
              else return 0;
              break;
            case "Men":
              if (i.Gender == "Man") return 1;
              else return 0;
              break;
            case " Women":
              if (i.Gender == "Woman") return 1;
              else return 0;
              break;
            case "Other":
              if (i.Gender !== "Woman" && i.Gender !== "Man") return 1;
              else return 0;
              break;
            case "Independent Contributors":
              if (i.ICorPM == "Independent contributor") return 1;
              else return 0;
              break;
            case "People Managers":
              if (i.ICorPM == "People manager") return 1;
              else return 0;
              break;
          }
        })
        .attr("fill", function (d) {
          switch (d.attribute) {
            case "Remote":
              if (i.RemoteWork == "Fully remote") return "#D2B4DE";
              else return "#E8DAEF";
              break;
            case "Hybrid":
              if (i.RemoteWork == "Hybrid (some remote, some in-person)")
                return "#D2B4DE";
              else return "#E8DAEF";
              break;
            case "In-Person":
              if (i.RemoteWork == "Full in-person") return "#D2B4DE";
              else return "#E8DAEF";
              break;
            case "Men":
              if (i.Gender == "Man") return "#82E0AA";
              else return "#D5F5E3";
              break;
            case " Women":
              if (i.Gender == "Woman") return "#82E0AA";
              else return "#D5F5E3";
              break;
            case "Other":
              if (i.Gender !== "Woman" && i.Gender !== "Man") return "#82E0AA";
              else return "#D5F5E3";
              break;
            case "Independent Contributors":
              if (i.ICorPM == "Independent contributor") return "#F8C471";
              else return "#FAD7A0";
              break;
            case "People Managers":
              if (i.ICorPM == "People manager") return "#F8C471";
              else return "#FAD7A0";
              break;
          }
        });
      agg_svg_us.on("click", click_barplot_us);
    };

    var tooltip = d3
      .select("#heatmap_global")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("position", "absolute")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");

    var mouseover = function (e, d) {
      tooltip.style("opacity", 1);
      d3.select(this).style("cursor", "pointer");
    };

    var mousemove = function (e, d) {
      tooltip
        .html(
          "<div>Years of Experience: " +
            Math.max(+d.WorkExp, +d.YearsCodePro) +
            "</div>" +
            "<div>Compensation: " +
            d.ConvertedCompYearly +
            "</div>" +
            "<div>Position: " +
            d.ICorPM +
            "</div>" +
            "<div>Age: " +
            d.Age +
            "</div>" +
            "<div>Gender: " +
            d.Gender +
            "</div>" +
            "<div>Work Type: " +
            d.RemoteWork
        )
        .style("left", d3.pointer(e)[0] + 10 + "px")
        .style("top", d3.pointer(e)[1] + 95 + "px");
    };

    var mouseleave = function (e, d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", reset_position);
      d3.select(this).style("cursor", "default");
    };

    var reset_position = function (e, d) {
      tooltip.style("left", 0 + "px").style("top", 0 + "px");
    };
    var reset_position_us = function (e, d) {
      tooltip_us.style("left", 0 + "px").style("top", 0 + "px");
    };
    var tooltip_us = d3
      .select("#heatmap_us")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip_us")
      .style("background-color", "white")
      .style("position", "absolute")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");

    var mouseover_us = function (e, d) {
      tooltip_us.style("opacity", 1);
      d3.select(this).style("cursor", "pointer");
    };

    var mousemove_us = function (e, d) {
      tooltip_us
        .html(
          "<div>Years of Experience: " +
            Math.max(+d.WorkExp, +d.YearsCodePro) +
            "</div>" +
            "<div>Compensation: " +
            d.ConvertedCompYearly +
            "</div>" +
            "<div>Position: " +
            d.ICorPM +
            "</div>" +
            "<div>Age: " +
            d.Age +
            "</div>" +
            "<div>Gender: " +
            d.Gender +
            "</div>" +
            "<div>Work Type: " +
            d.RemoteWork
        )
        .style("left", d3.pointer(e)[0] + 10 + "px")
        .style("top", d3.pointer(e)[1] + 45 + height + 200 + "px");
    };

    var mouseleave_us = function (e, d) {
      tooltip_us
        .transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", reset_position_us);
      d3.select(this).style("cursor", "default");
    };

    d3.select("#global_button").on("click", function () {
      global = true;
      d3.select("#us_button").style("background-color", "#e7e7e7");
      d3.select("#global_button").style("background-color", "gray");
      data_to_use = data;
      // svg_global.selectAll("rect").remove();
      svg_global.selectAll("circle").remove();
      line_global.style("opacity", 0);
      rect_global.style("opacity", 0);

      agg_global_yaxis.transition().call(d3.axisLeft(y_agg));
      agg_svg_global
        .selectAll("rect")
        .data(agg_data_global)
        .transition() // .transition()
        .attr("x", function (d) {
          return x_agg(d.attribute);
        })
        .attr("y", function (d) {
          return y_agg(d.median);
        })
        .attr("width", x_agg.bandwidth())
        .attr("height", function (d) {
          return height - y_agg(d.median);
        })
        .attr("stroke", "black")
        .attr("stroke-width", 0)
        .attr("fill", function (d) {
          return color_barplot(d.attribute);
        });

      if (overview) {
        var inputForRectBinning = [];
        data_to_use.forEach(function (d) {
          inputForRectBinning.push([
            +Math.max(+d.WorkExp, +d.YearsCodePro),
            +(Math.floor(+d.ConvertedCompYearly / ySize) * ySize),
          ]); // Note that we had the transform value of X and Y !
        });

        // Compute the rectbin
        var rectbinData = d3.rectbin().dx(xSize).dy(ySize)(inputForRectBinning);
        svg_global
          .append("clipPath")
          .attr("id", "clip")
          .append("rect")
          .attr("height", height);
        svg_global
          .append("g")
          // .attr("clip-path", "url(#clip)")
          .selectAll("myRect")
          .data(rectbinData)
          .enter()
          .append("rect")
          .raise()
          .attr("x", function (d) {
            return x(d.x);
          })
          .attr("y", function (d) {
            return y(d.y) - heightInPx;
          })
          .attr("width", widthInPx)
          .attr("height", heightInPx)
          .attr("fill", function (d) {
            return color(d.length);
          })
          .on("click", click_heatmap_global);
      } else {
        svg_global
          .append("g")
          .selectAll("circle")
          .data(data_to_use)
          .enter()
          .append("circle")
          .attr("cx", (d) => x(xAccessor(d)))
          .attr("cy", (d) => y(yAccessor(d)))
          .attr("fill", (d) => color_scatterplot(d.Gender))
          .attr("r", 3)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)
          .on("click", clicky_global);
      }
      agg_svg_global
        .selectAll("rect")
        .data(agg_data_global)
        .transition() // .transition()
        .attr("x", function (d) {
          return x_agg(d.attribute);
        })
        .attr("y", function (d) {
          return y_agg(d.median);
        })
        .attr("width", x_agg.bandwidth())
        .attr("height", function (d) {
          return height - y_agg(d.median);
        })
        .attr("stroke", "black")
        .attr("stroke-width", 0)
        .attr("fill", function (d) {
          return color_barplot(d.attribute);
        });
    });
    d3.select("#us_button").on("click", function () {
      global = false;
      d3.select("#global_button").style("background-color", "#e7e7e7");
      d3.select("#us_button").style("background-color", "gray");
      data_to_use = [];
      data.forEach((d) => {
        if (d.Country !== "United States of America") data_to_use.push(d);
      });

      rect_global.style("opacity", 0);
      agg_global_yaxis.transition().call(d3.axisLeft(y_agg));
      agg_svg_global
        .selectAll("rect")
        .data(agg_data_nonusa)
        .transition() // .transition()
        .attr("x", function (d) {
          return x_agg(d.attribute);
        })
        .attr("y", function (d) {
          return y_agg(d.median);
        })
        .attr("width", x_agg.bandwidth())
        .attr("height", function (d) {
          return height - y_agg(d.median);
        })
        .attr("stroke", "black")
        .attr("stroke-width", 0)
        .attr("fill", function (d) {
          return color_barplot(d.attribute);
        });

      // svg_global.selectAll("rect").remove();
      svg_global.selectAll("circle").remove();
      if (overview) {
        var inputForRectBinning = [];
        data_to_use.forEach(function (d) {
          inputForRectBinning.push([
            +Math.max(+d.WorkExp, +d.YearsCodePro),
            +(Math.floor(+d.ConvertedCompYearly / ySize) * ySize),
          ]); // Note that we had the transform value of X and Y !
        });

        // Compute the rectbin
        var rectbinData = d3.rectbin().dx(xSize).dy(ySize)(inputForRectBinning);
        svg_global
          .append("clipPath")
          .attr("id", "clip")
          .append("rect")
          .attr("height", height);
        svg_global
          .append("g")
          // .attr("clip-path", "url(#clip)")
          .selectAll("myRect")
          .data(rectbinData)
          .enter()
          .append("rect")
          .raise()
          .attr("x", function (d) {
            return x(d.x);
          })
          .attr("y", function (d) {
            return y(d.y) - heightInPx;
          })
          .attr("width", widthInPx)
          .attr("height", heightInPx)
          .attr("fill", function (d) {
            return color(d.length);
          })
          .on("click", click_heatmap_global);
      } else {
        svg_global
          .append("g")
          .selectAll("circle")
          .data(data_to_use)
          .enter()
          .append("circle")
          .attr("cx", (d) => x(xAccessor(d)))
          .attr("cy", (d) => y(yAccessor(d)))
          .attr("fill", (d) => color_scatterplot(d.Gender))
          .attr("r", 3)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)
          .on("click", clicky_global);
      }
      agg_svg_global
        .selectAll("rect")
        .data(agg_data_nonusa)
        .transition() // .transition()
        .attr("x", function (d) {
          return x_agg(d.attribute);
        })
        .attr("y", function (d) {
          return y_agg(d.median);
        })
        .attr("width", x_agg.bandwidth())
        .attr("height", function (d) {
          return height - y_agg(d.median);
        })
        .attr("stroke", "black")
        .attr("stroke-width", 0)
        .attr("fill", function (d) {
          return color_barplot(d.attribute);
        });
    });

    d3.select("#overview_button").on("click", function () {
      overview = true;
      d3.select("#detailed_button").style("background-color", "#e7e7e7");
      d3.select("#overview_button").style("background-color", "gray");
      line_global.style("opacity", 0);
      line_usa.style("opacity", 0);
      if (!global) {
        data_to_use = [];
        data.forEach((d) => {
          if (d.Country !== "United States of America") data_to_use.push(d);
        });
      } else {
        data_to_use = data;
      }

      svg_global.selectAll("circle").remove();
      svg_us.selectAll("circle").remove();
      var inputForRectBinning = [];
      var inputForRectBinning_us = [];
      data_to_use.forEach(function (d) {
        inputForRectBinning.push([
          +Math.max(+d.WorkExp, +d.YearsCodePro),
          +(Math.floor(+d.ConvertedCompYearly / ySize) * ySize),
        ]); // Note that we had the transform value of X and Y !
      });
      data_us.forEach(function (d) {
        inputForRectBinning_us.push([
          +Math.max(+d.WorkExp, +d.YearsCodePro),
          +(Math.floor(+d.ConvertedCompYearly / ySize) * ySize),
        ]); // Note that we had the transform value of X and Y !
      });

      // Compute the rectbin
      var rectbinData = d3.rectbin().dx(xSize).dy(ySize)(inputForRectBinning);
      var rectbinData_us = d3.rectbin().dx(xSize).dy(ySize)(
        inputForRectBinning_us
      );
      svg_global
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("height", height);
      svg_us
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("height", height);
      svg_global
        .append("g")
        // .attr("clip-path", "url(#clip)")
        .selectAll("myRect")
        .data(rectbinData)
        .enter()
        .append("rect")
        .raise()
        .attr("x", function (d) {
          return x(d.x);
        })
        .attr("y", function (d) {
          return y(d.y) - heightInPx;
        })
        .attr("width", widthInPx)
        .attr("height", heightInPx)
        .attr("fill", function (d) {
          return color(d.length);
        })
        .on("click", click_heatmap_global);
      svg_us
        .append("g")
        // .attr("clip-path", "url(#clip)")
        .selectAll("myRect")
        .data(rectbinData_us)
        .enter()
        .append("rect")
        .raise()
        .attr("x", function (d) {
          return x(d.x);
        })
        .attr("y", function (d) {
          return y(d.y) - heightInPx;
        })
        .attr("width", widthInPx)
        .attr("height", heightInPx)
        .attr("fill", function (d) {
          return color(d.length);
        })
        .on("click", click_heatmap_usa);
    });
    d3.select("#detailed_button").on("click", function () {
      overview = false;
      d3.select("#overview_button").style("background-color", "#e7e7e7");
      d3.select("#detailed_button").style("background-color", "gray");
      svg_global.selectAll("rect").remove();
      svg_us.selectAll("rect").remove();
      rect_global.style("opacity", 0);
      rect_usa.style("opacity", 0);
      if (!global) {
        data_to_use = [];
        data.forEach((d) => {
          if (d.Country !== "United States of America") data_to_use.push(d);
        });
      } else {
        data_to_use = data;
      }

      var agg_data_to_use = [];
      if (global) {
        agg_data_to_use = agg_data_global;
      } else {
        agg_data_to_use = agg_data_nonusa;
      }

      agg_global_yaxis.transition().call(d3.axisLeft(y_agg));
      agg_us_yaxis.transition().call(d3.axisLeft(y_agg));
      agg_svg_global
        .selectAll("rect")
        .data(agg_data_to_use)
        .transition() // .transition()
        .attr("x", function (d) {
          return x_agg(d.attribute);
        })
        .attr("y", function (d) {
          return y_agg(d.median);
        })
        .attr("width", x_agg.bandwidth())
        .attr("height", function (d) {
          return height - y_agg(d.median);
        })
        .attr("stroke", "black")
        .attr("stroke-width", 0)
        .attr("fill", function (d) {
          return color_barplot(d.attribute);
        });
      agg_svg_global.on("click", click_barplot_global);
      agg_svg_us
        .selectAll("rect")
        .data(agg_data_usa)
        .transition() // .transition()
        .attr("x", function (d) {
          return x_agg(d.attribute);
        })
        .attr("y", function (d) {
          return y_agg(d.median);
        })
        .attr("width", x_agg.bandwidth())
        .attr("height", function (d) {
          return height - y_agg(d.median);
        })
        .attr("stroke", "black")
        .attr("stroke-width", 0)
        .attr("fill", function (d) {
          return color_barplot(d.attribute);
        });
      agg_svg_us.on("click", click_barplot_us);

      svg_global
        .append("g")
        .selectAll("circle")
        .data(data_to_use)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(xAccessor(d)))
        .attr("cy", (d) => y(yAccessor(d)))
        .attr("fill", (d) => color_scatterplot(d.Gender))
        .attr("r", 3)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", clicky_global);
      svg_us
        .append("g")
        .selectAll("circle")
        .data(data_us)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(xAccessor(d)))
        .attr("cy", (d) => y(yAccessor(d)))
        .attr("fill", (d) => color_scatterplot(d.Gender))
        .attr("r", 3)
        .on("mouseover", mouseover_us)
        .on("mousemove", mousemove_us)
        .on("mouseleave", mouseleave_us)
        .on("click", clicky_usa);
    });

    // Now we can add the squares
    svg_global
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);
    svg_us
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);
    svg_global
      .append("g")
      .attr("clip-path", "url(#clip)")
      .selectAll("myRect")
      .data(rectbinData)
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return x(d.x);
      })
      .attr("y", function (d) {
        return y(d.y) - heightInPx;
      })
      .attr("width", widthInPx)
      .attr("height", heightInPx)
      .attr("fill", function (d) {
        return color(d.length);
      })
      .on("click", click_heatmap_global);
    svg_us
      .append("g")
      .attr("clip-path", "url(#clip)")
      .selectAll("myRect")
      .data(rectbinData_us)
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return x(d.x);
      })
      .attr("y", function (d) {
        return y(d.y) - heightInPx;
      })
      .attr("width", widthInPx)
      .attr("height", heightInPx)
      .attr("fill", function (d) {
        return color(d.length);
      })
      .on("click", click_heatmap_usa);
    // .attr("stroke", "black")
    // .attr("stroke-width", "0.4")

    var x_agg = d3
      .scaleBand()
      .range([0, width])
      .domain(
        agg_data_global.map(function (d) {
          return d.attribute;
        })
      )
      .padding(0.2);
    var y_agg = d3.scaleLinear().domain([0, 160000]).range([height, 0]);
    agg_svg_us
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x_agg))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");
    agg_svg_global
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x_agg))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");
    agg_us_yaxis = agg_svg_us.append("g").call(d3.axisLeft(y_agg));
    agg_global_yaxis = agg_svg_global.append("g").call(d3.axisLeft(y_agg));
    agg_svg_global
      .selectAll("mybar")
      .data(agg_data_global)
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return x_agg(d.attribute);
      })
      .attr("y", function (d) {
        return y_agg(d.median);
      })
      .attr("width", x_agg.bandwidth())
      .attr("height", function (d) {
        return height - y_agg(d.median);
      })
      .attr("fill", function (d) {
        return color_barplot(d.attribute);
      });
    agg_svg_us
      .selectAll("mybar")
      .data(agg_data_usa)
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return x_agg(d.attribute);
      })
      .attr("y", function (d) {
        return y_agg(d.median);
      })
      .attr("width", x_agg.bandwidth())
      .attr("height", function (d) {
        return height - y_agg(d.median);
      })
      .attr("fill", function (d) {
        return color_barplot(d.attribute);
      });
    var line_usa = agg_svg_us
      .append("line")
      .style("stroke", "red")
      .attr("stroke-width", "2")
      .style("opacity", 0);
    var rect_global = agg_svg_global.append("rect").style("opacity", 0);
    var rect_usa = agg_svg_us.append("rect").style("opacity", 0);
    var line_global = agg_svg_global
      .append("line")
      .style("stroke", "red")
      .attr("stroke-width", "2")
      .style("opacity", 0);

    svg_global
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", -70)
      .attr("x", -height / 3)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .style("font-weight", "bold")
      .text("Compensation");
    svg_us
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", -70)
      .attr("x", -height / 3)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .style("font-weight", "bold")
      .text("Compensation");
    agg_svg_us
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", -70)
      .attr("x", -height / 3 + 30)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .style("font-weight", "bold")
      .text("Median Compensation");
    agg_svg_global
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", -70)
      .attr("x", -height / 3 + 30)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .style("font-weight", "bold")
      .text("Median Compensation");
    svg_global
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width / 1.5)
      .attr("y", height + 35)
      .style("padding", 0)
      .style("margin", 0)
      .style("font-weight", "bold")
      .text("Work Experience");
    agg_svg_global
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width / 1.5 - 45)
      .attr("y", height + 65)
      .style("padding", 0)
      .style("margin", 0)
      .style("font-weight", "bold")
      .text("Respondent Attributes");
    agg_svg_us
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width / 1.5 - 45)
      .attr("y", height + 65)
      .style("padding", 0)
      .style("margin", 0)
      .style("font-weight", "bold")
      .text("Respondent Attributes");
    svg_us
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width / 1.5)
      .attr("y", height + 35)
      .style("padding", 0)
      .style("margin", 0)
      .style("font-weight", "bold")
      .text("Work Experience");
  });
});
