"use strict";
const Match = {
    No: 0,
    Exact: 1,
    Forward: 2,
    Partial: 3,
}

const searchEvent = async function(){
    const searchWordBox = document.getElementById("search-point");
    const searchResultsBox = document.getElementById("search-results-box")
    const word = searchWordBox.value;
    const dom = document.createElement("p");
    dom.textContent = "Searching."
    searchResultsBox.appendChild(dom);
    const result = await searchPoints(word);
    let searchFlag = false;
    deleteChildrensDOM(searchResultsBox);
    if(result[Match.Exact]!==undefined){
        result[Match.Exact].forEach((point)=>{
            if(point.visible){
                const dom = createSearchResultDOM(point.name, point.coord, point.info);
                searchFlag = true;
                dom.addEventListener("click", (event)=>{moveAndOpenInfoWin(point)});
                searchResultsBox.appendChild(dom);
            }
        })
    }
    if(result[Match.Forward]!==undefined){
        result[Match.Forward].forEach((point)=>{
            if(point.visible){
                const dom = createSearchResultDOM(point.name, point.coord, point.info);
                searchFlag = true;
                dom.addEventListener("click", (event)=>{moveAndOpenInfoWin(point)});
                searchResultsBox.appendChild(dom);
            }
        })
    }
    if(result[Match.Partial]!==undefined){
        result[Match.Partial].forEach((point)=>{
            if(point.visible){
                const dom = createSearchResultDOM(point.name, point.coord, point.info);
                searchFlag = true;
                dom.addEventListener("click", (event)=>{moveAndOpenInfoWin(point)});
                searchResultsBox.appendChild(dom);
            }
        })
    }
    if(!searchFlag){
        const dom = document.createElement("p");
        dom.textContent = "Not Found."
        searchResultsBox.appendChild(dom);
    }

}

const moveAndOpenInfoWin = function(point){
    let marker;
    for(marker of markerArray){
        if(marker.name === point.name)break;
    }
    const map = marker.getMap();
    infoWindow.close();
    infoWindow.setContent(marker.getTitle());
    infoWindow.open(map, marker);
    map.setZoom(point.minZoom+1);
    map.panTo(marker.getPosition());
}

const createSearchResultDOM = function(name, coord, info) {
    const serchResult = document.createElement("div");
    serchResult.setAttribute("class", "search-result flex-column");
    serchResult.setAttribute("name", name);

    const pointName = document.createElement("div");
    pointName.setAttribute("class", "point-name");
    pointName.textContent = name;

    const pointCoord = document.createElement("div");
    pointCoord.setAttribute("class", "point-coord");
    pointCoord.textContent = `x: ${coord.x}, z: ${coord.z}`;

    const pointInfo = document.createElement("div");
    pointInfo.setAttribute("class", "point-info");
    pointInfo.textContent = info;

    serchResult.appendChild(pointName);
    serchResult.appendChild(pointCoord);
    serchResult.appendChild(pointInfo);

    return serchResult;
}

const deleteChildrensDOM = function(dom){
    while(dom.lastChild){
        dom.removeChild(dom.lastChild);
    }
}

const searchPoints = function(word){
    const data = getPoints(nowWorld, nowDimension);
    const result = {};
    if(data == undefined) return undefined;
    data.forEach((point)=>{
        const returnVal = checkMatch(point.name, word);
        if(returnVal !== Match.No){
            if(result[returnVal] == undefined) result[returnVal] = [];
            result[returnVal].push(point);
        }
    })
    return result;
}

const checkMatch = function(string, pattern){
    if(string === pattern){
        return Match.Exact;
    }
    if(string.startsWith(pattern)){
        return Match.Forward;
    }
    if(string.includes(pattern)){
        return Match.Partial;
    }
    return Match.No;
}

const getPoints = function(worldName, dimensionName){
    for(let world of points){
        if(world.name === worldName){
            for(let dimension of world.dimensions){
                if(dimension.type === dimensionName){
                    return dimension.points;
                }
            }
        }
    }
    return undefined;
}