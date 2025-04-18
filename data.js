const companyNames = {
    "P0": "対面",
    "0D": "内藤",
    "0H": "セゾン",
    "08": "フィデリティ",
    "52": "マネックス",
    "44": "ＳＢＩネオトレード",
    "0X": "安藤",
    "0C": "スマートプラス",
    "0F": "ＯＫＢ",
    "0G": "第一生命",
    "46": "大和コネクト",
    "09": "リテラ・クレア証券",
    "47": "auアセットマネジメント社直近版"
};

const groupedByEnv = Object.values(server.reduce((acc, obj) => {
    const env = obj.ENVIRONMENT;
    acc[env] = acc[env] || [];
    acc[env].push(obj);
    return acc;
}, {}));

var parentTable = document.getElementById("parentTable");
var firstChild = parentTable.firstChild;

var ts = document.createElement("tr");
ts.innerHTML = `<td>&nbsp; ${TIMESTAMP} &nbsp;</td>`;
parentTable.insertBefore(ts, firstChild);

var dropdownRow = document.createElement("tr");
var uniqueProjects = new Set();
var uniqueCompany = new Set();

groupedByEnv.forEach(function (g) {
    g.forEach(function (ge) {
        if (ge.PJ) {
            let pj_name = ge.PJ.split("<br>")[0];
            uniqueProjects.add(pj_name);
        }
    });
});

var projectOptionDatas = Array.from(uniqueProjects).map((project) => {
    return `<option value="${project}">&nbsp; ${project} &nbsp;</option>`;
}).join('');

var companyOptionDatas = Object.entries(companyNames).map(([key, name]) => {
    return `<option value="${key}">&nbsp; ${name} &nbsp;</option>`;
}).join('');

dropdownRow.innerHTML = `
    <td colspan="8">
        <div class="input-container">
            <span class="input-box">
                <label for="project">PJ:</label>
                <select id="project">
                    <option selected value="option1">全部を表示</option>
                    ${projectOptionDatas}
                </select>
            </span>
            <span class="input-box">
                <label for="company">Company Name:</label>
                <select id="company">
                    <option selected value="option1">全部を表示</option>
                    ${companyOptionDatas}
                </select>
            </span>
            <span class="input-box">
                <button id="btn" type="submit">検索</button>
            </span>
        </div>
    </td>
`;

parentTable.insertBefore(dropdownRow, firstChild);

