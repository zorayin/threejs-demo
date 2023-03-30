/**
 * Arctext.js
 * A jQuery plugin for curved text
 * http://www.codrops.com
 *
 * Copyright 2011, Pedro Botelho / Codrops
 * Free to use under the MIT license.
 *
 * Date: Mon Jan 23 2012
 */
 import $ from "jquery";


 (function( $, undefined ) {
    
    /*! 
    * FitText.js 1.0
    *
    * Copyright 2011, Dave Rupert http://daverupert.com
    * Released under the WTFPL license 
    * http://sam.zoy.org/wtfpl/
    *
    * Date: Thu May 05 14:23:00 2011 -0600
    */
    $.fn.fitText = function( kompressor, options ) {

        var settings = {
            'minFontSize' : Number.NEGATIVE_INFINITY,
            'maxFontSize' : Number.POSITIVE_INFINITY
        };

        return this.each(function() {
            var $this = $(this);              // store the object
            var compressor = kompressor || 1; // set the compressor
    
            if ( options ) { 
              $.extend( settings, options );
            }
    
            // Resizer() resizes items based on the object width divided by the compressor * 10
            var resizer = function () {
                $this.css('font-size', Math.max(Math.min($this.width() / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
            };

            // Call once to set.
            resizer();

            // Call on resize. Opera debounces their resize by default. 
            $(window).resize(resizer);
        });

    };

    /*
     * Lettering plugin
     *
     * changed injector function:
     *   add &nbsp; for empty chars.
     */
    function injector(t, splitter, klass, after) {
        var a = t.text().split(splitter), inject = '', emptyclass;
        if (a.length) {
            $(a).each(function(i, item) {
                emptyclass = '';
                if(item === ' ') {
                    emptyclass = ' empty';
                    item='&nbsp;';
                }   
                inject += '<span class="'+klass+(i+1)+emptyclass+'">'+item+'</span>'+after;
            }); 
            t.empty().append(inject);
        }
    }
    
    var methods             = {
        init : function() {

            return this.each(function() {
                injector($(this), '', 'char', '');
            });

        },

        words : function() {

            return this.each(function() {
                injector($(this), ' ', 'word', ' ');
            });

        },
        
        lines : function() {

            return this.each(function() {
                var r = "eefec303079ad17405c889e092e105b0";
                // Because it's hard to split a <br/> tag consistently across browsers,
                // (*ahem* IE *ahem*), we replaces all <br/> instances with an md5 hash 
                // (of the word "split").  If you're trying to use this plugin on that 
                // md5 hash string, it will fail because you're being ridiculous.
                injector($(this).children("br").replaceWith(r).end(), r, 'line', '');
            });

        }
    };

    $.fn.lettering          = function( method ) {
        // Method calling logic
        if ( method && methods[method] ) {
            return methods[ method ].apply( this, [].slice.call( arguments, 1 ));
        } else if ( method === 'letters' || ! method ) {
            return methods.init.apply( this, [].slice.call( arguments, 0 ) ); // always pass an array
        }
        $.error( 'Method ' +  method + ' does not exist on jquery.lettering' );
        return this;
    };
    
    /*
     * Arctext object.
     */
    $.Arctext  = function( options, element ) {
    
        this.$el    = $( element );
        this._init( options );
        
    };
    
    $.Arctext.defaults      = {
        radius  : 0,    // the minimum value allowed is half of the word length. if set to -1, the word will be straight.
        dir     : 1,    // 1: curve is down, -1: curve is up.
        rotate  : true, // if true each letter will be rotated.
        fitText : false // if you wanna try out the fitText plugin (http://fittextjs.com/) set this to true. Don't forget the wrapper should be fluid.
    };
    
    $.Arctext.prototype     = {
        _init               : function( options ) {
            
            this.options        = $.extend( true, {}, $.Arctext.defaults, options );
            
            // apply the lettering plugin.
            this._applyLettering();
            
            this.$el.data( 'arctext', true );
            
            // calculate values
            this._calc();
            
            // apply transformation.
            this._rotateWord();
            
            // load the events
            this._loadEvents();
            
        },
        _applyLettering     : function() {
        
            this.$el.lettering();
            console.log(this.$el)
            
            if( this.options.fitText )
                this.$el.fitText();
            
            this.$letters   = this.$el.find('span').css('display', 'inline-block');
        
        },
        _calc               : function() {
            
            if( this.options.radius === -1 )
                return false;
            
            // calculate word / arc sizes & distances.
            this._calcBase();
            
            // get final values for each letter.
            this._calcLetters();
        
        },
        _calcBase           : function() {
            // 总字宽(字母宽度之和)
            this.dtWord     = 0;
            
            var _self       = this;
            
            this.$letters.each( function(i) {
                                
                var $letter         = $(this),
                    letterWidth     = $letter.outerWidth( true );
                
                _self.dtWord += letterWidth;
                console.log(_self.dtWord)
                
                // 保存每个字母的中心点:
                $letter.data( 'center', _self.dtWord - letterWidth / 2 );
                
            });
            console.log(this.$letters)
            
            // 这个词的中点。
            var centerWord = this.dtWord / 2;
            
            // 检查半径:允许的最小值是单词长度的一半。
            if( this.options.radius < centerWord )
                this.options.radius = centerWord;
            
            // 总弧段长度，字母将放置的地方。
            this.dtArcBase  = this.dtWord;
            
            // 计算从第一个字母(x=0)开始到最后一个字母(x=this.dtWord)结束的弧(长度)。
            // 首先让我们计算底边为这个的三角形的角度。dtArcBase和其他两条边=半径。
            var angle       = 2 * Math.asin( this.dtArcBase / ( 2 * this.options.radius ) );
            
            // 给定公式:L(长)= R(半径)x A(角度)，我们计算弧长。
            this.dtArc      = this.options.radius * angle;
            
        },
        _calcLetters        : function() {
            
            var _self       = this,
                iteratorX   = 0;
                
            this.$letters.each( function(i) {
                    
                var $letter         = $(this),
                    // 计算每个字母的半圆弧给出每个字母对原始单词的百分比。
                    dtArcLetter     = ( $letter.outerWidth( true ) / _self.dtWord ) * _self.dtArc,
                    // 给定半径，dtArcLetter的角度。
                    beta            = dtArcLetter / _self.options.radius,
                    // 半圆弧弦的中点到圆心的距离。
                    // 这将是字母将被放置的地方。
                    h               = _self.options.radius * ( Math.cos( beta / 2 ) ),
                    // x轴和弦最左边的点形成的角。
                    alpha           = Math.acos( ( _self.dtWord / 2 - iteratorX ) / _self.options.radius ),
                    // x轴和弦的最右点形成的角度。
                    theta           = alpha + beta / 2,
                    // 由h和正交于x轴的三角形两边的距离。
                    x               = Math.cos( theta ) * h,
                    y               = Math.sin( theta ) * h,
                    // 弦的中点的坐标x的值。
                    xpos            = iteratorX + Math.abs( _self.dtWord / 2 - x - iteratorX ),
                    //最后，计算每个字母的中心点对应的翻译量。
                    //也计算角度，以旋转相应的字母。
                    xval    = 0| xpos - $letter.data( 'center' ),
                    yval    = 0| _self.options.radius - y,
                    angle   = ( _self.options.rotate ) ? 0| -Math.asin( x / _self.options.radius ) * ( 180 / Math.PI ) : 0;
                    console.log(iteratorX)
                
                //迭代器将被定位在每个半圆弧的第二个点上
                iteratorX = 2 * xpos - iteratorX;
                
                // 保存这些值
                $letter.data({
                    x   : xval,
                    y   : ( _self.options.dir === 1 ) ? yval : -yval,
                    a   : ( _self.options.dir === 1 ) ? angle : -angle
                });
                    
            });
        
        },
        _rotateWord         : function( animation ) {
            
            if( !this.$el.data('arctext') ) return false;
            
            var _self = this;
            
            this.$letters.each( function(i) {
                
                var $letter         = $(this),
                    transformation  = ( _self.options.radius === -1 ) ? 'none' : 'translateX(' + $letter.data('x') + 'px) translateY(' + $letter.data('y') + 'px) rotate(' + $letter.data('a') + 'deg)',
                    transition      = ( animation ) ? 'all ' + ( animation.speed || 0 ) + 'ms ' + ( animation.easing || 'linear' ) : 'none';
                
                $letter.css({
                    '-webkit-transition' : transition,
                    '-moz-transition' : transition,
                    '-o-transition' : transition,
                    '-ms-transition' : transition,
                    'transition' : transition
                })
                .css({
                    '-webkit-transform' : transformation,
                    '-moz-transform' : transformation,
                    '-o-transform' : transformation,
                    '-ms-transform' : transformation,
                    'transform' : transformation
                });
            
            });
            
        },
        _loadEvents         : function() {
            
            if( this.options.fitText ) {
            
                var _self = this;
                
                $(window).on( 'resize.arctext', function() {
                    
                    _self._calc();
                    
                    // apply transformation.
                    _self._rotateWord();
                    
                });
            
            }
        
        },
        set                 : function( opts ) {
            
            if( !opts.radius &&  
                !opts.dir &&
                opts.rotate === 'undefined' ) {
                    return false;
            }
            
            this.options.radius = opts.radius || this.options.radius;
            this.options.dir    = opts.dir || this.options.dir;
            
            if( opts.rotate !== undefined ) {
                this.options.rotate = opts.rotate;
            }   
            
            this._calc();
            
            this._rotateWord( opts.animation );
            
        },
        destroy             : function() {
            
            this.options.radius = -1;
            this._rotateWord();
            this.$letters.removeData('x y a center');
            this.$el.removeData('arctext');
            $(window).off('.arctext');
            
        }
    };
    
    var logError            = function( message ) {
        if ( this.console ) {
            console.error( message );
        }
    };
    
    $.fn.arctext            = function( options ) {
    
        if ( typeof options === 'string' ) {
            
            var args = Array.prototype.slice.call( arguments, 1 );
            
            this.each(function() {
            
                var instance = $.data( this, 'arctext' );
                
                if ( !instance ) {
                    logError( "cannot call methods on arctext prior to initialization; " +
                    "attempted to call method '" + options + "'" );
                    return;
                }
                
                if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
                    logError( "no such method '" + options + "' for arctext instance" );
                    return;
                }
                
                instance[ options ].apply( instance, args );
            
            });
        
        } 
        else {
        
            this.each(function() {
            
                var instance = $.data( this, 'arctext' );
                if ( !instance ) {
                    $.data( this, 'arctext', new $.Arctext( options, this ) );
                }
            });
        
        }
        
        return this;
        
    };
    
})( $ );
