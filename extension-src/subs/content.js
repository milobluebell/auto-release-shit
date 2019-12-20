window.onload = function () {
  getReleaseCommits(getLastestReleaseCode());
  chrome.runtime.onMessage.addListener((response) => {
    cleanShit().then(res => {
      if (res) {
        if (response && response.theShit && Object.values(response.theShit).length > 0) {
          insertElemNodes(response.theShit, response.needReminder, response.release_code);
        } else {
          insertElemNodes(false, false, response.release_code);
        }
      }
    });
  });
}
let _self = { id: null };

/**
 * @function 获取最近一次成功构建的编号
 */
function getLastestReleaseCode() {
  const lastestSuccessReleases = document.getElementsByClassName('permalink-link');
  let lastestSuccessReleaseCode = 0;
  for (let i = 0; i < lastestSuccessReleases.length; i++) {
    const releaseInner = lastestSuccessReleases[i].innerHTML.toLowerCase();
    if (releaseInner.includes('最近一次构建')) {
      lastestSuccessReleaseCode = releaseInner.match(/\d+/g)[0];
    }
  }
  return lastestSuccessReleaseCode;
}

/**
 * @function 获取对应构架编号的commit内容
 */
function getReleaseCommits(release_code) {
  if (typeof release_code !== 'string' || release_code === 0) {
    return;
  }
  let range = 1;
  const baseUrl = window.location.href;
  const tnow = new Date().getTime();
  const requestUrl = `${baseUrl}${release_code}/wfapi/changesets?_=${tnow}`.toString();
  const $timer = setInterval(() => {
    range++;
    if (range >= 16) {
      insertElemNodes(false);
      clearInterval($timer)
    } else {
      chrome.runtime.sendMessage({
        requestUrl,
        release_code,
        env: getEnv(),
      }, function (res) {
        if (res && res.status) {
          _self = res.self;
          if (res.body && Object.keys(res.body).length > 0) {
            if (res.body.commits.length > 0 && res.body.theShit.length > 0) {
              insertElemNodes(res.body.theShit, res.body.needReminder, release_code);
            }
            clearInterval($timer);
          }
        } else {
          clearInterval($timer);
          insertElemNodes(false);
          return;
        }
      });
    }
  }, 500);
}

/**
 * 
 */
function cleanShit(force = false) {
  return new Promise((resolve) => {
    const jenkinsContainer = document.getElementsByClassName('cbwf-stage-view')[0];
    let isWrapperClear = false, isScriptclear = false;

    if (document.getElementById('arsScript')) {
      jenkinsContainer.removeChild(document.getElementById('arsScript'));
      isScriptclear = true;
    }
    if (document.getElementById('arsWrapper')) {
      jenkinsContainer.removeChild(document.getElementById('arsWrapper'));
      isWrapperClear = true;
    }
    resolve(isWrapperClear && isScriptclear);
    return isWrapperClear && isScriptclear;
  });
}

/**
 * 
 * @param {*} shit 
 * @param {*} needReminder 
 */
