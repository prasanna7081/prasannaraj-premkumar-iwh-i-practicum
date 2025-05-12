require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

// HubSpot API configuration
const hubspotApiUrl = 'https://api.hubapi.com';
const headers = {
  Authorization: `Bearer ${process.env.PRIVATE_APP_TOKEN}`,
  'Content-Type': 'application/json'
};

// IMPORTANT: You need to use the API name, not the ID number!
// Replace with your custom object's API name (e.g., "p_pet")
// Find this in HubSpot under Settings → Data Management → Objects → Your Custom Object → API name
const objectType = "p_pets"; // CHANGE THIS to your actual API name!

// Your custom property names
const property2Name = "breed"; // Looks like you're using "breed"
const property3Name = "age";   // Looks like you're using "age"

// Configure Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Homepage route
app.get('/', async (req, res) => {
  try {
    console.log("Making API request to get objects with these properties: name, " + property2Name + ", " + property3Name);
    
    // Get custom objects - FIXED URL FORMAT
    const response = await axios.get(
      `${hubspotApiUrl}/crm/v3/objects/${objectType}?properties=name,${property2Name},${property3Name}`,
      { headers }
    );
    
    console.log("API Response:", response.data);
    
    const customObjects = response.data.results;
    
    // Render homepage template with data
    res.render('homepage', {
      title: 'Custom Objects | Integrating With HubSpot I Practicum',
      customObjects: customObjects,
      property2Name: property2Name, 
      property3Name: property3Name
    });
  } catch (error) {
    console.error('Error fetching custom objects:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching custom objects: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
  }
});

// Update custom object form route
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
    property2Name: property2Name,
    property3Name: property3Name
  });
});

// Post route to create new custom object
app.post('/update-cobj', async (req, res) => {
  try {
    // Get form data
    const { name, breed, age } = req.body;
    
    console.log("Form data received:", { name, breed, age });
    
    // Create custom object with properties
    const properties = {
      name: name
    };
    
    // Add the other properties using their API names
    properties[property2Name] = breed;
    properties[property3Name] = age;
    
    console.log("Sending to HubSpot:", properties);
    
    // Make POST request to HubSpot API - FIXED URL FORMAT
    await axios.post(
      `${hubspotApiUrl}/crm/v3/objects/${objectType}`,
      { properties },
      { headers }
    );
    
    // Redirect to homepage
    res.redirect('/');
  } catch (error) {
    console.error('Error creating custom object:', error.response ? error.response.data : error.message);
    res.status(500).send('Error creating custom object: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
  }
});

// Start server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
  console.log("DEBUG INFO:");
  console.log("- Using object type:", objectType);
  console.log("- Using property names:", property2Name, property3Name);
  console.log("- API token available:", process.env.PRIVATE_APP_TOKEN ? "Yes" : "No");
});