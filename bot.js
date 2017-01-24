var Twit = require('twit');
var config = require ('./config.js');
var Twitter = new Twit(config);

var searchTweet = function(){
    var params = {
            q: '#askyp',
            result_type: 'recent',
            lang: 'en'
    }
    //finds latest tweets based on query
    Twitter.get('search/tweets',params,function(err,data, response){
        if(!err){
            numTweets = Object.keys(data.statuses).length;

            for (var i = 0;i<numTweets;i++){
                var tweetID = data.statuses[i].id_str;
                var message = data.statuses[i].text;
                var tweetUserID = data.statuses[i].user.screen_name;
            
                console.log('@'+ tweetUserID+ " tweeted: "+ message);
            }
        }
        else{
            //can't search tweet
            console.log('Uh oh looks like tweet isn\'t found');
        }
    });
}

searchTweet();
