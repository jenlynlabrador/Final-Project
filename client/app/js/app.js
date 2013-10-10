$(function() {

    var app = {
        init: function() {
            this.user = {};
            $('.menu-crud').addClass('hidden');
            $('.menu-user').addClass('hidden');
            $('.menu-loading').removeClass('hidden');
            $('.menu-user').addClass('hidden');
            $('.btn-login').addClass('hidden');

            $('.btn-login').attr('href', '/api/login?url=/');
            $('.btn-logout').attr('href','/api/logout?url=/');

            this.router = new Router();
            this.setEventListeners();
            this.getUser();

            Backbone.history.start({pushState: true});
        },

        setEventListeners: function() {
            var self = this;
            $('.menu-crud .item a').click(function(ev) {
                var $el = $(ev.target).closest('.item');

                $('.menu-crud .item').removeClass('active');
                $el.addClass("active");

                if ($el.hasClass('menu-list')) {
                    self.router.navigate('list', {trigger: true});
                }

                if ($el.hasClass('menu-create')) {
                    self.router.navigate('new', {trigger: true});
                }
            });

            $('.navbar-brand').click(function() {
                self.router.navigate('', {trigger: true});
                $('.menu-create').removeClass('active');
                $('.menu-list').removeClass('active');
            });
        },

        getUser: function() {
            var self = this;
            $.ajax({
                method: 'GET',
                url: '/api/users/me',
                success: function(me) {
                    // user is already signed in
                    console.log(me);
                    self.user = me;
                    self.showLogout();
                },

                error: function(err) {
                    console.log('you have not authenticated');
                    self.showLogin();
                }
            });
        },
        showLogin: function() {
           $('.menu-loading').addClass('hidden');
           $('.menu-user').addClass('hidden');
           $('.btn-login').removeClass('hidden');

        },
        showLogout: function() {
           $('.menu-crud').removeClass('hidden');
           $('.user-email').text(this.user.email);
           $('.menu-loading').addClass('hidden');
           $('.btn-login').addClass('hidden');
           $('.menu-user').removeClass('hidden');
        },
        showHome: function() {
            $('.app-content').html('');
        },
        showList: function() {
            var $listTemplate = getTemplate('tpl-thesis-list');
            $('.app-content').html($listTemplate);
            this.loadAllThesis();
        },
        showForm: function(object) {
            if (!object) {
                object = {};
            }
            var self = this;
            var $formTemplate = getTemplate('tpl-thesis-form', object);
            $('.app-content').html($formTemplate);


            $('form').unbind('submit').submit(function(ev) 
            {
                $.get('/api/thesis', self.save);
                return false;
            });

        },
        loadAllThesis: function() {
            $.get('/api/thesis', this.displayLoadedList);
        },
        displayLoadedList: function(list) {
            console.log('response', list);
            //  use tpl-thesis-list-item to render each loaded list and attach it

            for (var i = 0; i < list.length; i++)
            {
                $('.thesis-list').append(getTemplate('tpl-thesis-list-item', list[i]));
            }
            
            $('.table tbody tr').click(function (event)
            {
                app.router.navigate('thesis-' + $(this).attr('data-id'), {trigger: true});
                fbcomment(document, 'script', 'facebook-jssdk');

            });

        },
        save: function(object) {
            var self = this;

            var thesisObject = {};
            var inputs = $('form').serializeArray();
            for (var i = 0; i < inputs.length; i++) {
                thesisObject[inputs[i].name] = inputs[i].value;
            }
            
            if (thesisObject.Title.length != 0){
                var sameThesis = false;
                
                for (var i = 0; i < object.length; i++){
                    if (thesisObject.Title == object[i].Title){
                        sameThesis = true;
                        break;
                    }
                }
                
                if (sameThesis){
                    alert("Thesis duplicate error.");
                }else{
                    $.post('/api/thesis', thesisObject);
                    alert("Thesis Successfully Added!");
                }
            }else{
                alert("WARNING! Title and Description Required.");
            }
        },
        viewEachThesis: function(object) {
           $('.app-content').html(getTemplate('tpl-thesis-show-item', object));
        }
    };

    function getTemplate(template_id, context) {
        var template, $template, markup;
        template = $('#' + template_id);
        $template = Handlebars.compile(template.html());
        markup = $template(context);
        return markup;

    }

    function fbcomment(d, s, id)
    {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=520243734709082";
        fjs.parentNode.insertBefore(js, fjs);
    }


    var Router = Backbone.Router.extend({
        routes: {
            '': 'onHome',
            'thesis-:id': 'onView',
            'new': 'onCreate',
            'edit': 'onEdit',
            'list': 'onList'
        },

       onHome: function() {
            app.showHome();
       },

       onView: function(id) {
           console.log('thesis id', id);
           $.get('api/thesis/' + id, app.viewEachThesis);
       },

       onCreate: function() {
            app.showForm();
       },

       onEdit: function() {

       },

       onList: function() {
            app.showList();
       }

    });
    app.init();


});