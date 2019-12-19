
const publishedJoinedByCommitsFlags = ['feat', 'refactor', 'chore'];
const Constants = {
  devTest: 'dev_test',
  staging: 'staging',
  commitMessageTags: {
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
  },
  sheetFrags: [{
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
  }],
  api: {
    usage: 'https://service-81ozmkay-1252070958.gz.apigw.tencentcs.com/release/record_usage'
  }
}

const Vendors = {
  /**
   * @param {*} fragmentBeforeColon
   * @desc 根据各种其它模式，生成统一可识别的commitKey
   *       比如 fix(sku): 这种模式，也要被识别为fix
   */
  getUnifiedCommitKey: (fragmentBeforeColon) => {
    let gap = undefined;
    Object.keys(Constants.commitMessageTags).forEach(item => {
      if (fragmentBeforeColon.includes(item)) {
        gap = item;
      }
    });
    return gap;
  },

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
  generateOnePieceOfShit: (commits, params) => {
    const joinRangeNumber = 3;
    let round = 0;
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
        if (publishedJoinedByCommitsFlags.filter(item => item === commitKey).length > 0) {
          // 支持feat: xxx之外，再支持feat xxx这种变态格式
          const commitMsg = curr.message.substring(curr.message.indexOf(':') > -1 ? (curr.message.indexOf(':') + 2) : (curr.message.indexOf(' ') + 1));
          return prev.concat([commitMsg]);
        } else {
          if (commitKey === 'fix') {
            const commitMsg = curr.message.substring(curr.message.indexOf(':') > -1 ? (curr.message.indexOf(':') + 2) : (curr.message.indexOf(' ') + 1));
            round++;
            return round < joinRangeNumber ? prev.concat([`arsFix=${commitMsg}`]) : prev.concat([]);
          } else {
            // 
            return prev.concat([Constants.commitMessageTags[commitKey].conse]);
          }
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
    Vendors.setRecord('usage', {
      sheet: sheet.filter(item => item.key === '发版说明')[0].value || '',
      proj: params.proj,
      release_code: params.release_code,
      origin_commits: commits.reduce((prev, curr) => {
        return prev.concat([curr.message]);
      }, []).join(','),
      authorJenkinsId: Array.from(new Set(commits.reduce((prev, curr) => {
        return prev.concat([curr.authorJenkinsId]);
      }, []))).join(',')
    });
    return sheet;
  },


  /**
   * @function 根据commits，自动组合出fix对应的内容
   * @param {*} shits
   */
  shrinkFixCommits: (shits) => {
    shits.forEach(item => {
      if (item.key === '发版说明') {
        // 
        let str = `做了`;
        let valueArr = item.value.split('、');
        str += valueArr.reduce((prev, curr) => {
          return curr.includes('arsFix=') ? prev.concat([curr.split('arsFix=')[1]]) : prev.concat([]);
        }, []).join('以及');
        str += '等缺陷的修复';
        const notFixValue = valueArr.reduce((prev, curr) => {
          return !curr.includes('arsFix=') ? prev.concat([curr]) : prev.concat([]);
        }, []).join('、');
        item.value = str + (notFixValue ? `、${notFixValue}` : '');
      }
    });
    return shits;
  },

  /**
   * @param {*} release_code
   */
  getCommitsAndPrintAllThings: (release_code, inEcho = false) => {
    const requestUrl = requestInfo.requestUrl.replace(/\/[0-9]+\//g, `/${release_code}/`);
    fetch(requestUrl, { credentials: 'same-origin' }).then(res => {
      if (res.ok && res.status === 200) {
        return res.json();
      } else {
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
          const currTab = tabs.filter(item => {
            return item.active;
          })[0];
          chrome.tabs.sendMessage(currTab.id, Object.assign({
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
              theShit: Vendors.shrinkFixCommits(Vendors.generateOnePieceOfShit(data[0].commits, {
                ...res,
                ...requestInfo.env,
                release_code: `#${release_code}`,
              })),
              needReminder: (Object.values(res).every(item => item) && Object.values(res).length > 0) ? false : true,
              release_code: release_code,
            }
          }
          setTimeout(function () {
            commitsData = {};
          }, 888);
          if (inEcho) {
            chrome.tabs.query({ currentWindow: true }, function (tabs) {
              const currTab = tabs.filter(item => {
                return item.active;
              })[0];
              chrome.tabs.sendMessage(currTab.id, Object.assign({
                release_code: release_code
              }, commitsData));
            });
          }
        });
      }
      requestting = false;
    });
  },

  /**
   * @param {*} type 记录的行为类型
   * @param {*} extra 需要传递的额外参数
   */
  setRecord: (type = 'usage', extra = {}) => {
    let params = {};
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      const tab = tabs.filter(item => {
        return item.active;
      })[0];
      params['incognito'] = tab.incognito || 0;
      params['url'] = tab.url || 0;
      params['type'] = theExtension.installType;
      params['ext_id'] = theExtension.id;
      params['version'] = theExtension.version;
      params['ua'] = navigator.userAgent;
      chrome.storage.sync.get(null, function (res) {
        const storaged = Object.assign({ developers: '', group: '', testers: '' }, res);
        params = Object.assign({}, params, storaged, extra);
        fetch(Constants.api[type], {
          method: 'PUT',
          body: JSON.stringify(params),
          credentials: 'omit',
          headers: { 'content-type': 'application/json' },
        }).then(res => {
          if (res.ok && res.status === 200) {
            return res.json();
          }
        })
      });
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