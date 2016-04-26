var Linote = {
    _getSingle: function( fn ) {
        var result;
        return function() {
            return result || ( result = fn.apply(this, arguments) );
        }
    },

    _createNote: function() {
        var $note = $([
            '<li><div class="note">',
            '<p class="title"></p>',
            '<p class="text"></p>',
            '<p class="time"></p>',
            '</div></li>'
        ].join(''));
        return $note;
    },

    _throttle: function(method, context, data, interval) {
        clearTimeout(method.tId);
        method.tId = setTimeout(function() {
            method.call(context, data);
        }, interval || 300);
    },

    _getTags: function() {
        var tags = new Array();
        $('#tag-line span.tag').each(function() {
            tags.push( $(this).text() );
        });
        return tags.join(' ');
    },

    _save: function(mask) {
        var input = $('#notebody textarea').val().split('\n');
        var $li = $('#notelist li.selected');
        var note = {
            id: $li.attr('id'),
            time: Date.now() / 1000,
            tag: this._getTags(),
            title: input.shift(),
            text: input.join('\n')
        }

        Linote.ajax({'type': 'saveNote', note: JSON.stringify(note)}, function(data) {
            if (!$li.attr('id')) {
                $li.attr('id', data);
                $li.find('p.time').text( Math.floor(Date.now()/1000) );
            }
            if (!mask) {
                Linote.updateTaglist();
            }
        });
    },

    _getNotesFrom: function(key, value) {
        Linote.ajax({'type': 'getNotes', 'key': key, 'value': value}, function(data) {
            var div = $.parseHTML(data);

            if (key === 'trash') {
                $('#trashlist ul').replaceWith(div);
                return true;
            }

            $('#notelist ul').replaceWith(div);
            if ($(div).children().length > 0) {
                $(div).children().first().trigger('click');
                if (key === 'tag') { return false; }

                // Highlight the search results
                $(div).find('p').each(function() {
                    var text = this.firstChild;
                    if (text && text.nodeValue != '') {
                        var offset = text.nodeValue.toLowerCase().indexOf(value.toLowerCase());
                        if (offset > -1) {
                            var range = document.createRange();
                            var span = document.createElement('span');
                            span.setAttribute('class', 'highlight');
                            range.setStart(text, offset);
                            range.setEnd(text, offset + value.length);
                            range.surroundContents(span);
                            range = null;
                        }
                    }
                });
            } else {
                $('#notebody textarea').val('');
                Linote.resetTags('');
            }
        });
    },

    _search: function(input) {
        this._getNotesFrom('keyword', input);
    },

    ajax: function( obj, callback ) {
        $.post( 'query.php', obj, function( data ) {
            callback( data );
        });
    },

    addNote: function() {
        var $note = this._getSingle( this._createNote )();
        $note.clone().prependTo('#notelist ul')
        .siblings().removeClass('selected').end()
        .addClass('selected');

        $('#notebody textarea').val('').focus();
        Linote.resetTags('');
    },

    deleteNotes: function() {
        var ids = new Array();
        var $li = $('#notelist li.selected');

        $li.each(function() {
            var id = $(this).attr('id');
            if (id !== undefined) {
                ids.push(id);
            }
        }).remove();
        if (ids.length < 1) { return false; }

        Linote.ajax({'type': 'deleteNotes', 'value': ids.join(',')}, function(data) {
            Linote.getTrash();
            Linote.updateTaglist();
        });

        $('#notelist li:first-child').trigger('click');
        if ( $('#notelist li').length < 1 ) {
            if ( $('div.taglist li.selected').length > 0 ) {
                $('div.taglist li.head').trigger('click');
            } else {
                $('#notebody textarea').val('').focus();
            }
        }

    },

    restoreNotes: function(ids) {
        if (ids.length < 1) { return false; }
        Linote.ajax({'type': 'restoreNotes', 'value': ids.join(',')}, function(data) {
            var $li = $('div.taglist li');
            Linote.updateTaglist();

            if ( $li.filter('.selected').length > 0 ) { return false; }
            $li.filter('.head').trigger('click');
        });
    },

    permanentDelete: function(ids) {
        Linote.ajax({'type': 'permanentDelete', 'value': ids.join(',')}, function(data) {
        });
    },

    saveNote: function(mask) {
        this._throttle(this._save, this, mask);
    },

    searchNotes: function(input) {
        this._throttle(this._search, this, input, 100);
    },

    getNotesFromTag: function(tagname) {
        this._getNotesFrom('tag', tagname);
    },

    getTrash: function() {
        this._getNotesFrom('trash', '');
    },

    updateNotelist: function() {
        if ($('#notelist li').length < 1) {
            var $note = this._getSingle( this._createNote )();
            $note.clone().prependTo('#notelist ul').addClass('selected');
        }
        var note = $('#notebody textarea').val().split('\n');
        var title = $.trim(note.shift()).substr(0, 120),
            text = $.trim(note.join('\n')).split('\n').shift().substr(0, 120);

        $('#notelist li.selected div')
        .children('p.title').text(title).end()
        .children('p.text').text(text);
    },

    updateTaglist: function() {
        Linote.ajax({'type': 'getTaglist'}, function(data) {
            var div = $.parseHTML(data);
            var $li = $('div.taglist li.selected');

            if ($li.length > 0) {
                $(div).children(':contains(' + $li.children('.tagname').text() + ')').addClass('selected');
            }
            $('div.taglist ul').replaceWith(div);

        });
    },

    noteInfo: function() {
        var text = $('#notebody textarea').val();
        var stamp = $('#notelist li.selected p.time').text();

        var datetime = new Date( stamp * 1000 );
        var ftime = [
            datetime.getFullYear(),
            '年',
            datetime.getMonth() + 1,
            '月',
            datetime.getDate(),
            '日 ',
            datetime.getHours(),
            ':',
            datetime.getMinutes()
        ].join('');

        var nonblank = text.match(/\S/g);
        if (nonblank == null) { return false; }

        var $lines = $('div.info tr');
        $lines.filter('.created').children(':last-child').text(ftime);
        $lines.filter('.nonblank').children(':last-child').text(nonblank.length);
        $lines.filter('.total').children(':last-child').text(text.length);

        $('div.shadow').fadeIn();
        $('div.info').slideToggle();
    },

    showTags: function() {
        var $list = $('div.taglist');
        if ( $list.is(':visible') ) {
            $list.slideUp();
            return false;
        }
        $list.slideDown();
    },

    showMenu: function() {
        $('div.shadow').fadeIn();
        $('#sideslip').animate({
            left: 0
        }, 400);
    },

    hideMenu: function() {
        $('div.shadow').fadeOut();
        $('#sideslip').animate({
            left: -320
        }, 400);
    },

    logOut: function(target) {
        $('div.logout').css({
            right: 16,
            top: $(target).offset().top + $(target).height()
        }).slideToggle(320);
    },

    resetTags: function(tags) {
        $('#tag-line li').filter(function(index) {
            var length = $('#tag-line li').length;
            return index < length - 1;
        }).remove();

        if (tags != '') {
            tags = tags.split(' ');
            list = '';
            while (tag = tags.shift()) {
                list += [
                    '<li><span class="tag">',
                    tag,
                    '</span></li>'
                ].join('');
            }
            $('#tag-line').prepend(list).find('input').attr('placeholder', '');
        } else {
            $('#tag-line input').attr('placeholder', '添加标签...');
        }
    }
};
// Prepare needed elements on startup
$(document).ready(function() {
    // Shadow div to cover unwanted elements below
    $('<div>').addClass('shadow').prependTo('body').hide();

    // Option menu in trash
    (function() {
        var $restore = $('<li>').addClass('restore').text('还原笔记');
        var $delete = $('<li>').addClass('delete').text('彻底删除笔记');
        var $list = $('<ul>').prepend($restore, $delete);
        $('<div>').addClass('options').prepend($list).prependTo('body').hide();
    })();

    // User logout
    (function() {
        $link = $('<a>').attr('id', 'logout').text('退出登陆');
        $('<div>').addClass('logout').prepend($link).prependTo('body').hide();
    })();

    // Note info
    (function() {
        var $table = $('<table>').html('<tr class="created"><td>创建日期</td><td></td></tr>' +
                                       '<tr class="nonblank"><td>非空字符数</td><td></td></tr>' +
                                       '<tr class="total"><td>总字符数</td><td></td></tr>');
        var $info = $('<div>').addClass('info').prepend($table).prependTo('body').hide();
    })();
});

