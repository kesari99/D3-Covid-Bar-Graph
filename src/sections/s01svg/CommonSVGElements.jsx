import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function CovidBarChart() {
    const svgRef = useRef(null);
    const [daysToShow, setDaysToShow] = useState(30);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };
    const width = 1200 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const colorScheme = {
        light: {
            bg: 'bg-white',
            text: 'text-gray-800',
            bar: 'steelblue',
            hover: 'orange',
            axis: '#374151',
            grid: '#e5e7eb',
            card: 'bg-white shadow-lg',
            button: 'bg-gray-200 hover:bg-gray-300',
            activeButton: 'bg-blue-500 hover:bg-blue-600 text-white',
            tooltipBg: 'bg-white border border-gray-200'
        },
        dark: {
            bg: 'bg-gray-900',
            text: 'text-gray-100',
            bar: '#4f46e5',
            hover: '#f59e0b',
            axis: '#f3f4f6',
            grid: '#4b5563',
            card: 'bg-gray-800 shadow-xl',
            button: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
            activeButton: 'bg-blue-600 hover:bg-blue-700 text-white',
            tooltipBg: 'bg-gray-800 border border-gray-700 text-gray-100'
        }
    };

    const colors = isDarkMode ? colorScheme.dark : colorScheme.light;

    useEffect(() => {
        fetchAndProcessData();
    }, [daysToShow, isDarkMode]);

    const fetchAndProcessData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('https://api.covidtracking.com/v1/us/daily.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            const parsedData = data
                .map(d => ({
                    date: d3.timeParse("%Y%m%d")(d.date.toString()),
                    positiveIncrease: d.positiveIncrease || 0,
                    deathIncrease: d.deathIncrease || 0
                }))
                .filter(d => d.date && !isNaN(d.positiveIncrease))
                .sort((a, b) => a.date - b.date);

            drawChart(parsedData.slice(-daysToShow));
            setIsLoading(false);
        } catch (err) {
            console.error("Failed to fetch COVID data:", err);
            setError("Failed to load COVID data. Please try again later.");
            setIsLoading(false);
        }
    };

    const drawChart = (recentData) => {
        if (!svgRef.current || recentData.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const container = svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleTime()
            .domain(d3.extent(recentData, d => d.date))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(recentData, d => d.positiveIncrease) * 1.1]) // Add 10% height on abive
            .range([height, 0]);

        container.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat(""))
            .attr("stroke", colors.grid)
            .attr("opacity", 0.3)
            .select(".domain")
            .attr("stroke-opacity", 0);

        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat("%b %d"))
            .tickSizeOuter(0);

        const yAxis = d3.axisLeft(yScale)
            .ticks(5)
            .tickFormat(d => `${d / 1000}k`);

        container.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("fill", colors.axis)
            .attr("dy", "0.5em")
            .attr("dx", "-0.8em");

        container.select(".x-axis path")
            .attr("stroke", colors.axis);
        container.select(".x-axis").selectAll("line")
            .attr("stroke", colors.axis);

        container.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .attr("color", colors.axis);

        container.select(".y-axis path")
            .attr("stroke", colors.axis);
        container.select(".y-axis").selectAll("line")
            .attr("stroke", colors.axis);

        const barWidth = Math.max((width / recentData.length) - 2, 2);

        const barGroups = container.selectAll(".bar-group")
            .data(recentData)
            .enter().append("g")
            .attr("class", "bar-group");

        const bars = barGroups.append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.date))
            .attr("y", d => yScale(d.positiveIncrease))
            .attr("width", barWidth)
            .attr("height", d => height - yScale(d.positiveIncrease))
            .attr("fill", colors.bar)
            .attr("rx", 2)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("fill", colors.hover)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1);
                
                d3.select("#tooltip")
                    .style("opacity", 1)
                    .html(`
                        <div class="p-3">
                            <p class="font-semibold text-base">${d3.timeFormat("%B %d, %Y")(d.date)}</p>
                            <div class="mt-2">
                                <p class="flex justify-between">
                                    <span>New Cases:</span> 
                                    <span class="font-medium ml-4">${d.positiveIncrease.toLocaleString()}</span>
                                </p>
                                <p class="flex justify-between mt-1">
                                    <span>Deaths:</span> 
                                    <span class="font-medium ml-4">${d.deathIncrease.toLocaleString()}</span>
                                </p>
                            </div>
                        </div>
                    `);
            })
            .on("mousemove", (event) => {
                const tooltipWidth = 180;
                const xPosition = event.pageX + 10;
                const yPosition = event.pageY - 10;
                
                const adjustedX = xPosition + tooltipWidth > window.innerWidth 
                    ? event.pageX - tooltipWidth - 10 
                    : xPosition;
                
                d3.select("#tooltip")
                    .style("left", `${adjustedX}px`)
                    .style("top", `${yPosition}px`);
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("fill", colors.bar)
                    .attr("stroke", "none");
                d3.select("#tooltip").style("opacity", 0);
            });

        const showLabelThreshold = d3.max(recentData, d => d.positiveIncrease) * 0.2;
        
        barGroups.append("text")
            .attr("class", "bar-label")
            .filter(d => d.positiveIncrease > showLabelThreshold) 
            .attr("text-anchor", "middle")
            .attr("x", d => xScale(d.date) + barWidth / 2)
            .attr("y", d => yScale(d.positiveIncrease) - 5)
            .attr("fill", colors.axis)
            .style("font-size", "10px")
            .text(d => `${(d.positiveIncrease / 1000).toFixed(0)}k`);

        // const zoom = d3.zoom()
        //     .scaleExtent([1, 8])
        //     .translateExtent([[0, 0], [width, height]])
        //     .on("zoom", (event) => {
        //         const newXScale = event.transform.rescaleX(xScale);
                
        //         // Update bars position and width
        //         bars.attr("x", d => newXScale(d.date))
        //             .attr("width", Math.max(barWidth / event.transform.k, 1));
                
        //         // Update bar labels
        //         barGroups.selectAll(".bar-label")
        //             .attr("x", d => newXScale(d.date) + (barWidth / event.transform.k) / 2)
        //             .style("opacity", event.transform.k > 3 ? 1 : 0); // Show all labels when zoomed in
                
        //         // Update x-axis
        //         container.select(".x-axis").call(xAxis.scale(newXScale));
                
        //         // Rotate labels again after zoom
        //         container.select(".x-axis").selectAll("text")
        //             .attr("transform", "rotate(-45)")
        //             .style("text-anchor", "end")
        //             .attr("dy", "0.5em")
        //             .attr("dx", "-0.8em");
        //     });

        // svg.call(zoom)
        //    .call(zoom.transform, d3.zoomIdentity); // Reset zoom state

        svg.append("text")
            .attr("x", margin.left)
            .attr("y", 20)
            .attr("text-anchor", "start")
            .attr("fill", colors.axis)
            .style("font-size", "12px")
            .style("font-style", "italic")

        container.append("text")
            .attr("transform", `translate(${width / 2},${height + margin.top + 30})`)
            .style("text-anchor", "middle")
            .attr("fill", colors.axis)
            .style("font-size", "14px")
            .text("Date");

        container.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 15)
            .attr("x", -height / 2)
            .style("text-anchor", "middle")
            .attr("fill", colors.axis)
            .style("font-size", "14px")
            .text("Daily New Cases");
    };

    const getButtonClass = (isActive) => {
        return `px-4 py-2 rounded-lg transition-colors ${
            isActive ? colors.activeButton : colors.button
        }`;
    };

    return (
        <div className={`p-8 rounded-xl ${colors.card} transition-colors duration-300`}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h2 className={`text-2xl font-bold ${colors.text}`}>
                    COVID-19 Daily New Cases in the US
                </h2>
                
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => setDaysToShow(30)}
                        className={getButtonClass(daysToShow === 30)}
                    >
                        30 Days
                    </button>
                    <button 
                        onClick={() => setDaysToShow(60)}
                        className={getButtonClass(daysToShow === 60)}
                    >
                        60 Days
                    </button>
                    <button 
                        onClick={() => setDaysToShow(90)}
                        className={getButtonClass(daysToShow === 90)}
                    >
                        90 Days
                    </button>
                    <button 
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`px-4 py-2 rounded-lg ${colors.button}`}
                        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>

            <div className="relative">
                {isLoading && (
                    <div className={`absolute inset-0 flex items-center justify-center ${colors.bg} bg-opacity-75 z-10`}>
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
                
                {error && (
                    <div className={`absolute inset-0 flex items-center justify-center ${colors.bg} bg-opacity-75 z-10`}>
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p>{error}</p>
                            <button 
                                onClick={fetchAndProcessData}
                                className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}
                
                <svg 
                    ref={svgRef} 
                    className="w-full max-w-full overflow-visible" 
                    style={{ minHeight: `${height + margin.top + margin.bottom}px` }}
                ></svg>
            </div>

            <div
                id="tooltip"
                className={`absolute opacity-0 p-2 rounded-lg text-sm pointer-events-none transition-opacity ${colors.tooltipBg}`}
                style={{
                    minWidth: '180px',
                    color: colors.text,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
            ></div>
        </div>
    );
}