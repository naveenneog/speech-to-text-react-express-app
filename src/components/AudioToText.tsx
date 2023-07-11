/* eslint-disable react-hooks/exhaustive-deps */
import { default as React, useEffect, useState, useRef } from "react";
import { Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import styles from "./AudioToText.module.css";
import * as io from "socket.io-client";
import { ActionTypes } from "src/state/action-creators";
const sampleRate = 16000;
const workletPath = "../assets/recorderWorkletProcessor.js";

// Get the audio media stream
const getMediaStream = () =>
  navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: "default",
      sampleRate: sampleRate,
      sampleSize: 16,
      channelCount: 1,
    },
    video: false,
  });

// types for the Word recognized
interface WordRecognized {
  isFinal: boolean;
  text: string;
}

const AudioToText: React.FC = () => {
  const [connection, setConnection] = useState<io.Socket>();
  const [currentRecognition, setCurrentRecognition] = useState<string>();
  const [recognitionHistory, setRecognitionHistory] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recorder, setRecorder] = useState<any>();
  const processorRef = useRef<any>();
  const audioContextRef = useRef<any>();
  const audioInputRef = useRef<any>();

  //Method to handle the transcripted text
  const speechRecognized = (data: WordRecognized) => {
    if (data.isFinal) {
      setCurrentRecognition("...");
      setRecognitionHistory((old) => [ ...old, data.text]);
    } else setCurrentRecognition(data.text + "...");
  };

  //If the recognition history changes just log the history
  useEffect(() => {
    console.log("\n\nrecognitionHistory", recognitionHistory);
  }, [recognitionHistory]);

  //Socket.io-client conection code to connect to the Socket.io client in the backend
  const connect = () => {
    connection?.disconnect();
    const socket = io.connect("http://localhost:8081");
    
    socket.on(ActionTypes.SOCKET_CONNECT, () => {
      console.log("connected", socket.id);
      setConnection(socket);
    });

    socket.emit(ActionTypes.SEND_MESSAGE, "hello world");

    socket.emit(ActionTypes.START_GOOGLE_CLOUD_STREAM);

    socket.on(ActionTypes.RECEIVE_MESSAGE, (data) => {
      console.log("received message", data);
    });

    socket.on(ActionTypes.RECEIVE_AUDIO_TEXT, (data) => {
      speechRecognized(data);
      console.log("received audio text", data);
    });

    socket.on(ActionTypes.SOCKET_DISCONNECT, () => {
      console.log("disconnected", socket.id);
    });
  };

  const disconnect = () => {
    if (!connection) return;
    connection?.emit(ActionTypes.END_GOOGLE_CLOUD_STREAM);
    connection?.disconnect();
    processorRef.current?.disconnect();
    audioInputRef.current?.disconnect();
    audioContextRef.current?.close();
    setConnection(undefined);
    setRecorder(undefined);
    setIsRecording(false);
  };

  useEffect(() => {
    (async () => {
      if (connection) {
        if (isRecording) {
          return;
        }

        const stream = await getMediaStream();

        audioContextRef.current = new window.AudioContext();

        await audioContextRef.current.audioWorklet.addModule(
          workletPath
        );

        audioContextRef.current.resume();

        audioInputRef.current =
          audioContextRef.current.createMediaStreamSource(stream);

        processorRef.current = new AudioWorkletNode(
          audioContextRef.current,
          "recorder.worklet"
        );

        processorRef.current.connect(audioContextRef.current.destination);
        audioContextRef.current.resume();

        audioInputRef.current.connect(processorRef.current);

        processorRef.current.port.onmessage = (event: any) => {
          const audioData = event.data;
          connection.emit(ActionTypes.SEND_AUDIO_DATA, { audio: audioData });
        };
        setIsRecording(true);
      } else {
        console.error("No connection");
      }
    })();
    return () => {
      if (isRecording) {
        processorRef.current?.disconnect();
        audioInputRef.current?.disconnect();
        console.log('Audio context ' + audioContextRef.current.state);
        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current
            ?.close()
            .then(() => {
              //Disable the stop button
            })
            .catch(() => {
              console.log('Error in closing the connection');
            });
        }
      }
    };
  }, [connection, isRecording, recorder]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <React.Fragment>
      <Container className="py-5 text-center">
        <Container fluid className="py-5 bg-primary text-light text-center ">
          <Container>
            <div className={styles.buttonLayout}>
            <Button
              className={isRecording ? styles.btnDanger : styles.btn}
              onClick={connect}
              disabled={isRecording}
            >
              Start
            </Button>
            <Button
              className={styles.btn}
              onClick={disconnect}
              disabled={!isRecording}
            >
              Stop
            </Button>
            </div>
          </Container>
        </Container>
        <Container className="py-5 text-center">
          {recognitionHistory.map((tx, idx) => (
            <p key={idx}>{tx}</p>
          ))}
          <p>{currentRecognition}</p>
        </Container>
      </Container>
    </React.Fragment>
  );
};

export default AudioToText;
