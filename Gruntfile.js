require('load-grunt-tasks')(grunt);

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      options: {
        ignore: false,
      },
      target: [
        'app/**/*.js',
        'lib/**/*.js',
        'public/client/**/*.js',
        'test/**/*.js',
      ],
    },

    mochaTest: {
      options: {
        reporter: 'nyan',
      },
      normal: {
        src: ['test/**/*.js']
      },
    },

    gitpush: {
      prod: {
        options: {
          remote: 'prod'
        }
      }
    },

    nodemon: {
      dev: {
        script: 'server/index.js'
      }
    },

    watch: {
      eslint: {
        files: [
          '*.js',
          'server/**/*.js',
          'database/**/*.js',
          'client/**/*.js',
          'test/**/*.js',
        ],
        tasks: [
          'eslint',
        ],
      },

      mochaTest: {
        files: [
          'server/**/*.js',
          'test/**/*.js',
        ],
        tasks: [
          'shell:wait',
          'mochaTest',
        ],
      },
    },

    shell: {
      wait: {
        command: 'sleep 3'
      },
    },
  });


  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('build', [
    'eslint',
    // 'concat',
    // 'uglify',
    // 'cssmin',
  ]);

  grunt.registerTask('test', [
    'mochaTest:normal'
  ]);

  grunt.registerTask('upload', function() {
    if (grunt.option('prod')) {
      grunt.task.run([ 'gitpush:prod' ]);
    }
  });

  grunt.registerTask('deploy', [
    'build',
    'test',
    'upload',
  ]);

  grunt.registerTask('dev', [
    // TODO: start database if it's not already running
    'nodemon:dev'
    // TODO: start process to refresh browser windows upon file change.  see: https://github.com/ChrisWren/grunt-nodemon
  ]);

  grunt.registerTask('dev-debug', [
    'nodemon:dev-debug'
  ]);

  grunt.registerTask('help', 'print project-specific usage instructions', () => {
    grunt.log.writeln('The following are key tasks to be aware of:');
    grunt.log.writeln('grunt dev:  start server with nodemon');
    grunt.log.writeln('grunt dev-debug:  start server with nodemon and debugging enabled');
    grunt.log.writeln('grunt test:  run test suite');
    grunt.log.writeln('grunt test-debug:  run test suite with node debugging enabled');
    grunt.log.writeln('grunt deploy:  run test suite with node debugging enabled');
  });
};
