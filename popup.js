$(document).ready(function() {
  // $("input#url-input").val("http://www.google.com");
  $("input#url-input").focus();

  var browserJson;
  var bObject = {};
  var osParam = "";
  var osVersionParam = "";
  var browserParam = "";
  var browserVersionParam = "";
  var fullScreenParam = true;

  function fetchBrowserList(callback) {
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

  function setSelectOptions() {
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

  function osOptionChanged() {
    $("select#browser_menu").empty();
    $("select#version_menu").empty();

    console.log("Os option changed");
    var selectedOs = $("select#os_menu").val();
    var browsers = browserJson["desktop"][selectedOs]["browsers"];
    bObject = {};

    $.each(browsers, function(index, value) {
      if (value.hasOwnProperty("browser")) {
        if (bObject.hasOwnProperty(value["browser"])) {
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

    osParam = encodeURIComponent(browserJson["desktop"][selectedOs]["os"]).replace(/%20/g, "+");
    osVersionParam = encodeURIComponent(browserJson["desktop"][selectedOs]["os_version"]).replace(/%20/g, "+");
    $("select#browser_menu").change();
  }

  function browserOptionChanged() {
    $("select#version_menu").empty();
    var selectedBrowser = $("select#browser_menu").val();

    $.each(bObject[selectedBrowser]["versions"].reverse(), function(index, value) {
      $("select#version_menu").append(new Option(value, value));
    });

    browserParam = encodeURIComponent(selectedBrowser).replace(/%20/g, "+");
    $("select#version_menu").change();
  }

  function versionOptionChanged() {
    var selectedVersion = $("select#version_menu").val();
    browserVersionParam = encodeURIComponent(selectedVersion).replace(/%20/g, "+");
  }

  function openSelectedBrowser() {
    if (osParam === "" || osVersionParam === "" || browserParam === "" || browserVersionParam === "") {
      alert("Please provide correct configuration values");
    }

    var urlParam = $("input#url-input").val();
    if (urlParam === "") {
      urlParam = "google.com";
    }
    var encodedurl = encodeURIComponent(urlParam).replace(/%20/g, "+");
    chrome.tabs.create({
      url: "http://www.browserstack.com/start#os=" + osParam + "&os_version=" + osVersionParam + "&browser=" + browserParam + "&browser_version=" + browserVersionParam + "&full_screen=" + fullScreenParam + "&url=" + encodedurl + "&start=true"
    });
  }

  fetchBrowserList(setSelectOptions);
  $("select#os_menu").change(osOptionChanged);
  $("select#browser_menu").change(browserOptionChanged);
  $("select#version_menu").change(versionOptionChanged);

  $("input#open_action").click(openSelectedBrowser);
});
