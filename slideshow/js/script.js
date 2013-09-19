/*
PARSE URL, USERNAMES AND HASHTAGS FROM A TWEET 
http://www.simonwhatley.co.uk/parsing-twitter-usernames-hashtags-and-urls-with-javascript	
*/

if (!Object.keys) {
	Object.keys = function(o) {
		if (o !== Object(o)) {
			throw new TypeError('Object.keys called on non-object');
		}
		var ret=[], p;
		for (p in o) {
			if (Object.prototype.hasOwnProperty.call(o,p)) {
				ret.push(p);
			}
		}
		return ret;
	}
}

/* SHARING */

function shareOnFacebook(url) {
	window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(url),'sharer','toolbar=0,status=0,resizable=1,width=626,height=436');
}
function shareOnTwitter(url, status) {
	window.open('http://twitter.com/intent/tweet?original_referer='+encodeURIComponent(url)+'&text='+encodeURIComponent(status)+'&url='+encodeURIComponent(url),'sharer','toolbar=0,status=0,resizable=1,width=626,height=436');
}

/* FUNCTIONS */

var total;

function centerItem(item, type) {
	var ml = item.outerWidth()/-2;
	var mt = item.outerHeight()/-2;
	var css = {};
	switch (type) {
		case 'verticalOnly' : css = { top: '50%', marginTop: mt }; break;
		case 'horizontalOnly' : css = { left: '50%', marginLeft: ml }; break;
		case 'both' : css = { left: '50%', top: '50%', marginLeft: ml, marginTop: mt };
	}
	item.css(css);
}

function onbefore(curr, next, opts, fwd) {
	$(next).show();
	centerItem($(next).find('.quote'), 'both');
	centerItem($(next).find('.link'), 'both');
	centerItem($(next).find('.textP'), 'verticalOnly');
}

function onafter(curr, next, opts) {
	var step = $(next).index()+1;
	updateStep(step);
}

function onPrevNextEvent(fwd, index) {
  if(index==0) return;
	(fwd) ? storify.record("next") : storify.record("prev");  
}

function replaySlideshow() {
	$('#toolbar .pause').hide();
	$('#toolbar .play').show();
	$("#twitterShow").cycle(0);
}

function resumeSlideshow() {
	$('#toolbar .pause').show();
	$('#toolbar .play').hide();
	$("#twitterShow").cycle("resume");
}

function pauseSlideshow() {
	$('#toolbar .pause').hide();
	$('#toolbar .play').show();
	$("#twitterShow").cycle("pause");
}

function toggleSlideshow() {
	$('#toolbar .pause').toggle();
	$('#toolbar .play').toggle();
	$("#twitterShow").cycle("toggle");
}

function showLoop() {
	$('.pager .total').text(total-1);
	$('#toolbar .pause, #toolbar .play, #toolbar .previous, #toolbar .next').hide();
	$('#toolbar .loop').show();
	$("#twitterShow").cycle("resume");
}

function hideLoop() {
	$('.pager .total').text(total);
	pauseSlideshow();
	$('#toolbar .loop').hide();
	$('#toolbar .previous, #toolbar .next').show();
	clearTimeout(back);
}

function penultimateLoop() {
	$('#twitterShow').cycle("pause");
	back = setTimeout(function() {
		$('#twitterShow').cycle(0);
		$('#twitterShow').cycle("resume");
	}, 5000);
}

var loop = false, back;

function toggleLoop() {
	var step = parseInt($('.current').text());
	if (loop) {
		hideLoop();
		if (step == 1) {
			$('#toolbar .previous').hide();
		}
	}
	else {
		if (step < total) {
			showLoop();
			if (step == total-1) {
				penultimateLoop();
			}
		}
	}
	loop = !loop;
}

function checkKey(e) {
	var key = (e.keyCode ? e.keyCode : e.which);

	if (loop && key != 76) {
		hideLoop();
		loop = !loop;
	}
	switch (key) {
		case 37: // left
			$("#twitterShow").cycle("prev");
			break;
		case 39: // right
			$("#twitterShow").cycle("next");
			break;
		case 76: // l
			toggleLoop();
			break;
		case 80: // p
			toggleSlideshow();
			break;
		
	}
}

$(document).keydown(checkKey);

