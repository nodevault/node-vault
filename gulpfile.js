'use strict';

const path = require('path');
const gulp = require('gulp');
const excludeGitignore = require('gulp-exclude-gitignore');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const nsp = require('gulp-nsp');
const plumber = require('gulp-plumber');
const eslint = require('gulp-eslint');

// feature docs script dependencies
const docco = require('gulp-docco');
const fs = require('fs');
const commands = require('./src/commands');

gulp.task('nsp', (cb) => {
  nsp({ package: path.resolve('package.json') }, cb);
});

gulp.task('lint', () => gulp.src([
  '**/*.js',
  '!node_modules/**',
  '!coverage/**',
  '!logs/**',
]).pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()),
);

gulp.task('pre-test', () => gulp.src('src/**/*.js')
  .pipe(excludeGitignore())
  .pipe(istanbul({
    includeUntested: true,
  }))
  .pipe(istanbul.hookRequire()),
);

gulp.task('test', ['lint', 'pre-test'], (cb) => {
  let mochaErr;

  gulp.src('test/**/*.js')
    .pipe(plumber())
    .pipe(mocha({ reporter: 'spec' }))
    .on('error', (err) => {
      mochaErr = err;
    })
    .pipe(istanbul.writeReports())
    .on('end', () => {
      cb(mochaErr);
    });
});

gulp.task('features', ['docco'], () => {
  let result = '# Supported node-vault features\n';
  result += '\n This is a generated list of Vault features supported by node-vault.';

  const renderCommand = (name) => {
    const command = commands[name];
    result += `\n\n## vault.${name}`;
    result += `\n\n\`${command.method} ${command.path}\`\n`;
  };
  Object.keys(commands).forEach(renderCommand);
  fs.writeFileSync('./features.md', result);
});

gulp.task('docco', () => gulp.src('src/*.js')
  .pipe(docco())
  .pipe(gulp.dest('docs')),
);

gulp.task('docs', ['features']);

gulp.task('watch', () => {
  gulp.watch(['service/**/*.js', 'test/**'], ['test']);
});

gulp.task('build');

gulp.task('prepublish', ['nsp', 'build']);
gulp.task('default', ['test']);
