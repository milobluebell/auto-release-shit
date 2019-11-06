
const fs = require("fs");
const gulp = require("gulp");
var crx = require('gulp-crx-pack');
var manifest = require('./extension-src/manifest.json');

gulp.task('pack', function () {
  return gulp.src('./extension-src')
    .pipe(crx({
      privateKey: fs.readFileSync('./dist.pem', 'utf8'),
      filename: `Auto_Release_Shit.crx`,
      codebase: 'https://github.com/milobluebell/ARS-publishment/blob/master/Auto_Release_Shit.crx?raw=true',
      updateXmlFilename: 'updates.xml'
    }))
    .pipe(gulp.dest('./dist'));
});