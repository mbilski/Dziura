/* Wyswietlanie issues na mapie */

var g_issueMarkers = [];
var g_updateTimer = null;
var g_first = true;

function initialize()
{
  createMap(); // map_common.js

  google.maps.event.addListener(g_map, 'bounds_changed', function() {
    if (g_first)
    {
      updateIssues();
      g_first = false;
      return;
    }

    if (g_updateTimer != null)
      clearTimeout(g_updateTimer);

    g_updateTimer = setTimeout(updateIssues, 1000);
  });
  
  $("select").bind("change", updateIssues);
  $("input[name=street]").bind("keyup", updateIssues);
}

function getFilterParams() {
  var params = {};
  params["search"] = {};
  
  if( $("select[name=category_id]").val() != 0 ) {
    params["search"]["category_id_equals"] = $("select[name=category_id]").val();
  }
  
  if( $("select[name=status_id]").val() != 0 ) {
    params["search"]["status_id_equals"] = $("select[name=status_id]").val();
  }
  
  if( $("select[name=unit_id]").val() != 0 ) {
    params["search"]["unit_id_equals"] = $("select[name=unit_id]").val();
  }
  
  if( $("input[name=street]").val() != "" ) {
    params["search"]["address_street_contains"] = $("input[name=street]").val();
  }
  
  if( $("select[name=date]").val() != 0 ) {
    params["search"]["created_at_greater_than"] = $("select[name=date]").val();
  }
  
  return params;
}

function updateIssues()
{
  var ne = g_map.getBounds().getNorthEast();
  var sw = g_map.getBounds().getSouthWest();

  var params = { ne_lat: ne.lat(), ne_lng: ne.lng(),
  sw_lat: sw.lat(), sw_lng: sw.lng() };

  var urlParams = jQuery.param(params);
  var filterParams = jQuery.param(getFilterParams());
  jQuery.getJSON("/issues/by_rect.json?" + urlParams + "&" + filterParams, issuesReceived);
}

function issuesReceived(data)
{
  for (var i = 0; i < g_issueMarkers.length; i++)
  {
    g_issueMarkers[i].setVisible(false);
  }
  g_issueMarkers = new Array();

  for (var i = 0; i < data.length; i++)
  {
    var latLng = new google.maps.LatLng(data[i].latitude, data[i].longitude);

    var marker = new google.maps.Marker
      ( {
        map: g_map,
        position: latLng,
        title: "" + data[i].id
      } );
    
    g_issueMarkers.push(marker);
    
    addIssueClickListener(marker);
  }
}

function addIssueClickListener(marker)
{
  google.maps.event.addListener(marker, 'click', function() {
    var id = marker.getTitle();

    $.get('/issues/'+id+'/edit', function(data) {
			infowindow = new google.maps.InfoWindow({
			  content: data
		  });

		  infowindow.open(g_map, marker);

		  google.maps.event.addListener(infowindow, 'domready', function() {
			  bindEditIssueForm();
		  });
    });
  });
}