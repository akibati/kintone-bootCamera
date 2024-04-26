(() => {
  'use strict';

  const cameraSize = { w: 320, h: 240 };
  const canvasSize = { w: 320, h: 240 };
  const resolution = { w: 1080, h: 720 };

  // レコード追加時表示イベント
  const eventsCreateShow = [
    'app.record.create.show',
    'mobile.app.record.create.show',
  ];
  kintone.events.on(eventsCreateShow, (event) => {
    let isMobile = false;
    if (event.type === 'mobile.app.record.create.show') {
      isMobile = true;
    }

    let video = showWebCamera();
    let canvas = makeCanvas(isMobile, video);

    if (!isMobile) {
      // kintone.app.record.setFieldShown('imgFile', false);
      kintone.app.record.getSpaceElement('videoPreview').appendChild(video);
      kintone.app.record.getSpaceElement('canvasPreview').appendChild(canvas);
    } else {
      // kintone.mobile.app.record.setFieldShown('imgFile', false);
      kintone.mobile.app.record
        .getSpaceElement('videoPreview')
        .appendChild(video);
      kintone.app.record.getSpaceElement('canvasPreview').appendChild(canvas);
    }
    event.record['fileId'].disabled = true;

    return event;
  });

  // レコード編集時表示イベント
  var eventsEditShow = ['app.record.edit.show', 'mobile.app.record.edit.show'];
  kintone.events.on(eventsEditShow, function (event) {
    let isMobile = false;
    if (event.type === 'mobile.app.record.edit.show') {
      isMobile = true;
    }
    let video = showWebCamera();
    let canvas = makeCanvas(isMobile, video);

    if (!isMobile) {
      kintone.app.record.getSpaceElement('videoPreview').appendChild(video);
      kintone.app.record.getSpaceElement('canvasPreview').appendChild(canvas);
    } else {
      kintone.mobile.app.record
        .getSpaceElement('videoPreview')
        .appendChild(video);
      kintone.app.record.getSpaceElement('canvasPreview').appendChild(canvas);
    }
    // event.record['imgFile'].disabled = true;
    event.record['fileId'].disabled = true;

    return event;
  });

  // レコード追加・編集後イベント
  var eventsEditSuccess = [
    'app.record.create.submit.success',
    'app.record.edit.submit.success',
    'mobile.app.record.create.submit.success',
    'mobile.app.record.edit.submit.success',
  ];
  kintone.events.on(eventsEditSuccess, function (event) {
    var json = {
      app: kintone.app.getId(),
      id: event.record['$id'].value,
      record: {
        imgFile: {
          value: [{ fileKey: event.record['fileId'].value }],
        },
      },
      __REQUEST_TOKEN__: kintone.getRequestToken(),
    };

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('PUT', kintone.api.url('/k/v1/record', true), false);
    xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify(json));
  });

  // レコード詳細表示時イベント
  var eventsDetailShow = [
    'app.record.detail.show',
    'mobile.app.record.detail.show',
  ];
  kintone.events.on(eventsDetailShow, function (event) {
    let isMobile = false;
    if (event.type === 'mobile.app.record.edit.show') {
      isMobile = true;
    }
    /*
    if (!isMobile) {
      kintone.app.record.setFieldShown('imgFile', false);
    } else {
      kintone.mobile.app.record.setFieldShown('imgFile', false);
    }
    */
  });

  // Webカメラ画像をvideoに表示
  function showWebCamera() {
    let video = document.createElement('video');
    video.id = 'video';
    video.width = cameraSize.w;
    video.height = cameraSize.h;
    video.autoplay = true;

    let media = navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          width: { ideal: resolution.w },
          height: { ideal: resolution.h },
        },
      })
      .then(function (stream) {
        video.srcObject = stream;
      });

    return video;
  }

  // 撮影用画像をcanvasに表示
  function makeCanvas(isMobile, video) {
    if (video == null) return;
    let canvasPreview = document.createElement('div');

    let takeButton = document.createElement('button');
    takeButton.id = 'takeButton';
    takeButton.innerText = ' 撮 影 ';
    takeButton.className = 'gaia-ui-actionmenu-save';
    takeButton.onclick = function () {
      let canvasCtx = canvas.getContext('2d');
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
      let blob = convertBlobImage(canvas);
      saveImage(isMobile, blob);
    };
    canvasPreview.appendChild(takeButton);
    canvasPreview.appendChild(document.createElement('br'));

    let canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;
    canvasPreview.appendChild(canvas);

    return canvasPreview;
  }

  // 画像をkintoneに保存
  function saveImage(isMobile, blob) {
    var record;
    if (isMobile) {
      record = kintone.mobile.app.record.get();
    } else {
      record = kintone.app.record.get();
    }

    // ファイルアップロード
    var key = '';
    var formData = new FormData();
    formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
    formData.append('file', blob, 'image.png');

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', kintone.api.url('/k/v1/file', true), false);
    xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xmlHttp.send(formData);
    if (xmlHttp.status === 200) {
      key = JSON.parse(xmlHttp.responseText).fileKey;
    }
    record.record['fileId'].value = key;

    if (isMobile) {
      kintone.mobile.app.record.set(record);
    } else {
      kintone.app.record.set(record);
    }
  }

  // canvas画像をblobデータに変換
  function convertBlobImage(canvas) {
    if (canvas == null) return;

    var base64 = canvas.toDataURL('image/jpeg');
    // Base64からバイナリへ変換
    var bin = atob(base64.replace(/^.*,/, ''));
    var buffer = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
      buffer[i] = bin.charCodeAt(i);
    }
    // Blobを作成
    var blob = new Blob([buffer.buffer], {
      type: 'image/png',
    });

    return blob;
  }
})();
