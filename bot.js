var Twit = require('twit');
var config = require ('./config.js');
var Twitter = new Twit(config);

//IBM WATSON ALCHEMY LANGUAGE-------------------
var watson = require('watson-developer-cloud');
var config_watson = require('./watsonConfig.js');
var alchemy_language = watson.alchemy_language(config_watson);

//YELLOW PAGES API
var YellowPages = require('./ypAPI.js');

var searchTweet = function(){
    var params = {
            q: '#askFindStuff4',
            result_type: 'recent',
            geocode: '43.5528332,-79.7156933,5mi', //searches around specific area
            lang: 'en',
            count: '5' //max 5
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

var extractKeyWords = function(data){
    numTweets = Object.keys(data.statuses).length;

    //console.log(numTweets);
    
    var tweetID = data.statuses[0].id_str;
    var message = data.statuses[0].text;
    var tweetUserID = data.statuses[0].user.screen_name;
    var location = '43.5528332,-79.7156933';
    
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
        location = '43.5528332,-79.7156933'; //default to this location
    }

    console.log('@'+ tweetUserID+ " tweeted: "+ message);
    console.log('At Location: ' + location);

    //extract keywords

    var params = {
        extract: 'keywords',
        text: message,
        showSourceText: 1
    }
   
    alchemy_language.combined(params,function(err,response){
        var numOfKeyWords = 0;
        var topKeyWord = [];
        if(!err){
            numOfKeyWords = Object.keys(response.keywords).length;
            topKeyWord = response.keywords;
            //console.log(numOfKeyWords, topKeyWord);
            var key_text = '';
            var max_relevance = -0.01;    
            for(var i=0;i<numOfKeyWords;i++){
                temp = Number(topKeyWord[i].relevance);
                if(temp > max_relevance){
                    max_relevance = temp;
                    key_text = topKeyWord[i].text;
                }
            }

            //call YP api
            YellowPages(key_text,location,function(listings,stores){
                replyToTweet(tweetUserID,listings,stores,key_text);
                
            });
       }
        else{
            console.log("Extracting keywords failed: ",err);
        }    
        
    });
    
    

}

var replyToTweet = function(tweetUserID, listings, stores, key_text){

    var replyMsg = tweetUserID + ' the nearest places for ' + key_text + ' are: ';
    lengthOfTweet = replyMsg.length;
    numOfStores = Object.keys(stores).length;
    var runningCount = 139 - lengthOfTweet; 
    
    //handling the max 140 char twitter count. 
    for (var i=0;i<numOfStores;i++){
        //console.log(stores[i]);
        if(stores[i].length < runningCount){
            replyMsg = replyMsg + stores[i] + ', ';
            runningCount = 139 - replyMsg.length;
        }
    }
    //console.log(replyMsg, numOfStores);
    replyMsg = replyMsg.slice(0,-2);

    var replyObj = {
        status: "@"+replyMsg
    }
    //console.log(replyObj.status);
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

//ypCalls();
//extractKeyWords();
searchTweet();