module.exports = function ( grunt ) {
 grunt.loadNpmTasks('grunt-contrib-jshint');
 var taskConfig = {
 	pkg: grunt.file.readJSON('package.json'),
   jshint: {
     src: ['src/js/**/*.js', 'chatserver.js', '!js/socket.io.min.js', '!js/socket-factory.js'],
     gruntfile: ['Gruntfile.js'],
     options: {
     	curly:  true,
      immed:  true,
      newcap: true,
      noarg:  true,
      sub:    true,
      boss:   true,
      eqnull: true,
      node:   true,
      undef:  true,
      globals: {
        _:       false,
        jQuery:  false,
        angular: false,
        moment:  false,
        console: false,
        $:       false,
        io:      false
     }
     	//build: ['Gruntfile.js', 'src/**/*.js']
   },

   uglify: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
      },
      build: {
        files: {
          'dist/js/minified.min.js': ['src/js/*.js']
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'build/default.min.css': ['src/css/*.css']
        }
      }
    }
  }
};
 grunt.initConfig(taskConfig);

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);
};