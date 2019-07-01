const searchInput = document.getElementById("formSearchInput");
const searchButton = document.getElementById("formSearchButton");
const yearsSelector = document.getElementById("formYears");
const tagsSelector = document.getElementById("formTags");

let globalReportsData = [];
let yearsList = ["Wszystkie"];
let tagsList = [];

//  stop default form behavior
document.getElementById('form').addEventListener('submit', event => event.preventDefault());

//  --------- Wstępne formatowanie danych z JSON  --------- 

function fetchData() {

    fetch("data.json")
        .then(function(resp) {
            return resp.json();
        })
        .then(function(data) {
            //  format unix_timestamp to js Date()
            data.map(raport => raport.date = new Date(raport.date))
            globalReportsData = [...data];           
            
            //  after fetch render search form and initial reports 
            renderFiltersForm()
            filterReportsByAllConditions( yearsSelector.value, searchInput.value )
        })
        .catch(error => console.error(error));
}




//  ---------  Filtrowanie(Przeszukiwanie) danych z JSONa / Filter throught all inputs--------- 

function filterReportsByAllConditions( year , chars ) {

    let filteredReportsData;

    //  filter by year
        year !== "Wszystkie"
    ?   filteredReportsData = globalReportsData.filter(raport => raport.date.getFullYear() == year )
    :   filteredReportsData = globalReportsData;

    //  filter by chars
    filteredReportsData = filteredReportsData.filter(raport => raport.title.includes(chars) || raport.description.includes(chars));
    
    //  filter by tags
    const tagsSelected = tagsList.filter((tag,index) => document.getElementById(`check${index}`).checked ? tag : null);
    
        !document.getElementById(`checkAll`).checked
    ?   filteredReportsData = filteredReportsData.filter(raport => tagsSelected.some(element => element === raport.category))
    :   null;

    renderReportsData(filteredReportsData);
}


//  ---------  Generowanie szkieletu formularza/filtrownicy --------- 

function renderFiltersForm(){

    //  set avilable Years from data
    globalReportsData.forEach(element => {
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
    globalReportsData.forEach(element => {
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
    document.getElementById(`checkAll`).addEventListener("click", () => filterReportsByAllConditions( yearsSelector.value, searchInput.value));
    tagsList.map((tag, index) => {
        const option = document.getElementById(`check${index}`);
        option.addEventListener("click", () => filterReportsByAllConditions( yearsSelector.value, searchInput.value));
    });   

}



//  ---------  Generowanie boxów z raportami w <main> --------- 
function renderReportsData(reportsData){

    let reportsRenderedOutput = false;
    let fileTogglersIndex = 0;

    reportsData.forEach((report, index) => {  

        const time = report.date;
        const minutesHour = ('0' + time.getHours()).slice(-2) + ":" + ('0' + time.getMinutes()).slice(-2);
        const dayMonthYear = ('0' + time.getDate()).slice(-2) + "." + ('0' + time.getMonth()).slice(-2) + "." + time.getFullYear();
        
        let filesOutput = "";

        report.files.forEach(
            file => filesOutput += 
                `
                <a>
                    Pobierz ${file.filename}.pdf    (${file.filesize}kB)
                </a>
                `
        );

        const attachedFiles = 
                report.files.length === 0 
            ?   ""
            :   report.files.length === 1 
            ?   ` 
                <a>
                    Pobierz ${report.files[0].filename}.pdf    (${report.files[0].filesize}kB)
                </a>
                `
            :   ` 
                <a class="block--raport--files--toggled" id="toggleFiles${fileTogglersIndex}"}>
                    Pliki do pobrania (${report.files.length})     
                    <i class="arrow arrow-down"></i>
                </a>
                <div class="hidden" id="visibleFiles${fileTogglersIndex}">
                    <hr>
                    ${filesOutput}
                </div>
                `;
        
        report.files.length >= 2 ? fileTogglersIndex++ : null;


        reportsRenderedOutput += 
            `
            <div class="block clear-fix">
                <div class="block--date-category f-left">
                    <p><b>${dayMonthYear}</b></p>
                    <p><b>${minutesHour}</b></p>
                    <p>${report.category}</p>
                </div>
                <div class="block--raport f-left">
                    <h2>${report.title}</h2>
                    <p>${report.description}</p>
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
    const reportsList = document.getElementById("reportsList");
    // reportsRenderedOutput === ""
    // ? reportsList.innerHTML = "Brak wyników spełniających kryteria" 
    // : reportsList.innerHTML = reportsRenderedOutput || "Brak wyników spełniających kryteria";
    console.log(reportsRenderedOutput);
    
    reportsList.innerHTML = reportsRenderedOutput || "Brak wyników spełniających kryteria";

    //  Add listeners to <a>Pliki do pobrania</a>
    for( let i=0 ; i<fileTogglersIndex ; i++ ){
        document.getElementById(`toggleFiles${i}`).addEventListener("click", () => {
            document.getElementById(`visibleFiles${i}`).classList.toggle("hidden");
            document.querySelector(`#toggleFiles${i} i`).classList.toggle("arrow-up");
        });
    }

}

window.addEventListener("load", fetchData());
yearsSelector.addEventListener("change", () => filterReportsByAllConditions( yearsSelector.value, searchInput.value));
searchButton.addEventListener("click", () => filterReportsByAllConditions( yearsSelector.value, searchInput.value));
