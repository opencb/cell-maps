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
                    'src/cm-toolbar.js',

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
                    {   expand: true, cwd: './src', src: ['cm-config.js'], dest: '<%= def.build %>/' },
                    {   expand: true, cwd: './src', src: ['forms/**'], dest: '<%= def.build %>/' },
                    {   expand: true, cwd: './src', src: ['plugins/**'], dest: '<%= def.build %>/' },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['vendor/**'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>', src: ['styles/**'], dest: '<%= def.build %>/'  },
                    {   expand: true, cwd: './<%= def.jsorolla %>/src/lib', src: ['worker*'], dest: '<%= def.build %>/' },

                    {   expand: true, cwd: './<%= def.jsorolla %>/build/<%= jsopkg.version %>/network-viewer/', src: ['network-viewer*.js', 'nv-config.js'], dest: '<%= def.build %>/' },
                ]
            }
        },
        clean: {
            dist: ['<%= def.build %>/']
        },
        htmlbuild: {
            build: {
                src: 'src/<%= def.name %>.html',
                dest: '<%= def.build %>/',
                options: {
                    beautify: true,
                    styles: {
                        'vendor': [
                            '<%= def.build %>/vendor/ext-5/theme-babel/theme-babel-all.css',
                            '<%= def.build %>/vendor/jquery.qtip*.css',
                            '<%= def.build %>/vendor/bootstrap-*-dist/css/bootstrap.min.css',
                            '<%= def.build %>/vendor/jquery.simplecolorpicker.css'
                        ],
                        'css': ['<%= def.build %>/styles/css/style.css']
                    },
                    scripts: {
                        vendor: [
                            '<%= def.build %>/vendor/ext-5/ext-all.js',
                            '<%= def.build %>/vendor/ext-5/ext-charts.js',
                            '<%= def.build %>/vendor/underscore*.js',
                            '<%= def.build %>/vendor/backbone*.js',
                            '<%= def.build %>/vendor/rawdeflate*.js',
                            '<%= def.build %>/vendor/rgbcolor.js',
                            '<%= def.build %>/vendor/canvg.js',
                            '<%= def.build %>/vendor/xml2json.js',
                            '<%= def.build %>/vendor/jszip.min.js',
                            '<%= def.build %>/vendor/xlsx.min.js',
                            '<%= def.build %>/vendor/jquery.min.js',

                            '<%= def.build %>/vendor/bootstrap-*-dist/js/bootstrap.min.js',
                            '<%= def.build %>/vendor/typeahead.min.js',
                            '<%= def.build %>/vendor/jquery.qtip*.js',
                            '<%= def.build %>/vendor/jquery.cookie*.js',
                            '<%= def.build %>/vendor/jquery.sha1*.js',
                            '<%= def.build %>/vendor/purl*.js',
                            '<%= def.build %>/vendor/jquery.mousewheel*.js',
                            '<%= def.build %>/vendor/gl-matrix-min*.js',
                            '<%= def.build %>/vendor/ChemDoodleWeb*.js',
                            '<%= def.build %>/vendor/jquery.simplecolorpicker.js',
                            '<%= def.build %>/vendor/d3.min.js'
                        ],
                        config: [
                            '<%= def.build %>/nv-config.js'
                        ],
                        lib: [
                            '<%= def.build %>/network-viewer*.min.js'
                        ],
                        js: '<%= def.build %>/<%= def.name %>.min.js'


                    }

                }
            }
        },
        'curl-dir': {

        },
        rename: {
            dist: {
                files: [
                    {
                        src: ['<%= def.build %>/<%= def.name %>.html'],
                        dest: '<%= def.build %>/index.html'
                    }
                ]
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
    grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-hub');

    grunt.registerTask('log-deploy', 'Deploy path info', function (version) {
        grunt.log.writeln("DEPLOY COMMAND: scp -r build/" + grunt.config.data.pkg.version + " cafetero@mem16:/httpd/bioinfo/www-apps/cell-maps/");
    });

    // Default task.
    grunt.registerTask('default', ['hub','clean', 'concat', 'uglify', 'copy', 'htmlbuild', 'rename', 'log-deploy']);

};
