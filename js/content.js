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
            buttonUpload.innerText = "Buscar notas";
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
            buttonExcel.innerText = "Gerar excel";
            buttonExcel.addEventListener('click', handleNotas2json);
            divDownload.appendChild(buttonExcel);

            toolbar.appendChild(divUpload);
            toolbar.appendChild(divDownload);
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

    function csv2json(csv, sep) {
        var lines=csv.split("\n");
        var result = [];
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
                let ra = zeroLeftPad(r['R.A.'], 7);

                let nota = String(r[`Aval._${idProva}`]);
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

    // functions for export notas to excel

    function getHeadersFromTableNotas(){
        const th = document.querySelector("#ctl24_xgvNotas_DXHeadersRow0");
        const tds = th.querySelectorAll("td.dxgvHeader_Edu");

        // const tds = th.querySelectorAll('td[id*="ctl24_xgvNotas_col"]'); <<==

        let header = [];
        for(const td of tds){
            header.push(td.innerText.trim());
        }
        return header
                    //  .filter(h => h.trim() != "" && h.trim() != "Nº")
                     .map( (h) => {
            if (h.search("Aval.") !=-1){
                let idP = h.split(' ')[1].trim();
                return `Aval._${idP}`;
            }
            if(h == "") return "Col_0";
            if(h == "Nº") return "Col_N";
            return h.replaceAll(" ","_");
        });
    }


    function getNomeDaTurma(ext){
        let desc = document.querySelector("#ctl24_EduTurmasProfFiltroSelecionado1_xrpContextoEducacional_lbTurmaDisc").innerText;
        return desc.replaceAll(" ","_") + ext;
    }

    function isEtapaRecuperacao(){
        let inputEtapa =  document.querySelector("#ctl24_xcbEtapa_I");
        if(inputEtapa)
            return inputEtapa.value.search("Recupera") != -1;

        return false;
    }

    function handleNotas2json(evt) {
        evt.preventDefault();
        alunos = []
        
        let table = document.querySelector("#ctl24_xgvNotas_DXMainTable");
        let tbody = table.querySelector('tbody');
        let trAlunos = tbody.querySelectorAll('tr[class*="dxgvDataRow_Edu"]');
    
        const isEtRec = isEtapaRecuperacao();
    
        var alunos = [];
        trAlunos.forEach(tr => {
            let registro = [];
            let tds = tr.querySelectorAll('td');
            tds.forEach((td, i) => {
                // if(isEtRec && (i < 2)) return; // ignora as duas primeiras colunas se for em tela de recuperação
                // if(!isEtRec && (i < 1)) return; // ignora a primeira coluna se não for em tela de recuperação
                let input = td.querySelector('input');
                if (input){
                    let n = input.value.trim().replace(",",".");
                    registro.push( n == "" ? "" : parseFloat(n));
                }else{
                    let text = td.innerText.trim();
                    registro.push(text);
                }
            });
            alunos.push(registro);
        });
    
        const header = getHeadersFromTableNotas();
        var alunosJson = [];
        for(let a of alunos){
            let alunoJson = {};
            for(let i in a){
                alunoJson[ header[i] ] = a[i];
            }
            alunosJson.push(alunoJson);
        }

        alunosJson = filterJsonObject(alunosJson, ["Col_0","Col_N"]);
        console.table(alunosJson);
    
        let fileName = getNomeDaTurma(".xlsx"); 

        var plan1 = XLSX.utils.json_to_sheet(alunosJson); 
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, plan1, 'Plan1');
        XLSX.writeFile(wb, fileName);
    }    


    function filterJsonObject(listobj, cols){
        let new_listobj = [];
        for(const o of listobj){
            let obj = {};
            for(const k in o){
                if (!cols.includes(k)){
                   obj[k] = o[k];  
                } 
            }
            new_listobj.push(obj);
        }
        return new_listobj;
    }    

})();