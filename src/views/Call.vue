<template>
    <div class="home">
        <Toolbar title="تماس" :right-button="backButton"/>
        <div id="call-wrapper" class="wrapper">
            <div class="container">
                <audio id="audio2" autoplay controls style="display: none"></audio>

                <div id="call-panel" v-if="call" style="padding:20px;">
                    <div class="">
                        <div class="">
                            <div>
                                <label class="text-muted">وضعیت تماس</label>
                                <p>
                                    <b-tag type="is-info" style="text-transform: uppercase;">{{ call.status }}</b-tag>
                                </p>
                                <label class="text-muted">شناسه تماس</label>
                                <p class="ltr">{{ call.id }}</p>

                                <label class="text-muted">مدت زمان مکالمه</label>
                                <p class="ltr">{{ parseInt(call.duration / 1000) }}</p>

                                <label class="text-muted">تماس گیرنده</label>
                                <p class="ltr">{{ call.caller.username }} => {{ call.receptor.username }} </p>

                                <div class="columns">
                                    <div class="column">
                                        <label class="text-muted">وضعیت</label>
                                        <p class="ltr">
                                            <b-field grouped group-multiline>
                                                <div class="control">
                                                    <b-taglist attached>
                                                        <b-tag size="is-medium" type="is-dark">Caller Media</b-tag>
                                                        <b-tag size="is-medium" type="is-info">
                                                            {{ call.callerMediaStatus.toUpperCase() }}
                                                        </b-tag>
                                                    </b-taglist>
                                                </div>
                                                <div class="control">
                                                    <b-taglist attached>
                                                        <b-tag size="is-medium" type="is-dark">Receptor Media</b-tag>
                                                        <b-tag size="is-medium" type="is-info">
                                                            {{ call.receptorMediaStatus.toUpperCase() }}
                                                        </b-tag>
                                                    </b-taglist>
                                                </div>
                                                <div class="control">
                                                    <b-taglist attached>
                                                        <b-tag size="is-medium" type="is-dark">Messaging</b-tag>
                                                        <b-tag size="is-medium" type="is-info">
                                                            {{ call.messaging.status.toUpperCase() }}
                                                        </b-tag>
                                                    </b-taglist>
                                                </div>
                                            </b-field>

                                        </p>
                                    </div>
                                </div>

                                <div class="columns">
                                    <div class="column">
                                        <label class="text-muted">وضعیت WebRTC</label>
                                        <p class="ltr">

                                            <b-field grouped group-multiline v-if="call.media && call.media.status">
                                                <div class="control">
                                                    <b-taglist attached>
                                                        <b-tag size="is-medium" type="is-dark">IceGathering</b-tag>
                                                        <b-tag size="is-medium" type="is-info">
                                                            {{ call.media.status.iceGatheringState.toUpperCase() }}
                                                        </b-tag>
                                                    </b-taglist>
                                                </div>

                                                <div class="control" v-if="call.media && call.media.status">
                                                    <b-taglist attached>
                                                        <b-tag size="is-medium" type="is-dark">IceConnection</b-tag>
                                                        <b-tag size="is-medium" type="is-info">
                                                            {{ call.media.status.iceConnectionState.toUpperCase() }}
                                                        </b-tag>
                                                    </b-taglist>
                                                </div>

                                                <div class="control" v-if="call.media && call.media.status">
                                                    <b-taglist attached>
                                                        <b-tag size="is-medium" type="is-dark">Signaling</b-tag>
                                                        <b-tag size="is-medium" type="is-info">
                                                            {{ call.media.status.signalingState.toUpperCase() }}
                                                        </b-tag>
                                                    </b-taglist>
                                                </div>

                                                <div class="control"
                                                     v-if="call.media && call.media.connection.getSenders()[0]">
                                                    <b-taglist attached>
                                                        <b-tag size="is-medium" type="is-dark">Sender</b-tag>
                                                        <b-tag size="is-medium" type="is-info">
                                                            {{ call.media.connection.getSenders()[0].track.label }} -
                                                            {{ call.media.connection.getSenders()[0].track.readyState }}
                                                        </b-tag>
                                                    </b-taglist>
                                                </div>

                                            </b-field>
                                        </p>
                                    </div>
                                </div>
                                <label class="text-muted">ورودی صدا</label>

                                <b-tabs type="is-toggle" expanded style="direction: ltr" @input="selectInputDevice">
                                    <b-tab-item v-for="option in inputDevices" :label="option.label"
                                                :value="option.deviceId"
                                                :key="option.deviceId"
                                                @click="selectInputDevice(option.deviceId)"></b-tab-item>
                                </b-tabs>


                            </div>
                        </div>
                        <div style="margin-top:20px"
                             v-if="(call.status === 'ringing' || call.status === 'trying')  && call.direction === 'inbound'"
                             class="columns is-mobile">
                            <div class="column">
                                <b-button type="is-success" expanded @click="acceptCall">قبول تماس</b-button>
                            </div>
                            <div class="column">
                                <b-button type="is-danger" expanded @click="rejectCall">رد تماس</b-button>
                            </div>
                        </div>
                        <div class="" v-else style="padding:20px 0;">
                            <b-button expanded type="is-danger" @click="hangupCall">قطع تماس</b-button>
                        </div>

                    </div>
                </div>

            </div>
        </div>


    </div>
