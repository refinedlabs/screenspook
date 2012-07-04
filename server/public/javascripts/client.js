$(document).ready(function() {

    var pendingShotsTemplateSrc   = $("#pending-shots-template").html();
    var pendingShotsTemplate = Handlebars.compile(pendingShotsTemplateSrc);

    var acceptedShotsTemplateSrc   = $("#accepted-shots-template").html();
    var acceptedShotsTemplate = Handlebars.compile(acceptedShotsTemplateSrc);

    var setupAcceptShot = function() {
        $('.acceptShot').bind('click', function(event) {
            var shotId = event.currentTarget.dataset.shotid;
            console.log('accept' , shotId);

            var el = event.currentTarget;

            $.ajax({
                url: '/accept/' + shotId,
                success: function(data, textStatus, jqXHR) {
                    if (data.ok) {
                        // hide the complete shot.
                        console.log('accepted');
                        $(el).parent().parent().fadeOut(500, reload);
                    }
                },
                dataType: 'json'
            });
        });
    };

    var reload =  function() {
        $.ajax({
            url : '/overview',
            success: function(data) {
                $('#pendingShots').html(pendingShotsTemplate({items:data.pendingShots}));
                $('#acceptedShots').html(acceptedShotsTemplate({items:data.acceptedShots}));
                setupAcceptShot();
                $('.fancybox').fancybox();
            }
        });
    };

    $('.reloadButton').bind('click', reload);

    reload();

});
