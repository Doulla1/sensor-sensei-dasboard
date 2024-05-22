import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

const Dashboard = () => {
    // State pour stocker les données des capteurs
    const [data, setData] = useState([]);
    // Références pour les éléments canvas des graphiques
    const dustChartRef = useRef(null);
    const lightChartRef = useRef(null);
    const soundChartRef = useRef(null);

    // Effet pour récupérer les données des capteurs lors du chargement initial
    useEffect(() => {
        axios.get('http://localhost:8000/api/data')
            .then(response => setData(response.data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    // Effet pour créer et mettre à jour les graphiques lorsque les données changent
    useEffect(() => {
        if (data.length > 0) {
            // Filtrer et formater les données pour chaque type de capteur
            const dustData = filterData('dust');
            const lightData = filterData('light');
            const soundData = filterData('sound');

            // Créer les graphiques pour chaque type de capteur
            createChart(dustChartRef, 'Dust Sensors', dustData.labels, dustData.datasets);
            createChart(lightChartRef, 'Light Sensors', lightData.labels, lightData.datasets);
            createChart(soundChartRef, 'Sound Sensors', soundData.labels, soundData.datasets);
        }
    }, [data]);

    // Fonction pour filtrer et formater les données d'un type de capteur
    const filterData = (sensorType) => {
        const filteredData = data.filter(d => d.sensor_type.startsWith(sensorType));
        const labels = filteredData.map(d => new Date(d.timestamp).toLocaleTimeString());
        const datasets = [];
        console.log("filteredData", filteredData);

        // Regrouper les données par type de mesure
        const groupedData = {};
        filteredData.forEach(d => {
            const valueKey = Object.keys(d).find(key => key !== 'id' && key !== 'timestamp' && key !== 'sensor_type' && key !== 'created_at' && key !== 'updated_at');
            if (!groupedData[valueKey]) {
                groupedData[valueKey] = [];
            }
            groupedData[valueKey].push(d[valueKey]);
        });

        // Formater les données pour les graphiques
        Object.keys(groupedData).forEach((key, index ) => {
            datasets.push({
                label: filteredData[index]["sensor_type"],
                data: groupedData[key],
                borderWidth: 1
            });
        });

        return { labels, datasets };
    };

    // Fonction pour créer un graphique avec Chart.js
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
                    },
                }
            }
        });
    };

    // Rendu du composant
    return (
        <div>
            <h2>Sensor Data Dashboard</h2>
            {/* Canvas pour afficher les graphiques */}
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
