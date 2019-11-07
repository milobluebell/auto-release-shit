
const fs = require("fs");
const gulp = require("gulp");
const clean = require("gulp-clean");
const crx = require('gulp-crx-pack');
const http = require('https');
const arg = require("minimist")(process.argv.slice(2));


async function createRelease() {

}

async function getTags() {
  return await http.request({
    json: true,
    headers: {
      "content-type": "application/json",
    },
    method: 'get',
    url: `https://api.github.com/repos/milobluebell/auto-release-shit/tags`
  }, function (error, res, body) {
    console.log(error);
    console.log(res);
    if (!error && res && res.statusCode === 200) {
      return {
        data: res,
        latest: res[res.length - 1]
      }
    } else return undefined;
  })
}


gulp.task('clean-scripts', function () {
  return gulp.src('./dist', { read: false, allowEmpty: true })
    .pipe(clean({ force: true }));
});

gulp.task('pack', gulp.series(['clean-scripts'], function () {
  getTags();
  return gulp.src('./extension-src')
    .pipe(crx({
      // privateKey: fs.readFileSync('./extension-src.pem', 'utf8'),
      privateKey: arg.pem,
      filename: `Auto_Release_Shit.crx`,
      codebase: 'https://github.com/milobluebell/auto-release-shit/blob/master/Auto_Release_Shit.crx?raw=true',
      updateXmlFilename: 'updates.xml'
    }))
    .pipe(gulp.dest('./dist'));
}));