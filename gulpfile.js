
const fs = require("fs");
const gulp = require("gulp");
const clean = require("gulp-clean");
const crx = require('gulp-crx-pack');

gulp.task('clean-scripts', function () {
  return gulp.src('./dist', { read: false })
    .pipe(clean({ force: true }));
});

gulp.task('pack', gulp.series(['clean-scripts'], function () {
  return gulp.src('./extension-src')
    .pipe(crx({
      privateKey: fs.readFileSync('./dist.pem', 'utf8'),
      filename: `Auto_Release_Shit.crx`,
      codebase: 'https://github.com/milobluebell/ARS-publishment/blob/master/Auto_Release_Shit.crx?raw=true',
      updateXmlFilename: 'updates.xml'
    }))
    .pipe(gulp.dest('./dist'));
}));