$("#twitterShow").touchwipe({
	wipeLeft: function() {
		$("#twitterShow").cycle("next");
	},
	wipeRight: function() {
		$("#twitterShow").cycle("prev");
	}
});

var hash = window.location.hash;
var permalink_token = hash.split("#")[1];

$(".timeago").timeago();

var previous_id = '';
var previous_length = 0;

function getStoryElementHTML(element) {
	var type = (element.type == 'quote' && element.source.name != null) ? element.source.name : element.type;
	var layout;
  	
	switch (element.type) {
    case "video":
      if (element.data.video.src) {
				var src = element.data.video.src;
				if (element.source.name == 'instagram')
					src = "//api.embed.ly/1/video?width=360&height=360&mp4=" + src + "&poster=" + element.data.video.thumbnail + "&schema=instagram";
          
				layout = Templates.videoWithSource({
          type: type,
          videoSrc: src.replace('http://','//'),
          caption: element.data.video.title,
          permalink: element.permalink,
          attrName: element.attribution.name
        });
      }
      else {
				layout = Templates.videoNoSource({type: type, videoHTML: element.data.html});
      }
			break;
			
		case "image":
			if (element.source.name == 'twitter')
			{
        var text = element.data.quote.text;
        var tweet_id = element.permalink.substr(element.permalink.lastIndexOf('/')+1);

        if(element.meta && element.meta.entities) 
          text = text.parseTweet(element.meta.entities);
        else 
          element.meta = {};
          
				layout = Templates.quote.twitterImage({
					type: type, 
					background: background,
					imageUrl: Storify.utils.proxy_image(element.data.image.src),
					text: text, 
					username: element.attribution.username,
					name: element.attribution.name,
					thumbnail: Storify.utils.proxy_image(element.attribution.thumbnail),
					name: element.attribution.name,
					timestamp: moment(element.posted_at).fromNow(),
          tweet_id: tweet_id,
					permalink: element.permalink
				});
			}
			else
			{
				var data = {
					type: type, 
          imgUrl: Storify.utils.proxy_image(element.data.image.src),
					srcName: element.source.name,
					caption: (element.data.image.caption || ''),
				 	permalink: element.permalink,
				 	attrName: element.attribution.name
				};

				layout = Templates.image(data);
			}

			break;
			
		case "text":
			layout = Templates.text({type: type, text: element.data.text.sanitizeTags('<a>')});
			break;
		
		case "link":
			layout = Templates.link({
				type: type, 
				linkDesc: element.data.link.description,
				permalink: element.permalink,
				linkThumb: Storify.utils.proxy_image(element.data.link.thumbnail),
				attrName: element.attribution.name,
				timestamp: moment(element.posted_at).fromNow()
			});
			break;
		
		case "quote":
			var source = (element.source.name != null) ? element.source.name : 'other';
			
			switch (source) {
				case 'twitter':
					element.metadata = element.metadata || {};
					element.meta = element.meta || {};
					element.metadata.user = element.metadata.user || {};
					element.metadata.user.name = element.metadata.user.name || '';

					var tweet_id = element.permalink.substr(element.permalink.lastIndexOf('/')+1);

					var urls, image_url;
					var imageShortURL = Storify.utils.parseFirstURL(element.data.quote.text);
					var image_url = (imageShortURL) ? Storify.utils.getImage(imageShortURL) : null;
					
					if (element.meta && element.meta.user != null) {
						var repeat = (element.meta.user.profile_background_tile == true) ? 'repeat' : 'no-repeat';
						var bg_image =  (element.meta.user.profile_background_image_url) ? ' url('+Storify.utils.proxy_image(element.meta.user.profile_background_image_url)+') '+repeat : '';
						var bg_color = (element.meta.user.profile_background_color) ? '#'+element.meta.user.profile_background_color : '#000';

						var background = 'background:'+bg_color+bg_image+';';
					}
					else {
						var background = 'background:#000;';
					}

					if (image_url) {				
						layout = Templates.quote.twitterImage({
							type: type, 
							background: background,
							imageUrl: Storify.utils.proxy_image(image_url),
							text: element.data.quote.text.parseTweet(element.meta.entities),
							username: element.attribution.username,
							thumbnail: Storify.utils.proxy_image(element.attribution.thumbnail),
							name: element.source.name,
							permalink: element.permalink,
						});
					}
					else {
						layout = Templates.quote.twitter({
							type: type, 
							background: background,
							text: element.data.quote.text.parseTweet(element.meta.entities),
							username: element.attribution.username,
							thumbnail: Storify.utils.proxy_image(element.attribution.thumbnail),
							name: element.attribution.name,
							permalink: element.permalink,
							timestamp: moment(element.posted_at).fromNow(),
							tweet_id: tweet_id
						});
					}
					break;
				
				case 'facebook':
				case 'other':
					layout = Templates.quote.other({
						type: type, 
						text: element.data.quote.text,
						permalink: element.permalink,
						name: element.attribution.name,
						timestamp: moment(element.posted_at).fromNow()
					});
					break;
			} 
			
			break;
			
		default:
			return false;
	}
	
	return layout;
}

