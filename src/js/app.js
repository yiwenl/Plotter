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
		this.drawRange = 5;
		this._drawBackground();
		this.canvasPlot = document.querySelector('.PlotterCanvas--Plotter');
		this.ctxPlot = this.canvasPlot.getContext("2d");

		this.inputFunction = document.querySelector('.Inputs-InputFunction');
		this.btnDraw = document.querySelector('.Inputs-ButtonDraw');
		this.btnDraw.addEventListener("click", this._draw.bind(this));

		window.addEventListener("keydown", this._onKey.bind(this));

		//	TANGLE
		var drawBind = this._draw.bind(this);
		var elRange = document.querySelector(".PlotterRange--End");
		var modelRange = {
			initialize: function () {
		        this.range = 5;
		    },
		    update: function () {
		    	drawBind(this.range);
		    }
		}

		// var tangleRange = new Tangle(elRange, modelRange);
		
		this._tangleBind = this._tangle.bind(this);
		this._draw();
	};


	p._onKey = function(e) {
		// console.log("on Key : ", e.keyCode);
		if(e.keyCode == 13) {
			e.preventDefault();
			this._draw();
		}
	};


	p._draw = function(range) {
		if(range) {
			this.drawRange = range;
		}

		if(this.inputFunction.value == "") return;

		var str = this.inputFunction.value;
		this._formTangle(str);


		try{
			this.fnPlotter = new Function("x", this._formalizeFunction(str));	
		} catch(e) {
			console.warn("Error : ", e);
			return;
		}

		this.plot();
	};


	p._formTangle = function(str) {
		var p = document.querySelector('.Inputs-Tangle');
		var strP = "";

		var reg = new RegExp(/\d/g);
		var match;
		var values = [];
		var i = 0;
		var preIndex = 0;
		while (match = reg.exec(str)) {
			var strBefore = str.substring(preIndex, match.index);
			preIndex = reg.lastIndex;
			var value = parseFloat(match);
			values.push(value);

			console.log(strBefore);
			strP += strBefore;
			strP += '<span class="TKAdjustableNumber" data-var="data'+i+'" data-min="1" data-max="50" data-step=".1" data-format="%.1f"></span>';
			i++;
		}

		if(i == 0 ) return;
		strP += str.substring(preIndex);

		

		p.innerHTML = strP;
		p.style.color = 'white';
		var that = this;

		// var elRange = document.querySelector(".PlotterRange--End");
		var modelRange = {
			initialize: function () {
				this.numData = 0;
				for(var i=0; i<values.length;i++) {
					this["data" + i] = values[i];
					this.numData ++;
				}
		        // this.data0 = 1;
		    },
		    update: function () {
		    	var ary = [];
		    	for(var i=0; i<this.numData; i++) {
		    		ary.push(this["data"+i]);
		    	}
		    	that._tangleBind(ary);
		    }
		}

		console.log(modelRange);

		var tangleRange = new Tangle(p, modelRange);
	};


	p._tangle = function(tangle) {
		console.log('Update Tangle : ', tangle);
	};


	p.plot = function() {
		this.ctxPlot.clearRect(0, 0, this.canvasPlot.width, this.canvasPlot.height);

		this.ctxPlot.strokeStyle = 'rgba(255, 0, 0, 1)';
		this.ctxPlot.beginPath();

		var ty = this.canvasPlot.height * .5;
		var gap = 25;
		var height = .5/(this.drawRange);

		for(var i=0; i<=this.canvasPlot.width; i++) {
			try {
				// var y = ty - this.fnPlotter(i/gap)*gap;	
				var y = ty - this.fnPlotter(i/500*this.drawRange)*(250/this.drawRange);
			} catch(e) {
				console.warn('Error : ', e);
				return;
			}
			

			if(i==0) this.ctxPlot.moveTo(i, y);
			else this.ctxPlot.lineTo(i, y);
		}

		this.ctxPlot.stroke();
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