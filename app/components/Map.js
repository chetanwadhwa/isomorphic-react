if (typeof(window) == 'undefined'){
    global.window = new Object();
}

/** @jsx React.DOM */
var  React          = require('react'),
     ReactDOM       = require('react-dom'),
     Header         = require('./header.js'),
     ReactDOMServer = require('react-dom/server'),
     request        = require('request');


var MapPage = React.createClass({
  getInitialState:function(){
    return {
      headerConfig : {
        initialColorHeader : true,
        initialTransparentHeader : false,
        resizeEvent : true
      },
      windowWidth: 0
    }
  },
  componentWillMount:function(){
    console.log(this.props.trip_slug);
    if(this.state.headerConfig.resizeEvent){
      //window.addEventListener('resize', this.handleResize);
    }
    this.setState({
      windowWidth : window.innerWidth
    });
  },
  handleResize : function() {
    this.setState({windowWidth:window.innerWidth})
  },
  render: function() {
    return (
      <div>
        <Header initialHeaderConfig={this.state.headerConfig}  windowWidth={this.state.windowWidth}/>
        <Content windowWidth={this.state.windowWidth} trip_slug = {this.props.trip_slug}/>
      </div>
    );
  }
})


var Content = React.createClass({
  getInitialState: function(){
    return {
      spotsData: [],
      locations : [],
      title : '',
      slug : null,
      showEmptyMap: null
    }
  },
  componentWillMount: function(){
  request('http://local.tripoto.com/api/1.0/trips/' + this.props.trip_slug + '?embed=spots,spot_documents', function (error, response, body) {
      console.log(response.statusCode);
      if (!error && response.statusCode == 200) {
        var spotsData = JSON.parse(body);
        if (spotsData.status === 200) {
          var locationData = [];
          if (spotsData.data.spots.length > 0) {
            spotsData.data.spots.forEach(function (spot) {
              var spotData = {};
              spotData.name = spot.name;
              spotData.latitude = parseFloat(spot.latitude);
              spotData.longitude = parseFloat(spot.longitude);

              if (spot.spot_documents.length > 0) {
                spotData.spotDocument = spot.spot_documents[0].spot_document;
                spotData.spotCard = spot.spot_documents[0].spot_card;
              } else {
                spotData.spotDocument = '';
                spotData.spotCard = '';
              }
              locationData.push(spotData);
            });
            this.setState({
              title: spotsData.data.title,
              slug: spotsData.data.id,
              locations: locationData,
              spotsData: spotsData.data.spots,
              showEmptyMap: false
            });
          } else {
            this.setState({
              title: spotsData.data.title,
              slug: spotsData.data.id,
              showEmptyMap: true
            });
          }
        }
      }
    }.bind(this));
  },
  render: function() {
    console.log('componentWillMount');
    return (
      <div className="clearfix container-fluid padding-none">
      <TopSection title={this.state.title} slug={this.state.slug}/>
      </div>
    );
  }
})

var TopSection = React.createClass({
  render: function() {
    console.log('TopSection');
    console.log('-------'+this.props.slug);
    console.log(this.props.title && this.props.title.length > 0 ? "Map of "+this.props.title : "Loading Data..");
    return (
      <div className="clearfix background-white map-top-section navbar-separation">
      <div className="col-md-3 col-lg-3 hidden-sm hidden-xs padding-none font-med">
         <div className="panel-heading">
              <a href={"/trip/"+this.props.slug} className="color-dark font-SFUIText-Medium">
              <i className="fa fa-angle-left col-lg-1 col-md-1"></i>
              <span className="col-lg-8 col-md-8">Back To Itinerary</span>
              </a>
        </div>
      </div>
      <h1 className="text-center col-md-9 col-lg-9 col-sm-12 col-xs-12 margin-none line-height-32 font-MetaSerifPro-Bold font-xxlg">{this.props.title && this.props.title.length > 0 ? "Map of "+this.props.title : "Loading Data.."}</h1>
      </div>
    );
  }
})

