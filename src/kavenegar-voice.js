const JoinStatus = {
    SUCCESS: 'success',
    SDK_VERSION_NOT_SUPPORTED: 'sdk_version_not_supported',
    ACCESS_DENIED: 'access_denied',
    INVALID_CALL: 'invalid_call',
    CALL_SESSION_FINISHED: 'call_session_finished',
    FAILED_TO_CONNECT: 'failed_to_connect',
    UNKNOWN_ERROR: 'unknown_error'
};
const CallStatus = {
    NEW: 'new',
    TRYING: 'trying',
    RINGING: 'ringing',
    ACCEPTED: 'accepted',
    CONVERSATION: 'conversation',
    PAUSED: 'paused',
    FINISHED: 'finished',
    FLUSHED: 'flushed'
};

const CallDirection = {
    INBOUND: 'inbound',
    OUTBOUND: 'outbound'
};
const CallFinishedReason = {
    HANGUP: 'hangup',
    UNREACHABLE: 'unreachable',
    MISSED: 'missed',
    REJECTED: 'rejected',
    KILLED: 'killed',
    CALL_RECEIVED: 'call_received',
    MEDIA_CONNECTION_BROKEN: 'media_connection_broken',
    MESSAGING_CONNECTION_BROKEN: 'messaging_connection_broken',
    BUSY: 'busy',
    CALL_DURATION_EXCEEDED: 'call_duration_exceeded',
    UNKNOWN: 'unknown'
};

const EndpointRole = {
    CALLER: 'caller', RECEPTOR: 'receptor'
};

const Environment = {
    TEST: 'wss://messaging.dev.kavenegar.io/v1',
    DEVELOPMENT: 'ws://192.168.1.188:8080/v1',
    PRODUCTION: 'wss://messaging.kavenegar.io/v1'
};

const MediaState = {
    CONNECTED: 'connected', DISCONNECTED: 'disconnected'
};

const MessagingStatus = {
    INITIALIZED: 'initialized',
    DISCONNECTED: 'disconnected', // connection closed ( not manually )
    TERMINATED: 'terminated', // connection terminated manually
    CONNECTED: 'connected', // CONNECTED to messaging server
    JOINED: 'joined', // CONNECTED to messaging server and authorized successfully
    FAILED: 'failed' // FAILED to connect or authorize to messaging server
};


const StatMetric = {
    AUDIO_INBOUD_BYTES_RECEIVED: 'AUDIO_INBOUD_BYTES_RECEIVED',
    AUDIO_INBOUND_CODEC: 'AUDIO_INBOUND_CODEC',
    AUDIO_INBOUD_JITTER: 'AUDIO_INBOUD_JITTER',
    AUDIO_INBOUD_PACKETS_LOST: 'AUDIO_INBOUD_PACKETS_LOST',
    AUDIO_INBOUD_PACKETS_RECEIVED: 'AUDIO_INBOUD_PACKETS_RECEIVED',
    AUDIO_OUTBOUND_BYTES_SENT: 'AUDIO_OUTBOUND_BYTES_SENT',
    AUDIO_OUTBOUND_PACKETS_SENT: 'AUDIO_OUTBOUND_PACKETS_SENT',
    AUDIO_OUTBOUND_CODEC: 'AUDIO_OUTBOUND_CODEC'
}


const LogLevel = {
    VERBOSE: 2,
    DEBUG: 3,
    INFO: 4,
    WARN: 5,
    ERROR: 6,
    ASSERT: 7,

    toString(level) {
        for (const prop in LogLevel) {
            if (LogLevel[prop] === level) return prop;
        }
        return null;
    }
};


function Queue() {
    var queue = [];
    var offset = 0;

    this.getLength = function () {
        return (queue.length - offset);
    };

    this.isEmpty = function () {
        return (queue.length === 0);
    };

    this.enqueue = function (item) {
        queue.push(item);
    };


    this.remove = function () {
        var packet = this.dequeue();
    };
    this.dequeue = function () {
        if (queue.length === 0) return undefined;
        var item = queue[offset];
        if (++offset * 2 >= queue.length) {
            queue = queue.slice(offset);
            offset = 0;
        }
        return item;

    };
    this.peek = function () {
        return (queue.length > 0 ? queue[offset] : undefined);
    };


    this.clear = function () {
        queue = [];
    };


    this.toString = function () {
        return JSON.stringify(queue);
    }

}

class KavenegarCall {

    constructor(environment) {
        this.className = this.constructor.name;
        this.environment = environment;
        this.calls = [];

    }

