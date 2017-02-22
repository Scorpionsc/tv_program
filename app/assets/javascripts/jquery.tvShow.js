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
            _tvShare = $( '.sharing' ),
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

            },
            _addSharedButton = function() {
                $( '.site__header-column_buttons' ).append(
                    VK.Share.button(
                        {
                            // url: 'http://mysite.com',
                            title: '1+1 program',
                            description: 'Программа телепередач на сегодня',
                            image: _sharingImage,
                            noparse: true
                        },
                        {
                            type: 'custom',
                            text: '<button class="sharing"></button>'}
                    )
                );
            },
            _constructor = function() {
                _addEvents();
                _initDatePicker();
                _initVK();
                _timestampToDate();
                _siteTitleChange();
                _addSharedButton();
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
                VK.init({
                    apiId: _myVKID
                });
            },
            _makePrint = function () {

                html2canvas( _tvProgram[ 0 ], {

                    onrendered: function( canvas ) {

                        _share( canvas.toDataURL( 'image/jpeg' ) );

                    }

                } );

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
                    dataType: 'html',
                    type: 'post',
                    success: function ( msg ) {
                        console.log(  );

                        _wallPost( 'Телепрограмма канала 1+1', location.origin + '/' + msg, '-140835687' );
                        // VK.api("wall.post", {
                        //     owner_id: '-140835687',
                        //     message: 'Hello'
                        // }, function (data) {
                        //     console.log(data)
                        // });



                    },
                    error: function (XMLHttpRequest) {
                        if ( XMLHttpRequest.statusText != "abort" ) {
                            // alert("ERROR!!!");
                        }
                    }
                });
            },
            _wallPost = function (message, image, user_id) {
            console.log(1000);
                VK.api('photos.getWallUploadServer', {
                    uid: user_id
                }, function (data) {
                    
                    console.log(data);
                    
                    if (data.response) {
                        $.post('/upload/', {  // url на ВАШЕМ сервере, который будет загружать изображение на сервер контакта (upload_url)
                            upload_url: data.response.upload_url,
                            image: image,
                        }, function (json) {
                            VK.api("photos.saveWallPhoto", {
                                server: json.server,
                                photo: json.photo,
                                hash: json.hash,
                                uid: user_id
                            }, function (data) {
                                VK.api('wall.post', {
                                    message: message,
                                    attachments: data.response['0'].id
                                });
                            });
                        }, 'json');
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