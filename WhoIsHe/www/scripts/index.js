/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

var NotificationsEnabled = false,
    Settings;

$(document).ready(function () {
    $(".button-collapse").sideNav();
    $(".names-button").click(function () {
        GoHome();
    });

    $(".settings-button").click(function () {
        $("#names").hide();
        $("#settings").show();
        $("#about").hide();
        $('.button-collapse').sideNav('hide');
        $('.brand-logo').text("Settings");
        $(".main-only").hide();
    });

    $(".about-button").click(function () {
        $("#names").hide();
        $("#settings").hide();
        $("#about").show();
        $('.button-collapse').sideNav('hide');
        $('.brand-logo').text("About");
        $(".main-only").hide();
    });

    $(".refresh-button").click(function () {
        $(".loader-container").css("margin-top", "10px");
        $(".loader-container").show();
        initialize();
    });

    $("#notification-switch").click(function () {
        NotificationsEnabled = !NotificationsEnabled;
        if (NotificationsEnabled) {
            $("#notification-time").removeAttr("disabled");
            cordova.plugins.notification.local.schedule({
                id: 1,
                title: alertTitle,
                text: "Touch to read",
                icon: 'file://images/logo.bmp',
                at: new Date($("#notification-time").attr("value")),
                every: "day"
            });
            localStorage.setItem(Settings, JSON.stringify({ notificationsOn: true }));
        }
        else {
            $("#notification-time").attr("disabled");
            cordova.plugins.notification.local.cancel(1);
            localStorage.setItem(Settings, JSON.stringify({ notificationsOn: false }));
        }
    });

    $('#notification-time').bootstrapMaterialDatePicker({ format: "HH:mm", shortTime: false, date: false, currentDate: "08:00" }).change(function () {
        cordova.plugins.notification.local.update({
            id: 1,
            title: alertTitle,
            icon: 'alert',
            smallIcon: 'alert',
            at: new Date($("#notification-time").attr("value"))
        });
        localStorage.setItem(AlertTime, new Date($("#notification-time").attr("value")));
    });

    cordova.plugins.notification.local.on("click", function (notification) {
        GoHome();
    });

    onDeviceReady();
});

google.load("feeds", "1");

function GoHome() {
    $("#names").show();
    $("#settings").hide();
    $("#about").hide();
    $('.button-collapse').sideNav('hide');
    $('.brand-logo').text("Names");
    $(".main-only").show();
}

function loadFeed() {
    var control = new google.feeds.FeedControl();
    var feed = new google.feeds.Feed("http://whoisheblog.com/feed/");
    feed.setResultFormat(google.feeds.Feed.MIXED_FORMAT);
    feed.setNumEntries(365);
    feed.load(function (result) {
        if (!result.error) {
            var container = document.getElementById("feed");
            for (var i = 0; i < result.feed.entries.length; i++) {
                var entry = result.feed.entries[i];
                var card = document.createElement("div");
                $(card).addClass("card");

                var cardImage = document.createElement("div");
                $(cardImage).addClass("card-image waves-effect waves-block waves-light");

                var content = document.createElement("content");
                content.innerHTML = entry.content;

                var images = $(content).find('img').map(function () {
                    return $(this).attr('src')
                }).get();

                var title = document.createElement("span");
                $(title).addClass("card-title");
                $(title).html(entry.title);

                $(cardImage).append('<img class="activator" src="' + images[0] + '"/>');
                $(cardImage).append($(title));

                card.appendChild(cardImage);

                var cardContent = document.createElement("div");
                $(cardContent).addClass("card-content");

                var date = new Date(entry.publishedDate);

                var monthNames = ["January", "February", "March", "April", "May", "June",
                                  "July", "August", "September", "October", "November", "December"];

                var dateString = monthNames[date.getMonth()] + " " + date.getDate();

                var title = document.createElement("span");
                $(title).addClass("card-title activator grey-text text-darken-4");

                $(title).html('<span class="entry-title">' + dateString + '</span>' + '<i class="material-icons right">more_vert</i>');

                cardContent.appendChild(title);

                card.appendChild(cardContent);

                var cardReveal = document.createElement("div");
                $(cardReveal).addClass("card-reveal");

                var publishedDate = document.createElement("span");
                $(publishedDate).addClass("card-title grey-text text-darken-4");
                $(publishedDate).html(entry.title + '<i class="material-icons right">close</i>');
                console.log($(publishedDate).html());
                cardReveal.appendChild(publishedDate);

                var content = document.createElement("p");
                $(content).addClass("flow-text");
                $(content).html(entry.content.substring(entry.content.indexOf("[/audio]")).replace(/<img[^>]*>/g, ""));

                var audioTag = $(content).find("a");
                var audioLink = audioTag.attr("href");
                audioTag.remove();
                
                var source = document.createElement("source");
                $(source).attr("src", audioLink).attr("type", "audio/mpeg");

                var audio = document.createElement("audio");
                $(audio).attr("controls", "controls").addClass("center");
                audio.appendChild(source);

                $(content).prepend(audio);

                cardReveal.appendChild(content);

                card.appendChild(cardReveal);

                container.appendChild(card);
            }
        }
        else {
            Console.load(result.error);
        }
    });
}

function initialize() {
    loadFeed();

    $(".loader-container").hide();
    alertTitle = $(".entry-title").first().text();
    var userSettings = JSON.parse(localStorage.getItem(Settings));
    if(userSettings.notificationsOn)
    {
        $("#notification-switch").click();
    }
        
}
google.setOnLoadCallback(initialize);

var alertTitle = $(".entry-title").first().text();

function onDeviceReady() {
    
    $("#app-status-ul").append('<li>deviceready event received</li>');

    document.addEventListener("backbutton", function (e) {
        $("#app-status-ul").append('<li>backbutton event received</li>');

        if ($("#home").length > 0) {
            e.preventDefault();
            navigator.app.exitApp();
        }
        else {
            navigator.app.backHistory();
        }
    }, false);
}

document.addEventListener('deviceready', onDeviceReady, true);