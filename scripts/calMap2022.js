(function() { 
    const width = 1600;
    const height = 800;

    const svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator()
        .center([-119.5, 37])
        .scale(3100)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load the California GeoJSON data
    d3.json("https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/california-counties.geojson").then(california => {
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(california.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", "#ccc")
            .attr("stroke", "white");
        
        addLogos();
    });

    // Locations of the UC campuses
    const ucLocations = [
        { name: "UC Berkeley", coordinates: [-122.2585, 37.8719], logo: "images/berkeley.png", width: 50, height: 50 },
        { name: "UC Davis", coordinates: [-121.7405, 39.0], logo: "images/davis.png", width: 100, height: 100 },
        { name: "UCI", coordinates: [-117.8443, 33.3405], logo: "images/irvine.png", width: 70, height: 70 },
        { name: "UCLA", coordinates: [-118.4452, 34.0689], logo: "images/ucla.png", width: 60, height: 60 },
        { name: "UCR", coordinates: [-117.0261, 33.9737], logo: "images/riverside.png", width: 50, height: 50 },
        { name: "UCSD", coordinates: [-117.1611, 32.7157], logo: "images/ucsd.png", width: 80, height: 80 },
        { name: "UCSB", coordinates: [-119.8458, 35.0139], logo: "images/ucsb.png", width: 90, height: 90 },
        { name: "UCSC", coordinates: [-122.6308, 36.9741], logo: "images/ucsc.png", width: 80, height: 80 },
        { name: "UC Merced", coordinates: [-120.4241, 37.3022], logo: "images/merced.png", width: 80, height: 80 }
    ];

    // Load the admissions data
    function addLogos() {
        d3.csv("data/ucCollege.csv").then(data => {

            // Add UC logos to the map
            svg.selectAll(".logo")
                .data(ucLocations)
                .enter().append("image")
                .attr("xlink:href", d => d.logo)
                .attr("class", "logo")
                .attr("x", d => {
                    const [x, y] = projection(d.coordinates);
                    return x - 20;  // Center the image
                })
                .attr("y", d => {
                    const [x, y] = projection(d.coordinates);
                    return y - 20;  // Center the image
                })
                .attr("width", d => d.width)
                .attr("height", d => d.height)
                .on("click", function(event, d) {
                    const campusData = data.find(row => row.college === d.name);
                    console.log(d.name)
                    if (campusData) {
                        showTooltip(event, d.name, campusData);
                    }
                    event.stopPropagation(); 
                });

            svg.append("text")
                .attr("class", "click-me")
                .attr("x", d => {
                    const [x, y] = projection([-121.1308, 36.9741]);
                    return x - 100;  // Adjust the position
                })
                .attr("y", d => {
                    const [x, y] = projection([-122.6308, 36.7141]);
                    return y + 30;  // Adjust the position
                })
                .text("[click me ↑]")
                .style("font-size", "12px")
                .style("fill", "black");
        });
    }

    // Tooltip for displaying admissions race breakdown
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function showTooltip(event, ucName, data) {
        africanAmericanPct = data['AfricanAmerican'];
        americanIndianPct = data['AmericanIndian'];
        asianPct = data['Asian'];
        hispanicPct = data['Hispanic/Latino(a)']
        pacificPct = data['PacificIslander']
        unknownPct = data['Unknown']
        internationalPct = data['International']

        if (africanAmericanPct == undefined) {
            africanAmericanPct = 0
        }
        if (americanIndianPct == undefined) {
            americanIndianPct = 0
        }
        if (asianPct == undefined) {
            asianPct = 0
        }
        if (hispanicPct == undefined) {
            hispanicPct = 0
        }
        if (pacificPct == undefined) {
            pacificPct = 0
        }
        if (unknownPct == undefined) {
            unknownPct = 0
        }
        if (internationalPct == undefined) {
            internationalPct = 0
        }

        const breakdown = `
            <strong>${ucName}</strong><br>
            African American: ${africanAmericanPct}%<br>
            American Indian: ${americanIndianPct}%<br>
            Asian: ${asianPct}%<br>
            Hispanic/Latino(a): ${hispanicPct}%<br>
            Pacific Islander: ${pacificPct}%<br>
            White: ${data['White']}%<br>
            Unknown: ${unknownPct}%<br>
            International: ${internationalPct}%
        `;


        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(breakdown)
            .style("left", (d3.pointer(event, this)[0]) + "px")
            .style("top", (d3.pointer(event, this)[1]) + "px");
    }

    d3.select("body").on("click", function() {
        tooltip.transition().duration(200).style("opacity", 0);
    });
})();