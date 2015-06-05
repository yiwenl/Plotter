// SceneApp.js

var GL = bongiovi.GL, gl;

function SceneApp() {
	gl = GL.gl;
	bongiovi.Scene.call(this);
}


var p = SceneApp.prototype = new bongiovi.Scene();

p._initTextures = function() {
	console.log('Init Textures');
};

p._initViews = function() {
	console.log('Init Views');
};

p.render = function() {
};

module.exports = SceneApp;