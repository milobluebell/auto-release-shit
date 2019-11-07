
const fs = require("fs");
const gulp = require("gulp");
const clean = require("gulp-clean");
const crx = require('gulp-crx-pack');
const http = require('https');
const tag = require('gulp-tag-version');
const arg = require("minimist")(process.argv.slice(2));

async function uploadReleaseZip(release_code) {
  console.log(uploadReleaseZip);
  return await http.request({
    json: true,
    headers: {
      "content-type": "application/zip",
    },
    method: 'post',
    url: `https://uploads.github.com/repos/milobluebell/auto-release-shit/releases/${release_code}/assets?name=Auto_Release_Shit.crx}`
  }, function (error, res, body) {
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

gulp.task('tag-scripts', function () {
  return gulp.src(['./package.json']).pipe(tag());
});

gulp.task('build', gulp.series(arg.exts ? ['clean-scripts'] : ['clean-scripts', 'tag-scripts'], function () {
  return gulp.src('./extension-src')
    .pipe(crx({
      privateKey: fs.readFileSync('./extension-src.pem', 'utf8'),
      filename: `Auto_Release_Shit.${arg.exts || 'crx'}`,
      codebase: 'https://github.com/milobluebell/auto-release-shit/blob/master/Auto_Release_Shit.crx?raw=true',
      updateXmlFilename: 'updates.xml'
    }))
    .pipe(gulp.dest('./'));
}))

gulp.task('release', function () {
  uploadReleaseZip('latest');
})