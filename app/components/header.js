function trackGaTripotoEventsForActions(eventGroup,eventCategory,eventType){
    return false;
}
if (typeof(window) == 'undefined'){
    global.window = new Object();
}
/** @jsx React.DOM */
var React = require('react');
var Wrapper = require('./wrapper.js');
var Modal = Wrapper.Modal;

module.exports = React.createClass({
    getInitialState: function () {
        return {
            headerData: {},
            headerConfig: this.props.initialHeaderConfig
        }
    },
    componentDidMount: function () {
        global.window = window;
        if (this.props.windowWidth >= 992 && this.state.headerConfig.initialTransparentHeader) {
            window.addEventListener('scroll', this.headerTransition);
        }

        $.ajax({
            url: '/api/1.0/users/me?embed=profile&counts=messages,notifications',
            method: 'GET',
            success: function (headerData) {
                if (headerData.status === 200) {
                    this.setState({headerData: headerData.data});
                    if (typeof this.props.onChange === 'function') {
                        this.props.onChange(headerData.data);
                    }
                }
            }.bind(this),
            error: function (xhr, status, err) {
                if (this.state.headerConfig.showStaticLogin && this.props.windowWidth >= 992) {
                    window.skipPageLeaveWarning = true;
                    $('#loginModal').modal({backdrop: 'static', keyboard: false});
                    var signUpModal = document.getElementById('signUpFormModal');
                    signUpModal.setAttribute("data-backdrop", "static");
                    signUpModal.setAttribute("data-keyboard", "false");
                    var forgotPasswordModal = document.getElementById('forgotPasswordModal');
                    forgotPasswordModal.setAttribute("data-backdrop", "static");
                    forgotPasswordModal.setAttribute("data-keyboard", "false");
                }
            }.bind(this)
        });
        if (this.state.headerConfig.promptLogin && this.props.windowWidth >= 992 && userLogId != '') {
            this.promptForLogin();
        }
        if (this.state.headerConfig.checkOnline) {
            this.checkForOnline();
        }
        // If hash has login then show login modal
        if (location.hash == '#login') {
            $('#loginModal').modal();
        }
    },
    checkForOnline: function () {
        var timer = setInterval(function () {
            if (!navigator.onLine) {
                $('#onlineMsgModal').modal();
            }
        }, this.state.headerConfig.onlineCheckInterval * 1000);
    },
    promptForLogin: function () {
        var timer = setInterval(function () {
            $.ajax({
                url: '/api/1.0/users/me?embed=profile&counts=messages,notifications',
                method: 'GET',
                success: function (headerData) {
                }.bind(this),
                error: function (xhr, status, err) {
                    if (xhr.status == 404) {
                        clearTimeout(timer);
                        $('#msgModal').modal();
                    }
                }.bind(this)
            });
        }, this.state.headerConfig.loginCheckInterval * 1000);
    },
    componentWillUnmount: function () {
        window.removeEventListener('scroll', this.headerTransition);
    },
    componentDidUpdate: function () {
        if (this.props.windowWidth >= 992 && this.state.headerConfig.initialTransparentHeader) {
            window.removeEventListener('scroll', this.headerTransition);
            window.addEventListener('scroll', this.headerTransition);
        }
    },
    headerTransition: function () {
        var bannerTextElement = document.getElementsByClassName('banner-text')[0];
        if (window.pageYOffset > bannerTextElement.offsetTop - 50) {
            var obj = {
                initialColorHeader: true,
                initialTransparentHeader: false
            };
            this.setState({headerConfig: obj});
        } else {
            var obj = {
                initialColorHeader: false,
                initialTransparentHeader: true
            }
            this.setState({headerConfig: obj});
        }
    },
    okHandler: function () {
        location.href = FULL_BASE_URL + '#login';
        location.reload();
    },
    render: function () {
        if (this.state.headerConfig.promptLogin) {
            this.modalConfigLoggedOut = {
                id: 'msgModal',
                title: 'You have been logged out !!!',
                crossButton: true,
                okButton: true,
                closeButton: true,
                okText: 'Login'
            };
        }

        if (this.state.headerConfig.checkOnline) {
            this.modalConfigOnLineMsg = {
                id: 'onlineMsgModal',
                crossButton: true,
                title: 'Internet connection has been lost !!!',
                okButton: false,
                closeButton: true
            };
        }

        return (
            <nav className="font-smoothing-remove">
                { this.state.headerConfig.initialColorHeader || this.props.windowWidth < 992 ?
                    <ColorHeader headerData={this.state.headerData} windowWidth={this.props.windowWidth}
                                 removeFixScroll={this.state.headerConfig.removeFixScroll}
                                 hideCTA={this.state.headerConfig.hideCTA}/>
                    :
                    <TransparentHeader headerData={this.state.headerData} windowWidth={this.props.windowWidth}
                                       removeFixScroll={this.state.headerConfig.removeFixScroll}
                                       hideCTA={this.state.headerConfig.hideCTA}/>
                }
                { this.state.headerConfig.promptLogin ?
                    <Modal config={this.modalConfigLoggedOut} handler={this.okHandler}>Click to login again. You will be
                        redirected to home page.</Modal> : null }
                { this.state.headerConfig.checkOnline ?
                    <Modal config={this.modalConfigOnLineMsg}>The content written in offline mode is not
                        saved.</Modal> : null }
            </nav>
        )
    }
});

