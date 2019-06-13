'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var list = document.getElementById('list');
var searchInput = document.getElementById('searchInput');
var searchButton = document.getElementById('searchButton');
var yearsSelector = document.getElementById('years');
var tagsSelector = document.getElementById('tags');

var globalData = "";
var yearsList = [];
var tagsList = [];

//Wstępne ładowanie danych z JSON + generowanie szkieletu strony      
function fetchData() {

    fetch('data.json').then(function (resp) {
        return resp.json();
    }).then(function (data) {
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
        yearsSelector.innerHTML = yearsList.map(function (year) {
            return '<option>' + year + '</option>';
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
        var output = '';

        tagsList.forEach(function (tag, index) {
            return output += '\n                <div class="formrow">\n                <input class="checkbox" type="checkbox" name="check' + index + '" id="check' + index + '">\n                <label class="checklabel" for="check' + index + '">' + tag + '</label>\n                </div>\n                ';
        });
        tagsSelector.innerHTML = output;
        tagsList.map(function (tag, index) {
            var option = document.getElementById('check' + index);
            option.addEventListener('click', function () {
                return filterByTag(globalData);
            });
        });
    });
}

// Filtrowanie danych z JSONa
function filterByYear(data, value) {
    var filteredData = data.filter(function (raport) {
        return raport.date.getFullYear() == value;
    });
    renderData(filteredData);
}

function filterByTag(data, value) {
    var tagsSelected = tagsList.filter(function (tag, index) {
        return document.getElementById('check' + index).checked ? tag : null;
    });
    var filteredData = data.filter(function (raport) {
        return raport.category === tagsSelected[0] || raport.category === tagsSelected[1] || raport.category === tagsSelected[2] || raport.category === tagsSelected[3];
    });
    renderData(filteredData);
}

function filterByChars(data, value) {
    var filteredData = data.filter(function (raport) {
        return raport.title.includes(value) || raport.description.includes(value);
    });
    renderData(filteredData);
}

// Renderowanie boxów z raportem
function renderData(data) {

    var output = '';

    data.forEach(function (element) {

        var time = element.date;
        var minutesHour = time.getHours() + ':' + time.getMinutes();
        var dayMonthYear = time.getDate() + '.' + time.getMonth() + '.' + time.getFullYear();

        output += '\n        <div class="block clear-fix">\n            <div class="raport-info f-left">\n                <p>Date: ' + dayMonthYear + '</p>\n                <p>Hour: ' + minutesHour + '</p>\n                <p>Category: ' + element.category + '</p>\n            </div>\n            <div class="raport f-left">\n                <h2>Title: ' + element.title + '</h2>\n                <p>Descr: ' + element.description + '</p>\n            </div>\n        </div>\n        ';
    });
    list.innerHTML = output;
}

window.addEventListener('load', fetchData());
searchButton.addEventListener('click', function () {
    return filterByChars(globalData, searchInput.value);
});
yearsSelector.addEventListener('change', function () {
    return filterByYear(globalData, yearsSelector.value);
});