    initCall(params, callback) {
        if (this.getCallById(params.callId) != null) {
            callback("error", "duplicate_call_id");
            return;
        }

        const self = this;

        if (params.logger === undefined || params.logger === null) params.logger = new Logger(LogLevel.INFO);

        const call = new Call(params.callId, params.logger, params.localStream, params.remoteElement, this.environment);


        call.intervalId = setInterval(() => {
            if (call.status === CallStatus.FLUSHED) {
                clearInterval(call.intervalId);
                this.close(call);
            } else {
                call.run.bind(call).call(null);
            }
        }, 10);


        call.messaging.start(call.id, params.accessToken, (joinResponse) => {
            if (joinResponse.result !== JoinStatus.SUCCESS) {
                callback(joinResponse.result, null);
                return;
            }
            call.caller = joinResponse.caller;
            call.receptor = joinResponse.receptor;
            call.direction = joinResponse.direction;
            if (joinResponse.features["metrics"] != null) {
                call.features.push(new MetricFeature(joinResponse.features["metrics"]));
            }
            callback(joinResponse.result, call);

            self.calls.push(call);
        });
    };

    close(call) {
        var indexOf = this.calls.indexOf(call);
        if (indexOf < 0) {
            return;
        }
        this.calls.splice(indexOf, 1);
    }

    getCallById(callId) {
        for (let i = 0; i < this.calls.length; i++) {
            const call = this.calls[i];
            if (call.id === callId) return call;
        }
        return null;
    };

    getActiveCall() {
        for (let i = 0; i < this.calls.length; i++) {
            const call = this.calls[i];
            if (call.status !== CallStatus.FINISHED) return call;
        }
        return null;
    }

}


