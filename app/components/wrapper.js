/** @jsx React.DOM */
var React = require('react')
var ReactDOM = require('react-dom')

module.exports = {
	Carousel: React.createClass({
		componentDidMount: function() {
	      var element = ReactDOM.findDOMNode(this);
	      var that = this;
	      $(element).on('slid.bs.carousel', function() {
			      that._safeCall(that.props.carouselDidSlide);
			  });
	  },
	  _safeCall: function(f) {
	      if (f != null && typeof f === 'function') {
	          f();
	      }
	  },
		render: function(){
			return <div id={this.props.carouselId} className="carousel slide carousel-custom" data-ride="carousel">{this.props.children}</div>
		}
	}),

	Modal: React.createClass({
		render: function() {
			return (
				<div className="modal fade" id={this.props.config.id} tabIndex="-1" role="dialog">
				  <div className="modal-dialog">
				    <div className="modal-content">
				      <div className="modal-header">
				        { this.props.config.crossButton ? <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button> : null }
				        <h4 className="modal-title">{this.props.config.title}</h4>
				      </div>
				      <div className="modal-body">
				        {this.props.children}
				      </div>
				      <div className="modal-footer">
				        { this.props.config.closeButton ? <button type="button" className="btn btn-default" data-dismiss="modal">{this.props.config.closeText ? this.props.config.closeText : "Close"}</button> : null }
				        { this.props.config.okButton ? <button type="button" className="btn btn-transparent" onClick = {this.props.handler}>{this.props.config.okText ? this.props.config.okText : "Save Changes"}</button> : null }
				      </div>
				    </div>
				  </div>
				</div>
			);
		}
	})
}