</template>

<script>
import httpClient from '../api'
import router from "../router";
import Toolbar from "../components/Toolbar";
import {ToastProgrammatic as Toast} from 'buefy';
import {
    KavenegarCall,
    Environment,
    LogLevel,
    RemoteLogger,
    CallDirection,
    CallFinishedReason,
    CallStatus,
    Logger
} from '../kavenegar-voice';
//kavenegarCall: new KavenegarCall("ws://127.0.0.1:8080/v1"),
export default {
    name: 'Call',
    components: {Toolbar},
    data() {
        return {
            kavenegarCall: new KavenegarCall(Environment.PRODUCTION),
            call: null,
            receptor: "",
            callId: this.$route.params.id,
            accessToken: this.$route.params.accessToken,
            backButton: {
                icon: 'arrow-right',
                click: this.handleBack
            },
            inputDevices: null,
            outputDevices: null,
            selectedInputDevice: null,
            selectedOutputDevice: null,
            duration: 0
        };
    },
    created() {
        this.joinCall(this.callId, this.accessToken);
        navigator.mediaDevices.ondevicechange = (devices) => {
            this.gotDevices();
        };

    },
    methods: {
        gotDevices() {
            navigator.mediaDevices.enumerateDevices().then(deviceInfos => {
                this.inputDevices = deviceInfos.filter(e => e.kind === 'audioinput');
                this.outputDevices = deviceInfos.filter(e => e.kind === 'audiooutput');
            }).catch(error => {

            });
        },
        handleBack() {
            if (this.call) this.call.hangup();
            router.push({path: '/'});
        },
        getAuthenticatedEndpoint() {
            return JSON.parse(localStorage.getItem("AuthenticatedEndpoint"));
        },
        initCall(callId, accessToken, stream) {
            const params = {
                callId: callId,
                accessToken: accessToken,
                localStream: stream,
                remoteElement: document.getElementById("audio2"),
                logger: new Logger(LogLevel.INFO, callId, accessToken)
            };

            this.kavenegarCall.initCall(params, (joinResult, call) => {
                if (call == null) {
                    Toast.open('اتصال به تماس با خطا مواجه شد :' + joinResult);
                    return;
                }

                if (call.direction === CallDirection.INBOUND) {
                    call.ringing();
                }

                this.call = call;

                call.onFinished = (reason) => {
                    call.dispose();
                    if (reason !== CallFinishedReason.HANGUP) {
                        Toast.open('تماس به پایان رسید, دلیل قطع تماس :' + reason);
                    }
                    router.push({path: '/'});
                };
                call.onMediaStateChanged = (event) => {

                };

                call.onMessagingStateChanged = (event) => {

                };

                call.onStatusChanged = (status) => {

                };


            });
        },
        joinCall(id, accessToken) {
            this.getUserMedia(stream => {
                this.initCall(id, accessToken, stream)
            });
        },
        acceptCall() {
            this.call.accept();
        },
        rejectCall() {
            this.call.reject();
        },
        hangupCall() {
            this.call.hangup();
        },
        selectInputDevice(value) {
            this.selectedInputDevice = value;
            this.getUserMedia(stream => {
                this.call.media.connection.getSenders()[0].replaceTrack(stream.getAudioTracks()[0]).catch(error => {
                    Toast.open('خطا در تعویض ورودی صدا' + JSON.stringify(error.message));
                });

            })
        },
        getUserMedia(callback) {
            var constraints = {
                video: false,
                audio: {
                    noiseSuppression: true, echoCancellation: true
                }
            };

            if (this.selectedInputDevice) {
                constraints.audio.deviceId = this.selectedInputDevice;
            }

            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                stream.getTracks()[0].onended = (e) => {
                    Toast.open('Input Audio Device Disconnected');
                    this.selectInputDevice(null);
                };
                callback(stream);
            }).catch((error) => {
                Toast.open("getUserMediaError :" + error);
            });
        }
    }
}
</script>
<style>

#call-wrapper label {
    display: block;
    font-weight: bold;
    margin-top: 15px;
    font-size: 20px;
}


#call-wrapper #call-panel .call-status {
    float: left !important;
    font-weight: normal;
    text-transform: uppercase;
    padding: 5px 7px;
}


#call-wrapper #call-panel p.ltr {
    background: #f1f1f1;
    padding: 10px;
    border-radius: 3px;
    margin-top: 10px;
}

</style>