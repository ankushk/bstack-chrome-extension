$(document).ready(function(){
  console.log("In this extension");
  // $("input#url-input").val("http://www.google.com");
  $("input#url-input").focus();

  var browserJson;
  var bObject = {};
  var os_param = "";
  var os_version_param = "";
  var browser_param = "";
  var browser_version_param = "";
  var full_screen_param = true;

  function fetch_browser_list(callback) {
    $.ajax({
      url: "http://www.browserstack.com/list-of-browsers-and-platforms.json?product=live",
      type: 'GET',
      dataType: 'json',

      success: function(data) {
        browserJson = data;
        callback();

      }
    });
  }

  function set_select_options() {
    console.log(browserJson);
    $("select#os_menu").empty();
    $("select#browser_menu").empty();
    $("select#version_menu").empty();

    $.each(browserJson["desktop"], function(index, value) {
      if (value.hasOwnProperty("os_display_name")) {
        $("select#os_menu").append(new Option(value["os_display_name"], index));
      }
    });
    $("select#os_menu").change();
  }

  function os_option_changed() {
    $("select#browser_menu").empty();
    $("select#version_menu").empty();

    console.log("Os option changed");
    var selected_os = $("select#os_menu").val();
    var browsers = browserJson["desktop"][selected_os]["browsers"];
    bObject = {};

    $.each(browsers, function(index, value) {
      if (value.hasOwnProperty("browser")) {
        if(bObject.hasOwnProperty(value["browser"])) {
          bObject[value["browser"]].versions.push(value["browser_version"]);
        } else {
          bObject[value["browser"]] = { "versions" : [] };
          bObject[value["browser"]]["versions"].push(value["browser_version"]);
        }
      }
    });

    $.each(bObject, function(index, value) {
      $("select#browser_menu").append(new Option(index, index));
    });

    os_param = encodeURIComponent(browserJson["desktop"][selected_os]["os"]).replace(/%20/g, "+"); 
    os_version_param = encodeURIComponent(browserJson["desktop"][selected_os]["os_version"]).replace(/%20/g, "+");
    $("select#browser_menu").change();
  }

  function browser_option_changed() {
    $("select#version_menu").empty();
    var selected_browser = $("select#browser_menu").val();

    $.each(bObject[selected_browser]["versions"].reverse(), function(index, value) {
      $("select#version_menu").append(new Option(value, value));
    });

    browser_param = encodeURIComponent(selected_browser).replace(/%20/g, "+"); 
    $("select#version_menu").change();
  }

  function version_option_changed() {
    var selected_version = $("select#version_menu").val();
    browser_version_param = encodeURIComponent(selected_version).replace(/%20/g, "+");;
  }

  function open_selected_browser() {
    console.log("OS: " + os_param);
    console.log("OS version: " + os_version_param);
    console.log("Browser: " + browser_param);
    console.log("Version: " + browser_version_param);
    if(os_param === "" || os_version_param === "" || browser_param === "" || browser_version_param === "") {
      alert("Please provide correct configuration values");
    } 

    var url_param = $("input#url-input").val();
    if (url_param === "") {
      url_param = "google.com";
    }
    encodedurl = encodeURIComponent(url_param).replace(/%20/g, "+");
    chrome.tabs.create({
      url: "http://www.browserstack.com/start#os=" + os_param + "&os_version=" + os_version_param + "&browser=" + browser_param + "&browser_version=" + browser_version_param + "&full_screen=" + full_screen_param + "&url=" + encodedurl + "&start=true"
    });
  }

  fetch_browser_list(set_select_options);
  $("select#os_menu").change(os_option_changed);
  $("select#browser_menu").change(browser_option_changed);
  $("select#version_menu").change(version_option_changed);

  $("input#open_action").click(open_selected_browser);
});