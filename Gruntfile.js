module.exports = function(grunt) {
  grunt.initConfig({
    css_files: ['src/css/*.css'],
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
    cssmin: {
      options: {
        sourceMap: true
      },
      styles: {
        files: {
          'css/main.min.css': ['<%= css_files %>']
        }
      }
    },
    htmlmin: {
      options: {
        removeComments: true,
        collapseWhitespace: true
      },
      dist: {
        files: {
          'index.html': ['src/index.html']
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
        eqeqeq: true
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
      css: {
        files: ['<%= css_files %>'],
        tasks: ['cssmin']
      },
      html: {
        files: ['src/index.html'],
        tasks: ['htmlmin']
      },
      scripts: {
        files: ['<%= js_files %>'],
        tasks: ['hintify', 'uglify']
      },
      other: {
        options: {
          livereload: true,
        },
        files: ['index.html', 'css/*.min.css', 'js/*.min.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('dist', ['hintify', 'uglify', 'cssmin', 'htmlmin']);
  grunt.registerTask('hintify', ['jshint:beforeconcat', 'concat', 'jshint:afterconcat']);
  grunt.registerTask('default', ['connect', 'watch']);
};
