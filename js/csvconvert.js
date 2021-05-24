var CSV = {};
(function make_csv(CSV){
CSV.version = '0.0.1';

    function csv2json(csvFileContent, sep) {
        var lines=csvFileContent.split("\n");
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

CSV.parse2json = csv2json;
})(typeof exports !== 'undefined' ? exports : CSV);
