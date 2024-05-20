////////////////////////////////////////BARCHART//////////////////////////////////////////////////
function createBarChart(values) {
    const labelNames = ['Testo', 'Album', 'Canzoniere'];

    const width = 400;
    const height = 300;
    const margin = {
        top: 20,
        right: 20,
        bottom: 60,
        left: 60
    };

    d3.select("#chart").selectAll("*").remove();

    const x = d3.scaleBand()
        .domain(labelNames)
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(values)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const barChartSvg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    barChartSvg.selectAll("rect")
        .data(values)
        .enter()
        .append("rect")
        .attr("x", (d, i) => x(labelNames[i]))
        .attr("y", height - margin.bottom)
        .attr("height", 0)
        .attr("width", x.bandwidth())
        .attr("fill", "red")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("fill", "#c20000"); // change the color of the bar on hover

            const xPos = parseFloat(d3.select(this).attr("x")) + x.bandwidth() / 2;
            const yPos = parseFloat(d3.select(this).attr("y")) - 10;

            barChartSvg.append("text")
                .attr("class", "tooltip")
                .attr("x", xPos)
                .attr("y", yPos)
                .attr("text-anchor", "middle")
                .text(d)
                .attr("fill", "white")
                .style("font-size", 12);
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("fill", "red"); // change the color of the bar on hover


            barChartSvg.select(".tooltip").remove();
        })
        .transition()
        .duration(400)
        .delay((d, i) => i * 100)
        .attr("y", d => y(d))
        .attr("height", d => height - margin.bottom - y(d));

    // Display values on mouseover for each label
    barChartSvg.selectAll(".bar-label")
        .data(labelNames)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", (d, i) => x(labelNames[i]) + x.bandwidth() / 2)
        .attr("y", height - margin.bottom + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text(d => d)
        .style("font-size", "14px")
        .on("mouseover", function(event, d) {
            const index = labelNames.indexOf(d);
            const value = values[index];
            const xPos = parseFloat(d3.select(this).attr("x"));
            const yPos = parseFloat(d3.select(this).attr("y")) + 15;

            barChartSvg.append("text")
                .attr("class", "tooltip")
                .attr("x", xPos)
                .attr("y", yPos)
                .attr("text-anchor", "middle")
                .text("("+value+")")
                .attr("fill", "white")
                .style("font-size", 12);
        })
        .on("mouseout", function() {
            barChartSvg.select(".tooltip").remove();
        });

    // X Axis
    barChartSvg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "0px");

    // Y Axis
    barChartSvg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}


////////////////////////////////////////LINECHART//////////////////////////////////////////////////
function createLineChart(data) {
    const width = 400;
    const height = 300;
    const margin = {
        top: 20,
        right: 20,
        bottom: 50,
        left: 40
    };

    //console.log(d3.max(data));

    d3.select("#chart2").selectAll("*").remove();

    const x = d3.scaleBand()
        .domain(albums)
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .x((d, i) => x(albums[i]))
        .y(d => y(d));

    const lineChartSvg = d3.select("#chart2")
        .append("svg")
        .attr("width", width)
        .attr("height", height + 300);

    //animazione creazione line plot 
    lineChartSvg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("stroke-dasharray", function() {
            const totalLength = this.getTotalLength();
            return totalLength + " " + totalLength;
        })
        .attr("stroke-dashoffset", function() {
            return this.getTotalLength();
        })
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    //aggiunta dei cerchi ad ogni datapoint (e il fatto che col mouseover mostra il valore)
    lineChartSvg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", (d, i) => x(albums[i]))
        .attr("cy", d => y(d))
        .attr("r", 7)
        .attr("fill", "red")
        .on("mouseover", (event, d) => {
            const xPos = parseFloat(d3.select(event.currentTarget).attr("cx"));
            const yPos = parseFloat(d3.select(event.currentTarget).attr("cy")) - 10;

            lineChartSvg.append("text")
                .attr("class", "tooltip")
                .attr("x", xPos)
                .attr("y", yPos)
                .attr("text-anchor", "middle")
                .text(d)
                .attr("fill", "white")
                .style("font-size", 12);
        })
        .on("mouseout", () => {
            lineChartSvg.select(".tooltip").remove();
        });

    // linee bianche tratteggiate
    lineChartSvg.selectAll("line")
        .data(data)
        .enter().append("line")
        .attr("x1", (d, i) => x(albums[i]))
        .attr("y1", height - margin.bottom)
        .attr("x2", (d, i) => x(albums[i]))
        .attr("y2", d => y(d))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,5");

    // ASSE X
    const xAxis = lineChartSvg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end")
        .attr("x", -10) // Adjust the position if needed
        .attr("y", -15) // Adjust the position if needed
        .style("font-size", 12)
        .style("letter-spacing", "1px");

    //ASSE Y
    lineChartSvg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}