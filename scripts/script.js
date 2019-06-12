const list = document.getElementById('list');
const searchInput = document.getElementById('searchInput');
let globalData = "";
let yearsList = [];
let tagsList = [];


//Wstępne ładowanie danych z JSON      
function fetchData() {

    fetch('data.json')
        .then(function(resp) {
            return resp.json();
        })
        .then(function(data) {
        globalData = data;

        // setYears
        data.forEach(element => {
                const time = new Date(element.date);
                const year = time.getFullYear(); 
                yearsList.push(year);
                yearsList = [...new Set(yearsList)];
                console.log(yearsList);     
        })
        function sortNumber(a, b) {
            return a - b;
        }
        yearsList.sort(sortNumber)

        // setTags
        
        searchButton.addEventListener('click', filterData(globalData, searchInput.value, "title") );
        });

}


// Filtrowanie danych z JSONa
function filterData(data,value,path){
    // console.log(data)
    const filteredData = data.filter(raport => raport[path].includes(value));

    renderData(filteredData)
}


// Renderowanie boxów z raportem
function renderData(data){

    let output = '';

    data.forEach(element => {  

        const time = new Date(element.date);
        const minutesHour = time.getHours() + ':' + time.getMinutes();
        const dayMonthYear = time.getDate() + '.' + time.getMonth() + '.' + time.getFullYear();
        
        output += `
        <ul>
        <li>Date: ${dayMonthYear}</li>
        <li>Hour: ${minutesHour}</li>
        <li>Category: ${element.category}</li>
        <hr>
        <li>Title: ${element.title}</li>
        <li>Descr: ${element.description}</li>
        </ul>
        `;
    });

    list.innerHTML = output;
}

window.addEventListener('load', fetchData());
// console.log(globalData)