class Packet {
    constructor(action) {
        this.action = action;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class JoinRequest extends Packet {
    constructor(callId, accessToken, sdkVersion) {
        super("join");
        this.apiToken = accessToken;
        this.sdkVersion = sdkVersion;
        this.deviceName = 'Desktop';
        this.deviceCPU = 'x64';
        this.osVersion = 11;
        this.callId = callId;
        this.supportedABI = "any";
    }
}


class JoinResponse extends Packet {

    constructor(result, call) {
        super("join.response");
        if (call === undefined) call = null;
        this.result = result;
        this.call = call;
    }
}


class CallResponse extends Packet {
    constructor(callId, status) {
        super("call.response");
        this.status = status;
    }
}

class AckRequest extends Packet {

    constructor(id) {
        super("ack");
        this.id = id;
    }
}

class OfferRequest extends Packet {
    constructor(callId, sdp) {
        super("offer");
        this.sdp = sdp;
    }
}

class ByeRequest extends Packet {
    constructor(callId, reason) {
        super("bye");
        this.reason = reason;
    }
}

class IceCandidateRequest extends Packet {
    constructor(callId, candidate) {
        super("call.ice_candidate");
        this.candidate = candidate;
    }
}

class PingRequest extends Packet {
    constructor(id) {
        super("ping");
        this.id = id;
    }
}

class MetricsRequest extends Packet {
    constructor(callId, stats) {
        super("metrics");
        this.callId = callId;
        this.values = stats;
    }
}

class EventRequest extends Packet {
    constructor(callId, name,payload) {
        super("event");
        this.callId = callId;
        this.name = name;
        this.payload = payload;
        this.createdAt = new Date().toISOString();
    }
}

class PongRequest extends Packet {
    constructor(id) {
        super("pong");
        this.id = id;
    }
}


class KavenegarMedia {


    constructor(logger) {
        this.className = "media";
        this.logger = logger;
        this.connection = null;
        this.onStateChanged = null;
        this.onIceGatheringStateChanged = null;
        this.onIceConnectionStateChanged = null;
        this.onSignalingStateChanged = null;
        this.onPeerConnectionStateChanged = null;

        this.offerOptions = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 0,
            voiceActivityDetection: false
        };
    }


    hasUserMedia() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia);
    };

    start(stream) {

        const configuration = {
            iceServers: [{"urls": "stun:stun.1.google.com:19302"}],
            rtcpMuxPolicy: "require",
            iceTransportPolicy: "all"
        };

        const connection = new RTCPeerConnection(configuration);
        this.connection = connection;
        this.stream = stream;


        this.logger.info(this.className, "RTCPeerConnection object was created");

        stream.getTracks().forEach(track => connection.addTrack(track, stream));

        connection.onaddstream = function (e) {
            var audioElement = document.createElement("audio");
            audioElement.srcObject = e.stream;
            audioElement.play();
        };


        connection.onicecandidate = (event) => {
            if (event.candidate) {
                this.logger.info(this.className, "ice candidate found", JSON.stringify(event));
            }
        };
    };


    get status() {
        return {
            "iceGatheringState": this.connection.iceGatheringState,
            "iceConnectionState": this.connection.iceConnectionState,
            "signalingState": this.connection.signalingState
        };
    };

    get stats() {
        var result = new Promise((resolve, reject) => {
            if(this.connection == null) reject(null);
            this.connection.getStats(null).then(stats => {
                var metrics = [];
                stats.forEach(report => {
                    if (report.type === 'inbound-rtp' || report.type === 'outbound-rtp') metrics.push(report)
                });

                var inboundMetrics = metrics[0];
                var outboundMetrics = metrics[1];

                var inboundCodecId = inboundMetrics.codecId;
                var outboundCodecId = inboundMetrics.codecId;

                var json = {
                    timestamp: parseInt(inboundMetrics.timestamp / 1000),
                    audioInbound: {
                        bytesReceived: inboundMetrics.bytesReceived,
                        jitter: inboundMetrics.jitter,
                        packetsLost: inboundMetrics.packetsLost,
                        packetsReceived: inboundMetrics.packetsReceived,
                        headerBytesReceived: inboundMetrics.headerBytesReceived,
                        codec: stats.get(inboundCodecId).mimeType
                    },
                    audioOutbound: {
                        packetsSent: outboundMetrics.packetsSent,
                        bytesSent: outboundMetrics.bytesSent,
                        headerBytesSent: outboundMetrics.headerBytesSent,
                        codec: stats.get(outboundCodecId).mimeType
                    }
                }
                resolve(json);
            }).catch(error => {
                reject(error);
            });
        });

        return result;
    }

    makeOffer(callback) {
        this.connection.onicegatheringstatechange = (state) => {
            if (this.onIceGatheringStateChanged) this.onIceGatheringStateChanged(this.connection.iceGatheringState);
            this.logger.info(this.className, "onicegatheringstatechange", this.connection.iceGatheringState);
            if (this.connection.iceGatheringState === "complete") {
                callback(this.connection.localDescription);
            }
        };
        this.connection.oniceconnectionstatechange = (state) => {
            if (this.onIceConnectionStateChanged) this.onIceConnectionStateChanged(this.connection.iceConnectionState);
            this.logger.info(this.className, "oniceconnectionstatechange", this.connection.iceConnectionState);
        };

        this.connection.onsignalingstatechange = (state) => {
            if (this.onSignalingStateChanged) this.onSignalingStateChanged(this.connection.signalingState);
            this.logger.info(this.className, "onsignalingstatechange", this.connection.signalingState);
        };

        this.connection.onconnectionstatechange = (state) => {
            if (this.onPeerConnectionStateChanged) this.onPeerConnectionStateChanged(this.connection.connectionState);
        };

        this.connection.createOffer(this.offerOptions).then((offer) => {
            this.logger.info(this.className, "offer created" + offer.toString());
            this.connection.setLocalDescription(offer);
        }, (error) => {
            this.logger.error(this.className, "error in createOffer ", error);
        });
    };

    setAnswer(answerSdp) {
        var answer = new RTCSessionDescription({type: "answer", sdp: answerSdp});
        this.connection.setRemoteDescription(answer).then(() => {
            this.logger.info(this.className, "set answer was success");
        }).catch(reason => {
            this.logger.error(this.className, "set answer has error", reason);
        });
    };

    addIceCandidate(candidate) {
        try {
            this.connection.addIceCandidate(new RTCIceCandidate({
                candidate: candidate.candidate,
                sdpMLineIndex: candidate.sdpLineIndex,
                sdpMid: candidate.sdpMin
            })).catch(reason => {
                this.logger.error(this.className, "Error in addIceCandidate", reason);
            });
        } catch (e) {
            this.logger.error(this.className, "Error in addIceCandidate", e);
        }
    };

    dispose() {
        let tracks = this.stream.getTracks();

        tracks.forEach(function (track) {
            track.stop();
        });

        this.connection.close();
    };

}

class KavenegarMessaging {


