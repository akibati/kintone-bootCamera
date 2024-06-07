const Kuc = require('kintone-ui-component');

(() => {
  'use strict';

  // レコード追加時表示イベント
  const eventsCreateShow = ['app.record.create.show', 'app.record.edit.show'];
  kintone.events.on(eventsCreateShow, (event) => {
    const spFile = kintone.app.record.getSpaceElement('imageFile');
    const spPreview = kintone.app.record.getSpaceElement('imagePreview');

    let inputFile = new Kuc.Attachment({
      id: 'imageFile',
      label: '添付ファイル',
    });

    let preview = document.createElement('div');
    preview.id = 'preview';

    inputFile.onchange = () => {
      if (inputFile.files.length >= 1) {
        // fileIdセット
        let blob = new Blob(inputFile.files, { type: inputFile.type });
        saveImage(blob);

        // 画像プレビュー
        let fileReader = new FileReader();
        let img = document.createElement('img');

        // 既にプレビューしている画像を削除
        Array.from(spPreview.querySelectorAll('img')).map((node) =>
          node.removeAttribute('src', null)
        );

        fileReader.onload = (e) => {
          img.setAttribute('src', fileReader.result);
          img.setAttribute('id', 'imgPreview');
          img.setAttribute('width', 220);
          img.setAttribute(
            'height',
            fileReader.result.height * (img.width / fileReader.result.width)
          );
          preview.appendChild(img);
        };
        fileReader.readAsDataURL(inputFile.files[0]);
      }
    };

    spFile.appendChild(inputFile);
    spPreview.appendChild(preview);

    event.record['fileId'].disabled = true;

    return event;
  });

  // レコード追加・編集後イベント
  var eventsEditSuccess = [
    'app.record.create.submit.success',
    'app.record.edit.submit.success',
  ];
  kintone.events.on(eventsEditSuccess, (event) => {
    let json = {
      app: kintone.app.getId(),
      id: event.record['$id'].value,
      record: {
        imgFile: {
          value: [{ fileKey: event.record['fileId'].value }],
        },
      },
      __REQUEST_TOKEN__: kintone.getRequestToken(),
    };

    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open('PUT', kintone.api.url('/k/v1/record', true), false);
    xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify(json));
  });

  // 画像をkintoneに保存
  function saveImage(blob) {
    let record = kintone.app.record.get();

    // ファイルアップロード
    let key = '';
    let formData = new FormData();
    formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
    formData.append('file', blob, 'image.png');

    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', kintone.api.url('/k/v1/file', true), false);
    xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xmlHttp.send(formData);
    if (xmlHttp.status === 200) {
      key = JSON.parse(xmlHttp.responseText).fileKey;
    }
    record.record['fileId'].value = key;

    kintone.app.record.set(record);
  }
})();
