/** @jsx React.DOM */

var React    = require('react');
var ReactApp = require('./components/ReactApp');
var Map      = require('./components/Map');

var mountNode = document.getElementById('react-main-mount');

React.render(new ReactApp({}), mountNode);
React.render(new Map({}), mountNode);
