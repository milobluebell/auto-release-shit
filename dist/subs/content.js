(function () {
  getLastestSuccessReleaseCode();
})();
chrome.runtime.onMessage.addListener(function (e) {
  console.log(e, 1);
})

/**
 * @function 获取最近一次成功构建的编号
 */
function getLastestSuccessReleaseCode() {
  const lastestSuccessReleases = document.getElementsByClassName('permalink-link');
  // [0].innerHTML.replace(/(\#|\s)/g, '');
  let lastestSuccessReleaseCode = 0;
  for (let i = 0; i < lastestSuccessReleases.length; i++) {
    const releaseInner = lastestSuccessReleases[i].innerHTML.toLowerCase();
    if (releaseInner.includes('最近成功')) {
      lastestSuccessReleaseCode = releaseInner.match(/\d+/g)[0];
    }
  }
  console.log(lastestSuccessReleaseCode);
  return lastestSuccessReleaseCode;
}




/**
 * 
 */
function getReleaseCommits(release_code) {

}