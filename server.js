const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;

// Route to fetch IoT devices in Kuwait from Shodan API
app.get('/api/iot-devices', async (req, res) => {
    try {
        const response = await axios.get(`https://api.shodan.io/shodan/host/search?key=${SHODAN_API_KEY}&query=country:KW`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching IoT devices:', error);
        res.status(500).send('Error fetching IoT devices');
    }
});

// Route to fetch CVE details from CVEDB API
app.get('/api/cve/:cve_id', async (req, res) => {
    const { cve_id } = req.params;
    try {
        const response = await axios.get(`https://api.shodan.io/cves/${cve_id}?key=${SHODAN_API_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching CVE data:', error);
        res.status(500).send('Error fetching CVE data');
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
