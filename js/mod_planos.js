(async function() {
  await planoAulasInit();

  function planoAulasInit(){
    const tr0Planos = document.querySelector("#ctl24_xgvPlanoAula_DXDataRow0");
    if(tr0Planos){
        let toolbar = null;
        let toolbar0 = document.querySelector("#ctl24_EduTurmasProfFiltroSelecionado1_EduToolBarFuncProf1_Td10");
        if (toolbar0){ // Para resolver um problema apontado pelo professor Pedro Henrique Pereira (campus Ponte Nova)
          toolbar = toolbar0;
        }else{
          toolbar = document.querySelector("#ctl24_EduTurmasProfFiltroSelecionado1_EduToolBarFuncProf1_tbFunc");
        }

        const divDownload = document.createElement('div');
        const buttonExcel = document.createElement('button');
        buttonExcel.classList.add("btn");
        buttonExcel.innerText = "Gerar excel";
        buttonExcel.addEventListener('click', handlePlanos2json);
        divDownload.appendChild(buttonExcel);

        const divUpload = document.createElement('div');
        divUpload.classList.add("upload-btn-wrapper");        

        const buttonUpload = document.createElement('button');
        buttonUpload.innerText = "Lançar planos";
        buttonUpload.classList.add("btn");
      
        const inputFile = document.createElement('input');
        inputFile.setAttribute("type", "file");
        inputFile.setAttribute("id", "file");
        inputFile.setAttribute("name", "file");
        inputFile.addEventListener('change', handleFileSelect2, false);
      
        divUpload.appendChild(inputFile);
        divUpload.appendChild(buttonUpload);
        
        toolbar.appendChild(divUpload);
        toolbar.appendChild(divDownload);
    }
  }


  function handleFileSelect2(evt) {
    var file = evt.target.files[0];
    if (!file) return;
    readExcel(file);
    evt.target.value = ''; // clear last file read
  }

  function readExcel(file) {
    new ExcelToJSON(lancarPlanos).parse(file);
  } 

  function handlePlanos2json(evt){ 
    evt.preventDefault();

    let planos = getPlanosFromPage();
    const header = ["Index", "1", "Aula", "Data", "Início", "Término", "Conteúdo previsto", "Conteúdo realizado", "Tipo de Aula", "Reposição","Aula Online", "11"]; // getHeadersFromTablePlanos();
    const indexColsExclude = [1,11];
    let planosJson = planos2Json(header, planos);
    // let aulaToIndex = getAulaToIndex(planosJson);
    
    // console.table(aulaToIndex);
    console.table(planosJson);

    let fileName = getNomeDaTurma("PLANOS.xlsx");
    var plan1 = XLSX.utils.json_to_sheet(planosJson); 
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, plan1, 'Plan1');
    XLSX.writeFile(wb, fileName);
  }

})();


function getAulaToIndex(planosJson){
  let aulas = planosJson.map(row =>  row["Aula"]);
  let index = planosJson.map(row =>  row["Index"]);
  let aulaToIndex = [];
  for (let i = 0; i < aulas.length; i++) {
    aulaToIndex[aulas[i]] = index[i];
  }
  return aulaToIndex;
}


function getPlanosFromPage(){
    var planos = [];
    const table = document.querySelector("table#ctl24_xgvPlanoAula_DXMainTable");
    const trs = table.querySelectorAll("tr.dxgvDataRow_Edu");
    trs.forEach(tr=>{
        let obj = [];
        tr.querySelectorAll("td").forEach(td=>{
            obj.push(td.innerText);
        });
        planos.push(obj);
    });
    return planos;
}


function planos2Json(header, planos){
  let planosJson = [];
  for (let i = 0; i < planos.length; i++) {
    let rowJson = {};
    for(let j in planos[i]){
        if(j != 1 && j != 11 ){ // Para eliminar colunas sem conteúdo
           if(j == 0) rowJson[ header[j] ] = i; // Para criar um indice de linhas 
           else rowJson[ header[j] ] = planos[i][j];
        }
    }
    planosJson.push(rowJson);
  }
  return planosJson;
}



