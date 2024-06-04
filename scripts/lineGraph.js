(function() {
    const svg = d3.select("#chart-container svg"),
        margin = { top: 60, right: 100, bottom: 50, left: 80 },  // Increase top margin to make space for the title
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 10]);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const line = d3.line()
        .defined(d => !isNaN(d.percentage)) 
        .x(d => x(d.year))
        .y(d => y(d.percentage));

    function loadData(csvFile) {
        d3.csv(csvFile).then(data => {
            const parsedData = data.map(d => ({
                year: +d.year,
                AfricanAmerican: +d["AfricanAmerican"],
                Asian: +d.Asian,
                AmericanIndian: +d["AmericanIndian"],
                HispanicLatino: +d["Hispanic/Latino(a)"],
                White: +d.White,
                Unknown: +d.Unknown,
                International: +d.International
            }));

            const races = ["AfricanAmerican", "Asian", "AmericanIndian", "HispanicLatino", "White", "Unknown", "International"];
            const raceLabels = {
                AfricanAmerican: "African American",
                Asian: "Asian",
                AmericanIndian: "American Indian",
                HispanicLatino: "Hispanic/Latino(a)",
                White: "White",
                Unknown: "Unknown",
                International: "International"
            };
            color.domain(races);

            const raceData = races.map(race => ({
                race: race,
                values: parsedData.map(d => ({ year: d.year, percentage: d[race] }))
            }));

            x.domain(d3.extent(parsedData, d => d.year));
            const maxPercentage = d3.max(raceData, r => d3.max(r.values, d => d.percentage));
            y.domain([-2, Math.ceil(maxPercentage / 5) * 5 + 5]);

            g.selectAll("*").remove();

            // Add title
            g.append("text")
                .attr("x", width / 2)
                .attr("y", -35)
                .attr("text-anchor", "middle")
                .style("font", "15px Verdana, sans-serif")
                .style('font-weight', 'bold')
                .text("Decreased Rates of Marginalized Groups at Competitive UCs Following Policy Changes");

            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.format("d")))
                .append("text")
                .attr("fill", "#000")
                .attr("x", width / 2)
                .attr("y", 35)
                .attr("dy", "0.71em")
                .attr("text-anchor", "middle")
                .style("font", "18px Verdana, sans-serif")
                .text("Year");

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 4)
                .attr("y", -50)
                .attr("dy", "0.71em")
                .attr("text-anchor", "bottom")
                .style("font", "18px Verdana, sans-serif")
                .text("Share of Students by Percent");

            const race = g.selectAll(".race")
                .data(raceData)
                .enter().append("g")
                .attr("class", "race");

            const updateChart = (year) => {
                d3.select("#yearLabel").text(year);

                const filteredData = raceData.map(race => ({
                    race: race.race,
                    values: race.values.filter(d => d.year <= year && !isNaN(d.percentage))
                }));

                race.each(function(d) {
                    const raceG = d3.select(this);

                    raceG.selectAll("path").remove();
                    raceG.selectAll("text").remove();

                    const validData = filteredData.find(c => c.race === d.race).values;

                    if (validData.length > 0) {
                        raceG.append("path")
                            .attr("class", "line")
                            .attr("d", line(validData))
                            .attr("fill", "none")
                            .style("stroke", color(d.race))
                            .style("stroke-width", 2)
                            .on("mouseover", (event, d) => {
                                d3.select("#tooltip2")
                                    .style("opacity", 0);
                            })
                            .on("mousemove", (event, d) => {
                                const mouse = d3.pointer(event);
                                const year = Math.round(x.invert(mouse[0]));
                                const percentage = d.values.find(v => v.year === year)?.percentage;
                                if (percentage !== undefined) {
                                    d3.select("#tooltip2")
                                        .html(`Race: ${raceLabels[d.race]}<br>Year: ${year}<br>Percentage: ${percentage}%`)
                                        .style("left", (d3.pointer(event, this)[0] + 350) + "px")
                                        .style("top", (d3.pointer(event, this)[1]) + "px");
                                }
                            })
                            .on("mouseout", () => {
                                d3.select("#tooltip2")
                                    .style("opacity", 0);
                            });

                        if (year !== 1994) {
                            const lastDataPoint = validData[validData.length - 1];
                            if (lastDataPoint && lastDataPoint.year && lastDataPoint.percentage !== undefined) {
                                const yOffset = lastDataPoint.percentage === 0 ? 1 : 0; 
                                raceG.append("text")
                                    .attr("transform", `translate(${x(lastDataPoint.year)},${y(lastDataPoint.percentage) - yOffset})`)
                                    .attr("x", 3)
                                    .attr("dy", "0.35em")
                                    .style("font", "10px Verdana, sans-serif")
                                    .text(raceLabels[d.race]);
                            }
                        }
                    }
                });

                g.selectAll(".annotation-line").remove();
                g.selectAll(".annotation-text").remove();

                if (year >= 1996) {
                    g.append("line")
                        .attr("class", "annotation-line")
                        .attr("x1", x(1996))
                        .attr("y1", 0)
                        .attr("x2", x(1996))
                        .attr("y2", height)
                        .attr("stroke", "red")
                        .attr("stroke-width", 3)
                        .attr("stroke-dasharray", "4,4");

                    g.append("text")
                        .attr("class", "annotation-text")
                        .attr("x", x(1996) + 5)
                        .attr("y", -10)
                        .style("font", "11px Verdana, sans-serif")
                        .style("fill", "red")
                        .text("CA LAW BANS AFFIRMATIVE ACTION");
                }

                if (year >= 2020) {
                    g.append("line")
                        .attr("class", "annotation-line")
                        .attr("x1", x(2020))
                        .attr("y1", 0)
                        .attr("x2", x(2020))
                        .attr("y2", height)
                        .attr("stroke", "red")
                        .attr("stroke-width", 3)
                        .attr("stroke-dasharray", "4,4");

                    g.append("text")
                        .attr("class", "annotation-text")
                        .attr("x", x(2020) + 5)
                        .attr("y", -10)
                        .style("font", "11px Verdana, sans-serif")
                        .style("fill", "red")
                        .text("UC MOVES TO TEST-BLIND");
                }
            };

            const currentYear = +d3.select("#yearSlider").property("value");
            updateChart(currentYear);

            d3.select("#yearSlider").on("input", function() {
                const year = +this.value;
                updateChart(year);
            });
        });
    }

    loadData('data/ucDemoData.csv');

    d3.select("#universitySelect").on("change", function() {
        const selectedFile = d3.select(this).property("value");
        loadData('data/' + selectedFile);
    });
})();
