/* eslint-disable require-jsdoc */
$(function() {
  // Peer object
  const peer = new Peer({
    key:   window.__SKYWAY_KEY__,
    debug: 3,
  });


  let localStream;

  peer.on('open', () => {
    $('#my-id').text(peer.id);
  });

  // Receiving a call
  peer.on('call', call => {
    // Answer the call automatically (instead of prompting user) for demo purposes
    call.answer(localStream);
  });

  peer.on('error', err => {
    alert(err.message);
  });

  const videoSelect = $('#videoSource');
  const selectors = [videoSelect];
  navigator.mediaDevices.enumerateDevices().then(deviceInfos => {
      console.log(deviceInfos)
      const values = selectors.map(select => select.val() || '');
      selectors.forEach(select => {
        const children = select.children(':first');
        while (children.length) {
          select.remove(children);
        }
      });

      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = $('<option>').val(deviceInfo.deviceId);

        if (deviceInfo.kind === 'audioinput') {
        } else if (deviceInfo.kind === 'videoinput') {
          option.text(deviceInfo.label ||
            'Camera ' + (videoSelect.children().length + 1));
          videoSelect.append(option);
        }
      }

      selectors.forEach((select, selectorIndex) => {
        if (Array.prototype.slice.call(select.children()).some(n => {
          return n.value === values[selectorIndex];
        })) {
          select.val(values[selectorIndex]);
        }
      });
    });

  // Click handlers setup
  $('#broadcast').on('submit', e => {
    const videoSource = $('#videoSource').val();
    e.preventDefault();
    navigator.mediaDevices.getUserMedia({audio: true, video: { deviceId: videoSource?{exact: videoSource}:undefined, width: 335, height: 667}}).then(stream => {
      $('#video').get(0).srcObject = stream;
      localStream = stream;
    }).catch(err => {
      $('#step1-error').show();
      console.error(err);
    });
  });

  $('#watch').on('submit', e => {
    e.preventDefault();
    // Initiate a call!
    console.log($('#callto-id').val());
    const call = peer.call($('#callto-id').val());

    // Wait for stream on the call, then set peer video display
    call.on('stream', stream => {
      const el = $('#video').get(0);
      el.srcObject = stream;
      el.play();
    });

    call.on('close', () => {
      console.log('connection closed');
    });
  });
});
