var getSingle = function( fn ) {
    var result;
    return function() {
        return result || ( result = fn.apply(this, arguments) );
    }
};

var createWarningDiv = function( msg ) {
    var div = document.createElement( 'div' );
    div.innerHTML = msg;
    div.style.display = 'none';
    div.setAttribute('class', 'warning');
    document.body.appendChild( div )
    return div;
}

var singleWarning = getSingle( createWarningDiv );

function getElementLeft(element){
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    while (current !== null){
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }
    return actualLeft;
}

function getElementTop(element){
    var actualTop = element.offsetTop;
    var current = element.offsetParent;
    while (current !== null){
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }
    return actualTop;
}
// Login form
$(document).ready(function() {
    $('.login form').submit(function(event) {
        $('input.text').each(function() {
            var value = $.trim($(this).val());
            if (value == '') {
                var $submit = $('input.submit');
                var warning = singleWarning('您还有表单没填哦！');
                $(warning).addClass('blank').css({
                    display: 'block',
                    left: getElementLeft($submit[0]) + $submit.width(),
                    top: (parseInt($submit.offset().top) + 2) + 'px'
                });
                return false;
            }
        });

        if ( !$('div.warning').is(':visible') ) {
            var user = {
                username: $('#username').val(),
                password: $('#password').val()
            };
            $.ajax({
                url: 'query.php',
                data: {'type': 'login', 'user': JSON.stringify(user)},
                async: false,
                success: function(data) {
                    if (data != 1) {
                        if ($('div.warning.error').text() != '') {
                            $('div.warning.error').show();
                        } else {
                            var $submit = $('input.submit');
                            $('<div class="warning error">用户名或密码不正确</div>').css({
                                left: getElementLeft($submit[0]) + $submit.width(),
                                top: (parseInt($submit.offset().top) + 2) + 'px'
                            }).prependTo('body');
                        }
                        event.preventDefault();
                    }
                }
            });
        } else {
            event.preventDefault();
        }
    });

    // Skip space character
    $('.login input.text').on('keypress', function(event) {
        var keyCode = event.keyCode;
        if (keyCode == 32) {
            event.preventDefault();
        }
        if ( $('div.warning').is(':visible') ) {
            $('div.warning').hide();
        }
    });
    $('.login input.text').focus(function() {
        if ( $('div.warning').is(':visible') ) {
            $('div.warning').hide();
        }
    });
    $('.register input.text').focus(function() {
        if ($('div.warning.blank').text() != '') {
            $('div.warning.blank').hide();
        }
    });

    // Register form
    $('.register form').submit(function(event) {
        $('input.text').each(function() {
            var value = $.trim($(this).val());
            if (value == '') {
                var $submit = $('input.submit');
                var warning = singleWarning('您还有表单没填哦！');
                $(warning).addClass('blank').css({
                    display: 'block',
                    left: getElementLeft($submit[0]) + $submit.width(),
                    top: (parseInt($submit.offset().top) + 2) + 'px'
                });
                return false;
            }
        });
        if ( $('div.warning').is(':visible') ) {
            event.preventDefault();
        }
    });

    // Username check
    $('.register #username').on('keypress', function(event) {
        var key = event.charCode || event.keyCode;
        // Firefox get 0 for non-print characters
        if (event.charCode === 0) { return true; }
        if ( !/\d|\w/.test(String.fromCharCode(key)) ) {
            if ($('div.warning.username').text() != '') {
                $('div.warning.username').show();
            } else {
                var $warning = $('<div class="warning username">用户名仅由字母、数字和下划线组成</div>').css({
                    left: getElementLeft($(this)[0]) + $(this).width(),
                    top: $(this).offset().top
                });
                if ( !$('div.warning.occupied').is(':visible') ) {
                    $warning.prependTo('body').show();
                }
            }
            event.preventDefault();
        } else {
            if ($('div.warning.username').text() != '') {
                $('div.warning.username').hide();
            }
        }
    }).blur(function() {
        if ($('div.warning.username').text() != '') {
            $('div.warning.username').hide();
        }
        var input = $(this).val();
        var that = this;
        if (input != '') {
            $.post('query.php', {'type': 'queryUser', 'value': input}, function(data) {
                if (input == data) {
                    if ($('div.warning.occupied').text() != '') {
                        $('div.warning.occupied').show();
                    } else {
                        var $warning = $('<div class="warning occupied">该用户名已被占用！</div>').css({
                            left: getElementLeft($(that)[0]) + $(that).width(),
                            top: $(that).offset().top
                        });
                        $warning.prependTo('body').show();
                    }
                }
            });
        }
        if ($('div.warning.occupied').text() != '') {
            $('div.warning.occupied').hide();
        }
    });;
    // Password check
    $('.register #password').blur(function() {
        var password = $(this).val();
        var confirm = $('.register #confirm').val();

        if (password.length < 6) {
            var $warning = $('<div class="warning length">密码最少为6位</div>').css({
                left: getElementLeft($(this)[0]) + $(this).width(),
                top: $(this).offset().top
            });
            $warning.prependTo('body').show();
        } else {
            $('div.warning.length').hide();
        }
    });

    $('.register #confirm').blur(function() {
        var confirm = $(this).val();
        var password = $('.register #password').val();

        if (confirm != password) {
            var $warning = $('<div class="warning differ">两次输入的密码不一致，请重新输入</div>').css({
                left: getElementLeft($(this)[0]) + $(this).width(),
                top: $(this).offset().top
            });
            $warning.prependTo('body').show();
        } else {
            $('div.warning.differ').prependTo('body').hide();
        }
    });
    // Email check
    $('.register #email').blur(function() {
        var email = $.trim($(this).val());
        if (email == '') {
            if ($('div.warning.email').text() != '') {
                $('div.warning.email').hide();
            }
            $(this).val('');
            return false;
        }
        var pattern = /^\b(\w[-.\w]*\@[-a-z0-9]+(\.[-a-z0-9]+)*\.(com|edu|info|cn))\b$/;
        if (!pattern.test(email)) {
            if ($('div.warning.email').text() != '') {
                $('div.warning.email').show();
            } else {
                var $warning = $('<div class="warning email">Email 格式不正确，请仔细查看并修改</div>').css({
                    left: getElementLeft($(this)[0]) + $(this).width(),
                    top: $(this).offset().top
                })
                $warning.prependTo('body').show();
            }
        } else {
            if ($('div.warning.email').text() != '') {
                $('div.warning.email').hide();
            }
        }
        $(this).val(email);
    });
});
