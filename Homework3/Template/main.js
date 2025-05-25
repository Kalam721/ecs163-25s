let abFilter = 25;
const width = window.innerWidth;
const height = window.innerHeight;


//for scatterplot graph
let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 20, right: 50, bottom: 55, left: 100},
    scatterWidth = 900 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 600 - scatterMargin.top - scatterMargin.bottom;

//for bar graph
let teamLeft = 0, teamTop = 70;
let teamMargin = {top: 100, right: 0, bottom: 70, left: 1120},
    teamWidth = width-100 - teamMargin.left - teamMargin.right,
    teamHeight = height-250 - teamMargin.top - teamMargin.bottom;

//for line graph
let lineLeft = 0, lineTop = 70;
let lineMargin = {top: 350, right: 0, bottom: 70, left: 1120},
    lineWidth = width-100 - lineMargin.left - lineMargin.right,
    lineHeight = height - lineMargin.top - lineMargin.bottom;



d3.csv("ds_salaries.csv").then(rawData =>{
    console.log("rawData", rawData);

    rawData.forEach(function(d){
        d.salary_in_usd = Number(d.salary_in_usd);
        d.salary = Number(d.salary);
    });

    const filteredData = rawData.filter(d=>d.salary_in_usd > abFilter);
    const processedData = filteredData.map(d=>{
                          return {
                              "Buying_Power":d.salary/d.salary_in_usd,
                              "Normal_Salary":d.salary,
                              "Usd":d.salary_in_usd/1000,
                              "experience_level": d.experience_level,
                              "company_size": d.company_size,
                              "year": d.work_year,
                              "salary_currency": d.salary_currency,
                          };
    });
    console.log("processedData", processedData);


    rawData.forEach(function(d){
        d.salary_in_usd = Number(d.salary_in_usd);
        d.salary = Number(d.salary);
    });

    const svg = d3.select("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;")
        .call(zoom);





    //visual 1: scatter plot
    const g1 = svg.append("g")
                .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
                .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
                .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)
                .attr("class", "scatter-plot");

    // X label
    g1.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 60)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Buying Power (Salary/USD Salary)");

    // Y label
    g1.append("text")
        .attr("x", -(scatterHeight / 2))
        .attr("y", -50)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Salary in USD (thousands)");

    // X scale
    const x1 = d3.scaleLog([0.65,1024], [0, scatterWidth]).base(2);

    // Y scale
    const y1 = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.Usd)])
        .range([scatterHeight, 0])
        .nice();

    // X axis
    const xAxisCall = d3.axisBottom(x1).ticks(8);
    const xAxisG = g1.append("g")
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(xAxisCall);

    // Y axis
    const yAxisCall = d3.axisLeft(y1).ticks(8);
    const yAxisG = g1.append("g").call(yAxisCall);


    // Create tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Color function for data plots/bars
    function getColor(experienceLevel) {
        if (experienceLevel === "EX") return 'red';
        if (experienceLevel === "SE") return 'steelblue';
        if (experienceLevel === "MI") return 'orange';
        return 'purple';
    }

    // Create circles
    const circles = g1.selectAll("circle")
        .data(processedData)
        .enter().append("circle")
        .attr("cx", d => x1(d.Buying_Power))
        .attr("cy", d => y1(d.Usd))
        .attr("r", 4)
        .attr("fill", d => getColor(d.experience_level))
        .attr("stroke", "white")
        .attr("stroke-width", 0.1)
        //tooltip and changes highlighted circle green
        .on("mouseover", function (event, d) {
            d3.select(this).attr("r", 6).attr("stroke-width", 2).attr("fill", "green");
            tooltip.style("opacity", 1)
                .html(`<b>Buying Power:</b> ${d.Buying_Power}<br><b>Salary in USD:</b> ${d.salary_in_usd}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 40) + "px");
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", function (d) {
            if (!d3.select(this).classed("clicked")) {
                d3.select(this).attr("r", 4).attr("stroke-width", 0.5).attr("fill", function(d){ if(d.experience_level == "EX") return 'red'; if(d.experience_level == "SE") return 'steelblue'; if(d.experience_level == "MI") return 'orange'; else return 'purple'});
            }
            tooltip.style("opacity", 0);
        })
        .on("click", function (event, d) {
            const circle = d3.select(this);
            const isClicked = circle.classed("clicked");

            if (!isClicked) {
                circle.classed("clicked", true);
                circle.attr("fill", "green").attr("r", 6).attr("stroke-width", 2);
            } else {
                circle.attr("fill", function(d){ if(d.experience_level == "EX") return 'red'; if(d.experience_level == "SE") return 'steelblue'; if(d.experience_level == "MI") return 'orange'; else return 'purple'}).attr("r", 4).attr("stroke-width", 0.5);
            }
        });

    //zoom funct for y-axis
    function zoom() {
        return d3.zoom()
            .scaleExtent([1, 10])
            .on("zoom", function(event) {
                const newY = event.transform.rescaleY(y1);

                // Update y-axis
                yAxisG.call(d3.axisLeft(newY).ticks(8));

                // Update circle positions
                circles.attr("cy", d => newY(d.Usd));
            });
    }

    // Apply zoom to the scatter plot group
    //g1.call(zoom());











    //visual 2: Bar chart
    const Experience = processedData.reduce((acc, d) => {
        acc[d.experience_level] = (acc[d.experience_level] || 0) + 1;
        return acc;
    }, {});
    let numLvl = Object.keys(Experience).map(key => ({
        experience_level: key,
        count: Experience[key]
    }));

    console.log("Experience counts:", numLvl);

    const g3 = svg.append("g")
                .attr("width", teamWidth + teamMargin.left + teamMargin.right)
                .attr("height", teamHeight + teamMargin.top + teamMargin.bottom)
                .attr("transform", `translate(${teamMargin.left}, ${teamTop})`)
                .attr("class", "bar-chart");

    // X label
    g3.append("text")
        .attr("x", teamWidth / 2)
        .attr("y", teamHeight + 50)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Experience Level");

    // Y label
    g3.append("text")
        .attr("x", -(teamHeight / 2))
        .attr("y", -40)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Number of Workers");

    //x axis
    const x2 = d3.scaleBand()
        .domain(numLvl.map(d => d.experience_level))
        .range([0, teamWidth])
        .paddingInner(0.2)
        .paddingOuter(0.2);

    //y axis
    const y2 = d3.scaleLinear()
        .domain([0, d3.max(numLvl, d => d.count)])
        .range([teamHeight, 0])
        .nice();

    //Axes
    const xAxisG2 = g3.append("g")
        .attr("transform", `translate(0, ${teamHeight})`);

    const yAxisG2 = g3.append("g")
        .call(d3.axisLeft(y2).ticks(6));

    // Initial bars
    let bars = g3.selectAll("rect")
        .data(numLvl, d => d.experience_level)
        .enter().append("rect")
        .attr("x", d => x2(d.experience_level))
        .attr("y", d => y2(d.count))
        .attr("width", x2.bandwidth())
        .attr("height", d => teamHeight - y2(d.count))
        .attr("fill", d => getColor(d.experience_level))
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    // Initial x-axis
    xAxisG2.call(d3.axisBottom(x2));

    //Sorting function
    function updateChart(sortType) {
        let sortedData = [...numLvl];

        switch(sortType) {
            case 'alphabetical':
                sortedData.sort((a, b) => a.experience_level.localeCompare(b.experience_level));
                break;
            case 'ascending':
                sortedData.sort((a, b) => a.count - b.count);
                break;
            case 'descending':
                sortedData.sort((a, b) => b.count - a.count);
                break;
        }


        // Update x scale domain
        x2.domain(sortedData.map(d => d.experience_level));

        // Transition duration
        const t = d3.transition().duration(750);

        // Update bars
        bars.data(sortedData, d => d.experience_level)
            .transition(t)
            .attr("x", d => x2(d.experience_level));

        // Update x axis/labels
        xAxisG2.transition(t)
            .call(d3.axisBottom(x2));
    }

    //Dropdown event listener
    d3.select("#sortDropdown").on("change", function() {
        const selectedValue = d3.select(this).property("value");
        updateChart(selectedValue);
    });

    //Legend for experience levels (also used for scatter plot)
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${scatterWidth + scatterMargin.left + 20}, 50)`);

    const legendData = [
        {level: "EN", label: "Entry Level", color: "purple"},
        {level: "MI", label: "Mid Level", color: "orange"},
        {level: "SE", label: "Senior Level", color: "steelblue"},
        {level: "EX", label: "Executive Level", color: "red"}
    ];

    legend.selectAll(".legend-item")
        .data(legendData)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .each(function(d) {
            const g = d3.select(this);
            g.append("circle")
                .attr("r", 6)
                .attr("fill", d.color);
            g.append("text")
                .attr("x", 15)
                .attr("y", 5)
                .attr("font-size", "12px")
                .text(`${d.level} - ${d.label}`);
    });












    //visual 3: plot line graph
    const yearCurrencyC = processedData.reduce((s, { year, salary_currency }) => {
        const key = `${year}+${salary_currency}`;
        s[key] = (s[key] || 0) + 1;
        return s;
    }, {});

    const numCurr = Object.keys(yearCurrencyC).map((key) => {
        const [year, salary_currency] = key.split('+');
        return { year, salary_currency, count: yearCurrencyC[key] };
    });
    console.log("Curr", yearCurrencyC);


    const g5 = svg.append("g")
                .attr("width", lineWidth + lineMargin.left + lineMargin.right)
                .attr("height", lineHeight + lineMargin.top + lineMargin.bottom)
                .attr("transform", `translate(${lineMargin.left}, ${lineMargin.top})`)
                .attr("class", "line-plot");

    //X label
    g5.append("text")
        .attr("x", lineWidth / 2)
        .attr("y", lineHeight + 60)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Year");

    //Y label
    g5.append("text")
        .attr("x", -(lineHeight / 2))
        .attr("y", -50)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Amount of currency");

    //X scale
    const x3 = d3.scaleLinear()
        .domain([d3.max(processedData, d => d.year), d3.min(processedData, d => d.year)])
        .range([lineHeight, 0])
        .nice();

    //Y scale
    const y3 = d3.scaleLinear()
        .domain([0, d3.max(numCurr, d => d.count)])
        .range([lineHeight, 0])
        .nice();

    //X axis
    const x3Axis = d3.axisBottom(x3).ticks(4);
    const x3AxisG = g5.append("g")
        .attr("transform", `translate(0, ${lineHeight})`)
        .call(x3Axis);

    // Y axis
    const y3Axis = d3.axisLeft(y3).ticks(8);
    const y3AxisG = g5.append("g").call(y3Axis);



    // Group data by currency
    const uniqueCurrencies = [...new Set(numCurr.map(d => d.salary_currency))];

    const currencyGroups = {};
    uniqueCurrencies.forEach(currency => {
        currencyGroups[currency] = numCurr.filter(d => d.salary_currency === currency);
    });
    console.log("groups", currencyGroups);
    // Color scale for different currencies
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Line generator
    const line = d3.line()
        .x(d => x3(d.year))
        .y(d => y3(d.count))
        .curve(d3.curveMonotoneX);


    const multiYearCurrencies = [];

    // Create lines for each currency
    uniqueCurrencies.forEach((currency) => {
        data = currencyGroups[currency];

        console.log("current", data);
        const uniqueYears = [];
        for (let i = 0; i < data.length; i++) {
            if (!uniqueYears.includes(data[i].year)) {
                uniqueYears.push(data[i].year);
            }
        }
        const appearsInMultipleYears = uniqueYears.length > 1;
        
        //console.log(`Currency ${currency}: appears in ${uniqueYears.length} years`, uniqueYears);
        
        // Only create line if currency appears in multiple years
        if (appearsInMultipleYears) {
            // Sort data by year for proper line drawing
            multiYearCurrencies.push(currency);
            data.sort((a, b) => a.year - b.year);
            
            // Add the line path
            g5.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", colorScale(currency))
                .attr("stroke-width", 2)
                .attr("d", line);

            // Add dots for data points
            g5.selectAll(`.dots-${currency}`)
                .data(data)
                .enter().append("circle")
                .attr("class", `dots-${currency}`)
                .attr("cx", d => x3(d.year))
                .attr("cy", d => y3(d.count))
                .attr("r", 3)
                .attr("fill", colorScale(currency))
                .attr("stroke", "white")
                .attr("stroke-width", 1);
        }
    });

    // Add legend for only currencies plotted
    const currencyLegend = g5.append("g")
        .attr("class", "currency-legend")
        .attr("transform", `translate(${lineWidth - 350}, -10)`);

    let legendIndex = 0;
    multiYearCurrencies.forEach((currency) => {
        const legendItem = currencyLegend.append("g")
            .attr("transform", `translate(0, ${legendIndex * 20})`);

            legendItem.append("circle")
                .attr("r", 4)
                .attr("fill", colorScale(currency));

            legendItem.append("text")
                .attr("x", 10)
                .attr("y", 4)
                .attr("font-size", "10px")
                .text(currency);

            legendIndex++;

            console.log("added: ", currency);
    });

});