    constructor(environment, call, logger) {
        this.className = "messaging";
        this.session = null;
        this.queue = new Queue();
        this._status = MessagingStatus.INITIALIZED;
        this.call = call;
        this.loginResponseListener = null;
        this.reconnectTry = 0;
        this.accessToken = "";
        this.environment = environment;
        this.logger = logger;
        this.closeTry = 0;
        this.lastHearbeatTime = new Date();
        this.lastPongPacket = false;
        this.onStatusChanged = function (status) {
        };
    }


    check() {
        if (this.session == null || this.status === MessagingStatus.TERMINATED || this.status === MessagingStatus.INITIALIZED || this.status === MessagingStatus.DISCONNECTED || this.status === MessagingStatus.FAILED) {
            return;
        }

        try {
            const packet = this.queue.peek();
            if (packet === undefined) {
                this.checkHeartbeat();
                return;
            }
            if (packet.id === undefined || packet.id == null) {
                packet.id = this.makeId(7);
            }
            if (packet.sent) {
                const diffInMs = new Date() - packet.sentAt;
                if (diffInMs > 2000) {
                    packet.sent = false;
                    this.logger.warn(this.className, "Packet ack is not received going to resend : " + packet.toString())
                } else {
                    return;
                }
            }

            let raw = JSON.stringify(packet);
            this.logger.info(this.className, "Send Packet :" + raw);
            this.session.send(raw);
            packet.sent = true;
            packet.sentAt = new Date();
        } catch (ex) {
            this.logger.error(this.className, "Error in check", ex);
        }

    };

    checkHeartbeat() {
        if (this.status !== MessagingStatus.JOINED) return; // dont send ping in joined
        if (new Date() - this.lastHearbeatTime > 5000) {
            this.lastHearbeatTime = new Date(); // must be dismis for duplciating close function
            if (!this.lastPongPacket) {
                this.logger.info(this.className, "Heartbeat ack is not received, going to close websocket");
                this.session.onclose();
                return;
            }
            const packet = new PingRequest(this.makeId(7));
            this.session.send(JSON.stringify(packet));
            this.logger.debug(this.className, "Send Ping Request: " + packet);
            this.lastPongPacket = false;
        }
    }

    start(callId, accessToken, callback) {
        this.accessToken = accessToken;
        this.session = new WebSocket(this.environment);

        this.session.onerror = (error) => {
            this.logger.error(this.className, "websocket error : ", error);
        };

        this.session.onopen = (event) => {
            this.lastPongPacket = true;
            this.status = MessagingStatus.CONNECTED;
            this.send(new JoinRequest(callId, accessToken, 1));
            this.loginResponseListener = (response) => {
                if (response !== JoinStatus.SUCCESS) {
                    this.status = MessagingStatus.JOINED;
                    callback(response);
                } else {
                    this.status = MessagingStatus.FAILED;
                    callback(response);
                }
            };
            this.session.onclose = (event) => {
                this.onClosed();
            };
        };

        this.session.onmessage = (event) => {
            this.handleMessage(JSON.parse(event.data));
        };

        this.session.onclose = (error) => {
            this.logger.info(this.className, "websocket closed : ", error);
            callback(new JoinResponse(JoinStatus.FAILED_TO_CONNECT));
        };
    };

    send(packet) {
        packet.id = null;
        this.queue.enqueue(packet);
    };


    onClosed() {
        this.reconnect();
    };


    reconnect() {
        try {
            if (this.status === MessagingStatus.CONNECTED || this.status === MessagingStatus.JOINED) this.status = MessagingStatus.DISCONNECTED;
            if (this.status !== MessagingStatus.DISCONNECTED) return;

            if (this.reconnectTry >= 30) {
                this.logger.info(this.className, "Can't connect to server after many tryings ...");
                this.status = MessagingStatus.FAILED;
                this.call.onFinished(CallFinishedReason.MESSAGING_CONNECTION_BROKEN);
                return;
            }

            this.reconnectTry++;
            const self = this;
            this.logger.info(this.className, "Trying to connect to messaging server : #" + this.reconnectTry);
            this.start(this.call.id, this.accessToken, (response) => {
                this.logger.info(this.className, "Reconnect result :" + response);
                switch (response.result) {
                    case JoinStatus.SUCCESS: {
                        this.reconnectTry = 0;
                        break;
                    }
                    case JoinStatus.FAILED_TO_CONNECT: {
                        this.status = MessagingStatus.DISCONNECTED;
                        setTimeout(function () {
                            self.reconnect();
                        }.bind(self), 500);
                        break;
                    }
                    case JoinStatus.CALL_SESSION_FINISHED : {
                        this.queue.clear();
                        break;
                    }
                    default: {
                        this.queue.clear();
                        this.call.onFinished(CallFinishedReason.MESSAGING_CONNECTION_BROKEN);
                        this.status = MessagingStatus.FAILED;
                    }
                }
            });

        } catch (e) {

        }
    };

