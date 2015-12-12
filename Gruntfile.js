module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		includereplace: {
			dist : {
				options: {
					includesDir: "src",
					prefix: "//@@"
				},
				// Files to perform replacements and includes with
				src: 'src/**/*.js',
				// Destination directory to copy files to
				dest: 'obj/'
			}
		},
		copy: {
			dist: {
				files: [{
					expand: true, 
					src: 'obj/src/amd.js', 
				    rename: function(dest, src) {
				    	return "dist/<%= pkg.name %>.js";
				    }
				}]
			}
		},		
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			dist: {
				src: 'dist/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		jshint: {
		    all: ['src/**/*.js']
		},
		"bower-install-simple": {
	        options: {
	            color: true
	        },
	        "prod": {
	            options: {
	                production: true
	            }
	        },
	        "dev": {
	            options: {
	                production: false
	            }
	        }
	    },
	    jsdoc : {
	        dist : {
        		src: ['dist/<%= pkg.name %>.js', 'README.md'],	
        		options: {
                    destination: 'doc_output',
					private: false,
					tutorials: 'doc_resource/tutorials',
					configure : "jsdoc.conf.json"
                }
	        }
	    },	    
	    connect: {
	    	server: {
	    	      options: {
	    	    	keepalive: true,
	    	        port: 8020
	    	      }
	    	},
	    	unittest: {
	    	      options: {
		    	        port: 8020
	    	      }
	    	}
	    },
		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks("grunt-bower-install-simple");
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-include-replace');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-jsdoc');
	
	// Default task(s).
	grunt.registerTask('default', ['jshint', 'includereplace', 'copy', 'jsdoc', 'uglify']);
	grunt.registerTask('compile', ['jshint', 'includereplace', 'copy']);
	grunt.registerTask('bower-install', ['bower-install-simple']);
	grunt.event.once('connect.server.listening', function(host, port) {
		grunt.log.writeln("Unit test pages is available at http://127.0.0.1:" + port +  "/test/unit/");
		grunt.log.writeln("Manual test page is available at http://127.0.0.1:" + port +  "/test/server/");
	});
	grunt.registerTask('test-server', 'Run a test server for manual testing/playing', ['default', 'bower-install-simple', 'connect']);
	grunt.registerTask('test', 'Run the unit test suite', ['bower-install-simple', 'karma']);
	grunt.registerTask('doc', ['compile', 'jsdoc']);
};