var MapSection = React.createClass({
  render: function() {
    console.log('MapSection');
    return (
      <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12 padding-none col-lg-push-3 col-md-push-3">
      { this.props.showEmptyMap != null ?
        [
        (this.props.showEmptyMap ?
          [
           <NoSpotMap windowWidth={this.props.windowWidth}/>
          ]
          : 
          [ <Map  locations={this.props.locations} windowWidth={this.props.windowWidth}/> ]
        )
        ]
      : null}
      </div>
    );
  }
})

var NoSpotMap = React.createClass({
  componentDidMount:function(){
    var searchLatLng = new google.maps.LatLng(28.671938757182,77.228058168602);
    var  draggable = false;
    if(this.props.windowWidth > 991){
      draggable = true;
    }else {
      draggable = false;
    }
    
    var mapOptions = {
      zoom: 4,
      center: searchLatLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: false,
      draggable:draggable,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
      },
      streetViewControl: true,
      streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
      }
    }
    var map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions);
  },
  render: function() {
    return (
      <div id="mapCanvas" className="container-map-lg"></div>
    );
  }

})

var Map = React.createClass({
  componentDidMount:function(){

    window.infoBox = null;
    window.markers = [];
    var  draggable = false;
    
    if(this.props.windowWidth > 991){
      draggable = true;
    }else {
      draggable = false;
    }

    var that = this;
    var icon = new google.maps.MarkerImage(IMG_ASSETS_URL+'pin.svg');
    if(this.props.locations.length > 0) {
      var map;
      map = new google.maps.Map(document.getElementById('mapCanvas'), {
        draggable: draggable,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel:false,
         zoomControl: true,
         zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
         },
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
        }
      });

      var num_markers = this.props.locations.length;
      var bounds = new google.maps.LatLngBounds();
      var indexValue = 0;
      //Using index value to make an array of markers with latitude and longitude only. Similar has been done for spot accordian items.
      for (var i = 0; i < num_markers; i++) {
        if(this.props.locations[i].latitude && this.props.locations[i].longitude && this.props.locations[i].name.length>0){
          window.markers[indexValue] = new google.maps.Marker({
            position: {lat:this.props.locations[i].latitude, lng:this.props.locations[i].longitude},
            map: map,
            html: ReactDOMServer.renderToString(<MapPin spotCard={this.props.locations[i].spotCard} name={this.props.locations[i].name}/>),
            id: indexValue,
            icon:icon,
            dataValue : this.props.locations[i].name.split(',')[0]
          });
          bounds.extend(window.markers[indexValue].getPosition());

          google.maps.event.addListener(window.markers[indexValue], 'click', function() {
            if(!window.infoBox){
              window.infoBox = new InfoBox({
                content: this.html,
                position:this.position,
                disableAutoPan: false,
                pixelOffset:  new google.maps.Size(-140, 0),
                zIndex: null,
                boxStyle: {
                  opacity: 0,
                  maxWidth:"300px",
                  cursor:'pointer',
                  background:'#fff'
                },
                closeBoxMargin: "5px",
                closeBoxURL: IMG_ASSETS_URL+"/close.png",
                infoBoxClearance: new google.maps.Size(1, 1)
              });
              window.infoBox.open(map,this);
              setInfoBox(indexValue)

            } else {
              window.infoBox.open(map,this);
              window.infoBox.setContent(this.html);
              window.infoBox.setPosition(this.position);
              setInfoBox(indexValue)
            }
            toggleAccordian(this.id,'accordion');
          });
          indexValue++;
        }
      }
            map.fitBounds(bounds);
            setTimeout(function(){
              var index = 0;
              if(window.location.hash.substr(1).length > 0){
                index = searchArrayOfObjects('dataValue',window.location.hash.substr(1),window.markers,true);
              }else {
                index = 0;
              }
              google.maps.event.trigger(window.markers[index], 'click');
           },1000)
    }
  },
  render: function() {
    return (
      <div id="mapCanvas" className="container-map-lg"></div>
    );
  }
})

var MapPin = React.createClass({
  render: function() {


    if(this.props.spotCard.length >0 ){
      style ={
        'backgroundImage': "url("+this.props.spotCard+")"
      }
    }


    return (
      <div className='map-pin-detail font-MetaSerifPro-Bold'>
        {this.props.spotCard.length > 0 ? <div style={style} className='spot-image'></div> : null }
        <div className='spot-name ellipsis'>{this.props.name.split(',')[0]}</div>
       </div>
    );
  }
})

