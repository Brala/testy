const list = document.getElementById("list");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const yearsSelector = document.getElementById("years");
const tagsSelector = document.getElementById("tags");

let globalData = "";
let yearsList = [];
let tagsList = [];


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
            filterByYear(globalData, strUser)
        
            
            // setTags
            data.forEach(element => {
                const tag = element.category;
                tagsList.push(tag);
                tagsList = [...new Set(tagsList)];
            })

            let output = `
                <div class="formrow">
                    <input class="checkbox" type="checkbox" name="checkAll" id="checkAll">
                    <label class="checklabel" for="checkAll">Wszystkie <span>&#x2716;</span></label>
                </div>
            `;

            tagsList.forEach((tag, index) => output += `
                <div class="formrow">
                    <input class="checkbox" type="checkbox" name="check${index}" id="check${index}">
                    <label class="checklabel" for="check${index}">${tag}<span>&#x2716;</span></label>
                </div>
                `
            );    
            tagsSelector.innerHTML = output;
            //Add listeners to all tags
            document.getElementById(`checkAll`).addEventListener("click", () => filterByTag(globalData));
            tagsList.map((tag, index) => {
                const option = document.getElementById(`check${index}`);
                option.addEventListener("click", () => filterByTag(globalData));
            });           
        });
}


// ---------  Filtrowanie(Przeszukiwanie) danych z JSONa --------- 
function filterByYear(data,value){
    const filteredData = data.filter(raport => raport.date.getFullYear() == value );
    renderData(filteredData);
}

function filterByTag(data,value){
    const tagsSelected = tagsList.filter((tag,index) => document.getElementById(`check${index}`).checked ? tag : null);
    const filteredData = data.filter(raport => raport.category === tagsSelected[0] ||  raport.category === tagsSelected[1] ||raport.category === tagsSelected[2] ||raport.category === tagsSelected[3]);   
    document.getElementById(`checkAll`).checked 
    ? renderData(globalData)
    : renderData(filteredData);
}

function filterByChars(data,value){
    const filteredData = data.filter(raport => raport.title.includes(value) || raport.description.includes(value));
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
            : ` <a class="toggle-files" id="toggleFiles${filesToggleIndex}"}>
                    Pliki do pobrania (${element.files.length})     <i class="arrow arrow-down"></i>
                </a>
                <div class="hidden" id="visibleFiles${filesToggleIndex}">
                    <hr>
                    ${filesOutput}
                </div>`;
        
        element.files.length >= 2 ? filesToggleIndex++ : null;


        output += `
            <div class="block clear-fix">
                <div class="date-category f-left">
                    <p><b>${dayMonthYear}</b></p>
                    <p><b>${minutesHour}</b></p>
                    <p>${element.category}</p>
                </div>
                <div class="title-description-files f-left">
                    <h2>${element.title}</h2>
                    <p>${element.description}</p>
                    <div class="f-left">
                        <a>Zobacz raport</a>
                    </div>
                    <div class="files f-left">
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
searchButton.addEventListener("click", () => filterByChars(globalData, searchInput.value));
yearsSelector.addEventListener("change", () => filterByYear(globalData, yearsSelector.value))