$(document).ready(function() {
    $('.container a').click(function(event) {
        event.preventDefault();
        var target = event.target;
        var id = target.id;

        switch (id) {
            case 'icon-add':
                Linote.addNote();
                break;
            case 'icon-delete':
                Linote.deleteNotes();
                break;
            case 'icon-info':
                Linote.noteInfo();
                break;
            case 'icon-tag':
                Linote.showTags();
                break;
            case 'icon-menu':
                Linote.showMenu();
                break;
            case 'icon-back':
                Linote.hideMenu();
                break;
            case 'icon-user':
                Linote.logOut( target );
                break;
            default:
                break;
        }
    });

    // Click a note in notelist
    $(document).on('click', '#notelist li', function(event) {
        if (event.ctrlKey) {
            if ( $('#notelist li.selected').length == 1 && $(this).hasClass('selected') ) { return false; }
            $(this).toggleClass('selected');
        } else {
            $(this).siblings().removeClass('selected').end().addClass('selected');
            $('#tag-line input').val('');
            var id = $(this).attr('id');
            if (id == null) {
                $('#notebody textarea').val('');
                Linote.resetTags('');
                return false;
            }

            Linote.ajax({'type': 'getNote', 'value': id}, function(data) {
                var note = JSON.parse(data);
                $('#notebody textarea').val(note.title + '\n' + note.text);
                Linote.resetTags(note.tag);
            });
        }
    });

    // Click a tag in taglist
    $(document).on('click', 'div.taglist li', function(event) {
        var tagname = $(this).children('.tagname').text();
        $(this).siblings().removeClass('selected').end().addClass('selected');
        $('#icon-tag').addClass('notice');
        $('input.searchbox').val('');

        if ( $(this).hasClass('head') ) {
            $(this).removeClass('selected');
            $('#icon-tag').removeClass('notice');
        }
        Linote.getNotesFromTag(tagname);
    });

    // Log out
    $('div.logout a').click(function() {
        $(this).hide();
        $.post('index.php', {'logout': true}, function(data) {
            location.assign("index.php");
        });
    });

    // Save note on input
    $('#notebody textarea').on('input', function() {
        Linote.updateNotelist();
        Linote.saveNote(true);
    });

    // Add or delete tags
    $('#tag-line input').on('keydown', function(event) {
        var key = event.keyCode;
        var input = $(this).val();

        if (key === 32) {
            // Space pressed
            if ( (input = $.trim(input)) != '' ) {
                var $tag = $('<span>').addClass('tag').text(input).prependTo('<li>');
                $(this).val('').parent().before($tag.parent());
                Linote.saveNote();
                return false;
            }
        } else if ( (key === 8 || key === 46) && input == '' && $('#tag-line span').length > 0 ) {
            // Backspace or Delete pressed
            $(this).blur().parent().prev().children().addClass('selected');
            return false;
        }
    });

    // Search notes
    $('input.searchbox').on('input', function() {
        var input = $.trim( $(this).val() );
        Linote.searchNotes(input);
        $('div.taglist li').removeClass('selected');
        $('#icon-tag').removeClass('notice');
    }).on('keydown', function(event) {
        if (event.keyCode === 27) {
            var input = $.trim( $(this).val() );
            input == '' ? $(this).blur() : $(this).val('');
            // Get all when no keyword provided
            Linote.searchNotes( $(this).val() );
        }
    });

    $(document).on('keydown', function(event) {
        var key = event.keyCode;
        var $tag = $('#tag-line span.selected');
        if ( (key === 8 || key === 46) && $tag.length > 0 ) {
            $tag.parent().remove();
            $('#tag-line input').focus();

            Linote.saveNote();
            return false;
        }
    });
});

