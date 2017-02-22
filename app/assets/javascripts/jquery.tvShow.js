"use strict";
( function(){

    $(function(){

        $('.tvShow').each( function() {
            new TVShow( $(this) );
        } );

    });

    var TVShow = function(obj) {

        //private properties
        var _obj = obj,
            _langSelect = $( '.tvShow-lang select' ),
            _tvProgram = $( '.tvShow' ),
            _tvShare = $( 'button.sharing' ),
            _date = $( '.tvShow-date' ),
            _sharingImage = 'http://mysite.com/mypic.jpg',
            _lang = _langSelect.val(),
            _myVKID = 5888978,
            _siteTitle = $( '.site__title' );

        //private methods
        var _addEvents = function() {

                _langSelect.on({
                    'change': function() {
                        _lang = $( this ).val();
                        _sendAjax();
                    }
                });

                _tvShare.on( {
                    click: function() {
                        _makePrint();
                    }
                } );
                
                // $( 'body' ).on( {
                //     click: function () {
                //         //
                //
                //
                //         $.ajax({
                //             url: '/upload_to_vk',
                //             data: {
                //                 upload_url: 'https://pu.vk.com/c638124/upload.php?act=do_add&mid=153318495&aid=-14&gid=0&hash=0675935b7e387110eb1504855a5be8ee&rhash=d9d409b9d6a697a9cc639f83796b0bc1&swfupload=1&api=1&wallphoto=1',
                //                 image: 'uploads/2017-02-22_1487736000.jpeg'
                //             },
                //             headers: {
                //                 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
                //             },
                //             dataType: 'json',
                //             type: 'post',
                //             success: function (msg) {
                //
                //                 console.log(msg);
                //
                //
                //             },
                //             error: function (XMLHttpRequest) {
                //                 if (XMLHttpRequest.statusText != "abort") {
                //                     // alert("ERROR!!!");
                //                 }
                //             }
                //         });
                //     }
                // } );

            },
            _addSharedButton = function() {
                var token = localStorage.getItem('fb_token'),
                    html = '';

                if( token ){
                    html = '<button class="sharing"></button>';
                } else {
                    html = '<a href="https://oauth.vk.com/authorize?client_id='+ _myVKID +'&redirect_uri=http://hackathon.websters.com.ua/&scope=+4&response_type=token&display=popup" class="sharing"></a>';
                }

                $( '.site__header-column_buttons' ).append( html );
                _tvShare = $( 'button.sharing' );

            },
            _constructor = function() {
                // _checkUrl();
                _initDatePicker();
                _initVK();
                _timestampToDate();
                _siteTitleChange();
                // _addSharedButton();
                _addEvents();
            },
            _initDatePicker = function() {
                _date.datepicker( { 
                    dateFormat: 'yy-mm-dd',
                    onSelect: function() {
                        _sendAjax();
                    }
                } ).datepicker( "setDate", new Date() );
            },
            _initVK = function() {
                var token = localStorage.getItem('fb_token');

                if( token ){
                    VK.init({
                        apiId: _myVKID
                    });
                }

            },
            _checkUrl = function() {

                if( location.hash.indexOf( 'access_token' ) > -1 ) {

                    var curString = location.hash.substring( 1 ).split( '&' ),
                        stringData = {};

                    curString.forEach( function (item) {
                        var curItem = item.split( '=' );

                        stringData[ curItem[ 0 ] ] = curItem[ 1 ];
                    } );

                    if( stringData[ 'access_token' ] ){

                        localStorage.setItem('fb_token', stringData[ 'access_token' ]);

                        location.hash = '';

                    }

                }

            },
            _makePrint = function () {

                html2canvas( _tvProgram[ 0 ], {

                    onrendered: function( canvas ) {

                        _vkLogin(canvas);

                    }

                } );

            },
            _vkLogin= function(canvas){
                VK.Auth.login( function (e) {
                    _share( canvas.toDataURL( 'image/jpeg' ) );

                }, 4 );
            },
            _dataURLtoBlob = function(dataURL) {
                var binary = atob(dataURL.split(',')[1]);
                var array = [];
                for(var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }
                return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
            },
            _sendAjax = function() {
                var day = _date.val();

                $.ajax({
                    url: '/programs',
                    data: {
                        lang: _lang,
                        date: day
                    },
                    headers: {
                        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
                    },
                    dataType: 'html',
                    type: "get",
                    success: function (msg) {
                        _tvProgram.find( '*' ).remove();
                        _tvProgram.append( msg );
                        _timestampToDate();
                        _siteTitleChange();

                    },
                    error: function (XMLHttpRequest) {
                        if ( XMLHttpRequest.statusText != "abort" ) {
                            // alert("ERROR!!!");
                        }
                    }
                });
            },
            _share = function( image ) {
                var file = _dataURLtoBlob(image),
                    fd = new FormData();

                fd.append( 'image', file );
                fd.append( 'lang', _lang );
                fd.append( 'date', $( '.tvShow__date' ).text() );

                $.ajax({
                    url: '/get_image',
                    data: fd,
                    headers: {
                        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
                    },
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    type: 'post',
                    success: function ( msg ) {

                        _wallPost( 'Телепрограмма канала 1+1', msg.path, '140835687' );




                    },
                    error: function (XMLHttpRequest) {
                        if ( XMLHttpRequest.statusText != "abort" ) {
                            // alert("ERROR!!!");
                        }
                    }
                });
            },
            _wallPost = function (message, image, user_id) {
                // location.origin + '/' +
                VK.api('photos.getWallUploadServer', {
                    uid: user_id
                }, function (data) {
                    
                    console.log(image);
                    
                    if (data.response) {

                        $.ajax({
                            url: '/upload_to_vk',
                            data:  { 
                                upload_url: data.response.upload_url,
                                image: image
                            },
                            headers: {
                                'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
                            },
                            dataType: 'json',
                            type: 'post',
                            success: function ( json ) {
console.log(user_id);
                                    VK.api("photos.saveWallPhoto", {
                                        server: json.server,
                                        photo: json.photo,
                                        hash: json.hash,
                                        uid: user_id
                                    }, function (data) {
                                        console.log(data);
                                        // VK.api('wall.post', {
                                        //     owner_id: '-140835687',
                                        //     message: message,
                                        //     attachments: data.response['0'].id
                                        // });
                                        console.log(message);
                                        VK.api("wall.post", {
                                            owner_id: '-140835687',
                                            message: message
                                        }, function (data) {
                                            console.log(data)
                                        });
                                    });



                            },
                            error: function (XMLHttpRequest) {
                                if ( XMLHttpRequest.statusText != "abort" ) {
                                    // alert("ERROR!!!");
                                }
                            }
                        });

                        // $.post( '', {  // url на ВАШЕМ сервере, который будет загружать изображение на сервер контакта (upload_url)
                        //     upload_url: data.response.upload_url,
                        //     image: image,
                        // }, function (json) {

                        // }, 'json');
                    }
                });
            },
            _timestampToDate = function() {
                
                $( '.tvShow__item-time' ).each( function(  ) {
                
                    var time = this.innerHTML,
                        timestamp = time*1000,
                        TVdate = new Date( timestamp ),
                        hours = TVdate.getHours(),
                        minutes = TVdate.getMinutes();

                    if ( hours < 10 ) {
                        hours = '0' + hours;
                    }

                    if ( minutes < 10 ) {
                        minutes = '0' + minutes;
                    }

                    this.innerHTML = hours + ':' + minutes;
                
                } );
            },
            _siteTitleChange = function() {

                switch ( _lang ) {
                    case 'ua':
                        _siteTitle.text( 'TV програма' );
                        break;
                    case 'ru':
                        _siteTitle.text( 'TV программа' );
                        break;
                    default:
                        break;
                }

            };

        //public properties

        //public methods

        _constructor();
    };

} )();