    handleMessage(message) {

        if (this.isNeedToLog(message)) {
            this.logger.info(this.className, "onMessage => " + JSON.stringify(message));
        }

        if (this.isNeedToAck(message)) {
            this.logger.debug(this.className, "Send Ack for => " + JSON.stringify(message));
            this.session.send(JSON.stringify(new AckRequest(message.id)));
        }

        switch (message.action) {
            case "ack": {
                this.onAck(message);
                break;
            }
            case "join.response" : {
                this.handleJoinResponse(message);
                break;
            }
            case "make_offer" : {
                this.onMakeOffer(message);
                break;
            }
            case "call.response" : {
                this.onCallResponse(message);
                break;
            }
            case "media_status" : {
                this.onMediaStatus(message);
                break;
            }
            case "call.ice_candidate" : {
                this.onIceCandidate(message);
                break;
            }
            case "answer" : {
                this.onAnswer(message);
                break;
            }
            case "bye" : {
                this.onBye(message);
                break;
            }
            case "ping" : {
                this.onPing(message);
                break;
            }
            case "pong" : {
                this.onPong(message);
                break;
            }
        }
    };

    isNeedToLog(payload) {
        const action = payload.action;
        return action !== "ack" && action !== "ping" && action !== "pong";
    }

    isNeedToAck(payload) {
        const action = payload.action;
        return action !== "ack" && action !== "ping" && action !== "pong" && payload.id !== undefined && payload.id !== null;
    };

    onPing(message) {
        const packet = new PongRequest(message.id);
        this.session.send(JSON.stringify(packet));
    };

    onPong(message) {
        this.lastPongPacket = true;
    };

    onAck(payload) {
        try {
            const id = payload.id;
            const packet = this.queue.peek();
            if (packet == null) {
                return;
            }

            if (packet.id === id) {
                this.logger.debug(this.className, "Ack packet received remove packet from queue =" + JSON.stringify(packet));
                this.queue.remove();
            } else {
                this.logger.warn(this.className, "Can't find ack packet : " + payload.id + " , must be : " + packet.toString());
            }

        } catch (e) {
            this.logger.error(this.className, "Error in handle ack request", e);
        }
    };

    onMakeOffer() {
        this.call.initMedia();
        this.call.media.makeOffer((offer) => {
            this.send(new OfferRequest(this.call.id, offer.sdp));
        });
    };

    onIceCandidate(payload) {
        this.call.media.addIceCandidate(payload);
    };

    onAnswer(payload) {
        this.call.media.setAnswer(payload.sdp);
    };

    onBye(payload) {
        this.call.status = CallStatus.FINISHED;
        if (this.call.onFinished) {
            this.call.onFinished(payload.reason);
        }

    };

    onCallResponse(payload) {
        this.call.status = payload.status;
        if (payload.status === CallStatus.FINISHED) {
            this.call.status = CallStatus.FINISHED;
            this.call.onFinished(CallFinishedReason.UNKNOWN);
        }
    };

    onMediaStatus(payload) {
        const currentStatus = {caller: this.call.callerMediaStatus, receptor: this.call.receptorMediaStatus};
        const newStatus = {
            caller: payload.caller ? MediaState.CONNECTED : MediaState.DISCONNECTED,
            receptor: payload.receptor ? MediaState.CONNECTED : MediaState.DISCONNECTED
        };

        if (currentStatus.caller !== newStatus.caller) {
            this.call.callerMediaStatus = newStatus.caller;
            const event = {
                oldState: currentStatus.caller,
                newState: newStatus.caller,
                role: 'caller'
            };
            this.logger.info(this.className, `onMediaStatus [${JSON.stringify(event)}] , `);

            this.call.onMediaStateChanged(event);
        } else if (currentStatus.receptor !== newStatus.receptor) {
            this.call.receptorMediaStatus = newStatus.receptor;
            const event = {
                oldState: currentStatus.receptor,
                newState: newStatus.receptor,
                role: 'receptor'
            };
            this.logger.info(this.className, "onMediaStatus [" + JSON.stringify(event) + "]");
            this.call.onMediaStateChanged(event);
        } else {
            this.logger.warn(this.className, `onMediaStatus => is not belong to caller or receptor !!! , ${JSON.stringify(currentStatus)} => ${JSON.stringify(newStatus)} `);
        }
    };

