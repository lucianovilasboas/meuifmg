let bt = document.querySelector("#btGetNotas");
let res = document.querySelector("#result");

bt.addEventListener('click', (evt)=>{
    res.innerText = "Opa........";
});


function handleFilesSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
      output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                  f.size, ' bytes, last modified: ',
                  f.lastModifiedDate.toLocaleDateString(), '</li>');

    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

    
    readFile(files[0]);


  }


  function handleFileSelect(evt) {

    var file = evt.target.files[0]; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    output.push('<li><strong>', escape(file.name), '</strong> (', file.type || 'n/a', ') - ',
                  file.size, ' bytes, last modified: ',
                  file.lastModifiedDate.toLocaleDateString(), '</li>');

    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

    
    readFile(file);


  }



  function readFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(content) {
      res.innerText = content.target.result;
    }
    reader.readAsText(file);
  }

  document.getElementById('file').addEventListener('change', handleFileSelect, false);