module.exports = function ( grunt ) {
  grunt.initConfig({

   	pkg: grunt.file.readJSON('package.json'),
     jshint: {
       src: ['src/js/allControllers.js', '!chatserver.js', '!js/socket.io.min.js', '!js/socket-factory.js'],
       gruntfile: ['Gruntfile.js'],
       options: {
        //reporter: require('jshint-stylish'),
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
      }
       	//build: ['Gruntfile.js', 'src/**/*.js']
     },

     uglify: {
        options: {
          banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
        },
        build: {
          files: {
            'build/app.min.js': ['src/js/app.js', 
                                 'src/js/Controllers/loginController.js', 
                                 'src/js/Controllers/roomsController.js',
                                 'src/js/Controllers/roomController.js']
          }
        }
      },
      cssmin: {
        options: {
          banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
        },
        build: {
          files: {
            'build/style.min.css': 'src/css/style.css'
          }
        }
      }
    
});

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);
};