    handleJoinResponse(payload) {
        if (this.loginResponseListener) {
            this.loginResponseListener(payload);
        }
    };

    makeId(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

    get status() {
        return this._status;
    }

    set status(status) {
        if (this._status === status) return;
        if (this.onStatusChanged != null) {
            this.logger.info("StateChangedListener called => old : " + this.status + " , new : " + status);
            this.onStatusChanged(this._status, status);
        }
        this._status = status;
    };


    close(callback) {
        if (!this.queue.isEmpty()) {
            this.logger.warn(this.className, "Queue is not empty , there is : " + this.queue.toString());
        }

        if (!this.queue.isEmpty() && this.closeTry < 20) {
            return setTimeout(() => {
                this.closeTry++;
                this.close(callback);
            }, 1000);
        }

        if (!this.queue.isEmpty()) {
            this.logger.error(this.className, "Queue is killed with some messages : " + this.queue.toString());
            this.queue.clear();
        }

        this.status = MessagingStatus.TERMINATED;
        this.reconnectTry = 0; // we must reset counter after trying for next time in call

        try {
            if (this.session != null) {
                this.session.close();
                this.session = null;
            }
            callback(true);
        } catch (ex) {
            this.logger.error(this.className, "Error in close WebSocket", ex);
            callback(false);
        }
    };

}


class Call {

    constructor(id, logger, localStream, remoteElement, environment) {
        this.className = "call";
        this.id = id;
        this._status = CallStatus.NEW;

        this.logger = logger;

        this.messaging = new KavenegarMessaging(environment, this, logger);
        this.media = null;

        this.callerMediaStatus = MediaState.DISCONNECTED;
        this.receptorMediaStatus = MediaState.DISCONNECTED;
        this.duration = 0;
        this.lastComputedDuration = 0;

        this.stream = localStream;
        this.element = remoteElement;
        this.features = [];

        this.onStatusChanged = () => {
        };

        this.onFinished = () => {
        };

        this.onMediaStateChanged = () => {
        };

        this.onMessagingStateChanged = () => {
        };
    }


    initMedia() {

        if (this.media != null) {
            this.media.dispose();
            this.media = null;
        }

        this.media = new KavenegarMedia(this.logger);

        this.media.onIceGatheringStateChanged = (state) => {
            this.messaging.send(new EventRequest(this.id, "CLIENT_ICE_GATHERING_STATE", {"state": state.toString().toLowerCase()}));
        };
        this.media.onIceConnectionStateChanged = (state) => {
            this.messaging.send(new EventRequest(this.id, "CLIENT_ICE_CONNECTION_STATE", {"state": state.toString().toLowerCase()}));
        };

        this.media.onSignalingStateChanged = (state) => {
            this.messaging.send(new EventRequest(this.id, "CLIENT_SIGNALING_STATE", {"state": state.toString().toLowerCase()}));
        };

        this.media.onPeerConnectionStateChanged = (state) => {
            this.messaging.send(new EventRequest(this.id, "CLIENT_PEER_CONNECTION_STATE", {"state": state.toString().toLowerCase()}));
        };

        this.media.start(this.stream, this.element)
    };


    hangup(reason) {
        if (reason === undefined) reason = "hangup";
        if (this.status === CallStatus.FINISHED || this.status === CallStatus.FLUSHED) {
            throw new Error("Call already finished, " + this.toString());
        }
        this.messaging.send(new ByeRequest(this.id, reason));
        this.status = CallStatus.FINISHED;
        this.onFinished(reason);
    };

    accept() {
        if (this.direction === CallDirection.OUTBOUND) {
            throw new Error("You can't accept an outbound call, " + this.toString());
        }

        this.messaging.send(new CallResponse(this.id, CallStatus.ACCEPTED));
        this.status = CallStatus.ACCEPTED;
    };

    ringing() {
        if (this.status !== CallStatus.NEW && this.status !== CallStatus.TRYING) {
            throw new Error("Only call this method on trying state, " + this.toString());
        }
        this.messaging.send(new CallResponse(this.id, CallStatus.RINGING));
        this.status = CallStatus.RINGING;
    };

    reject() {
        if (this.status !== CallStatus.RINGING || this.direction === CallDirection.OUTBOUND) {
            throw new Error("Only call this method on ringing state or must be have inbound call ," + this.toString());
        }
        this.messaging.send(new ByeRequest(this.id, CallFinishedReason.REJECTED));
        this.onFinished(CallFinishedReason.REJECTED);
    };


