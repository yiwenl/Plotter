// app.js
window.bongiovi = require("./libs/bongiovi.js");
var dat = require("dat-gui");

(function() {
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
		this.canvasTangle = document.querySelector('.PlotterCanvas--Tangle');
		this.ctxTangle = this.canvasTangle.getContext("2d");

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


		this._warning = document.body.querySelector('.Warnings');

		this._tangleBind = this._tangle.bind(this);
		this._draw();
	};


	p._onKey = function(e) {
		if(e.keyCode == 13) {
			e.preventDefault();
			this._draw();
			this.ctxTangle.clearRect(0, 0, this.canvasTangle.width, this.canvasTangle.height);
		}
	};


	p._draw = function(range) {
		this.warn('');
		if(range) {	this.drawRange = range;	}
		if(this.inputFunction.value == "") return;

		var str = this.inputFunction.value;

		try{
			this.fnPlotter = new Function("x", this._formalizeFunction(str));	
		} catch(e) {
			console.warn("Error : ", e);
			this.warn(e.message);
			return;
		}

		this.plot();

		
		this._formTangle(str);
	};


	p._formTangle = function(str) {
		var p = document.querySelector('.Inputs-Tangle');
		var strP = "";

		var reg = new RegExp(/\d*\.?\d+/g);
		var match;
		var values = [];
		var i = 0;
		var preIndex = 0;
		this._tangleStrings = [];
		while (match = reg.exec(str)) {
			var strBefore = str.substring(preIndex, match.index);
			preIndex = reg.lastIndex;
			var value = parseFloat(match);
			values.push(value);
			var precision = this.getPrecision(value);
			var step = this.getStep(precision);
			var valueRange = this.getValueRange(value);

			strP += strBefore;
			this._tangleStrings.push(strBefore);
			strP += '<span class="TKAdjustableNumber" data-var="data'+i+'" data-min="'+valueRange.min+'" data-max="'+valueRange.max+'" data-step="'+step+'" data-format="%.1f"></span>';
			i++;
		}

		if(i == 0 ) {
			p.innerHTML = "";
			return;
		}
		var strLeft = str.substring(preIndex);
		strP += strLeft;
		this._tangleStrings.push(strLeft);

		p.innerHTML = strP;
		var that = this;

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
		var strFunc = "";
		for(var i=0; i<tangle.length; i++) {
			strFunc += this._tangleStrings[i];
			strFunc += tangle[i];
		}

		strFunc += this._tangleStrings[this._tangleStrings.length-1];
		strFunc = this._formalizeFunction(strFunc);
		try {
			this.fnTangle = new Function("x", strFunc);	
		} catch(e) {
			console.warn("Error : ", e.message);
			this.warn(e.message);
			return;
		}
		

		this.plotTangle();
	};


	p.plot = function(ctx) {
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
				this.warn(e.message);
				return;
			}
			

			if(i==0) this.ctxPlot.moveTo(i, y);
			else this.ctxPlot.lineTo(i, y);
		}

		this.ctxPlot.stroke();
	};


	p.plotTangle = function() {
		this.ctxTangle.clearRect(0, 0, this.canvasTangle.width, this.canvasTangle.height);

		this.ctxTangle.strokeStyle = 'rgba(255, 128, 0, 1)';
		this.ctxTangle.beginPath();

		var ty = this.canvasTangle.height * .5;
		var gap = 25;
		var height = .5/(this.drawRange);

		for(var i=0; i<=this.canvasTangle.width; i++) {
			try {
				// var y = ty - this.fnTangleter(i/gap)*gap;	
				var y = ty - this.fnTangle(i/500*this.drawRange)*(250/this.drawRange);
			} catch(e) {
				console.warn('Error : ', e);
				this.warn(e.message);
				return;
			}
			

			if(i==0) this.ctxTangle.moveTo(i, y);
			else this.ctxTangle.lineTo(i, y);
		}

		this.ctxTangle.stroke();
	};

	p._drawBackground = function() {
		var canvas = document.querySelector('.PlotterCanvas--Background');
		var ctx = canvas.getContext("2d");

		var gap = 25;
		var numLines = canvas.width/gap;
		ctx.beginPath();
		ctx.strokeStyle = "rgba(220, 220, 220, 1.0)";
		for(var i=0; i<=numLines; i++) {
			ctx.moveTo(i*gap, 0);
			ctx.lineTo(i*gap, canvas.height);
		}

		for(var i=0; i<=numLines; i++) {
			ctx.moveTo(0, i*gap);
			ctx.lineTo(canvas.width, i*gap);
		}

		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";
		ctx.moveTo(0, (numLines/2)*gap);
		ctx.lineTo(canvas.width, (numLines/2)*gap);
		ctx.stroke();
	};

	p.getPrecision = function(value) {
		var s = value + "";
		if(s.length == 1) {
			return 0;
		}
		var precision = (value + "").split(".")[1].length;
		return precision;
	};

	p.getStep = function(mPrecision) {
		return 1/Math.pow(10, mPrecision);
	};

	p.getValueRange = function(value) {
		var tmp = Math.floor(value*10);
		return {max:tmp, min:-tmp};
	};


	p._formalizeFunction = function(str) {
		return "return " + str + ";"
	};

	p.warn = function(str) {
		this._warning.innerHTML = str;
	};

	p._loop = function() {
	};

})();


new App();