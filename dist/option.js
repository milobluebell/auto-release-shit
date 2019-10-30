
// 获取当前所有.content下的input的id
const wrappers = Array.from(document.getElementsByClassName('content'));
const ids = wrappers.reduce((prev, curr) => {
  return prev.concat([curr.children[0].id]);
}, []);

document.getElementById('submitBtn').onclick = function () {
  const targetObj = {};
  wrappers.forEach(item => {
    targetObj[item.children[0].id] = document.getElementById(item.children[0].id).value;
  })
  chrome.storage.sync.set(targetObj, function () {
    const theToast = document.getElementById('set-success-reminder');
    theToast.style.display = 'block';
    setTimeout(() => {
      theToast.style.display = 'none';
    }, 1600)
  });
}

chrome.storage.sync.get(ids, function (res) {
  wrappers.forEach(item => {
    document.getElementById(item.children[0].id).value = res[item.children[0].id] || '';
  })
});