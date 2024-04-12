(async function () {
    await init();

    function init() {
        // console.log("init...");
        const raioAmarelo = document.querySelector("#ctl24_ximgCopSugEtapa");
        if (raioAmarelo) {
            const toolbar = document.querySelector("#ctl24_EduTurmasProfFiltroSelecionado1_EduToolBarFuncProf1_Td10");

            const divUpload = document.createElement('div');
            divUpload.classList.add("upload-btn-wrapper");

            const buttonUpload = document.createElement('button');
            buttonUpload.innerText = "Importar frequência";
            buttonUpload.classList.add("btn");

            const inputFile = document.createElement('input');
            inputFile.setAttribute("type", "file");
            inputFile.setAttribute("id", "file");
            inputFile.setAttribute("name", "file");
            inputFile.addEventListener('change', handleFileSelect, false);

            divUpload.appendChild(inputFile);
            divUpload.appendChild(buttonUpload);


            // Add button for export do excel

            const divDownload = document.createElement('div');
            const buttonExcel = document.createElement('button');
            buttonExcel.classList.add("btn");
            buttonExcel.innerText = "Exportar planilha";
            buttonExcel.addEventListener('click', handleFreq2Xlsx);
            divDownload.appendChild(buttonExcel);

            toolbar.appendChild(divUpload);
            toolbar.appendChild(divDownload);
        }
    }



    function handleFileSelect(evt) {
        var file = evt.target.files[0]; // FileList object
        // console.log(file);
        if (!file) return;
        if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
            readExcel(file);
        } else if (file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
            readCSV(file);
        } else {
            alert("Formato inválido para o arquivo " + file.name +
                "\n\nTente:" +
                "\n um arquivo do excel com final '.xls' ou '.xlsx'" +
                "\nou" +
                "\n um arquivo de texto com final '.csv' ou '.txt'"
            );
        }
        evt.target.value = ''; // clear last file read
    }


    function readExcel(file) {
        new ExcelToJSON2(lancarFrequencia).parse(file);
    }

    function readCSV(file) {
        new CSVToJSON(lancarFrequencia).parse(file);
    }

    function csv2json(csv, sep) {
        var lines = csv.split("\n");
        var result = [];
        var headers = lines[0].split(sep);
        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            if (lines[i].trim() != "") {
                var currentline = lines[i].split(sep);
                for (var j = 0; j < headers.length; j++) {
                    obj[`${headers[j]}`.trim()] = `${currentline[j]}`.trim();
                }
                result.push(obj);
            }
        }
        return result; //JavaScript object
    }

    function lancarFrequencia(data) {
        const contador = document
            .querySelector("#ctl24_ctl06 > tbody > tr:nth-child(3) > td:nth-child(5) > div")
            .getAttribute('id')
            .split('_')[2]

        for (let i in data) {
            
            let row = data[i]
            const ra = row['R.A.']

            for (const [key, value] of Object.entries(row)) {


                let v = String( value || '.' ).trim().toLowerCase();


                // console.log('Key : ' + key + ', Value : ' + row[key])
                if (key.indexOf('/') != -1)  {

                    let nums = key.split('-')
                    let data = nums[0].replaceAll('/', '\\/')
                    let num = nums[2]

                    const input = document.querySelector(`input#ckFreq_${num}¶${data}¶${ra}¶${contador}`)

                    if (input) 
                    {
                        // console.info(`input#ckFreq_${num}¶${data}¶${ra}¶${contador}`, '=>', `'${v}'`)
                        // console.log( "input.checked> ", input.checked )                        

                        if ( v == 'x') // watch the data sheet 
                        {
                            if (input.checked === false) { input.click() }

                        } else {
                            if (input.checked === true) { input.click() }
                        }
                    }
                }
            }
        }
    }

    function getTurmaFromSiteId() {
        var tr0 = document.querySelector("tr#ctl24_xgvNotas_DXDataRow0.dxgvDataRow_Edu");
        var str = tr0.querySelector("td span[title]").getAttribute("onClick");
        const idTurma = str.split("&")[4].split("=")[1];
        return idTurma;
    }

    // functions for export freq to excel

    function handleFreq2Xlsx(evt) {
        evt.preventDefault();

        const header1 = getHeadersFromTableFreq();
        const header2 = getHeadersFromTableFreq_Horarios();
        const header3 = getHeadersFromTableFreq_Horarios_2();

        let table1 = document.querySelector("#ctl24_ctl06");
        let tbody1 = table1.querySelector('tbody');
        let trAlunos = tbody1.querySelectorAll('tr:not(.EduTableFreqHeader)');

        let alunos1 = [];
        trAlunos.forEach(tr => {
            let registro = [];
            let tds = tr.querySelectorAll('td');
            tds.forEach((td, i) => {
                let text = '';
                // if (i == 0) {
                //     text = td.querySelector('input').getAttribute('value');
                // } else
                text = td.innerText.trim();

                registro.push(text);
            });
            alunos1.push(registro);
        });


        const table2 = document.querySelector('#ctl24_pnlHorarios table.EduTableFreqMain')
        let tbody2 = table2.querySelector('tbody');
        let trDias = tbody2.querySelectorAll('tr:not(.EduTableFreqHeader)');

        var alunos2 = [];
        trDias.forEach(tr => {
            let registro = [];
            let tds = tr.querySelectorAll('td');
            tds.forEach((td, i) => {
                let input = td.querySelector('input');
                registro.push(input.getAttribute('id').replaceAll("/", "\\/"));
            });
            alunos2.push(registro);
        });


        var alunos3 = [];
        trDias.forEach(tr => {
            let registro = [];
            let tds = tr.querySelectorAll('td');
            tds.forEach((td, i) => {
                let input = td.querySelector('input');
                registro.push(input.checked ? 'x' : '.' );
            });
            alunos3.push(registro);
        });



        var freqsJson1 = [];
        for (let a of alunos1) {
            let fJson = {};
            for (let i in a) {
                fJson[header1[i]] = a[i];
            }
            freqsJson1.push(fJson);
        }

        var freqsJson2 = [];
        for (let a of alunos2) {
            let fJson = {};
            for (let i in a) {
                fJson[header2[i]] = a[i];
            }
            freqsJson2.push(fJson);
        }

        var freqsJson3 = [];
        for (let a of alunos3) {
            let fJson = {};
            for (let i in a) {
                fJson[header3[i]] = a[i];
            }
            freqsJson3.push(fJson);
        }

        let final1 = []
        for (let i = 0; i < freqsJson1.length; i++) {
            final1.push(Object.assign({}, freqsJson1[i], freqsJson2[i])) // Concatena as linhas no mesmo indice 
        }

        let final2 = []
        for (let i = 0; i < freqsJson1.length; i++) {
            final2.push(Object.assign({}, freqsJson1[i], freqsJson3[i])) // Concatena as linhas no mesmo indice 
        }


        // console.table(freqsJson1);

        let fileName = getNomeDaTurmaFaltas(".xlsx");

        // console.log("fileName> ", fileName)

        var wb = XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(wb,
            XLSX.utils.json_to_sheet(final2),
            'Plan1');

        // XLSX.utils.book_append_sheet(wb,
        //     XLSX.utils.json_to_sheet(final1),
        //     'Plan2');

        // XLSX.utils.book_append_sheet(wb,
        //     XLSX.utils.json_to_sheet(freqsJson2),
        //     'Plan3');

        XLSX.writeFile(wb, fileName);

    }




    function getHeadersFromTableFreq() {
        const th = document.querySelector("tr.EduTableFreqHeader:nth-child(2)");
        const tds = th.querySelectorAll("td");

        let header = [];
        for (const td of tds) {
            header.push(td.innerText.trim());
        }
        return header.map((h) => {
            if (h.search("Nº Diário") != -1) {
                return `N_Diario`;
            }
            if (h == "") return "Col_0";
            if (h == "Nº") return "Col_N";
            return h.replaceAll(" ", "_");
        });
    }

    function getHeadersFromTableFreq_Horarios() {
        const table = document.querySelector('#ctl24_pnlHorarios table.EduTableFreqMain')
        const th1 = table.querySelectorAll('tr.EduTableFreqHeader:nth-child(1) > td')
        const th2 = table.querySelectorAll('tr.EduTableFreqHeader:nth-child(2) > td')

        let header = [];

        for (let i = 0; i < th1.length; i++) {
            const e1 = th1[i];
            const e2 = th2[i];
            header.push(`${e1.innerText.trim()}-${e2.innerText.trim()}`);
        }

        return header

    }

    function getHeadersFromTableFreq_Horarios_2() {
        const table = document.querySelector('#ctl24_pnlHorarios table.EduTableFreqMain')
        const th1 = table.querySelectorAll('tr.EduTableFreqHeader:nth-child(1) > td')
        const th2 = table.querySelectorAll('tr.EduTableFreqHeader:nth-child(2) > td')
        const tds = document.querySelectorAll("#ctl24_pnlHorarios > table > tbody > tr:nth-child(3) > td")

        let header = [];

        for (let i = 0; i < th1.length; i++) {
            const e1 = th1[i];
            const e2 = th2[i];
            let num = tds[i].querySelector('input').getAttribute('id').split("¶")[0].split('_')[1]

            header.push(`${e1.innerText.trim()}/${new Date().getFullYear()}-${e2.innerText.trim()}-${num}`)
        }

        return header
    }




    function getFreq_Horarios2json() {
        alunos = []

        const table = document.querySelector('#ctl24_pnlHorarios table.EduTableFreqMain')
        let tbody = table.querySelector('tbody');
        let trDias = tbody.querySelectorAll('tr:not(.EduTableFreqHeader)');

        var alunos = [];
        trDias.forEach(tr => {
            let registro = [];
            let tds = tr.querySelectorAll('td');
            tds.forEach((td, i) => {
                let input = td.querySelector('input');
                registro.push(input.getAttribute('id').replaceAll("/", "\\/"));
            });
            alunos.push(registro);
        });

        const header = getHeadersFromTableFreq_Horarios();
        var alunosJson = [];
        for (let a of alunos) {
            let alunoJson = {};
            for (let i in a) {
                alunoJson[header[i]] = a[i];
            }
            alunosJson.push(alunoJson);
        }

        alunosJson = filterJsonObject(alunosJson, ["Col_0", "Col_N"]);
        return alunosJson

    }



    function getFreq2json() {

        alunos = []

        let table = document.querySelector("#ctl24_ctl06");
        let tbody = table.querySelector('tbody');
        let trAlunos = tbody.querySelectorAll('tr:not(.EduTableFreqHeader)');

        var alunos = [];
        trAlunos.forEach(tr => {
            let registro = [];
            let tds = tr.querySelectorAll('td');
            tds.forEach((td, i) => {
                let text = td.innerText.trim();
                registro.push(text);
            });
            alunos.push(registro);
        });

        const header = getHeadersFromTableFreq();
        var alunosJson = [];
        for (let a of alunos) {
            let alunoJson = {};
            for (let i in a) {
                alunoJson[header[i]] = a[i];
            }
            alunosJson.push(alunoJson);
        }

        alunosJson = filterJsonObject(alunosJson, ["Col_0", "Col_N"]);
        return alunosJson

    }

})();


