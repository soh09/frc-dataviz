// Step 1: Define the SVG container and dimensions.
// to make it easier, we'll ignore margin convention
const q2_width = 900;
const q2_height = 500;
const padding = 55;

q2_x_offset = -20;
q2_y_offset = -20;

const regions = {
    "Alabama": "South",
    "Alaska": "West",
    "Arizona": "West",
    "Arkansas": "South",
    "California": "West",
    "Colorado": "West",
    "Connecticut": "Northeast",
    "Delaware": "Northeast",
    "Florida": "South",
    "Georgia": "South",
    "Hawaii": "West",
    "Idaho": "West",
    "Illinois": "Midwest",
    "Indiana": "Midwest",
    "Iowa": "Midwest",
    "Kansas": "Midwest",
    "Kentucky": "South",
    "Louisiana": "South",
    "Maine": "Northeast",
    "Maryland": "Northeast",
    "Massachusetts": "Northeast",
    "Michigan": "Midwest",
    "Minnesota": "Midwest",
    "Mississippi": "South",
    "Missouri": "Midwest",
    "Montana": "West",
    "Nebraska": "Midwest",
    "Nevada": "West",
    "New Hampshire": "Northeast",
    "New Jersey": "Northeast",
    "New Mexico": "West",
    "New York": "Northeast",
    "North Carolina": "South",
    "North Dakota": "Midwest",
    "Ohio": "Midwest",
    "Oklahoma": "South",
    "Oregon": "West",
    "Pennsylvania": "Northeast",
    "Rhode Island": "Northeast",
    "South Carolina": "South",
    "South Dakota": "Midwest",
    "Tennessee": "South",
    "Texas": "South",
    "Utah": "West",
    "Vermont": "Northeast",
    "Virginia": "South",
    "Washington": "West",
    "West Virginia": "South",
    "Wisconsin": "Midwest",
    "Wyoming": "West",
    'District of Columbia': 'Northeast'
  }

const q2_svg = d3
  .select("#choropleth-container")
  .append("svg")
  .attr("width", q2_width)
  .attr("height", q2_height)
  .attr('id', 'choropleth');

var tooltip = d3.select("#choropleth-container")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style('position', 'fixed')
                .style('pointer-events', 'none')
                .style('font-size', '13px')
                .style('text-align', 'center');

const projection = d3.geoAlbersUsa()
  .translate([q2_width / 2 + 10, q2_height / 2])
  .scale(1000);

let geoGenerator = d3.geoPath().projection(projection);


// stateName.style("pointer-events", "none");

// read in csv
d3.csv('data/winners.csv').then(function(data){
    data.forEach( d => {
        d['numWins'] = +d['numWins'],
        d['teamNumber'] = +d['teamNumber']
    })
    createMap(data);
})