function insertElemNodes(shit, needReminder, release_code) {
  try {
    const targetDiv = document.getElementsByClassName('cbwf-stage-view')[0];
    targetDiv.style.display = 'flex';
    let impressionHtml = document.createElement('div');
    impressionHtml.id = 'arsWrapper';
    let impressionScript = document.createElement('script');
    impressionScript.id = 'arsScript';
    let impressionHtmlTemplate = ``;
    let hasShits = true;
    impressionHtmlTemplate = `<div class="shit">
        <div class="release-code common-div">
          ${shit ? '' : '选择'}构建编号：
          <select id="realease_code_selector">`;
    let i = 0;
    while (i < 11 && (getLastestReleaseCode() - i > 0)) {
      impressionHtmlTemplate += `
          <option value="${'#' + (getLastestReleaseCode() - i)}" ${parseInt(release_code) === (getLastestReleaseCode() - i) ? 'selected' : ''}>
            #${getLastestReleaseCode() - i}
          </option>
        `;
      i++;
    }
    impressionHtmlTemplate += `</select>`;
    if (Object.prototype.toString.call(shit).toLowerCase() === '[object array]' && shit.length > 0) {
      impressionHtmlTemplate += `<span class="copyright">Auto Release Sheet</span></div>
      <table cellspacing="6" id="shit" class="common-table">
      <tbody class="tobsTable-body"><thead><tr><td colspan="2">【发版申请】</td></tr></thead>`;
      shit.forEach(item => {
        const canEditable = ['发版时间', '测试对接人', '发版说明', '项目名称'];
        const permanents = ['项目组', '开发对接人', '测试对接人'];
        (permanents.includes(item.key) || item.value) ? impressionHtmlTemplate += `
          <tr class="shit-job" style="${item.key === '发版说明' ? 'position: relative' : ''}">
            <td class="key stage-cell">${item.key}： </td>
            <td class="value stage-cell" id="${item.key}" contenteditable=${canEditable.includes(item.key) ? true : false}>${item.value === 'staging' ? 'Production' : item.value}${(item.key === '发版说明' && item.value.length >= 80) ? '<button title="格式化" class="toggle-mode" onclick="const desc = document.getElementById(\'发版说明\').childNodes[0].nodeValue;document.getElementById(\'发版说明\').innerHTML = \'<li>--  \' + desc.split(\'\、\').join(\'<li>--  \')"><img src="/static/44b87a8b/images/48x48/notepad.png"/></button>' : ``}
            </td>
          </tr>
        ` : ``;
      });
      impressionHtmlTemplate += '</tbody></table><button class="copy-btn common-btn" id="arsCopyBtn">复制</button></div>';
    } else {
      impressionHtmlTemplate += `<span class="common-alert">⚠️没有找到对应的commits</span>`;
      hasShits = false;
    }
    impressionHtml.innerHTML = impressionHtmlTemplate;
    // 加提示
    if (needReminder) {
      impressionHtml.innerHTML += `<span class="common-alert">⚠️请在右上角插件的"选项"中补全常用字段 -- Auto Release Sh*t</span>`;
    }
    impressionScript.innerHTML = `
      document.getElementById('realease_code_selector').onchange = function (e){
        chrome.runtime.sendMessage('${_self.id}', {
          release_code: e.target.value
        });
      }
    `;
    if (hasShits) {
      impressionScript.innerHTML += `
        document.getElementById('arsCopyBtn').onclick = function(){
          const theTableArea = document.getElementById('shit');
          if (document.body.createTextRange) {
            const range = document.body.createTextRange();
            range.moveToElementText(theTableArea);
            range.select();
          } else if (window.getSelection) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(theTableArea);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          document.execCommand('Copy','false',null);
          document.getElementById('arsCopyBtn').innerHTML = '复制成功！';
          setTimeout(()=>{document.getElementById('arsCopyBtn').innerHTML = '复制'}, 1288)
        }
      `;
    }
    //
    targetDiv.appendChild(impressionHtml);
    targetDiv.appendChild(impressionScript);
  }
  catch (err_msg) {
    console.error(err_msg);
  }
}

/**
 * 获取当前环境信息
 */
function getEnv() {
  const breadCrumDiv = document.getElementById('breadcrumbs');
  const items = breadCrumDiv.getElementsByClassName('model-link');
  return {
    stage: getStage(),
    proj: items[items.length - 1].innerHTML,
    tnow: formatUsefullTime(new Date(), 'yyyy-MM-dd hh:mm'),
  }
}

/**
 * 获取当前所在环境是dev-test还是prod
 */
function getStage() {
  const baseUrl = window.location.href.toLowerCase();
  if (baseUrl.includes('prod') || baseUrl.includes('Production')) return 'prod';
  else if (baseUrl.includes('staging')) return 'Staging';
  else return 'Dev';
}

/**
 * @function 格式化时间格式
 * @param {*} t time
 * @param {*} f format
 */
function formatUsefullTime(t, f) {
  if (t.toString().indexOf('Invalid Date') > -1 || t instanceof (Date) === false) return '';
  let obj = {
    yyyy: t.getFullYear(),
    yy: ('' + t.getFullYear()).slice(-2),
    M: t.getMonth() + 1,
    MM: ('0' + (t.getMonth() + 1)).slice(-2),
    d: t.getDate(),
    dd: ('0' + t.getDate()).slice(-2),
    hh: ('0' + t.getHours()).slice(-2),
    h: t.getHours(),
    mm: ('0' + t.getMinutes()).slice(-2),
    m: t.getMinutes(),
    ss: ('0' + t.getSeconds()).slice(-2),
    s: t.getSeconds()
  }
  let tarResult = '';
  tarResult += f.replace(/([a-z]+)/ig, function (r) {
    return obj[r]
  })
  return tarResult;
}