let abFilter = 25;
const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 20, right: 50, bottom: 30, left: 70},
    scatterWidth = 300 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 500 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let teamLeft = 0, teamTop = 10;
let teamMargin = {top: 10, right: 30, bottom: 30, left: 700},
    teamWidth = width-30 - teamMargin.left - teamMargin.right,
    teamHeight = height-150 - teamMargin.top - teamMargin.bottom;

// plots
//ds_salaries
//players
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
                          };
    });
    console.log("processedData", processedData);





    //plot 1: Scatter Plot
    const svg = d3.select("svg");

    const g1 = svg.append("g")
                .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
                .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
                .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

    // X label
    g1.append("text")
    .attr("x", scatterWidth / 2 +200)
    .attr("y", scatterHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Buying Power (Salary/Usd Salary)");


    // Y label
    g1.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Salary in Usd (Usd Salary/1000)");

    // X ticks
    const x1 = d3.scaleLog([0.65,800], [1, 960]).base(2);

    const xAxisCall = d3.axisBottom(x1)
                        .ticks(10);
    g1.append("g")
    .attr("transform", `translate(0, ${scatterHeight})`)
    .call(xAxisCall)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

    // Y ticks
    //const y1 = d3.scaleLog([512, 0.6], [1, 960]).base(2);

    const y1 = d3.scaleLinear()
    .domain([0, d3.max(processedData, d => d.Usd)])
    .range([scatterHeight, 0]);

    const yAxisCall = d3.axisLeft(y1)
                        .ticks(10);
    g1.append("g").call(yAxisCall);

    // circles
    
    const circles = g1.selectAll("circle").data(processedData);
    circles.enter().append("circle")
         .attr("cx", d => x1(d.Buying_Power))
         .attr("cy", d => y1(d.Usd))
         .attr("r", 3)
         .attr("fill", function(d){ if(d.experience_level == "EX") return 'red'; if(d.experience_level == "SE") return 'steelblue'; if(d.experience_level == "MI") return 'orange'; else return 'purple'});
         //.attr("fill", function(d){ return c10(d.experience_level)});

    const g2 = svg.append("g")
                .attr("width", distrWidth + distrMargin.left + distrMargin.right)
                .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
                .attr("transform", `translate(${distrLeft}, ${distrTop})`);













    //plot 2: Bar Chart for Team Player Count

    const Experience = processedData.reduce((s, { experience_level }) => (s[experience_level] = (s[experience_level] || 0) + 1, s), {});
    const numLvl = Object.keys(Experience).map((key) => ({ experience_level: key, count: Experience[key] }));
    console.log("Experience", numLvl);


    const g3 = svg.append("g")
                .attr("width", teamWidth + teamMargin.left + teamMargin.right)
                .attr("height", teamHeight + teamMargin.top + teamMargin.bottom)
                .attr("transform", `translate(${teamMargin.left}, ${teamTop})`);

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
    .text("Number of experienced workers");

    // X ticks
    const x2 = d3.scaleBand()
    .domain(numLvl.map(d => d.experience_level))
    .range([0, teamWidth])
    .paddingInner(0.2)
    .paddingOuter(0.2);

    const xAxisCall2 = d3.axisBottom(x2);
    g3.append("g")
    .attr("transform", `translate(0, ${teamHeight})`)
    .call(xAxisCall2)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

    // Y ticks
    const y2 = d3.scaleLinear()
    .domain([0, d3.max(numLvl, d => d.count)])
    .range([teamHeight, 0])
    .nice();

    const yAxisCall2 = d3.axisLeft(y2)
                        .ticks(6);
    g3.append("g").call(yAxisCall2);

    // bars
    const bars = g3.selectAll("rect").data(numLvl);

    bars.enter().append("rect")
    .attr("y", d => y2(d.count))

    .attr("x", d => x2(d.experience_level))
    .attr("width", x2.bandwidth())
    .attr("height", d => teamHeight - y2(d.count))
    .attr("fill", function(d){ if(d.experience_level == "EX") return 'red'; if(d.experience_level == "SE") return 'steelblue'; if(d.experience_level == "MI") return 'orange'; else return 'purple'});


    }).catch(function(error){
    console.log(error);
});