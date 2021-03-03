pimcore.registerNS("pimcore.plugin.HamariCodeEditorBundle");

pimcore.plugin.HamariCodeEditorBundle = Class.create(pimcore.plugin.admin, {
    getClassName: function () {
        return "pimcore.plugin.HamariCodeEditorBundle";
    },

    initialize: function () {
        pimcore.plugin.broker.registerPlugin(this);
    },

    pimcoreReady: function (params, broker) {
        // alert("HamariCodeEditorBundle ready!");
    },

    postOpenDocument: function (document, type) {
        
        var user = pimcore.globalmanager.get('user');

        if (user.isAllowed('Edit Code')) {
            if ((type == 'page') || (type == 'printcontainer') || (type == 'printpage')) {

                var controller = document.data.controller;
                controller = controller.split('\\');
                controller = controller[controller.length-1];
                controller = controller.replace('Controller', '');

                var action = document.data.action;

                document.toolbar.add({
                    xtype: 'splitbutton',
                    tooltip: t("Edit Code"),
                    iconCls: "pimcore_nav_icon_tag",
                    handler: function() {
                        console.log(document);
                    }.bind(this),
                    menu:[{
                        text: t("Edit Action"),
                        itemId: 'codeEditAction',
                        iconCls: "pimcore_nav_icon_tag",
                        handler: function() {

                            try {
                                var explorer = pimcore.globalmanager.get("fileexplorer");
                                explorer.activate();
                            }
                            catch (e) {
                                var explorer = new pimcore.settings.fileexplorer.explorer();
                                pimcore.globalmanager.add("fileexplorer", explorer);
                            }

                            var controllerPath = '';
                            controller = controller.charAt(0).toUpperCase() + controller.slice(1);
                            controllerPath = '/fileexplorer/src/AppBundle/Controller/'+controller+'Controller.php';
                            
                            var controllerAltPath = '';
                            controller = controller.toLowerCase();
                            controllerAltPath = '/fileexplorer/src/AppBundle/Controller/'+controller+'Controller.php';

                            var searchTerm = 'public function '+action+'Action';

                            explorer.openFile(controllerPath, searchTerm, controllerAltPath);

                        }.bind(this)
                    },{
                        text: t("Edit Template"),
                        itemId: 'codeEditTemplate',
                        iconCls: "pimcore_nav_icon_tag",
                        handler: function() {

                            try {
                                var explorer = pimcore.globalmanager.get("fileexplorer");
                                explorer.activate();
                            }
                            catch (e) {
                                var explorer = new pimcore.settings.fileexplorer.explorer();
                                pimcore.globalmanager.add("fileexplorer", explorer);
                            }

                            var template = document.data.template;
                            var templatePath = '';
                            var templateAltPath = '';
                            if ((template == null) || (template == '')) {
                                controller = controller.toLowerCase();
                                templatePath = '/fileexplorer/app/Resources/views/'+controller+'/'+action+'.html.twig';
                                
                                controller = controller.charAt(0).toUpperCase() + controller.slice(1);
                                templateAltPath = '/fileexplorer/app/Resources/views/'+controller+'/'+action+'.html.twig';
                            }
                            else{
                                templatePath = '/fileexplorer/app/Resources/views/'+template;
                            }

                            explorer.openFile(templatePath, '', templateAltPath);

                        }.bind(this)
                    }]
                });

                pimcore.layout.refresh();

            }
        }
    }
});

var HamariCodeEditorBundlePlugin = new pimcore.plugin.HamariCodeEditorBundle();