    get status() {
        return this._status;
    }

    set status(status) {

        if (this.status !== status && this.onStatusChanged != null) {
            this.onStatusChanged(status);
        }

        if (this.startedAt != null && status === CallStatus.CONVERSATION) {
            this.startedAt = new Date();
        }

        if (this.finishedAt != null && status === CallStatus.FINISHED) {
            this.finishedAt = new Date();
        }

        this.logger.info(this.className, `Call status is changed from ${this.status} => ${status}`);
        this._status = status;
    };

    computeDuration() {
        if (this.lastComputedDuration !== 0 && this.status === CallStatus.CONVERSATION) {
            const diff = Math.round(Date.now() - this.lastComputedDuration);
            this.duration += diff;
        }
        this.lastComputedDuration = Date.now();
    };

    run() {
        this.messaging.check();
        this.computeDuration();
        this.gatherStats();
        this.features.forEach(feature => feature.run(this));
    };

    gatherStats() {

    };

    dispose() {
        this.messaging.close(() => {
            if (this.media !== null) {
                this.media.dispose();
                this.media = null;
            }
            if (this.logger != null && this.logger.className === "RemoteLogger") {
                this.logger.dispose();
            }
            this.status = CallStatus.FLUSHED;
        });
    };


    toString() {
        return "#" + this.id + " , status=" + (this.status == null ? "null" : this.status.toString()) + ", direction=" + this.direction.toString();
    }
}

class MetricFeature {

    constructor(payload) {
        this.currentRequest = null;
        this.gatheredCount = 0;
        this.lastGatheredMetrics = Date.now();
        this.lastMetrics = {};
        this.interval = payload["interval"];
    }

    run(call) {
        if (call.status !== CallStatus.CONVERSATION || call.media == null) return;
        const diff = Date.now() - this.lastGatheredMetrics;
        if (diff < 1000) return;

        call.media.stats.then(stats => {

            this.gatheredCount++;

            if (this.currentRequest == null) {
                this.currentRequest = new MetricsRequest(call.id, {});
                this.gatheredCount = 0;
            }

            var metrics = {};
            metrics[StatMetric.AUDIO_INBOUD_BYTES_RECEIVED] = stats.audioInbound.bytesReceived;
            metrics[StatMetric.AUDIO_INBOUD_JITTER] = stats.audioInbound.jitter;
            metrics[StatMetric.AUDIO_INBOUD_PACKETS_LOST] = stats.audioInbound.packetsLost;
            metrics[StatMetric.AUDIO_INBOUND_CODEC] = stats.audioInbound.codec;
            metrics[StatMetric.AUDIO_OUTBOUND_BYTES_SENT] = stats.audioOutbound.bytesSent;
            metrics[StatMetric.AUDIO_OUTBOUND_PACKETS_SENT] = stats.audioOutbound.packetsSent;
            metrics[StatMetric.AUDIO_OUTBOUND_CODEC] = stats.audioOutbound.codec;


            for (var metric in metrics) {
                var newValue = metrics[metric];
                var oldValue = this.lastMetrics[metric];
                if (oldValue == null || newValue != oldValue) {
                    if (this.currentRequest.values[metric] == null) this.currentRequest.values[metric] = [];
                    this.currentRequest.values[metric].push({at: stats.timestamp, value: newValue});
                    this.lastMetrics[metric] = newValue;
                }
            }

            if (this.gatheredCount >= this.interval) {
                call.messaging.send(this.currentRequest);
                this.currentRequest = null;
            }

        }).catch(error => {
            call.logger.error("MetricFeature", "Error is gatherStats", error);
        });

        this.lastGatheredMetrics = Date.now();
    }
}

class Logger {

    constructor(level) {
        this.className = "DefaultLogger";
        this.level = level;
    }

    isLoggable(level) {
        return this.level <= level;
    }

    log(level, tag, message, throwable) {
        if (this.isLoggable(level)) {
            const now = new Date();
            let formattedDate = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds();
            if (throwable !== undefined) throwable = JSON.stringify(throwable);
            if (throwable === undefined) throwable = "";
            const levelName = LogLevel.toString(level).toString().toLowerCase();
            console[levelName](`[${formattedDate}] [${levelName}] [${tag}] [${message}] ${throwable}`)
        }
    }

    debug(tag, message, throwable) {
        this.log(LogLevel.DEBUG, tag, message, throwable);
    }

    verbose(tag, message, throwable) {
        this.log(LogLevel.VERBOSE, tag, message, throwable);
    }

