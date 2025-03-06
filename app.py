from flask import Flask, jsonify, render_template
import requests
import pandas as pd

app = Flask(__name__)

# Sample function to simulate fetching F1 data (you can replace this with actual data)
def get_driver_data():
    # Make an HTTP GET request to the external API
    url = "https://ergast.com/api/f1/current/driverStandings.json"
    response = requests.get(url)
    
    if response.status_code == 200:  # If the request is successful
        data = response.json()  # Get the response in JSON format
        # Extract relevant data from the response
        standings = data['MRData']['StandingsTable']['StandingsLists'][0]['DriverStandings']
        driver_data = [{
            'position': standing['position'],
            'driver': standing['Driver']['familyName'],
            'points': standing['points']
        } for standing in standings]
        return driver_data
    else:
        return []  # Return an empty list if the API call fails

# Route to serve the homepage
@app.route('/')
def home():
    return render_template('visual.html')  # Rendering the frontend HTML file

# API endpoint to fetch F1 driver data as JSON
@app.route('/api/drivers')
def drivers():
    data = get_driver_data()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