let createMap = function(data) {
    // group by region
    q2_grouped = d3.rollup(
        data, 
        function(row) {
            return d3.count(row, row => row['numWins'])
        },
        function(row) {
            return row['stateProv'];
        }
    );

    q2_grouped_region = d3.rollup(
        data, 
        function(row) {
            return d3.count(row, row => row['numWins'])
        },
        function(row) {
            return row['region'];
        }
    );

    
    function map_to_obj(map) {
        obj = {};
        for (const [key, val] of map) {
            obj[key] = val
        }
        return obj;
    };

    q2_grouped = map_to_obj(q2_grouped)
    q2_grouped_region = map_to_obj(q2_grouped_region)
    console.log(q2_grouped)
    q2_grouped['Nebraska'] = 0;
    
    const colorScale = d3.scaleSequential()
                        .domain(d3.extent(Object.values(q2_grouped)).map(d => Math.log(d > 0 ? d:1)))
                        .interpolator(d3.interpolateBlues)

    function drawMap(geojson) {
        let states= q2_svg.selectAll("path").data(geojson.features);
      
        states.enter()
                .append("path")
                .attr("d", geoGenerator)
                .attr("stroke", "grey")
                .attr("stroke-width", 1)
                .attr('class', d => regions[d.properties.NAME])
                .attr("fill", d => colorScale(Math.log(q2_grouped[d.properties.NAME])))
                .on("mouseover", handleMouseover)
                .on("mouseout", handleMouseout)
                .on("mousemove", handleMouseMove);
      
        // stateName.raise();
      }

      // REQUEST DATA
    d3.json("data/gz_2010_us_040_00_500k.json").then(function (json) {
        console.log(json);
        drawMap(json);
    });

    function handleMouseMove(e, d) {
        tooltip.html(`# of Strong Teams In ${d.properties.NAME}: ${q2_grouped[d.properties.NAME]}<br># of Strong Teams In Region: ${q2_grouped_region[regions[d.properties.NAME]]}`)
                .style("left", `${e.clientX}px`)
                .style("top", `${e.clientY}px`)
    }
      
    function handleMouseover(e, d) {
        d3.selectAll(`path:not(.${this.classList[0]})`)
            .transition()
            .attr('opacity', 0.2)
        d3.select(this)
            .transition()
            .attr("stroke", "black")
            .attr("stroke-width", 4);

        tooltip.style('opacity', 1)

        console.log(q2_grouped[d.properties.NAME])
    }
      
    function handleMouseout(e, d) {
        d3.select(this)
            .transition()
            .attr("stroke", "grey")
            .attr("stroke-width", 1);
        
        // stateName.text("");
        d3.selectAll('path')
            .transition()
            .attr('opacity', 1)
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            
        tooltip.style('opacity', 0);
    }      

      // creating title
    q2_svg.append('text')
            .attr('x', q2_width / 2)
            .attr('y', padding / 2)
            .text("Number of \"Strong Team\" By State (1998-2023)")
            .attr('text-anchor', 'middle')
            .attr('id', 'title')
            .attr('font-size', 20)
            .style('outline', 'solid')
            .style('outline-offset', '3px')
            .style('outline-width', '2px');

    q2_legend = q2_svg.append('g')
                        .attr('class', 'q2_legend_holder')
                        .attr('transform', `translate(${q2_x_offset}, ${q2_y_offset}) scale(1.3, 1.3)`)

    // creating legend box 
    q2_legend.append('rect')
        .attr('x', 620)
        .attr('y', 258)
        .attr('width', 70)
        .attr('height', 125)
        .attr('fill', 'none')
        .attr('stroke', "rgba(180,180,180, 1)")
        .attr('stroke-width', 2)

    // creating legends
    q2_legend.append('rect').attr('x', 630).attr('y', 270).attr('width', 20).attr('height', 100).attr('fill', 'none').attr('stroke', 'grey').attr('stroke-width', 2)
    q2_legend.append('rect').attr('x', 630).attr('y', 350).attr('width', 20).attr('height', 20).attr('fill', colorScale(Math.log(1)))
    q2_legend.append('rect').attr('x', 630).attr('y', 330).attr('width', 20).attr('height', 20).attr('fill', colorScale(Math.log(81)))
    q2_legend.append('rect').attr('x', 630).attr('y', 310).attr('width', 20).attr('height', 20).attr('fill', colorScale(Math.log(161)))
    q2_legend.append('rect').attr('x', 630).attr('y', 290).attr('width', 20).attr('height', 20).attr('fill', colorScale(Math.log(241)))
    q2_legend.append('rect').attr('x', 630).attr('y', 270).attr('width', 20).attr('height', 20).attr('fill', colorScale(Math.log(320)))

    q2_legend.append('text').attr('x', 665).attr('y', 366).attr('font-size', 15).text("0");
    q2_legend.append('text').attr('x', 655).attr('y', 326).attr('font-size', 15).text("160");
    q2_legend.append('text').attr('x', 655).attr('y', 285).attr('font-size', 15).text("320");
}

