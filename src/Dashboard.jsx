import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

const Dashboard = () => {
    const [data, setData] = useState([]);
    const dustChartRef = useRef(null);
    const lightChartRef = useRef(null);
    const soundChartRef = useRef(null);

    useEffect(() => {
        axios.get('http://localhost:8000/api/data')
            .then(response => setData(response.data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    useEffect(() => {
        if (data.length > 0) {
            const dustData = filterData('dust');
            const lightData = filterData('light');
            const soundData = filterData('sound');

            createChart(dustChartRef, 'Dust Sensors', dustData.labels, dustData.datasets);
            createChart(lightChartRef, 'Light Sensors', lightData.labels, lightData.datasets);
            createChart(soundChartRef, 'Sound Sensors', soundData.labels, soundData.datasets);
        }
    }, [data]);

    const filterData = (sensorType) => {
        const filteredData = data.filter(d => d.sensor_type.startsWith(sensorType));
        const labels = filteredData.map(d => new Date(d.timestamp).toLocaleTimeString());
        const datasets = [];

        const groupedData = {};
        filteredData.forEach(d => {
            const valueKey = Object.keys(d).find(key => key !== 'id' && key !== 'timestamp' && key !== 'sensor_type' && key !== 'created_at' && key !== 'updated_at');
            if (!groupedData[valueKey]) {
                groupedData[valueKey] = [];
            }
            groupedData[valueKey].push(d[valueKey]);
        });

        Object.keys(groupedData).forEach(key => {
            datasets.push({
                label: key,
                data: groupedData[key],
                borderWidth: 1
            });
        });

        return { labels, datasets };
    };

    const createChart = (chartRef, title, labels, datasets) => {
        const ctx = chartRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: title
                    }
                }
            }
        });
    };

    return (
        <div>
            <h2>Sensor Data Dashboard</h2>
            <div>
                <canvas id="dust-chart" ref={dustChartRef}></canvas>
            </div>
            <div>
                <canvas id="light-chart" ref={lightChartRef}></canvas>
            </div>
            <div>
                <canvas id="sound-chart" ref={soundChartRef}></canvas>
            </div>
        </div>
    );
};

export default Dashboard;