var ColorHeader = React.createClass({
    getInitialState: function () {
        return {
            setOverlay: false
        }
    },
    stopScroll: function (e) {
        var bodyElement = document.getElementsByTagName('body')[0]
        if (bodyElement.className.indexOf(' no-scroll') > -1) {
            var removeBodyClass = bodyElement.className.replace(' no-scroll', '')
            bodyElement.className = removeBodyClass
        } else {
            bodyElement.className += " no-scroll"
        }

        var collapseElement = document.getElementsByClassName('navbar-collapse')[0]
        if (collapseElement.className.indexOf(' in') > -1) {
            var closeMenu = collapseElement.className.replace(' in', '')
            collapseElement.className = closeMenu
        } else {
            collapseElement.className += ' in'
        }

        this.setState({setOverlay: !this.state.setOverlay})
    },
    render: function () {
        return (
            <div
                className={this.props.removeFixScroll ? "navbar-header color-header  nav absolute " :"navbar-header color-header  nav "}>
                <TripotoLogo windowWidth={this.props.windowWidth}/>
                <SearchBar />
                <div className="hidden-md hidden-lg clearfix pull-left mobile-anchor display-inline-block">
                    <a className="color-white pointer" href="/hotelsearch">Book Hotels</a>
                </div>
                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                        onClick={this.stopScroll}><i
                    className="fa fa-bars"></i>{this.props.headerData.counts && (parseInt(this.props.headerData.counts.messages) + parseInt(this.props.headerData.counts.notifications) > 0) ?
                    <div
                        className="count-notification text-center">{parseInt(this.props.headerData.counts.messages) + parseInt(this.props.headerData.counts.notifications)}</div> : null }
                </button>
                <RightHeaderMenu headerData={this.props.headerData} windowWidth={this.props.windowWidth}
                                 hideCTA={this.props.hideCTA}/>
                { this.props.windowWidth < 992 && this.state.setOverlay ? <MobileOverlay /> : null }
            </div>
        )
    }
});


var TransparentHeader = React.createClass({
    render: function () {
        return (
            <div className={this.props.removeFixScroll ? "navbar-header nav absolute" :"navbar-header nav"}>
                <TripotoLogo windowWidth={this.props.windowWidth}/>
                <RightHeaderMenu headerData={this.props.headerData} hideCTA={this.props.hideCTA}/>
            </div>
        );
    }
});

var MobileOverlay = React.createClass({
    render: function () {
        var style = {
            'height': window.innerHeight
        }
        return (
            <div className="overlay" style={style}></div>
        );
    }
});

var TripotoLogo = React.createClass({
    render: function () {
        var logo = "tripoto.svg"
        if (this.props.windowWidth < 992) {
            logo = "tripoto-favicon.svg"
        }
        return (
            <a className="navbar-brand clearfix" href='/'>
                <img src={"/img/logo/" + logo} alt="Tripoto"></img>
            </a>
        );
    }
});

 var  UserImage = React.createClass({
        render: function () {
            return (
                <img className="img-user" src={this.props.userImage} width="40" height="40"></img>
            );
        }

});

 var  SearchBar = React.createClass({
        componentDidMount: function () {
            getSearchSuggestion(this.refs.searchInput, this.refs.searchSuggestion);
            this.props.placeholderText = "Search for destinations, activities or people"
            if (window.innerWidth < 666) {
                this.props.placeholderText = "Search" ;
            }
        },
        render: function () {
            var style = {
                display: 'none'
            }
            var placeholderText = this.props.placeholderText;
        
            return (
                <form name="formSearch" className="form-search text-center" method="GET" action="/search">
                    <input type="text" name="keywords" className="input-search font-default" autoComplete="off"
                           placeholder={placeholderText} ref="searchInput"></input>
                    <button type="submit" className="btn-action font-lg"><i className="fa fa-search"></i></button>
                    <div className="suggestion-holder" style={style} ref="searchSuggestion">
                        <ul className="list-holder"></ul>
                    </div>
                </form>
            );
        }
    });

