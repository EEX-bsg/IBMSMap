"use strict";
const worldname = "world:main";
const dimension = "dimensions:overworld#";

function convertCSV2Array(str){
    const result = [];
    const tmp = str.split("\n");

    for(let i=0; i<tmp.length; i++){
        result[i] = tmp[i].split(",");
    }
    //console.log(result);
    convertTable2Pointsdata(result);
}

function convertTable2Pointsdata(data){
    let code = "";

    for(let i=3; i<data.length; i++){
        if(data[i][9] !== worldname)continue;
        if(data[i][10] !== dimension)continue;
        const name = data[i][0].substr(5);
        const coord = {
            x: Number(data[i][1].substr(2)),
            z: Number(data[i][2].substr(2))
        }
        const icon = "waypoint";
        const maxZoom = 7;
        const minZoom = 2;
        const info = "";
        const visible = (data[i][4].substr(8) === "true") ? true : false;
        //console.log(name, coord);

        code+= "{\n";
        code+= 'name: "' + name + '",\n';
        code+= 'coord:{ "x": ' + coord.x+', "z": ' + coord.z +'},\n'
        code+= "maxZoom: " + maxZoom +",\n";
        code+= "minZoom: " + minZoom + ",\n";
        code+= 'info: "' + info + '",\n';
        code+= "visible: " + visible + ",\n";
        code+= "},\n";
    }
    console.log(code);
}
convertCSV2Array(data);