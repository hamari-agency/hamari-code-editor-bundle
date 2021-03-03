<?php

namespace HamariCodeEditorBundle;

use Pimcore\Extension\Bundle\AbstractPimcoreBundle;

class HamariCodeEditorBundle extends AbstractPimcoreBundle
{
    public function getJsPaths()
    {
        return [
            '/bundles/hamaricodeeditor/js/pimcore/startup.js',
            '/bundles/hamaricodeeditor/js/pimcore/monaco.editor.js',
            '/bundles/hamaricodeeditor/js/pimcore/file.js',
            '/bundles/hamaricodeeditor/js/pimcore/explorer.js'
        ];
    }
}