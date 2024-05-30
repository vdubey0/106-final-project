(function() {
    const svg = d3.select("#chart-container svg"),
        margin = { top: 40, right: 100, bottom: 50, left: 80 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 10]); // Adjusted range for padding
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.percentage));

    d3.csv('data/ucDemoData.csv').then(data => {
        const parsedData = data.map(d => ({
            year: +d.year,
            AfricanAmerican: +d["African American"],
            Asian: +d.Asian,
            AmericanIndian: +d["American Indian"],
            HispanicLatino: +d["Hispanic/Latino(a)"],
            PacificIslander: +d["Pacific Islander"],
            White: +d.White,
            Unknown: +d.Unknown,
            International: +d.International
        }));

        const races = ["AfricanAmerican", "Asian", "AmericanIndian", "HispanicLatino", "PacificIslander", "White", "Unknown", "International"];
        const raceLabels = {
            AfricanAmerican: "African American",
            Asian: "Asian",
            AmericanIndian: "American Indian",
            HispanicLatino: "Hispanic/Latino(a)",
            PacificIslander: "Pacific Islander",
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
        y.domain([-1, 45]); // Adjusted domain for percentage

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

        d3.select("#yearSlider").on("input", function() {
            const year = +this.value;
            d3.select("#yearLabel").text(year);

            const filteredData = raceData.map(race => ({
                race: race.race,
                values: race.values.filter(d => d.year <= year)
            }));

            race.each(function(d) {
                const raceG = d3.select(this);

                raceG.selectAll("path").remove();
                raceG.selectAll("text").remove();

                raceG.append("path")
                    .attr("class", "line")
                    .attr("d", line(filteredData.find(c => c.race === d.race).values))
                    .attr("fill", "none")
                    .style("stroke", color(d.race))
                    .style("stroke-width", 1.3)
                    .on("mouseover", (event, d) => {
                        d3.select("#tooltip2")
                            .style("opacity", 1);
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
                    const lastDataPoint = filteredData.find(c => c.race === d.race).values[filteredData.find(c => c.race === d.race).values.length - 1];
                    raceG.append("text")
                        .attr("transform", `translate(${x(lastDataPoint.year)},${y(lastDataPoint.percentage)})`)
                        .attr("x", 3)
                        .attr("dy", "0.35em")
                        .style("font", "10px Verdana, sans-serif")
                        .text(raceLabels[d.race]);
                }
            });
        });
    });
})();