function renderTable(filteredProject = null, filteredCompany = null, isFilter = false) {
    const innerTable = parentTable.querySelector(".innerTable");
    innerTable.innerHTML = "";
    let rendered = false;

    groupedByEnv.forEach(function (g) {
        let filteredGroup = g.filter((ge) => {
            let pjName = ge.PJ ? ge.PJ.split("<br>")[0] : "なし";
            if ((filteredProject && filteredProject !== "null" && pjName !== filteredProject) ||
                (filteredCompany && filteredCompany !== "null" && ge.COMPANY !== filteredCompany)) {
                return false;
            }
            return true;
        });

        if (filteredGroup.length === 0) {
            return;
        }
        rendered = true;

        var envRow = document.createElement("tr");
        var serverRow = document.createElement("tr");
        serverRow.setAttribute("class", "envRow");
        serverRow.style.backgroundColor = "#0066cc";
        serverRow.style.color = "white";
        envRow.innerHTML = `<p></p>`;
        serverRow.innerHTML = `
            <th>ENV</th>
            <th>RUNNING</th>
            <th>SERVER</th>
            <th>PJ</th>
            <th>Company Name</th>
            <th>WB</th>
            <th>AP</th>
            <th>DB</th>
        `;
        innerTable.appendChild(envRow);
        innerTable.appendChild(serverRow);

        filteredGroup.forEach(function (ge, innerIndex) {
            if (ge.PJ) {
                let pj_name = ge.PJ.split("<br>")[0];
                uniqueProjects.add(pj_name);
            }
            let pjName = ge.PJ ? ge.PJ.split("<br>")[0] : "なし";
            if ((filteredProject && filteredProject !== "null" && pjName !== filteredProject) ||
                (filteredCompany && filteredCompany !== "null" && ge.COMPANY !== filteredCompany)) {
                return;
            }

            var row = document.createElement("tr");
            row.style.borderLeft = '1px solid #add8e6';
            row.style.borderRight = '1px solid #add8e6';
            row.style.borderTop = '1px solid #add8e6';

            let rowCtx = `
                <td class="br-1 align-top blue" style="width:60px">&nbsp; ${ENVIRONMENT} &nbsp;</td>
                <td class="br-1 align-top blue" style="text-align:center">
                    ${WEB_RUNNING && AP_RUNNING ? "<span class='running'>Running</span>" : "<span class='stopped'>Stopped</span>"}
                </td>
                <td class="br-1 align-top blue" style="width:305px">&nbsp; ${WEBSERVER} - ${APSERVER} - ${DBSERVER} &nbsp;</td>
                <td class="br-1 align-top blue" style="width:324px">&nbsp; ${PJ || 'なし'} &nbsp;</td>
                <td class="br-1 align-top blue">&nbsp; ${companyNames[COMPANY]} &nbsp;</td>
                <td class="br-1 align-top blue">&nbsp; ${WEBPORT} &nbsp; ${WEB_RUNNING ? "<span class='running'>Running</span>" : "<span class='stopped'>Stopped</span>"} <br>
            `;

            envinfo[COMPANY] && (
                Object.entries(envinfo[COMPANY]).forEach(([key, value], i) => {
                    let span = Object.entries(envinfo[COMPANY]).filter(([key, value]) => value !== null).length + envinfo[COMPANY]["管理者"].length - 1;
                    if (value !== null) {
                        if (key === '管理者') {
                            value.forEach(v => {
                                rowCtx += `
                                    <span class="tooltip">&nbsp;&nbsp;
                                        <a href="${WEBBASEURL}${v}" target='blank'> ${WEB_RUNNING ? `<span class="red small">(${key})</span>` : `<span class="red small">(${key})</span>`} </a>
                                        <span class="tooltiptext">Click to see details for ${key}</span>&nbsp;&nbsp;
                                    </span><br>
                                `;
                            });
                        } else {
                            rowCtx += `
                                <span class="tooltip">&nbsp;&nbsp;
                                    <a href="${WEBBASEURL}${value}" target='blank'> ${WEB_RUNNING ? `<span class="red small">(${key}) </span> `:` <span class="red small">(${key})</span>`} </a>
									<span class='tooltiptext'>Click to see details for ${key} </span>
								</span><br>`;
								}
							}
						}));
						rowCtx = rowCtx + `
    </td>
    <td class='br-1 align-top blue'><a href="${APURL}" target='blank'> ${AP_RUNNING ? `${APPORT}` : `${APPORT}`} ${AP_RUNNING ? "<span class='running'>Running</span>" : "<span class='stopped'>Stopped</span>"} </a></td>
    <td class='br-1 align-top blue'> ${DBUSER} </td>
`;

rowCtx += `</td>`;
row.innerHTML = rowCtx;
innerTable.appendChild(row);

var emptyRow = document.createElement("tr");
emptyRow.style.borderTop = '1px solid #add8e6';
innerTable.appendChild(emptyRow);

if (innerIndex !== g.length - 1) {
    const current = g[innerIndex];
    const next = g[innerIndex + 1];
    const webChanged = current.WEBSERVER !== next.WEBSERVER;

    if (!webChanged) return;

    if (!isFilter) {
        appendHeader(next);
        return;
    }

    if (filteredCompany && filteredProject) {
        appendHeader(next);
        return;
    }

    if (filteredCompany && filteredGroup.COMPANY !== next.COMPANY) {
        return;
    }

    if (filteredProject && filteredGroup.PJ !== next.PJ) {
        return;
    }

    appendHeader(next);
}

function appendHeader(rowData) {
    const innerServer = document.createElement("tr");
    innerServer.innerHTML = `
        <th>ENV</th>
        <th>RUNNING</th>
        <th>SERVER</th>
        <th>PJ</th>
        <th>Company Name</th>
        <th>WB</th>
        <th>AP</th>
        <th>DB</th>
        <th>${rowData.WEBSERVER}</th>
        <th>${rowData.APSERVER}</th>
        <th>${rowData.DBSERVER}</th>
    `;
    innerTable.appendChild(innerServer);
}

if (!rendered) {
    let noDataRow = document.createElement("tr");
    noDataRow.innerHTML = `<td class='error' colspan="8">データがありません。</td>`;
    innerTable.appendChild(noDataRow);
}

renderTable(null, null, false);

const searchButton = dropdownRow.querySelector("#btn");
searchButton.addEventListener('click', () => {
    const selectedProject = document.getElementById('project').value;
    const selectedCompany = document.getElementById('company').value;
    let filteredProject = (selectedProject !== "option1") ? selectedProject : null;
    let filteredCompany = (selectedCompany !== "option1") ? selectedCompany : null;
    renderTable(filteredProject, filteredCompany, true);
});