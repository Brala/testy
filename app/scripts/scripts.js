"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var list = document.getElementById("list");
var searchInput = document.getElementById("searchInput");
var searchButton = document.getElementById("searchButton");
var yearsSelector = document.getElementById("years");
var tagsSelector = document.getElementById("tags");

var globalData = [];
var yearsList = ["Wszystkie"];
var tagsList = [];

//  stop default form behavior
document.getElementById('form').addEventListener('submit', function (e) {
    return e.preventDefault();
});

//  --------- Wstępne formatowanie danych z JSON  --------- 

function fetchData() {

    fetch("data.json").then(function (resp) {
        return resp.json();
    }).then(function (data) {
        //  format unix_timestamp to js Date()
        data.map(function (raport) {
            return raport.date = new Date(raport.date);
        });
        globalData = [].concat(_toConsumableArray(data));

        //  after fetch render search form and initial reports 
        renderFiltersForm();
        filterByAll(globalData, yearsSelector.value, searchInput.value);
    }).catch(function (error) {
        return console.error(error);
    });
}

//  ---------  Filtrowanie(Przeszukiwanie) danych z JSONa / Filter throught all inputs--------- 

function filterByAll(globalData, year, chars, tags) {

    var filteredData = void 0;

    //  filter by year
    year !== "Wszystkie" ? filteredData = globalData.filter(function (raport) {
        return raport.date.getFullYear() == year;
    }) : filteredData = globalData;

    //  filter by chars
    filteredData = filteredData.filter(function (raport) {
        return raport.title.includes(chars) || raport.description.includes(chars);
    });

    //  filter by tags
    var tagsSelected = tagsList.filter(function (tag, index) {
        return document.getElementById("check" + index).checked ? tag : null;
    });
    !document.getElementById("checkAll").checked ? filteredData = filteredData.filter(function (raport) {
        return tagsSelected.some(function (el) {
            return el === raport.category;
        });
    }) : null;

    renderReportsData(filteredData);
}

//  ---------  Generowanie szkieletu formularza/filtrownicy --------- 

function renderFiltersForm() {

    //  set avilable Years from data
    globalData.forEach(function (element) {
        var year = element.date.getFullYear();
        yearsList.push(year);
    });
    yearsList = [].concat(_toConsumableArray(new Set(yearsList)));
    yearsList.sort(function (a, b) {
        return a - b;
    });

    var yearsArrow = '<i class="arrow arrow-down"></i> ';

    yearsSelector.innerHTML = yearsArrow + yearsList.map(function (year) {
        return "<option>" + year + "</option>";
    });

    yearsSelector.selectedIndex = yearsSelector.options.length - 1;

    //  set avilable Tags from data
    globalData.forEach(function (element) {
        var tag = element.category;
        tagsList.push(tag);
    });
    tagsList = [].concat(_toConsumableArray(new Set(tagsList)));

    var tagsOutput = "\n        <div class=\"form--row\">\n            <input class=\"checkbox\" type=\"checkbox\" name=\"checkAll\" id=\"checkAll\" checked>\n            <label class=\"checklabel\" for=\"checkAll\">Wszystkie <span>&#x2716;</span></label>\n        </div>\n        ";

    tagsList.forEach(function (tag, index) {
        return tagsOutput += "\n        <div class=\"form--row\">\n            <input class=\"checkbox\" type=\"checkbox\" name=\"check" + index + "\" id=\"check" + index + "\">\n            <label class=\"checklabel\" for=\"check" + index + "\">" + tag + "<span>&#x2716;</span></label>\n        </div>\n        ";
    });
    tagsSelector.innerHTML = tagsOutput;

    //  Add listeners to tag-elements
    document.getElementById("checkAll").addEventListener("click", function () {
        return filterByAll(globalData, yearsSelector.value, searchInput.value);
    });
    tagsList.map(function (tag, index) {
        var option = document.getElementById("check" + index);
        option.addEventListener("click", function () {
            return filterByAll(globalData, yearsSelector.value, searchInput.value);
        });
    });
}

//  ---------  Generowanie boxów z raportami w <main> --------- 
function renderReportsData(data) {

    var reportsOutput = "";
    var fileTogglersIndex = 0;

    data.forEach(function (element, index) {

        var time = element.date;
        var minutesHour = ('0' + time.getHours()).slice(-2) + ":" + ('0' + time.getMinutes()).slice(-2);
        var dayMonthYear = ('0' + time.getDate()).slice(-2) + "." + ('0' + time.getMonth()).slice(-2) + "." + time.getFullYear();

        var filesOutput = "";

        element.files.forEach(function (file) {
            return filesOutput += "\n                <a>\n                    Pobierz " + file.filename + ".pdf    (" + file.filesize + "kB)\n                </a>\n                ";
        });

        var attachedFiles = element.files.length === 0 ? "" : element.files.length === 1 ? " \n                <a>\n                    Pobierz " + element.files[0].filename + ".pdf    (" + element.files[0].filesize + "kB)\n                </a>\n                " : " \n                <a class=\"block--raport--files--toggled\" id=\"toggleFiles" + fileTogglersIndex + "\"}>\n                    Pliki do pobrania (" + element.files.length + ")     \n                    <i class=\"arrow arrow-down\"></i>\n                </a>\n                <div class=\"hidden\" id=\"visibleFiles" + fileTogglersIndex + "\">\n                    <hr>\n                    " + filesOutput + "\n                </div>\n                ";

        element.files.length >= 2 ? fileTogglersIndex++ : null;

        reportsOutput += "\n            <div class=\"block clear-fix\">\n                <div class=\"block--date-category f-left\">\n                    <p><b>" + dayMonthYear + "</b></p>\n                    <p><b>" + minutesHour + "</b></p>\n                    <p>" + element.category + "</p>\n                </div>\n                <div class=\"block--raport f-left\">\n                    <h2>" + element.title + "</h2>\n                    <p>" + element.description + "</p>\n                    <div class=\"f-left\">\n                        <a>Zobacz raport</a>\n                    </div>\n                    <div class=\"block--raport--files f-left\">\n                        " + attachedFiles + "\n                    </div>\n                </div>\n            </div>\n            ";
    });

    //  Render raports on page
    reportsOutput === "" ? list.innerHTML = "Brak wyników spełniających kryteria" : list.innerHTML = reportsOutput;

    //  Add listeners to <a>Pliki do pobrania</a>

    var _loop = function _loop(i) {
        document.getElementById("toggleFiles" + i).addEventListener("click", function () {
            document.getElementById("visibleFiles" + i).classList.toggle("hidden");
            document.querySelector("#toggleFiles" + i + " i").classList.toggle("arrow-up");
        });
    };

    for (var i = 0; i < fileTogglersIndex; i++) {
        _loop(i);
    }
}

window.addEventListener("load", fetchData());
yearsSelector.addEventListener("change", function () {
    return filterByAll(globalData, yearsSelector.value, searchInput.value);
});
searchButton.addEventListener("click", function () {
    return filterByAll(globalData, yearsSelector.value, searchInput.value);
});