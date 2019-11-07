
const fs = require("fs");
const gulp = require("gulp");
const clean = require("gulp-clean");
const crx = require('gulp-crx-pack');
const tap = require("gulp-tap");
const arg = require("minimist")(process.argv.slice(2));
const rename = require('gulp-rename');
/**
 * CONSTs
 */
const SRC_FOLDER = `./extension-src`;
const BUILD_TARGET = `./dist`;



/**
 * FUNCs
*/
const addUpdateUrl = () => gulp.src(SRC_FOLDER + '/manifest.json', { allowEmpty: false })
  .pipe(tap(file => {
    const manifest_content = JSON.parse(file.contents.toString());
    manifest_content['update_url'] = `https://raw.githubusercontent.com/milobluebell/auto-release-shit/master/dist/updates.xml`;
    file.contents = Buffer.from(JSON.stringify(manifest_content), 'utf-8');
  }))
  .pipe(gulp.dest(SRC_FOLDER));



/**
 * TASKs
 */
gulp.task('clean-scripts', function () {
  return gulp.src(BUILD_TARGET, { read: false, allowEmpty: true })
    .pipe(clean({ force: true }));
});

gulp.task('build', gulp.series(['clean-scripts'], function () {
  addUpdateUrl();
  return gulp.src(SRC_FOLDER)
    .pipe(crx({
      privateKey: fs.readFileSync('./extension-src.pem', 'utf8'),
      filename: `Auto_Release_Shit.${arg.exts || 'crx'}`,
      codebase: 'https://github.com/milobluebell/auto-release-shit/blob/master/dist/Auto_Release_Shit.crx?raw=true',
      updateXmlFilename: 'updates.xml'
    }))
    .pipe(gulp.dest(BUILD_TARGET));
}));

gulp.task('rename', function () {
  const origin_name = `Auto_Release_Shit`;
  return gulp.src(`${BUILD_TARGET}/${origin_name}.crx`)
    .pipe(rename(`${origin_name}.zip`))
    .pipe(gulp.dest(BUILD_TARGET));
});
