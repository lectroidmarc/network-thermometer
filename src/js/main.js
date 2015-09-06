/**
 *
 */

var phant;

var init = function () {
  $('a[data-toggle="tab"]').on('shown.bs.tab', onTabChange);
  $('#settings form').on('submit', onSettingsSubmit);

  var saved_phant_settings = JSON.parse(window.localStorage.getItem('phant_settings_temerature'));

  if (saved_phant_settings) {
    $('#phant_url').val(saved_phant_settings.url);
    $('#phant_public_key').val(saved_phant_settings.public_key);
    $('#phant_private_key').val(saved_phant_settings.private_key);
    $('#clear_btn').prop('disabled', !saved_phant_settings.private_key);

    phant = new Phant(saved_phant_settings);
    phant.fetch({
      'page': '1'
    }, onPhantFetch);
  } else {
    $('#tabs a:last').tab('show');
  }
};

var onTabChange = function (e) {
  switch ($(e.target).attr('href')) {
    case '#home':
      init();
      break;
    case'#settings':
      $('#update .result').hide();
      break;
  }
};

var onSettingsSubmit = function (e) {
  e.preventDefault();

  window.localStorage.setItem('phant_settings_temerature', JSON.stringify({
    url: $('#phant_url').val(),
    public_key: $('#phant_public_key').val(),
    private_key: $('#phant_private_key').val()
  }));

  $('#clear_btn').prop('disabled', !$('#phant_private_key').val());
  $('#tabs a:first').tab('show');
};

var onPhantFetch = function (data) {
  //console.log(data);

  phant.getStats(onPhantStats);
  clearAllStatusAlerts();

  if (data.message) {
    showStatusAlert(data.message, {alertClass: 'warning', glyphiconClass: 'alert'});
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

  clearAllStatusAlerts();

  if (data.message) {
    showStatusAlert(data.message, {alertClass: 'warning', glyphiconClass: 'alert'});
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

var showStatusAlert = function (message, opts) {
  if (typeof opts === 'undefined') { opts = {}; }

  var alert = $('<div/>').addClass('status alert alert-' + (opts.alertClass || 'info')).appendTo('#alerts');
  if (opts.glyphiconClass) {
    $('<span/>').addClass('glyphicon glyphicon-' + opts.glyphiconClass).attr('aria-hidden', 'true').appendTo(alert);
  }
  $('<span/>').addClass('text').html(message).appendTo(alert);

  return alert;
};

var clearAllStatusAlerts = function () {
  $('#alerts .alert').remove();
};

var showStatus = function (current) {
  var last_update_timestamp = Date.parse(current.timestamp);
  var out_of_date = (Date.now() - last_update_timestamp > 15 * 60 * 1000) ? true : false; // 15 minute heartbeat

  clearAllStatusAlerts();

  if (out_of_date) {
    var last_update = new Date(last_update_timestamp);

    showStatusAlert('System appears offline.  Last update at <strong id="last_update_time">' + last_update.toLocaleString() + '</strong>', {
      alertClass: 'danger',
      glyphiconClass: 'warning-sign'
    });
  }
};

$(document).ready(init);
