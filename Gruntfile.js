module.exports = function(grunt) {
  grunt.initConfig({
    js_files: ['src/js/*.js'],
    concat: {
      dist: {
        src: ['<%= js_files %>'],
        dest: 'build/main.concat.js'
      }
    },
    connect: {
      server: {
        options: {
          base: '.',
          livereload: true
        }
      }
    },
    uglify: {
      options: {
        sourceMap: true
      },
      scripts: {
        files: {
          'js/main.min.js': ['<%= js_files %>']
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        newcap: true,
        quotmark: 'single'
      },
      beforeconcat: {
        src: ['Gruntfile.js', '<%= js_files %>']
      },
      afterconcat: {
        options: {
          undef: true,
          globals: {
            Highcharts: true,
            mows: true
          },
          browser: true,
          devel: true,
          jquery: true
        },
        src: ['<%= concat.dist.dest %>']
      }
    },
    watch: {
      scripts: {
        files: ['<%= js_files %>'],
        tasks: ['dist']
      },
      other: {
        options: {
          livereload: true,
        },
        files: ['index.html', 'css/main.css', 'js/*.min.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('dist', ['hintify', 'uglify']);
  grunt.registerTask('hintify', ['jshint:beforeconcat', 'concat', 'jshint:afterconcat']);
  grunt.registerTask('default', ['connect', 'watch']);
};
