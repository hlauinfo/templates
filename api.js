function Storify() {}

Storify.prototype = {
  getPermalink: function() {
    var permalink = null;
    
    if (window.location.hash.match(/.{0,15}storify\.com/)) {
      permalink = window.location.hash.substr(1);
      if(permalink.substr(0,2)=='//') permalink = 'http:'+permalink;
    }
    
    return permalink;
  },
  
  loadStory: function(storyPermalink, options, callback) {
    if(!callback && options) {
      callback = options;
      options = {};
    }

    var slug = storyPermalink.substr(storyPermalink.lastIndexOf('/') + 1);
	var identifier = storyPermalink.substr(19);
    
    jQuery.ajax({
      url: '//api.storify.com/v1/stories/'+identifier+'?per_page=1000&meta=true',
	  data: options,
      cache:true,
      success: callback,
      scriptCharset: "utf-8",
      contentType: "application/json; charset=utf-8",
      dataType: "jsonp",
      jsonpCallback: "cbtemplate" + slug.replace(/\-/g, ''),
      type: "GET"
    });
    
  },
  
  record: function(eventName, eventValue) {
    eventValue = eventValue || "";
    if(_gaq)
      _gaq.push(['_trackEvent', 'template', eventName, eventValue]);    
  },
  
  utils: {
    
    getImage: function(urlstr) {
      if(!urlstr) return false;
      domain = urlstr.replace(/^(https?:\/\/)(www\.)?/i,'');
      domain = domain.replace(/\/.*/g,'').toLowerCase();
      urlstr = urlstr.replace(/\/$/,'');
      var thumbnail_url=null;

      switch(domain) {
        case 'twitpic.com':
          hash = urlstr.substr(urlstr.lastIndexOf('/')+1);
          thumbnail_url = '//twitpic.com/show/large/'+hash;
          break;

        case 'instagr.am':
        case 'instagram.com':
          thumbnail_url = urlstr.replace('http://','//')+'/media';
          break;

        case 'yfrog.com':
          thumbnail_url = urlstr.replace('http://','//')+':iphone';
          break;

        case 'moby.to':
        thumbnail_url = urlstr+':view';
          break;

        case 'p.twimg.com':
          thumbnail_url = urlstr.replace('http://','//');
          break;

        case 'plixi.com': case 'tweetphoto.com': case 'pic.gd': case 'lockerz.com':
          // thumbnail_url = 'http://TweetPhotoAPI.com/api/TPAPI.svc/imagefromurl?size=medium&url=' + u;
          thumbnail_url = '//api.plixi.com/api/tpapi.svc/imagefromurl?size=medium&url='+urlstr;
          break;

        default:
          if(urlstr.match(/\.(jpg|png|gif)(\?.*)?$/))
            thumbnail_url = urlstr;
          break;
      }

      return thumbnail_url;
    },

		linkify: function(string) {
			var exp = /[^(href=")](\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
			return string.replace(exp,function(originalurl) {
				var urlstr = originalurl.replace(/https?:\/\/(www.)?/i,'');
				if(urlstr.length>30) urlstr = urlstr.substr(0,27)+'...';
				return " <a href='"+originalurl+"' target='_blank' rel='external'>"+urlstr+"</a>";
			});
		}
    
  }
  
};

// Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-10454056-14']);
_gaq.push(['_setDomainName', '.storify.com']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
