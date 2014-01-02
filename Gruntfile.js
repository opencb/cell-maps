/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        meta: {
            name:'cell-maps',
            version: '2.0.0',
            jsorolla: {
                dir: '/lib/jsorolla/',
                'networkviewer': {
                    version: '1.0.0',
                    dir: '<%= meta.jsorolla.dir %>build/network-viewer/<%= meta.jsorolla.networkviewer.version %>/'
                },
                //opencga does not contains utils
                opencga: {
                    version: '1.0.0',
                    dir: '<%= meta.jsorolla.dir %>build/opencga/<%= meta.jsorolla.opencga.version %>/'
                }
            }
        },
        banner: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '* http://PROJECT_WEBSITE/\n' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
            'OpenCB; Licensed GPLv2 */\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            build: {
                src: [
//                    'src/cm-config.js',
                    'src/cm-toolbar.js',
                    'src/cell-maps.js'
                ],
                dest: 'build/<%= meta.version %>/<%= meta.name %>-<%= meta.version %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            build: {
                src: '<%= concat.build.dest %>',
                dest: 'build/<%= meta.version %>/<%= meta.name %>-<%= meta.version %>.min.js'
            }
        },
        copy: {
            build: {
                files: [
                    {   expand: true, cwd: './src', src: ['cm-config.js'], dest: 'build/<%= meta.version %>/' },
                    {   expand: true, cwd: './src', src: ['plugins-config.js'], dest: 'build/<%= meta.version %>/' },
                    {   expand: true, cwd: './src', src: ['fatigo-plugin.js'], dest: 'build/<%= meta.version %>/' },
                    {   expand: true, cwd: './src', src: ['intact-plugin.js'], dest: 'build/<%= meta.version %>/' },
                    {   expand: true, cwd: './src', src: ['reactome-plugin.js'], dest: 'build/<%= meta.version %>/' },
                    {   expand: true, cwd: './<%= meta.jsorolla.dir %>', src: ['vendor/**'], dest: 'build/<%= meta.version %>/' },
                    {   expand: true, cwd: './<%= meta.jsorolla.dir %>', src: ['styles/**'], dest: 'build/<%= meta.version %>/' }, // includes files in path and its subdirs
                    {   expand: true, cwd: './<%= meta.jsorolla.networkviewer.dir %>', src: ['network-viewer*.js', 'nv-config.js'], dest: 'build/<%= meta.version %>/' },
                    {   expand: true, cwd: './<%= meta.jsorolla.opencga.dir %>', src: ['opencga*.js', 'worker*'], dest: 'build/<%= meta.version %>/' }
                ]
            }
        },
        clean: {
            build: ["build/<%= meta.version %>/"]
        },

        vendorPath: 'build/<%= meta.version %>/vendor',
        stylesPath: 'build/<%= meta.version %>/styles',
        htmlbuild: {
            build: {
                src: 'src/cell-maps.html',
                dest: 'build/<%= meta.version %>/',
                options: {
                    beautify: true,
                    scripts: {
                        'js': 'build/<%= meta.version %>/<%= meta.name %>-<%= meta.version %>.min.js',
                        'vendor': [
                            'build/<%= meta.version %>/vendor/underscore*.js',
                            'build/<%= meta.version %>/vendor/backbone*.js',
                            'build/<%= meta.version %>/vendor/rawdeflate*.js',
                            'build/<%= meta.version %>/vendor/rgbcolor.js',
                            'build/<%= meta.version %>/vendor/canvg.js',
                            'build/<%= meta.version %>/vendor/xml2json.js',
                            'build/<%= meta.version %>/vendor/jquery.min.js',

                            'build/<%= meta.version %>/vendor/bootstrap-*-dist/js/bootstrap.min.js',
                            'build/<%= meta.version %>/vendor/typeahead.min.js',
                            'build/<%= meta.version %>/vendor/jquery.qtip*.js',
                            'build/<%= meta.version %>/vendor/jquery.cookie*.js',
                            'build/<%= meta.version %>/vendor/jquery.sha1*.js',
                            'build/<%= meta.version %>/vendor/purl*.js',
                            'build/<%= meta.version %>/vendor/jquery.mousewheel*.js',
                            'build/<%= meta.version %>/vendor/gl-matrix-min*.js',
                            'build/<%= meta.version %>/vendor/ChemDoodleWeb*.js',
                            'build/<%= meta.version %>/vendor/jquery.simplecolorpicker.js'

                        ],
                        nv: [
                            'build/<%= meta.version %>/opencga*.min.js',
                            'build/<%= meta.version %>/network-viewer*.min.js'
                        ],
                        nvconfig: [
                            'build/<%= meta.version %>/nv-config.js'
                        ]
                    },
                    styles: {
                        'css': ['<%= stylesPath %>/css/style.css'],
                        'vendor': [
                            'build/<%= meta.version %>/vendor/jquery.qtip*.css',
                            'build/<%= meta.version %>/vendor/ChemDoodleWeb*.css',
                            'build/<%= meta.version %>/vendor/bootstrap-*-dist/css/bootstrap.min.css'
                        ]
                    }
                }
            }
        },
        'curl-dir': {

        },
        rename: {
            html: {
                files: [
                    {src: ['build/<%= meta.version %>/cell-maps.html'], dest: 'build/<%= meta.version %>/index.html'}
                ]
            }
        },
        hub: {
            all: {
                src: ['lib/jsorolla/Gruntfile.js'],
                tasks: ['opencga', 'nv']
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
        grunt.log.writeln("DEPLOY COMMAND: scp -r build/"+grunt.config.data.meta.version+" cafetero@mem16:/httpd/bioinfo/www-apps/cell-maps/");
    });

    // Default task.
    grunt.registerTask('default', ['clean', 'concat', 'uglify', 'hub:all', 'copy', 'htmlbuild', 'rename:html', 'log-deploy']);

};
