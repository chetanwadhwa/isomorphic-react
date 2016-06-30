/** @jsx React.DOM */

var React = require('react');
var resultsPerPage = 200;

var ReactApp = React.createClass({

      componentWillMount: function () {
        console.log('hell');
      },
      render: function () {
        return (
          <div id="table-area">

              Helllooooooo

          </div>
        )
      }
  });

/* Module.exports instead of normal dom mounting */
module.exports = ReactApp;