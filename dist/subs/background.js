
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
      conse: `项目部分重构`
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
      conse: `项目部分重构`
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
    label: `项目对接人`,
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

const omitParam = (param) => {
  return param.replace(/(\#|\.)/g, '');
};



class Vendors {
  /**
   * @function 抓取当前页面所在发布舞台
   * @param {*} param 
   * @returns 'staging' | 'dev-test' | 'prod'
   */
  static getStage(param) {
    const lowerParam = param.toLowerCase();
    return lowerParam.includes(Constants.staging) ?
      'staging'
      :
      lowerParam.includes(Constants.devTest) ? 'dev-test' : undefined;
  }

  /**
   * @param {*} fragmentBeforeColon
   * @desc 根据各种其它模式，生成统一可识别的commitKey
   *       比如 fix(sku): 这种模式，也要被识别为fix
   */
  static getUnifiedCommitKey(fragmentBeforeColon) {
    let gap = null;
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
   * @algo  [fix判定为“修复缺陷、改进体验”],
   *        [docs判定为"修改了文档"]
   *        [style判定为"样式调优"],
   *        [refactor和chore判定为"项目部分重构"],
   *        [perf判定为"优化表现和性能"]
   *        [其余根据实际情况进行拼接]
   */
  static generateOnePieceOfShit = (commits, params) => {
    const commitList = commits.reduce((prev, curr) => {
      const commitKey = Vendors.getUnifiedCommitKey(curr.message.split(':')[0]);
      // 需要支持带scope的fix(!@#): 模式
      if (commitKey === Constants.commitMessageTags.feat.label) {
        const commitMsg = curr.message.substring(curr.message.indexOf(':') + 2);
        return prev.concat([commitMsg]);
      } else {
        return prev.concat([Constants.commitMessageTags[commitKey].conse]);
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
};

let requestting = false;
let commitsData = {};
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  sendResponse({ status: true, body: commitsData });
  if (!requestting && request) {
    try {
      fetch(request.requestUrl, { credentials: 'same-origin' }).then(res => {
        if (res.ok && res.status === 200) {
          return res.json();
        }
      }).then(data => {
        if (data && data.length > 0) {
          chrome.storage.sync.get(null, function (res) {
            commitsData = {
              commitCount: data[0].commitCount,
              commits: data[0].commits,
              theShit: Vendors.generateOnePieceOfShit(data[0].commits, {
                ...res,
                ...request.env,
                release_code: '#' + request.release_code,
              }),
              needReminder: (Object.values(res).every(item => item) && Object.values(res).length > 0) ? false : true,
            }
            setTimeout(function () {
              commitsData = {};
            }, 888)
          });
        }
        requestting = false;
      });
    } catch (error) {
      console.warn(error);
      requestting = true;
    }
  }
  requestting = true;
}); 