var CSVToJSON = function (tratarDadosFn) {
    this.parse = function (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            let data = csv2json(e.target.result, sep = "\t");
            tratarDadosFn(data);
        }
        reader.onerror = function (ex) {
            console.error(ex);
        }
        reader.readAsText(file);
    }
};


var ExcelToJSON2 = function (tratarDadosFn) {
    this.parse = function (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var workbook = XLSX.read(e.target.result, { type: 'binary' });
            const firstSheet = workbook.SheetNames[0];
            var data = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
            tratarDadosFn(data);
        }
        reader.onerror = function (ex) {
            console.error(ex);
        }
        reader.readAsBinaryString(file);
        // reader.readAsArrayBuffer(file)
    }
};




function getEtapaFaltas() {
    let inputEtapa = document.querySelector("#ctl24_xcbEtapaFaltas_I")
    let nome = inputEtapa.value
    nome = nome.replace(/ |ª|-/g, "_").replace(/_+/g, "_")
    return nome
}

function getNomeDaTurmaFaltas(ext) {
    let desc = document.querySelector("#ctl24_EduTurmasProfFiltroSelecionado1_xrpContextoEducacional_lbTurmaDisc").innerText
    desc = desc.replaceAll(" ", "_")
    let etapa = getEtapaFaltas()

    // console.log("etapa> ", etapa)

    return `${desc}_${etapa}_${ext}`
}

function filterJsonObject(listobj, cols) {
    let new_listobj = [];
    for (const o of listobj) {
        let obj = {};
        for (const k in o) {
            if (!cols.includes(k)) {
                obj[k] = o[k];
            }
        }
        new_listobj.push(obj);
    }
    return new_listobj;
}

