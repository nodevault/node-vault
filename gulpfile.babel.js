'use strict';
/* eslint-disable import/no-extraneous-dependencies */

import path from 'path';
import gulp from 'gulp';
import mocha from 'gulp-mocha';
import istanbul from 'gulp-babel-istanbul';
import nsp from 'gulp-nsp';
import plumber from 'gulp-plumber';
import concat from 'gulp-concat';
import babel from 'gulp-babel';
import eslint from 'gulp-eslint';
import coveralls from 'gulp-coveralls';

// feature docs script dependencies
import docco from 'gulp-docco';
import fs from 'fs';
import commands from './src/commands';

const files = {
  src: 'src/**/*.js',
  test: 'test/**/*.js',
};

gulp.task('nsp', (cb) => {
  nsp({ package: path.resolve('package.json') }, cb);
});

gulp.task('lint', () => gulp.src([
  files.src,
  '!node_modules/**',
  '!coverage/**',
  '!logs/**',
  '!dist/**',
]).pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
);

gulp.task('pre-test', () => gulp.src(files.src)
    .pipe(istanbul({
      includeUntested: true,
    }))
    .pipe(istanbul.hookRequire())
);

gulp.task('transpile', () => gulp.src(files.src)
    .pipe(babel())
    .pipe(concat('index.js'))
    .pipe(gulp.dest('dist'))
);

gulp.task('test', ['lint'], (cb) => {
  let mochaErr;

  gulp.src(files.test)
    .pipe(plumber())
    .pipe(mocha({
      reporter: 'spec',
      compilers: {
        js: babel,
      },
    }))
    .on('error', (err) => {
      mochaErr = err;
    })
    .pipe(istanbul.writeReports())
    .on('end', () => {
      cb(mochaErr);
    });
});

gulp.task('coveralls', ['test'], () => gulp.src('coverage/lcov.info')
    .pipe(coveralls())
);

gulp.task('features', ['docco'], () => {
  let result = '# Supported Vault Features\n';
  result += '\n This is a generated list of Vault features supported by node-vault.';

  const renderCommand = (name) => {
    const command = commands[name];
    result += `\n\n## vault.${name}`;
    result += `\n\n '${command.method} ${command.path}'`;
  };
  Object.keys(commands).forEach(renderCommand);
  fs.writeFileSync('./features.md', result);
});

gulp.task('docco', () => gulp.src(files.src)
  .pipe(docco())
  .pipe(gulp.dest('docs'))
);

gulp.task('docs', ['features']);

gulp.task('watch', () => {
  gulp.watch(['src/**/*.js', 'test/**'], ['test']);
});

gulp.task('build', ['test', 'transpile']);

gulp.task('prepublish', ['nsp']);
gulp.task('default', ['test']);
