"use strict"; //needed for the mobile browser
if (document.deviceready) {
    document.addEventListener("deviceready", onDeviceReady);
}
else {
    document.addEventListener("DOMContentLoaded", onDeviceReady);
}
let pages = [];
let links = [];

function onDeviceReady() {
    serverData.getJSON();
    pages = document.querySelectorAll('[data-role = "page"]');
    links = document.querySelectorAll('[data-role = "nav"] a');
    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener("click", navigate);
    }
}

function navigate(ev) {
    ev.preventDefault();
    let link = ev.currentTarget;
    
    let id = link.href.split("#")[1];
    history.replaceState({}, "", link.href);
    for (let i = 0; i < pages.length; i++) {
        if (pages[i].id == id) {
            pages[i].classList.add("active");
        }
        else {
            pages[i].classList.remove("active");
        }
    }
}
let serverData = {
    url: "https://griffis.edumedia.ca/mad9014/sports/basketball.php"
    , httpRequest: "GET"
    , getJSON: function () {
        
        let headers = new Headers();
        headers.append("Content-Type", "text/plain");
        headers.append("Accept", "application/json; charset=utf-8");
        
        let options = {
            method: serverData.httpRequest
            , mode: "cors"
            , headers: headers
        };
    
        let request = new Request(serverData.url, options);
        fetch(request).then(function (response) {
            
            return response.json();
        }).then(function (data) {
        
            addProperty1(data);
            addProperty2(data);
           
            displayData(data);
        }).catch(function (err) {
            alert("Error: " + err.message);
        });
    }
};

function addProperty1(data) {
    data.teams.forEach(function (value) {
        value["numofWin"] = 0;
    });
}

function addProperty2(data) {
    data.teams.forEach(function (value) {
        value["numofT"] = 0;
    });
}

function displayData(data) {
        localStorage.clear();
    
    let refrButton = document.getElementById("buttonRefresh");
    refrButton.addEventListener("click", onDeviceReady);
    
    let ul = document.querySelector(".timetable_list");
    ul.innerHTML = ""; 
    data.scores.forEach(function (value) {
        let li = document.createElement("li");
        let h3 = document.createElement("h3");
        h3.textContent = value.date;
        let homeTeam = null;
        let awayTeam = null;
       
        ul.appendChild(li);
        ul.appendChild(h3);
        value.games.forEach(function (item) {
            homeTeam = getTeamName(data.teams, item.home);
            awayTeam = getTeamName(data.teams, item.away);
            let dg = document.createElement("div");
            dg.classList.add("onePair");
            let home = document.createElement("div");
            home.classList.add("homeTm");
            home.innerHTML = homeTeam + " " + "<b>" + item.home_score + "</b>" + "&nbsp" + "<br>";
           
            let away = document.createElement("div");
            away.classList.add("awayTm");
            away.innerHTML = "&nbsp" + awayTeam + " " + "<b>" + item.away_score + "</b>" + "&nbsp";

            dg.appendChild(home);
            dg.appendChild(away);
            ul.appendChild(dg);
           
            if (item.home_score > item.away_score) {
                calculateNumOfWin(data.teams, item.home);
            }
            if(item.home_score == item.away_score){
                calculateNumOfT(data.teams, item.home);
                calculateNumOfT(data.teams, item.away);
            }
            else {
                calculateNumOfWin(data.teams, item.away);
            }
        });
    });
    calcStanding(data);
    localStorage.setItem("timetableResults", JSON.stringify(data));
}


function calculateNumOfWin(teams, id) {
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].id == id) {
            teams[i].numofWin += 1;
        }
    }
}

function calculateNumOfT(teams, id) {
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].id == id) {
            teams[i].numofT += 1;
        }
    }
}

function calcStanding(data) {
    console.log(data.teams.length);
    data.teams.sort(function (a, b) {
        if (a.numofWin > b.numofWin) {
            return -1;
        }
        if (a.numofWin < b.numofWin) {
            return 1;
        }
        
        return 0;
    });
    console.log("After sorting data.teams:");
    console.log(data.teams);
    let tbody = document.querySelector("#teamStandings tbody");
    while(tbody.rows.length > 0) {
    tbody.deleteRow(0);
}
    for (let i = 0, numOfTm = data.teams.length; i < numOfTm; i++) {
        let tr = document.createElement("tr");
        let tdn = document.createElement("td");
        tdn.textContent = data.teams[i].name;
        let tdw = document.createElement("td");
        tdw.textContent = data.teams[i].numofWin;
        let tdl = document.createElement("td");
        tdl.textContent = 6 - data.teams[i].numofWin - data.teams[i].numofT;
        let tdt = document.createElement("td");
        tdt.textContent = data.teams[i].numofT;
        let tdp = document.createElement("td");
        tdp.textContent = data.teams[i].numofWin * 2;
        tr.appendChild(tdn);
        tr.appendChild(tdw);
        tr.appendChild(tdl);
        tr.appendChild(tdt);
        tr.appendChild(tdp);
        tbody.appendChild(tr);
    }
}

function getTeamName(teams, id) {
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].id == id) {
            return teams[i].name;
        }
    }
    return "unknown";
}