function getTitle(story) {
	var html = Templates.title({story : story})
	return $(html);
}

function resizeShow() {
	var h = $(window).height();
	var w = $(window).width();
	
	$('#twitterShow, .slideWrapper').css({
		height: h - $('#title').height() - $('#bottom').height(),
		width: w
	});
}



function resizeTitle() {
	var w = $(window).width();
	
	$('#title .title').css('width', w - $('#title .user').width() - 2); // fix that. This 2 is ugly
}

function loading(action) {
	if (action == 'show') {
		$('body').append('<div id="loading">Loading...</div>');
	}
	else if (action == 'hide') {
		$('#loading').remove();
	}
}

function updateStep(step) {
	$('.replay').hide();
	if (!loop) {
		$('.previous, .next').show();
	}
	if (step == 1) {
		$('.previous').hide();
	}
	if (loop && step == total-1) {
		penultimateLoop();
	}
	if (step == total) {
		$('.next').hide();
		$('.lastElement .field a').zclip({
			path: 'swf/ZeroClipboard.swf',
			copy: $('.lastElement .field input').val(),
			afterCopy: function() {
				$('.lastElement .field .copied').show();
				setTimeout(function() {
					$('.lastElement .field .copied').fadeOut(500);
				}, 1000);
			}
		});
		$('#toolbar .replay').show();
		pauseSlideshow();
	}
	$('.pager .current').text(step);
	window.location.hash = step;
}

var storyurl;

