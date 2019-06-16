"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var list = document.getElementById("list");
var searchInput = document.getElementById("searchInput");
var searchButton = document.getElementById("searchButton");
var yearsSelector = document.getElementById("years");
var tagsSelector = document.getElementById("tags");

var globalData = "";
var yearsList = [];
var tagsList = [];

// --------- Wstępne formatowanie danych z JSON + generowanie szkieletu Filtrownicy  --------- 
function fetchData() {

    fetch("data.json").then(function (resp) {
        return resp.json();
    }).then(function (data) {
        // format unix_timestamp to js Date()
        data.map(function (raport) {
            return raport.date = new Date(raport.date);
        });
        globalData = data;

        // setYears
        data.forEach(function (element) {
            var year = element.date.getFullYear();
            yearsList.push(year);
            yearsList = [].concat(_toConsumableArray(new Set(yearsList)));
        });
        yearsList.sort(function (a, b) {
            return a - b;
        });
        var yearsArrow = '<i class="arrow arrow-down"></i> ';
        yearsSelector.innerHTML = yearsArrow + yearsList.map(function (year) {
            return "<option>" + year + "</option>";
        });

        yearsSelector.selectedIndex = yearsSelector.options.length - 1;
        var strUser = yearsSelector.options[yearsSelector.selectedIndex].text;
        filterByYear(globalData, strUser);

        // setTags
        data.forEach(function (element) {
            var tag = element.category;
            tagsList.push(tag);
            tagsList = [].concat(_toConsumableArray(new Set(tagsList)));
        });

        var output = "\n                <div class=\"formrow\">\n                    <input class=\"checkbox\" type=\"checkbox\" name=\"checkAll\" id=\"checkAll\">\n                    <label class=\"checklabel\" for=\"checkAll\">Wszystkie <span>&#x2716;</span></label>\n                </div>\n            ";

        tagsList.forEach(function (tag, index) {
            return output += "\n                <div class=\"formrow\">\n                    <input class=\"checkbox\" type=\"checkbox\" name=\"check" + index + "\" id=\"check" + index + "\">\n                    <label class=\"checklabel\" for=\"check" + index + "\">" + tag + "<span>&#x2716;</span></label>\n                </div>\n                ";
        });
        tagsSelector.innerHTML = output;
        //Add listeners to all tags
        document.getElementById("checkAll").addEventListener("click", function () {
            return filterByTag(globalData);
        });
        tagsList.map(function (tag, index) {
            var option = document.getElementById("check" + index);
            option.addEventListener("click", function () {
                return filterByTag(globalData);
            });
        });
    });
}

// ---------  Filtrowanie(Przeszukiwanie) danych z JSONa --------- 
function filterByYear(data, value) {
    var filteredData = data.filter(function (raport) {
        return raport.date.getFullYear() == value;
    });
    renderData(filteredData);
}

function filterByTag(data, value) {
    var tagsSelected = tagsList.filter(function (tag, index) {
        return document.getElementById("check" + index).checked ? tag : null;
    });
    var filteredData = data.filter(function (raport) {
        return raport.category === tagsSelected[0] || raport.category === tagsSelected[1] || raport.category === tagsSelected[2] || raport.category === tagsSelected[3];
    });
    document.getElementById("checkAll").checked ? renderData(globalData) : renderData(filteredData);
}

function filterByChars(data, value) {
    var filteredData = data.filter(function (raport) {
        return raport.title.includes(value) || raport.description.includes(value);
    });
    renderData(filteredData);
}

// ---------  Generowanie boxów z raportami w <main> --------- 
function renderData(data) {

    var output = "";
    var filesToggleIndex = 0;

    data.forEach(function (element, index) {

        var time = element.date;
        var minutesHour = ('0' + time.getHours()).slice(-2) + ":" + ('0' + time.getMinutes()).slice(-2);
        var dayMonthYear = ('0' + time.getDate()).slice(-2) + "." + ('0' + time.getMonth()).slice(-2) + "." + time.getFullYear();

        var filesOutput = "";

        element.files.forEach(function (file) {
            return filesOutput += "\n                <a>\n                    Pobierz " + file.filename + ".pdf    (" + file.filesize + "kB)\n                </a>";
        });

        var attachedFiles = element.files.length === 0 ? "" : element.files.length === 1 ? " <a>\n                    Pobierz " + element.files[0].filename + ".pdf    (" + element.files[0].filesize + "kB)\n                </a>" : " <a class=\"toggle-files\" id=\"toggleFiles" + filesToggleIndex + "\"}>\n                    Pliki do pobrania (" + element.files.length + ")     <i class=\"arrow arrow-down\"></i>\n                </a>\n                <div class=\"hidden\" id=\"visibleFiles" + filesToggleIndex + "\">\n                    <hr>\n                    " + filesOutput + "\n                </div>";

        element.files.length >= 2 ? filesToggleIndex++ : null;

        output += "\n            <div class=\"block clear-fix\">\n                <div class=\"date-category f-left\">\n                    <p><b>" + dayMonthYear + "</b></p>\n                    <p><b>" + minutesHour + "</b></p>\n                    <p>" + element.category + "</p>\n                </div>\n                <div class=\"title-description-files f-left\">\n                    <h2>" + element.title + "</h2>\n                    <p>" + element.description + "</p>\n                    <div class=\"f-left\">\n                        <a>Zobacz raport</a>\n                    </div>\n                    <div class=\"files f-left\">\n                        " + attachedFiles + "\n                    </div>\n                </div>\n            </div>\n        ";
    });
    // Renderowanie treści
    output === "" ? list.innerHTML = "Brak wyników spełniających kryteria" : list.innerHTML = output;

    // Dodawanie click-listenerów do "Pliki do pobrania"

    var _loop = function _loop(i) {
        document.getElementById("toggleFiles" + i).addEventListener("click", function () {
            document.getElementById("visibleFiles" + i).classList.toggle("hidden");
            document.querySelector("#toggleFiles" + i + " i").classList.toggle("arrow-up");
        });
    };

    for (var i = 0; i < filesToggleIndex; i++) {
        _loop(i);
    }
}

window.addEventListener("load", fetchData());
searchButton.addEventListener("click", function () {
    return filterByChars(globalData, searchInput.value);
});
yearsSelector.addEventListener("change", function () {
    return filterByYear(globalData, yearsSelector.value);
});