var LeftBar = React.createClass({
  render: function() {
    var spotNo = 0;

    if(this.props.showEmptyMap){

    }

    return (
      <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12 padding-none  overflow-auto col-lg-pull-9 col-md-pull-9 container-map-lg height-default-xs" id="spot-accordian">
      {this.props.showEmptyMap ? <NoSpotData />
        :
        <div id="accordion" className="panel-group map-accordian margin-none">
        <div className="hidden-lg hidden-md padding-none font-med background-white panel">
          <div className="panel-heading">
          <a href={"/trip/"+this.props.trip_slug} className="color-dark font-SFUIText-Medium">
          <i className="fa fa-angle-left col-lg-1 col-md-1"></i>
          <span className="col-lg-8 col-md-8">Back To Itinerary</span>
          </a>
          </div>
        </div>
          {this.props.spotsData.map(function(spot,index){
            var isLocation = false;
            if(spot.name.length > 0){
              if(spot.latitude  && spot.longitude){
                  isLocation = true;
                return <SpotAccordianItem key={index} accordianKey={index} spot={spot} spotNo={spotNo++} isLocation={isLocation}/>
              } else {
                return <SpotAccordianItem key={index}  accordianKey={index}  spot={spot} isLocation={isLocation}/>
              }
            }
          })}
          </div>
      }
      </div>
    );
  }
})

var NoSpotData = React.createClass({
  render: function() {
    return (
      <div className="container-nospot text-center opacity-half col-lg-12 col-md-12 col-sm-12 col-xs-12">
        <div className="logo-marker-grey margin-center"></div>
        <div className="font-med text">We couldn&#39;t find any locations associated with this trip</div>
      </div>
    );
  }
})

var SpotAccordianItem = React.createClass({
  openMap: function(ev){
      var index = ev.target.closest('a').getAttribute('data-index');
      if(index){
        google.maps.event.trigger(window.markers[index], 'click');
      }
  },
  render: function() {
    var collapse = false;
    if(this.props.spot.description.length > 0 || this.props.spot.spot_documents.length > 0) {
      collapse = true;
    }

    return (
      <div className="panel panel-default margin-none">
        <div className="panel-heading background-white">
          <h4 className="panel-title color-blue line-height-24">
          <a data-toggle="collapse" onClick={this.openMap} data-index={this.props.isLocation ? this.props.spotNo : null} data-parent="#accordion" href={"#collapse"+this.props.accordianKey} className="clearfix font-lg font-MetaSerifPro-Bold"><i className="fa fa-map-marker col-lg-2 col-md-2"></i><h2 className="col-lg-8 col-md-8 padding-none font-lg margin-none display-inline-block">{this.props.spot.name.split(',')[0]}</h2>{collapse ? <i className="fa fa-angle-down bold col-lg-1 col-md-1"></i> : null}</a>
          </h4>
        </div>

        { collapse ?
        <div  id={"collapse"+this.props.accordianKey} className="panel-collapse collapse">
          <div className="panel-body font-MetaSerifPro-Book">
          {this.props.spot.spot_documents.map(function(spotDocument,index){
            return <SpotImage key={index} spotDocument={spotDocument} />
          })}
          {this.props.spot.description.length > 0 ? <div className="font-med" dangerouslySetInnerHTML={{__html: this.props.spot.description}}></div> : null}
          </div>
        </div>
        :
        null }
      </div>
    );
  }
})

var SpotImage = React.createClass({
  render: function() {
    var style = {
      'marginBottom':'10px'
    }
    return (
      <div style={style}>
        <img className="border-radius-normal" src={this.props.spotDocument.spot_document} width="100%"></img>
        <div>{this.props.spotDocument.description}</div>
      </div>
    );
  }
})

 var UserImage  = React.createClass({
        render: function () {
            return (
                <img className="img-user" src={this.props.userImage} width="40" height="40"></img>
            );
        }
});

module.exports = MapPage;