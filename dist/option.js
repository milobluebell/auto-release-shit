

document.getElementById('submitBtn').onclick = function () {
  const developers = document.getElementById('developers').value;
  const testers = document.getElementById('testers').value;

  chrome.extension.sendMessage({
    developers,
    testers
  }, function (res) {
    console.log(res);
  })

  // console.log(chrome.storage);
  // chrome.storage.StorageArea.set({
  //   developers: '1',
  //   tester: '2'
  // }, function (res) {
  //   console.log(res);
  // })
}