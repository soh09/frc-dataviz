

// set variables, axes, scales here
// const margin = {top: 30, right: 30, bottom: 70, left: 60},
const q1_width = 900;
const q1_height = 500;
const q1_padding = 55;

let normalized = false;

const ns = {
    'Midwest': 1793,
    'South': 1643,
    'West': 1319,
    'Northeast': 1040
}

q1_x_offset = 0;
q1_y_offset = 0;

// creating the svg
var bar_svg = d3.select("#barchart-container")
            .append('svg')
            .attr('width', q1_width)
            .attr('height', q1_height);

// read in csv
d3.csv('winners.csv').then(function(data){
    data.forEach( d => {
        d['numWins'] = +d['numWins'],
        d['teamNumber'] = +d['teamNumber']
    })
    createBar(data);
})

let createBar = function(data) {
    console.log(data)

    // group by region
    grouped = d3.rollup(
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
        for (const [region, wins] of map) {
            obj[region] = wins
        }
        return obj;
    };

    grouped = map_to_obj(grouped)
    
    console.log(grouped)

    // creating the scales
    var x_scale = d3.scaleBand()
                    .domain(['South', 'Northeast', 'Midwest', 'West'])
                    .range([q1_padding, q1_width - q1_padding])
                    .padding(0.1);

    const colors = ["#008779", "#f1b3a9", "#0fc5e3", "#ffb919"];
    const color_scale = d3.scaleOrdinal().domain(['South', 'Northeast', 'Midwest', 'West']).range(colors);

    var y_scale = d3.scaleLinear()
                    .domain([0, d3.max(Object.values(grouped))])
                    .range([q1_height - q1_padding, q1_padding]);

    // rendering the scales
    bar_svg.append("g")
        .call(d3.axisBottom(x_scale))
        .attr("transform", `translate(0, ${q1_height - q1_padding})`)
        .attr('id', 'x_scale')
        .selectAll('text')
        .attr('font-size', 12)

    bar_svg.append("g")
        .call(d3.axisLeft(y_scale))
        .attr("transform", `translate(${q1_padding}, 0)`)
        .attr('id', 'y_scale')
        .selectAll('text')
        .attr('font-size', 12);

    // renders the bar graph initially
    bar_svg.selectAll('.bar')
        .data(Object.keys(grouped))
        .enter()
        .append('rect')
        .attr('width', x_scale.bandwidth())
        .attr('height', d => q1_height - q1_padding - y_scale(grouped[d])) 
        .attr("transform", (d) => `translate(${x_scale(d)}, ${y_scale(grouped[d])})`)
        .attr('fill', d => color_scale(d))
        .attr('class', 'bar');


    // creating title
    bar_svg.append('text')
        .attr('x', q1_width / 2)
        .attr('y', q1_padding / 2)
        .text("Number of \"Strong Team\" By Region (1998-2023)")
        .attr('text-anchor', 'middle')
        .attr('id', 'title')
        .attr('font-size', 20)
        .style('outline', 'solid')
        .style('outline-offset', '2px')
        .style('outline-width', '2px');

    q1_legend = bar_svg.append('g')
                        .attr('class', 'q1_legend_holder')
                        .attr('transform', 'scale(1.3, 1.3)')

    // creating legend box 
    q1_legend.append('rect')
        .attr('x', 550 + q1_x_offset)
        .attr('y', 30 + q1_y_offset)
        .attr('width', 80)
        .attr('height', 70)
        .attr('fill', 'none')
        .attr('stroke', "rgba(180,180,180, 1)")
        .attr('stroke-width', 2)

    // creating legends
    q1_legend.append('circle').attr('r', 4).attr('cx', 560 + q1_x_offset).attr('cy', 40 + q1_y_offset).attr('fill', "#008779").attr('class', 'south_l');
    q1_legend.append('circle').attr('r', 4).attr('cx', 560 + q1_x_offset).attr('cy', 57 + q1_y_offset).attr('fill', "#f1b3a9").attr('class', 'northeast_l');
    q1_legend.append('circle').attr('r', 4).attr('cx', 560 + q1_x_offset).attr('cy', 74 + q1_y_offset).attr('fill', "#0fc5e3").attr('class', 'midwest_l');
    q1_legend.append('circle').attr('r', 4).attr('cx', 560 + q1_x_offset).attr('cy', 90 + q1_y_offset).attr('fill', "#ffb919").attr('class', 'west_l');

    q1_legend.append('text').attr('x', 570 + q1_x_offset).attr('y', 43 + q1_y_offset).attr('font-size', 13).text("South");
    q1_legend.append('text').attr('x', 570 + q1_x_offset).attr('y', 60 + q1_y_offset).attr('font-size', 13).text("Northeast");
    q1_legend.append('text').attr('x', 570 + q1_x_offset).attr('y', 77 + q1_y_offset).attr('font-size', 13).text("Midwest");
    q1_legend.append('text').attr('x', 570 + q1_x_offset).attr('y', 93 + q1_y_offset).attr('font-size', 13).text("West");

    // creating axis labels
    bar_svg.append('g').attr('transform', `translate(17, ${q1_height / 2})`).attr('id', 'y_label')
    bar_svg.select('#y_label').append('text').text('Number of \"Strong Teams\"').attr('text-anchor', 'middle').attr('transform', 'rotate(-90)').attr('font-size', 15)


    // function to update the domain of the 
    const update_scale = () => {
        x_scale.domain(Object.keys(grouped));
        bar_svg.select('#x_scale').transition().call(d3.axisBottom(x_scale)).attr('font-size', 12);

        y_scale.domain([0, d3.max(Object.values(grouped))]);
        bar_svg.select('#y_scale').transition().call(d3.axisLeft(y_scale)).attr('font-size', 12);
    };


    // render bar chart
    const render = () => {
        // updates the existing rects to be the new size and steelblue
        bar_svg.selectAll('rect')
            .data(Object.keys(grouped))
            .transition()
            .attr('width', x_scale.bandwidth())
            .attr('height', d => q1_height - q1_padding - y_scale(grouped[d])) 
            .attr("transform", (d) => `translate(${x_scale(d)}, ${y_scale(grouped[d])})`)
            .attr('fill', d => color_scale(d))
            .attr('class', 'bar');
    };

    // define buttons for d3
    const sort_button = d3.select('#sort-q1');

    // add bar
    const sort = () => {
        grouped = Object.entries(grouped);
        grouped.sort((a, b) => b[1] - a[1]);
        grouped = Object.fromEntries(grouped);
        update_scale();
        render();
    };

    sort_button.on('click', sort);

    const normalize_button = d3.select('#normalize-q1');

    let on_normalize = () => {
        if (!normalized) {
            for (const key in grouped) {
                grouped[key] /= ns[key]
            }
            bar_svg.select('#y_label').select('text').transition().text('Proportion of \"Strong Teams\" Within Region').attr('font-size', 15)
            bar_svg.select('#title').transition().text('Proportion of \"Strong Teams\" By Region (1998 - 2023)').attr('font-size', 20)
            document.getElementById('normalize-q1').innerHTML = 'Reset!'
            normalized = true;
            sort();
        } else {
            for (const key in grouped) {
                grouped[key] = Math.round(grouped[key] * ns[key])
            }
            bar_svg.select('#y_label').select('text').transition().text('Number of \"Strong Teams\"')
            bar_svg.select('#title').transition().text('Number of \"Strong Teams\" By Region (1998 - 2023)')
            document.getElementById('normalize-q1').innerHTML = 'Normalize Again!'
            normalized = false;
            sort();
        }
    }

    normalize_button.on('click', on_normalize);

}
