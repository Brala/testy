'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var list = document.getElementById('list');
var searchInput = document.getElementById('searchInput');
var globalData = "";
var yearsList = [];
var tagsList = [];

//Wstępne ładowanie danych z JSON      
function fetchData() {

    fetch('data.json').then(function (resp) {
        return resp.json();
    }).then(function (data) {
        globalData = data;

        // setYears
        data.forEach(function (element) {
            var time = new Date(element.date);
            var year = time.getFullYear();
            yearsList.push(year);
            yearsList = [].concat(_toConsumableArray(new Set(yearsList)));
            console.log(yearsList);
        });
        function sortNumber(a, b) {
            return a - b;
        }
        yearsList.sort(sortNumber);

        // setTags

        searchButton.addEventListener('click', filterData(globalData, searchInput.value, "title"));
    });
}

// Filtrowanie danych z JSONa
function filterData(data, value, path) {
    // console.log(data)
    var filteredData = data.filter(function (raport) {
        return raport[path].includes(value);
    });

    renderData(filteredData);
}

// Renderowanie boxów z raportem
function renderData(data) {

    var output = '';

    data.forEach(function (element) {

        var time = new Date(element.date);
        var minutesHour = time.getHours() + ':' + time.getMinutes();
        var dayMonthYear = time.getDate() + '.' + time.getMonth() + '.' + time.getFullYear();

        output += '\n        <ul>\n        <li>Date: ' + dayMonthYear + '</li>\n        <li>Hour: ' + minutesHour + '</li>\n        <li>Category: ' + element.category + '</li>\n        <hr>\n        <li>Title: ' + element.title + '</li>\n        <li>Descr: ' + element.description + '</li>\n        </ul>\n        ';
    });

    list.innerHTML = output;
}

window.addEventListener('load', fetchData());
// console.log(globalData)