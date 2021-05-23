(async function() {
    await init();


    function init() {
        // console.log("init...");
        const tr0Notas = document.querySelector("#ctl24_xgvNotas_DXDataRow0");
        if(tr0Notas){
            const toolbar = document.querySelector("#ctl24_EduTurmasProfFiltroSelecionado1_EduToolBarFuncProf1_Td10");

            const divUpload = document.createElement('div');
            divUpload.classList.add("upload-btn-wrapper");

            const buttonUpload = document.createElement('button');
            buttonUpload.innerText = "Buscar notas do arquivo...";
            buttonUpload.classList.add("btn");

            const inputFile = document.createElement('input');
            inputFile.setAttribute("type", "file");
            inputFile.setAttribute("id", "file");
            inputFile.setAttribute("name", "file");
            inputFile.addEventListener('change', handleFileSelect, false);
            
            divUpload.appendChild(inputFile);
            divUpload.appendChild(buttonUpload);

            toolbar.appendChild(divUpload);
        }        
    }



    function handleFileSelect(evt) {
        var file = evt.target.files[0]; // FileList object
        // console.log(file);
        if (!file) return;
        if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")){
            readExcel(file);
        }else if (file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
            readCSV(file);
        }else{
            alert("Formato inválido para o arquivo "+ file.name+ 
                "\n\nTente:"+
                "\n um arquivo do excel com final '.xls' ou '.xlsx'"+
                "\nou"+
                "\n um arquivo de texto com final '.csv' ou '.txt'"  
                );
        }
        evt.target.value = ''; // clear last file read
    }


    function readExcel(file) {
        new ExcelToJSON(lancarNotas).parse(file);
    } 

    function readCSV(file) {
        new CSVToJSON(lancarNotas).parse(file);
    }

    //var csv is the CSV file with headers
    function csv2json(csv, sep) {
        var lines=csv.split("\n");
        var result = [];
        // NOTE: If your columns contain commas in their values, you'll need
        // to deal with those before doing the next step 
        // (you might convert them to &&& or something, then covert them back later)
        // jsfiddle showing the issue https://jsfiddle.net/
        var headers=lines[0].split(sep);
        for(var i=1;i<lines.length;i++){
            var obj = {};
            if (lines[i].trim() != ""){ 
                var currentline=lines[i].split(sep);
                for(var j=0;j<headers.length;j++){
                    obj[`${headers[j]}`.trim()] = `${currentline[j]}`.trim();
                }
                result.push(obj);
            }
        }
        return result; //JavaScript object
    }


    var CSVToJSON = function (tratarDadosFn) {
        this.parse = function (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                let data = csv2json(e.target.result, sep="\t");
                tratarDadosFn(data);
            }
            reader.onerror = function (ex) {
                console.error(ex);
            }
            reader.readAsText(file);
        }
    };    


    var ExcelToJSON = function (tratarDadosFn) {
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
        }
    };

    function lancarNotas(data){
        const idsProvas = getIdProvasFromSite();
        const idTurma = getTurmaFromSiteId();

        for (const idProva of idsProvas){
            console.log(`Lançando Aval. ${idProva}...`);

            for(let r of data){
                let ra = zeroLeftPad(r['RA'], 7);

                let nota = r[`Aval._${idProva}`];
                if(nota.search(",") == -1){
                    nota = (Number(nota)).toLocaleString('pt-BR');
                }
                const inputNota = document.querySelector(`#tbProva_${idProva}_${ra}_${idTurma}`);
                if(inputNota){
                    if(inputNota.value !== nota)
                        inputNota.value = nota;
                    else
                        console.info(ra, inputNota.value," == ", nota);
                }else {
                    console.error(`#tbProva_${idProva}_${ra}_${idTurma}`);
                }
            }
        }
    }

    function getTurmaFromSiteId(){
        var tr0 = document.querySelector("tr#ctl24_xgvNotas_DXDataRow0.dxgvDataRow_Edu");
        var str = tr0.querySelector("td span[title]").getAttribute("onClick");
        const idTurma = str.split("&")[4].split("=")[1];    
        return idTurma;
    }

    function getIdProvasFromSite(){
            const th = document.querySelector("#ctl24_xgvNotas_DXHeadersRow0");
            const tds = th.querySelectorAll("td.dxgvHeader_Edu");
            let header = [];
            for(const td of tds){
                header.push(td.innerText.trim());
            }
            return header.filter( h => h.search("Aval.") !=-1 ).map( n => n.split(' ')[1].trim() );
    }

    /**
     * Funcao nao utilizada
     */
    function getIdAndTotaisProvasFromSite(){
        const th = document.querySelector("#ctl24_xgvNotas_DXHeadersRow0");
        const tds = th.querySelectorAll("td.dxgvHeader_Edu");
        let header = [];
        for(const td of tds){
            header.push(td.innerText.trim());
        }
        header     = header.filter( h => h.search("Aval.") !=-1 ).map( n => n.split(' ') );
        let ids    = header.map( n => n[1].trim() );
        let totais = header.map( n => n[2].trim() );
        return [ids, totais];
    }

    const zeroLeftPad = (num, places) => {
        var s = String(num).padStart(places, '0');
        return s.substr(s.length-places);
    }

})();