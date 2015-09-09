/**
 *
 */

var phant;

var init = function () {
  //$('a[data-toggle="tab"]').on('shown.bs.tab', onTabChange);
  $('#settings form input').on('keyup', onSettingsSubmit).on('change', onSettingsSubmit);

  var opts = { url: 'https://data.sparkfun.com' };

  if (location.search !== '') {
    var queryString = decodeURIComponent(location.search.substr(1));
    var argSets = queryString.split('&');
    for (var x = 0; x < argSets.length; x++) {
      var pair = argSets[x].split('=');
      if (pair.length === 2) {
        opts[pair[0]] = pair[1];
      }
    }
  } else {
    $('#tabs a:last').tab('show');
  }

  $('#phant_url').val(opts.url);
  $('#phant_public_key').val(opts.public_key);
  buildUrl();

  phant = new Phant({
    public_key: opts.public_key,
    url: opts.url
  });
  phant.fetch({}, onPhantFetch);
};

/*
var onTabChange = function (e) {
  switch ($(e.target).attr('href')) {
    case '#home':
      break;
    case'#settings':
      break;
  }
};
*/

var onSettingsSubmit = function (e) {
  e.preventDefault();
  buildUrl();
};

var onPhantFetch = function (data) {
  //console.log(data);

  phant.getStats(onPhantStats);
  clearAllAlerts();

  if (data.message) {
    showAlert(data.message, {alertClass: 'warning', glyphiconClass: 'alert'});
  } else {
    var current = data[0];

    showStatus(current);
    makeTempGauges(current);

    makeGraph('#plot', data);

    //phant.enableRealtime(onPhantRealtime);
    phant.startPolling({}, onPhantPolled);
  }
};

var onPhantRealtime = function (data) {
  console.log(data);
};

var onPhantPolled = function (data) {
  //console.log(data);

  clearAllAlerts();

  if (data.message) {
    showAlert(data.message, {alertClass: 'warning', glyphiconClass: 'alert'});
  } else if (data.length > 0) {
    var current = data[0];

    showStatus(current);
    makeTempGauges(current);

    updateGraph('#plot', data);
  }
};

var onPhantStats = function (data) {
  //console.log(data);

  var percentage = data.used / data.cap * 100;

  $('.stats').attr('title', percentage.toFixed(2) + '% space used.');
  $('.stats .progress-bar').css({
    width: percentage.toFixed(2) + '%'
  });
  $('.stats').show();
};

var buildUrl = function () {
  var params = new Parameters ({
    public_key: $('#phant_public_key').val()
  });

  if ($('#phant_url').val() !== 'https://data.sparkfun.com') {
    params.set('url', $('#phant_url').val());
  }

  var url = window.location.href.replace(/\?.*/, '') + '?' + params.serialize();

  $('#site_url').attr('href', url).text(url);
};

var showAlert = function (message, opts) {
  if (typeof opts === 'undefined') { opts = {}; }

  var alert = $('<div/>').addClass('status alert alert-' + (opts.alertClass || 'info')).appendTo('#alerts');
  if (opts.glyphiconClass) {
    $('<span/>').addClass('glyphicon glyphicon-' + opts.glyphiconClass).attr('aria-hidden', 'true').appendTo(alert);
  }
  $('<span/>').addClass('text').html(message).appendTo(alert);

  return alert;
};

var clearAllAlerts = function () {
  $('#alerts .alert').remove();
};

var showStatus = function (current) {
  var last_update_timestamp = Date.parse(current.timestamp);
  var out_of_date = (Date.now() - last_update_timestamp > 15 * 60 * 1000) ? true : false; // 15 minute heartbeat

  clearAllAlerts();

  if (out_of_date) {
    var last_update = new Date(last_update_timestamp);

    showAlert('System appears offline.  Last update at <strong id="last_update_time">' + last_update.toLocaleString() + '</strong>', {
      alertClass: 'danger',
      glyphiconClass: 'warning-sign'
    });
  }
};

$(document).ready(init);