$(document).ready(function() {
    // Hide elements if clicked anywhere else
    $(document).click(function(event) {
        var target = $(event.target);

        if (target.hasClass('shadow')) {
            target.fadeOut();
            Linote.hideMenu();
            $('div.info').slideUp();
        }
        
        if (!target.hasClass('tag')) {
            $('#tag-line span.tag').removeClass('selected');
        }
        
        if (target.attr('id') != 'icon-user') {
            $('div.logout').slideUp();
        }

        if (target.attr('id') != 'icon-tag') {
            $('div.taglist').hide();
        }

        $('div.options').hide();
    });

    // Toggle status of a tag
    $(document).on('click', 'span.tag', function() {
        $(this).toggleClass('selected');
    });

    // Hide placeholder description when focus
    $('#tag-line input').focus(function() {
        $(this).attr('placeholder', '');
    }).blur(function() {
        $(this).parent().siblings().length > 0 ?  $(this).attr('placeholder', '') : $(this).attr('placeholder', '添加标签...');
    });

    // Load the first note on startup
    $('#notelist li:first-child').trigger('click');

    // When the side panel is ready
    $('#sideslip').ready(function() {
        // Register button event;
        $('#sideslip span.menu').click(function(event) {
            var target = event.target;
            var id = target.id;

            $('#sideslip span.menu').removeClass('selected')
            $(this).addClass('selected');

            $('#sideslip .body > div').hide()
            .filter('.' + id).css({
                height: '100%',
            }).show();

            switch (id) {
                case 'settings':
                    break;
                case 'export':
                    break;
                case 'trash':
                    Linote.getTrash();
                    break;
                default:
                    break;
            }
        });

        // Click a note in trash
        $(document).on('click', '#trashlist li', function(event) {
            if (event.ctrlKey) {
                $(this).toggleClass('selected');
            } else {
                $(this).siblings().removeClass('selected').end().addClass('selected');
            }
        });

        // Show options menu on right click
        $(document).on('contextmenu', '#trashlist li', function(event) {
            if ( $('#trashlist li.selected').length < 2) {
                $(this).siblings().removeClass('selected').end().addClass('selected');
            }
            $('div.options').css({
                left: event.clientX,
                top: event.clientY
            }).show();
            return false;
        });

        // Click an option
        $(document).on('click', 'div.options li', function(event) {
            var ids = new Array();
            var $li = $('#trashlist li.selected');

            $li.each(function() {
                ids.push( $(this).attr('id') );
            });
            $(this).hasClass('restore') ?  Linote.restoreNotes(ids) : Linote.permanentDelete(ids);
            $li.remove();
        });

        // Click the menu below
        $('#shortcut li').click(function(event) {
            var ids = new Array();
            $li = $('#trashlist li');

            $li.each(function() {
                ids.push( $(this).attr('id') );
            });

            event.target.id === 'restoreAll' ? Linote.restoreNotes(ids) : Linote.permanentDelete(ids);
            $li.remove();
        });

        // Load trash notes on initial
        $('#trash').trigger('click');
    });
});
