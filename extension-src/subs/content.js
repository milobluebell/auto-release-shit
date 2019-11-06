window.onload = function () {
  getReleaseCommits(getLastestReleaseCode());
}

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
    if (range >= 20) {
      console.warn(`「 No Changes Detected 」 within Release #${release_code}`);
      insertElemNodes(false);
      clearInterval($timer)
    } else {
      chrome.runtime.sendMessage({
        requestUrl,
        release_code,
        env: getEnv(),
      }, function (res) {
        if (res && res.status) {
          if (Object.keys(res.body).length > 0) {
            if (res.body.commits.length > 0 && res.body.theShit.length > 0) {
              console.info('⬇️以下是最后一次构建的git commit messages：');
              console.table(res.body.commits);
              insertElemNodes(res.body.theShit, res.body.needReminder);
            }
            clearInterval($timer);
          }
        } else {
          clearInterval($timer);
          console.warn(`「 Errors Occured 」 within Release #${release_code} by background script`);
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
function insertElemNodes(shit, needReminder) {
  try {
    const targetDiv = document.getElementsByClassName('cbwf-stage-view')[0];
    targetDiv.style.display = 'flex';
    impressionHtml = document.createElement('div');
    let impressionHtmlTemplate = ``;
    let impressionStyle = ``;
    const marginTop = '153px';
    const marginLeft = '18px';
    if (Object.prototype.toString.call(shit).toLowerCase() === '[object array]' && shit.length > 0) {
      impressionHtmlTemplate = `<table class="shit" cellspacing="6"><tbody class="tobsTable-body"><thead><tr><td colspan="2">【发版申请】</td></tr></thead>`;
      shit.forEach(item => {
        impressionHtmlTemplate += `<tr class="shit-job" style="${item.key === '发版说明' ? 'position: relative' : ''}">
            <td class="key stage-cell">${item.key}： </td>
            <td class="value stage-cell" id="${item.key}">${item.value === 'staging' ? 'Production' : item.value}${(item.key === '发版说明' && item.value.length >= 70) ? '<button title="格式化" class="toggle-mode" onclick="const desc = document.getElementById(\'发版说明\').childNodes[0].nodeValue;document.getElementById(\'发版说明\').innerHTML = \'<li>--  \' + desc.split(\'\、\').join(\'<li>--  \')"><img src="/static/44b87a8b/images/48x48/notepad.png"/></button>' : ''}</td>
          </tr>`;
      });
      impressionHtml.innerHTML = impressionHtmlTemplate + '</tbody></table>';
      impressionStyle = document.createElement('style');
      impressionStyle.innerHTML = `.shit{position:relative;max-width:460px;width:100%;margin-left:${marginLeft};margin-top:${marginTop};border:solid 1px #ccc}.shit li{list-style:none}.toggle-mode{cursor:pointer;position:absolute;bottom:3px;right:3px;padding:0;margin:0;text-align:center;line-height:12px}.toggle-mode img{width:13px;height:13px;}.shit .key{font-size:12px;min-width:90px}.shit .value{font-size:14px;font-weight:bold;text-indent:3px}.shit tr:nth-of-type(3){background:rgba(0, 0, 0, .05)}`;
    } else {
      impressionHtmlTemplate = `<div class="shit">⚠️没有找到最后一次构建的git commit messages</div>`;
      impressionHtml.innerHTML = impressionHtmlTemplate;
      impressionStyle = document.createElement('style');
      impressionStyle.innerHTML = `.shit{max-width:460px;width:100%;margin-left:${marginLeft};margin-top:${marginTop};text-align:center;}`;
    }
    // 加提示
    if (needReminder) {
      impressionHtml.innerHTML += `<span class="reminder">⚠️建议在"选项"中补全常用字段 -- Auto Release Sh*t</span><style>.reminder{margin-left:${marginLeft};font-size:12px;color:#b3b3b3}</style>`;
    }
    //
    targetDiv.appendChild(impressionHtml);
    targetDiv.appendChild(impressionStyle);
  }
  catch (err_msg) {
    console.warn(err_msg);
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
  if (baseUrl.includes('prod') || baseUrl.includes('production')) return 'prod';
  else if (baseUrl.includes('staging')) return 'staging';
  else return 'dev';
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