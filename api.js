function Storify() {}

Storify.prototype = {
  getPermalink: function() {
    var permalink = null;
    
    if (window.location.hash.match(/http\:\/\/.*storify\.com/)) {
      permalink = window.location.hash.substr(1);
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
      url: 'http://api.storify.com/v1/stories/'+identifier+'?per_page=1000',
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
    
    getImage: function(u) {
      if(!u) return false;
      domain = u.replace(/^(http:\/\/)(www\.)?/i,'');
      domain = domain.replace(/\/.*/g,'').toLowerCase();
      u = u.replace(/\/$/,'');
      var thumbnail_url=null;

      switch(domain) {
        case 'twitpic.com':
          hash = u.substr(u.lastIndexOf('/')+1);
          thumbnail_url = 'http://twitpic.com/show/large/'+hash;
          break;

        case 'instagr.am':
          thumbnail_url = u+'/media';
          break;

        case 'yfrog.com':
          thumbnail_url = u+':iphone';
          break;

        case 'moby.to':
        thumbnail_url = u+':view';
          break;

        case 'plixi.com': case 'tweetphoto.com': case 'pic.gd': case 'lockerz.com':
          // thumbnail_url = 'http://TweetPhotoAPI.com/api/TPAPI.svc/imagefromurl?size=medium&url=' + u;
          thumbnail_url = 'http://api.plixi.com/api/tpapi.svc/imagefromurl?size=medium&url='+u;
          break;
      }

      return thumbnail_url;
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