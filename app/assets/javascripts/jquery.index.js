( function(){

    $(function(){

        $('.site').each( function() {
            new Site( $(this) );
        } );

    });

    var Site = function(obj) {

        //private properties
        var _obj = obj,
            _topBtn = _obj.find( '.site__top' ),
            _scrollDuration = 500;

        //private methods
        var _addEvents = function() {

                _topBtn.on({
                    'click': function() {
                        _scrollTop();
                        return false;
                    }
                });

                $( window ).on({
                    'scroll': function() {
                        var curElem = $( this ),
                            winHeight = curElem.height(),
                            scrollValue = curElem.scrollTop();

                        if ( scrollValue > 2*winHeight ) {
                            _topBtn.addClass( 'active' );
                        } else  {
                            _topBtn.removeClass( 'active' );
                        }
                    }
                });

            },
            _scrollTop = function() {

                $('html, body').animate({ scrollTop: 0 }, _scrollDuration);

            },
            _init = function() {
                _addEvents();
            };

        //public properties

        //public methods

        _init();
    };

} )();