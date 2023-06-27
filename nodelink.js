const q3_width = 900;
const q3_height = 500;
const q3_padding = 50;
const region_list = ['West', 'South', 'Midwest', 'Northeast'];


q3_x_offset = 30;
q3_y_offset = -20;

d3.json('node_link.json').then(function(data) {
    console.log('d')

    team_ids = data['nodes'].map(d => d.id)
    path_ids = data['links'].map(d => d.id)

    const width_scale = d3.scaleLinear()
                            .domain(d3.extent(data['links'].map(d => d.frequency)))
                            .range([7, 30])

    const radius_scale = d3.scaleLinear()
                            .domain(d3.extent(data['nodes'].map(d => Math.pow(d.win_count, 2))))
                            .range([40, 130])

    const region_colors = ["#008779", "#f1b3a9", "#0fc5e3", "#ffb919"];
    const region_color_scale = d3.scaleOrdinal().domain(['South', 'Northeast', 'Midwest', 'West']).range(region_colors);


    const paths = data['info'].reduce((acc, obj) => {
        acc[obj.id] = { source: obj.source, target: obj.target };
        return acc;
    }, {});

    q3_svg = d3.select('#nodelink-container')
                .append('svg')
                .attr('width', q3_width)
                .attr('height', q3_height);


    let link_e = q3_svg.selectAll(".link")
                        .data(data['links'])
                        .enter()
                        .append("line")
                        .attr('stroke-width', d => width_scale(d.frequency))
                        .attr("class", "link")
                        .attr('stroke', 'grey')
                        .attr('opacity', 0.6)
                        .attr('id', d => d.id)

    //create g to hold circles
    const gs = q3_svg.selectAll("g")
                    .data(data['nodes'])
                    .enter()
                    .append("g")
                    .attr('class', d => d.region)
                    .attr('id', d => `team${d.id}`)

    // creating circles within gs
    gs.data(data['nodes'])
        .append('circle')
        .attr("class", "node")
        .attr("r", d => radius_scale(Math.pow(d.win_count, 2)))
        .attr('fill', d => region_color_scale(d.region))
        .attr('opacity', 1)
        .attr('class', d => d.region);

    const node_e = q3_svg.selectAll('g')

    const s_node_e = q3_svg.selectAll('g.South')
    const ne_node_e = q3_svg.selectAll('g.Northeast')
    const mw_node_e = q3_svg.selectAll('g.Midwest')
    const w_node_e = q3_svg.selectAll('g.West')

    //create label using "text" elements
    let label = node_e.append('text')
                        .text(d => d.id)
                        .style('font-size', '50px')
                        .attr('text-anchor', 'middle')
                        .attr('dy', '15px')

    const simulation = d3
        .forceSimulation(data['nodes'])
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("collide", d3.forceCollide().radius((d) => d.win_count + 70))
        .force("link", d3.forceLink(data['links']).id(d => d.id).distance(-100))
        .force("center", d3.forceCenter(q3_width / 2, q3_height / 2));

    simulation.on("tick", () => {
        // Update node  positions.
        node_e.selectAll('circle').attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        node_e.selectAll('text').attr("transform", (d) => `translate(${d.x}, ${d.y})`);

        link_e.attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);
    });

    let zoom = d3.zoom()
                .scaleExtent([.1, 0.5])
                .on('zoom', function(event) {
                    node_e.attr('transform', event.transform);
                    link_e.attr('transform', event.transform);
                    console.log(event.transform)
            });

    q3_svg.call(zoom);

    // creating title
    q3_svg.append('rect')
        .attr('x', q3_width / 2 - 171)
        .attr('y', 18)
        .attr('width', 342)
        .attr('height', 30)
        .style('fill', 'beige');
     
     q3_svg.append('text')
        .attr('x', q3_width / 2)
        .attr('y', 40)
        .text("Alliance Relationship Between Teams")
        .attr('text-anchor', 'middle')
        .attr('id', 'title')
        .attr('font-size', '20')
        .style('outline', 'solid')
        .style('outline-offset', '3px')
        .style('outline-width', '2px');;


    const west = d3.select('#west-q3');
    const midwest = d3.select('#midwest-q3');
    const northeast = d3.select('#northeast-q3');
    const south = d3.select('#south-q3');
    const reset = d3.select('#reset-q3');
    const search = d3.select('#search_q3')

    d3.select('.text-input').style('background-color', 'rgba(51, 51, 51, 0.1)')

    let show_region = function(region) {


        gs.transition()
            .attr('opacity', 1)
        
        region_list.forEach(function(r) {
            q3_svg.selectAll(`g.${r}`) // Select the <rect> elements with the specific region class
                    .transition()
                    .attr('opacity', r !== region ? 0 : 1);
            }
        );
        
        link_e.attr('stroke', 'grey')
                .attr('opacity', 0);


        link_e['_groups'][0].forEach(function(link, i) {
            if ((paths[link.id]['source'] == region) && (paths[link.id]['target'] == region)) {
                q3_svg.select(`#${link.id}`)
                        .transition()
                        .attr('stroke', 'red')
                        .attr('opacity', 1);
            } else if ((paths[link.id]['source'] == region)) {
                q3_svg.select(`#${link.id}`)
                        .transition()
                        .attr('stroke', 'blue')
                        .attr('opacity', 0.2);
            } else if (paths[link.id]['target'] == region) {
                q3_svg.select(`#${link.id}`)
                        .transition()
                        .attr('stroke', 'blue')
                        .attr('opacity', 0.2);
            }
        })

        q3_svg.select('rect.link-type-legend-elements')
                .transition()
                .attr('opacity', 1);

        q3_svg.select('g.link-type-legend-elements')
                .transition()
                .attr('opacity', 1);

    }

    let what_region = function() {
        if (this.textContent == 'West') {
            show_region('West');
        } else if (this.textContent == 'Midwest') {
            show_region('Midwest');
        } else if (this.textContent == 'Northeast') {
            show_region('Northeast');
        } else {
            show_region('South');
        }
    }

    let do_reset = function() {
        q3_svg.selectAll('line.link')
                .attr('stroke', 'grey')
                .attr('opacity', 0.6);
        node_e.transition()
                .attr('opacity', 1)

        q3_svg.select('rect.link-type-legend-elements')
                .transition()
                .attr('opacity', 0);

        q3_svg.select('g.link-type-legend-elements')
                .transition()
                .attr('opacity', 0);
    }

    let do_search = function() {
        let id = d3.select('.text-input').property('value')
        // only enter if there is an input (at least one character)
        if (id.length > 0) {
            id = +id;
            // non-numeric string cannot be cast to ints
            if (isNaN(id)) {
                document.getElementById('search_q3').innerHTML = 'Invalid Query, Search Again'
                d3.select('.text-input').style('background-color', 'rgba(255, 100, 100, 0.5)')
            } else {
                console.log('searching')
                // do a for loop through all team ids to determine existence
                for (let i = 0; i < team_ids.length; i++) {
                    if (team_ids[i] == id) {
                        do_reset();
                        document.getElementById('search_q3').innerHTML = 'Search!'
                        d3.select('.text-input').style('background-color', 'rgba(100, 255, 100, 0.5)');
                        highlight_nodes(id);
                        break;
                    }
                    document.getElementById('search_q3').innerHTML = 'Not in Database, Try Again'
                    d3.select('.text-input').style('background-color', 'rgba(255, 100, 100, 0.5)')
                }
            }
        }
    }

    let highlight_nodes = function(team_id) {
        inout_links = []
=        neighbor_nodes = []
        data['links'].forEach(function(link) {
            if (link['source']['id'] == team_id) {
                inout_links.push(link['id'])
                neighbor_nodes.push(link['target']['id'])
            } else if (link['target']['id'] == team_id) {
                inout_links.push(link['id'])
                neighbor_nodes.push(link['source']['id'])
            }
        })

        for (let i = 0; i < team_ids.length; i++) {
            if ((!neighbor_nodes.includes(team_ids[i])) && (team_ids[i] != team_id)) {
                d3.select(`g#team${team_ids[i]}`)
                    .transition()
                    .attr('opacity', 0);
            };
        };

        for (let i = 0; i < path_ids.length; i++) {
            if (!inout_links.includes(path_ids[i])) {
                q3_svg.select(`#${path_ids[i]}`)
                        .transition()
                        .attr('opacity', 0);
            };
        };


    }

    west.on('click', what_region)
    midwest.on('click', what_region)
    northeast.on('click', what_region)
    south.on('click', what_region)
    reset.on('click', do_reset)
    search.on('click', do_search)

    q3_legend = q3_svg.append('g')
            .attr('class', 'q3_legend_holder_default')
            .attr('transform', `translate(680, 30) scale(1.2, 1.2)`)
    
    // creating legend box 
    q3_legend.append('rect')
                .attr('width', 170)
                .attr('height', 220)
                .attr('fill', 'beige')
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .attr('opacity', 1);

    q3_legend.append('rect')
                .attr('width', 170)
                .attr('height', 280)
                .attr('fill', 'beige')
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .attr('opacity', 0)
                .attr('class', 'link-type-legend-elements');

    
    // node color legend
    node_color_legend = q3_legend.append('g').attr('class', 'node_legend_holder').attr('transform', 'translate(30, 45)');

    node_color_legend.append('text').text('Node Color').attr('font-size', 13).attr('transform', 'translate(-20, -25)')

    south_legend = node_color_legend.append('g').attr('class', 'south_legend')
    south_legend.append('circle').attr('r', 17).attr('class', 'south_node').attr('fill', region_color_scale('South'))
    south_legend.append('text').text('S').attr('alignment-baseline', 'middle').attr('dx', -4).attr('dy', 1).attr('font-size', 14).attr('fill', 'white');
    
    west_legend = node_color_legend.append('g').attr('class', 'west_legend').attr('transform', 'translate(37, 0)')
    west_legend.append('circle').attr('r', 17).attr('class', 'south_node').attr('fill', region_color_scale('West'))
    west_legend.append('text').text('W').attr('alignment-baseline', 'middle').attr('dx', -6).attr('dy', 1).attr('font-size', 14).attr('fill', 'white');

    ne_legend = node_color_legend.append('g').attr('class', 'ne_legend').attr('transform', 'translate(74, 0)')
    ne_legend.append('circle').attr('r', 17).attr('class', 'south_node').attr('fill', region_color_scale('Northeast'))
    ne_legend.append('text').text('NE').attr('alignment-baseline', 'middle').attr('dx', -9).attr('dy', 1).attr('font-size', 14).attr('fill', 'white');

    mw_legend = node_color_legend.append('g').attr('class', 'mw_legend').attr('transform', 'translate(111, 0)')
    mw_legend.append('circle').attr('r', 17).attr('class', 'south_node').attr('fill', region_color_scale('Midwest'))
    mw_legend.append('text').text('MW').attr('alignment-baseline', 'middle').attr('dx', -13).attr('dy', 1).attr('font-size', 14).attr('fill', 'white');

    // node size legend
    node_size_legend = q3_legend.append('g').attr('class', 'node_legend_holder').attr('transform', 'translate(30, 112)');
    node_size_legend.append('text').text('Node Size (# of Wins)').attr('font-size', 13).attr('transform', 'translate(-20, -30)')

    small_legend = node_size_legend.append('g').attr('class', 'small_legend')
    small_legend.append('circle').attr('class', 'small_node').attr('fill', 'black').attr('r', 5)
    small_legend.append('text').text('1').attr('alignment-baseline', 'middle').attr('dx', -4).attr('dy', 35).attr('font-size', 12).attr('fill', 'black');

    medium_legend = node_size_legend.append('g').attr('class', 'small_legend').attr('transform', 'translate(45, 0)')
    medium_legend.append('circle').attr('class', 'medium_node').attr('fill', 'black').attr('r', 10)
    medium_legend.append('text').text('25').attr('alignment-baseline', 'middle').attr('dx', -6).attr('dy', 35).attr('font-size', 12).attr('fill', 'black');

    large_legend = node_size_legend.append('g').attr('class', 'large_legend').attr('transform', 'translate(100, 0)')
    large_legend.append('circle').attr('class', 'large_node').attr('fill', 'black').attr('r', 20)
    large_legend.append('text').text('50').attr('alignment-baseline', 'middle').attr('dx', -6).attr('dy', 35).attr('font-size', 12).attr('fill', 'black');

    // link width legend
    link_width_legend = q3_legend.append('g').attr('class', 'link_width_holder').attr('transform', 'translate(30, 200)');
    link_width_legend.append('text').text('Link Width (Freq. of Alliance)').attr('font-size', 12).attr('transform', 'translate(-20, -30)');

    thin_legend = link_width_legend.append('g').attr('class', 'thin_link').attr('transform', 'translate(-6, -10)')
    thin_legend.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 25).attr('y2', 0).attr('stroke', 'black').attr('stroke-width', 3);
    thin_legend.append('text').text('1').attr('alignment-baseline', 'middle').attr('dx', 10).attr('dy', 20).attr('font-size', 12).attr('fill', 'black');

    medium_link_legend = link_width_legend.append('g').attr('class', 'medium_link').attr('transform', 'translate(40, -10)')
    medium_link_legend.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 25).attr('y2', 0).attr('stroke', 'black').attr('stroke-width', 6);
    medium_link_legend.append('text').text('2').attr('alignment-baseline', 'middle').attr('dx', 10).attr('dy', 20).attr('font-size', 12).attr('fill', 'black');

    thick_legend = link_width_legend.append('g').attr('class', 'thin_link').attr('transform', 'translate(86, -10)')
    thick_legend.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 25).attr('y2', 0).attr('stroke', 'black').attr('stroke-width', 9);
    thick_legend.append('text').text('3').attr('alignment-baseline', 'middle').attr('dx', 10).attr('dy', 20).attr('font-size', 12).attr('fill', 'black');

    link_width_legend = q3_legend.append('g').attr('class', 'link_width_holder').attr('transform', 'translate(30, 200)');
    link_width_legend.append('text').text('Link Width (Freq. of Alliance)').attr('font-size', 12).attr('transform', 'translate(-20, -30)');
   
    // link type (intra-regional vs inter-regional) legend
    link_type_legend = q3_legend.append('g').attr('class', 'link-type-legend-elements').attr('transform', 'translate(25, 265)').attr('opacity', 0)
    link_type_legend.append('text').text('Link Type').attr('font-size', 13).attr('transform', 'translate(-20, -30)')

    interregional = link_type_legend.append('g').attr('transform', 'translate(-6, -16)')
    interregional.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 15).attr('y2', 0).attr('stroke', 'blue').attr('stroke-width', 2).attr('opacity', 0.4)
    interregional.append('text').text('Inter-regional Alliance').attr('alignment-baseline', 'middle').attr('dx', 20).attr('dy', 0).attr('font-size', 12).attr('fill', 'black');


    intraregional = link_type_legend.append('g').attr('transform', 'translate(-6, 1)');
    intraregional.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 15).attr('y2', 0).attr('stroke', 'red').attr('stroke-width', 2);
    intraregional.append('text').text('Intra-regional Alliance').attr('alignment-baseline', 'middle').attr('dx', 20).attr('dy', 0).attr('font-size', 12).attr('fill', 'black');

    q3_legend.append('text').attr('x', 560).attr('y', 69).attr('font-size', 13).text("Intra-reigonal alliances").attr('alignment-baseline', 'middle')

});