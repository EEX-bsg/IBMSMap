"use strict";
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