var RightHeaderMenu = React.createClass({
    componentDidMount: function () {
        window.addEventListener('mousedown', this.pageClick);
        this.props.windowHeight = window.innerHeight;
    },
    componentWillUnmount: function () {
        window.removeEventListener('mousedown', this.pageClick);
    },
    loginModal: function () {
        $('#loginModal').modal('toggle');
    },
    pageClick: function (ev) {
        var userCTAMenu = document.getElementsByClassName('navbar-right')[0];
        if (!closestByElement(ev.target, userCTAMenu)) {
            this.setState({showMenu: false});
        }
    },
    render: function () {
        var style = {
            height: this.props.windowHeight
        }
        return (
            <div className="collapse navbar-collapse navbar-right-wrapper margin-none" id="sideMenu">
                <ul className="nav navbar-nav navbar-right" style={this.props.windowWidth < 992 ? style : null}>

                    <li className="hover-dropdown hidden-sm hidden-xs">
                        <a href={void(0)}
                           className="dropdown-toggle btn btn-primary btn-primary-transparent border-none"
                           data-toggle="dropdown" role="button">Discover <span className="caret"></span></a>
                        <ul className="dropdown-menu">
                            <div className="peak"></div>
                            <li><a href="/video-trips">Trip Videos</a></li>
                            <li><a href="/photo-blogs">Photo Blogs</a></li>
                            <li><a href="/hotels">Hotel Collections</a></li>
                            <li><a href="/the-stash">The Stash</a></li>
                            <li><a href="/places-to-visit">Destinations</a></li>
                            <li><a href="/travel-guide">Travel Guides</a></li>
                            <li><a href="/weekend-getaways">Weekend Getaways</a></li>
                            <li><a href="/travel-guide/india">India Itineraries</a></li>
                        </ul>
                    </li>

                    <li className="hidden-sm hidden-xs"><a href='/travel-assistant'
                                                           className="btn btn-primary btn-primary-transparent border-none">Plan
                        Trip</a></li>
                    <li className="hidden-sm hidden-xs"><a href='/hotelsearch'
                                                           className="btn btn-primary btn-primary-transparent border-none">Book
                        Hotels</a></li>

                    {!(this.props.hideCTA && this.props.hideCTA.publish) ?
                        Object.keys(this.props.headerData).length > 0 ?
                            <li className="hover-dropdown hidden-sm hidden-xs">
                                <a href={void(0)}
                                   className="btn btn-primary btn-primary-transparent border-none btn-publish pointer">
                                    Publish Trip <span className="caret"></span></a>
                                <ul className="dropdown-menu">
                                    <div className="peak"></div>
                                    <li><a className="pointer" href="/trips/create"
                                           onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Publish Trip Button Click", window.location+" : Login Modal No")}>Create
                                        New</a></li>
                                    <li><a className="pointer" href="/travel-blog-to-itinerary"
                                           onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Import Blog Button Click", window.location)}>Import
                                        Blog</a></li>
                                </ul>
                            </li>
                            :
                            <li className="hover-dropdown hidden-sm hidden-xs">
                                <a href={void(0)}
                                   className="btn btn-primary btn-primary-transparent btn-publish border-none pointer">
                                    Publish Trip <span className="caret"></span></a>
                                <ul className="dropdown-menu">
                                    <div className="peak"></div>
                                    <li><a className="pointer" href={void(0)}
                                           onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Publish Trip Button Click", window.location+" : Login Modal Yes")}
                                           onClick={this.loginModal}>Create New</a></li>
                                    <li><a className="pointer" href="/travel-blog-to-itinerary"
                                           onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Import Blog Button Click", window.location)}>Import
                                        Blog</a></li>
                                </ul>
                            </li>
                        : null}

                    {Object.keys(this.props.headerData).length > 0 ?
                        <li className="hover-dropdown pointer hidden-sm hidden-xs">
                            <i className="fa fa-bars font-lg"></i>
                            {this.props.headerData.counts && (parseInt(this.props.headerData.counts.messages) + parseInt(this.props.headerData.counts.notifications) > 0) ?
                                <div
                                    className="count-notification text-center">{parseInt(this.props.headerData.counts.messages) + parseInt(this.props.headerData.counts.notifications)}</div> : null }
                            <ul className="dropdown-menu">
                                <div className="peak"></div>
                                <li><a href='/notifications'
                                       onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Notifications", window.location+" : "+this.props.headerData.full_name)}><span>Notifications</span><span
                                    className="color-primary-text pull-right">{ this.props.headerData.counts ? this.props.headerData.counts.notifications : null}</span></a>
                                </li>
                                <li><a href='/messages/inbox/'
                                       onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Messages", window.location+" : "+this.props.headerData.full_name)}><span>Messages</span><span
                                    className="color-primary-text pull-right">{ this.props.headerData.counts ? this.props.headerData.counts.messages : null }</span></a>
                                </li>
                                <li><a href='/users/edit'
                                       onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Edit Profile", window.location+" : "+this.props.headerData.full_name)}>Edit
                                    Profile</a></li>
                                <li><a href='/users/change_profile_password'
                                       onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Change Password", window.location+" : "+this.props.headerData.full_name)}>Change
                                    Password</a></li>
                                <li><a href='/logout'
                                       onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Logout", window.location+" : "+this.props.headerData.full_name)}>Log
                                    Out</a></li>
                            </ul>
                        </li>
                        : null}

                    {Object.keys(this.props.headerData).length > 0 ?
                        <li className="hidden-sm hidden-xs img-user-wrapper">
                            <a href={'/profile/'+this.props.headerData.id}>{this.props.headerData.photos ?
                                <UserImage userImage={this.props.headerData.photos.profile.icon}/> : null }</a>
                        </li>
                        :
                        <li className="signIn hidden-sm hidden-xs pointer" onClick={this.loginModal}>Sign In</li>
                    }

                    {Object.keys(this.props.headerData).length > 0 ?
                        <li className="user-nav hidden-md hidden-lg pointer clearfix"><a
                            href={'/profile/'+this.props.headerData.id}><UserImage
                            userImage={this.props.headerData.photos.profile.icon}/>{this.props.headerData.full_name}</a>
                        </li>
                        :
                        <li className="signIn hidden-md hidden-lg pointer clearfix margin-none"
                            onClick={this.loginModal}>Sign In</li>
                    }

                    <li className="hidden-md hidden-lg">
                        <div className="separation"></div>
                    </li>

                    <li className="hidden-md hidden-lg pointer"><a href='/travel-assistant'>Plan Trip</a></li>
                    {Object.keys(this.props.headerData).length > 0 ?
                        <li className="hidden-md hidden-lg pointer"><a href='/trips/create'
                                                                       onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Publish Trip Button Click", window.location+" : Login Modal No")}>Publish
                            Trip</a></li>
                        :
                        <li className="hidden-md hidden-lg pointer" onClick={this.loginModal}><a
                            href='javascript:void(0);'
                            onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Publish Trip Button Click", window.location+" : Login Modal Yes")}>
                            Publish Trip</a></li>
                    }
                    <li className="hidden-md hidden-lg pointer"><a href='/travel-blog-to-itinerary'
                                                                   onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Import Blog Button Click", window.location)}>Import
                        Blog</a></li>

                    <li className="hidden-md hidden-lg">
                        <div className="separation"></div>
                    </li>
                    <li className="hidden-md hidden-lg pointer"><a href='/the-stash'>Trip Collections</a></li>
                    <li className="hidden-md hidden-lg pointer"><a href='/hotels'>Hotel Collections</a></li>
                    <li className="hidden-md hidden-lg pointer"><a href='/travel-guide'>Travel Guides</a></li>
                    <li className="hidden-md hidden-lg">
                        <div className="separation"></div>
                    </li>

                    {Object.keys(this.props.headerData).length > 0 ?
                        <li className="hidden-md hidden-lg pointer"><a href='/notifications'
                                                                       onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Notifications", window.location+" : "+this.props.headerData.full_name)}>Notifications<span
                            className="color-primary-text pull-right">{ this.props.headerData.counts ? this.props.headerData.counts.notifications : null}</span></a>
                        </li> : null}
                    {Object.keys(this.props.headerData).length > 0 ?
                        <li className="hidden-md hidden-lg pointer"><a href='/messages/inbox/'
                                                                       onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Messages", window.location+" : "+this.props.headerData.full_name)}>Messages<span
                            className="color-primary-text pull-right">{ this.props.headerData.counts ? this.props.headerData.counts.messages : null }</span></a>
                        </li> : null}
                    {Object.keys(this.props.headerData).length > 0 ?
                        <li className="hidden-md hidden-lg pointer"><a href='/users/change_profile_password'
                                                                       onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Change Password", window.location+" : "+this.props.headerData.full_name)}>Change
                            Password</a></li> : null}
                    {Object.keys(this.props.headerData).length > 0 ?
                        <li className="hidden-md hidden-lg pointer"><a href='/logout'
                                                                       onClick={trackGaTripotoEventsForActions.bind(window,"Header", "Logout", window.location+" : "+this.props.headerData.full_name)}>Log
                            Out</a></li> : null}
                    {Object.keys(this.props.headerData).length > 0 ? <li className="hidden-md hidden-lg">
                        <div className="separation"></div>
                    </li> : null}

                </ul>
            </div>
        )
    }
});