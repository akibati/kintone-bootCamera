(async (PLUGIN_ID) => {
  'use strict';

  // エスケープ処理
  const escapeHtml = (htmlstr) => {
    return htmlstr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '&#xA;');
  };

  //設定画面のフォーム情報を取得
  const imgFile_filedCode_FormData =
    document.getElementById('imgFile-fieldCode');
  const imgFile_spaceId_FormData = document.getElementById('imgFile-spaceId');
  const imgPreview_spaceId_FormData =
    document.getElementById('imgPreview-spaceId');
  const fileId_filedCode_FormData = document.getElementById('fileId-fieldCode');

  // プラグイン設定情報を取得
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);

  // プラグインの設定情報に値があれば初期値として表示
  imgFile_filedCode_FormData.value = config.imgFile_filedCode || '';
  imgFile_spaceId_FormData.value = config.imgFile_spaceId || '';
  imgPreview_spaceId_FormData.value = config.imgPreview_spaceId || '';
  fileId_filedCode_FormData.value = config.fileId_filedCode || '';

  const appId = kintone.app.getId();

  // 保存
  const saveButton = document.getElementById('submit');
  saveButton.addEventListener('click', () => {
    const imgFile_filedCode = escapeHtml(imgFile_filedCode_FormData.value);
    const imgFile_spaceId = escapeHtml(imgFile_spaceId_FormData.value);
    const imgPreview_spaceId = escapeHtml(imgPreview_spaceId_FormData.value);
    const fileId_filedCode = escapeHtml(fileId_filedCode_FormData.value);

    if (
      imgFile_filedCode === '' ||
      imgFile_spaceId === '' ||
      imgPreview_spaceId === '' ||
      fileId_filedCode === ''
    ) {
      alert('必須項目が入力されていません');
      return;
    }

    //設定の保存
    const newConfig = {
      imgFile_filedCode,
      imgFile_spaceId,
      imgPreview_spaceId,
      fileId_filedCode,
    };
    kintone.plugin.app.setConfig(newConfig, () => {
      window.location.href = `/k/admin/app/flow?app=${appId}`;
    });
  });

  // キャンセル
  const cancelButton = document.getElementById('cancel');
  cancelButton.addEventListener('click', () => {
    window.location.href = `/k/admin/app/${appId}/plugin/`;
  });
})(kintone.$PLUGIN_ID);
