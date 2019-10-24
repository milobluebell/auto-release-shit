

document.getElementById('submitBtn').onclick = function () {
  const developers = document.getElementById('developers').value;
  const testers = document.getElementById('testers').value;
  chrome.storage.sync.set({
    developers,
    testers,
  });
}


chrome.storage.sync.get({
  developers,
  testers,
}, function (res) {
  const { developers, testers } = res;
  if (res.developers && res.testers && typeof res.developers === 'string' && typeof res.developers === 'string') {
    document.getElementById('developers').value = developers;
    document.getElementById('testers').value = testers;
  }
});