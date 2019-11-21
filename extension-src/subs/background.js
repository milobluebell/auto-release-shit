
class Constants {
  static devTest = 'dev_test';
  static staging = 'staging';
  static commitMessageTags = {
    'feat': {
      label: `feat`,
    },
    'fix': {
      label: `fix`,
      conse: `修复缺陷/改进体验`
    },
    'docs': {
      label: `docs`,
      conse: `修改了项目文档`
    },
    'style': {
      label: `style`,
      conse: `样式调优`
    },
    'refactor': {
      label: `refactor`,
    },
    'perf': {
      label: `perf`,
      conse: `优化性能`
    },
    'test': {
      label: `test`,
      conse: `添加测试代码`
    },
    'chore': {
      label: `chore`,
    }
  };
  static sheetFrags = [{
    value: `group`,
    label: `项目组`,
  }, {
    value: `proj`,
    label: `项目名称`
  }, {
    value: `stage`,
    label: `发版环境`
  }, {
    value: `release_code`,
    label: `构建编号`
  }, {
    value: `tnow`,
    label: `发版时间`
  }, {
    value: `developers`,
    label: `开发对接人`,
    default: 'person D1、person D2'
  }, {
    value: `testers`,
    label: `测试对接人`,
    default: 'person T1、person T2'
  }, {
    value: `desc`,
    label: `发版说明`,
    default: ''
  }];
}

class Vendors {
  /**
   * @param {*} fragmentBeforeColon
   * @desc 根据各种其它模式，生成统一可识别的commitKey
   *       比如 fix(sku): 这种模式，也要被识别为fix
   */
  static getUnifiedCommitKey(fragmentBeforeColon) {
    let gap = undefined;
    Object.keys(Constants.commitMessageTags).forEach(item => {
      if (fragmentBeforeColon.includes(item)) {
        gap = item;
      }
    });
    return gap;
  }

  /**
   * @param {*} commits
   * @param {*} params
   * @algo  [fix判定为“修复缺陷、改进体验”]
   *        [docs判定为"修改了文档"]
   *        [style判定为"样式调优"]
   *        [refactor和chore判定为"项目部分重构"]
   *        [perf判定为"优化表现和性能"]
   *        [其余根据实际情况进行拼接]
   */
  static generateOnePieceOfShit = (commits, params) => {
    const commitList = commits.reduce((prev, curr) => {
      let splittedMessages = curr.message.split(':');
      let _key_ = '';
      if (splittedMessages.length === 1) {
        _key_ = curr.message.split(' ')[0];
      } else {
        _key_ = splittedMessages[0];
      }
      const commitKey = Vendors.getUnifiedCommitKey(_key_);
      if (commitKey === undefined) {
        // 没有匹配到angular标准指定的key
        return prev.concat([curr.message]);
      } else {
        if (commitKey === Constants.commitMessageTags.feat.label || commitKey === Constants.commitMessageTags.refactor.label || commitKey === Constants.commitMessageTags.chore.label) {
          const commitMsg = curr.message.substring(curr.message.indexOf(':') > -1 ? (curr.message.indexOf(':') + 2) : (curr.message.indexOf(' ') + 1));
          return prev.concat([commitMsg]);
        } else {
          return prev.concat([Constants.commitMessageTags[commitKey].conse]);
        }
      }
    }, []);
    // 
    const desc = Array.from(new Set(commitList), commit => commit).join('、');
    const sheet = Constants.sheetFrags.reduce((prev, curr) => {
      return prev.concat([{
        key: curr.label,
        value: curr.value === 'desc' ? desc : (params[curr.value] ? params[curr.value] : ''),
      }]);
    }, []);
    return sheet;
  }

  /**
   * @param {*} release_code
   */
  static getCommitsAndPrintAllThings = (release_code, inEcho = false) => {
    const requestUrl = requestInfo.requestUrl.replace(/\/[1-9]+\//g, `/${release_code}/`);
    fetch(requestUrl, { credentials: 'same-origin' }).then(res => {
      if (res.ok && res.status === 200) {
        return res.json();
      } else {
        chrome.tabs.getSelected(null, function (tab) {
          chrome.tabs.sendRequest(tab.id, Object.assign({
            release_code: release_code
          }, commitsData));
        });
      }
    }).then(data => {
      if (data) {
        chrome.storage.sync.get(null, function (res) {
          if (data.length > 0) {
            commitsData = {
              commitCount: data[0].commitCount,
              commits: data[0].commits,
              theShit: Vendors.generateOnePieceOfShit(data[0].commits, {
                ...res,
                ...requestInfo.env,
                release_code: `#${release_code}`,
              }),
              needReminder: (Object.values(res).every(item => item) && Object.values(res).length > 0) ? false : true,
              release_code: release_code,
            }
          }
          setTimeout(function () {
            commitsData = {};
          }, 888);
          if (inEcho) {
            chrome.tabs.getSelected(null, function (tab) {
              chrome.tabs.sendRequest(tab.id, Object.assign({
                release_code: release_code
              }, commitsData));
            });
          }
        });
      }
      requestting = false;
    });
  }
};

/**
 * start script
 */
var requestting = false, theExtension, requestInfo, commitsData;
chrome.management.getSelf(res => theExtension = res);
chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
  Vendors.getCommitsAndPrintAllThings(request.release_code.split('#')[1], true)
  sendResponse({ status: true, body: commitsData, self: theExtension });
})
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  sendResponse({ status: true, body: commitsData, self: theExtension });
  requestInfo = request;
  if (!requestting && request) {
    Vendors.getCommitsAndPrintAllThings(request.release_code);
  }
  requestting = true;
}); 