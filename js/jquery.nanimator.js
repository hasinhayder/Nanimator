(function($){
	var objs =0;
	var anims=[];
	var counters=[];
	var opts = {};
	var defaults = {
		cancel:false,
		reanimate:false, //set this param to true in cas eyou add a dynamic element in the container and want to regenerate the mapping
		delay:true
	}
	var animationDictionary = {
		top:{
			axis:"y",
			factor:-1
		},
		bottom:{
			axis:"y",
			factor:1
		},
		left:{
			axis:"x",
			factor:-1
		},
		right:{
			axis:"x",
			factor:1
		},
		none:{
			axis:0,
			factor:0
		}
	}
	$.fn.nanimate = function(options){	
		opts = $.extend(defaults,options);
		
		//set the dummy id just for reference
		if($(this).attr("id")==""){
			//assign a temporary id
			objs+=1;
			id = "nanimated"+objs;
			$(this).attr("id",id);
		}
		else{
			id = $(this).attr("id");
		}
		//initiate the container variables
		anims[id]=[];
		counters[id]=0;


		// Find the elements to animate. Add them in a list, but dont do it again if the list is already prepared
		if(anims[id].length==0 || opts.reanimate){
			//fire the custom event that traversing through elements is now started
			$(this).trigger("nanimate.calculating");
			$(this).find(".nanimate").each(function(){
				var distance = $(this).data("distance");
				var direction = $(this).data("direction");
				var time = $(this).data("time");
				var fade = $(this).data("fade");
				var duration = $(this).data("duration");
				var release = $(this).data("release");
				var ease = $(this).data("ease");
				anims[id].push({
					obj:$(this),
					distance:distance,
					direction:direction,
					time:time,
					fade:fade,
					duration:duration,
					release:release,
					ease:ease
				});
				$(this).css({opacity:0});

			});
			$(this).trigger("nanimate.calculated");
		}
		// console.log(anims,counters);

		$(this).trigger("nanimate.started");
		$.fn.animationChain(id,counters[id]);

	}

	$.fn.animationChain = function(id, i){
		if(opts.cancel) return;
		if(!anims[id][i]){
			$("#"+id).trigger("nanimate.finished");
			//$(anims[i-1].p).find(".test").transition({opacity:0,delay:500});//reset
			// console.log("End");
			return;
		}

		var delay = 0;
		if(i==0 && opts.delay) delay=1000;

		var element = anims[id][counters[id]];
		var moveAmount = element.distance * animationDictionary[element.direction].factor;
		var moveAxis =  animationDictionary[element.direction].axis;
		var transitionTime = element.time;
		var fade = element.fade;
		var duration = element.duration;
		var release = element.release;
		var ease = element.ease;

		if(!ease) ease="linear"
		if(!duration) duration=0;
		if(!transitionTime) transitionTime=300;
		if(moveAxis!="none"){
			var anim = {};
			anim[moveAxis] = moveAmount*-1;
			// console.log(anim);
			counters[id]+=1;
			$(element.obj).transition(anim,0);
		}

		$(element.obj).transition({opacity:1,delay:delay,x:0,y:0},transitionTime,ease,function(){
			if(fade==true){
				if(release!=true){
					$(element.obj).transition({opacity:0,delay:duration},function(){
						$.fn.animationChain(id,counters[id]);
					});
				}else{
					$(element.obj).transition({opacity:0,delay:duration});
					$.fn.animationChain(id,counters[id]);
				}
			}else{
				$.fn.animationChain(id,counters[id]);
			}
		});
	}
})(jQuery);