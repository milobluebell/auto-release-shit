
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
  chrome.storage.sync.set(targetObj);
}

chrome.storage.sync.get(ids, function (res) {
  const { developers, testers, group } = res;
  document.getElementById('developers').value = developers || '';
  document.getElementById('testers').value = testers || '';
  document.getElementById('group').value = group || '';
});