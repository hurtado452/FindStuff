var Twit = require('twit');
var config = require ('./config.js');
var Twitter = new Twit(config);

//IBM WATSON ALCHEMY LANGUAGE-------------------
var watson = require('watson-developer-cloud');
var config_watson = require('./watsonConfig.js');
var alchemy_language = watson.alchemy_language(config_watson);

//YELLOW PAGES API
var YellowPages = require('node-yp');
var config_yp = require('./ypConfig.js');
var yp = new YellowPages(config_yp);


var searchTweet = function(){
    var params = {
            q: '#askFindStuff4',
            result_type: 'recent',
            geocode: '43.5528332,-79.7156933,15mi',
            lang: 'en',
            count: '5'
    }
    //finds latest tweets based on query
    Twitter.get('search/tweets',params,function(err,data, response){
        if(!err){
            //console.log(data);
            extractKeyWords(data);
        }
        else{
            //can't search tweet
            console.log('Uh oh looks like tweet isn\'t found');
        }
    });
}

var extractKeyWords = function(){
    
    numTweets = Object.keys(data.statuses).length;

    //console.log(numTweets);
    
    var tweetID = data.statuses[0].id_str;
    var message = data.statuses[0].text;
    var tweetUserID = data.statuses[0].user.screen_name;
    var location = null;
    
    //save location if possible
    if(data.statuses[0].place != null){
        if(data.statuses[0].place.bounding_box.coordinates != null){
            location = data.statuses[0].place.bounding_box.coordinates[0][0];
        }
    }
    else if(data.statuses[0].coordinates != null){
        location = coordinates;
    }
    else{
        location = 'Mississauga'; //default to this location
    }

    console.log('@'+ tweetUserID+ " tweeted: "+ message);
    console.log('At Location: ' + location);

    //extract keywords
   var params = {
        extract: 'keywords',
        text: 'Where can I find flower arrangements for weddings?',
        showSourceText: 1
    }

    var numOfKeyWords = 0;

    alchemy_language.combined(params,function(err,response){
        if(!err){
            numOfKeyWords = Object.keys(response.keywords).length;
            
        }
        else{
            console.log("Extracting keywords failed: ",err);
        }
    });


    /*var parameters ={
        what: ''
    }
    //get Yellow Pages businesses nearby
    yp.search(,parameters,function(err,response){

    });*/
    //replyToTweet(tweetUserID);

}

var replyToTweet = function(tweetUserID){
    var replyObj = {
        status: "yo @"+tweetUserID
    }
    //reply to user
    Twitter.post('statuses/update', replyObj, function(err,replyData,response){
        if (!err){
            console.log("Reply Sent to @"+ tweetUserID);
        }
        else{
             console.log("Uh Oh something went wrong can't reply : ",err);
        }
    });
}

extractKeyWords();
//searchTweet();