var connections = [];

function createPeerConnection(lasticecandidate) {
  configuration = { iceServers: [{ urls: "stun:stun.voipbuster.com" }] };

  try {
    peerConnection = new RTCPeerConnection(configuration);
  } catch (err) {
    addMessageToChat("", undefined, 'error: ' + err);
  }
  peerConnection.onicecandidate = (event) => {
    console.log("event", event)
    if (event.candidate != null) {
      console.log('new ice candidate');
    } else {
      console.log('all ice candidates');
      lasticecandidate();
    }
  };
  peerConnection.onconnectionstatechange = (event) => {
    console.log('handleconnectionstatechange', event);
  };
  peerConnection.oniceconnectionstatechange = (event) => {
    console.log('ice connection state: ' + event.target.iceConnectionState);
  };

  return peerConnection;
}

function datachannelopen() {
  console.log('datachannelopen');
  addMessageToChat("", undefined, 'Connection successful');
  document.getElementById('chatInput').disabled = false;
  document.getElementById('sendMessageButton').disabled = false;
}

function getSenderName(fromType, idx) {
  if (fromType === "host") return "Host";
  else if (fromType === "self") return "You"
  else if (fromType === "peer") return connections?.[idx]?.name ?? '';
  else return "";
}

function addMessageToChat(fromType, idx, msg) {
  const sender = getSenderName(fromType, idx)
  chatelement = document.getElementById('chatHistory');
  newchatentry = document.createElement("p");
  newchatentry.textContent = `${sender}: ${msg}`
  chatelement.appendChild(newchatentry);
  chatelement.scrollTop = chatelement.scrollHeight
}

function datachannelmessage(fromType, idx, message) {
  console.log('datachannelmessage', fromType, idx, message);
  text = message.data;
  addMessageToChat(fromType, idx, text);
}

function handleSendMessage() {
  console.log('handleSendMessage');
  textelement = document.getElementById('chatInput');
  text = textelement.value
  connections.forEach((connection) => {
    connection.channels.data.send(text);
    console.log("dataChannel", connection.channels.data)
  })
  addMessageToChat("self", undefined, text);
  textelement.value = '';
}

const copyInputText = (id) => {
  var copyText = document.getElementById(id);

  copyText.select();
  copyText.setSelectionRange(0, 99999);

  navigator.clipboard.writeText(copyText.value);
}
