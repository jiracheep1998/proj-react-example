var Grid = (function(){
	this.Scale = 1;
	this.set = function(svgID, scale){
			//$('.grid').remove();
			this.Scale = scale;

			svgid = svgID;
			var svg = document.getElementById(svgid);
			var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g.setAttribute('class', 'grids');


			var pattern1 = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
			var pattern2 = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
			var path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
			var path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
			var rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			var rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");

			var lineX = document.createElementNS("http://www.w3.org/2000/svg", "line");
			var lineY = document.createElementNS("http://www.w3.org/2000/svg", "line");

			var width = window.screen.width;
			var height = window.screen.height;

			$(pattern1).attr({
				id: 'smallGrid',
				class: 'smallGrid',
				width: 1,
				height: 1,
				patternUnits: 'userSpaceOnUse',
			});

			$(pattern2).attr({
				id: 'largeGrid',
				class: 'largeGrid',
				width: 10,
				height: 10,
				patternUnits: 'userSpaceOnUse'
			});

			$(path1).attr({
				id: 'pattern2',
				class: 'pattern2',
				d: 'M '+1+' 0 L 0 0 0 '+1,
				fill: 'none',
				stroke: '#353536',
				'stroke-width': (1 / scale),
				// 'shape-rendering': 'crispEdges'
			});

			$(path2).attr({
				id: 'pattern1',
				class: 'pattern1',
				d: 'M '+10+' 0 L 0 0 0 '+10,
				fill: 'none',
				stroke: '#454545',
				'stroke-width': (2 / scale),
				'shape-rendering': 'crispEdges'
			});

			$(rect1).attr({
				width: 10,
				height: 10,
				fill: 'url(#smallGrid)'
			});

			// $(rect2).attr({
			// 	x: 0,
			// 	y: 0,
			// 	width: width/scale,
			// 	height: height/scale,
			// 	fill: 'url(#largeGrid)'
			// });

			$(rect2).attr({
				id: 'grid',
				x: 0,
				y: 0,
				width: 500,
				height: 500,
				fill: 'url(#largeGrid)'
			});

			$(pattern1).append(path1);
			$(pattern2).append(rect1);
			$(pattern2).append(path2);

			$(g).append(pattern1);
			$(g).append(pattern2);
			$(g).append(rect2);

			$('.grid').attr('transform', 'translate(0,0) scale(1)');

			$('.grid').empty();

			let grid1 = g;
			$('.grid').append(grid1);

			let grid2 = g.cloneNode(true);
			$(grid2.children[2]).attr({x: -500, y: 0});
			$('.grid').append(grid2);

			let grid3 = g.cloneNode(true);
			$(grid3.children[2]).attr({x: -500, y: -500});
			$('.grid').append(grid3);

			let grid4 = g.cloneNode(true);
			$(grid4.children[2]).attr({x: 0, y: -500});
			$('.grid').append(grid4);

	}
	

	this.update = function(svgID, scale){
		//console.log(svgID, scale)
		var get = $('.grid')[0].getBoundingClientRect();
		$('.grid').attr('transform', 'translate('+(-get.x)+','+(-get.y)+') scale(1)');
	}

	this.move = function(svgID, CTM, scale){


			// if(App.offset.gridState === 1){
			// 	var s = 10*scale;

			// 	var x1 = CTM.e/s;
			// 	var x2 = Number(x1.toFixed());
			// 	var x = s*x2;

			// 	var y1 = CTM.f/s;
			// 	var y2 = Number(y1.toFixed());
			// 	var y = s*y2;

			// 	CTM.e = x;
			// 	CTM.f = y;
			// }

			return CTM;
		
		
	}

	return {
		set : set,
		update: update,
		move: move
	}
})();