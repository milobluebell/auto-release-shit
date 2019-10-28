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
  console.log(release_code, typeof release_code);
  if (typeof release_code !== 'string' || release_code === 0) {
    return;
  }
  let range = 1;
  const baseUrl = window.location.href;
  const tnow = new Date().getTime();
  const requestUrl = `${baseUrl}${release_code}/wfapi/changesets?_=${tnow}`.toString();
  const $timer = setInterval(() => {
    range++;
    if (range >= 10) {
      console.error(`「 No Changes Detected 」 within Release #${release_code}`);
      insertElemNodes(false);
      clearInterval($timer)
    } else {
      chrome.runtime.sendMessage({
        requestUrl,
        release_code,
        env: getEnv(),
      }, function (res) {
        console.log(res, 'send Message');
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
          console.error(`「 Errors Occured 」 within Release #${release_code} by background script`);
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
    const targetDiv = document.getElementsByClassName('table-box')[0];
    targetDiv.style.display = 'flex';
    impressionHtml = document.createElement('div');
    let impressionHtmlTemplate = ``;
    let impressionStyle = ``;
    if (Object.prototype.toString.call(shit).toLowerCase() === '[object array]' && shit.length > 0) {
      impressionHtmlTemplate = `<table class="shit table-viewPort" cellspacing="6"><tbody class="tobsTable-body">
        <thead><tr><td colspan="2">【发版申请】</td></tr></thead>`;
      shit.forEach(item => {
        impressionHtmlTemplate += `<tr class="shit-job">
            <td class="key stage-cell">${item.key}： </td>
            <td class="value stage-cell">&nbsp;&nbsp;${item.value === 'staging' ? 'Production' : item.value}</td>
          </tr>`;
      });
      impressionHtml.innerHTML = impressionHtmlTemplate + '</tbody></table>';
      impressionStyle = document.createElement('style');
      impressionStyle.innerHTML = `.shit{max-width:460px;width:100%;margin-left:18px;margin-top:118px}.shit .key{font-size:12px;min-width:90px}
      .shit .value{font-size:14px;font-weight:bold}`;
    } else {
      impressionHtmlTemplate = `<div class="shit">⚠️没有找到最后一次构建的git commit messages</div>`;
      impressionHtml.innerHTML = impressionHtmlTemplate;
      impressionStyle = document.createElement('style');
      impressionStyle.innerHTML = `.shit{max-width:460px;width:100%;margin-left:18px;margin-top:118px;text-align:center;}`;
    }
    if (needReminder) {
      impressionHtml.innerHTML += `<span class="reminder">建议在插件选项中配置常用字段</span><style>.reminder{margin-left:18px;font-size:12px;color:#d6d6d6}</style>`;
    }
    targetDiv.appendChild(impressionHtml);
    targetDiv.appendChild(impressionStyle);
  }
  catch (err_msg) {
    console.error(err_msg);
  }
}

/**
 * 获取当前环境信息
 */
const stagers = ['dev', 'Dev_Test', 'dev-test', 'staging', 'prodution'];
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