var getSecret = require('./ypConfig.js');
var request = require('request');

function yellowPages(key_text, location, callback) {

    var store_results = []; //stores businesses found
    var totalListings; //num of listings found

    var params = {
        apikey: getSecret.apikey, //from config file 
        UID: getSecret.ID,
        distance: 5,
        pgLen: 3,
        pg: 1
    };

    var requestParams = {
        url: "http://api.sandbox.yellowapi.com/FindBusiness/?what=" + encodeURIComponent(key_text) +
        "&where=" + encodeURIComponent(location) +
        "&pgLen=" + params.pgLen +
        "&pg=" + params.pg +
        "&dist=" + params.distance +
        "&fmt=JSON&lang=en&UID=" + params.UID +
        "&apikey=" + params.apikey,
        method: 'GET'
    };

    request(requestParams, function(err, response, body){
        bodyJSON = JSON.parse(body); //Yellow Pages returns a string so parse to a JSON

        bodyJSON.listings.forEach(function(results){
            store_results.push(results.name); //Insert business names into array (Only the first 10)
        });

        totalListings = bodyJSON.summary.totalListings;

        callback(totalListings, store_results);
    });

}

module.exports = yellowPages;