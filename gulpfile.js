
const fs = require("fs");
const gulp = require("gulp");
const clean = require("gulp-clean");
const crx = require('gulp-crx-pack');
const http = require('https');;
const arg = require("minimist")(process.argv.slice(2));
const rename = require('gulp-rename');
const npm_version = require('./package.json').version.toString();
const crx_version = require('./extension-src/manifest.json').version.toString();

gulp.task('clean-scripts', function () {
  return gulp.src('./dist', { read: false, allowEmpty: true })
    .pipe(clean({ force: true }));
});

gulp.task('build', gulp.series(['clean-scripts'], function () {
  return gulp.src('./extension-src')
    .pipe(crx({
      privateKey: fs.readFileSync('./extension-src.pem', 'utf8'),
      filename: `Auto_Release_Shit.${arg.exts || 'crx'}`,
      codebase: 'https://github.com/milobluebell/auto-release-shit/blob/master/Auto_Release_Shit.crx?raw=true',
      updateXmlFilename: 'updates.xml'
    }))
    .pipe(gulp.dest('./dist'));
}))

gulp.task('release', async function () {
  if (crx_version === npm_version) {
    return await http.request({
      json: true,
      headers: { "content-type": "application/zip" },
      method: 'post',
      url: `https://uploads.github.com/repos/milobluebell/auto-release-shit/releases/${npm_version}/assets?name=dist/Auto_Release_Shit.zip}`
    }, function (error, res, body) {
      if (!error && res && res.statusCode === 200) {
        return {
          data: res,
          latest: res[res.length - 1]
        }
      } else return undefined;
    })
  } else {
    return false;
  };
})

gulp.task('rename', function () {
  const origin_name = `Auto_Release_Shit`;
  return gulp.src(`./dist/${origin_name}.crx`)
    .pipe(rename(`${origin_name}.zip`))
    .pipe(gulp.dest("./dist"));
})