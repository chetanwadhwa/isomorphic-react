var React = require('react'),
ReactDOMServer = require('react-dom/server')
ReactApp = React.createFactory(require('../components/ReactApp'));
Map = React.createFactory(require('../components/Map'));

module.exports = function(app) {

	app.get('/', function(req, res){
		// React.renderToString takes your component
    	// and generates the markup
		var reactHtml = ReactDOMServer.renderToString(ReactApp({}));
    	// Output html rendered by react
		// console.log(myAppHtml);
   		res.render('index.ejs', {reactOutput: reactHtml});
	});

    app.get('/map',function(req, res){
        var	trip_slug = req.query.trip_slug;
		var reactHtml = ReactDOMServer.renderToString(Map({trip_slug}));
		res.render('map.ejs', {reactOutput: reactHtml});
	}); 
};
