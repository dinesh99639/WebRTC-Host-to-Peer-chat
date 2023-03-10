let currentId = 0;

function generateOffer() {
  console.log('generateOffer');
  
  const id = currentId;

  peerConnection = createPeerConnection(() => {
    console.log('Last candidate');
    offer = peerConnection.localDescription;
    document.getElementById('offerData').value = JSON.stringify(offer);
  });

  dataChannel = peerConnection.createDataChannel('chat');
  dataChannel.onopen = datachannelopen;
  dataChannel.onmessage = function (message) { datachannelmessage("peer", id, message); }

  createOfferPromise = peerConnection.createOffer();
  createOfferPromise.then((offer) => {
    console.log('createOffer success');

    setLocalPromise = peerConnection.setLocalDescription(offer);
    setLocalPromise.then(() => {
      console.log('setLocalDescription success');
    }, (reason) => {
      console.log('setLocalDescription Failed', reason);
    });
  }, (reason) => {
    console.log('createOffer failed', reason);
  });
}

const rerenderExistingConnections = () => {
  let rows = [];

  connections.forEach((connection, idx) => {
    rows.push(`
      <div style="margin: 5px 0;">
        <input style="width: 40%" value='${connection.name}' />
        <input style="width: 40%" value='${connection.answer}' />
        <button style="padding: 0 5.5px;" onclick="removePeer(${idx})">❌</button>
      </div>
    `)
  })

  document.getElementById('existingPeers').innerHTML = rows.join('')
}

const removePeer = (idx) => {
  console.log("Remove:", idx)
  connections = [
    ...connections.slice(0, idx),
    ...connections.slice(idx + 1)
  ]

  rerenderExistingConnections();
}

function addPeer(peerName) {
  console.log('addPeer');

  textelement = document.getElementById('peerAnswer');

  answer = JSON.parse(textelement.value);
  setRemotePromise = peerConnection.setRemoteDescription(answer);
  setRemotePromise.then(() => {
    connections.push({
      id: currentId++,
      name: peerName,
      answer: textelement.value,
      connection: peerConnection,
      channels: {
        data: dataChannel
      }
    })

    console.log("peerIdentity", peerConnection.peerIdentity)

    document.getElementById('offerData').value = '';
    document.getElementById('peerName').value = '';
    document.getElementById('peerAnswer').value = '';
    document.getElementById('addNewPeerButton').hidden = false;
    document.getElementById('addNewPeerInputs').hidden = true;
    document.getElementById('addNewPeerInputs').placeholder = "";

    rerenderExistingConnections();

    console.log('setRemoteDescription success');
  }, (reason) => {
    console.log('setRemoteDescription failed', reason);
  });
}
