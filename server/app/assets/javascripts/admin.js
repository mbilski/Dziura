/**
 * admin.js - funkcje do obsługi UI panelu admina
 */

// Ustawienie stylów przy ładowaniu strony
$(function() {
    setjQueryUI();
});

var idOfDialogForm = "dialog-form";
var microtimeToHideNotice = 5000;

// Funkcja ustawiająca style i akcje elementów na zgodne z jQuery UI
function setjQueryUI ()
{
    //ustawianie styli globalnych
    $('#container').addClass('ui-widget');
    $('#auth').addClass('ui-widget');

    //ustawianie styli tabel
    $('tbody tr').hover(function() {
        $(this).toggleClass('ui-state-hover');
    });
    $('table').addClass('ui-widget ui-widget-content');
    $('thead tr').addClass('ui-widget-header');

    //ustawianie styli forms
    $('fieldset').addClass('ui-widget ui-widget-content');
    $('fieldset legend').addClass('ui-widget-header ui-corner-all');
    $("input:submit, button, a.btn").button();

    asynchronousSubmit("#res_submit_asynchro", window.location.reload);

    $( "a.btn_dialog")
    .button()
    .unbind('click')
    .click(function() {
        var url = $(this).attr('href');
        var dialog = initDialogWindow(url);
        dialog.dialog( "open" );
        return false;
    });

    //ukrywanie komunikatów
    if($('div.notice')) $('div.notice').delay(microtimeToHideNotice).slideUp();
}

// Podpina asynchroniczny submit formularza pod dany element
function asynchronousSubmit(elementId, afterClose, afterClick)
{
  $(elementId).each(function(i) {
      $(this).bind('click', function() { this.disabled=true; } );
    } );

  var options =
    {
      success: function(responseText)
      {
        var dialog = $('#'+idOfDialogForm);
        setContentDialogWindow(dialog, responseText);

        // jeżeli nie było błędów
        if ($("#error_notices").length == 0)
        {
          var options = {
            buttons: {
              "Zamknij": function () {
                $(this).dialog('close');
                if (afterClose)
                  afterClose();
              }
            }
          };

          dialog.dialog('option', options);
        }
        return false;
      },
      error: function()
      {
        setContentDialogWindow($('#'+idOfDialogForm), 'Wystąpił błąd podczas przetwarzania');
        return false;
      }
    };

  $(elementId).each(
    function(i)
    {
      $(this).unbind('click').bind('click',
        function()
        {
          $(this).parents('form:first').ajaxSubmit(options);
          if (afterClick)
            afterClick();
          return false;
        }
      );
    }
  );
}

// Tworzy okno dialogowe z zawartością pobraną z danego URL
function initDialogWindow(url, w, h, dialogLoaded, dialogClosed)
{
    var dialog_window = createDialogWindow(w, h, dialogClosed);
    setContentDialogWindowFromUrl(dialog_window, url, dialogLoaded);
    return dialog_window;
}

// Funkcja tworząca okno dialogowe
function createDialogWindow(w, h, dialogClosed)
{
    if (!w)
        var w = 400;
    if (!h)
        var h = 380;

    //tworzenie elementu html
    var dialog = $('<div id="'+idOfDialogForm+'">').appendTo('body');

    //tworzenie okien dialogowych
    dialog.dialog({
        autoOpen: false,
        minHeight: 200,
        minWidth: 200,
        height: h,
        width: w,
        resizable: true,
        modal: true,
        buttons: {
            "Anuluj" : function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {
            dialog.remove();
            if (dialogClosed)
              dialogClosed();
        }
    });

    return dialog;
}

// Funkcja ustawiająca zawartość zadanego okna dialogowego z danego URL
function setContentDialogWindowFromUrl(dialog_window, url, dialogLoaded)
{
    $.get(url,
        function(data){
            setContentDialogWindow(dialog_window, data);
            if (dialogLoaded !== undefined)
              dialogLoaded(dialog_window);
        });
}

// Funkcja ustawiająca zawartość zadanego okna dialogowego
function setContentDialogWindow(dialog_window, data)
{
    /* czyszczenie i ustawianie zawartości */
    dialog_window.empty().html(data);

    // pobieranie i ustawianie tytuly okna
    title = dialog_window.find('h1').html();
    dialog_window.find('h1').empty();
    dialog_window.dialog( "option", "title", title );

    // ustawianie styli i akcji elementów na zgodne z jQuery UI
    setjQueryUI();
}
