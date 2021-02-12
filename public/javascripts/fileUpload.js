FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginFileValidateSize,
    FilePondPluginFileMetadata,
    FilePondPluginFilePoster
)

FilePond.setOptions({
    /* stylePanelAspectRatio: 150 / 200, */
    imageResizeTargetWidth: 200,
    imageResizeTargetHeight: 150
})

FilePond.parse(document.body);