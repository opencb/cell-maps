module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsopkg: grunt.file.readJSON('lib/jsorolla/package.json'),
        def: {
            name: 'cell-maps',
            build: 'build/<%= pkg.version %>',
            jsorolla: 'lib/jsorolla'
        },
        concat: {
            dist: {
                src: [
                    'src/cell-maps-configuration.js',

                    'src/plugins/**/*.js',
                    'src/forms/**/*.js',

                    'src/visual-attribute-widget/attribute-control/attribute-control.js',
                    'src/visual-attribute-widget/attribute-grid/attribute-grid.js',
                    'src/visual-attribute-widget/**/*.js',

                    'src/cell-maps.js'
                ],
                dest: '<%= def.build %>/<%= def.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= def.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    '<%= def.build %>/<%= def.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        copy: {
            dist: {
                files: [

                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/platform.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/platform.js.map'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/underscore-min.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/backbone-min.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/backbone-min.map'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/font-awesome/**'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/jquery.min.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/jquery.simplecolorpicker.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/jquery.simplecolorpicker.css'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/rgbcolor.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/canvg.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/xml2json.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/jszip.min.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/xlsx.min.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/jquery.qtip.min.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/jquery.qtip.min.css'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/jquery.cookie.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/purl.min.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/jquery.sha1.js'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/ext-5/**'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/d3.min.js'], dest: '<%= def.build %>/'  },


                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['styles/**'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>/src/lib', src: ['worker*'], dest: '<%= def.build %>/' },

                    {   expand: true, cwd: './src', src: ['cm-config.js'], dest: '<%= def.build %>/' },
                    {   expand: true, cwd: './src', src: ['cm-toolbar.html'], dest: '<%= def.build %>/' },
//                    {   expand: true, cwd: './src', src: ['forms/**'], dest: '<%= def.build %>/' },
//                    {   expand: true, cwd: './src', src: ['plugins/**'], dest: '<%= def.build %>/' },
                    {   expand: true, cwd: './src', src: ['example-files/**'], dest: '<%= def.build %>/' },

                    {   expand: true, cwd: './<%= def.jsorolla %>/build/<%= jsopkg.version %>/network-viewer/', src: ['network-viewer*.js', 'nv-config.js'], dest: '<%= def.build %>/' },

                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['src/lib/components/jso-color-picker.html'], dest: '<%= def.build %>/components', flatten: true}
                ]
            }
        },
        clean: {
            dist: ['<%= def.build %>/']
        },
        processhtml: {
            options: {
                strip: true
            },
            dist: {
                files: {
                    '<%= def.build %>/index.html': ['src/<%= def.name %>.html']
                }
            }
        },
        hub: {
            'network-viewer': {
                src: ['lib/jsorolla/Gruntfile.js'],
                tasks: ['nv']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-rename');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-hub');

    grunt.registerTask('log-deploy', 'Deploy path info', function (version) {
        grunt.log.writeln("DEPLOY COMMAND: scp -r build/" + grunt.config.data.pkg.version + " cafetero@mem16:/httpd/bioinfo/www-apps/cell-maps/");
    });

    // Default task.
    grunt.registerTask('default', ['hub', 'clean', 'concat', 'uglify', 'copy', 'processhtml', 'log-deploy']);

};
