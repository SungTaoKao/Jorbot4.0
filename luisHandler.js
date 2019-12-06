const { XMLHttpRequest } = require('xmlhttprequest');

class LuisHandler {
    async processIntent(context, intent){
        console.log("context:" + context);
        console.log("intent:" + intent);


        switch (intent) {
            case 'search-auctions':
                await this.searchUpcomingAuctions(context);
                break;
            default:
                console.log(`Dispatch unrecognized intent: ${ intent }.`);
                break;
        }
    }
    createRequest(method, url) {
        var xhr = new XMLHttpRequest();
        if("withCredentials" in xhr) {
            xhr.open(method, url, false);
        } else if (typeof XDomainRequest != "undefined") {
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            xhr = null;
        }
        console.log(xhr);
        return xhr;
    }
    
    getTitle(text) {
        return text.match('<title>(.*)?</title>')[1];
    }
    
    async makeRequest(maxrba, region) {
        var url = 'http://dc2vdlsap01.rbauction.net:12026/auctions/upcoming?maxrba=' + maxrba + '&maxe1=5&etype=all&r=' + region + '&e1=true&ishawk=true';
        var xhr =  this.createRequest('GET', url);
        
        xhr.onload = function() {
            var text = xhr.responseText;
            var title = this.getTitle(text);
            console.log('Response from request to ' + url + ': ' + title);
        };
        xhr.onerror = function() {
            console.log('Woops, there was an error making the request.' + "Error: " + xhr.statusText);
        };

 

        xhr.send();
        var obj = JSON.parse(xhr.responseText);
        var final = "";
        for(var i = 0; i < obj.events.length; i++) {
            final = final + "Sale Name: " + obj.events[i].name + "<br>Sale Id: " + obj.events[i].eventId + "<br>Region: " + obj.events[i].region + "<br><br>";
        }
        
        document.write(final);
    }


    searchUpcomingAuctionsNew(context) {
        var url = 'http://dc2vdlsap01.rbauction.net:12026/auctions/upcoming?maxrba=3&maxe1=5&etype=all&r=AllRegions&e1=true&ishawk=true';
        const request = require("request");
        //await context.sendActivity('The next 3 upcoming auctions are:');
        request.get(url, async (error, response, body) => {
        let json = JSON.parse(body);
            for(var i = 0; i < json.events.length; i++) {
                await context.sendActivity("Sale Name: " + json.events[i].name + "\n\nSale Id: " + json.events[i].eventId + "\n\nRegion: " + json.events[i].region);
            }
            console.log(final);
        });
    }
    async searchUpcomingAuctions(context) {

        var url = 'http://dc2vdlsap01.rbauction.net:12026/auctions/upcoming?maxrba=3&maxe1=5&etype=all&r=AllRegions&e1=true&ishawk=true';
        var xhr = await this.createRequest('GET', url);
        
        xhr.send();
        var obj = JSON.parse(xhr.responseText);
        var final = "";
        //await context.sendActivity('The next 3 upcoming auctions are:');
        for(var i = 0; i < obj.events.length; i++) {
            final = final + "Sale Name: " + obj.events[i].name + "\n\nSale Id: " + obj.events[i].eventId + "\n\nRegion: " + obj.events[i].region + "\n\n";
        }
        await context.sendActivity(final);
    }
    
    makeSearchRequest(saleName, keywords) {
        var url1 = 'http://dc2vdlsap01.rbauction.net:12032/calendar/auctions/events?catalog=ci&ishawk=true';
        var xhr1 = createRequest('GET', url1);
        
        xhr1.onload = function() {
            var text = xhr1.responseText;
            var title = getTitle(text);
            console.log('Response from request to ' + url1 + ': ' + title);
        };
        xhr1.onerror = function() {
            console.log('Woops, there was an error making the request.' + "Error: " + xhr1);
        };

 

        xhr1.send();
        var obj1 = JSON.parse(xhr1.responseText);
        var myAuctionKey = "";
        
        for(var j = 0; j < obj1.auctions.length; j++) {
            if(obj1.auctions[j].name == saleName) {
                var mySearchUrl = obj1.auctions[j].urls.search;
                var myUrlItems = mySearchUrl.split("&");
                for(var k = 0; k <  myUrlItems.length; k++) {
                    var temp = myUrlItems[k];
                    
                    if(temp.startsWith("auction_key=")) {
                        myAuctionKey = temp.split("=")[1];
                        break;
                    }
                }
                
                break;
            }
        }
        
        
        var url = 'http://dc2vdlsap01.rbauction.net:12023/search?keywords=' + keywords + '&searchParams=%7B"' + 'auction_key"' + '%3A"' + myAuctionKey.split("%").join("%25") + '"%7D&page=1&maxCount=5&trackingType=2&withResults=true&catalog=ci&locale=en_US';

 

        var xhr = createRequest('GET', url);
        
        xhr.onload = function() {
            var text = xhr.responseText;
            var title = getTitle(text);
            console.log('Response from request to ' + url + ': ' + title);
        };
        xhr.onerror = function() {
            console.log('Woops, there was an error making the request.' + "Error: " + xhr1.statusText);
        };
        
        
        xhr.send();
        var obj = JSON.parse(xhr.responseText);
        var final = "";
        for(var i = 0; i < obj.response.results.length; i++) {
            final = final + "Equipment Name: " + obj.response.results[i].name + "<br>Is In Yard: " + obj.response.results[i].inYard + "<br>Serial Number: " + obj.response.results[i].sn + "<br>Comes With: " + obj.response.results[i].cw + "<br>Sales Day: " + obj.response.results[i].salesDay + "<br><br>";
        }
        
        document.write(final);
    }
}

module.exports.LuisHandler = LuisHandler;