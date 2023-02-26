let currentId = 0;
const peerName = '';
let dataChannel = undefined

function generateAnswer() {
  const id = currentId;

  console.log('generateAnswer');
  
  document.getElementById('generateAnswer').disabled = true;

  peerConnection = createPeerConnection(() => {
    console.log('last candidate');
    textelement = document.getElementById('peerAnswer');
    answer = peerConnection.localDescription;
    textelement.value = JSON.stringify(answer);
  });

  peerConnection.ondatachannel = (event) => {
    console.log('ondatachannel');
    dataChannel = event.channel;
    connections[0].channels.data = dataChannel;
    dataChannel.onopen = datachannelopen;
    dataChannel.onmessage = function (message) { datachannelmessage("host", id, message); }
  };

  textelement = document.getElementById('offerData');
  textelement.readOnly = true;
  offer = JSON.parse(textelement.value);

  setRemotePromise = peerConnection.setRemoteDescription(offer);
  setRemotePromise.then(() => {
    console.log('setRemoteDescription success');

    createAnswerPromise = peerConnection.createAnswer();
    createAnswerPromise.then((answer) => {
      console.log('createAnswerDone');
      setLocalPromise = peerConnection.setLocalDescription(answer);
      setLocalPromise.then(() => {
        connections.push({
          id: currentId++,
          name: peerName,
          answer: textelement.value,
          connection: peerConnection,
          channels: {
            data: dataChannel
          }
        })

        console.log('setLocalDescription success');
      }, (reason) => {
        console.log('setLocalDescription failed', reason);
      });

      const answerWrapper = document.getElementById('answerWrapper');
      answerWrapper.hidden = !answerWrapper.hidden;
    }, (reason) => {
      console.log('createAnswerFailed', reason);
    });
  }, (reason) => {
    console.log('setRemoteDescription failed', reason);
  });
}
