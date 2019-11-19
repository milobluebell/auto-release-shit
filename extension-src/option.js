
// 获取当前所有.content下的input的id
let defaultState = [
  {
    title: '项目组',
    localStorage_key: 'group',
  }, {
    title: '开发对接人',
    localStorage_key: 'developers',
  }, {
    title: '测试对接人',
    localStorage_key: 'testers',
  }
];

/**
 * @param {*} newState 
 * @func 更新状态
 */
function setState(newState = []) {
  let options = ``;
  if (newState && Object.prototype.toString.call(newState).toLowerCase() === '[object array]') {
    options = newState.reduce((prev, curr, index) => {
      return prev.concat([
        `
        <dl class="context">
          <dt class="title">
            <span>${curr.title}</span>：
          </dt>
          <dd class="content">
            <input class="common-ipt" id="${curr.localStorage_key}" data-index="${index}"/>
          </dd>
        </dl>
        `
      ])
    }, []).join('');
  }
  defaultState = newState;
  document.getElementById('options-container').innerHTML = options;
  bindEvent();
}

/**
 * 获取持久化数据
 */
function getStoragedValues() {
  chrome.storage.sync.get(ids, function (res) {
    Array.from(document.getElementsByClassName('content')).forEach(item => {
      document.getElementById(item.children[0].id).value = res[item.children[0].id] || '';
    })
  });
}

/**
 * 对doms绑定事件
 */
function bindEvent() {
  Array.from(document.getElementsByClassName('insert-btn')).forEach(item => {
    item.onclick = function (e) {
      AddOptionAt(e.target.dataset.index);
    }
  })
  Array.from(document.getElementsByClassName('remove-btn')).forEach(item => {
    item.onclick = function (e) {
      removeOption(e.target.dataset.index);
    }
  })
}


/**
 * start script
 */
setState(defaultState);
const wrappers = Array.from(document.getElementsByClassName('content'));
const ids = wrappers.reduce((prev, curr) => {
  return prev.concat([curr.children[0].id]);
}, []);
getStoragedValues();
document.getElementById('submitBtn').onclick = function () {
  const targetObj = {};
  wrappers.forEach(item => {
    targetObj[item.children[0].id] = document.getElementById(item.children[0].id).value;
  });
  chrome.storage.sync.set(targetObj, function () {
    const theToast = document.getElementById('set-success-reminder');
    theToast.innerHTML = Object.values(targetObj).some(item => item) > 0 ? '保存成功' : '没有填写内容';
    theToast.style.display = 'block';
    setTimeout(() => {
      theToast.style.display = 'none';
    }, 888);
  });
}
bindEvent();