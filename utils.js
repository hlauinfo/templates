;(function($) {
  var jQuery = $;

  var DEBUG = true;

  debug = function(msg,obj) {

    if(!DEBUG)
      return false;

    if(window.location.href.indexOf("DEBUG") == -1 && !window.location.href.match(/localhost.storify.com/))
      return false;

    if(!obj)
      obj = '';

    if(window.console && console && console.log)
      console.log(msg,obj);

    return true;
  };
  
  error = function(msg,obj) {

    if(!DEBUG)
      return false;

    if(!obj)
      obj = '';

    if(window.console && console && console.error)
      console.error(msg,obj);

    return true;
  };

  require = function(jsfile,callback) {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src", jsfile);
    if(typeof callback == 'function') {
      script_tag.onload = callback;
      script_tag.onreadystatechange = function () { // IE
      if (this.readyState == 'complete' || this.readyState == 'loaded') {
        callback();
        }
      };
    }
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
  };

  String.prototype.truncate = function(length, chr, wordonly){
    var str = this;
    chr = chr || '…';
    if (str.length <= length) return str;
    str = str.substr(0, length - chr.length);
    if (wordonly) {
      str = str.substr(0, str.lastIndexOf(' '));
    }
    return str + chr;
  };

  String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
  };

  String.prototype.inArray = function(array) {
    for (var i=0, len=array.length; i < len; i++) {
      if(array[i]==this)
        return true;
    };
    return false;
  };
  
  String.prototype.linkify = function() {
    var exp = /[^(href=")](\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return this.replace(exp," <a href='$1' target='_blank' rel='external'>$1</a>");
  }
  
  String.prototype.sanitizeTags = function(allowed) {
    // Strips HTML and PHP tags from a string
    allowed = (((allowed || "") + "")
      .toLowerCase()
      .match(/<[a-z][a-z0-9]*>/g) || [])
      .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
      commentsAndPhpTags = /<![\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

    // Removing <style>.*</style> and <script>.*</script>
    var result = this.replace(/\n/g,'\uffff').replace(/(<style.*?>)(.*)(<\/style>)/gi, '').replace(/(<script.*?>)(.*)(<\/script>)/gi, '').replace(/\uffff/g,'\n');

    result = result.replace(commentsAndPhpTags, '').replace(tags, function($0, $1){
      if ($0.toLowerCase().substring(0,2) == '<a'){
        var match = $0.match(/href=[\'"]?([^\'" >]+)/i);
        if (match) {
          var href= match[1];
          $0 = $0.indexOf(' ') > -1 ? $0.substr(0,$0.indexOf(' '))+'>' : $0;
          $0 = $0.substring(0, $0.length-1) + ' href="' + href + '">'; 
        }       
      } else {
        $0 = $0.indexOf(' ') > -1 ? $0.substr(0,$0.indexOf(' '))+'>' : $0;
      }
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
    
    return result;
  };

  if(typeof Storify!='object') {
    Storify = {};
  }
  if(typeof Storify.utils!='object') {
    Storify.utils = {};
  }
  

  jQuery(window).unbind('storifyEvent'); // Avoiding conflict on storify.com/* pages where we already bind that event
  jQuery(window).bind('storifyEvent',function(event) {
    debug("storifyEvent> "+event.name,event.metadata);
  });

  Storify.recordEvent = function(event, value, metadata) {

    if(metadata) {
      metadata.value = value;
    }
    else {
      metadata = {
        view:window.location.href,
        value:value
        };
    }
    
    jQuery(window).trigger({
      type:'storifyEvent',
      name:event,
      metadata: metadata
      });
  } 

  Storify.smart_truncate = function(str, n){
      if(typeof str != 'string') return '';

      var toLong = str.length>n,
          s_ = toLong ? str.substr(0,n-1) : str;
      s_ = toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
      return  toLong ? s_ +'...' : s_;
   }
  
  Storify.getLinkToElement = function(elementPermalink) {
    if(!elementPermalink) return false;
    
    var linkUrl, element;

    // We make sure the elementPermalink exists:
    element = $("li.element[permalink='"+elementPermalink+"']");
    if(!element) return false;
    
    // If we are creating a new story, we use the permalink of the story dom object
    if(window.location.href.match(/\/story\/new$/))
      linkUrl = $("#story").attr("data-permalink");
    // If we are currently editing the story, we use the story url, otherwise we use current window url
    linkUrl = (window.location.href.match(/\/edit$/)) ? window.location.href.replace(/\/edit$/,'') : window.top.location.href;

    if(linkUrl.indexOf('#')>10)
      linkUrl = linkUrl.replace(/#.*/,'');
      
    linkUrl+='#storify/p'+element.attr("id").substr(5);
		debug("Linkurl: ",linkUrl);

    return linkUrl;
  }

  Storify.utils.queryStringToObject = function(queryString) {
    if(!queryString) return {};
    if(queryString.indexOf('=')===-1) return {};
    
    var paramsArray = queryString.split('&');
    var params = {};
    for (var i=0, len=paramsArray.length; i < len; i++) {
      var p = paramsArray[i];
      var r = p.split('=');
      if(r.length>1)
      params[r[0]] = r[1];
    };
    return params;
  }
  
  Storify.utils.alert = function(msg) {
    Storify.recordEvent("alert",msg);
    alert(msg);
  }
  
  Storify.utils.cloneObject = function(obj) {
    return $.extend(true, {}, obj);
  };
  
  /* Takes a date as a string and
   * returns the date as a (int) timestamp in epoch (in number of seconds, not ms)
   */
  Storify.utils.getDate = function(dateStr) {
    var d;
    dateStr = (typeof dateStr == 'undefined') ? '' : ''+dateStr; // Make sure it is a string
    if(dateStr.length > 3 && dateStr.substr(10,1)=="T") {
      dateStr = dateStr.substring(0,19).replace('T',' ').replace(/\-/g,'/');
      d   = new Date(dateStr);
      d   = Math.round((d.getTime() - (d.getTimezoneOffset()*60*1000)) /1000);
    }
    else {
      if(dateStr.length==10)
        return dateStr;
        
      d   = (dateStr.length > 0) ? new Date(dateStr) : new Date();
      // Math.round((new Date(tweet.created_at)).getTime()/1000);
      d   = Math.round((d.getTime()) /1000);
    }
    return d;
  };
  
  Storify.utils.displayNumber = function(number) {
    var number = parseInt(number), res='';
    if(number > 0) {
      if(number>1000000) 
        return Math.round(number/100)/10+"M";
      if(number>1000) 
        return Math.round(number/100)/10+"k";
      return number;
    }
    return false;
  };
  
  Storify.utils.getDomain = function(url) {
  
    var domain        = url.replace(/^(https?:\/\/)(www\.)?/i,'');
    domain          = domain.replace(/\/.*/g,'');
  
    return domain;
  
  };

  Storify.utils.getDomainName = function(url) {
  
    var domain = Storify.utils.getDomain(url);
  
    return domain.substr(0,domain.indexOf('.'));
  
  };
  
  Storify.utils.isiPad = function() {
    return (navigator.userAgent.match(/iPad/i));
  }

  var permalink = window.location.href, env='';
  if(permalink.indexOf('storify.com') > -1) {
    env = permalink.substr(7,permalink.indexOf('storify.com')-8);
  }
  
  if(typeof STORIFY_BASE_URL == 'undefined') {
    
    STORIFY_BASE_URL = '';

    switch(env) {
      case 'dvl':
        STORIFY_BASE_URL = 'http://dvl.storify.com';
        break;

      case 'localhost':
        STORIFY_BASE_URL = 'http://localhost.storify.com:3000';
        break;

      case "staging":
        STORIFY_BASE_URL = 'http://staging.storify.com';
        break;

      case "app1":
        STORIFY_BASE_URL = 'http://app1.storify.com';
        break;

      default:
        STORIFY_BASE_URL = 'http://storify.com';
        break;
    } 
  }

  Storify.utils.base_url = STORIFY_BASE_URL;
  
  Storify.utils.getExtension = function(u) {
     if(!u.match(/\.[a-z]{3,4}$/i))
       return false;

     return u.substr(u.lastIndexOf('.')+1).toLowerCase();
   };

  Storify.utils.getImage = function(urlstr) {
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
  };
  
  Storify.utils.proxy_image = function(urlstr, maxWidth, maxHeight) {
    var resize, proxy_url;

    if(typeof urlstr != 'string') return '';

    if(maxWidth || maxHeight) resize = true;

    // We only resize Twitter images if we need less than 320px wide
    if(urlstr.match(/twimg\.com\//) && maxWidth > 360) 
      resize = false;

    if(!resize && urlstr.substr(0,8)=='https://') return urlstr;
    if(!resize && urlstr.substr(0,2)=='//') return urlstr;

    // If we are in http mode and if we don't use the resize feature, we don't need the proxy
    if(!resize && typeof window != 'undefined' && window.location && window.location.href && window.location.href.substr(0,7)=='http://' && !urlstr.match(/resize=/))
      return urlstr;  

    proxy_url = '//i.embed.ly/1/display/resize?key=1e6a1a1efdb011df84894040444cdc60&url='+encodeURIComponent(urlstr);

    if(resize) {
      if(maxWidth) proxy_url += '&width='+maxWidth;
      if(maxHeight) proxy_url += '&height='+maxHeight;
    }

    return proxy_url;
  };

  Storify.utils.parseFirstURL = function(str) {
    var urlexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

    var matches = str.match(urlexp);

    if(!matches)
      return;

    return matches[0];
  };

  Storify.utils.require = function(jsfile,callback) {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src", jsfile);
    if(typeof callback == 'function') {
      script_tag.onload = callback;
      script_tag.onreadystatechange = function () { // IE
      if (this.readyState == 'complete' || this.readyState == 'loaded') {
        callback();
        }
      };
    }
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
  };

  Storify.utils.getUrls = function(str) {
    var urlexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    
    return str.match(urlexp);
  };

  Storify.utils.isURL = function(s) {
    var regexp = /http:\/\/[A-Za-z0-9\.-]{3,}\.[A-Za-z]{3}/;
      return regexp.test(s);
  };
  
  Storify.utils.getMetadata = function(u,elementClass,callback) {
  
    if(!callback && typeof elementClass == 'function') {
      callback = elementClass;
      elementClass = 'all';
    }
    
    if(elementClass=='image') {
      var image;
      if(image = Storify.utils.getImage(u))
        callback({shorturl: u,thumbnail_url:image,elementClass:'image'});
      else
        return false;
    }
    else {        
        debug('calling embedly for '+u);
        $.getJSON('http://pro.embed.ly/1/objectify?key=1e6a1a1efdb011df84894040444cdc60&callback=?',{url:u},function(json) {
          json.shorturl = u;
          debug('Embedly for '+u,json);
          callback(json);
      }); 
    }
    return true;
  };

  String.prototype.parseURL = function(elementData) {
    var str = this;
    var elementUrls = [];
    if(elementData) {
      if (typeof elementData.urls !== 'undefined') elementUrls = elementUrls.concat(elementData.urls);
      if (typeof elementData.media !== 'undefined') elementUrls = elementUrls.concat(elementData.media);
    }

    if (elementUrls.length > 0) {
      for (var i=0; i < elementUrls.length; i++) {
        var re = new RegExp(elementUrls[i].display_url + '|' + elementUrls[i].url + '|' + elementUrls[i].expanded_url);
        str = str.replace(re, function (originalurl) {
          return '<a href="' + elementUrls[i].url + '" target="_blank" rel="external nofollow" title="Open this link in a new window">' + elementUrls[i].display_url + '</a>';
        })
      }
    }

    return str;

    // return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(originalurl) {
    // 	var urlstr = originalurl.replace(/https?:\/\/(www.)?/i,'');
    // 	if(urlstr.length>30) urlstr = urlstr.substr(0,27)+'...';
    // 	return '<a href="'+originalurl+'" target="_blank">'+urlstr+'</a>';
    // });
  };

  String.prototype.parseUsername = function() {
    return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
      var username = u.replace("@","")
      return '<a href="http://twitter.com/'+username+'" target="_blank">@'+username+'</a>';
    });
  };

  String.prototype.parseHashtag = function() {
    return this.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
      var tag = t.replace("#","")
      return '<a href="http://twitter.com/search?q=%23'+tag+'" target="_blank">#'+tag+'</a>';
    });
  };

  String.prototype.parseTweet = function(elementData) {
    return this.parseURL(elementData).parseUsername().parseHashtag();
  }

  function awesm_share(channel, url, title, content) {
            
    /* You must specify a valid awe.sm API Key */
    var awesm_api_key = 'ee29be1333cc45d8c6545341be8df5a4ab9126f3566b6777ad98ab1a2863ac78';

    /* You can optionally specify a 'Source' value for LinkedIn (e.g.
           * the name of your site). If left blank, it will be user-defined.
     */
    var linkedin_source = '';
      
    /* This value corresponds to Tool/create_type on awe.sm. You can
     * optionally change it to something more specific to your site.
     * However, please use the recommended construction of {site}-{tool}.
     */
    var awesm_tool = 'awesm-share-js';
      
    /* This function is used to search for awe.sm Parent parameters in the
     * current page URL. You must have this feature enabled in your awe.sm
     * Account Settings for the awe.sm Parent parameters to be present.
     */
    var getUrlVars = function() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    };
      
    /* If no URL is specified, use the current page address */
    if (typeof(url) == 'undefined' || url == '') {
      url = encodeURIComponent(location.href);
    } else {
      url=encodeURIComponent(url);
    }
    
    /* If no title is specified, use the current page title */
    if (typeof(title) == 'undefined' || title == '') {
      title = encodeURIComponent(document.title);
    } else {
      title=encodeURIComponent(title);
    }
      
    /* If no content is specified, use title */
    if (typeof(content) == 'undefined' || content == '') {
      content = title;
    } else {
      content=encodeURIComponent(content);
    }     
    
    /* Configure the channel-specific information */
    switch (channel) {
      case 'twitter':
          var awesm_channel = 'twitter';
        /* Make sure the content is <120 characters so there's room for the URL */
        if (decodeURIComponent(content).length > '120') {
          content = decodeURIComponent(content).substring(0,117) + '...'; 
          content = encodeURIComponent(content);
        }
        var awesm_destination = 'http://twitter.com/home?status=' + content + '+AWESM_TARGET';
        var window_specs = '';
          break;
      case 'facebook':
          var awesm_channel = 'facebook-post';
        var awesm_destination = 'http://www.facebook.com/sharer.php?u=AWESM_TARGET&t=' + title;
        var window_specs = 'toolbar=0, status=0, width=626, height=436';
          break;
      case 'myspace':
        var awesm_channel = 'myspace';
        var awesm_destination = 'http://www.myspace.com/index.cfm?fuseaction=postto&u=AWESM_TARGET&t=' + title + '&c=' + content;
        var window_specs = 'toolbar=0, status=0, width=825, height=725';
          break;
      case 'linkedin':
        var awesm_channel = 'linkedin';
        var awesm_destination = 'http://www.linkedin.com/shareArticle?mini=true&url=AWESM_TARGET&title=' + title + '&summary=' + content;
        if (linkedin_source !== '') {
          awesm_destination += '&source=' + encodeURIComponent(linkedin_source);
        }
        var window_specs = 'toolbar=0, status=0, width=550, height=570';
          break;
    }
      
    /* Construct the URL for the awe.sm Share API (see http://developers.awe.sm) */
    var awesm_shareit = 'http://create.awe.sm/url/share?version=1&api_key=' + awesm_api_key +
            '&target=' + url + 
            '&share_type=' + awesm_channel + 
            '&create_type=' + awesm_tool + 
            '&destination=' + encodeURIComponent(awesm_destination); 
      
    /* Check for an awe.sm Parent parameter in the current page URL, and
     * add it to the awe.sm Share API URL if present. You must have this
     * feature enabled in your awe.sm Account Settings for the awe.sm
     * Parent parameter to be present.
     */
    var pageParams = getUrlVars();
    if ( pageParams['awesm'] ) {
      awesm_shareit += '&awesm_parent=' + pageParams['awesm'];
    }
      
    /* Launch the share UI in a new window of the correct size*/
    window.open(awesm_shareit, '_blank', window_specs);
  }

  /* 
   * Auto Expanding Text Area (1.2.2)
   * by Chrys Bader (www.chrysbader.com)
   * chrysb@gmail.com
   *
   * Special thanks to:
   * Jake Chapa - jake@hybridstudio.com
   * John Resig - jeresig@gmail.com
   *
   * Copyright (c) 2008 Chrys Bader (www.chrysbader.com)
   * Licensed under the GPL (GPL-LICENSE.txt) license. 
   *
   *
   * NOTE: This script requires jQuery to work.  Download jQuery at www.jquery.com
   *
   */
 
  (function(jQuery) {
      
    var self = null;
 
    jQuery.fn.autogrow = function(o)
    { 
      return this.each(function() {
        new jQuery.autogrow(this, o);
      });
    };
  

      /**
       * The autogrow object.
       *
       * @constructor
       * @name jQuery.autogrow
       * @param Object e The textarea to create the autogrow for.
       * @param Hash o A set of key/value pairs to set as configuration properties.
       * @cat Plugins/autogrow
       */
  
    jQuery.autogrow = function (e, o)
    {
      this.options        = o || {};
      this.dummy          = null;
      this.interval       = null;
      this.line_height      = this.options.lineHeight || parseInt(jQuery(e).css('line-height'));
      this.min_height       = this.options.minHeight || parseInt(jQuery(e).css('min-height'));
      this.max_height       = this.options.maxHeight || parseInt(jQuery(e).css('max-height'));;
      this.textarea       = jQuery(e);
    
      if(this.line_height == NaN)
        this.line_height = 0;
    
      // Only one textarea activated at a time, the one being used
      this.init();
    };
  
    jQuery.autogrow.fn = jQuery.autogrow.prototype = {
      autogrow: '1.2.2'
    };
  
    jQuery.autogrow.fn.extend = jQuery.autogrow.extend = jQuery.extend;
  
    jQuery.autogrow.fn.extend({
             
      init: function() {      
        var self = this;      
        this.textarea.css({overflow: 'hidden', display: 'block'});
        this.textarea.bind('focus', function() { self.startExpand() } ).bind('blur', function() { self.stopExpand() });
        this.checkExpand(); 
      },
             
      startExpand: function() {       
        var self = this;
        this.interval = window.setInterval(function() {self.checkExpand()}, 400);
      },
    
      stopExpand: function() {
        clearInterval(this.interval); 
      },
    
      checkExpand: function() {
      
        if (this.dummy == null)
        {
          this.dummy = jQuery('<div></div>');
          this.dummy.css({
                          'font-size'  : this.textarea.css('font-size'),
                          'font-family': this.textarea.css('font-family'),
                          'width'      : this.textarea.css('width'),
                          'padding'    : this.textarea.css('padding'),
                          'line-height': this.line_height + 'px',
                          'overflow-x' : 'hidden',
                          'position'   : 'absolute',
                          'top'        : 0,
                          'left'     : -9999
                          }).appendTo('body');
        }
      
        // Strip HTML tags
        var html = this.textarea.val().replace(/(<|>)/g, '');
      
        // IE is different, as per usual
        if ($.browser.msie)
        {
          html = html.replace(/\n/g, '<BR>new');
        }
        else
        {
          html = html.replace(/\n/g, '<br>new');
        }
      
        if (this.dummy.html() != html)
        {
          this.dummy.html(html);  
        
          if (this.max_height > 0 && (this.dummy.height() + this.line_height > this.max_height))
          {
            this.textarea.css('overflow-y', 'auto');  
          }
          else
          {
            this.textarea.css('overflow-y', 'hidden');
            if (this.textarea.height() < this.dummy.height() + this.line_height || (this.dummy.height() < this.textarea.height()))
            { 
              this.textarea.animate({height: (this.dummy.height() + this.line_height) + 'px'}, 100);  
            }
          }
        }
      }
     });
  })(jQuery);
})(STORIFY_JQUERY);
