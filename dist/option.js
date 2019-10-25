
// TODO: 这里不要写死

document.getElementById('submitBtn').onclick = function () {
  const developers = document.getElementById('developers').value;
  const testers = document.getElementById('testers').value;
  const group = document.getElementById('group').value;
  chrome.storage.sync.set({
    developers,
    testers,
    group,
  });
}

chrome.storage.sync.get({
  developers,
  testers,
  group,
}, function (res) {
  const { developers, testers, group } = res;
  document.getElementById('developers').value = developers || '';
  document.getElementById('testers').value = testers || '';
  document.getElementById('group').value = group || '';
});