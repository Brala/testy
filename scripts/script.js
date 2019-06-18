const list = document.getElementById("list");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const yearsSelector = document.getElementById("years");
const tagsSelector = document.getElementById("tags");

let globalData = [];
let yearsList = ["Wszystkie"];
let tagsList = [];

//  stop default form behavior
document.getElementById('form').addEventListener('submit', e => e.preventDefault());



//  --------- Wstępne formatowanie danych z JSON  --------- 

function fetchData() {

    fetch("data.json")
        .then(function(resp) {
            return resp.json();
        })
        .then(function(data) {
            //  format unix_timestamp to js Date()
            data.map(raport => raport.date = new Date(raport.date))
            globalData = [...data];           
            
            //  after fetch render search form and initial reports 
            renderFiltersForm()
            filterByAll(globalData, yearsSelector.value, searchInput.value)
        })
        .catch(error => console.error(error));
}



//  ---------  Filtrowanie(Przeszukiwanie) danych z JSONa / Filter throught all inputs--------- 

function filterByAll( globalData , year , chars , tags ) {

    let filteredData;

    //  filter by year
        year !== "Wszystkie"
    ?   filteredData = globalData.filter(raport => raport.date.getFullYear() == year )
    :   filteredData = globalData;

    //  filter by chars
    filteredData = filteredData.filter(raport => raport.title.includes(chars) || raport.description.includes(chars));
    
    //  filter by tags
    const tagsSelected = 
    tagsList.filter((tag,index) => document.getElementById(`check${index}`).checked ? tag : null); 
        !document.getElementById(`checkAll`).checked
    ?   filteredData = filteredData.filter(raport => tagsSelected.some(el => el === raport.category))
    :   null;

    renderReportsData(filteredData);
}


//  ---------  Generowanie szkieletu formularza/filtrownicy --------- 

function renderFiltersForm(){

    //  set avilable Years from data
    globalData.forEach(element => {
        const year = element.date.getFullYear(); 
        yearsList.push(year);
    })
    yearsList = [...new Set(yearsList)];
    yearsList.sort((a, b) => a - b);

    const yearsArrow = '<i class="arrow arrow-down"></i> '

    yearsSelector.innerHTML = yearsArrow
        + yearsList.map(year => `<option>${year}</option>`);

    yearsSelector.selectedIndex = yearsSelector.options.length-1;

    //  set avilable Tags from data
    globalData.forEach(element => {
        const tag = element.category;
        tagsList.push(tag);
    })
    tagsList = [...new Set(tagsList)];

    let tagsOutput = 
        `
        <div class="form--row">
            <input class="checkbox" type="checkbox" name="checkAll" id="checkAll" checked>
            <label class="checklabel" for="checkAll">Wszystkie <span>&#x2716;</span></label>
        </div>
        `;

    tagsList.forEach((tag, index) => tagsOutput += 
        `
        <div class="form--row">
            <input class="checkbox" type="checkbox" name="check${index}" id="check${index}">
            <label class="checklabel" for="check${index}">${tag}<span>&#x2716;</span></label>
        </div>
        `
    );    
    tagsSelector.innerHTML = tagsOutput;

    //  Add listeners to tag-elements
    document.getElementById(`checkAll`).addEventListener("click", () => filterByAll(globalData, yearsSelector.value, searchInput.value));
    tagsList.map((tag, index) => {
        const option = document.getElementById(`check${index}`);
        option.addEventListener("click", () => filterByAll(globalData, yearsSelector.value, searchInput.value));
    });   

}



//  ---------  Generowanie boxów z raportami w <main> --------- 
function renderReportsData(data){

    let reportsOutput = "";
    let fileTogglersIndex = 0;

    data.forEach((element, index) => {  

        const time = element.date;
        const minutesHour = ('0' + time.getHours()).slice(-2) + ":" + ('0' + time.getMinutes()).slice(-2);
        const dayMonthYear = ('0' + time.getDate()).slice(-2) + "." + ('0' + time.getMonth()).slice(-2) + "." + time.getFullYear();
        
        let filesOutput = "";

        element.files.forEach(
            file => filesOutput += 
                `
                <a>
                    Pobierz ${file.filename}.pdf    (${file.filesize}kB)
                </a>
                `
        );

        const attachedFiles = 
                element.files.length === 0 
            ?   ""
            :   element.files.length === 1 
            ?   ` 
                <a>
                    Pobierz ${element.files[0].filename}.pdf    (${element.files[0].filesize}kB)
                </a>
                `
            :   ` 
                <a class="block--raport--files--toggled" id="toggleFiles${fileTogglersIndex}"}>
                    Pliki do pobrania (${element.files.length})     
                    <i class="arrow arrow-down"></i>
                </a>
                <div class="hidden" id="visibleFiles${fileTogglersIndex}">
                    <hr>
                    ${filesOutput}
                </div>
                `;
        
        element.files.length >= 2 ? fileTogglersIndex++ : null;


        reportsOutput += 
            `
            <div class="block clear-fix">
                <div class="block--date-category f-left">
                    <p><b>${dayMonthYear}</b></p>
                    <p><b>${minutesHour}</b></p>
                    <p>${element.category}</p>
                </div>
                <div class="block--raport f-left">
                    <h2>${element.title}</h2>
                    <p>${element.description}</p>
                    <div class="f-left">
                        <a>Zobacz raport</a>
                    </div>
                    <div class="block--raport--files f-left">
                        ${attachedFiles}
                    </div>
                </div>
            </div>
            `;
    });

    //  Render raports on page
    reportsOutput === ""
    ? list.innerHTML = "Brak wyników spełniających kryteria" 
    : list.innerHTML = reportsOutput;

    //  Add listeners to <a>Pliki do pobrania</a>
    for( let i=0 ; i<fileTogglersIndex ; i++ ){
        document.getElementById(`toggleFiles${i}`).addEventListener("click", () => {
            document.getElementById(`visibleFiles${i}`).classList.toggle("hidden");
            document.querySelector(`#toggleFiles${i} i`).classList.toggle("arrow-up");
        });
    }

}

window.addEventListener("load", fetchData());
yearsSelector.addEventListener("change", () => filterByAll(globalData, yearsSelector.value, searchInput.value));
searchButton.addEventListener("click", () => filterByAll(globalData, yearsSelector.value, searchInput.value));
