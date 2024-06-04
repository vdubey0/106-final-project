// scripts/timeline.js
(function() {
    const timelineData = [
        { year: 1961, text: "<strong>1961</strong><br> President John F. Kennedy passes Executive Order 10925, effectively introducing 'affirmative action' to US legislation.", color: 'steelblue', background: 'lightsteelblue'},
        { year: 1996, text: "<strong>1996</strong><br> UC system bans the use of affirmative action in college admissions.", color: 'steelblue', background: 'lightsteelblue'},
        { year: 2020, text: "<strong>2020</strong><br> As a result of the COVID pandemic, many US universities repeal the standardized testing requirement in their applications. The UC system decides to permanently move forward with this policy, in efforts to increase diversity.", color: 'red', background: 'lightcoral'},
        { year: 2001, text: "<strong>2001</strong><br> UC moves to a holistic review policy in their admissions decisions, moving away from solely numbers like GPA and test score with the intention being for applicants to be able to tell their own unique story.", color: 'red', background: 'lightcoral'},
        { year: 2023, text: "<strong>2023</strong><br> The US Supreme Court federally bans the use of race in college admissions, citing it as a violation of the 14th Amendment", color: 'steelblue', background: 'lightsteelblue'}
    ];

    const svg = d3.select("#timeline"),
        margin = { top: 20, right: 0, bottom: 30, left: 0 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([1959, 2025])
        .range([0, width]);

    const xAxis = d3.axisBottom(x)
        .tickFormat(d => timelineData.map(t => t.year).includes(d) ? d : "")
        .tickValues(d3.range(1960, 2025)); 

    g.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    g.selectAll(".event")
        .data(timelineData)
        .enter().append("circle")
        .attr("class", "event")
        .attr("cx", d => x(d.year))
        .attr("cy", height / 2)
        .attr("r", 5)
        .attr("fill", d => d.color);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip3")
        .style("opacity", 0)

    g.selectAll(".event")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.text)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
            tooltip.style('background', d.background);
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
})();
