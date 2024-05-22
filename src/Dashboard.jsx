import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const Dashboard = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/data')
            .then(response => setData(response.data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const chartData = {
        labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
        datasets: data.flatMap(d => {
            return Object.keys(d.value).map(key => ({
                label: `${d.sensor_type} - ${key}`,
                data: d.value[key],
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 2
            }));
        })
    };

    return (
        <div>
            <h2>Sensor Data Dashboard</h2>
            <Line data={chartData} />
        </div>
    );
};

export default Dashboard;
