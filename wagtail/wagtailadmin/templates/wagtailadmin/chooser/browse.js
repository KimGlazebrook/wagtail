function(modal) {
    /* Set up page navigation and link-types links to open in the modal */
    $('a.navigate-pages, .link-types a', modal.body).click(function() {
        modal.loadUrl(this.href);
        return false;
    });

    /*
    Set up submissions of the search form to open in the modal.

    FIXME: wagtailadmin.views.chooser.browse doesn't actually return a modal-workflow
    response for search queries, so this just fails with a JS error.
    Luckily, the search-as-you-type logic below means that we never actually need to
    submit the form to get search results, so this has the desired effect of preventing
    plain vanilla form submissions from completing (which would clobber the entire
    calling page, not just the modal). It would be nice to do that without throwing
    a JS error, that's all...
    */
    modal.ajaxifyForm($('form.search-form', modal.body));

    /* Set up search-as-you-type behaviour on the search box */
    var searchUrl = $('form.search-form', modal.body).attr('action');

    function search() {
        $.ajax({
            url: searchUrl,
            data: {
                q: $('#id_q', modal.body).val(),
                results_only: true
            },
            success: function(data, status) {
                $('.page-results', modal.body).html(data);
                ajaxifySearchResults();
            }
        });
        return false;
    }

    $('#id_q', modal.body).on('input', function() {
        clearTimeout($.data(this, 'timer'));
        var wait = setTimeout(search, 200);
        $(this).data('timer', wait);
    });

    /* Set up behaviour of choose-page links in the newly-loaded search results,
    to pass control back to the calling page */
    function ajaxifySearchResults() {
        $('.page-results a.choose-page', modal.body).click(function() {
            var pageData = $(this).data();
            modal.respond('pageChosen', $(this).data());
            modal.close();

            return false;
        });
    }

    /*
    Focus on the search box when opening the modal.
    FIXME: this doesn't seem to have any effect (at least on Chrome)
    */
    $('#id_q', modal.body).focus();

    /* Set up behaviour of choose-page links, to pass control back to the calling page */
    $('a.choose-page', modal.body).click(function() {
        var pageData = $(this).data();
        pageData.parentId = {{ parent_page.id }};
        modal.respond('pageChosen', $(this).data());
        modal.close();

        return false;
    });
}
