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
                yearsList.map(year => `<option>${year}</option>`);
            yearsSelector.selectedIndex = yearsSelector.options.length-1;
            let strUser = yearsSelector.options[yearsSelector.selectedIndex].text;
            filterByYear(globalData, strUser)
        
            
            // setTags
            data.forEach(element => {
                const tag = element.category;
                tagsList.push(tag);
                tagsList = [...new Set(tagsList)];
            })
            let output = '';

            tagsList.forEach((tag, index) => output += `
                <div class="formrow">
                <input class="checkbox" type="checkbox" name="check${index}" id="check${index}">
                <label class="checklabel" for="check${index}">${tag}</label>
                </div>
                `
            );    
            tagsSelector.innerHTML = output;           
            tagsList.map((tag, index) => {
                const option = document.getElementById(`check${index}`);
                option.addEventListener('click', () => filterByTag(globalData));
            });           
        });
}


// Filtrowanie danych z JSONa
function filterByYear(data,value){
    const filteredData = data.filter(raport => raport.date.getFullYear() == value );
    renderData(filteredData);
}

function filterByTag(data,value){
    const tagsSelected = tagsList.filter((tag,index) => document.getElementById(`check${index}`).checked ? tag : null);
    const filteredData = data.filter(raport => raport.category === tagsSelected[0] ||  raport.category === tagsSelected[1] ||raport.category === tagsSelected[2] ||raport.category === tagsSelected[3]);
    renderData(filteredData);
}

function filterByChars(data,value){
    const filteredData = data.filter(raport => raport.title.includes(value) || raport.description.includes(value));
    renderData(filteredData);
}



// Renderowanie boxów z raportem
function renderData(data){

    let output = '';

    data.forEach(element => {  

        const time = element.date;
        const minutesHour = time.getHours() + ':' + time.getMinutes();
        const dayMonthYear = time.getDate() + '.' + time.getMonth() + '.' + time.getFullYear();
        
        const renderManyFiles = (files) => files.map((file, index) =>`<a href="">Pobierz ${file.filename}    ${file.filesize}kb</a>`);

        const attachedFiles = 
        element.files.length === 0 ? ""
        : element.files.length === 1 ? `<a href="">Pobierz ${element.files[0].filename}    ${element.files[0].filesize}kb</a>`
        : `<a>Pliki do pobrania(${element.files.length})</a>${renderManyFiles(element.files)}`;

        output += `
        <div class="block clear-fix">
            <div class="raport-info f-left">
                <p>${dayMonthYear}</p>
                <p>${minutesHour}</p>
                <p>${element.category}</p>
            </div>
            <div class="raport f-left">
                <h2>${element.title}</h2>
                <p>${element.description}</p>
                <a href="" class="f-left">Zobacz raport</a>
                ${attachedFiles}
            </div>
        </div>
        `;
    });
    list.innerHTML = output;
}

window.addEventListener('load', fetchData());
searchButton.addEventListener('click', () => filterByChars(globalData, searchInput.value));
yearsSelector.addEventListener('change', () => filterByYear(globalData, yearsSelector.value))
