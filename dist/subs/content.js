(function () {
  getReleaseCommits(getLastestSuccessReleaseCode());
})();



/**
 * @function 获取最近一次成功构建的编号
 */
function getLastestSuccessReleaseCode() {

  const lastestSuccessReleases = document.getElementsByClassName('permalink-link');
  let lastestSuccessReleaseCode = 0;
  for (let i = 0; i < lastestSuccessReleases.length; i++) {
    const releaseInner = lastestSuccessReleases[i].innerHTML.toLowerCase();
    if (releaseInner.includes('最近成功')) {
      lastestSuccessReleaseCode = releaseInner.match(/\d+/g)[0];
    }
  }
  return lastestSuccessReleaseCode;

}

/**
 * @function 获取对应构架编号的commit内容
 */
function getReleaseCommits(release_code) {
  const baseUrl = window.location.href;
  const tnow = new Date().getTime();
  const requestUrl = `${baseUrl}${release_code}/wfapi/changesets?_=${tnow}`;
  const targetDiv = document.getElementById('main-panel');
  let count = 1;
  const timer = setInterval(() => {
    count++;
    if (count >= 20) {
      clearInterval(timer)
    } else {
      chrome.runtime.sendMessage(requestUrl, function (res) {
        if (res && res.status) {
          // TODO: 如果body里有数据了，则取消timer
          if (Object.keys(res.body).length > 0) {
            console.log(res.body);
            clearInterval(timer);
          }
        } else {
          console.error(` oops! "auto release sh*t" extension make some troubles`);
          clearInterval(timer);
          return;
        }
      });
    }
  }, 500);
}