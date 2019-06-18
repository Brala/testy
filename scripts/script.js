const list = document.getElementById("list");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const yearsSelector = document.getElementById("years");
const tagsSelector = document.getElementById("tags");

let globalData = [];
let yearsList = ["Wszystkie"];
let tagsList = [];

// stop default form behavior
const form = document.getElementById('form');
form.addEventListener('submit', e => e.preventDefault());


// --------- Wstępne formatowanie danych z JSON + generowanie szkieletu Filtrownicy  --------- 

function fetchData() {

    fetch("data.json")
        .then(function(resp) {
            return resp.json();
        })
        .then(function(data) {
            // format unix_timestamp to js Date()
            data.map(raport => raport.date = new Date(raport.date))
            globalData = data;


            // setYears
            data.forEach(element => {
                const year = element.date.getFullYear(); 
                yearsList.push(year);
                yearsList = [...new Set(yearsList)];
            })
            yearsList.sort((a, b) => a - b);
            const yearsArrow = '<i class="arrow arrow-down"></i> '
            yearsSelector.innerHTML = yearsArrow
            + yearsList.map(year => `<option>${year}</option>`);

            yearsSelector.selectedIndex = yearsSelector.options.length-1;
            let strUser = yearsSelector.options[yearsSelector.selectedIndex].text;

            
            // setTags
            data.forEach(element => {
                const tag = element.category;
                tagsList.push(tag);
                tagsList = [...new Set(tagsList)];
            })

            let output = `
                <div class="form--row">
                    <input class="checkbox" type="checkbox" name="checkAll" id="checkAll" checked>
                    <label class="checklabel" for="checkAll">Wszystkie <span>&#x2716;</span></label>
                </div>
            `;

            tagsList.forEach((tag, index) => output += `
                <div class="form--row">
                    <input class="checkbox" type="checkbox" name="check${index}" id="check${index}">
                    <label class="checklabel" for="check${index}">${tag}<span>&#x2716;</span></label>
                </div>
                `
            );    
            tagsSelector.innerHTML = output;

            //Add listeners to all tags
            document.getElementById(`checkAll`).addEventListener("click", () => filterAll(globalData, yearsSelector.value, searchInput.value));
            tagsList.map((tag, index) => {
                const option = document.getElementById(`check${index}`);
                option.addEventListener("click", () => filterAll(globalData, yearsSelector.value, searchInput.value));
            });   
            
            
            filterAll(globalData, yearsSelector.value, searchInput.value)
        });
}



// ---------  Filtrowanie(Przeszukiwanie) danych z JSONa / Filter throught all inputs--------- 

function filterAll( globalData , year , chars , tags ) {

    let filteredData;

    // filter by year
    year !== "Wszystkie"
    ?   filteredData = globalData.filter(raport => raport.date.getFullYear() == year )
    :   filteredData = globalData;

    // filter by chars
    filteredData = filteredData.filter(raport => raport.title.includes(chars) || raport.description.includes(chars));
    
    // filter by tags
    const tagsSelected = tagsList.filter((tag,index) => document.getElementById(`check${index}`).checked ? tag : null); 

    !   document.getElementById(`checkAll`).checked
    ?   filteredData = filteredData.filter(raport => tagsSelected.some(el => el === raport.category))
    :   null;

    renderData(filteredData);
}



// ---------  Generowanie boxów z raportami w <main> --------- 
function renderData(data){

    let output = "";
    let filesToggleIndex = 0;

    data.forEach((element, index) => {  

        const time = element.date;
        const minutesHour = ('0' + time.getHours()).slice(-2) + ":" + ('0' + time.getMinutes()).slice(-2);
        const dayMonthYear = ('0' + time.getDate()).slice(-2) + "." + ('0' + time.getMonth()).slice(-2) + "." + time.getFullYear();
        
        let filesOutput = "";

        element.files.forEach(
            file => filesOutput += `
                <a>
                    Pobierz ${file.filename}.pdf    (${file.filesize}kB)
                </a>`
        );

        const attachedFiles = 
            element.files.length === 0 
            ? ""
            : element.files.length === 1 
            ? ` <a>
                    Pobierz ${element.files[0].filename}.pdf    (${element.files[0].filesize}kB)
                </a>`
            : ` <a class="block--raport--files--toggled" id="toggleFiles${filesToggleIndex}"}>
                    Pliki do pobrania (${element.files.length})     
                    <i class="arrow arrow-down"></i>
                </a>
                <div class="hidden" id="visibleFiles${filesToggleIndex}">
                    <hr>
                    ${filesOutput}
                </div>`;
        
        element.files.length >= 2 ? filesToggleIndex++ : null;


        output += `
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
    // Renderowanie treści
    output === ""
    ? list.innerHTML = "Brak wyników spełniających kryteria" 
    : list.innerHTML = output;

    // Dodawanie click-listenerów do "Pliki do pobrania"
    for( let i=0 ; i<filesToggleIndex ; i++ ){
        document.getElementById(`toggleFiles${i}`).addEventListener("click", () => {
            document.getElementById(`visibleFiles${i}`).classList.toggle("hidden");
            document.querySelector(`#toggleFiles${i} i`).classList.toggle("arrow-up");
        });
    }
}

window.addEventListener("load", fetchData());

yearsSelector.addEventListener("change", () => filterAll(globalData, yearsSelector.value, searchInput.value));
searchButton.addEventListener("click", () => filterAll(globalData, yearsSelector.value, searchInput.value));