    info(tag, message, throwable) {
        this.log(LogLevel.INFO, tag, message, throwable);
    }

    warn(tag, message, throwable) {
        this.log(LogLevel.WARN, tag, message, throwable);
    }

    error(tag, message, throwable) {
        this.log(LogLevel.ERROR, tag, message, throwable);
    }
}

class RemoteLogger extends Logger {

    constructor(level, callId, accessToken, environment) {
        super(level);
        this.className = "RemoteLogger";
        this.callId = callId;
        this.accessToken = accessToken;
        this.environment = environment;
        this.queue = new Queue();

        if (environment == null) environment = Environment.PRODUCTION;

        switch (environment) {
            case Environment.DEVELOPMENT:
                this.url = "ws://127.0.0.1:8080/logger/" + callId + "/" + accessToken;
                break;
            case Environment.TEST:
                this.url = "wss://messaging.dev.kavenegar.io/logger/" + callId + "/" + accessToken;
                break;
            case Environment.PRODUCTION:
                this.url = "wss://messaging.kavenegar.io/logger/" + callId + "/" + accessToken;
                break;
        }

        this.status = RemoteLoggerConnectionStatus.NEW;
        this.intervalId = setInterval(this.run.bind(this), 2000);
    }


    connect() {
        this.websocket = new WebSocket(this.url);
        this.status = RemoteLoggerConnectionStatus.TRYING;

        this.websocket.onerror = (error) => {
        };

        this.websocket.onopen = (event) => {
            this.status = RemoteLoggerConnectionStatus.CONNECTED;
        };

        this.websocket.onmessage = (event) => {
        };

        this.websocket.onclose = (error) => {
            if (this.status !== RemoteLoggerConnectionStatus.FINISHED) {
                this.status = RemoteLoggerConnectionStatus.CLOSED;
            }
        };
    }

    run() {
        if (this.queue.isEmpty()) return;

        if (this.status === RemoteLoggerConnectionStatus.FINISHED) {
            this.dispose();
            return;
        }
        if (this.status === RemoteLoggerConnectionStatus.CLOSED || this.status === RemoteLoggerConnectionStatus.NEW) {
            this.connect();
            return;
        }

        let packets = [];
        for (let i = 0; i < this.queue.getLength(); i++) {
            packets.push(this.queue.dequeue());
        }

        try {
            this.websocket.send(JSON.stringify(packets));
        } catch (e) {
            this.queue.enqueue(packets);
        }

    }

    dispose() {
        if (this.intervalId != null) {
            if (!this.queue.isEmpty()) {
                console.error("Logger is doing to dispose with data ", this.queue.toString());
            }
            clearInterval(this.intervalId);
            this.websocket.close();
            this.intervalId = null;
            this.status = RemoteLoggerConnectionStatus.FINISHED;
        }
    }

    isLoggable(level) {
        return this.level <= level;
    }

    log(level, tag, message, throwable) {
        if (this.isLoggable(level)) {
            const now = new Date();
            let formattedDate = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds();
            if (throwable !== undefined) throwable = JSON.stringify(throwable);
            if (throwable === undefined) throwable = "";
            const levelName = LogLevel.toString(level).toString().toLowerCase();
            this.queue.enqueue(`[${formattedDate}] [${levelName}] [${tag}] [${message}] ${throwable}`);
        }
    }

    debug(tag, message, throwable) {
        this.log(LogLevel.DEBUG, tag, message, throwable);
    }

    verbose(tag, message, throwable) {
        this.log(LogLevel.VERBOSE, tag, message, throwable);
    }

    info(tag, message, throwable) {
        this.log(LogLevel.INFO, tag, message, throwable);
    }

    warn(tag, message, throwable) {
        this.log(LogLevel.WARN, tag, message, throwable);
    }

    error(tag, message, throwable) {
        this.log(LogLevel.ERROR, tag, message, throwable);
    }

}

const RemoteLoggerConnectionStatus = {
    CONNECTED: 'connected',
    FINISHED: 'finished',
    CLOSED: 'closed',
    TRYING: 'trying',
    NEW: 'new'
};


export {
    RemoteLoggerConnectionStatus,
    Environment,
    KavenegarCall,
    KavenegarMedia,
    KavenegarMessaging,
    CallDirection,
    CallFinishedReason,
    JoinStatus,
    MessagingStatus,
    MediaState,
    CallStatus,
    LogLevel,
    Logger,
    RemoteLogger
};