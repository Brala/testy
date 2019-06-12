const list = document.getElementById('list');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const yearsSelector = document.getElementById('years');
const tagsSelector = document.getElementById('tags');

let globalData = "";
let yearsList = [];
let tagsList = [];


//Wstępne ładowanie danych z JSON + generowanie szkieletu strony      
function fetchData() {

    fetch('data.json')
        .then(function(resp) {
            return resp.json();
        })
        .then(function(data) {
            data.map(raport => raport.date = new Date(raport.date))
            globalData = data;


            // setYears
            data.forEach(element => {
                const year = element.date.getFullYear(); 
                yearsList.push(year);
                yearsList = [...new Set(yearsList)];
            })
            yearsList.sort((a, b) => a - b);
            yearsSelector.innerHTML = 
                yearsList.map(year => `<option onclick="alert(this)">${year}</option>`);
            let strUser = yearsSelector.options[yearsSelector.selectedIndex].text;
            filterByYear(globalData, strUser)
        
            
            // setTags
            data.forEach(element => {
                const tag = element.category;
                tagsList.push(tag);
                tagsList = [...new Set(tagsList)];
            })
            tagsSelector.innerHTML = tagsList.map((tag, index) => `
                <div class="formrow">
                <input class="checkbox" type="checkbox" name="check${index}" id="check${index}">
                <label class="checklabel" for="check${index}">${tag}</label>
                </div>
                `);
            tagsList.map((tag, index) => {
                const option = document.getElementById(`check${index}`);
                option.addEventListener(
                    'click', () => filterByTag(globalData, tag))
            });           
        });
}


// Filtrowanie danych z JSONa
function filterByYear(data,value){
    const filteredData = data.filter(raport => raport.date.getFullYear() == value );
    renderData(filteredData)
}
function filterByTag(data,value){
    const filteredData = data.filter(raport => raport.category === value );
    renderData(filteredData)
}
function filterByChars(data,value){
    const filteredData = data.filter(raport => raport.title.includes(value) || raport.description.includes(value));
    renderData(filteredData)
}



// Renderowanie boxów z raportem
function renderData(data){

    let output = '';

    data.forEach(element => {  

        const time = element.date;
        const minutesHour = time.getHours() + ':' + time.getMinutes();
        const dayMonthYear = time.getDate() + '.' + time.getMonth() + '.' + time.getFullYear();
        
        output += `
        <ul>
        <li>Date: ${dayMonthYear}</li>
        <li>Hour: ${minutesHour}</li>
        <li>Category: ${element.category}</li>

        <li>Title: ${element.title}</li>
        <li>Descr: ${element.description}</li>
        <hr>
        `;
    });

    list.innerHTML = output;
}

window.addEventListener('load', fetchData());
searchButton.addEventListener('click', () => filterByChars(globalData, searchInput.value));
// yearsSelector.addEventListener('change', () => console.log(this.options[this.selectedIndex].text))