function init() {
	storyurl = STORIFY_PERMALINK;
	resizeShow();
	
	loading('show');
	storify.loadStory(storyurl,{metadata:1}, function(data) {
    var story = data.content;
    if(story.author.paid_plan=='free') $('#poweredBy a').addClass("free").attr('title','Free version of Storify');

    var recordViewHTML = '<img src="//stats.storify.com/record/view.gif?sid='+story.sid+'&referer='+encodeURIComponent(window.document.referrer)+'" width="1" height="1" style="display:none;" />';
		$('#title').append(getTitle(story)).append(recordViewHTML);
		total = Object.keys(story.elements).length+1;
		$('.pager .total').text(total);
		
		var hash = parseInt(window.location.hash.substr(1));
		var start = (hash > 0 && hash <= total) ? hash : 1;
		
		updateStep(start);

		$('#title, #bottom').show();
		
		resizeTitle();

		document.title = story.title + ' — Storify [Slideshow]';
		
		if (window != window.top) { // in iframe?
			$('#toolbar .fullscreen').attr('href', storyurl + '/slideshow').show();
			$('#toolbar .replay').addClass('replay_embed');
		}

		if (previous_id != story.elements[0].permalink || previous_length != story.elements.length) {
			$("a.user").attr("href", "http://storify.com/" + story.author.username);
			$("a.user").text(story.author.username);
			$("#branding .userImage").remove();
			$("#branding h2").before("<img src=" + Storify.utils.proxy_image(story.author.avatar,32) + ' class="userImage" width="32" style="float: right;max-height:32px"/>');

			var hasVine = false;
			$.each(story.elements, function(index, element) {
				if (element.type == 'video' && element.data.video.is_vine)
					hasVine = true;
				
				var html = getStoryElementHTML(element);
				if (html) $("#twitterShow").append(html);
			});
			
			// var last = Templates.lastSlide({ storyurl: storyurl, title: data.title });

			var last = '<div class="slideWrapper lastElement"><div class="lastElementInner">';
			last += '<h2>Share this story</h2><div class="buttons"><a href="#" class="facebook"><span>Share on Facebook</span></a><a href="#" class="twitter"><span>Share on Twitter</span></a></div>';
			last += '<h2>Embed this slideshow</h2><div class="field"><input type="text" name="script" value="" readonly="readonly"/><a href="#" class="copy">Copy</a><div class="copied">Copied!</div></div>';
			last += '<h3>Create your own stories at <a href="http://www.storify.com" target="_blank">storify.com</a> &rarr;</h3>';
			last += '</div></div>';
			
			$("#twitterShow").append(last);

      // xdamman: We can't have the share to facebook button in twitter cards
      if(window.location.protocol == 'https:') {
        $('.buttons .facebook').hide();
        $('.buttons .twitter').css('margin-left','13%');
      }
			
			$('.lastElement .field input').val('<script src="'+storyurl+'.js?template=slideshow"></script><noscript><a href="'+storyurl+'" target="_blank">View "'+data.title+'" on Storify</a></noscript>');
			$('.lastElement .field input').focus(function() {
				$(this).select();
			});
			
			$('.lastElement .facebook').click(function() {
				var shareurl = '';
				try {
					shareurl = window.top.location.href;
				}
				catch(e) {
					shareurl = storyurl + '/slideshow';
				}
				shareurl = shareurl || storyurl + '/slideshow';
				shareOnFacebook(shareurl);
				return false;
			});
			$('.lastElement .twitter').click(function() {
				var shareurl = '';
				try {
					shareurl = window.top.location.href;
				}
				catch(e) {
					shareurl = storyurl + '/slideshow';
				}
				shareurl = shareurl || storyurl + '/slideshow';

				var username = story.author.username;
				if (story.author.twitter_username && story.author.twitter_username !== '') username = '@' + story.author.twitter_username;
				shareOnTwitter(shareurl, story.title+', the @storify slideshow by ' + username);
				return false;
			});
			$('.slideWrapper.textElement p span a').click(function() {
				window.open($(this).attr('href'));
				return false;
			});
			
			function startSlideshow() {
				loading('hide');
				
				$("#twitterShow").cycle({
					fx: 'scrollHorz',
					timeout: 5000,
					speed: 300,
					nowrap: 1,
					fit: 1,
					before: onbefore,
					after: onafter,
					onPrevNextEvent: onPrevNextEvent,
					startingSlide: start-1
				});
	
				$("#twitterShow").cycle("pause");
			}
			
			if (hasVine) {
				// Create the slideshow again using the new tweets, and fade it back in
				// Hide the slides until everything is loaded, but using visiblity: hidden instead of display: none
				// since Vine needs the width of its iframe which it can't get if display: none is set
				$('.slideWrapper').css('visibility', 'hidden');
				$(window).load(function() {
					// show the slides again, and initialize the actual slideshow
					$('.slideWrapper').css('visibility', 'visible');
					startSlideshow();
				});
			} else {
				startSlideshow();
			}
		}

		previous_id = data.content.elements[0].permalink;
		previous_length = data.content.elements.length;
		
	});

}

// general events

$(document).ready(init);
$(window).resize(function() {
	resizeShow();
	resizeTitle();
	centerItem($('.quote:visible'), 'both');
	centerItem($('.link:visible'), 'both');
	centerItem($('.textP:visible'), 'verticalOnly');
});

$('#toolbar .previous').click(function() {
	$("#twitterShow").cycle("prev");
	return false;
});
$('#toolbar .next').click(function() {
	$("#twitterShow").cycle("next");
	return false;
});
$('#toolbar .play').click(function() {
	resumeSlideshow();
	return false;
});
$('#toolbar .pause').click(function() {
	pauseSlideshow();
	return false;
});
$('#toolbar .replay').click(function() {
	replaySlideshow();
	return false;
});
$('#toolbar .loop').click(function() {
	hideLoop();
	return false;
});

// fixes :hover pseudoclass over iframes in IE < 8
if ($.browser.msie && $.browser.version < 9) {
  $('.videoElement').live('mouseenter', function() {
    $(this).addClass('hover');
  }).live('mouseleave', function() {
    $(this).removeClass('hover');
  });
}