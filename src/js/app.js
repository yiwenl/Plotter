// app.js
window.bongiovi = require("./libs/bongiovi.js");
var dat = require("dat-gui");

(function() {
	var SceneApp = require("./SceneApp");

	App = function() {
		if(document.body) this._init();
		else {
			window.addEventListener("load", this._init.bind(this));
		}
	}

	var p = App.prototype;

	p._init = function() {
		this._drawBackground();
		this.canvasPlot = document.querySelector('.PlotterCanvas--Plotter');
		this.ctx = this.canvasPlot.getContext("2d");

		this.inputFunction = document.querySelector('.Inputs-InputFunction');
		this.btnDraw = document.querySelector('.Inputs-ButtonDraw');
		this.btnDraw.addEventListener("click", this._draw.bind(this));

		window.addEventListener("keydown", this._onKey.bind(this));
		
		this._draw();
	};


	p._onKey = function(e) {
		// console.log("on Key : ", e.keyCode);
		if(e.keyCode == 13) {
			e.preventDefault();
			this._draw();
		}
	};


	p._draw = function() {
		console.log(this.inputFunction.value);

		if(this.inputFunction.value == "") return;

		var str = this.inputFunction.value;
		try{
			this.fnPlotter = new Function("x", this._formalizeFunction(str));	
		} catch(e) {
			console.warn("Error : ", e);
			return;
		}

		this.plot();
	};


	p.plot = function() {
		this.ctx.clearRect(0, 0, this.canvasPlot.width, this.canvasPlot.height);

		this.ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
		this.ctx.beginPath();

		var ty = this.canvasPlot.height * .5;
		var gap = 25;

		for(var i=0; i<=this.canvasPlot.width; i++) {
			try {
				var y = ty - this.fnPlotter(i/gap)*gap;	
			} catch(e) {
				console.warn('Error : ', e);
				return;
			}
			

			if(i==0) this.ctx.moveTo(i, y);
			else this.ctx.lineTo(i, y);
		}

		this.ctx.stroke();
	};


	p._drawBackground = function() {
		var canvas = document.querySelector('.PlotterCanvas--Background');
		var ctx = canvas.getContext("2d");

		var gap = 25;
		var numLines = canvas.width/gap;
		ctx.beginPath();
		ctx.strokeStyle = "rgba(255, 255, 255, .25)";
		for(var i=0; i<=numLines; i++) {
			ctx.moveTo(i*gap, 0);
			ctx.lineTo(i*gap, canvas.height);
		}

		for(var i=0; i<=numLines; i++) {
			ctx.moveTo(0, i*gap);
			ctx.lineTo(canvas.width, i*gap);
		}

		ctx.stroke();
	};


	p._formalizeFunction = function(str) {
		return "return " + str + ";"
	};

	p._loop = function() {
	};

})();


new App();