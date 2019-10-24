
class Constants {
  static devTest = 'dev_test';
  static staging = 'staging';
  static commitMessageTags = {
    'feat': {
      label: `feat`,
    },
    'fix': {
      label: `fix`,
      conse: `修复多项缺陷/改进体验`
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
   * 获取当前页面显示的最后一次构建编号
   */
  static getLastestReleaseCode = () => {

  }

  /**
   * @param {*} release_code
   * @algo  [fix判定为“修改了缺陷、改进体验”],
   *        [docs判定为"修改了文档"]
   *        [style判定为"样式调优"],
   *        [refactor和chore判定为"项目部分重构"],
   *        [perf判定为"优化表现和性能"]
   *        [其余根据实际情况进行拼接]
   */
  static generateOnePieceOfShit = (commits) => {
    const commitList = commits.reduce((prev, curr) => {
      const commitKey = curr.message.split(':')[0];
      if (commitKey === Constants.commitMessageTags.feat.label) {
        const commitMsg = curr.message.substring(curr.message.indexOf(':') + 2);
        return prev.concat([commitMsg]);
      } else {
        return prev.concat([Constants.commitMessageTags[commitKey].conse]);
      }
    }, []);
    // 
    const desc = Array.from(new Set(commitList), commit => commit).join('、');
    return Constants.sheetFrags.reduce(pre, cur=> {
      return pre.push(`${cur}： `);
    }, []);

    // return `项目组：平台服务组\r
    //   项目名称：platform_transaction_cashier_frontend\r
    //   发版环境：production\r
    //   构建编号：#19\r
    //   发版时间：2019年09月26日 22:52\r
    //   项目对接人：马子航\r
    //   测试对接人：聂亚运\r
    //   发版说明: ${}
    //   `;
  }

  /**
   * 
   */
  static $ = (param) => {
    if (typeof param !== 'string') {
      return;
    }
    if (param[0] === '.') {
      return document.getElementsByClassName(omitParam(param));
    } else if (param[0] === '#') {
      return [document.getElementById(omitParam(param))];
    } else {
      return document.getElementsByTagName(omitParam(param));
    }
  }
};

let requestting = false;
let commitsData = {};
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  sendResponse({ status: true, body: commitsData });

  if (!requestting) {
    fetch(request, { credentials: 'same-origin' }).then(res => res.json()).then(data => {
      commitsData = {
        commitCount: data[0].commitCount,
        commits: data[0].commits,
        theShit: Vendors.generateOnePieceOfShit(data[0].commits),
      }
      requestting = false;
    });
  }
  requestting = true;
});

console.log(chrome.storage);
