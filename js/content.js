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
            readEXCELFile(file);
        }else if (file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
            readCSVOrTXTFile(file);
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


    function readEXCELFile(file) {
        var xl2json = new ExcelToJSON();
        xl2json.parseExcel(file);
    } 


    function readCSVOrTXTFile(file) {
        var reader = new FileReader();
        reader.onload = function(content) {
            let data = csv2json(content.target.result, sep="\t");
            
            // console.table(data);
            lancarNotas(data);
        }
        reader.readAsText(file);
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



    var ExcelToJSON = function () {

        this.parseExcel = function (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var data = e.target.result;

            var workbook = XLSX.read(data, {
            type: 'binary'
            });

            // var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets["Plan1"]);
            const firstSheet = workbook.SheetNames[0];
            var data = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
            
            // console.table(data);
            lancarNotas(data);

        }

        reader.onerror = function (ex) {
            console.error(ex);
        }

        reader.readAsBinaryString(file);
        }
    };

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
            return header.filter( (h) => { return h.search("Aval.") !=-1 }).map( (n) => { return n.split(' ')[1].trim() });
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
        header     = header.filter( (h) => { return h.search("Aval.") !=-1 }).map( (n) => { return n.split(' ') });
        let ids    = header.map( n => n[1].trim() );
        let totais = header.map( n => n[2].trim() );
        return [ids, totais];
    }    

    function lancarNotas(data){
        const idsProvas = getIdProvasFromSite();
        const idTurma = getTurmaFromSiteId();

        for (const idProva of idsProvas){
            
            console.log(`Lançando Aval. ${idProva}...`);

            for(let r of data){
                let ra = zeroLefPad(r['RA'], 7);

                let nota = r[`Aval._${idProva}`];
                if(nota.search(",") == -1){
                    nota = (Number(nota)).toLocaleString('pt-BR');
                }

                const inputNota = document.querySelector(`#tbProva_${idProva}_${ra}_${idTurma}`);
                if(inputNota && inputNota.value !== nota){
                    inputNota.value = nota;
                    // console.log(inputNota.value," !== ", nota);
                }else {
                    // console.log(inputNota.value," == ", nota);
                    console.error(`#tbProva_${idProva}_${ra}_${idTurma}`, (inputNota.value," == ", nota) );
                }
            }
        }
    }

    const zeroLefPad = (num, places) => {
        var s = String(num).padStart(places, '0');
        return s.substr(s.length-places);
    }

})();