async function lancarPlanos(content) {
  let aulaToIndex = getAulaToIndex(content);
  console.table(aulaToIndex);
  for (const [index, plano] of content.entries()) { 

    const idx = aulaToIndex[ plano['Aula'] ];

    // if (plano["X"] && String(plano["X"]).toLowerCase() !== "x"){
    //   console.log(`Não lançou ${plano['Aula']} [${plano['Data']}] ${plano['Início']}-${plano['Término']}`);
    //   continue;
    // }

    await abrir(idx).then( result1 => {
      return preencher(result1, plano).then( result2 => {
        return salvar(result2).then( result3 => { 
        //return cancelar(result2).then( result3 => {
          console.log(`${result3} => Lançou aula n° ${plano['Aula']} [${plano['Data']}] ${plano['Início']}-${plano['Término']} => ${plano['Conteúdo previsto']}`);
        }).catch( err3 => { console.log("Err salvar ", err3) });
      }).catch( err2 => { console.log("Err preencher ", err2) });
    }).catch( err1 => { console.log("Err abrir ", err1) });

  }
  console.log('Todos os lançamentos finalizados.');
}


const abrir = (i) => new Promise(resolve => {
	let btAbrir = document.querySelector(`#ctl24_xgvPlanoAula_DXCBtn${i}_CD`);
	if (btAbrir) btAbrir.click();  

    (function waitUntil() {
      setTimeout(function() {
        if( document.querySelector("#ctl24_xgvPlanoAula_DXPEForm_PW-1") ){
          resolve(i);
        }else {
          waitUntil();
        }
      }, 500);
    })()
	
});

const preencher = (idx, plano) => new Promise(resolve => {
  
  const tiposAula = ['Teórica', 'Prática', 'Laboratório', 'Estágio', 'Extensão'];
  const tipoAulaValue = plano['Tipo de Aula'] == null ? 0 : tiposAula.indexOf( plano['Tipo de Aula'].trim() );
  const reposicao = (plano['Reposição'] == null) ? "U" : ( (plano['Reposição'].trim() == '') ? "U" : "C" );
  const conteudoPrevisto  = plano["Conteúdo previsto"];
  const conteudoRealizado = plano["Conteúdo realizado"];

  let tipoAulaSel = document.querySelector(`#ctl24_xgvPlanoAula_DXPEForm_ef${idx}_xcbTipoAula`);
  if(tipoAulaSel) tipoAulaSel.value = tipoAulaValue == -1 ? 0 : tipoAulaValue ; // if -1 force 'Teórica'

  let aulaReposicaoInput = document.querySelector(`#ctl24_xgvPlanoAula_DXPEForm_ef${idx}_xcbAulaRepos_S`);
  if(aulaReposicaoInput) aulaReposicaoInput.value = reposicao;

	let txta1 = document.querySelector(`#ctl24_xgvPlanoAula_DXPEForm_ef${idx}_xmConteudoPrev_I`);
	if(txta1) txta1.value =  conteudoPrevisto == null ? '' : conteudoPrevisto; 
	
	let txta2 = document.querySelector(`#ctl24_xgvPlanoAula_DXPEForm_ef${idx}_xmConteudoEfet_I`);
	if(txta2) txta2.value = conteudoRealizado == null ? '' : conteudoRealizado; 

	setTimeout(() => {
		resolve(idx);
    }, 100);
	
});

const salvar = (i) => new Promise(resolve => {
  let btSalvar = document.querySelector(`div[data-args="[['UpdateEdit'],0]"]`);
	if(btSalvar) btSalvar.click();
	
    (function waitUntil() {
      setTimeout(function() {
        if( !document.querySelector("#ctl24_xgvPlanoAula_DXPEForm_PW-1") ){
          resolve(i);
        }else {
          waitUntil();
        }
      }, 500);
    })()

});

const cancelar = (i) => new Promise(resolve => {
  let btCancelar = document.querySelector(`div[data-args="[['CancelEdit',${i}],0]"]`);
	if (btCancelar) btCancelar.click();
	
    (function waitUntil() {
      setTimeout(function() {
        if( !document.querySelector("#ctl24_xgvPlanoAula_DXPEForm_PW-1") ){
          resolve(i);
        }else {
          waitUntil();
        }
      }, 500);
    })()
	
});



