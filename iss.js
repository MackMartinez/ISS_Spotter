const request = require('request');


const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) 
    return callback(error, null);

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};

const fetchCoordsByIP = function(ip, callback) {
  request("http://ipwho.is/" + ip, (err, response, body) => {
    if (err) {
      callback(err, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching Coords. Response: ${body}`;
      callback(msg, null);
      return;
    }
    if (!JSON.parse(body).success) {
      callback(`Error: Success status was false. Server message says: Invalid IP address when fetching for IP ${ip}.`, null);
      return;
    }
    let coord = {};
    coord.latitude =  JSON.parse(body).latitude;
    coord.longitude =  JSON.parse(body).longitude;
    callback(err, coord);
    return;
  })
};

const fetchISSFlyOverTimes = function(coords, callback) {
  request(`https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, (err, response, body) => {
    if (err) {
      return callback(err, null);
    }
    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, IP) => { 
    if (error) {
      callback(error, null); 
      return;
    }
    fetchCoordsByIP(IP, (error, coordinates) => {  
      if (error) {
        callback(error, null);
        return;
      }
      fetchISSFlyOverTimes(coordinates, (error, response) => { 
        if (error) {
          callback(error, null);
          return;
        }
        callback(error, response);
        return;
      });
    });
  });
};


module.exports = { 
  fetchMyIP,
  fetchCoordsByIP,
  fetchISSFlyOverTimes,
  nextISSTimesForMyLocation
};