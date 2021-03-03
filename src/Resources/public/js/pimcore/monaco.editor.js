var phpProvideCompletionInitialised = false;
var javascriptProvideCompletionInitialised = false;
var cssProvideCompletionInitialised = false;
var twigProvideCompletionInitialised = false;


Ext.define('Hamari.monaco.Editor', {
    extend: 'Ext.Component',
    xtype: 'Hamari-monaco-editor',

    config: {
        content: null,
        filename: null,
        containerId: null,
        find: ''
    },

    initComponent: function() {
        var me = this;

        Ext.Loader.loadScript({
            url: '/bundles/hamaricodeeditor/js/monaco-0.22.3/min/vs/loader.js',
            scope: this,
            onLoad: function() {
                var containerReadyCheck = window.setInterval(function () {
                    var container = document.getElementById(me.getContainerId());

                    if (container) {
                        clearInterval(containerReadyCheck);

                        require.config({ paths: { 'vs': '/bundles/hamaricodeeditor/js/monaco-0.22.3/min/vs' }});
                        require(['vs/editor/editor.main'], function() {

                            var fileExtension = '.' + me.getFilename().substr(me.getFilename().lastIndexOf('.')+1,me.getFilename().length).toLowerCase();
                            var targetLanguage = 'plaintext';

                            monaco.languages.getLanguages().forEach(function (language) {
                                if (language.extensions.indexOf(fileExtension) != -1) {
                                    targetLanguage = language.id;
                                }
                            });

                            if (targetLanguage == 'plaintext') {
                                var otherLanguages = {
                                    ".editorconfig":"yaml",
                                    ".gitignore":"yaml",
                                    ".example":"yaml",
                                    ".lock":"json",
                                    ".yaml":"yaml",
                                    ".yml":"yaml"
                                }

                                if (typeof(otherLanguages[fileExtension]) !== 'undefined') {
                                    targetLanguage = otherLanguages[fileExtension];
                                }
                            }

                            me.editor = monaco.editor.create(container, {
                                value: me.getContent(),
                                language: targetLanguage,
                                automaticLayout: true,
                                autoIndent: true,
                                foldingStrategy: 'indentation'
                            });

                            container.querySelector('.monaco-container').parentElement.parentElement.remove();

                            if (me.getFind() != '') {
                                var model = me.editor.getModel();
                                var finds = model.findMatches(me.getFind(), false, false, false, false, 1);
                    
                                if (finds.length > 0) {
                                    var range = finds[0].range;
                                    me.editor.focus();
                                    me.editor.revealRangeNearTopIfOutsideViewport(range);
                                    me.editor.setSelection(range);
                                }
                            }

                            if (targetLanguage == 'php') {
                                if (phpProvideCompletionInitialised == false) {
                                    phpProvideCompletionInitialised = true;

                                    monaco.languages.registerCompletionItemProvider('php', {
                                        provideCompletionItems: function(model, position) {
                                            return {
                                                suggestions: [
                                                    {
                                                    "label": "class",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "class ${1:ClassName} ${2:extends ${3:AnotherClass}} ${4:implements ${5:Interface}}\n{\n\t$0\n}\n",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Class definition"
                                                    },
                                                    {
                                                    "label": "doc_class",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "/**\n * ${6:undocumented class}\n */\nclass ${1:ClassName} ${2:extends ${3:AnotherClass}} ${4:implements ${5:Interface}}\n{\n\t$0\n}\n",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Documented Class Declaration"
                                                    },
                                                    {
                                                    "label": "con",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "${1:public} function __construct(${2:${3:Type} $${4:var}${5: = ${6:null}}}) {\n\t\\$this->${4:var} = $${4:var};$0\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                                                    },
                                                    {
                                                    "label": "doc_v",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "/** @var ${1:Type} $${2:var} ${3:description} */\n${4:protected} $${2:var}${5: = ${6:null}};$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Documented Class Variable"
                                                    },
                                                    {
                                                    "label": "doc_f",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "/**\n * ${1:undocumented function summary}\n *\n * ${2:Undocumented function long description}\n *\n${3: * @param ${4:Type} $${5:var} ${6:Description}}\n${7: * @return ${8:type}}\n${9: * @throws ${10:conditon}}\n **/\n${11:public }function ${12:FunctionName}(${13:${14:${4:Type} }$${5:var}${15: = ${16:null}}})\n{\n\t${0:# code...}\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Documented function"
                                                    },
                                                    {
                                                    "label": "param",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "* @param ${1:Type} ${2:var} ${3:Description}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Paramater documentation"
                                                    },
                                                    {
                                                    "label": "fun",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "${1:public }function ${2:FunctionName}(${3:${4:${5:Type} }$${6:var}${7: = ${8:null}}})\n{\n\t${0:# code...}\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Function"
                                                    },
                                                    {
                                                    "label": "trait",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "/**\n * $1\n */\ntrait ${2:TraitName}\n{\n\t$0\n}\n",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Trait"
                                                    },
                                                    {
                                                    "label": "def",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "define('$1', ${2:'$3'});\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Definition"
                                                    },
                                                    {
                                                    "label": "do",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "do {\n\t${0:# code...}\n} while (${1:$${2:a} <= ${3:10}});",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Do-While loop"
                                                    },
                                                    {
                                                    "label": "while",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "while (${1:$${2:a} <= ${3:10}}) {\n\t${0:# code...}\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "While-loop"
                                                    },
                                                    {
                                                    "label": "if",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "if (${1:condition}) {\n\t${0:# code...}\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "If block"
                                                    },
                                                    {
                                                    "label": "ifelse",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "if (${1:condition}) {\n\t${2:# code...}\n} else {\n\t${3:# code...}\n}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "If Else block"
                                                    },
                                                    {
                                                    "label": "if?",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "$${1:retVal} = (${2:condition}) ? ${3:a} : ${4:b} ;",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Ternary conditional assignment"
                                                    },
                                                    {
                                                    "label": "else",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "else {\n\t${0:# code...}\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Else block"
                                                    },
                                                    {
                                                    "label": "elseif",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "elseif (${1:condition}) {\n\t${0:# code...}\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Elseif block"
                                                    },
                                                    {
                                                    "label": "for",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "for ($${1:i}=${2:0}; $${1:i} < $3; $${1:i}++) { \n\t${0:# code...}\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "For-loop"
                                                    },
                                                    {
                                                    "label": "foreach",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "foreach ($${1:variable} as $${2:key} ${3:=> $${4:value}}) {\n\t${0:# code...}\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Foreach loop"
                                                    },
                                                    {
                                                    "label": "array",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "$${1:arrayName} = array('$2' => $3${4:,} $0);",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Array initializer"
                                                    },
                                                    {
                                                    "label": "shorray",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "$${1:arrayName} = ['$2' => $3${4:,} $0];",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Array initializer"
                                                    },
                                                    {
                                                    "label": "keyval",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "'$1' => $2${3:,} $0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Key-Value initializer"
                                                    },
                                                    {
                                                    "label": "switch",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "switch (\\$${1:variable}) {\n\tcase '${2:value}':\n\t\t${3:# code...}\n\t\tbreak;\n\t$0\n\tdefault:\n\t\t${4:# code...}\n\t\tbreak;\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Switch block"
                                                    },
                                                    {
                                                    "label": "case",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "case '${1:value}':\n\t${0:# code...}\n\tbreak;",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Case Block"
                                                    },
                                                    {
                                                    "label": "this",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "\\$this->$0;",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "$this->..."
                                                    },
                                                    {
                                                    "label": "ethis",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "echo \\$this->$0;",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Echo this"
                                                    },
                                                    {
                                                    "label": "throw",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "throw new $1Exception(${2:\"${3:Error Processing Request}\"}${4:, ${5:1}});\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Throw exception"
                                                    },
                                                    {
                                                    "label": "#region",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "#region",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Folding Region Start"
                                                    },
                                                    {
                                                    "label": "#endregion",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "#endregion",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Folding Region End"
                                                    },
                                                    {
                                                    "label": "try",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "try {\n\t${1://code...}\n} catch (${2:\\Throwable} ${3:\\$th}) {\n\t${4://throw \\$th;}\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Try catch block"
                                                    },
                                                    {
                                                    "label": "GLOBALS",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "\\$GLOBALS[\"${1:key}\"]",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "$GLOBALS array"
                                                    },
                                                    {
                                                    "label": "_SERVER",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "\\$_SERVER[\"${1:key}\"]",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "$_SERVER array"
                                                    },
                                                    {
                                                    "label": "_REQUEST",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "\\$_REQUEST[\"${1:key}\"]",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "$_REQUEST array"
                                                    },
                                                    {
                                                    "label": "_POST",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "\\$_POST[\"${1:key}\"]",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "$_POST array"
                                                    },
                                                    {
                                                    "label": "_GET",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "\\$_GET[\"${1:key}\"]",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "$_GET array"
                                                    },
                                                    {
                                                    "label": "_FILES",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "\\$_FILES['${1:userfile}']['${2:key}']",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "$_FILES array"
                                                    },
                                                    {
                                                    "label": "_ENV",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "\\$_ENV[\"${1:key}\"]",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "$_ENV array"
                                                    },
                                                    {
                                                    "label": "_COOKIE",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "\\$_COOKIE[\"${1:key}\"]",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "$_COOKIE array"
                                                    },
                                                    {
                                                    "label": "_SESSION",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "\\$_SESSION[\"${1:key}\"]",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "$_SESSION array"
                                                    },
                                                    {
                                                    "label": "define",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "define(\"${1:CONSTANT}\", \"${2:value}\");",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "'define' call"
                                                    },
                                                    {
                                                    "label": "include",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "include ${1:__DIR__.}'${2:path_to_filename}';",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "'include' statement"
                                                    },
                                                    {
                                                    "label": "include_once",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "include_once ${1:__DIR__.}'${2:path_to_filename}';",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "'include_once' statement"
                                                    },
                                                    {
                                                    "label": "require",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "require ${1:__DIR__.}'${2:path_to_filename}';",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "'require' statement"
                                                    },
                                                    {
                                                    "label": "require_once",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "require_once ${1:__DIR__.}'${2:path_to_filename}';",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "'require_once' statement"
                                                    },
                                                    {
                                                    "label": "echo",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "echo \"${1:text}\";",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "'echo' statement"
                                                    },
                                                    {
                                                    "label": "print_r",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "print_r(\\$${1:variable});",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "'print_r' call"
                                                    },
                                                    {
                                                    "label": "var_dump",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "var_dump(\\$${1:variable});",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "'var_dump' call"
                                                    },
                                                    {
                                                    "label": "var_export",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "var_export(\\$${1:variable});",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "'var_export' call"
                                                    }
                                                ]
                                            };
                                        }
                                    });

                                    monaco.languages.setLanguageConfiguration('php', {
                                        indentationRules: {
                                            increaseIndentPattern: new RegExp("({(?!.*}).*|\\(|\\[|((else(\\s)?)?if|else|for(each)?|while|switch|case).*:)\\s*((/[/*].*|)?$|\\?>)"),
                                            decreaseIndentPattern: new RegExp("^(.*\\*\\/)?\\s*((\\})|(\\)+[;,])|(\\][;,])|\\b(else:)|\\b((end(if|for(each)?|while|switch));))")
                                        },
                                        folding: {
                                            markers: {
                                                start: new RegExp("^\\s*(#|\/\/)region\\b"),
                                                end: new RegExp("^\\s*(#|\/\/)endregion\\b")
                                            }
                                        }
                                    });
                                }
                            }

                            if (targetLanguage == 'javascript') {
                                if (javascriptProvideCompletionInitialised == false) {
                                    javascriptProvideCompletionInitialised = true;

                                    monaco.languages.registerCompletionItemProvider('javascript', {
                                        provideCompletionItems: function(model, position) {
                                            return {
                                                suggestions: [
                                                    {
                                                    "label": "define",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "define([\n\t'require',\n\t'${1:dependency}'\n], function(require, ${2:factory}) {\n\t'use strict';\n\t$0\n});",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "define module"
                                                    },
                                                    {
                                                    "label": "for",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "for (let ${1:index} = 0; ${1:index} < ${2:array}.length; ${1:index}++) {\n\tconst ${3:element} = ${2:array}[${1:index}];\n\t$0\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "For Loop"
                                                    },
                                                    {
                                                    "label": "foreach",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "${1:array}.forEach(${2:element} => {\n\t$0\n});",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "For-Each Loop"
                                                    },
                                                    {
                                                    "label": "forin",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "for (const ${1:key} in ${2:object}) {\n\tif (Object.hasOwnProperty.call(${2:object}, ${1:key})) {\n\t\tconst ${3:element} = ${2:object}[${1:key}];\n\t\t$0\n\t}\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "For-In Loop"
                                                    },
                                                    {
                                                    "label": "forof",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "for (const ${1:iterator} of ${2:object}) {\n\t$0\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "For-Of Loop"
                                                    },
                                                    {
                                                    "label": "function",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "function ${1:name}(${2:params}) {\n\t$0\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Function Statement"
                                                    },
                                                    {
                                                    "label": "if",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "if (${1:condition}) {\n\t$0\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "If Statement"
                                                    },
                                                    {
                                                    "label": "ifelse",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "if (${1:condition}) {\n\t$0\n} else {\n\t\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "If-Else Statement"
                                                    },
                                                    {
                                                    "label": "new",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "const ${1:name} = new ${2:type}(${3:arguments});$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "New Statement"
                                                    },
                                                    {
                                                    "label": "switch",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "switch (${1:key}) {\n\tcase ${2:value}:\n\t\t$0\n\t\tbreak;\n\n\tdefault:\n\t\tbreak;\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Switch Statement"
                                                    },
                                                    {
                                                    "label": "while",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "while (${1:condition}) {\n\t$0\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "While Statement"
                                                    },
                                                    {
                                                    "label": "dowhile",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "do {\n\t$0\n} while (${1:condition});",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Do-While Statement"
                                                    },
                                                    {
                                                    "label": "trycatch",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "try {\n\t$0\n} catch (${1:error}) {\n\t\n}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Try-Catch Statement"
                                                    },
                                                    {
                                                    "label": "settimeout",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "setTimeout(() => {\n\t$0\n}, ${1:timeout});",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Set Timeout Function"
                                                    },
                                                    {
                                                    "label": "setinterval",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "setInterval(() => {\n\t$0\n}, ${1:interval});",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Set Interval Function"
                                                    },
                                                    {
                                                    "label": "import statement",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "import { $0 } from \"${1:module}\";",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Import external module."
                                                    },
                                                    {
                                                    "label": "#region",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "//#region $0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Folding Region Start"
                                                    },
                                                    {
                                                    "label": "#endregion",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "//#endregion",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Folding Region End"
                                                    },
                                                    {
                                                    "label": "log",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "console.log($1);",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Log to the console"
                                                    },
                                                    {
                                                    "label": "warn",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "console.warn($1);",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Log warning to the console"
                                                    },
                                                    {
                                                    "label": "error",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "console.error($1);",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Log error to the console"
                                                    }
                                                ]
                                            };
                                        }
                                    });

                                    monaco.languages.setLanguageConfiguration('javascript', {
                                        indentationRules: {
                                            decreaseIndentPattern: /^((?!.*?\/\*).*\*\/)?\s*[\}\]].*$/,
                                            increaseIndentPattern: /^((?!\/\/).)*(\{[^}"'`]*|\([^)"'`]*|\[[^\]"'`]*)$/
                                        },
                                        folding: {
                                            markers: {
                                                start: new RegExp("^\\s*//\\s*#?region\\b"),
                                                end: new RegExp("^\\s*//\\s*#?endregion\\b")
                                            }
                                        }
                                    });
                                }
                            }

                            if (targetLanguage == 'css') {
                                if (cssProvideCompletionInitialised == false) {
                                    cssProvideCompletionInitialised = true;

                                    monaco.languages.setLanguageConfiguration('css', {
                                        indentationRules: {
                                            increaseIndentPattern: /(^.*\{[^}]*$)/,
                                            decreaseIndentPattern: /^\s*\}/
                                        }
                                    });
                                }
                            }

                            if (targetLanguage == 'twig') {
                                if (twigProvideCompletionInitialised == false) {
                                    twigProvideCompletionInitialised = true;

                                    monaco.languages.registerCompletionItemProvider('twig', {
                                        provideCompletionItems: function(model, position) {
                                            return {
                                                suggestions: [
                                                {
                                                    "label": "asset",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% set asset = ${1:entry.assetFieldHandle}.one() %}\n\n{% if asset %}\n\t<img src=\"{{ asset.getUrl(\"${2:thumb}\") }}\" width=\"{{ asset.getWidth(\"${2:thumb}\") }}\" height=\"{{ asset.getHeight(\"${2:thumb}\") }}\" alt=\"{{ asset.title }}\">\n{% endif %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "asset"
                                                },
                                                {
                                                    "label": "assets",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% for image in craft.assets.\n\t.sourceId(\"${1:1}\")\n\t.kind(\"${2:image}\")\n\t.limit(${3:10})\n}).all() %}\n\t<img src=\"{{ image.url${4:(\"${5:thumb}\")} }}\" width=\"${6:200}\" height=\"${7:200}\" alt=\"{{ image.title }}\">\n{% endfor %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.assets"
                                                },
                                                {
                                                    "label": "autoescape",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% autoescape \"${1:type}\" %}\n\t$0\n{% endautoescape %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "autoescape"
                                                },
                                                {
                                                    "label": "blockb",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% block ${1:name} %}\n\t$0\n{% endblock %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "block (block)"
                                                },
                                                {
                                                    "label": "block",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% block ${1:name} %}$0{% endblock %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "block"
                                                },
                                                {
                                                    "label": "blockf",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{{ block(\"${1:name}\") }}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "blockf"
                                                },
                                                {
                                                    "label": "cache",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% cache %}\n\t$1\n{% endcache %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "cache"
                                                },
                                                {
                                                    "label": "case",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% case \"${1:value}\" %}\n\t$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "case"
                                                },
                                                {
                                                    "label": "children",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% children %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "children"
                                                },
                                                {
                                                    "label": "ceil",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "ceil($1)$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "ceil"
                                                },
                                                {
                                                    "label": "formlogin",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "<form method=\"post\" accept-charset=\"UTF-8\">\n\t{{ csrfInput() }}\n\t<input type=\"hidden\" name=\"action\" value=\"users/login\">\n\n\t<h3><label for=\"loginName\">Username or email</label></h3>\n\t<input id=\"loginName\" type=\"text\" name=\"loginName\"\n\t\tvalue=\"{{ craft.app.user.rememberedUsername }}\">\n\n\t<h3><label for=\"password\">Password</label></h3>\n\t<input id=\"password\" type=\"password\" name=\"password\">\n\n\t<label>\n\t\t<input type=\"checkbox\" name=\"rememberMe\" value=\"1\">\n\t\tRemember me\n\t</label>\n\n\t<input type=\"submit\" value=\"Login\">\n\n\t{% if errorMessage is defined %}\n\t\t<p>{{ errorMessage }}</p>\n\t{% endif %}\n</form>\n\n<p><a href=\"{{ url(\"forgotpassword\") }}\">Forgot your password?</a></p>",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.user - example login form"
                                                },
                                                {
                                                    "label": "formuserprofile",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "<form method=\"post\" accept-charset=\"UTF-8\">\n\t{{ csrfInput() }}\n\t<input type=\"hidden\" name=\"action\" value=\"users/save-user\">\n\t{{ redirectInput(\"users/\"~currentUser.username) }}\n\t<input type=\"hidden\" name=\"userId\" value=\"{{ currentUser.id }}\">\n\n\t<label for=\"location\">Location</label>\n\t<input type=\"text\" id=\"location\" name=\"fields[location]\" value=\"{{ currentUser.location }}\">\n\n\t<label for=\"bio\">Bio</label>\n\t<textarea id=\"bio\" name=\"fields[bio]\">{{ currentUser.bio }}</textarea>\n\n\t<input type=\"submit\" value=\"Save Profile\">\n</form>",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.user - example user profile form"
                                                },
                                                {
                                                    "label": "formuserregistration",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "<form method=\"post\" accept-charset=\"UTF-8\">\n\t{{ csrfInput() }}\n\t<input type=\"hidden\" name=\"action\" value=\"users/save-user\">\n\t{{ redirectInput(\"\") }}\n\n\t{% macro errorList(errors) %}\n\t\t{% if errors %}\n\t\t\t<ul class=\"errors\">\n\t\t\t\t{% for error in errors %}\n\t\t\t\t\t<li>{{ error }}</li>\n\t\t\t\t{% endfor %}\n\t\t\t</ul>\n\t\t{% endif %}\n\t{% endmacro %}\n\n\t{% from _self import errorList %}\n\n\t<h3><label for=\"username\">Username</label></h3>\n\t<input id=\"username\" type=\"text\" name=\"username\"\n\t\t{%- if user is defined %} value=\"{{ user.username }}\"{% endif -%}>\n\n\t{% if user is defined %}\n\t\t{{ errorList(user.getErrors(\"username\")) }}\n\t{% endif %}\n\n\t<h3><label for=\"email\">Email</label></h3>\n\t<input id=\"email\" type=\"text\" name=\"email\"\n\t\t{%- if user is defined %} value=\"{{ user.email }}\"{% endif %}>\n\n\t{% if user is defined %}\n\t\t{{ errorList(user.getErrors(\"email\")) }}\n\t{% endif %}\n\n\t<h3><label for=\"password\">Password</label></h3>\n\t<input id=\"password\" type=\"password\" name=\"password\">\n\n\t{% if user is defined %}\n\t\t{{ errorList(user.getErrors(\"password\")) }}\n\t{% endif %}\n\n\t<input type=\"submit\" value=\"Register\">\n</form>",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.user - example user registration form"
                                                },
                                                {
                                                    "label": "formforgotpassword",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "<form method=\"post\" accept-charset=\"UTF-8\">\n\t{{ csrfInput() }}\n\t<input type=\"hidden\" name=\"action\" value=\"users/send-password-reset-email\">\n\t{{ redirectInput(\"\") }}\n\n\t<h3><label for=\"loginName\">Username or email</label></h3>\n\t<input id=\"loginName\" type=\"text\" name=\"loginName\"\n\t\tvalue=\"{% if loginName is defined %}{{ loginName }}{% else %}{{ craft.app.user.rememberedUsername }}{% endif %}\">\n\n\t{% if errors is defined %}\n\t\t<ul class=\"errors\">\n\t\t\t{% for error in errors %}\n\t\t\t\t<li>{{ error }}</li>\n\t\t\t{% endfor %}\n\t\t</ul>\n\t{% endif %}\n\n\t<input type=\"submit\" value=\"Submit\">\n</form>",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.user - example forgot password form"
                                                },
                                                {
                                                    "label": "formsetpassword",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "<form method=\"post\" accept-charset=\"UTF-8\">\n\t{{ csrfInput() }}\n\t<input type=\"hidden\" name=\"action\" value=\"users/set-password\">\n\t<input type=\"hidden\" name=\"code\" value=\"{{ code }}\">\n\t<input type=\"hidden\" name=\"id\" value=\"{{ id }}\">\n\n\t<h3><label for=\"newPassword\">New Password</label></h3>\n\t<input id=\"newPassword\" type=\"password\" name=\"newPassword\">\n\t{% if errors is defined %}\n\t\t<ul class=\"errors\">\n\t\t\t{% for error in errors %}\n\t\t\t\t<li>{{ error }}</li>\n\t\t\t{% endfor %}\n\t\t</ul>\n\t{% endif %}\n\n\t<input type=\"submit\" value=\"Submit\">\n</form>",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.user - example set password form"
                                                },
                                                {
                                                    "label": "formsearch",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "<form action=\"{{ url(\"search/results\") }}\">\n\t<input type=\"search\" name=\"q\" placeholder=\"Search\">\n\t<input type=\"submit\" value=\"Go\">\n</form>",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.entries - example search form"
                                                },
                                                {
                                                    "label": "formsearchresults",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "<h1>Search Results</h1>\n\n{% set query = craft.app.request.getParam(\"q\") %}\n{% set entries = craft.entries.search(query).orderBy(\"score\").all() %}\n\n{% if entries | length %}\n\t<p>{{ entries | length }} results:</p>\n\n\t<ul>\n\t\t{% for entry in entries %}\n\t\t\t<li><a href=\"{{ entry.url }}\">{{ entry.title }}</a></li>\n\t\t{% endfor %}\n\t</ul>\n{% else %}\n\t<p>Your search for “{{ query }}” didn’t return any results.</p>\n{% endif %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.entries - example search results"
                                                },
                                                {
                                                    "label": "rss",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "<?xml version=\"1.0\"?>\n<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n\t<channel>\n\t\t<title>{{ siteName }}</title>\n\t\t<link>{{ siteUrl }}</link>\n\t\t<atom:link href=\"{{ craft.app.request.absoluteUrl }}\" rel=\"self\" type=\"application/rss+xml\" />\n\t\t<description>{{ globals.siteDescription }}</description>\n\t\t<language>en-us</language>\n\t\t<pubDate>{{ now | rss }}</pubDate>\n\t\t<lastBuildDate>{{ now | rss }}</lastBuildDate>\n\n\t\t{% for entry in craft.entries.all() %}\n\t\t\t<item>\n\t\t\t\t<title>{{ entry.title }}</title>\n\t\t\t\t<link>{{ entry.url }}</link>\n\t\t\t\t<pubDate>{{ entry.postDate | rss }}</pubDate>\n\t\t\t\t<author>{{ entry.author }}</author>\n\t\t\t\t<guid>{{ entry.url }}</guid>\n\t\t\t\t<description><![CDATA[\n\t\t\t\t\t{{ entry.body }}\n\t\t\t\t]]></description>\n\t\t\t</item>\n\t\t{% endfor %}\n\t</channel>\n</rss>",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.entries - example rss feed"
                                                },
                                                {
                                                    "label": "assetso",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% set assets = craft.assets({\n\tsourceId: \"${1:1}\",\n\tkind: \"${2:image}\",\n\tlimit: ${3:10}\n}).all() %}\n\n{% for image in assets %}\n\t<img src=\"{{ image.url${4:(\"${5:thumb}\")} }}\" width=\"${6:200}\" height=\"${7:200}\" alt=\"{{ image.title }}\">\n{% endfor %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.assets - object syntax"
                                                },
                                                {
                                                    "label": "categorieso",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% set categories = craft.categories({\n\tgroup: \"${1:categoryGroupHandle}\",\n\tlimit: \"${2:11}\"\n}).all() %}\n\n<ul>\n\t{% nav category in categories %}\n\t\t<li>\n\t\t\t<a href=\"{{ category.url }}\">{{ category.title }}</a>\n\t\t\t{% ifchildren %}\n\t\t\t\t<ul>\n\t\t\t\t\t{% children %}\n\t\t\t\t</ul>\n\t\t\t{% endifchildren %}\n\t\t</li>\n\t{% endnav %}\n</ul>",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.categories - object syntax"
                                                },
                                                {
                                                    "label": "categories",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "<ul>\n\t{% nav category in craft.categories\n\t\t.group(\"${1:categoryGroupHandle}\")\n\t\t.limit(${2:11})\n\t\t.all()\n\t%}\n\t\t<li>\n\t\t\t<a href=\"{{ category.url }}\">{{ category.title }}</a>\n\t\t\t{% ifchildren %}\n\t\t\t\t<ul>\n\t\t\t\t\t{% children %}\n\t\t\t\t</ul>\n\t\t\t{% endifchildren %}\n\t\t</li>\n\t{% endnav %}\n</ul>",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.categories"
                                                },
                                                {
                                                    "label": "entrieso",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% set entries = craft.entries({\n\tsection: \"${1:sectionName}\",\n\tlimit: \"${2:10}\"\n}).all() %}\n\n{% for entry in entries %}\n\t<a href=\"{{ entry.url }}\">{{ entry.title }}</a>\n{% endfor %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.entries - object syntax"
                                                },
                                                {
                                                    "label": "entries",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% for entry in craft.entries\n\t.section(\"${1:sectionName}\")\n\t.limit(${2:10})\n\t.all()\n%}\n\t<a href=\"{{ entry.url }}\">{{ entry.title }}</a>\n{% endfor %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.entries"
                                                },
                                                {
                                                    "label": "feed",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% set feedUrl = \"${1:http://feeds.feedburner.com/blogandtonic}\" %}\n{% set limit = ${2:10} %}\n{% set items = craft.feeds.getFeedItems(feedUrl, limit).all() %}\n\n{% for item in items %}\n\t<article>\n\t\t<h3><a href=\"{{ item.permalink }}\">{{ item.title }}</a></h3>\n\t\t<p class=\"author\">{{ item.authors[0].name }}</p>\n\t\t<p class=\"date\">{{ item.date }}</p>\n\n\t\t{{ item.summary }}\n\t</article>\n{% endfor %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "feed"
                                                },
                                                {
                                                    "label": "t",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{{ $1 | t }}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "translate with | t"
                                                },
                                                {
                                                    "label": "replace",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{{ ${1:$TM_SELECTED_TEXT} | replace(\"search\", \"replace\") }}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "replace with | replace(\"search\", \"replace\")"
                                                },
                                                {
                                                    "label": "replacex",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{{ ${1:$TM_SELECTED_TEXT} | replace(\"/(search)/i\", \"replace\") }}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "replace regex with | replace(\"/(search)/i\", \"replace\")"
                                                },
                                                {
                                                    "label": "split",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{{ ${1:$TM_SELECTED_TEXT} | split(\"\\n\") }}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "split on | split (\"\\n\")"
                                                },
                                                {
                                                    "label": "tagso",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% set tags = craft.tags({\n\tgroup: \"${1:tagGroupHandle}\"\n}).all() %}\n\n<ul>\n\t{% for tag in tags %}\n\t\t<li>{{ tag }}</a></li>\n\t{% endfor %}\n</ul>\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.tags - object syntax"
                                                },
                                                {
                                                    "label": "tags",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "<ul>\n\t{% for tag in craft.tags.group(\"${1:tagGroupHandle}\").all() %}\n\t\t<li>{{ tag }}</li>\n\t{% endfor %}\n</ul>\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.tags"
                                                },
                                                {
                                                    "label": "userso",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% set users = craft.users({\n\tgroup: \"${1:userGroupHandle}\"\n}).all() %}\n\n{% for user in users %}\n\t{{ user.firstName }} {{ user.lastName }}\n{% endfor %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.users - object syntax"
                                                },
                                                {
                                                    "label": "users",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% for user in craft.users.group(\"${1:userGroupHandle}\").all() %}\n\t{{ user.firstName }} {{ user.lastName }}\n{% endfor %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "craft.users"
                                                },
                                                {
                                                    "label": "csrf",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{{ csrfInput() }}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "csrf"
                                                },
                                                {
                                                    "label": "dd",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "<pre>\n\t{{ dump($1) }}\n</pre>\n{% exit %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "dump and die"
                                                },
                                                {
                                                    "label": "do",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% do $1 %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "do"
                                                },
                                                {
                                                    "label": "dojs",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% do view.registerJsFile \"${1:url}\" %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "do js"
                                                },
                                                {
                                                    "label": "docss",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% do view.registerCssFile \"${1:url}\" %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "do css"
                                                },
                                                {
                                                    "label": "dump",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "<pre>\n\t{{ dump($1) }}\n</pre>",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "dump"
                                                },
                                                {
                                                    "label": "else",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% else %}\n\t$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "else"
                                                },
                                                {
                                                    "label": "embed",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% embed \"${1:template}\" %}\n\t$0\n{% endembed %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "embed"
                                                },
                                                {
                                                    "label": "endautoescape",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endautoescape %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endautoescape"
                                                },
                                                {
                                                    "label": "endblock",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endblock %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endblock"
                                                },
                                                {
                                                    "label": "endcache",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endcache %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endcache"
                                                },
                                                {
                                                    "label": "endembed",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endembed %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endembed"
                                                },
                                                {
                                                    "label": "endfilter",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endfilter %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endfilter"
                                                },
                                                {
                                                    "label": "endfor",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endfor %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endfor"
                                                },
                                                {
                                                    "label": "endif",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endif %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endif"
                                                },
                                                {
                                                    "label": "endifchildren",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endifchildren %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endifchildren"
                                                },
                                                {
                                                    "label": "endcss",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endcss %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endcss"
                                                },
                                                {
                                                    "label": "endjs",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endjs %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endjs"
                                                },
                                                {
                                                    "label": "endmacro",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endmacro %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endmacro"
                                                },
                                                {
                                                    "label": "endnav",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endnav %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endnav"
                                                },
                                                {
                                                    "label": "endset",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endset %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endset"
                                                },
                                                {
                                                    "label": "endspaceless",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endspaceless %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endspaceless"
                                                },
                                                {
                                                    "label": "endswitch",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endswitch %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endswitch"
                                                },
                                                {
                                                    "label": "endtrans",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endtrans %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endtrans"
                                                },
                                                {
                                                    "label": "endverbatim",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% endverbatim %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endverbatim"
                                                },
                                                {
                                                    "label": "exit",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% exit ${1:404} %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "exit"
                                                },
                                                {
                                                    "label": "extends",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% extends \"${1:template}\" %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "extends"
                                                },
                                                {
                                                    "label": "filterb",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% filter ${1:name} %}\n\t$0\n{% endfilter %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "filter (block)"
                                                },
                                                {
                                                    "label": "filter",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% filter ${1:name} %}$0{% endfilter %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "filter"
                                                },
                                                {
                                                    "label": "floor",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "floor($1)$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "floor"
                                                },
                                                {
                                                    "label": "fore",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% for ${1:item} in ${2:items} %}\n\t$3\n{% else %}\n\t$0\n{% endfor %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "for ... else"
                                                },
                                                {
                                                    "label": "for",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% for ${1:item} in ${2:items} %}\n\t$0\n{% endfor %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "for"
                                                },
                                                {
                                                    "label": "from",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% from \"${1:template}\" import \"${2:macro}\" %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "from"
                                                },
                                                {
                                                    "label": "endbody",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{{ endBody() }}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "endBody"
                                                },
                                                {
                                                    "label": "head",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{{ head() }}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "head"
                                                },
                                                {
                                                    "label": "ifb",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% if ${1:condition} %}\n\t$0\n{% endif %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "if (block)"
                                                },
                                                {
                                                    "label": "ife",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% if ${1:condition} %}\n\t$2\n{% else %}\n\t$0\n{% endif %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "if ... else"
                                                },
                                                {
                                                    "label": "if",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% if ${1:condition} %}\n\t$0\n{% endif %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "if"
                                                },
                                                {
                                                    "label": "ifchildren",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% ifchildren %}\n\t$1\n{% endifchildren %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "ifchildren"
                                                },
                                                {
                                                    "label": "import",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% import \"${1:template}\" as ${2:name} %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "import"
                                                },
                                                {
                                                    "label": "importself",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% import _self as ${1:name} %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "importself"
                                                },
                                                {
                                                    "label": "inckv",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% include \"${1:template}\" with {\n\t${2:key}: ${3:\"${4:value}\"}\n} %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "include w/ key/value"
                                                },
                                                {
                                                    "label": "include",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% include \"${1:template}\" %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "include"
                                                },
                                                {
                                                    "label": "inc",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% include \"${1:template}\" %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "inc"
                                                },
                                                {
                                                    "label": "incp",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% include \"${1:template}\"${2: with ${3:params} }%}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "include w/ params"
                                                },
                                                {
                                                    "label": "css",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% do view.registerCssFile(\"${1:/resources/css/global.css}\") %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "registerCssFile"
                                                },
                                                {
                                                    "label": "js",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% js %}\n\t$1\n{% endjs %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "js"
                                                },
                                                {
                                                    "label": "js",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% do view.registerJsFile(\"${1:/resources/js/global.js}\") %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "registerJsFile"
                                                },
                                                {
                                                    "label": "css",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% css %}\n\t$1\n{% endcss %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "css"
                                                },
                                                {
                                                    "label": "macro",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% macro ${1:name}(${2:params}) %}\n\t$0\n{% endmacro %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "macro"
                                                },
                                                {
                                                    "label": "matrix",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% for block in ${1:entry.matrixFieldHandle}.all() %}\n\n\t{% if block.type == \"${2:blockHandle}\" %}\n\t\t{{ block.${3:fieldHandle} }}\n\t{% endif %}\n\n\t{% if block.type == \"${4:blockHandle}\" %}\n\t\t{{ block.${5:fieldHandle} }}\n\t{% endif %}\n\n{% endfor %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "matrix"
                                                },
                                                {
                                                    "label": "matrixif",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% for block in ${1:entry.matrixFieldHandle}.all() %}\n\n\t{% if block.type == \"${2:blockHandle}\" %}\n\t\t{{ block.${3:fieldHandle} }}\n\t{% endif %}\n\n\t{% if block.type == \"${4:blockHandle}\" %}\n\t\t{{ block.${5:fieldHandle} }}\n\t{% endif %}\n\n{% endfor %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "matrixif"
                                                },
                                                {
                                                    "label": "matrixifelse",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% for block in ${1:entry.matrixFieldHandle}.all() %}\n\n\t{% if block.type == \"${2:blockHandle}\" %}\n\n\t\t{{ block.${3:fieldHandle} }}\n\n\t{% elseif block.type == \"${4:blockHandle}\" %}\n\n\t\t$0\n\t\n\t{% endif %}\n\n{% endfor %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "matrixifelse"
                                                },
                                                {
                                                    "label": "matrixswitch",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% for block in ${1:entry.matrixFieldHandle}.all() %}\n\n\t{% switch block.type %}\n\n\t\t{% case \"${2:blockHandle}\" %}\n\n\t\t\t{{ block.${3:fieldHandle} }}\n\n\t\t{% case \"${4:blockHandle}\" %}\n\n\t\t\t$0\n\n\t{% endswitch %}\n\n{% endfor %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "matrixswitch"
                                                },
                                                {
                                                    "label": "max",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "max(${1:$2, $3})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "max"
                                                },
                                                {
                                                    "label": "min",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "min(${1:$2, $3})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "min"
                                                },
                                                {
                                                    "label": "nav",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% nav ${1:item} in ${2:items} %}\n\t$3\n{% endnav %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "nav"
                                                },
                                                {
                                                    "label": "paginate",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% paginate ${1:elements} as ${2:pageInfo}, ${3:pageEntries} %}\n\n{% for item in ${3:pageEntries} %}\n\t$0\n{% endfor %}\n\n{% if ${2:pageInfo}.prevUrl %}<a href=\"{{ ${2:pageInfo}.prevUrl }}\">Previous Page</a>{% endif %}\n{% if ${2:pageInfo}.nextUrl %}<a href=\"{{ ${2:pageInfo}.nextUrl }}\">Next Page</a>{% endif %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "paginate simple"
                                                },
                                                {
                                                    "label": "paginate",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{# PAGINATION\n\t\t\nFor this pagination to work properly, we need to be sure to set\nthe paginateBase variable in the template we are including the \npagination in.\n\n{% set paginateBase = \"/blog/p\" %}\n#}\n\n{% if pageInfo.totalPages > 1 %}\n<ul>\n\t{% if pageInfo.currentPage != \"1\" %}\n\t\t<li><a href=\"{{ paginateBase ~ \"1\" }}\">First Page</a></li>\n\t{% endif %}\n\n\t{% if pageInfo.prevUrl %}\n\t\t<li><a href=\"{{ pageInfo.prevUrl }}\">Previous Page</a></li>\n\t{% endif %}\n\n\t{% for pageNumber in 1..pageInfo.totalPages %}\n\t\t<li {% if pageInfo.currentPage == pageNumber %}class=\"active-page\"{% endif %}>\n\t\t\t<a href=\"{{ paginateBase ~ pageNumber }}\">{{ pageNumber }}</a>\n\t\t</li>\n\t{% endfor %}\n\n\t{% if pageInfo.nextUrl %}\n\t\t<li><a href=\"{{ pageInfo.nextUrl }}\">Next Page</a></li>\n\t{% endif %}\n\n\t{% if pageInfo.currentPage != pageInfo.total %}\n\t\t<li><a href=\"{{ paginateBase ~ pageInfo.total }}\">Last Page</a></li>\n\t{% endif %}\n</ul>\n{% endif %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "paginate advanced"
                                                },
                                                {
                                                    "label": "redirect",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% redirect \"${1:template/path or http://straightupcraft.com}\" %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "redirect"
                                                },
                                                {
                                                    "label": "getparam",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "craft.app.request.getParam(${1:\"Query String or Post Variable Name\"})\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "request getParam"
                                                },
                                                {
                                                    "label": "getbodyparam",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "craft.app.request.getBodyParam(${1:\"postVariableName\"})\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "request getBodyParam"
                                                },
                                                {
                                                    "label": "getqueryparam",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "craft.app.request.getQueryParam(${1:\"queryStringName\"})\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "request getQueryParam"
                                                },
                                                {
                                                    "label": "getsegment",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "craft.app.request.getSegment(${1:2})\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "request getSegment"
                                                },
                                                {
                                                    "label": "requirelogin",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% requireLogin %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "requireLogin"
                                                },
                                                {
                                                    "label": "requirepermission",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% requirePermission \"${1:spendTheNight}\" %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "requirePermission"
                                                },
                                                {
                                                    "label": "round",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{{ $1 | round(1, 'floor') }}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "round"
                                                },
                                                {
                                                    "label": "setb",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% set ${1:var} %}\n\t$0\n{% endset %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "set (block)"
                                                },
                                                {
                                                    "label": "set",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% set ${1:var} = ${2:value} %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "set"
                                                },
                                                {
                                                    "label": "shuffle",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "shuffle($1)$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "shuffle"
                                                },
                                                {
                                                    "label": "random",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "random($1)$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "random"
                                                },
                                                {
                                                    "label": "spaceless",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% spaceless %}\n\t$0\n{% endspaceless %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "spaceless"
                                                },
                                                {
                                                    "label": "switch",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% switch ${1:variable} %}\n\n\t{% case \"${2:value1}\" %}\n\t\n\n\t{% case \"${3:value2}\" %}\n\t\n\n\t{% default %}\n\t\n\n{% endswitch %}\n$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "switch"
                                                },
                                                {
                                                    "label": "trans",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% trans %}$0{% endtrans %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "trans"
                                                },
                                                {
                                                    "label": "urla",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "url(\"${1:path}\", ${2:{foo:\"1\", bar:\"2\"\\}}, ${3:\"http\"}, ${4:false})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "url w/ arguments"
                                                },
                                                {
                                                    "label": "url",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "url(\"${1:path}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "url"
                                                },
                                                {
                                                    "label": "use",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% use \"${1:template}\" %}$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "use"
                                                },
                                                {
                                                    "label": "verbatim",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% verbatim %}\n\t$0\n{% endverbatim %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "verbatim"
                                                },
                                                {
                                                    "label": "getData",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getData()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Value of the Editable Item, this is useful to get the value even in editmode."
                                                },
                                                {
                                                    "label": "isEmpty",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "isEmpty()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Whether the editable is empty or not"
                                                },
                                                {
                                                    "label": "getCount",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getCount()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the total amount of iterations."
                                                },
                                                {
                                                    "label": "getCurrent",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getCurrent()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the current index while looping."
                                                },
                                                {
                                                    "label": "current",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "current()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the current index while looping."
                                                },
                                                {
                                                    "label": "getElements",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getElements()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Return a array for every loop to access the defined children."
                                                },
                                                {
                                                    "label": "isChecked",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "isChecked()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get status of the checkbox."
                                                },
                                                {
                                                    "label": "getFullPath",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getFullPath()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the full path of the assigned element."
                                                },
                                                {
                                                    "label": "pimcore input: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_input(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Input Editable"
                                                },
                                                {
                                                    "label": "pimcore input: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_input(\"${1:name}\", {\n\t\"width\": ${2:value},\n\t\"htmlspecialchars\": ${3:value},\n\t\"nowrap\": ${4:value},\n\t\"placeholder\": \"${5:value}\",\n\t\"required\": ${6:value}\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Input Editable"
                                                },
                                                {
                                                    "label": "pimcore block",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% for i in pimcore_iterate_block(pimcore_block(\"${1:name}\")) %}\n\t$0\n{% endfor %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Block Editable"
                                                },
                                                {
                                                    "label": "pimcore checkbox: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_checkbox(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Checkbox Editable"
                                                },
                                                {
                                                    "label": "pimcore checkbox: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_checkbox(\"${1:name}\", {\n\t\"reload\": ${2:value},\n\t\"label\": \"${3:value}\"\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Checkbox Editable"
                                                },
                                                {
                                                    "label": "pimcore date",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_date(\"${1:name}\", {\n\t\"format\": \"d.m.Y\",\n\t\"outputFormat\": \"%d.%m.%Y\"\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Date Editable"
                                                },
                                                {
                                                    "label": "pimcore relation M2O: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_relation(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Relation Editable"
                                                },
                                                {
                                                    "label": "pimcore relation M2O: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_relation(\"${1:name}\",{\n\t\"types\": [\"${2:value}\",\"${3:value}\"],\n\t\"subtypes\": {\n\t\t\"asset\": [\"${4:value}\", \"${5:value}\"],\n\t\t\"object\": [\"${6:value}\"],\n\t},\n\t\"classes\": [\"${7:value}\"],\n\t\"reload\": ${8:value},\n\t\"uploadPath\": \"${9:value}\",\n\t\"width\": ${10:value}\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Relation Editable"
                                                },
                                                {
                                                    "label": "pimcore relations M2M: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_relations(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Relation Editable"
                                                },
                                                {
                                                    "label": "pimcore relations M2M: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_relations(\"${1:name}\",{\n\t\"types\": [\"${2:value}\",\"${3:value}\"],\n\t\"subtypes\": {\n\t\t\"asset\": [\"${4:value}\", \"${5:value}\"],\n\t\t\"object\": [\"${6:value}\"],\n\t},\n\t\"classes\": [\"${7:value}\"],\n\t\"reload\": ${8:value},\n\t\"uploadPath\": \"${9:value}\",\n\t\"disableInlineUpload\": ${10:value},\n\t\"width\": ${11:value},\n\t\"height\": ${12:value},\n\t\"title\": \"${13:value}\"\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Relations Editable"
                                                },
                                                {
                                                    "label": "getThumbnail",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getThumbnail()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the full path of the assigned element."
                                                },
                                                {
                                                    "label": "getAlt",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getAlt()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the full path of the assigned element."
                                                },
                                                {
                                                    "label": "getSrc",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getSrc()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the full path of the assigned element."
                                                },
                                                {
                                                    "label": "getImage",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getImage()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the full path of the assigned element."
                                                },
                                                {
                                                    "label": "getHotspots",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getHotspots()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the full path of the assigned element."
                                                },
                                                {
                                                    "label": "getMarker",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getMarker()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the full path of the assigned element."
                                                },
                                                {
                                                    "label": "pimcore image: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_image(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Image Editable"
                                                },
                                                {
                                                    "label": "pimcore image: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_image(\"${1:name}\", {\n\t\"title\": \"${2:value}\",\n\t\"width\": ${3:value},\n\t\"height\": ${4:value},\n\t\"thumbnail\": {\n\t\t\"width\": ${5:value},\n\t\t\"height\": ${6:value},\n\t\t\"interlace\": ${7:value},\n\t\t\"quality\": ${8:value}\n\t},\n\t\"highResolution\": ${9:value}\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Image Editable"
                                                },
                                                {
                                                    "label": "pimcore link: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_link(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Link Editable"
                                                },
                                                {
                                                    "label": "pimcore link: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_link(\"${1:name}\", {\n\t\"reload\": ${2:value},\n\t\"noText\": ${3:value},\n\t\"textPrefix\": \"${4:value}\",\n\t\"textSuffix\": \"${5:value}\"\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Link Editable"
                                                },
                                                {
                                                    "label": "getHref",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getHref()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the path of this link"
                                                },
                                                {
                                                    "label": "getText",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getText()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the text of the link"
                                                },
                                                {
                                                    "label": "getTarget",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getTarget()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the target of the link"
                                                },
                                                {
                                                    "label": "getParameters",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getParameters()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the query params of the link"
                                                },
                                                {
                                                    "label": "getAnchor",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getAnchor()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the anchor text of the link"
                                                },
                                                {
                                                    "label": "getTitle",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getTitle()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the title of the link/video"
                                                },
                                                {
                                                    "label": "getRel",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getRel()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the rel text of the link"
                                                },
                                                {
                                                    "label": "getTabindex",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getTabindex()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the tabindex of the link"
                                                },
                                                {
                                                    "label": "getClass",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getClass()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the class of the link"
                                                },
                                                {
                                                    "label": "getAccessKey",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getAccessKey()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the access key of the link"
                                                },
                                                {
                                                    "label": "pimcore multi-select: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_multiselect(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Multiselect Editable"
                                                },
                                                {
                                                    "label": "pimcore multi-select: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_multiselect(\"${1:name}\", {\n\t\"store\": [\n\t\t[\"${2:value}\", \"${3:value}\"],\n\t\t[\"${4:value}\", \"${5:value}\"]\n\t],\n\t\"width\": ${6:value},\n\t\"height\": ${7:value}\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Multiselect Editable"
                                                },
                                                {
                                                    "label": "pimcore numeric: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_numeric(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Numeric Editable"
                                                },
                                                {
                                                    "label": "pimcore numeric: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_numeric(\"${1:name}\", {\n\t\"maxValue\": ${2:value},\n\t\"minValue\": ${3:value},\n\t\"decimalPrecision\": ${4:value},\n\t\"width\": ${5:value},\n\t\"required\": ${6:value}\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Numeric Editable"
                                                },
                                                {
                                                    "label": "pimcore embed: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_embed(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Embed Editable"
                                                },
                                                {
                                                    "label": "pimcore embed: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_embed(\"${1:name}\", {\n\t\"width\": ${2:value},\n\t\"height\": ${3:value}\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Embed Editable"
                                                },
                                                {
                                                    "label": "pimcore pdf: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_pdf(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore PDF Editable"
                                                },
                                                {
                                                    "label": "pimcore pdf: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_pdf(\"${1:name}\", {\n\t\"thumbnail\": \"${2:value}\",\n\t\"uploadPath\": \"${3:value}\"\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore PDF Editable"
                                                },
                                                {
                                                    "label": "pimcore renderlet: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_renderlet(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Renderlet Editable"
                                                },
                                                {
                                                    "label": "pimcore renderlet: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_renderlet(\"${1:name}\", {\n\t\"controller\": \"${2:value}\",\n\t\"action\": \"${3:value}\",\n\t\"className\": \"${4:value}\",\n\t\"bundle\": \"${5:value}\",\n\t\"template\": \"${6:value}\",\n\t\"reload\": ${7:value},\n\t\"title\": \"${8:value}\",\n\t\"type\": \"${9:value}\",\n\t\"height\": ${10:value},\n\t\"width\": ${11:value}\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Renderlet Editable"
                                                },
                                                {
                                                    "label": "pimcore select: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_select(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Select Editable"
                                                },
                                                {
                                                    "label": "pimcore select: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_select(\"${1:name}\", {\n\t\"store\": [\n\t\t[\"${2:value}\", \"${3:value}\"],\n\t\t[\"${4:value}\", \"${5:value}\"]\n\t],\n\t\"width\": ${6:value},\n\t\"defaultValue\": ${7:value},\n\t\"reload\": ${8:value}\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Select Editable"
                                                },
                                                {
                                                    "label": "pimcore snippet: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_snippet(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Snippet Editable"
                                                },
                                                {
                                                    "label": "pimcore snippet: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_snippet(\"${1:name}\", {\n\t\"defaultHeight\": ${2:value},\n\t\"height\": ${3:value},\n\t\"width\": ${4:value},\n\t\"title\": \"${5:value}\",\n\t\"cache\": ${6:value},\n\t\"reload\": ${7:value}\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Snippet Editable"
                                                },
                                                {
                                                    "label": "getId",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getId()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "ID of the assigned snippet"
                                                },
                                                {
                                                    "label": "getSnippet",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getSnippet()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "The assigned snippet object"
                                                },
                                                {
                                                    "label": "pimcore table: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_table(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Table Editable"
                                                },
                                                {
                                                    "label": "pimcore table: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_table(\"${1:name}\", {\n\t\"width\": ${2:value},\n\t\"height\": ${3:value},\n\t\"defaults\": {\n\t\t\"cols\": ${4:value},\n\t\t\"rows\": ${5:value},\n\t\t\"data\": [\n\t\t\t[\"${6:value}\", \"${7:value}\"],\n\t\t\t[\"${8:value}\", \"${9:value}\"],\n\t\t\t[\"${10:value}\", \"${11:value}\"],\n\t\t\t[\"${12:value}\", \"${13:value}\"]\n\t\t]\n\t}\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Table Editable"
                                                },
                                                {
                                                    "label": "pimcore textarea: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_textarea(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Textarea Editable"
                                                },
                                                {
                                                    "label": "pimcore textarea: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_textarea(\"${1:name}\",{\n\t\"nl2br\": ${2:value},\n\t\"htmlspecialchars\": ${3:value}\n\t\"height\": ${4:value},\n\t\"width\": ${5:value},\n\t\"placeholder\": \"${6:value}\",\n\t\"required\": ${7:value}\n}) $0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Textarea Editable"
                                                },
                                                {
                                                    "label": "pimcore video: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_video(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Video Editable"
                                                },
                                                {
                                                    "label": "pimcore video: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_video(\"${1:name}\", {\n\t\"width\": ${2:value},\n\t\"height\": ${3:value},\n\t\"youtube\": {\n\t\t\"autoplay\": true,\n\t\t\"modestbranding\": true\n\t},\n\t\"vimeo\": {\n\t\t\"autoplay\": true,\n\t\t\"loop\": true\n\t},\n\t\"thumbnail\": \"${4:value}\",\n\t\"imagethumbnail\": \"${5:value}\",\n\t\"disableProgressReload\": ${6:value},\n\t\"editmodeImagePreview\": ${7:value}\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Video Editable"
                                                },
                                                {
                                                    "label": "getImageThumbnail",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getImageThumbnail(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get a specific image thumbnail of the video, or a thumbnail of the poster image (if assigned)"
                                                },
                                                {
                                                    "label": "getPosterAsset",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getPosterAsset()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Returns the assigned poster image asset"
                                                },
                                                {
                                                    "label": "getVideoAsset",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getVideoAsset()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Returns the video asset object if assigned, otherwise null"
                                                },
                                                {
                                                    "label": "getVideoType",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getVideoType()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "This is to check which video type is assigned"
                                                },
                                                {
                                                    "label": "getDescription",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "getDescription()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Description of the video"
                                                },
                                                {
                                                    "label": "pimcore wysiwyg: short",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_wysiwyg(\"${1:name}\")$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore WYSIWYG Editable"
                                                },
                                                {
                                                    "label": "pimcore wysiwyg: extra",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "pimcore_wysiwyg(\"${1:name}\", {\n\t\"height\": ${2:value},\n\t\"height\": ${3:value},\n\t\"required\": ${4:value},\n\t\"enterMode\": ${5:value},\n\t\"customConfig\": \"${6:value}\"\n\t\"toolbarGroups\": [\n\t\t{\n\t\t\t\"${7:name}\": \"${8:value}\",\n\t\t\t\"groups\": [ \"${9:value}\", \"${10:value}\", \"${11:value}\"]\n\t\t}\n\t]\n})$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore WYSIWYG Editable"
                                                },
                                                {
                                                    "label": "frontend",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "frontend()$0",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Get the parsed value of the wysiwyg"
                                                },
                                                {
                                                    "label": "pimcore scheduled block",
                                                    "kind": monaco.languages.CompletionItemKind.Snippet,
                                                    "insertText": "{% for i in pimcore_iterate_block(pimcore_scheduledblock(\"${1:name}\")) %}\n\t$0\n{% endfor %}",
                                                    "insertTextRules": monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                                    "documentation": "Pimcore Scheduled Block Editable"
                                                }
                                            ]
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }, 5);
            }
        });

    }
});